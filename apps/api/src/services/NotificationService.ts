import nodemailer from "nodemailer";
import { env } from "../config/env";
import { IVisit } from "../interfaces/IVisit";
import { UserService } from "./UserService";
import { IUser } from "../interfaces/IUser";
import { ISubscription } from "../interfaces/ISubscription";
import { IPayment } from "../interfaces/IPayment";

class NotificationService {
  public transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "Gmail",
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
    const residentData = (await UserService.findById(
      visitData.authorization.resident
    )) as IUser;

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
        <p><strong>Documento de Indentidad:</strong> ${
          visitData.visit.document
        }</p>
        <p><strong>Motivo de Visita:</strong> ${
          visitData.authorization.reason
        }</p>
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
        <p><strong>Documento de Indentidad:</strong> ${
          visitData.visit.document
        }</p>
        <p><strong>Motivo de Visita:</strong> ${
          visitData.authorization.reason
        }</p>
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
      enterprise: 'Empresarial'
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

  /**
   * Envía notificación de cambio de fecha de facturación
   */
  async sendBillingDateChanged(
    userEmail: string,
    userName: string,
    newBillingDay: number,
    nextBillingDate?: Date
  ): Promise<nodemailer.SentMessageInfo> {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM}`,
      sender: process.env.EMAIL_SENDER,
      replyTo: process.env.EMAIL_REPLY,
      to: userEmail,
      subject: 'Fecha de facturación actualizada - SecurePass',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3498db;">Fecha de facturación actualizada</h1>
          <p>Estimado ${userName},</p>
          <p>Tu fecha de facturación ha sido actualizada exitosamente.</p>

          <div style="background-color: #e8f4f8; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3498db;">
            <p><strong>Nuevo día de facturación:</strong> Día ${newBillingDay} de cada mes</p>
            ${nextBillingDate ? `<p><strong>Próxima fecha de cobro:</strong> ${nextBillingDate.toLocaleDateString('es-ES')}</p>` : ''}
          </div>

          <p>A partir de ahora, tus cargos se procesarán el día ${newBillingDay} de cada mes.</p>

          <p>Saludos,<br/>El equipo de SecurePass</p>

          <p style="font-size: 12px; color: #7f8c8d; margin-top: 30px;">Este es un mensaje automático, no responder.</p>
        </div>
      `,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Envía advertencia de pago pendiente
   */
  async sendPaymentWarning(
    userEmail: string,
    userName: string,
    amount: number,
    dueDate: Date,
    daysUntilSuspension: number
  ): Promise<nodemailer.SentMessageInfo> {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM}`,
      sender: process.env.EMAIL_SENDER,
      replyTo: process.env.EMAIL_REPLY,
      to: userEmail,
      subject: '⚠️ Pago pendiente - SecurePass',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f39c12;">⚠️ Pago pendiente</h1>
          <p>Estimado ${userName},</p>
          <p>Tienes un pago pendiente en tu cuenta de SecurePass.</p>

          <div style="background-color: #fff9e6; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f39c12;">
            <h2 style="color: #2c3e50; margin-top: 0;">Detalles del pago</h2>
            <p><strong>Monto adeudado:</strong> $${(amount / 100).toFixed(2)}</p>
            <p><strong>Fecha de vencimiento:</strong> ${dueDate.toLocaleDateString('es-ES')}</p>
            <p><strong>Estado:</strong> Vencido</p>
          </div>

          <div style="background-color: #ffe6e6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #c0392b;"><strong>⏰ Tu cuenta será suspendida en ${daysUntilSuspension} ${daysUntilSuspension === 1 ? 'día' : 'días'} si no realizas el pago.</strong></p>
          </div>

          <p>Por favor, realiza tu pago lo antes posible para evitar la suspensión de tu cuenta.</p>

          <p><a href="${process.env.FRONTEND_URL}/billing" style="display: inline-block; background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Realizar Pago Ahora</a></p>

          <p>Si ya realizaste el pago, por favor ignora este mensaje.</p>

          <p>Saludos,<br/>El equipo de SecurePass</p>

          <p style="font-size: 12px; color: #7f8c8d; margin-top: 30px;">Este es un mensaje automático, no responder.</p>
        </div>
      `,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Envía notificación de cuenta suspendida
   */
  async sendAccountSuspended(
    userEmail: string,
    userName: string,
    reason: string,
    pendingAmount: number
  ): Promise<nodemailer.SentMessageInfo> {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM}`,
      sender: process.env.EMAIL_SENDER,
      replyTo: process.env.EMAIL_REPLY,
      to: userEmail,
      subject: '🚫 Tu cuenta ha sido suspendida - SecurePass',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e74c3c;">🚫 Cuenta suspendida</h1>
          <p>Estimado ${userName},</p>
          <p>Tu cuenta de SecurePass ha sido suspendida.</p>

          <div style="background-color: #ffe6e6; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #e74c3c;">
            <h2 style="color: #c0392b; margin-top: 0;">Motivo de suspensión</h2>
            <p>${reason}</p>
            <p><strong>Monto adeudado:</strong> $${(pendingAmount / 100).toFixed(2)}</p>
          </div>

          <p><strong>¿Qué significa esto?</strong></p>
          <ul>
            <li>No podrás acceder a las funcionalidades de SecurePass</li>
            <li>Tus suscripciones activas han sido canceladas</li>
            <li>Perderás el acceso hasta que se realice el pago pendiente</li>
          </ul>

          <p><strong>¿Cómo reactivar tu cuenta?</strong></p>
          <p>Realiza el pago de tu saldo pendiente para reactivar tu cuenta inmediatamente.</p>

          <p><a href="${process.env.FRONTEND_URL}/billing" style="display: inline-block; background-color: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Pagar y Reactivar Cuenta</a></p>

          <p>Si tienes alguna pregunta o necesitas ayuda, contacta con nuestro soporte.</p>

          <p>Saludos,<br/>El equipo de SecurePass</p>

          <p style="font-size: 12px; color: #7f8c8d; margin-top: 30px;">Este es un mensaje automático, no responder.</p>
        </div>
      `,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Envía notificación de cuenta bloqueada
   */
  async sendAccountBlocked(
    userEmail: string,
    userName: string,
    reason: string,
    pendingAmount: number
  ): Promise<nodemailer.SentMessageInfo> {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM}`,
      sender: process.env.EMAIL_SENDER,
      replyTo: process.env.EMAIL_REPLY,
      to: userEmail,
      subject: '⛔ Tu cuenta ha sido bloqueada - SecurePass',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #c0392b;">⛔ Cuenta bloqueada</h1>
          <p>Estimado ${userName},</p>
          <p>Tu cuenta de SecurePass ha sido bloqueada debido a falta de pago prolongada.</p>

          <div style="background-color: #ffe6e6; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #c0392b;">
            <h2 style="color: #c0392b; margin-top: 0;">Información del bloqueo</h2>
            <p><strong>Razón:</strong> ${reason}</p>
            <p><strong>Monto adeudado:</strong> $${(pendingAmount / 100).toFixed(2)}</p>
          </div>

          <p><strong>⚠️ IMPORTANTE:</strong></p>
          <ul>
            <li>Tu cuenta ha sido bloqueada permanentemente</li>
            <li>Todas tus suscripciones han sido canceladas</li>
            <li>Debes contactar con soporte para desbloquear tu cuenta</li>
          </ul>

          <p>Para resolver esta situación, por favor:</p>
          <ol>
            <li>Realiza el pago de tu saldo pendiente</li>
            <li>Contacta con nuestro equipo de soporte</li>
            <li>Proporciona el comprobante de pago</li>
          </ol>

          <p><a href="${process.env.FRONTEND_URL}/contact" style="display: inline-block; background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Contactar Soporte</a></p>

          <p>Saludos,<br/>El equipo de SecurePass</p>

          <p style="font-size: 12px; color: #7f8c8d; margin-top: 30px;">Este es un mensaje automático, no responder.</p>
        </div>
      `,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Envía notificación de cuenta reactivada
   */
  async sendAccountReactivated(
    userEmail: string,
    userName: string
  ): Promise<nodemailer.SentMessageInfo> {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM}`,
      sender: process.env.EMAIL_SENDER,
      replyTo: process.env.EMAIL_REPLY,
      to: userEmail,
      subject: '✅ Tu cuenta ha sido reactivada - SecurePass',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #27ae60;">✅ ¡Cuenta reactivada!</h1>
          <p>Estimado ${userName},</p>
          <p>¡Excelentes noticias! Tu cuenta de SecurePass ha sido reactivada exitosamente.</p>

          <div style="background-color: #e8f8f5; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #27ae60;">
            <p style="margin: 0;">Ya tienes acceso completo a todas las funcionalidades de SecurePass.</p>
          </div>

          <p><strong>¿Qué puedes hacer ahora?</strong></p>
          <ul>
            <li>Acceder a todas las funciones de tu cuenta</li>
            <li>Renovar tus suscripciones si lo deseas</li>
            <li>Gestionar visitantes y accesos</li>
          </ul>

          <p>Gracias por actualizar tu cuenta. ¡Bienvenido de nuevo!</p>

          <p><a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Ir a Mi Cuenta</a></p>

          <p>Saludos,<br/>El equipo de SecurePass</p>

          <p style="font-size: 12px; color: #7f8c8d; margin-top: 30px;">Este es un mensaje automático, no responder.</p>
        </div>
      `,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Envía factura por email
   */
  async sendInvoice(
    userEmail: string,
    userName: string,
    invoiceNumber: string,
    amount: number,
    dueDate: Date,
    pdfUrl?: string
  ): Promise<nodemailer.SentMessageInfo> {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM}`,
      sender: process.env.EMAIL_SENDER,
      replyTo: process.env.EMAIL_REPLY,
      to: userEmail,
      subject: `Factura ${invoiceNumber} - SecurePass`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3498db;">Nueva Factura</h1>
          <p>Estimado ${userName},</p>
          <p>Se ha generado una nueva factura para tu cuenta.</p>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #2c3e50; margin-top: 0;">Detalles de la factura</h2>
            <p><strong>Número de factura:</strong> ${invoiceNumber}</p>
            <p><strong>Monto total:</strong> $${(amount / 100).toFixed(2)}</p>
            <p><strong>Fecha de vencimiento:</strong> ${dueDate.toLocaleDateString('es-ES')}</p>
          </div>

          ${pdfUrl ? `<p><a href="${process.env.FRONTEND_URL}${pdfUrl}" style="display: inline-block; background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Descargar Factura PDF</a></p>` : ''}

          <p>Por favor, realiza el pago antes de la fecha de vencimiento.</p>

          <p><a href="${process.env.FRONTEND_URL}/billing" style="display: inline-block; background-color: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Ver y Pagar Factura</a></p>

          <p>Saludos,<br/>El equipo de SecurePass</p>

          <p style="font-size: 12px; color: #7f8c8d; margin-top: 30px;">Este es un mensaje automático, no responder.</p>
        </div>
      `,
    };

    return await this.transporter.sendMail(mailOptions);
  }
}

export const notificationService = new NotificationService();
