import { useState, useEffect, useCallback } from 'react';
import { ProgressService, UserProgress } from '../services/ProgressService';
import { Rank, Course, CourseLevel } from '../types/ranks';
import { useAuth } from '../contexts/AuthContext';

export const useProgress = () => {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const progressService = new ProgressService();

  // Load user progress when user changes
  useEffect(() => {
    const loadUserProgress = async () => {
      if (!user) {
        setUserProgress(null);
        setCompletedLevels([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Load user progress
        const { progress } = await progressService.getUserProgress(user.id);
        setUserProgress(progress);

        // Load completed levels
        const { levelIds } = await progressService.getCompletedLevels(user.id);
        setCompletedLevels(levelIds);
      } catch (error) {
        console.error('Error loading user progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProgress();
  }, [user]);

  const getRankProgress = useCallback(async () => {
    if (!user) {
      return {
        currentRank: {
          id: 1,
          name: 'Novice',
          level: 1,
          description: 'Beginning your coding journey',
          requiredPoints: 0,
          imageUrl: '',
          careerStage: {
            skills: [],
            title: 'Novice Developer',
            roles: [],
            responsibilities: [],
            salaryRange: ''
          }
        },
        nextRank: null,
        progress: 0
      };
    }

    return progressService.calculateRankProgress(user.id);
  }, [user]);

  const getCourseProgress = useCallback(async (courseId: number) => {
    if (!user) {
      return { course: null, progress: 0, currentLevel: null, nextLevel: null };
    }

    return progressService.calculateCourseProgress(user.id, courseId);
  }, [user]);

  const completeLevel = useCallback(async (levelId: number) => {
    if (!user) {
      return { success: false, pointsEarned: 0, error: new Error('User not authenticated') };
    }

    const result = await progressService.completeLevel(user.id, levelId);

    if (result.success) {
      // Reload user progress
      const { progress } = await progressService.getUserProgress(user.id);
      setUserProgress(progress);

      // Update completed levels
      const { levelIds } = await progressService.getCompletedLevels(user.id);
      setCompletedLevels(levelIds);
    }

    return result;
  }, [user]);

  const isLevelUnlocked = useCallback(async (levelId: number) => {
    if (!user) {
      return false;
    }

    return progressService.isLevelUnlocked(user.id, levelId);
  }, [user]);

  const getCareerRecommendations = useCallback(async () => {
    if (!user) {
      return [];
    }

    return progressService.getCareerRecommendations(user.id);
  }, [user]);

  const getRequiredSkillsForNextRank = useCallback(async () => {
    if (!user) {
      return [];
    }

    return progressService.getRequiredSkillsForNextRank(user.id);
  }, [user]);

  const updateProgress = useCallback(async (updates: {
    totalPoints?: number;
    leetcodeSolved?: number;
    githubCommits?: number;
  }) => {
    if (!user) {
      return { success: false, error: new Error('User not authenticated') };
    }

    const result = await progressService.updateUserProgress(user.id, updates);

    if (result.success) {
      // Reload user progress
      const { progress } = await progressService.getUserProgress(user.id);
      setUserProgress(progress);
    }

    return result;
  }, [user]);

  return {
    userProgress,
    loading,
    completedLevels,
    getRankProgress,
    getCourseProgress,
    completeLevel,
    isLevelUnlocked,
    getCareerRecommendations,
    getRequiredSkillsForNextRank,
    updateProgress
  };
};