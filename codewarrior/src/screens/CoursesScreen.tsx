import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { CourseService } from '../services/CourseService';
import { useProgressContext } from '../contexts/ProgressContext';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../constants/theme';
import { Course, CourseLevel } from '../types/ranks';

export const CoursesScreen = () => {
  const { user } = useAuth();
  const { userProgress, loading: progressLoading, completeLevel } = useProgressContext();
  const [courses, setCourses] = useState<Course[]>([]);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const courseService = new CourseService();

  useEffect(() => {
    const loadCourses = async () => {
      if (!user || progressLoading) return;

      setLoading(true);
      try {
        // Get courses for the user's rank
        const rankId = userProgress?.currentRank.id || 1;
        const { courses: availableCourses } = await courseService.getCoursesForRank(rankId);

        // Get course details for each course
        const coursesWithDetails = await Promise.all(
          availableCourses.map(async (course) => {
            const { course: courseDetails } = await courseService.getCourseById(course.id);
            return courseDetails || course;
          })
        );

        setCourses(coursesWithDetails.filter(Boolean) as Course[]);

        // Get completed levels
        const { completedLevels: userCompletedLevels } = await courseService.getUserCourseProgress(user.id);
        setCompletedLevels(userCompletedLevels);
      } catch (error) {
        console.error('Error loading courses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [user, userProgress, progressLoading]);

  const handleStartLevel = async (levelId: number) => {
    if (!user) {
      Alert.alert('Error', 'You need to be logged in to start a level');
      return;
    }

    try {
      // Check if level is already completed
      if (completedLevels.includes(levelId)) {
        Alert.alert('Level Completed', 'You have already completed this level');
        return;
      }

      // Complete the level (in a real app, this would happen after the user completes the level content)
      const result = await completeLevel(levelId);

      if (result.success) {
        Alert.alert('Level Completed', `Congratulations! You earned ${result.pointsEarned} points.`);
        // Update completed levels
        setCompletedLevels(prev => [...prev, levelId]);
      } else {
        Alert.alert('Error', result.error?.message || 'Failed to complete level');
      }
    } catch (error) {
      console.error('Error starting level:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const isLevelUnlocked = (course: Course, levelNumber: number) => {
    if (levelNumber === 1) return true;

    const previousLevel = course.levels.find(l => l.levelNumber === levelNumber - 1);
    return previousLevel ? completedLevels.includes(previousLevel.id) : false;
  };

  const renderCourseLevel = (level: CourseLevel, course: Course) => {
    const isCompleted = completedLevels.includes(level.id);
    const unlocked = isLevelUnlocked(course, level.levelNumber);

    return (
      <View key={level.id} style={[
        styles.levelCard,
        isCompleted && styles.completedLevelCard,
        !unlocked && styles.lockedLevelCard
      ]}>
        <Text style={styles.levelName}>{level.title}</Text>
        <Text style={styles.levelDescription}>{level.description}</Text>
        <View style={styles.levelFooter}>
          <Text style={styles.pointsText}>{level.points} Points</Text>
          {isCompleted ? (
            <View style={styles.completedButton}>
              <Text style={styles.completedButtonText}>Completed</Text>
            </View>
          ) : unlocked ? (
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => handleStartLevel(level.id)}
            >
              <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.lockedButton}>
              <Text style={styles.lockedButtonText}>Locked</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading courses...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {courses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No courses available for your current rank.</Text>
          <Text style={styles.emptySubtext}>Complete challenges to rank up and unlock more courses!</Text>
        </View>
      ) : (
        courses.map((course) => (
          <View key={course.id} style={styles.courseSection}>
            <View style={styles.courseHeader}>
              <Text style={styles.courseCode}>{course.code}</Text>
              <Text style={styles.courseName}>{course.title}</Text>
              <Text style={styles.courseDescription}>{course.description}</Text>
            </View>

            <View style={styles.levelsContainer}>
              {course.levels.map(level => renderCourseLevel(level, course))}
            </View>
          </View>
        ))
      )}
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 64,
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
  courseSection: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  courseHeader: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
  },
  courseCode: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
  },
  courseName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
    color: colors.text.primary,
  },
  courseDescription: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  prerequisitesCard: {
    backgroundColor: colors.badge.background,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  prerequisitesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text.primary,
  },
  prerequisiteText: {
    fontSize: 14,
    color: colors.text.primary,
    marginVertical: 2,
  },
  levelsContainer: {
    marginTop: 16,
  },
  levelCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    elevation: 2,
  },
  completedLevelCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  lockedLevelCard: {
    opacity: 0.7,
  },
  levelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  levelDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  levelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  pointsText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  startButtonText: {
    color: colors.text.inverse,
    fontWeight: 'bold',
  },
  completedButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    opacity: 0.7,
  },
  completedButtonText: {
    color: colors.text.inverse,
    fontWeight: 'bold',
  },
  lockedButton: {
    backgroundColor: colors.text.disabled,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  lockedButtonText: {
    color: colors.text.inverse,
    fontWeight: 'bold',
  },
  careerPathCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    elevation: 4,
  },
  careerPathTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.text.primary,
  },
  careerItem: {
    marginVertical: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  careerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  careerDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  salarySalary: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '600',
    marginTop: 4,
  },
});