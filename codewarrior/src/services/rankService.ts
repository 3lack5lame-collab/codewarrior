import { supabase } from '../lib/supabase';
import { Rank, CareerPath, Skill } from '../types/ranks';

export class RankService {
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
        imageUrl: rank.image_url || '',
        careerStage: {
          title: `${rank.name} Developer`,
          roles: [],
          salaryRange: '',
          skills: [],
          responsibilities: []
        }
      }));

      return { ranks, error: null };
    } catch (error) {
      console.error('Get all ranks error:', error);
      return { ranks: [], error: error as Error };
    }
  }

  /**
   * Get rank by ID
   */
  async getRankById(rankId: number): Promise<{ rank: Rank | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('ranks')
        .select('*')
        .eq('id', rankId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        return { rank: null, error: null };
      }

      // Get career paths for this rank
      const { data: careerData, error: careerError } = await supabase
        .from('career_paths')
        .select('title, required_skills, salary_range')
        .eq('min_rank_id', rankId);

      if (careerError) {
        throw careerError;
      }

      // Extract roles and skills from career paths
      const roles = careerData.map(career => career.title);
      const skills = careerData.flatMap(career => career.required_skills);
      const uniqueSkills = [...new Set(skills)];

      // Get salary range (use the highest one if multiple)
      const salaryRanges = careerData.map(career => career.salary_range);
      const salaryRange = salaryRanges.length > 0 ? salaryRanges[0] : '';

      const rank: Rank = {
        id: data.id,
        name: data.name,
        level: data.level,
        description: data.description,
        requiredPoints: data.required_points,
        imageUrl: data.image_url || '',
        careerStage: {
          title: `${data.name} Developer`,
          roles,
          salaryRange,
          skills: uniqueSkills,
          responsibilities: []
        }
      };

      return { rank, error: null };
    } catch (error) {
      console.error('Get rank by ID error:', error);
      return { rank: null, error: error as Error };
    }
  }

  /**
   * Get next ranks after a specific rank
   */
  async getNextRanks(currentRankId: number, count: number = 3): Promise<{ ranks: Rank[]; error: Error | null }> {
    try {
      // Get current rank level
      const { data: currentRankData, error: currentRankError } = await supabase
        .from('ranks')
        .select('level')
        .eq('id', currentRankId)
        .single();

      if (currentRankError) {
        throw currentRankError;
      }

      // Get next ranks
      const { data, error } = await supabase
        .from('ranks')
        .select('*')
        .gt('level', currentRankData.level)
        .order('level', { ascending: true })
        .limit(count);

      if (error) {
        throw error;
      }

      // Process each rank to include career stage info
      const ranks: Rank[] = await Promise.all(
        data.map(async (rankData) => {
          // Get career paths for this rank
          const { data: careerData } = await supabase
            .from('career_paths')
            .select('title, required_skills, salary_range')
            .eq('min_rank_id', rankData.id);

          // Extract roles and skills from career paths
          const roles = careerData?.map(career => career.title) || [];
          const skills = careerData?.flatMap(career => career.required_skills) || [];
          const uniqueSkills = [...new Set(skills)];

          // Get salary range (use the highest one if multiple)
          const salaryRanges = careerData?.map(career => career.salary_range) || [];
          const salaryRange = salaryRanges.length > 0 ? salaryRanges[0] : '';

          return {
            id: rankData.id,
            name: rankData.name,
            level: rankData.level,
            description: rankData.description,
            requiredPoints: rankData.required_points,
            imageUrl: rankData.image_url || '',
            careerStage: {
              title: `${rankData.name} Developer`,
              roles,
              salaryRange,
              skills: uniqueSkills,
              responsibilities: []
            }
          };
        })
      );

      return { ranks, error: null };
    } catch (error) {
      console.error('Get next ranks error:', error);
      return { ranks: [], error: error as Error };
    }
  }

  /**
   * Get required skills for a rank
   */
  async getRequiredSkillsForRank(rankId: number): Promise<{ skills: Skill[]; error: Error | null }> {
    try {
      // Get career paths for this rank
      const { data: careerData, error: careerError } = await supabase
        .from('career_paths')
        .select('required_skills')
        .eq('min_rank_id', rankId);

      if (careerError) {
        throw careerError;
      }

      // Extract unique skill names
      const skillNames = [...new Set(careerData.flatMap(career => career.required_skills))];

      if (skillNames.length === 0) {
        return { skills: [], error: null };
      }

      // Get skill details
      const { data: skillsData, error: skillsError } = await supabase
        .from('skills')
        .select('*')
        .in('name', skillNames);

      if (skillsError) {
        throw skillsError;
      }

      const skills: Skill[] = skillsData.map(skill => ({
        id: skill.id,
        name: skill.name,
        category: skill.category,
        description: skill.description
      }));

      return { skills, error: null };
    } catch (error) {
      console.error('Get required skills for rank error:', error);
      return { skills: [], error: error as Error };
    }
  }

  /**
   * Get career paths for a rank
   */
  async getCareerPathsForRank(rankId: number): Promise<{ careerPaths: CareerPath[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('career_paths')
        .select('*')
        .eq('min_rank_id', rankId);

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
        imageUrl: career.image_url
      }));

      return { careerPaths, error: null };
    } catch (error) {
      console.error('Get career paths for rank error:', error);
      return { careerPaths: [], error: error as Error };
    }
  }

  /**
   * Calculate progress to next rank
   */
  async calculateProgress(currentPoints: number, currentRankId: number): Promise<number> {
    try {
      // Get current rank
      const { data: currentRankData, error: currentRankError } = await supabase
        .from('ranks')
        .select('required_points, level')
        .eq('id', currentRankId)
        .single();

      if (currentRankError) {
        throw currentRankError;
      }

      // Get next rank
      const { data: nextRankData, error: nextRankError } = await supabase
        .from('ranks')
        .select('required_points')
        .gt('level', currentRankData.level)
        .order('level', { ascending: true })
        .limit(1)
        .single();

      if (nextRankError) {
        // If there's no next rank, return 100%
        return 100;
      }

      // Calculate percentage progress to next rank
      const pointsForCurrentRank = currentRankData.required_points;
      const pointsForNextRank = nextRankData.required_points;
      const pointsNeeded = pointsForNextRank - pointsForCurrentRank;
      const pointsEarned = currentPoints - pointsForCurrentRank;
      const progress = (pointsEarned / pointsNeeded) * 100;

      return Math.min(Math.max(progress, 0), 100);
    } catch (error) {
      console.error('Calculate progress error:', error);
      return 0;
    }
  }
}