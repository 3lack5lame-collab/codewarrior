import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useProgressContext } from '../contexts/ProgressContext';
import { useAuth } from '../contexts/AuthContext';
import { RankService } from '../services/RankService';
import { colors } from '../constants/theme';
import { Rank, Skill } from '../types/ranks';

export const RankScreen = () => {
  const { user } = useAuth();
  const { userProgress, loading: progressLoading } = useProgressContext();
  const [currentRank, setCurrentRank] = useState<Rank | null>(null);
  const [nextRanks, setNextRanks] = useState<Rank[]>([]);
  const [requiredSkills, setRequiredSkills] = useState<Skill[]>([]);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const rankService = new RankService();

  useEffect(() => {
    const loadRankData = async () => {
      if (!user || progressLoading || !userProgress) return;

      setLoading(true);
      try {
        // Get current rank details
        const { rank } = await rankService.getRankById(userProgress.currentRank.id);
        setCurrentRank(rank);

        // Get next ranks
        const { ranks } = await rankService.getNextRanks(userProgress.currentRank.id, 3);
        setNextRanks(ranks);

        // Get required skills for next rank
        if (ranks.length > 0) {
          const { skills } = await rankService.getRequiredSkillsForRank(ranks[0].id);
          setRequiredSkills(skills);
        }

        // Calculate progress percentage
        const progress = await rankService.calculateProgress(
          userProgress.totalPoints,
          userProgress.currentRank.id
        );
        setProgressPercentage(progress);
      } catch (error) {
        console.error('Error loading rank data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRankData();
  }, [user, userProgress, progressLoading]);

  if (loading || !currentRank) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading rank data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.currentRankCard}>
        <Text style={styles.currentRankTitle}>Current Rank</Text>
        <Text style={styles.rankName}>{currentRank.name}</Text>
        <View style={styles.rankDetails}>
          <Text style={styles.levelText}>Level {currentRank.level}</Text>
          <Text style={styles.pointsText}>{userProgress?.totalPoints || 0} Points</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progressPercentage)}% to next rank</Text>
        </View>

        <View style={styles.careerStageContainer}>
          <Text style={styles.sectionTitle}>Career Stage</Text>
          <Text style={styles.careerTitle}>{currentRank.careerStage.title}</Text>
          {currentRank.careerStage.salaryRange && (
            <Text style={styles.salaryRange}>{currentRank.careerStage.salaryRange}</Text>
          )}

          {currentRank.careerStage.roles.length > 0 && (
            <>
              <Text style={styles.rolesTitle}>Potential Roles:</Text>
              {currentRank.careerStage.roles.map((role, index) => (
                <Text key={index} style={styles.roleText}>• {role}</Text>
              ))}
            </>
          )}
        </View>

        <View style={styles.skillsContainer}>
          <Text style={styles.sectionTitle}>Current Skills</Text>
          <View style={styles.skillsList}>
            {currentRank.careerStage.skills.length > 0 ? (
              currentRank.careerStage.skills.map((skill, index) => (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noSkillsText}>No skills required at this rank</Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.nextRanksContainer}>
        <Text style={styles.sectionTitle}>Rank Progression</Text>
        {nextRanks.length > 0 ? (
          nextRanks.map((rank) => (
            <View key={rank.id} style={styles.nextRankCard}>
              <Text style={styles.nextRankName}>{rank.name}</Text>
              <Text style={styles.nextRankPoints}>Required Points: {rank.requiredPoints}</Text>
              {rank.careerStage.skills.length > 0 && (
                <View style={styles.nextRankRequirements}>
                  <Text style={styles.requirementsTitle}>Required Skills:</Text>
                  <View style={styles.skillsList}>
                    {rank.careerStage.skills.map((skill, index) => (
                      <View key={index} style={styles.skillBadge}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.nextRankCard}>
            <Text style={styles.nextRankName}>You've reached the highest rank!</Text>
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
  currentRankCard: {
    margin: 16,
    padding: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    elevation: 4,
  },
  currentRankTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  rankName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginVertical: 8,
  },
  rankDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  levelText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  pointsText: {
    fontSize: 16,
    color: colors.secondary,
    fontWeight: '600',
  },
  progressContainer: {
    marginVertical: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.progress.background,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.progress.fill,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  careerStageContainer: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.text.primary,
  },
  careerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  salaryRange: {
    fontSize: 16,
    color: colors.secondary,
    marginTop: 4,
  },
  rolesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    color: colors.text.primary,
  },
  roleText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginVertical: 2,
  },
  skillsContainer: {
    marginVertical: 16,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  noSkillsText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  skillBadge: {
    backgroundColor: colors.badge.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  skillText: {
    color: colors.badge.text,
    fontSize: 14,
  },
  nextRanksContainer: {
    margin: 16,
  },
  nextRankCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    elevation: 2,
  },
  nextRankName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  nextRankPoints: {
    fontSize: 14,
    color: colors.secondary,
    marginTop: 4,
  },
  nextRankRequirements: {
    marginTop: 12,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.text.primary,
  },
  requirementText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginVertical: 2,
  },
});