import React, { createContext, useContext } from 'react';
import { useProgress } from '../hooks/useProgress';

// Define the type explicitly
type ProgressContextType = {
  userProgress: any;
  loading: boolean;
  completedLevels: number[];
  getRankProgress: () => Promise<any>;
  getCourseProgress: (courseId: number) => Promise<any>;
  completeLevel: (levelId: number) => Promise<any>;
  isLevelUnlocked: (levelId: number) => Promise<boolean>;
  getCareerRecommendations: () => Promise<string[]>;
  getRequiredSkillsForNextRank: () => Promise<string[]>;
  updateProgress: (updates: any) => Promise<any>;
};

// Create context without type arguments
const ProgressContext = createContext(undefined as unknown as ProgressContextType);

export const ProgressProvider = ({ children }: { children: any }) => {
  const progress = useProgress();

  return (
    <ProgressContext.Provider value={progress}>
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