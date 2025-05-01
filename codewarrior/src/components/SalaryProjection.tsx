import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../constants/theme';

interface SalaryProjectionProps {
  currentSalary: { min: number; max: number };
  potentialSalary: { min: number; max: number };
  timeframe?: string;
}

export const SalaryProjection = ({
  currentSalary,
  potentialSalary,
  timeframe = '1-2 years'
}: SalaryProjectionProps) => {
  const formatSalary = (amount: number) =>
    `$${amount.toLocaleString()}`;

  const calculateIncrease = () => {
    const currentAvg = (currentSalary.min + currentSalary.max) / 2;
    const potentialAvg = (potentialSalary.min + potentialSalary.max) / 2;
    return ((potentialAvg - currentAvg) / currentAvg) * 100;
  };

  return (
    <View style={[styles.container, styles.cardElevation]}>
      <Text style={styles.title}>Salary Projection</Text>
      <Text style={styles.timeframe}>Expected in {timeframe}</Text>

      <View style={styles.salaryContainer}>
        <View style={styles.salaryColumn}>
          <Text style={styles.salaryLabel}>Current Range</Text>
          <Text style={styles.currentSalary}>
            {formatSalary(currentSalary.min)} - {formatSalary(currentSalary.max)}
          </Text>
        </View>

        <View style={styles.arrow}>
          <Text style={styles.arrowText}>➔</Text>
        </View>

        <View style={styles.salaryColumn}>
          <Text style={styles.salaryLabel}>Potential Range</Text>
          <Text style={styles.potentialSalary}>
            {formatSalary(potentialSalary.min)} - {formatSalary(potentialSalary.max)}
          </Text>
        </View>
      </View>

      <View style={styles.increaseBadge}>
        <Text style={styles.increaseText}>
          +{Math.round(calculateIncrease())}% Potential Increase
        </Text>
      </View>

      <Text style={styles.note}>
        * Salary ranges are estimates based on your current progress and market data
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
  },
  cardElevation: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  timeframe: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  salaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  salaryColumn: {
    flex: 1,
  },
  salaryLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  currentSalary: {
    ...typography.body1,
    color: colors.text.primary,
    fontWeight: '600',
  },
  potentialSalary: {
    ...typography.body1,
    color: colors.secondary,
    fontWeight: '600',
  },
  arrow: {
    paddingHorizontal: spacing.md,
  },
  arrowText: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold', // Ensure this is a valid value for React Native
  },
  increaseBadge: {
    backgroundColor: colors.badge.background,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.lg,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  increaseText: {
    ...typography.caption,
    color: colors.badge.text,
    fontWeight: '600',
  },
  note: {
    ...typography.caption,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
});
