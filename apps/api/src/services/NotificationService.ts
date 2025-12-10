import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { IVisit } from '../interfaces/IVisit';
import { UserService } from './UserService';
import { IUser } from '../interfaces/IUser';
import { ISubscription } from '../interfaces/ISubscription';
import { IPayment } from '../interfaces/IPayment';
import { Notification } from '../models/Notification';
import { NotificationType, INotification } from '../interfaces/INotification';
import { Types } from 'mongoose';

class NotificationService {
  public transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASSWORD,
      },
    });
  }

  async sendVisitNotification(
    toResident: string,
    toVisit: string,
    visitData: IVisit
  ): Promise<nodemailer.SentMessageInfo[]> {
    const residentData = (await UserService.findById(visitData.authorization.resident)) as IUser;

    const residentMailOptions = {
      from: `${process.env.EMAIL_FROM}`,
      sender: process.env.EMAIL_SENDER,
      replyTo: process.env.EMAIL_REPLY,
      to: toResident,
      subject: `Autorización de visitante ${visitData.visit.name}`,
      html: `
        <h1>Notificación de Autorización de Visitante</h1>
        <p>Estimado, ${residentData.name} su autorización de visita a ${
          visitData.visit.name
        } ha sido registrada<p>
        <p><strong>Visitante:</strong> ${visitData.visit.name}</p>
        <p><strong>Documento de Indentidad:</strong> ${visitData.visit.document}</p>
        <p><strong>Motivo de Visita:</strong> ${visitData.authorization.reason}</p>
        <p><strong>Fecha de autorización:</strong> ${visitData.authorization.date.toLocaleString()}</p>
        <p><strong>Fecha de expiración:</strong> ${visitData.authorization.exp.toLocaleString()}</p>
        <img style="text-align: center;" src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${
          visitData.qrId
        }" alt="QR"/>
        <p><small>Tu visitante debe utilizar este QR para registrar su entrada y salida del recinto</small><p>
        <br/><p><small>Este es un mensaje automático, no responder.</small></p>
      `,
    };

    const visitMailOptions = {
      from: `${process.env.EMAIL_FROM}`,
      sender: process.env.EMAIL_SENDER,
      replyTo: process.env.EMAIL_REPLY,
      to: toVisit,
      subject: `Autorización de visitante ${visitData.visit.name}`,
      html: `
        <h1>Notificación de Autorización de Visitante</h1>
        <p>Estimado, ${
          visitData.visit.name
        }. Usted su visita ha sido autorizada por ${residentData.name}<p>
        <p><strong>Visitante:</strong> ${visitData.visit.name}</p>
        <p><strong>Documento de Indentidad:</strong> ${visitData.visit.document}</p>
        <p><strong>Motivo de Visita:</strong> ${visitData.authorization.reason}</p>
        <p><strong>Fecha de autorización:</strong> ${visitData.authorization.date.toLocaleString()}</p>
        <p><strong>Fecha de expiración:</strong> ${visitData.authorization.exp.toLocaleString()}</p>
        <img style="text-align: center;" src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${
          visitData.qrId
        }" alt="QR"/>
        <p><small>Usted debe utilizar este QR para registrar su entrada y salida del recinto</small><p>
        <br/><p><small>Este es un mensaje automático, no responder.</small></p>
      `,
    };

    const emailInfo: nodemailer.SentMessageInfo[] = [
      await this.transporter.sendMail(residentMailOptions),
      await this.transporter.sendMail(visitMailOptions),
    ];

    return emailInfo;
  }

  /**
   * Envía notificación cuando se registra la entrada de un visitante
   */
  async sendEntryRegistrationNotification(
    toResident: string,
    toVisit: string,
    visitData: IVisit,
    guardName: string
  ): Promise<nodemailer.SentMessageInfo[]> {
    const residentData = (await UserService.findById(visitData.authorization.resident)) as IUser;

    const entryDate = visitData.registry?.entry?.date || new Date();

    const residentMailOptions = {
      from: `${process.env.EMAIL_FROM}`,
      sender: process.env.EMAIL_SENDER,
      replyTo: process.env.EMAIL_REPLY,
      to: toResident,
      subject: `Entrada registrada - Visitante ${visitData.visit.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #27ae60;">Entrada de Visitante Registrada</h1>
          <p>Estimado ${residentData.name},</p>
          <p>Le informamos que su visitante ha ingresado al recinto.</p>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #2c3e50; margin-top: 0;">Detalles de la entrada</h2>
            <p><strong>Visitante:</strong> ${visitData.visit.name}</p>
            <p><strong>Documento de Identidad:</strong> ${visitData.visit.document}</p>
            <p><strong>Motivo de Visita:</strong> ${visitData.authorization.reason}</p>
            <p><strong>Fecha y Hora de Entrada:</strong> ${entryDate.toLocaleString('es-ES', {
              dateStyle: 'full',
              timeStyle: 'short',
            })}</p>
            <p><strong>Registrado por:</strong> ${guardName}</p>
            ${visitData.registry?.entry?.note ? `<p><strong>Nota:</strong> ${visitData.registry.entry.note}</p>` : ''}
          </div>

          <p>Este es un mensaje automático para mantenerlo informado sobre las visitas a su residencia.</p>

          <p>Saludos,<br/>El equipo de SecurePass</p>

          <p style="font-size: 12px; color: #7f8c8d; margin-top: 30px;">Este es un mensaje automático, no responder.</p>
        </div>
      `,
    };

    const visitMailOptions = {
      from: `${process.env.EMAIL_FROM}`,
      sender: process.env.EMAIL_SENDER,
      replyTo: process.env.EMAIL_REPLY,
      to: toVisit,
      subject: `Bienvenido - Entrada registrada`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #27ae60;">¡Bienvenido!</h1>
          <p>Estimado ${visitData.visit.name},</p>
          <p>Su entrada al recinto ha sido registrada exitosamente.</p>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #2c3e50; margin-top: 0;">Detalles de su visita</h2>
            <p><strong>Visitante:</strong> ${visitData.visit.name}</p>
            <p><strong>Documento de Identidad:</strong> ${visitData.visit.document}</p>
            <p><strong>Residente que lo autoriza:</strong> ${residentData.name}${residentData.role === 'residente' ? ` - ${(residentData as any).apartment}` : ''}</p>
            <p><strong>Fecha y Hora de Entrada:</strong> ${entryDate.toLocaleString('es-ES', {
              dateStyle: 'full',
              timeStyle: 'short',
            })}</p>
            <p><strong>Registrado por:</strong> ${guardName}</p>
          </div>

          <p>Por favor, conserve su código QR para registrar su salida al finalizar la visita.</p>

          <p>Que tenga una excelente visita.</p>

          <p>Saludos,<br/>El equipo de SecurePass</p>

          <p style="font-size: 12px; color: #7f8c8d; margin-top: 30px;">Este es un mensaje automático, no responder.</p>
        </div>
      `,
    };

    const emailInfo: nodemailer.SentMessageInfo[] = [
      await this.transporter.sendMail(residentMailOptions),
      await this.transporter.sendMail(visitMailOptions),
    ];

    // Guardar notificación en la base de datos para el residente
    await Notification.create({
      recipient: visitData.authorization.resident,
      type: NotificationType.VISITOR_ENTRY,
      title: `Entrada registrada - Visitante ${visitData.visit.name}`,
      message: `Su visitante ${visitData.visit.name} ha ingresado al recinto. Registrado por ${guardName}.`,
      relatedVisit: visitData._id,
      metadata: {
        visitorName: visitData.visit.name,
        visitorDocument: visitData.visit.document,
        guardName: guardName,
        entryDate: entryDate,
        note: visitData.registry?.entry?.note,
      },
      isRead: false,
    });

    return emailInfo;
  }

  /**
   * Envía notificación de bienvenida al suscribirse
   */
  async sendSubscriptionWelcome(
    userEmail: string,
    userName: string,
    subscription: ISubscription
  ): Promise<nodemailer.SentMessageInfo> {
    const planNames = {
      basic: 'Básico',
      premium: 'Premium',
      enterprise: 'Empresarial',
    };

    const mailOptions = {
      from: `${process.env.EMAIL_FROM}`,
      sender: process.env.EMAIL_SENDER,
      replyTo: process.env.EMAIL_REPLY,
      to: userEmail,
      subject: '¡Bienvenido a SecurePass!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3498db;">¡Bienvenido a SecurePass!</h1>
          <p>Estimado ${userName},</p>
          <p>Gracias por suscribirte a SecurePass. Tu suscripción ha sido activada exitosamente.</p>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #2c3e50; margin-top: 0;">Detalles de tu suscripción</h2>
            <p><strong>Plan:</strong> ${planNames[subscription.plan] || subscription.plan}</p>
            <p><strong>Ciclo de facturación:</strong> ${subscription.billingCycle === 'monthly' ? 'Mensual' : 'Anual'}</p>
            <p><strong>Fecha de inicio:</strong> ${subscription.startDate.toLocaleDateString('es-ES')}</p>
            <p><strong>Próxima renovación:</strong> ${subscription.endDate.toLocaleDateString('es-ES')}</p>
            <p><strong>Monto:</strong> ${(subscription.amount / 100).toFixed(2)} ${subscription.currency}</p>
          </div>

          <p>Ahora puedes disfrutar de todas las funcionalidades de SecurePass para gestionar el acceso de visitantes en tu residencia.</p>

          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>

          <p>Saludos,<br/>El equipo de SecurePass</p>

          <p style="font-size: 12px; color: #7f8c8d; margin-top: 30px;">Este es un mensaje automático, no responder.</p>
        </div>
      `,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Envía notificación de pago exitoso
   */
  async sendPaymentSuccess(
    userEmail: string,
    userName: string,
    payment: IPayment
  ): Promise<nodemailer.SentMessageInfo> {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM}`,
      sender: process.env.EMAIL_SENDER,
      replyTo: process.env.EMAIL_REPLY,
      to: userEmail,
      subject: 'Confirmación de pago - SecurePass',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #27ae60;">Pago procesado exitosamente</h1>
          <p>Estimado ${userName},</p>
          <p>Hemos recibido tu pago correctamente. Aquí están los detalles:</p>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #2c3e50; margin-top: 0;">Detalles del pago</h2>
            <p><strong>Monto:</strong> ${(payment.amount / 100).toFixed(2)} ${payment.currency}</p>
            <p><strong>Fecha:</strong> ${payment.createdAt.toLocaleDateString('es-ES')}</p>
            <p><strong>Método de pago:</strong> ${payment.provider === 'stripe' ? 'Tarjeta de crédito' : 'PayPal'}</p>
            <p><strong>ID de transacción:</strong> ${payment.providerId}</p>
            ${payment.receiptUrl ? `<p><a href="${payment.receiptUrl}" style="color: #3498db;">Ver recibo</a></p>` : ''}
          </div>

          <p>Gracias por tu pago. Tu suscripción continuará activa.</p>

          <p>Saludos,<br/>El equipo de SecurePass</p>

          <p style="font-size: 12px; color: #7f8c8d; margin-top: 30px;">Este es un mensaje automático, no responder.</p>
        </div>
      `,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Envía notificación de pago fallido
   */
  async sendPaymentFailed(
    userEmail: string,
    userName: string,
    payment: IPayment
  ): Promise<nodemailer.SentMessageInfo> {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM}`,
      sender: process.env.EMAIL_SENDER,
      replyTo: process.env.EMAIL_REPLY,
      to: userEmail,
      subject: 'Problema con tu pago - SecurePass',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e74c3c;">Pago no procesado</h1>
          <p>Estimado ${userName},</p>
          <p>Lamentablemente, no pudimos procesar tu pago.</p>

          <div style="background-color: #fff5f5; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #e74c3c;">
            <h2 style="color: #c0392b; margin-top: 0;">Detalles del intento</h2>
            <p><strong>Monto:</strong> ${(payment.amount / 100).toFixed(2)} ${payment.currency}</p>
            <p><strong>Fecha:</strong> ${payment.createdAt.toLocaleDateString('es-ES')}</p>
            ${payment.failureReason ? `<p><strong>Razón:</strong> ${payment.failureReason}</p>` : ''}
          </div>

          <p>Por favor, verifica tu método de pago e intenta nuevamente. Si el problema persiste, contacta con tu banco o proveedor de pagos.</p>

          <p><a href="${process.env.FRONTEND_URL}/subscription" style="display: inline-block; background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Actualizar método de pago</a></p>

          <p>Saludos,<br/>El equipo de SecurePass</p>

          <p style="font-size: 12px; color: #7f8c8d; margin-top: 30px;">Este es un mensaje automático, no responder.</p>
        </div>
      `,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Envía notificación de cancelación de suscripción
   */
  async sendSubscriptionCanceled(
    userEmail: string,
    userName: string,
    subscription: ISubscription
  ): Promise<nodemailer.SentMessageInfo> {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM}`,
      sender: process.env.EMAIL_SENDER,
      replyTo: process.env.EMAIL_REPLY,
      to: userEmail,
      subject: 'Cancelación de suscripción - SecurePass',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e74c3c;">Suscripción cancelada</h1>
          <p>Estimado ${userName},</p>
          <p>Tu suscripción a SecurePass ha sido cancelada como solicitaste.</p>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Fecha de cancelación:</strong> ${subscription.canceledAt?.toLocaleDateString('es-ES')}</p>
            <p><strong>Acceso hasta:</strong> ${subscription.endDate.toLocaleDateString('es-ES')}</p>
          </div>

          <p>Seguirás teniendo acceso a SecurePass hasta el final de tu período de facturación actual.</p>

          <p>Lamentamos verte partir. Si cambias de opinión, siempre puedes reactivar tu suscripción.</p>

          <p><a href="${process.env.FRONTEND_URL}/subscription" style="display: inline-block; background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Reactivar suscripción</a></p>

          <p>Saludos,<br/>El equipo de SecurePass</p>

          <p style="font-size: 12px; color: #7f8c8d; margin-top: 30px;">Este es un mensaje automático, no responder.</p>
        </div>
      `,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Envía recordatorio de próxima renovación
   */
  async sendRenewalReminder(
    userEmail: string,
    userName: string,
    subscription: ISubscription,
    daysUntilRenewal: number
  ): Promise<nodemailer.SentMessageInfo> {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM}`,
      sender: process.env.EMAIL_SENDER,
      replyTo: process.env.EMAIL_REPLY,
      to: userEmail,
      subject: 'Próxima renovación de suscripción - SecurePass',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f39c12;">Recordatorio de renovación</h1>
          <p>Estimado ${userName},</p>
          <p>Te recordamos que tu suscripción a SecurePass se renovará en ${daysUntilRenewal} ${daysUntilRenewal === 1 ? 'día' : 'días'}.</p>

          <div style="background-color: #fff9e6; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f39c12;">
            <h2 style="color: #2c3e50; margin-top: 0;">Detalles de la renovación</h2>
            <p><strong>Fecha de renovación:</strong> ${subscription.endDate.toLocaleDateString('es-ES')}</p>
            <p><strong>Monto:</strong> ${(subscription.amount / 100).toFixed(2)} ${subscription.currency}</p>
            <p><strong>Plan:</strong> ${subscription.plan}</p>
          </div>

          <p>El cargo se realizará automáticamente con el método de pago que tienes registrado.</p>

          <p>Si deseas cambiar tu plan o método de pago, puedes hacerlo desde tu cuenta.</p>

          <p><a href="${process.env.FRONTEND_URL}/subscription" style="display: inline-block; background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Gestionar suscripción</a></p>

          <p>Saludos,<br/>El equipo de SecurePass</p>

          <p style="font-size: 12px; color: #7f8c8d; margin-top: 30px;">Este es un mensaje automático, no responder.</p>
        </div>
      `,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Envía notificación de suscripción expirada
   */
  async sendSubscriptionExpired(
    userEmail: string,
    userName: string,
    subscription: ISubscription
  ): Promise<nodemailer.SentMessageInfo> {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM}`,
      sender: process.env.EMAIL_SENDER,
      replyTo: process.env.EMAIL_REPLY,
      to: userEmail,
      subject: 'Tu suscripción ha expirado - SecurePass',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #95a5a6;">Suscripción expirada</h1>
          <p>Estimado ${userName},</p>
          <p>Tu suscripción a SecurePass ha expirado.</p>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Fecha de expiración:</strong> ${subscription.endDate.toLocaleDateString('es-ES')}</p>
          </div>

          <p>Ya no tienes acceso a las funcionalidades premium de SecurePass. Para recuperar el acceso, por favor renueva tu suscripción.</p>

          <p><a href="${process.env.FRONTEND_URL}/subscription" style="display: inline-block; background-color: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Renovar suscripción</a></p>

          <p>Saludos,<br/>El equipo de SecurePass</p>

          <p style="font-size: 12px; color: #7f8c8d; margin-top: 30px;">Este es un mensaje automático, no responder.</p>
        </div>
      `,
    };

    return await this.transporter.sendMail(mailOptions);
  }
}

export const notificationService = new NotificationService();
