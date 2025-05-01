import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { colors, spacing, typography } from '../constants/theme';

interface NextStepsProps {
  steps: string[];
  title?: string;
}

export const NextSteps: React.FC<NextStepsProps> = ({
  steps,
  title = 'Next Steps'
}) => {
  return (
    <Card variant="outlined" style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepContainer}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{index + 1}</Text>
          </View>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  stepNumberText: {
    ...typography.caption,
    color: colors.text.inverse,
    fontWeight: 'bold',
  },
  stepText: {
    ...typography.body2,
    color: colors.text.secondary,
    flex: 1,
  },
});