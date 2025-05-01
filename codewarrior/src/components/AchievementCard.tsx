import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProgressBar } from './ProgressBar';
import { colors, spacing, typography } from '../constants/theme';
import { Achievement } from '../services/AchievementService';

interface AchievementCardProps {
  achievement: Achievement;
  progress: number;
  isEarned?: boolean;
}

export const AchievementCard = ({
  achievement,
  progress,
  isEarned = false
}) => {
  return (
    <View style={[styles.container, styles.cardElevation]}>
      <View style={styles.header}>
        <Text style={styles.title}>{achievement.name}</Text>
        {isEarned && (
          <View style={styles.earnedBadge}>
            <Text style={styles.earnedText}>Earned!</Text>
          </View>
        )}
      </View>

      <Text style={styles.description}>{achievement.description}</Text>

      {!isEarned && (
        <View style={styles.progressContainer}>
          <ProgressBar progress={progress} />
          <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
        </View>
      )}

      <View style={styles.requirementsContainer}>
        <Text style={styles.requirementsTitle}>Requirements:</Text>
        {achievement.requirements.points && (
          <Text style={styles.requirementText}>
            • Earn {achievement.requirements.points} points
          </Text>
        )}
        {achievement.requirements.courseLevels && (
          <Text style={styles.requirementText}>
            • Complete required levels
          </Text>
        )}
        {achievement.requirements.rank && (
          <Text style={styles.requirementText}>
            • Reach {achievement.requirements.rank} rank
          </Text>
        )}
        {achievement.requirements.skills && (
          <Text style={styles.requirementText}>
            • Master required skills
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    padding: spacing.md,
  },
  cardElevation: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: 'bold', // Ensure fontWeight uses a valid value
  },
  earnedBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
  },
  earnedText: {
    color: colors.text.inverse,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  description: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  requirementsContainer: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: spacing.sm,
  },
  requirementsTitle: {
    ...typography.body2,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  requirementText: {
    ...typography.body2,
    color: colors.text.secondary,
    marginVertical: spacing.xs,
  },
});
