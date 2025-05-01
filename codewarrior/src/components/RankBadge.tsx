import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../constants/theme';

interface RankBadgeProps {
  rank: string;
  level: number;
  size?: 'small' | 'medium' | 'large';
  showAnimation?: boolean;
}

export const RankBadge = ({
  rank,
  level,
  size = 'medium'
}: RankBadgeProps) => {

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { padding: spacing.sm },
          rank: { ...typography.body2 },
          level: { ...typography.caption }
        };
      case 'large':
        return {
          container: { padding: spacing.lg },
          rank: { ...typography.h2 },
          level: { ...typography.body1 }
        };
      default:
        return {
          container: { padding: spacing.md },
          rank: { ...typography.h3 },
          level: { ...typography.body2 }
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.container,
        sizeStyles.container
      ]}
    >
      <Text style={[styles.rank, sizeStyles.rank]}>{rank}</Text>
      <Text style={[styles.level, sizeStyles.level]}>Level {level}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    borderRadius: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rank: {
    color: colors.text.inverse,
    fontWeight: 'bold',
  },
  level: {
    color: colors.text.inverse,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
});
