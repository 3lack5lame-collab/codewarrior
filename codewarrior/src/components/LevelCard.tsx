import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CourseLevel } from '../types/ranks';
import { Card } from './Card';
import { Badge } from './Badge';
import { ProgressBar } from './ProgressBar';
import { colors, spacing, typography } from '../constants/theme';

interface LevelCardProps {
  level: CourseLevel;
  progress?: number;
  isUnlocked: boolean;
  onStart?: () => void;
}

export const LevelCard: React.FC<LevelCardProps> = ({
  level,
  progress = 0,
  isUnlocked,
  onStart
}) => {
  return (
    <Card variant="elevated" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{level.name}</Text>
        {!isUnlocked && (
          <View style={styles.lockedBadge}>
            <Text style={styles.lockedText}>Locked</Text>
          </View>
        )}
      </View>

      <Text style={styles.description}>{level.description}</Text>

      <View style={styles.skillsContainer}>
        {level.requiredSkills.map((skill, index) => (
          <Badge
            key={index}
            label={skill}
            size="small"
            color={colors.badge.text}
            backgroundColor={colors.badge.background}
          />
        ))}
      </View>

      {progress > 0 && (
        <View style={styles.progressContainer}>
          <ProgressBar progress={progress} />
          <Text style={styles.progressText}>{progress}% Complete</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.points}>{level.points} Points</Text>
        {isUnlocked && onStart && (
          <TouchableOpacity 
            style={styles.startButton}
            onPress={onStart}
          >
            <Text style={styles.startButtonText}>Start Level</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
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
  },
  lockedBadge: {
    backgroundColor: colors.text.disabled,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
  },
  lockedText: {
    color: colors.text.inverse,
    fontSize: typography.caption.fontSize,
  },
  description: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  points: {
    ...typography.body1,
    color: colors.secondary,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.lg,
  },
  startButtonText: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
});