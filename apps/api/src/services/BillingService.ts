import { User } from '../models/User';
import { Invoice } from '../models/Invoice';
import { Subscription } from '../models/Subscription';
import { Payment } from '../models/Payment';
import { AccountStatus } from '../interfaces/IUser';
import { InvoiceStatus } from '../interfaces/IInvoice';
import { SubscriptionStatus } from '../interfaces/ISubscription';
import { notificationService } from './NotificationService';
import { invoiceService } from './InvoiceService';

/**
 * Servicio de gestión de facturación y suspensión de cuentas
 */
class BillingService {
  private readonly GRACE_PERIOD_DAYS = 3; // Días de gracia antes de suspender
  private readonly SUSPENSION_DAYS = 7; // Días después del vencimiento para suspender
  private readonly BLOCK_DAYS = 30; // Días después del vencimiento para bloquear

  /**
   * Cambia la fecha de facturación de un usuario
   */
  async changeBillingDate(
    userId: string,
    newBillingDay: number
  ): Promise<any> {
    if (newBillingDay < 1 || newBillingDay > 31) {
      throw new Error('El día de facturación debe estar entre 1 y 31');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar que no tenga deuda pendiente
    if (user.pendingBalance && user.pendingBalance > 0) {
      throw new Error('Debe saldar su deuda pendiente antes de cambiar la fecha de facturación');
    }

    // Actualizar fecha de facturación
    user.customBillingDate = newBillingDay;
    await user.save();

    // Actualizar suscripciones activas
    const activeSubscriptions = await Subscription.find({
      userId: user._id,
      status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL] },
    });

    for (const subscription of activeSubscriptions) {
      // Calcular nueva fecha de fin basada en el día de facturación
      const nextBillingDate = this.calculateNextBillingDate(newBillingDay);
      subscription.endDate = nextBillingDate;
      await subscription.save();
    }

    // Enviar notificación
    await notificationService.sendBillingDateChanged(
      user.auth.email,
      user.name,
      newBillingDay,
      activeSubscriptions.length > 0 ? activeSubscriptions[0].endDate : undefined
    );

    return {
      user,
      updatedSubscriptions: activeSubscriptions.length,
      nextBillingDate: activeSubscriptions.length > 0 ? activeSubscriptions[0].endDate : null,
    };
  }

  /**
   * Calcula la próxima fecha de facturación basada en el día del mes
   */
  private calculateNextBillingDate(billingDay: number): Date {
    const now = new Date();
    const nextDate = new Date(now.getFullYear(), now.getMonth(), billingDay);

    // Si la fecha ya pasó este mes, usar el siguiente mes
    if (nextDate <= now) {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }

    // Ajustar si el día no existe en el mes (ej: 31 en febrero)
    if (nextDate.getDate() !== billingDay) {
      nextDate.setDate(0); // Último día del mes anterior
    }

    return nextDate;
  }

  /**
   * Procesa el pago de una factura pendiente
   */
  async payPendingInvoice(
    userId: string,
    paymentId: string
  ): Promise<any> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error('Pago no encontrado');
    }

    // Buscar facturas pendientes
    const pendingInvoices = await Invoice.find({
      userId: user._id,
      status: { $in: [InvoiceStatus.PENDING, InvoiceStatus.OVERDUE] },
    }).sort({ dueDate: 1 });

    if (pendingInvoices.length === 0) {
      throw new Error('No hay facturas pendientes');
    }

    let remainingAmount = payment.amount;
    const paidInvoices = [];

    // Aplicar pago a facturas pendientes
    for (const invoice of pendingInvoices) {
      if (remainingAmount <= 0) break;

      const amountToPay = Math.min(remainingAmount, invoice.amountDue);

      invoice.amountPaid += amountToPay;
      invoice.amountDue -= amountToPay;

      if (invoice.amountDue === 0) {
        invoice.status = InvoiceStatus.PAID;
        invoice.paidDate = new Date();
        invoice.paymentId = payment._id;
      }

      await invoice.save();
      paidInvoices.push(invoice);
      remainingAmount -= amountToPay;
    }

    // Actualizar saldo pendiente del usuario
    user.pendingBalance = Math.max(0, (user.pendingBalance || 0) - payment.amount);

    // Si pagó toda la deuda, reactivar cuenta
    if (user.pendingBalance === 0) {
      await this.reactivateAccount(userId);
    }

    await user.save();

    return {
      paidInvoices,
      remainingBalance: user.pendingBalance,
      accountStatus: user.accountStatus,
    };
  }

  /**
   * Verifica y procesa facturas vencidas
   */
  async checkOverdueInvoices(): Promise<void> {
    const now = new Date();

    // Actualizar estado de facturas vencidas
    await invoiceService.checkOverdueInvoices();

    // Buscar usuarios con facturas vencidas
    const overdueInvoices = await Invoice.find({
      status: InvoiceStatus.OVERDUE,
    }).populate('userId');

    const userIdsToProcess = new Set<string>();

    for (const invoice of overdueInvoices) {
      const user = invoice.userId as any;
      userIdsToProcess.add(user._id.toString());
    }

    // Procesar cada usuario
    for (const userId of userIdsToProcess) {
      await this.processOverdueUser(userId);
    }
  }

  /**
   * Procesa un usuario con pagos vencidos
   */
  private async processOverdueUser(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) return;

    const overdueInvoices = await Invoice.find({
      userId: user._id,
      status: InvoiceStatus.OVERDUE,
    }).sort({ dueDate: 1 });

    if (overdueInvoices.length === 0) return;

    const oldestInvoice = overdueInvoices[0];
    const daysSinceOverdue = this.getDaysSince(oldestInvoice.dueDate);

    // Calcular saldo pendiente total
    const totalPending = overdueInvoices.reduce(
      (sum, inv) => sum + inv.amountDue,
      0
    );

    user.pendingBalance = totalPending;
    user.paymentDueDate = oldestInvoice.dueDate;

    // Suspender cuenta según días de retraso
    if (daysSinceOverdue >= this.BLOCK_DAYS) {
      // Bloquear cuenta permanentemente
      if (user.accountStatus !== AccountStatus.BLOCKED) {
        await this.blockAccount(userId, 'Pago vencido hace más de 30 días');
      }
    } else if (daysSinceOverdue >= this.SUSPENSION_DAYS) {
      // Suspender cuenta temporalmente
      if (user.accountStatus !== AccountStatus.SUSPENDED &&
          user.accountStatus !== AccountStatus.BLOCKED) {
        await this.suspendAccount(userId, 'Pago vencido hace más de 7 días');
      }
    } else if (daysSinceOverdue >= this.GRACE_PERIOD_DAYS) {
      // Marcar como pendiente de pago
      if (user.accountStatus === AccountStatus.ACTIVE) {
        user.accountStatus = AccountStatus.PENDING_PAYMENT;
        await user.save();

        // Enviar advertencia
        await notificationService.sendPaymentWarning(
          user.auth.email,
          user.name,
          totalPending,
          oldestInvoice.dueDate,
          this.SUSPENSION_DAYS - daysSinceOverdue
        );
      }
    }

    await user.save();
  }

  /**
   * Suspende una cuenta de usuario
   */
  async suspendAccount(
    userId: string,
    reason: string
  ): Promise<any> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    user.accountStatus = AccountStatus.SUSPENDED;
    user.suspendedAt = new Date();
    user.suspensionReason = reason;
    await user.save();

    // Cancelar suscripciones activas
    await Subscription.updateMany(
      {
        userId: user._id,
        status: SubscriptionStatus.ACTIVE,
      },
      {
        $set: { status: SubscriptionStatus.CANCELED },
      }
    );

    // Enviar notificación
    await notificationService.sendAccountSuspended(
      user.auth.email,
      user.name,
      reason,
      user.pendingBalance || 0
    );

    return user;
  }

  /**
   * Bloquea una cuenta de usuario
   */
  async blockAccount(
    userId: string,
    reason: string
  ): Promise<any> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    user.accountStatus = AccountStatus.BLOCKED;
    user.suspendedAt = new Date();
    user.suspensionReason = reason;
    await user.save();

    // Cancelar todas las suscripciones
    await Subscription.updateMany(
      {
        userId: user._id,
        status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL] },
      },
      {
        $set: { status: SubscriptionStatus.CANCELED },
      }
    );

    // Enviar notificación
    await notificationService.sendAccountBlocked(
      user.auth.email,
      user.name,
      reason,
      user.pendingBalance || 0
    );

    return user;
  }

  /**
   * Reactiva una cuenta de usuario
   */
  async reactivateAccount(userId: string): Promise<any> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar que no tenga deuda pendiente
    if (user.pendingBalance && user.pendingBalance > 0) {
      throw new Error('No se puede reactivar la cuenta con deuda pendiente');
    }

    const previousStatus = user.accountStatus;

    user.accountStatus = AccountStatus.ACTIVE;
    user.suspendedAt = undefined;
    user.suspensionReason = undefined;
    user.paymentDueDate = undefined;
    await user.save();

    // Enviar notificación solo si estaba suspendido o bloqueado
    if (previousStatus === AccountStatus.SUSPENDED ||
        previousStatus === AccountStatus.BLOCKED) {
      await notificationService.sendAccountReactivated(
        user.auth.email,
        user.name
      );
    }

    return user;
  }

  /**
   * Obtiene el estado de facturación de un usuario
   */
  async getBillingStatus(userId: string): Promise<any> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const [pendingInvoices, overdueInvoices, activeSubscriptions] = await Promise.all([
      Invoice.find({
        userId: user._id,
        status: InvoiceStatus.PENDING,
      }),
      Invoice.find({
        userId: user._id,
        status: InvoiceStatus.OVERDUE,
      }),
      Subscription.find({
        userId: user._id,
        status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL] },
      }),
    ]);

    return {
      accountStatus: user.accountStatus,
      pendingBalance: user.pendingBalance || 0,
      paymentDueDate: user.paymentDueDate,
      customBillingDate: user.customBillingDate,
      suspendedAt: user.suspendedAt,
      suspensionReason: user.suspensionReason,
      pendingInvoices: pendingInvoices.length,
      overdueInvoices: overdueInvoices.length,
      activeSubscriptions: activeSubscriptions.length,
      invoices: {
        pending: pendingInvoices,
        overdue: overdueInvoices,
      },
    };
  }

  /**
   * Calcula días desde una fecha
   */
  private getDaysSince(date: Date): number {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}

export const billingService = new BillingService();
