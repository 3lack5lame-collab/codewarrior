import * as React from 'react';
const { createContext, useContext } = React;
import { View } from 'react-native';
import { useNotifications, Notification } from '../hooks/useNotifications';
import { NotificationToast } from '../components/NotificationToast';

const NotificationContext = createContext(undefined);

export const NotificationProvider = ({ children }: { children: any }) => {
  const {
    notifications,
    notifyAchievement,
    notifyRankUp,
    notifyLevelComplete,
    removeNotification,
    clearNotifications
  } = useNotifications();

  const notificationsView = React.createElement(
    View,
    { style: { position: 'absolute', top: 0, left: 0, right: 0 } },
    notifications.map((notification: any) =>
      React.createElement(NotificationToast, {
        key: notification.id,
        notification: notification,
        onClose: removeNotification
      })
    )
  );

  return React.createElement(
    NotificationContext.Provider,
    {
      value: {
        notifications,
        notifyAchievement,
        notifyRankUp,
        notifyLevelComplete,
        removeNotification,
        clearNotifications
      }
    },
    children,
    notificationsView
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};