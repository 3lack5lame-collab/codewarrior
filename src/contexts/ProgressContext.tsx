import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProgressService, UserProgress } from '../services/ProgressService';
import { useAuth } from './AuthContext';
import { Rank } from '../types/ranks';

interface ProgressContextType {
  userProgress: UserProgress | null;
  loading: boolean;
  allRanks: Rank[];
  completedLevels: number[];
  updateProgress: (updates: {
    totalPoints?: number;
    leetcodeSolved?: number;
    githubCommits?: number;
  }) => Promise<{ success: boolean; error: Error | null }>;
  completeLevel: (levelId: number) => Promise<{ success: boolean; pointsEarned: number; error: Error | null }>;
  getRankProgress: () => { currentRank: Rank; nextRank: Rank | null; progressPercentage: number };
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [allRanks, setAllRanks] = useState<Rank[]>([]);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const progressService = new ProgressService();

  useEffect(() => {
    // Load all ranks once
    const loadRanks = async () => {
      try {
        const { ranks } = await progressService.getAllRanks();
        setAllRanks(ranks);
      } catch (error) {
        console.error('Error loading ranks:', error);
      }
    };

    loadRanks();
  }, []);

  useEffect(() => {
    // Load user progress when user changes
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

  const updateProgress = async (updates: {
    totalPoints?: number;
    leetcodeSolved?: number;
    githubCommits?: number;
  }) => {
    if (!user || !userProgress) {
      return { success: false, error: new Error('User not authenticated') };
    }

    try {
      const result = await progressService.updateUserProgress(user.id, updates);
      
      if (result.success) {
        // Reload user progress
        const { progress } = await progressService.getUserProgress(user.id);
        setUserProgress(progress);
      }
      
      return result;
    } catch (error) {
      console.error('Error updating progress:', error);
      return { success: false, error: error as Error };
    }
  };

  const completeLevel = async (levelId: number) => {
    if (!user) {
      return { success: false, pointsEarned: 0, error: new Error('User not authenticated') };
    }

    try {
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
    } catch (error) {
      console.error('Error completing level:', error);
      return { success: false, pointsEarned: 0, error: error as Error };
    }
  };

  const getRankProgress = () => {
    if (!userProgress || allRanks.length === 0) {
      // Default to first rank if not loaded yet
      const defaultRank = allRanks[0] || {
        id: 0,
        name: 'Novice',
        level: 1,
        description: '',
        requiredPoints: 0,
        imageUrl: '',
        careerStage: { skills: [] }
      };
      
      return {
        currentRank: defaultRank,
        nextRank: null,
        progressPercentage: 0
      };
    }

    const currentRank = userProgress.currentRank;
    const currentRankIndex = allRanks.findIndex(rank => rank.id === currentRank.id);
    const nextRank = currentRankIndex < allRanks.length - 1 ? allRanks[currentRankIndex + 1] : null;
    
    let progressPercentage = 100; // Default to 100% if at max rank
    
    if (nextRank) {
      const pointsForCurrentRank = currentRank.requiredPoints;
      const pointsForNextRank = nextRank.requiredPoints;
      const pointsNeeded = pointsForNextRank - pointsForCurrentRank;
      const pointsEarned = userProgress.totalPoints - pointsForCurrentRank;
      progressPercentage = Math.min(Math.max(Math.floor((pointsEarned / pointsNeeded) * 100), 0), 100);
    }

    return {
      currentRank,
      nextRank,
      progressPercentage
    };
  };

  return (
    <ProgressContext.Provider
      value={{
        userProgress,
        loading,
        allRanks,
        completedLevels,
        updateProgress,
        completeLevel,
        getRankProgress
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgressContext = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgressContext must be used within a ProgressProvider');
  }
  return context;
};
