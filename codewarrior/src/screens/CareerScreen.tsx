import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useProgressContext } from '../contexts/ProgressContext';
import { useAuth } from '../contexts/AuthContext';
import { CareerService } from '../services/CareerService';
import { colors } from '../constants/theme';
import { CareerPath } from '../types/ranks';

export const CareerScreen = () => {
  const { user } = useAuth();
  const { userProgress, loading: progressLoading } = useProgressContext();
  const [careerPaths, setCareerPaths] = useState<Array<CareerPath & { matchPercentage: number }>>([]);
  const [selectedCareerPath, setSelectedCareerPath] = useState<CareerPath | null>(null);
  const [skillGaps, setSkillGaps] = useState<Array<{ skill: string; acquired: boolean }>>([]);
  const [nextSteps, setNextSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const careerService = new CareerService();

  useEffect(() => {
    const loadCareerData = async () => {
      if (!user || progressLoading || !userProgress) return;

      setLoading(true);
      try {
        // Get career recommendations
        const { recommendations } = await careerService.getCareerRecommendations(
          user.id,
          userProgress.currentRank.id
        );

        setCareerPaths(recommendations);

        // If there are recommendations, select the first one
        if (recommendations.length > 0) {
          setSelectedCareerPath(recommendations[0]);

          // Get skill gaps for the selected career path
          const { skillGaps } = await careerService.getRequiredSkillGaps(
            user.id,
            recommendations[0].id || 0
          );

          setSkillGaps(skillGaps);

          // Get next steps for the selected career path
          const { steps } = await careerService.getNextCareerSteps(
            user.id,
            recommendations[0].id || 0
          );

          setNextSteps(steps);
        }
      } catch (error) {
        console.error('Error loading career data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCareerData();
  }, [user, userProgress, progressLoading]);

  const handleExploreCareerPath = async (careerPath: CareerPath) => {
    setSelectedCareerPath(careerPath);

    try {
      // Get skill gaps for the selected career path
      const { skillGaps } = await careerService.getRequiredSkillGaps(
        user?.id || '',
        careerPath.id || 0
      );

      setSkillGaps(skillGaps);

      // Get next steps for the selected career path
      const { steps } = await careerService.getNextCareerSteps(
        user?.id || '',
        careerPath.id || 0
      );

      setNextSteps(steps);

      // Show alert with next steps
      Alert.alert(
        `Explore ${careerPath.title}`,
        `Next steps to become a ${careerPath.title}:\n\n${steps.join('\n\n')}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error exploring career path:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading career paths...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Career Path</Text>
        <Text style={styles.headerSubtitle}>
          Current Stage: {userProgress?.currentRank.careerStage.title || 'Novice Developer'}
        </Text>
      </View>

      <View style={styles.currentStageCard}>
        <Text style={styles.sectionTitle}>Current Career Stage</Text>
        {userProgress?.currentRank.careerStage.salaryRange ? (
          <Text style={styles.stageSalary}>{userProgress.currentRank.careerStage.salaryRange}</Text>
        ) : (
          <Text style={styles.stageSalary}>Entry Level</Text>
        )}

        <Text style={styles.subheader}>Current Skills:</Text>
        <View style={styles.skillsList}>
          {userProgress?.currentRank.careerStage.skills && userProgress.currentRank.careerStage.skills.length > 0 ? (
            userProgress.currentRank.careerStage.skills.map((skill, index) => (
              <View key={index} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noSkillsText}>No skills acquired yet</Text>
          )}
        </View>
      </View>

      <View style={styles.careerPathsContainer}>
        <Text style={styles.sectionTitle}>Available Career Paths</Text>
        {careerPaths.length > 0 ? (
          careerPaths.map((path) => (
            <View key={path.title} style={styles.careerPathCard}>
              <Text style={styles.pathTitle}>{path.title}</Text>
              <Text style={styles.pathDescription}>{path.description}</Text>

              <View style={styles.matchContainer}>
                <Text style={styles.matchText}>Match: {Math.round(path.matchPercentage)}%</Text>
                <View style={styles.matchBar}>
                  <View style={[styles.matchFill, { width: `${path.matchPercentage}%` }]} />
                </View>
              </View>

              <Text style={styles.salaryRange}>{path.salaryRange}</Text>

              <View style={styles.skillsContainer}>
                <Text style={styles.skillsTitle}>Required Skills:</Text>
                <View style={styles.skillsList}>
                  {path.requiredSkills.map((skill, index) => {
                    const isAcquired = skillGaps.find(gap => gap.skill === skill)?.acquired || false;
                    return (
                      <View key={index} style={[
                        styles.skillBadge,
                        isAcquired ? styles.acquiredSkillBadge : {}
                      ]}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {path.potentialRoles && path.potentialRoles.length > 0 && (
                <View style={styles.rolesContainer}>
                  <Text style={styles.rolesTitle}>Potential Roles:</Text>
                  {path.potentialRoles.map((role, index) => (
                    <Text key={index} style={styles.roleText}>• {role}</Text>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => handleExploreCareerPath(path)}
              >
                <Text style={styles.exploreButtonText}>Explore Path</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No career paths available for your current rank.</Text>
            <Text style={styles.emptySubtext}>Complete more courses and challenges to unlock career paths!</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  header: {
    backgroundColor: colors.primary,
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.inverse,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.text.inverse,
    opacity: 0.8,
    marginTop: 4,
  },
  currentStageCard: {
    margin: 16,
    padding: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.text.primary,
  },
  stageSalary: {
    fontSize: 24,
    color: colors.secondary,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  subheader: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    color: colors.text.primary,
  },
  responsibilityText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginVertical: 2,
  },
  noSkillsText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  careerPathsContainer: {
    padding: 16,
  },
  careerPathCard: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 12,
    marginVertical: 8,
    elevation: 4,
  },
  pathTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  pathDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 8,
  },
  matchContainer: {
    marginTop: 12,
  },
  matchText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  matchBar: {
    height: 8,
    backgroundColor: colors.progress.background,
    borderRadius: 4,
  },
  matchFill: {
    height: '100%',
    backgroundColor: colors.progress.fill,
    borderRadius: 4,
  },
  demandBadge: {
    marginTop: 12,
  },
  demandText: {
    fontSize: 14,
    fontWeight: '600',
  },
  salaryRange: {
    fontSize: 18,
    color: colors.secondary,
    fontWeight: '600',
    marginTop: 8,
  },
  skillsContainer: {
    marginTop: 16,
  },
  skillsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.text.primary,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillBadge: {
    backgroundColor: colors.badge.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  acquiredSkillBadge: {
    backgroundColor: colors.secondary,
    opacity: 0.7,
  },
  skillText: {
    color: colors.badge.text,
    fontSize: 14,
  },
  rolesContainer: {
    marginTop: 16,
  },
  rolesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.text.primary,
  },
  roleText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginVertical: 2,
  },
  exploreButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
    alignItems: 'center',
  },
  exploreButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: 'bold',
  },
});