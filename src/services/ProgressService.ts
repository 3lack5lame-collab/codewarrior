import { supabase } from '../lib/supabase';
import { Rank } from '../types/ranks';

export interface UserProgress {
  userId: string;
  currentRank: Rank;
  totalPoints: number;
  leetcodeSolved: number;
  githubCommits: number;
}

export class ProgressService {
  /**
   * Get user progress
   */
  async getUserProgress(userId: string): Promise<{ progress: UserProgress | null; error: Error | null }> {
    try {
      // Get user progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('current_rank_id, total_points, leetcode_solved, github_commits')
        .eq('user_id', userId)
        .single();

      if (progressError) {
        throw progressError;
      }

      if (!progressData) {
        return { progress: null, error: null };
      }

      // Get rank details
      const { data: rankData, error: rankError } = await supabase
        .from('ranks')
        .select('*')
        .eq('id', progressData.current_rank_id)
        .single();

      if (rankError) {
        throw rankError;
      }

      const progress: UserProgress = {
        userId,
        currentRank: {
          id: rankData.id,
          name: rankData.name,
          level: rankData.level,
          description: rankData.description,
          requiredPoints: rankData.required_points,
          imageUrl: rankData.image_url,
          careerStage: { skills: [] } // This would be populated from another query if needed
        },
        totalPoints: progressData.total_points,
        leetcodeSolved: progressData.leetcode_solved,
        githubCommits: progressData.github_commits
      };

      return { progress, error: null };
    } catch (error) {
      console.error('Get user progress error:', error);
      return { progress: null, error: error as Error };
    }
  }

  /**
   * Update user progress
   */
  async updateUserProgress(userId: string, updates: {
    totalPoints?: number;
    leetcodeSolved?: number;
    githubCommits?: number;
  }): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('user_progress')
        .update({
          ...(updates.totalPoints !== undefined && { total_points: updates.totalPoints }),
          ...(updates.leetcodeSolved !== undefined && { leetcode_solved: updates.leetcodeSolved }),
          ...(updates.githubCommits !== undefined && { github_commits: updates.githubCommits }),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      // Check if rank should be updated based on points
      await this.checkAndUpdateRank(userId);

      return { success: true, error: null };
    } catch (error) {
      console.error('Update user progress error:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Complete a level
   */
  async completeLevel(userId: string, levelId: number): Promise<{ success: boolean; pointsEarned: number; error: Error | null }> {
    try {
      // Check if level already completed
      const { data: existingData, error: existingError } = await supabase
        .from('completed_levels')
        .select('id')
        .eq('user_id', userId)
        .eq('level_id', levelId)
        .maybeSingle();

      if (existingError) {
        throw existingError;
      }

      // If already completed, return early
      if (existingData) {
        return { success: true, pointsEarned: 0, error: null };
      }

      // Get level points
      const { data: levelData, error: levelError } = await supabase
        .from('levels')
        .select('points')
        .eq('id', levelId)
        .single();

      if (levelError) {
        throw levelError;
      }

      const pointsEarned = levelData.points;

      // Begin transaction
      // 1. Insert completed level
      const { error: insertError } = await supabase
        .from('completed_levels')
        .insert({
          user_id: userId,
          level_id: levelId
        });

      if (insertError) {
        throw insertError;
      }

      // 2. Update user points
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('total_points')
        .eq('user_id', userId)
        .single();

      if (progressError) {
        throw progressError;
      }

      const newTotalPoints = progressData.total_points + pointsEarned;

      const { error: updateError } = await supabase
        .from('user_progress')
        .update({
          total_points: newTotalPoints,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }

      // Check if rank should be updated
      await this.checkAndUpdateRank(userId);

      return { success: true, pointsEarned, error: null };
    } catch (error) {
      console.error('Complete level error:', error);
      return { success: false, pointsEarned: 0, error: error as Error };
    }
  }

  /**
   * Get all ranks
   */
  async getAllRanks(): Promise<{ ranks: Rank[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('ranks')
        .select('*')
        .order('level', { ascending: true });

      if (error) {
        throw error;
      }

      const ranks: Rank[] = data.map(rank => ({
        id: rank.id,
        name: rank.name,
        level: rank.level,
        description: rank.description,
        requiredPoints: rank.required_points,
        imageUrl: rank.image_url,
        careerStage: { skills: [] } // This would be populated from another query if needed
      }));

      return { ranks, error: null };
    } catch (error) {
      console.error('Get all ranks error:', error);
      return { ranks: [], error: error as Error };
    }
  }

  /**
   * Get completed levels for a user
   */
  async getCompletedLevels(userId: string): Promise<{ levelIds: number[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('completed_levels')
        .select('level_id')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      const levelIds = data.map(item => item.level_id);
      return { levelIds, error: null };
    } catch (error) {
      console.error('Get completed levels error:', error);
      return { levelIds: [], error: error as Error };
    }
  }

  /**
   * Check and update rank based on points
   * @private
   */
  private async checkAndUpdateRank(userId: string): Promise<void> {
    try {
      // Get current progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('total_points, current_rank_id')
        .eq('user_id', userId)
        .single();

      if (progressError) {
        throw progressError;
      }

      // Get next rank based on points
      const { data: rankData, error: rankError } = await supabase
        .from('ranks')
        .select('id')
        .lte('required_points', progressData.total_points)
        .order('required_points', { ascending: false })
        .limit(1)
        .single();

      if (rankError) {
        throw rankError;
      }

      // If rank has changed, update it
      if (rankData.id !== progressData.current_rank_id) {
        await supabase
          .from('user_progress')
          .update({
            current_rank_id: rankData.id,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      }
    } catch (error) {
      console.error('Check and update rank error:', error);
    }
  }
}
