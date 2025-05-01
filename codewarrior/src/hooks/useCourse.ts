import { useState, useCallback, useEffect } from 'react';
import { useProgressContext } from '../contexts/ProgressContext';
import { Course, CourseLevel } from '../types/ranks';
import { COURSES } from '../constants/courses';

export const useCourse = (courseId: string) => {
  const [currentLevel, setCurrentLevel] = useState<CourseLevel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { completedLevels, completeLevel, getCourseProgress, isLevelUnlocked } = useProgressContext();

  const course = COURSES.find(c => c.id === courseId);

  useEffect(() => {
    if (course) {
      const { currentLevel: activeLevel } = getCourseProgress(courseId);
      setCurrentLevel(activeLevel);
      setIsLoading(false);
    }
  }, [courseId, completedLevels]);

  const startLevel = useCallback((level: CourseLevel) => {
    if (!isLevelUnlocked(level)) {
      throw new Error('Level is locked');
    }
    setCurrentLevel(level);
  }, [isLevelUnlocked]);

  const finishLevel = useCallback((levelId: string, earnedPoints: number) => {
    completeLevel(levelId, earnedPoints);
    const nextLevel = course?.levels.find(l => !completedLevels.includes(l.id));
    setCurrentLevel(nextLevel || null);
  }, [completeLevel, completedLevels, course]);

  const getLevelProgress = useCallback((levelId: string) => {
    if (completedLevels.includes(levelId)) {
      return 100;
    }
    // Add logic here for tracking partial progress within a level
    return 0;
  }, [completedLevels]);

  return {
    course,
    currentLevel,
    isLoading,
    startLevel,
    finishLevel,
    getLevelProgress,
    isLevelUnlocked
  };
};