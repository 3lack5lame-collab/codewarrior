import { useState, useEffect, useCallback } from 'react';
import { useProgressContext } from '../contexts/ProgressContext';
import { CareerService } from '../services/CareerService';
import { CareerPath } from '../types/ranks';

export const useCareer = () => {
  const [careerRecommendations, setCareerRecommendations] = useState<Array<CareerPath & { matchPercentage: number }>>([]);
  const [selectedCareer, setSelectedCareer] = useState<CareerPath | null>(null);
  const { completedLevels, getRankProgress } = useProgressContext();
  
  const careerService = new CareerService();

  useEffect(() => {
    const { currentRank } = getRankProgress();
    // In a real app, we'd fetch career paths from an API
    const mockCareerPaths: CareerPath[] = [
      {
        title: 'Frontend Developer',
        description: 'Specialize in building user interfaces and web applications',
        requiredSkills: ['JavaScript', 'React', 'HTML/CSS'],
        potentialRoles: ['UI Developer', 'Frontend Engineer'],
        averageSalary: '$70,000 - $120,000',
        industryDemand: 'High'
      },
      {
        title: 'Backend Developer',
        description: 'Focus on server-side logic and database management',
        requiredSkills: ['Node.js', 'Databases', 'API Design'],
        potentialRoles: ['Backend Engineer', 'API Developer'],
        averageSalary: '$80,000 - $130,000',
        industryDemand: 'High'
      }
    ];

    const recommendations = careerService.getCareerRecommendations(
      currentRank,
      mockCareerPaths,
      completedLevels
    );

    setCareerRecommendations(recommendations);
  }, [completedLevels]);

  const getSkillGaps = useCallback((career: CareerPath) => {
    const { currentRank } = getRankProgress();
    return careerService.getRequiredSkillGaps(
      currentRank.careerStage.skills,
      career
    );
  }, [completedLevels]);

  const getSalaryProjection = useCallback((career: CareerPath) => {
    const { currentRank } = getRankProgress();
    const skillMatch = careerService.getRequiredSkillGaps(
      currentRank.careerStage.skills,
      career
    ).reduce((acc, curr) => acc + curr.weight, 0) / career.requiredSkills.length;

    return careerService.getSalaryProjection(
      currentRank,
      career,
      skillMatch
    );
  }, [completedLevels]);

  const getNextSteps = useCallback((career: CareerPath) => {
    const { currentRank } = getRankProgress();
    return careerService.getNextCareerSteps(currentRank, career);
  }, [completedLevels]);

  return {
    careerRecommendations,
    selectedCareer,
    setSelectedCareer,
    getSkillGaps,
    getSalaryProjection,
    getNextSteps
  };
};