import { supabase } from '../lib/supabase';
import { Challenge } from '../types/ranks';

export class ChallengeService {
  /**
   * Get all challenges
   */
  async getAllChallenges(): Promise<{ challenges: Challenge[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*');

      if (error) {
        throw error;
      }

      const challenges: Challenge[] = data.map(challenge => ({
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        deadline: challenge.deadline,
        requiredTech: challenge.required_tech,
        minRankId: challenge.min_rank_id,
        points: challenge.points
      }));

      return { challenges, error: null };
    } catch (error) {
      console.error('Get all challenges error:', error);
      return { challenges: [], error: error as Error };
    }
  }

  /**
   * Get challenges for a specific rank
   */
  async getChallengesForRank(rankId: number): Promise<{ challenges: Challenge[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .lte('min_rank_id', rankId);

      if (error) {
        throw error;
      }

      const challenges: Challenge[] = data.map(challenge => ({
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        deadline: challenge.deadline,
        requiredTech: challenge.required_tech,
        minRankId: challenge.min_rank_id,
        points: challenge.points
      }));

      return { challenges, error: null };
    } catch (error) {
      console.error('Get challenges for rank error:', error);
      return { challenges: [], error: error as Error };
    }
  }

  /**
   * Get challenge by ID
   */
  async getChallengeById(challengeId: number): Promise<{ challenge: Challenge | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', challengeId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        return { challenge: null, error: null };
      }

      const challenge: Challenge = {
        id: data.id,
        title: data.title,
        description: data.description,
        deadline: data.deadline,
        requiredTech: data.required_tech,
        minRankId: data.min_rank_id,
        points: data.points
      };

      return { challenge, error: null };
    } catch (error) {
      console.error('Get challenge by ID error:', error);
      return { challenge: null, error: error as Error };
    }
  }

  /**
   * Get user challenges
   */
  async getUserChallenges(userId: string): Promise<{ 
    userChallenges: Record<number, { status: string }>;
    error: Error | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('user_challenges')
        .select('challenge_id, status')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      const userChallenges: Record<number, { status: string }> = {};
      
      data.forEach(item => {
        userChallenges[item.challenge_id] = { status: item.status };
      });

      return { userChallenges, error: null };
    } catch (error) {
      console.error('Get user challenges error:', error);
      return { userChallenges: {}, error: error as Error };
    }
  }

  /**
   * Start a challenge
   */
  async startChallenge(userId: string, challengeId: number): Promise<{ success: boolean; error: Error | null }> {
    try {
      // Check if user already has this challenge
      const { data: existingData, error: existingError } = await supabase
        .from('user_challenges')
        .select('id')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .single();

      if (existingError && existingError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw existingError;
      }

      if (existingData) {
        // Challenge already exists, update status
        const { error: updateError } = await supabase
          .from('user_challenges')
          .update({ status: 'in_progress' })
          .eq('id', existingData.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        // Create new user challenge
        const { error: insertError } = await supabase
          .from('user_challenges')
          .insert({
            user_id: userId,
            challenge_id: challengeId,
            status: 'in_progress'
          });

        if (insertError) {
          throw insertError;
        }
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Start challenge error:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Submit a challenge
   */
  async submitChallenge(userId: string, challengeId: number, submissionUrl: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      // Get user challenge
      const { data, error } = await supabase
        .from('user_challenges')
        .select('id')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .single();

      if (error) {
        throw error;
      }

      // Update status to submitted
      const { error: updateError } = await supabase
        .from('user_challenges')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          submission_url: submissionUrl
        })
        .eq('id', data.id);

      if (updateError) {
        throw updateError;
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Submit challenge error:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Complete a challenge
   */
  async completeChallenge(userId: string, challengeId: number): Promise<{ success: boolean; error: Error | null }> {
    try {
      // Get user challenge
      const { data, error } = await supabase
        .from('user_challenges')
        .select('id')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .single();

      if (error) {
        throw error;
      }

      // Update status to completed
      const { error: updateError } = await supabase
        .from('user_challenges')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', data.id);

      if (updateError) {
        throw updateError;
      }

      // Get challenge points
      const { data: challengeData, error: challengeError } = await supabase
        .from('challenges')
        .select('points')
        .eq('id', challengeId)
        .single();

      if (challengeError) {
        throw challengeError;
      }

      // Update user progress
      const { error: progressError } = await supabase
        .from('user_progress')
        .update({
          total_points: supabase.rpc('increment', { x: challengeData.points }),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (progressError) {
        throw progressError;
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Complete challenge error:', error);
      return { success: false, error: error as Error };
    }
  }
}
