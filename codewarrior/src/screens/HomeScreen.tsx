import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useProgressContext } from '../contexts/ProgressContext';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../constants/theme';
import { CourseService } from '../services/CourseService';

export const HomeScreen = () => {
  const { user } = useAuth();
  const { userProgress, loading, getRankProgress } = useProgressContext();
  const [rankProgress, setRankProgress] = useState<{
    currentRank: any;
    nextRank: any | null;
    progress: number;
  } | null>(null);
  const [courseProgress, setCourseProgress] = useState<{
    course: any | null;
    progress: number;
    currentLevel: any | null;
  } | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const courseService = new CourseService();

  useEffect(() => {
    const loadData = async () => {
      if (loading || !user) return;

      setLoadingData(true);
      try {
        // Get rank progress
        const rankData = await getRankProgress();
        setRankProgress(rankData);

        // Get available courses for the user's rank
        const { courses } = await courseService.getCoursesForRank(rankData.currentRank.id);

        if (courses.length > 0) {
          // Get the first course with details
          const { course } = await courseService.getCourseById(courses[0].id);

          // Get user's course progress
          const { courseProgress: userCourseProgress } = await courseService.getUserCourseProgress(user.id);

          if (course) {
            setCourseProgress({
              course,
              progress: userCourseProgress[course.id] || 0,
              currentLevel: course.levels[0] || null
            });
          }
        } else {
          // No courses available, use default data
          setCourseProgress({
            course: {
              title: 'Introduction to Programming',
              description: 'Learn the basics of programming with Python'
            },
            progress: 0,
            currentLevel: null
          });
        }
      } catch (error) {
        console.error('Error loading home data:', error);
        // Use default data in case of error
        setCourseProgress({
          course: {
            title: 'Introduction to Programming',
            description: 'Learn the basics of programming with Python'
          },
          progress: 0,
          currentLevel: null
        });
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [loading, userProgress, user]);

  if (loading || loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {user?.username || 'Warrior'}!</Text>
        <Text style={styles.subtitle}>Your journey to mastery continues</Text>
      </View>

      {rankProgress && (
        <View style={styles.rankCard}>
          <Text style={styles.cardTitle}>Current Rank</Text>
          <Text style={styles.rankName}>{rankProgress.currentRank.name}</Text>
          <Text style={styles.rankInfo}>Level {rankProgress.currentRank.level}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${rankProgress.progress}%` }]} />
          </View>
          {rankProgress.nextRank && (
            <Text style={styles.nextRank}>Next: {rankProgress.nextRank.name}</Text>
          )}
        </View>
      )}

      {courseProgress && courseProgress.course && (
        <View style={styles.courseCard}>
          <Text style={styles.cardTitle}>Current Course</Text>
          <Text style={styles.courseName}>{courseProgress.course.title}</Text>
          <Text style={styles.courseInfo}>{courseProgress.course.description}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${courseProgress.progress}%` }]} />
          </View>
        </View>
      )}

      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Your Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userProgress?.totalPoints || 0}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userProgress?.leetcodeSolved || 0}</Text>
            <Text style={styles.statLabel}>LeetCode</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userProgress?.githubCommits || 0}</Text>
            <Text style={styles.statLabel}>GitHub</Text>
          </View>
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
    padding: 20,
    backgroundColor: colors.primary,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.inverse,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.inverse,
    opacity: 0.8,
  },
  rankCard: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.text.primary,
  },
  rankName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  rankInfo: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  nextRank: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 8,
  },
  courseCard: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    elevation: 4,
  },
  courseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  courseInfo: {
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
  statsCard: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    elevation: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
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
});