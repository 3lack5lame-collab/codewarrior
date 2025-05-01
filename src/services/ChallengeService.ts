import { supabase } from '../lib/supabase';
import { Challenge } from '../types/ranks';

export interface ChallengeParticipant {
  id: string;
  challengeId: string;
  userId: string;
  joinedAt: string;
  completedAt: string | null;
  username: string;
  avatarUrl: string | null;
}

export class ChallengeService {
  /**
   * Get all active challenges
   */
  async getActiveChallenges(rankId: number): Promise<{ challenges: Challenge[]; error: Error | null }> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .lte('min_rank_id', rankId)
        .gte('deadline', now);

      if (error) {
        throw error;
      }

      const challenges: Challenge[] = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        deadline: item.deadline,
        requiredTech: item.required_tech,
        minRankId: item.min_rank_id,
        points: item.points
      }));

      return { challenges, error: null };
    } catch (error) {
      console.error('Get active challenges error:', error);
      return { challenges: [], error: error as Error };
    }
  }

  /**
   * Get challenge by ID
   */
  async getChallengeById(challengeId: string): Promise<{ challenge: Challenge | null; error: Error | null }> {
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
   * Join a challenge
   */
  async joinChallenge(userId: string, challengeId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      // Check if already joined
      const { data: existingData, error: existingError } = await supabase
        .from('challenge_participants')
        .select('id')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .maybeSingle();

      if (existingError) {
        throw existingError;
      }

      // If already joined, return early
      if (existingData) {
        return { success: true, error: null };
      }

      // Join the challenge
      const { error } = await supabase
        .from('challenge_participants')
        .insert({
          user_id: userId,
          challenge_id: challengeId
        });

      if (error) {
        throw error;
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Join challenge error:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Complete a challenge
   */
  async completeChallenge(userId: string, challengeId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      // Update challenge participant
      const { error } = await supabase
        .from('challenge_participants')
        .update({
          completed_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('challenge_id', challengeId);

      if (error) {
        throw error;
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

      // Update user points
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('total_points')
        .eq('user_id', userId)
        .single();

      if (progressError) {
        throw progressError;
      }

      const newTotalPoints = progressData.total_points + challengeData.points;

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

      return { success: true, error: null };
    } catch (error) {
      console.error('Complete challenge error:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Get challenge participants
   */
  async getChallengeParticipants(challengeId: string): Promise<{ participants: ChallengeParticipant[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .select(`
          id,
          challenge_id,
          user_id,
          joined_at,
          completed_at,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('challenge_id', challengeId);

      if (error) {
        throw error;
      }

      const participants: ChallengeParticipant[] = data.map(item => ({
        id: item.id,
        challengeId: item.challenge_id,
        userId: item.user_id,
        joinedAt: item.joined_at,
        completedAt: item.completed_at,
        username: item.profiles.username,
        avatarUrl: item.profiles.avatar_url
      }));

      return { participants, error: null };
    } catch (error) {
      console.error('Get challenge participants error:', error);
      return { participants: [], error: error as Error };
    }
  }

  /**
   * Get user challenges
   */
  async getUserChallenges(userId: string): Promise<{ challenges: (Challenge & { joined: boolean; completed: boolean })[]; error: Error | null }> {
    try {
      // Get all challenges the user has joined
      const { data: participantData, error: participantError } = await supabase
        .from('challenge_participants')
        .select(`
          challenge_id,
          completed_at
        `)
        .eq('user_id', userId);

      if (participantError) {
        throw participantError;
      }

      // Create a map of challenge IDs to completion status
      const challengeMap = new Map<string, { joined: boolean; completed: boolean }>();
      participantData.forEach(item => {
        challengeMap.set(item.challenge_id, {
          joined: true,
          completed: !!item.completed_at
        });
      });

      // Get user's rank to filter challenges
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('current_rank_id')
        .eq('user_id', userId)
        .single();

      if (progressError) {
        throw progressError;
      }

      // Get all active challenges for the user's rank
      const now = new Date().toISOString();
      const { data: challengeData, error: challengeError } = await supabase
        .from('challenges')
        .select('*')
        .lte('min_rank_id', progressData.current_rank_id)
        .gte('deadline', now);

      if (challengeError) {
        throw challengeError;
      }

      // Map challenges with joined/completed status
      const challenges = challengeData.map(item => {
        const status = challengeMap.get(item.id) || { joined: false, completed: false };
        
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          deadline: item.deadline,
          requiredTech: item.required_tech,
          minRankId: item.min_rank_id,
          points: item.points,
          joined: status.joined,
          completed: status.completed
        };
      });

      return { challenges, error: null };
    } catch (error) {
      console.error('Get user challenges error:', error);
      return { challenges: [], error: error as Error };
    }
  }
}
