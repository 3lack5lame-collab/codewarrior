import { supabase } from '../lib/supabase';
import { Rank, CareerPath } from '../types/ranks';

interface SkillMatch {
  skill: string;
  weight: number;
}

export class CareerService {
  /**
   * Get all career paths
   */
  async getAllCareerPaths(): Promise<{ careerPaths: CareerPath[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('career_paths')
        .select('*');

      if (error) {
        throw error;
      }

      const careerPaths: CareerPath[] = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        requiredSkills: item.required_skills,
        minRankId: item.min_rank_id,
        salaryRange: item.salary_range,
        imageUrl: item.image_url || ''
      }));

      return { careerPaths, error: null };
    } catch (error) {
      console.error('Get all career paths error:', error);
      return { careerPaths: [], error: error as Error };
    }
  }

  /**
   * Get career paths available for a specific rank
   */
  async getCareerPathsForRank(rankId: number): Promise<{ careerPaths: CareerPath[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('career_paths')
        .select('*')
        .lte('min_rank_id', rankId);

      if (error) {
        throw error;
      }

      const careerPaths: CareerPath[] = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        requiredSkills: item.required_skills,
        minRankId: item.min_rank_id,
        salaryRange: item.salary_range,
        imageUrl: item.image_url || ''
      }));

      return { careerPaths, error: null };
    } catch (error) {
      console.error('Get career paths for rank error:', error);
      return { careerPaths: [], error: error as Error };
    }
  }

  /**
   * Calculate skill match between user skills and required skills
   */
  private calculateSkillMatch(userSkills: string[], requiredSkills: string[]): number {
    const matches = requiredSkills.filter(skill => 
      userSkills.includes(skill)
    ).length;
    return (matches / requiredSkills.length) * 100;
  }

  /**
   * Calculate career match percentage
   */
  private calculateCareerMatch(
    currentRank: Rank,
    careerPath: CareerPath,
    completedLevels: number[]
  ): number {
    const skillMatch = this.calculateSkillMatch(
      currentRank.careerStage.skills,
      careerPath.requiredSkills
    );

    // Consider completed levels as additional weight
    const levelWeight = completedLevels.length * 10;
    
    // Consider current rank level as a factor
    const rankWeight = currentRank.level * 5;

    return Math.min((skillMatch + levelWeight + rankWeight) / 3, 100);
  }

  /**
   * Get career recommendations
   */
  async getCareerRecommendations(
    userId: string,
    currentRank: Rank,
    completedLevels: number[]
  ): Promise<{ recommendations: Array<CareerPath & { matchPercentage: number }>; error: Error | null }> {
    try {
      // Get all career paths
      const { careerPaths, error } = await this.getAllCareerPaths();
      
      if (error) {
        throw error;
      }

      // Get user skills
      const { data: skillsData, error: skillsError } = await supabase
        .from('user_skills')
        .select('skills (name)')
        .eq('user_id', userId);

      if (skillsError) {
        throw skillsError;
      }

      // Extract skill names
      const userSkills = skillsData.map(item => item.skills.name);
      
      // Update current rank with skills
      const rankWithSkills = {
        ...currentRank,
        careerStage: {
          skills: userSkills
        }
      };

      // Calculate match percentage for each career path
      const recommendations = careerPaths
        .map(career => ({
          ...career,
          matchPercentage: this.calculateCareerMatch(
            rankWithSkills,
            career,
            completedLevels
          )
        }))
        .sort((a, b) => b.matchPercentage - a.matchPercentage);

      return { recommendations, error: null };
    } catch (error) {
      console.error('Get career recommendations error:', error);
      return { recommendations: [], error: error as Error };
    }
  }

  /**
   * Get required skill gaps
   */
  async getRequiredSkillGaps(
    userId: string,
    targetCareerPath: CareerPath
  ): Promise<{ skillGaps: SkillMatch[]; error: Error | null }> {
    try {
      // Get user skills
      const { data: skillsData, error: skillsError } = await supabase
        .from('user_skills')
        .select('skills (name)')
        .eq('user_id', userId);

      if (skillsError) {
        throw skillsError;
      }

      // Extract skill names
      const userSkills = skillsData.map(item => item.skills.name);

      // Calculate skill gaps
      const skillGaps = targetCareerPath.requiredSkills.map(skill => ({
        skill,
        weight: userSkills.includes(skill) ? 100 : 0
      }));

      return { skillGaps, error: null };
    } catch (error) {
      console.error('Get required skill gaps error:', error);
      return { skillGaps: [], error: error as Error };
    }
  }
}
