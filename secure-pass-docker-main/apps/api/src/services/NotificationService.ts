import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { IVisit } from '../interfaces/IVisit';
import { UserService } from './UserService';
import { IUser } from '../interfaces/IUser';

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
}

export const notificationService = new NotificationService();
