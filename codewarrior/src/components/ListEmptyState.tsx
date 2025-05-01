import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, typography } from '../constants/theme';

interface ListEmptyStateProps {
  icon?: string;
  title: string;
  message: string;
}

export const ListEmptyState: React.FC<ListEmptyStateProps> = ({
  icon = 'magnify',
  title,
  message
}) => {
  return (
    <View style={styles.container}>
      <Icon
        name={icon}
        size={48}
        color={colors.text.disabled}
        style={styles.icon}
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    minHeight: 200,
  },
  icon: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    ...typography.body2,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});