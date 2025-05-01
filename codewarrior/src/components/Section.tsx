import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../constants/theme';

interface SectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Section: React.FC<SectionProps> = ({
  title,
  subtitle,
  children,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  content: {
    // Add any default content styling here
  },
});