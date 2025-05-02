import React, { createContext, useContext } from 'react';
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

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        notifyAchievement,
        notifyRankUp,
        notifyLevelComplete,
        removeNotification,
        clearNotifications
      }}
    >
      {children}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
        {notifications.map((notification: any) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </View>
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};