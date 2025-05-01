import { supabase } from '../lib/supabase';
import { Badge } from '../types/ranks';

export interface UserProfile {
  id: string;
  username: string;
  avatarUrl: string | null;
  email: string;
}

export interface UserAchievement {
  id: string;
  achievementId: number;
  userId: string;
  earnedAt: string;
  achievement: {
    id: number;
    name: string;
    description: string;
    imageUrl: string | null;
  };
}

export class ProfileService {
  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<{ profile: UserProfile | null; error: Error | null }> {
    try {
      // Get user profile
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        return { profile: null, error: null };
      }

      // Get user email
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw userError;
      }

      const profile: UserProfile = {
        id: data.id,
        username: data.username,
        avatarUrl: data.avatar_url,
        email: userData.user?.email || ''
      };

      return { profile, error: null };
    } catch (error) {
      console.error('Get user profile error:', error);
      return { profile: null, error: error as Error };
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: { username?: string; avatarUrl?: string }): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...(updates.username && { username: updates.username }),
          ...(updates.avatarUrl && { avatar_url: updates.avatarUrl }),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Update user profile error:', error);
      return { success: false, error: error as Error };
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
            image_url
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
          imageUrl: item.achievements.image_url
        }
      }));

      return { achievements, error: null };
    } catch (error) {
      console.error('Get user achievements error:', error);
      return { achievements: [], error: error as Error };
    }
  }

  /**
   * Get user course progress
   */
  async getUserCourseProgress(userId: string): Promise<{ 
    courseProgress: Record<number, { courseTitle: string; progress: number }>;
    error: Error | null 
  }> {
    try {
      // Get completed levels
      const { data: completedData, error: completedError } = await supabase
        .from('completed_levels')
        .select('level_id, levels(course_id)')
        .eq('user_id', userId);

      if (completedError) {
        throw completedError;
      }

      // Get all courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, title');

      if (coursesError) {
        throw coursesError;
      }

      const courseProgress: Record<number, { courseTitle: string; progress: number }> = {};

      // For each course, calculate completion percentage
      for (const course of coursesData) {
        const courseId = course.id;
        
        // Get total levels for this course
        const { data: levelsData, error: levelsError } = await supabase
          .from('levels')
          .select('id')
          .eq('course_id', courseId);

        if (levelsError) {
          throw levelsError;
        }

        const totalLevels = levelsData.length;
        if (totalLevels === 0) {
          courseProgress[courseId] = { courseTitle: course.title, progress: 0 };
          continue;
        }

        // Count completed levels for this course
        const completedForCourse = completedData.filter(
          item => item.levels.course_id === courseId
        ).length;

        // Calculate percentage
        courseProgress[courseId] = {
          courseTitle: course.title,
          progress: Math.floor((completedForCourse / totalLevels) * 100)
        };
      }

      return { courseProgress, error: null };
    } catch (error) {
      console.error('Get user course progress error:', error);
      return { courseProgress: {}, error: error as Error };
    }
  }

  /**
   * Get user stats
   */
  async getUserStats(userId: string): Promise<{ 
    totalPoints: number;
    completedLevels: number;
    achievements: number;
    error: Error | null 
  }> {
    try {
      // Get user progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('total_points')
        .eq('user_id', userId)
        .single();

      if (progressError) {
        throw progressError;
      }

      // Get completed levels count
      const { data: completedData, error: completedError } = await supabase
        .from('completed_levels')
        .select('id', { count: 'exact' })
        .eq('user_id', userId);

      if (completedError) {
        throw completedError;
      }

      // Get achievements count
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('id', { count: 'exact' })
        .eq('user_id', userId);

      if (achievementsError) {
        throw achievementsError;
      }

      return {
        totalPoints: progressData.total_points,
        completedLevels: completedData.length,
        achievements: achievementsData.length,
        error: null
      };
    } catch (error) {
      console.error('Get user stats error:', error);
      return {
        totalPoints: 0,
        completedLevels: 0,
        achievements: 0,
        error: error as Error
      };
    }
  }
}
