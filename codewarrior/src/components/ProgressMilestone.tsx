import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, typography } from '../constants/theme';

interface ProgressMilestoneProps {
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  icon?: string;
  isCompleted?: boolean;
}

export const ProgressMilestone = ({
  title,
  description,
  progress,
  maxProgress,
  icon = 'star',
  isCompleted = false,
}) => {
  const progressPercentage = (progress / maxProgress) * 100;

  return (
    <View style={[
      styles.container,
      isCompleted && styles.completedContainer
    ]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon
            name={icon}
            size={24}
            color={isCompleted ? colors.secondary : colors.primary}
          />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressPercentage}%`,
                backgroundColor: isCompleted ? colors.secondary : colors.primary,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {progress}/{maxProgress}
        </Text>
      </View>

      {isCompleted && (
        <View style={styles.completedBadge}>
          <Icon name="check-circle" size={20} color={colors.secondary} />
          <Text style={styles.completedText}>Completed</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: spacing.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  completedContainer: {
    borderColor: colors.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: colors.background,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    ...typography.caption,
    color: colors.text.secondary,
    minWidth: 45,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary + '10',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.lg,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  completedText: {
    ...typography.caption,
    color: colors.secondary,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
});
