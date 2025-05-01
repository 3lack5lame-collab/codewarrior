import { useState, useEffect, useCallback } from 'react';
import { useProgressContext } from '../contexts/ProgressContext';
import { AchievementService, Achievement } from '../services/AchievementService';

export const useAchievements = () => {
  const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>([]);
  const [pendingAchievements, setPendingAchievements] = useState<Achievement[]>([]);
  const { points: totalPoints, completedLevels, getRankProgress } = useProgressContext();
  
  const achievementService = new AchievementService();

  useEffect(() => {
    const { currentRank } = getRankProgress();
    // This would come from a real backend in production
    const mockAcquiredSkills = completedLevels.map(level => `Skill_${level}`);

    const earned = achievementService.checkAchievements({
      completedLevels,
      currentRank,
      totalPoints,
      acquiredSkills: mockAcquiredSkills
    });

    const pending = achievementService.getNextAchievements({
      completedLevels,
      currentRank,
      totalPoints,
      acquiredSkills: mockAcquiredSkills
    });

    setEarnedAchievements(earned);
    setPendingAchievements(pending);
  }, [completedLevels, totalPoints]);

  const getAchievementProgress = useCallback((achievement: Achievement) => {
    const { currentRank } = getRankProgress();
    // This would come from a real backend in production
    const mockAcquiredSkills = completedLevels.map(level => `Skill_${level}`);

    return achievementService.getAchievementProgress(achievement, {
      completedLevels,
      currentRank,
      totalPoints,
      acquiredSkills: mockAcquiredSkills
    });
  }, [completedLevels, totalPoints]);

  return {
    earnedAchievements,
    pendingAchievements,
    getAchievementProgress
  };
};