import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, typography } from '../constants/theme';

interface ErrorProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const Error: React.FC<ErrorProps> = ({
  title = 'Oops!',
  message,
  onRetry
}) => {
  return (
    <View style={styles.container}>
      <Icon 
        name="alert-circle-outline"
        size={48}
        color={colors.error}
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: spacing.lg,
  },
  retryText: {
    ...typography.body1,
    color: colors.text.inverse,
    fontWeight: '600',
  },
});