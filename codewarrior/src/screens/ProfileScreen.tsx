import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useProgressContext } from '../contexts/ProgressContext';
import { useAuth } from '../contexts/AuthContext';
import { ProfileService, UserAchievement } from '../services/ProfileService';
import { colors } from '../constants/theme';

export const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const { userProgress, loading: progressLoading } = useProgressContext();
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    completedLevels: 0,
    achievements: 0
  });
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [courseProgress, setCourseProgress] = useState<Record<number, { courseTitle: string; progress: number }>>({});
  const [loading, setLoading] = useState(true);
  const profileService = new ProfileService();

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user || progressLoading) return;

      setLoading(true);
      try {
        // Get user stats
        const { totalPoints, completedLevels, achievements: achievementsCount } =
          await profileService.getUserStats(user.id);

        setUserStats({
          totalPoints,
          completedLevels,
          achievements: achievementsCount
        });

        // Get user achievements
        const { achievements: userAchievements } = await profileService.getUserAchievements(user.id);
        setAchievements(userAchievements);

        // Get user course progress
        const { courseProgress: userCourseProgress } = await profileService.getUserCourseProgress(user.id);
        setCourseProgress(userCourseProgress);
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [user, progressLoading]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  // Find the course with the highest progress
  const getCurrentCourse = () => {
    if (Object.keys(courseProgress).length === 0) {
      return { courseTitle: 'No courses started', progress: 0 };
    }

    return Object.values(courseProgress).reduce(
      (prev, current) => (current.progress > prev.progress ? current : prev),
      { courseTitle: '', progress: -1 }
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const currentCourse = getCurrentCourse();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          {user?.avatarUrl ? (
            <Image
              source={{ uri: user.avatarUrl }}
              style={styles.profileImage}
            />
          ) : (
            <Image
              source={require('../assets/default-avatar.png')}
              style={styles.profileImage}
            />
          )}
        </View>
        <Text style={styles.username}>{user?.username || 'Code Warrior'}</Text>
        <Text style={styles.rankTitle}>{userProgress?.currentRank.name || 'Novice'}</Text>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userStats.totalPoints}</Text>
          <Text style={styles.statLabel}>Total Points</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userStats.completedLevels}</Text>
          <Text style={styles.statLabel}>Completed Levels</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userStats.achievements}</Text>
          <Text style={styles.statLabel}>Achievements</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Career Progress</Text>
        <View style={styles.careerCard}>
          <Text style={styles.careerStage}>{userProgress?.currentRank.careerStage.title || 'Novice Developer'}</Text>
          {userProgress?.currentRank.careerStage.salaryRange && (
            <Text style={styles.salarySalary}>{userProgress.currentRank.careerStage.salaryRange}</Text>
          )}
          <View style={styles.skillsList}>
            {userProgress?.currentRank.careerStage.skills && userProgress.currentRank.careerStage.skills.length > 0 ? (
              userProgress.currentRank.careerStage.skills.map((skill, index) => (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No skills acquired yet</Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Learning Progress</Text>
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Current Course</Text>
          <Text style={styles.progressSubtitle}>{currentCourse.courseTitle}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${currentCourse.progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{currentCourse.progress}% Complete</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsCard}>
          {achievements.length > 0 ? (
            achievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementItem}>
                <Text style={styles.achievementTitle}>{achievement.achievement.name}</Text>
                <Text style={styles.achievementDescription}>{achievement.achievement.description}</Text>
                <Text style={styles.achievementDate}>
                  Earned on {new Date(achievement.earnedAt).toLocaleDateString()}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Complete courses to earn achievements!</Text>
          )}
        </View>
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
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.inverse,
  },
  rankTitle: {
    fontSize: 18,
    color: colors.text.inverse,
    opacity: 0.9,
    marginTop: 4,
  },
  signOutButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  signOutText: {
    color: colors.text.inverse,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    margin: 4,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.text.primary,
  },
  careerCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  careerStage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  salarySalary: {
    fontSize: 16,
    color: colors.secondary,
    marginTop: 4,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
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
  progressCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  progressSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.progress.background,
    borderRadius: 4,
    marginVertical: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.progress.fill,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  achievementsCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  achievementItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.progress.background,
    paddingVertical: 12,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  achievementDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  achievementDate: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
});