import { supabase } from '../lib/supabase';
import { Rank } from '../types/ranks';

export interface Achievement {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  requirements: {
    points?: number;
    courseLevels?: string[];
    rank?: string;
    skills?: string[];
  };
}

export interface UserAchievement {
  id: string;
  achievementId: number;
  userId: string;
  earnedAt: string;
  achievement: Achievement;
}

export class AchievementService {
  /**
   * Get all achievements
   */
  async getAllAchievements(): Promise<{ achievements: Achievement[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*');

      if (error) {
        throw error;
      }

      const achievements: Achievement[] = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        imageUrl: item.image_url || '',
        requirements: {
          points: item.required_points,
          rank: item.required_rank_id ? String(item.required_rank_id) : undefined,
          skills: item.required_skills
        }
      }));

      return { achievements, error: null };
    } catch (error) {
      console.error('Get all achievements error:', error);
      return { achievements: [], error: error as Error };
    }
  }

  /**
   * Get user achievements
   */
  async getUserAchievements(userId: string): Promise<{ achievements: UserAchievement[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          id,
          achievement_id,
          user_id,
          earned_at,
          achievements (
            id,
            name,
            description,
            image_url,
            required_points,
            required_rank_id,
            required_skills
          )
        `)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      const achievements: UserAchievement[] = data.map(item => ({
        id: item.id,
        achievementId: item.achievement_id,
        userId: item.user_id,
        earnedAt: item.earned_at,
        achievement: {
          id: item.achievements.id,
          name: item.achievements.name,
          description: item.achievements.description,
          imageUrl: item.achievements.image_url || '',
          requirements: {
            points: item.achievements.required_points,
            rank: item.achievements.required_rank_id ? String(item.achievements.required_rank_id) : undefined,
            skills: item.achievements.required_skills
          }
        }
      }));

      return { achievements, error: null };
    } catch (error) {
      console.error('Get user achievements error:', error);
      return { achievements: [], error: error as Error };
    }
  }

  /**
   * Check for new achievements
   */
  async checkAchievements(params: {
    userId: string;
    completedLevels: number[];
    currentRank: Rank;
    totalPoints: number;
    acquiredSkills: string[];
  }): Promise<{ newAchievements: Achievement[]; error: Error | null }> {
    try {
      const { userId, completedLevels, currentRank, totalPoints, acquiredSkills } = params;

      // Get all achievements
      const { achievements, error: achievementsError } = await this.getAllAchievements();
      if (achievementsError) {
        throw achievementsError;
      }

      // Get user's existing achievements
      const { achievements: userAchievements, error: userAchievementsError } = await this.getUserAchievements(userId);
      if (userAchievementsError) {
        throw userAchievementsError;
      }

      // Find achievements that the user qualifies for but hasn't earned yet
      const earnedAchievementIds = userAchievements.map(ua => ua.achievementId);
      const newAchievements = achievements.filter(achievement => {
        // Skip if already earned
        if (earnedAchievementIds.includes(achievement.id)) {
          return false;
        }

        const reqs = achievement.requirements;
        
        // Check points requirement
        if (reqs.points && totalPoints < reqs.points) {
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

      // Award new achievements
      for (const achievement of newAchievements) {
        await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
            earned_at: new Date().toISOString()
          });
      }

      return { newAchievements, error: null };
    } catch (error) {
      console.error('Check achievements error:', error);
      return { newAchievements: [], error: error as Error };
    }
  }

  /**
   * Get achievement progress
   */
  getAchievementProgress(
    achievement: Achievement,
    params: {
      completedLevels: number[];
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

    if (reqs.rank) {
      progress += params.currentRank.name === reqs.rank ? 1 : 0;
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
