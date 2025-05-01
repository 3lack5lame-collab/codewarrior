import React, { createContext, useContext } from 'react';
import { View } from 'react-native';
import { useNotifications, Notification } from '../hooks/useNotifications';
import { NotificationToast } from '../components/NotificationToast';

interface NotificationContextType {
  notifications: Notification[];
  notifyAchievement: ReturnType<typeof useNotifications>['notifyAchievement'];
  notifyRankUp: ReturnType<typeof useNotifications>['notifyRankUp'];
  notifyLevelComplete: ReturnType<typeof useNotifications>['notifyLevelComplete'];
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
        {notifications.map(notification => (
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