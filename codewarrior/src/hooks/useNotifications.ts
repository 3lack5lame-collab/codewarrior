import { useState, useEffect, useCallback } from 'react';
import { Achievement } from '../services/AchievementService';
import { Rank } from '../types/ranks';

export interface Notification {
  id: string;
  type: 'achievement' | 'rank' | 'level';
  title: string;
  message: string;
  timestamp: number;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(),
      timestamp: Date.now()
    };

    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const notifyAchievement = useCallback((achievement: Achievement) => {
    addNotification({
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: `You've earned the "${achievement.name}" achievement!`
    });
  }, [addNotification]);

  const notifyRankUp = useCallback((newRank: Rank) => {
    addNotification({
      type: 'rank',
      title: 'Rank Up!',
      message: `Congratulations! You've reached ${newRank.name} rank!`
    });
  }, [addNotification]);

  const notifyLevelComplete = useCallback((levelName: string, pointsEarned: number) => {
    addNotification({
      type: 'level',
      title: 'Level Complete!',
      message: `You've completed ${levelName} and earned ${pointsEarned} points!`
    });
  }, [addNotification]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      const now = Date.now();
      setNotifications(prev => 
        prev.filter(n => now - n.timestamp < 5000)
      );
    }, 5000);

    return () => clearTimeout(timeout);
  }, [notifications]);

  return {
    notifications,
    notifyAchievement,
    notifyRankUp,
    notifyLevelComplete,
    removeNotification,
    clearNotifications
  };
};