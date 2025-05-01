import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Card } from './Card';
import { colors, spacing, typography } from '../constants/theme';

interface Skill {
  skill: string;
  weight: number;
}

interface SkillChartProps {
  skills: Skill[];
  title?: string;
}

export const SkillChart: React.FC<SkillChartProps> = ({
  skills,
  title = 'Skill Progress'
}) => {
  const maxBarWidth = Dimensions.get('window').width - (spacing.md * 4);

  return (
    <Card variant="elevated" style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {skills.map((skill, index) => (
        <View key={index} style={styles.skillContainer}>
          <Text style={styles.skillName}>{skill.skill}</Text>
          <View style={styles.barContainer}>
            <View 
              style={[
                styles.bar,
                { 
                  width: `${skill.weight}%`,
                  backgroundColor: skill.weight >= 100 ? colors.secondary : colors.primary
                }
              ]}
            />
            <Text style={styles.percentage}>{Math.round(skill.weight)}%</Text>
          </View>
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
  skillContainer: {
    marginBottom: spacing.md,
  },
  skillName: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  barContainer: {
    height: 20,
    backgroundColor: colors.background,
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bar: {
    height: '100%',
    borderRadius: 10,
  },
  percentage: {
    ...typography.caption,
    color: colors.text.primary,
    position: 'absolute',
    right: spacing.sm,
    fontWeight: '600',
  },
});