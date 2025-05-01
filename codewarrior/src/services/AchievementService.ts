import { Badge, CourseLevel, Rank } from '../types/ranks';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  requirements: {
    points?: number;
    courseLevels?: string[];
    rank?: string;
    skills?: string[];
  };
}

export class AchievementService {
  private readonly achievements: Achievement[] = [
    {
      id: 'first-steps',
      name: 'First Steps',
      description: 'Complete your first programming lesson',
      requirements: {
        courseLevels: ['cs101-1']
      }
    },
    {
      id: 'quick-learner',
      name: 'Quick Learner',
      description: 'Complete 5 levels in record time',
      requirements: {
        points: 500
      }
    },
    {
      id: 'code-warrior',
      name: 'Code Warrior',
      description: 'Reach Journeyman rank',
      requirements: {
        rank: 'Journeyman'
      }
    },
    {
      id: 'skill-master',
      name: 'Skill Master',
      description: 'Master all fundamental programming skills',
      requirements: {
        skills: ['Programming Basics', 'Problem Solving', 'Data Structures']
      }
    }
  ];

  checkAchievements(params: {
    completedLevels: string[];
    currentRank: Rank;
    totalPoints: number;
    acquiredSkills: string[];
  }): Achievement[] {
    const { completedLevels, currentRank, totalPoints, acquiredSkills } = params;
    
    return this.achievements.filter(achievement => {
      const reqs = achievement.requirements;
      
      // Check points requirement
      if (reqs.points && totalPoints < reqs.points) {
        return false;
      }

      // Check course levels requirement
      if (reqs.courseLevels && 
          !reqs.courseLevels.every(level => completedLevels.includes(level))) {
        return false;
      }

      // Check rank requirement
      if (reqs.rank && currentRank.name !== reqs.rank) {
        return false;
      }

      // Check skills requirement
      if (reqs.skills && 
          !reqs.skills.every(skill => acquiredSkills.includes(skill))) {
        return false;
      }

      return true;
    });
  }

  getNextAchievements(params: {
    completedLevels: string[];
    currentRank: Rank;
    totalPoints: number;
    acquiredSkills: string[];
  }): Achievement[] {
    const earnedAchievements = this.checkAchievements(params);
    return this.achievements.filter(
      achievement => !earnedAchievements.some(
        earned => earned.id === achievement.id
      )
    );
  }

  getAchievementProgress(
    achievement: Achievement,
    params: {
      completedLevels: string[];
      currentRank: Rank;
      totalPoints: number;
      acquiredSkills: string[];
    }
  ): number {
    const reqs = achievement.requirements;
    let progress = 0;
    let total = 0;

    if (reqs.points) {
      progress += Math.min(params.totalPoints / reqs.points, 1);
      total += 1;
    }

    if (reqs.courseLevels) {
      const completedCount = reqs.courseLevels.filter(
        level => params.completedLevels.includes(level)
      ).length;
      progress += completedCount / reqs.courseLevels.length;
      total += 1;
    }

    if (reqs.skills) {
      const acquiredCount = reqs.skills.filter(
        skill => params.acquiredSkills.includes(skill)
      ).length;
      progress += acquiredCount / reqs.skills.length;
      total += 1;
    }

    return total > 0 ? (progress / total) * 100 : 0;
  }
}