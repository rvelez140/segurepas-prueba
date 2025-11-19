import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';

const { apiUrl } = Constants.expoConfig?.extra as { apiUrl: string };
const API_URL = apiUrl;

// Configurar comportamiento de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
}

// Registrar dispositivo para notificaciones push
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('No se pudieron obtener permisos para notificaciones push');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push Token:', token);
  } else {
    alert('Debe usar un dispositivo físico para notificaciones push');
  }

  return token;
}

// Enviar token al backend
export async function savePushToken(userId: string, token: string) {
  try {
    await axios.post(`${API_URL}/users/${userId}/push-token`, { token });
  } catch (error) {
    console.error('Error al guardar token push:', error);
  }
}

// Programar notificación local
export async function scheduleLocalNotification(
  title: string,
  body: string,
  seconds: number = 0,
  data?: any
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: seconds > 0 ? { seconds } : null,
  });
}

// Enviar notificación push a usuario específico
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: any
) {
  try {
    await axios.post(`${API_URL}/notifications/send`, {
      userId,
      title,
      body,
      data,
    });
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    throw error;
  }
}

// Notificaciones específicas de la app
export const NotificationTemplates = {
  // Cuando llega un visitante
  visitorArrival: (visitorName: string) => ({
    title: '🚶 Visitante en Puerta',
    body: `${visitorName} ha llegado y está esperando autorización.`,
  }),

  // Cuando se autoriza una visita
  visitAuthorized: (visitorName: string, expirationDate: string) => ({
    title: '✅ Visita Autorizada',
    body: `Has autorizado a ${visitorName}. Válido hasta ${expirationDate}.`,
  }),

  // Cuando una visita está por vencer
  visitExpiring: (visitorName: string, hours: number) => ({
    title: '⏰ Visita por Vencer',
    body: `La autorización de ${visitorName} vence en ${hours} horas.`,
  }),

  // Recordatorio de pago
  paymentReminder: (amount: number, dueDate: string) => ({
    title: '💰 Recordatorio de Pago',
    body: `Tu suscripción de $${amount} vence el ${dueDate}.`,
  }),

  // Pago exitoso
  paymentSuccess: (amount: number) => ({
    title: '✅ Pago Exitoso',
    body: `Tu pago de $${amount} ha sido procesado correctamente.`,
  }),

  // Paquete llegó
  packageArrived: (courier: string) => ({
    title: '📦 Paquete Recibido',
    body: `Ha llegado un paquete de ${courier}. Pasa a recogerlo.`,
  }),

  // Evento comunitario
  communityEvent: (eventName: string, date: string) => ({
    title: '🎉 Evento Comunitario',
    body: `${eventName} el ${date}. ¡No te lo pierdas!`,
  }),

  // Reserva confirmada
  bookingConfirmed: (spaceName: string, date: string) => ({
    title: '✅ Reserva Confirmada',
    body: `${spaceName} reservado para el ${date}.`,
  }),

  // Mensaje de chat
  newMessage: (senderName: string, preview: string) => ({
    title: `💬 Mensaje de ${senderName}`,
    body: preview,
  }),
};

// Cancelar todas las notificaciones
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Obtener badge count
export async function getBadgeCount() {
  return await Notifications.getBadgeCountAsync();
}

// Establecer badge count
export async function setBadgeCount(count: number) {
  await Notifications.setBadgeCountAsync(count);
}
