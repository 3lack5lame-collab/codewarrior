import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, typography, elevation } from '../constants/theme';

interface ConfirmationDialogProps {
  isVisible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'default' | 'warning' | 'danger';
  icon?: string;
}

export const ConfirmationDialog = ({
  isVisible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'default',
  icon
}) => {
  const getColors = () => {
    switch (type) {
      case 'warning':
      case 'danger':
        return {
          background: '#FFEBEE', // Light red background
          text: '#B00020', // Error text color
          button: '#B00020' // Error button color
        };
      default:
        return {
          background: colors.surface,
          text: colors.text.primary,
          button: colors.primary
        };
    }
  };

  const themeColors = getColors();

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      <View style={[styles.dialog, { backgroundColor: themeColors.background }]}>
        {icon && (
          <Icon
            name={icon}
            size={32}
            color={themeColors.text}
            style={styles.icon}
          />
        )}

        <Text style={[styles.title, { color: themeColors.text }]}>
          {title}
        </Text>

        <Text style={[styles.message, { color: themeColors.text }]}>
          {message}
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>{cancelText}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.confirmButton,
              { backgroundColor: themeColors.button }
            ]}
            onPress={onConfirm}
          >
            <Text style={styles.confirmButtonText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    width: '85%',
    maxWidth: 400,
    borderRadius: spacing.lg,
    padding: spacing.lg,
    ...elevation.high,
  },
  icon: {
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body2,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.md,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: spacing.md,
    backgroundColor: colors.background,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    ...typography.body2,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  confirmButtonText: {
    ...typography.body2,
    color: colors.text.inverse,
    fontWeight: '600',
  },
});
