import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from './Card';
import { Badge } from './Badge';
import { ProgressBar } from './ProgressBar';
import { CareerPath } from '../types/ranks';
import { colors, spacing, typography } from '../constants/theme';

interface CareerPathCardProps {
  career: CareerPath & { matchPercentage: number };
  onSelect: () => void;
  isSelected?: boolean;
}

export const CareerPathCard: React.FC<CareerPathCardProps> = ({
  career,
  onSelect,
  isSelected = false
}) => {
  return (
    <TouchableOpacity onPress={onSelect} activeOpacity={0.8}>
      <Card 
        variant="elevated"
        style={[
          styles.container,
          isSelected && styles.selectedContainer
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{career.title}</Text>
          <View style={[
            styles.demandBadge,
            { backgroundColor: career.industryDemand === 'High' ? colors.secondary : colors.badge.background }
          ]}>
            <Text style={[
              styles.demandText,
              { color: career.industryDemand === 'High' ? colors.text.inverse : colors.badge.text }
            ]}>
              {career.industryDemand} Demand
            </Text>
          </View>
        </View>

        <Text style={styles.description}>{career.description}</Text>

        <View style={styles.matchSection}>
          <Text style={styles.matchLabel}>Career Match</Text>
          <ProgressBar progress={career.matchPercentage} />
          <Text style={styles.matchPercentage}>{Math.round(career.matchPercentage)}% Match</Text>
        </View>

        <View style={styles.salaryContainer}>
          <Text style={styles.salaryLabel}>Average Salary Range</Text>
          <Text style={styles.salary}>{career.averageSalary}</Text>
        </View>

        <View style={styles.skillsSection}>
          <Text style={styles.sectionTitle}>Required Skills</Text>
          <View style={styles.skillsList}>
            {career.requiredSkills.map((skill, index) => (
              <Badge
                key={index}
                label={skill}
                size="small"
              />
            ))}
          </View>
        </View>

        <View style={styles.rolesSection}>
          <Text style={styles.sectionTitle}>Potential Roles</Text>
          {career.potentialRoles.map((role, index) => (
            <Text key={index} style={styles.roleText}>• {role}</Text>
          ))}
        </View>

        <TouchableOpacity 
          style={[
            styles.exploreButton,
            isSelected && styles.selectedButton
          ]}
          onPress={onSelect}
        >
          <Text style={styles.exploreButtonText}>
            {isSelected ? 'Selected' : 'Explore Path'}
          </Text>
        </TouchableOpacity>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  selectedContainer: {
    borderColor: colors.primary,
    borderWidth: 2,
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
    flex: 1,
  },
  demandBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
    marginLeft: spacing.sm,
  },
  demandText: {
    ...typography.caption,
    fontWeight: '600',
  },
  description: {
    ...typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  matchSection: {
    marginBottom: spacing.md,
  },
  matchLabel: {
    ...typography.body2,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  matchPercentage: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  salaryContainer: {
    marginBottom: spacing.md,
  },
  salaryLabel: {
    ...typography.body2,
    color: colors.text.secondary,
  },
  salary: {
    ...typography.h3,
    color: colors.secondary,
    marginTop: spacing.xs,
  },
  skillsSection: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.body1,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  rolesSection: {
    marginBottom: spacing.md,
  },
  roleText: {
    ...typography.body2,
    color: colors.text.secondary,
    marginVertical: spacing.xs,
  },
  exploreButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: spacing.lg,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: colors.secondary,
  },
  exploreButtonText: {
    ...typography.body1,
    color: colors.text.inverse,
    fontWeight: '600',
  },
});