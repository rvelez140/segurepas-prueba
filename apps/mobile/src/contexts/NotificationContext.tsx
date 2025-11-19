import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, savePushToken } from '../services/notifications/notificationService';

interface NotificationContextData {
  expoPushToken: string | undefined;
  notification: Notifications.Notification | undefined;
  registerToken: (userId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string>();
  const [notification, setNotification] = useState<Notifications.Notification>();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Listener para cuando llega una notificación
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Listener para cuando el usuario toca una notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notificación tocada:', response);
      // Aquí puedes manejar navegación basada en la notificación
      const data = response.notification.request.content.data;
      // Ej: navegar a una pantalla específica
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const registerToken = async (userId: string) => {
    const token = await registerForPushNotificationsAsync();
    if (token) {
      setExpoPushToken(token);
      await savePushToken(userId, token);
    }
  };

  return (
    <NotificationContext.Provider value={{ expoPushToken, notification, registerToken }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  }
  return context;
};
