import admin from "firebase-admin";

// Inicializar Firebase Admin (usar variables de entorno)
if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : null;

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  } catch (error) {
    console.error("Error inicializando Firebase Admin:", error);
  }
}

export interface PushNotification {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

export class PushNotificationService {
  /**
   * Enviar notificación a un dispositivo específico
   */
  static async sendToDevice(
    deviceToken: string,
    notification: PushNotification
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!admin.apps.length) {
        throw new Error("Firebase no está configurado");
      }

      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
          ...(notification.imageUrl && { imageUrl: notification.imageUrl }),
        },
        data: notification.data || {},
        token: deviceToken,
      };

      const response = await admin.messaging().send(message);

      return {
        success: true,
        messageId: response,
      };
    } catch (error: any) {
      console.error("Error enviando notificación:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Enviar notificación a múltiples dispositivos
   */
  static async sendToMultipleDevices(
    deviceTokens: string[],
    notification: PushNotification
  ): Promise<{
    successCount: number;
    failureCount: number;
    errors?: string[];
  }> {
    try {
      if (!admin.apps.length) {
        throw new Error("Firebase no está configurado");
      }

      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
          ...(notification.imageUrl && { imageUrl: notification.imageUrl }),
        },
        data: notification.data || {},
        tokens: deviceTokens,
      };

      const response = await admin.messaging().sendMulticast(message);

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        errors: response.responses
          .filter((r) => !r.success)
          .map((r) => r.error?.message || "Unknown error"),
      };
    } catch (error: any) {
      console.error("Error enviando notificaciones múltiples:", error);
      return {
        successCount: 0,
        failureCount: deviceTokens.length,
        errors: [error.message],
      };
    }
  }

  /**
   * Enviar notificación a un topic
   */
  static async sendToTopic(
    topic: string,
    notification: PushNotification
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!admin.apps.length) {
        throw new Error("Firebase no está configurado");
      }

      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
          ...(notification.imageUrl && { imageUrl: notification.imageUrl }),
        },
        data: notification.data || {},
        topic: topic,
      };

      const response = await admin.messaging().send(message);

      return {
        success: true,
        messageId: response,
      };
    } catch (error: any) {
      console.error("Error enviando notificación a topic:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Suscribir dispositivo a un topic
   */
  static async subscribeToTopic(
    deviceTokens: string | string[],
    topic: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!admin.apps.length) {
        throw new Error("Firebase no está configurado");
      }

      const tokens = Array.isArray(deviceTokens) ? deviceTokens : [deviceTokens];
      await admin.messaging().subscribeToTopic(tokens, topic);

      return { success: true };
    } catch (error: any) {
      console.error("Error suscribiendo a topic:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Desuscribir dispositivo de un topic
   */
  static async unsubscribeFromTopic(
    deviceTokens: string | string[],
    topic: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!admin.apps.length) {
        throw new Error("Firebase no está configurado");
      }

      const tokens = Array.isArray(deviceTokens) ? deviceTokens : [deviceTokens];
      await admin.messaging().unsubscribeFromTopic(tokens, topic);

      return { success: true };
    } catch (error: any) {
      console.error("Error desuscribiendo de topic:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Notificaciones predefinidas del sistema

  /**
   * Notificar al residente de visita autorizada
   */
  static async notifyVisitAuthorized(
    deviceToken: string,
    visitName: string,
    qrId: string
  ) {
    return await this.sendToDevice(deviceToken, {
      title: "Visita Autorizada",
      body: `${visitName} ha sido autorizado. QR: ${qrId}`,
      data: {
        type: "visit_authorized",
        qrId,
      },
    });
  }

  /**
   * Notificar al residente que el visitante llegó
   */
  static async notifyVisitorArrived(
    deviceToken: string,
    visitName: string,
    document: string
  ) {
    return await this.sendToDevice(deviceToken, {
      title: "Visitante en Recepción",
      body: `${visitName} ha llegado a la residencia.`,
      data: {
        type: "visitor_arrived",
        document,
      },
    });
  }

  /**
   * Notificar a guardias de nueva visita pendiente
   */
  static async notifyGuardsNewVisit(topic: string, visitName: string) {
    return await this.sendToTopic(topic, {
      title: "Nueva Visita Pendiente",
      body: `${visitName} está esperando autorización.`,
      data: {
        type: "new_visit_pending",
      },
    });
  }

  /**
   * Notificar espacio de parqueo asignado
   */
  static async notifyParkingAssigned(
    deviceToken: string,
    spaceNumber: string,
    floor?: string
  ) {
    const location = floor ? ` en piso ${floor}` : "";
    return await this.sendToDevice(deviceToken, {
      title: "Espacio de Parqueo Asignado",
      body: `Se le ha asignado el espacio ${spaceNumber}${location}.`,
      data: {
        type: "parking_assigned",
        spaceNumber,
      },
    });
  }

  /**
   * Notificar que el parqueo está lleno
   */
  static async notifyParkingFull(deviceToken: string) {
    return await this.sendToDevice(deviceToken, {
      title: "Parqueadero Lleno",
      body: "No hay espacios de parqueo disponibles en este momento.",
      data: {
        type: "parking_full",
      },
    });
  }
}
