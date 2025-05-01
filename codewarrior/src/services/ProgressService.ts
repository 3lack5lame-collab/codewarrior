import { supabase } from '../lib/supabase';
import { Rank, Course, CourseLevel } from '../types/ranks';

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

      // Get user skills for career stage
      const { data: skillsData, error: skillsError } = await supabase
        .from('user_skills')
        .select('skills (name)')
        .eq('user_id', userId);

      if (skillsError) {
        throw skillsError;
      }

      const skills = skillsData.map(item => item.skills.name);

      const progress: UserProgress = {
        userId,
        currentRank: {
          id: rankData.id,
          name: rankData.name,
          level: rankData.level,
          description: rankData.description,
          requiredPoints: rankData.required_points,
          imageUrl: rankData.image_url,
          careerStage: {
            skills: skills,
            title: `${rankData.name} Developer`,
            roles: [],
            responsibilities: [],
            salaryRange: ''
          }
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
   * Calculate rank progress
   */
  async calculateRankProgress(userId: string): Promise<{
    currentRank: Rank;
    nextRank: Rank | null;
    progress: number;
  }> {
    try {
      // Get user progress
      const { progress, error } = await this.getUserProgress(userId);

      if (error) {
        throw error;
      }

      if (!progress) {
        throw new Error('User progress not found');
      }

      // Get all ranks
      const { data: ranksData, error: ranksError } = await supabase
        .from('ranks')
        .select('*')
        .order('level', { ascending: true });

      if (ranksError) {
        throw ranksError;
      }

      const currentRank = progress.currentRank;
      const currentRankIndex = ranksData.findIndex(r => r.id === currentRank.id);
      const nextRank = currentRankIndex < ranksData.length - 1 ? {
        id: ranksData[currentRankIndex + 1].id,
        name: ranksData[currentRankIndex + 1].name,
        level: ranksData[currentRankIndex + 1].level,
        description: ranksData[currentRankIndex + 1].description,
        requiredPoints: ranksData[currentRankIndex + 1].required_points,
        imageUrl: ranksData[currentRankIndex + 1].image_url,
        careerStage: {
          skills: [],
          title: `${ranksData[currentRankIndex + 1].name} Developer`,
          roles: [],
          responsibilities: [],
          salaryRange: ''
        }
      } : null;

      let progressPercentage = 0;
      if (nextRank) {
        const pointsForCurrentLevel = progress.totalPoints - currentRank.requiredPoints;
        const pointsNeededForNextRank = nextRank.requiredPoints - currentRank.requiredPoints;
        progressPercentage = (pointsForCurrentLevel / pointsNeededForNextRank) * 100;
      }

      return {
        currentRank,
        nextRank,
        progress: Math.min(Math.max(progressPercentage, 0), 100)
      };
    } catch (error) {
      console.error('Calculate rank progress error:', error);
      // Return default values in case of error
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
   * Calculate course progress
   */
  async calculateCourseProgress(userId: string, courseId: number): Promise<{
    course: Course | null;
    progress: number;
    currentLevel: CourseLevel | null;
    nextLevel: CourseLevel | null;
  }> {
    try {
      // Get course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) {
        throw courseError;
      }

      if (!courseData) {
        return { course: null, progress: 0, currentLevel: null, nextLevel: null };
      }

      // Get levels for the course
      const { data: levelsData, error: levelsError } = await supabase
        .from('levels')
        .select('*')
        .eq('course_id', courseId)
        .order('level_number', { ascending: true });

      if (levelsError) {
        throw levelsError;
      }

      // Get completed levels for the user
      const { data: completedData, error: completedError } = await supabase
        .from('completed_levels')
        .select('level_id')
        .eq('user_id', userId);

      if (completedError) {
        throw completedError;
      }

      const completedLevelIds = completedData.map(item => item.level_id);

      // Calculate progress
      const totalLevels = levelsData.length;
      const completedCount = completedLevelIds.length;
      const progressPercentage = totalLevels > 0 ? (completedCount / totalLevels) * 100 : 0;

      // Find current and next levels
      const courseLevels = levelsData.map(level => ({
        id: level.id,
        courseId: level.course_id,
        levelNumber: level.level_number,
        title: level.title,
        description: level.description,
        points: level.points
      }));

      // Find the first uncompleted level
      const currentLevel = courseLevels.find(level => !completedLevelIds.includes(level.id)) || null;

      // Find the next level after the current one
      const nextLevel = currentLevel
        ? courseLevels.find(level => level.levelNumber > currentLevel.levelNumber) || null
        : null;

      const course: Course = {
        id: courseData.id,
        code: courseData.code,
        title: courseData.title,
        description: courseData.description,
        minRankId: courseData.min_rank_id,
        imageUrl: courseData.image_url || '',
        levels: courseLevels
      };

      return {
        course,
        progress: Math.min(Math.max(progressPercentage, 0), 100),
        currentLevel,
        nextLevel
      };
    } catch (error) {
      console.error('Calculate course progress error:', error);
      return { course: null, progress: 0, currentLevel: null, nextLevel: null };
    }
  }

  /**
   * Check if a level is unlocked
   */
  async isLevelUnlocked(userId: string, levelId: number): Promise<boolean> {
    try {
      // Get the level
      const { data: levelData, error: levelError } = await supabase
        .from('levels')
        .select('course_id, level_number')
        .eq('id', levelId)
        .single();

      if (levelError) {
        throw levelError;
      }

      // If it's the first level, it's always unlocked
      if (levelData.level_number === 1) {
        return true;
      }

      // Get the previous level in the same course
      const { data: previousLevelData, error: previousLevelError } = await supabase
        .from('levels')
        .select('id')
        .eq('course_id', levelData.course_id)
        .eq('level_number', levelData.level_number - 1)
        .single();

      if (previousLevelError) {
        throw previousLevelError;
      }

      // Check if the previous level is completed
      const { data: completedData, error: completedError } = await supabase
        .from('completed_levels')
        .select('id')
        .eq('user_id', userId)
        .eq('level_id', previousLevelData.id)
        .maybeSingle();

      if (completedError) {
        throw completedError;
      }

      return !!completedData;
    } catch (error) {
      console.error('Is level unlocked error:', error);
      return false;
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
   * Get career recommendations
   */
  async getCareerRecommendations(userId: string): Promise<string[]> {
    try {
      // Get user's current rank
      const { progress, error } = await this.getUserProgress(userId);

      if (error || !progress) {
        return [];
      }

      // Get career paths for the user's rank
      const { data: careerData, error: careerError } = await supabase
        .from('career_paths')
        .select('title')
        .lte('min_rank_id', progress.currentRank.id);

      if (careerError) {
        throw careerError;
      }

      return careerData.map(career => career.title);
    } catch (error) {
      console.error('Get career recommendations error:', error);
      return [];
    }
  }

  /**
   * Get required skills for next rank
   */
  async getRequiredSkillsForNextRank(userId: string): Promise<string[]> {
    try {
      // Get user's current rank
      const { progress, error } = await this.getUserProgress(userId);

      if (error || !progress) {
        return [];
      }

      // Get next rank
      const { data: nextRankData, error: nextRankError } = await supabase
        .from('ranks')
        .select('id')
        .gt('level', progress.currentRank.level)
        .order('level', { ascending: true })
        .limit(1)
        .single();

      if (nextRankError) {
        return [];
      }

      // Get skills required for career paths at the next rank
      const { data: careerData, error: careerError } = await supabase
        .from('career_paths')
        .select('required_skills')
        .eq('min_rank_id', nextRankData.id);

      if (careerError) {
        throw careerError;
      }

      // Flatten and deduplicate skills
      const skills = careerData.flatMap(career => career.required_skills);
      return [...new Set(skills)];
    } catch (error) {
      console.error('Get required skills for next rank error:', error);
      return [];
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
      if (updates.totalPoints !== undefined) {
        await this.checkAndUpdateRank(userId);
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Update user progress error:', error);
      return { success: false, error: error as Error };
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