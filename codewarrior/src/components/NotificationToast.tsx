import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, elevation } from '../constants/theme';
import { Notification } from '../hooks/useNotifications';

interface NotificationToastProps {
  notification: Notification;
  onClose: (id: string) => void;
}

export const NotificationToast = ({
  notification,
  onClose
}: NotificationToastProps) => {

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'achievement':
        return colors.secondary;
      case 'rank':
        return colors.primary;
      default:
        return colors.surface;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
        }
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.message}>{notification.message}</Text>
      </View>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => onClose(notification.id)}
      >
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: spacing.md,
    ...elevation.medium,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.body1,
    color: colors.text.inverse,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.body2,
    color: colors.text.inverse,
  },
  closeButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  closeText: {
    ...typography.h2,
    color: colors.text.inverse,
    opacity: 0.8,
  },
});