import { supabase } from '../lib/supabase';
import { CareerPath, Rank, Skill } from '../types/ranks';

interface SkillMatch {
  skill: string;
  acquired: boolean;
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

      const careerPaths: CareerPath[] = data.map(career => ({
        id: career.id,
        title: career.title,
        description: career.description,
        requiredSkills: career.required_skills,
        minRankId: career.min_rank_id,
        salaryRange: career.salary_range,
        imageUrl: career.image_url || '',
        potentialRoles: [career.title], // Default to the career title itself
        industryDemand: 'Medium' // Default value
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

      const careerPaths: CareerPath[] = data.map(career => ({
        id: career.id,
        title: career.title,
        description: career.description,
        requiredSkills: career.required_skills,
        minRankId: career.min_rank_id,
        salaryRange: career.salary_range,
        imageUrl: career.image_url || '',
        potentialRoles: [career.title], // Default to the career title itself
        industryDemand: 'Medium' // Default value
      }));

      return { careerPaths, error: null };
    } catch (error) {
      console.error('Get career paths for rank error:', error);
      return { careerPaths: [], error: error as Error };
    }
  }

  /**
   * Get career path by ID
   */
  async getCareerPathById(careerPathId: number): Promise<{ careerPath: CareerPath | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('career_paths')
        .select('*')
        .eq('id', careerPathId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        return { careerPath: null, error: null };
      }

      const careerPath: CareerPath = {
        id: data.id,
        title: data.title,
        description: data.description,
        requiredSkills: data.required_skills,
        minRankId: data.min_rank_id,
        salaryRange: data.salary_range,
        imageUrl: data.image_url || '',
        potentialRoles: [data.title], // Default to the career title itself
        industryDemand: 'Medium' // Default value
      };

      return { careerPath, error: null };
    } catch (error) {
      console.error('Get career path by ID error:', error);
      return { careerPath: null, error: error as Error };
    }
  }

  /**
   * Calculate skill match between user skills and required skills
   */
  private calculateSkillMatch(userSkills: string[], requiredSkills: string[]): number {
    if (requiredSkills.length === 0) return 100;

    const matches = requiredSkills.filter(skill =>
      userSkills.includes(skill)
    ).length;

    return (matches / requiredSkills.length) * 100;
  }

  /**
   * Get user skills
   */
  async getUserSkills(userId: string): Promise<{ skills: string[]; error: Error | null }> {
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
      const skills = skillsData.map(item => item.skills.name);

      return { skills, error: null };
    } catch (error) {
      console.error('Get user skills error:', error);
      return { skills: [], error: error as Error };
    }
  }

  /**
   * Get career recommendations
   */
  async getCareerRecommendations(
    userId: string,
    rankId: number
  ): Promise<{ recommendations: Array<CareerPath & { matchPercentage: number }>; error: Error | null }> {
    try {
      // Get career paths for the user's rank
      const { careerPaths, error } = await this.getCareerPathsForRank(rankId);

      if (error) {
        throw error;
      }

      // Get user skills
      const { skills: userSkills, error: skillsError } = await this.getUserSkills(userId);

      if (skillsError) {
        throw skillsError;
      }

      // Calculate match percentage for each career path
      const recommendations = careerPaths
        .map(career => ({
          ...career,
          matchPercentage: this.calculateSkillMatch(userSkills, career.requiredSkills)
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
    careerPathId: number
  ): Promise<{ skillGaps: SkillMatch[]; error: Error | null }> {
    try {
      // Get career path
      const { careerPath, error: careerError } = await this.getCareerPathById(careerPathId);

      if (careerError || !careerPath) {
        throw careerError || new Error('Career path not found');
      }

      // Get user skills
      const { skills: userSkills, error: skillsError } = await this.getUserSkills(userId);

      if (skillsError) {
        throw skillsError;
      }

      // Calculate skill gaps
      const skillGaps = careerPath.requiredSkills.map(skill => ({
        skill,
        acquired: userSkills.includes(skill)
      }));

      return { skillGaps, error: null };
    } catch (error) {
      console.error('Get required skill gaps error:', error);
      return { skillGaps: [], error: error as Error };
    }
  }

  /**
   * Get next career steps
   */
  async getNextCareerSteps(
    userId: string,
    careerPathId: number
  ): Promise<{ steps: string[]; error: Error | null }> {
    try {
      // Get skill gaps
      const { skillGaps, error } = await this.getRequiredSkillGaps(userId, careerPathId);

      if (error) {
        throw error;
      }

      const steps: string[] = [];

      // Add missing skills as steps
      const missingSkills = skillGaps
        .filter(gap => !gap.acquired)
        .map(gap => gap.skill);

      if (missingSkills.length > 0) {
        steps.push(`Master the following skills: ${missingSkills.join(', ')}`);
      }

      // Get user's rank
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('current_rank_id')
        .eq('user_id', userId)
        .single();

      if (progressError) {
        throw progressError;
      }

      // Get rank details
      const { data: rankData, error: rankError } = await supabase
        .from('ranks')
        .select('level')
        .eq('id', progressData.current_rank_id)
        .single();

      if (rankError) {
        throw rankError;
      }

      // Add rank-based recommendations
      if (rankData.level < 4) {
        steps.push('Complete more courses to increase your rank');
      }

      // Add career-specific recommendations
      steps.push(
        'Build a portfolio showcasing your skills',
        'Participate in community projects',
        'Network with professionals in your target role'
      );

      return { steps, error: null };
    } catch (error) {
      console.error('Get next career steps error:', error);
      return { steps: [], error: error as Error };
    }
  }
}