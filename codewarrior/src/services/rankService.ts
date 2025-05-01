import { RANKS } from '../constants/ranks';
import { Rank, Requirements } from '../types/ranks';

export class RankService {
  getCurrentRank(points: number): Rank {
    return RANKS.find(rank => this.meetsRankRequirements(points, rank.requirements)) || RANKS[0];
  }

  getNextRank(currentRank: Rank): Rank | null {
    const nextRankIndex = RANKS.findIndex(rank => rank.id === currentRank.id) + 1;
    return nextRankIndex < RANKS.length ? RANKS[nextRankIndex] : null;
  }

  meetsRankRequirements(points: number, requirements: Requirements): boolean {
    // Add logic to check course completion, projects, and skills
    return true; // Placeholder - implement actual logic
  }

  calculateProgress(currentPoints: number, currentRank: Rank): number {
    const nextRank = this.getNextRank(currentRank);
    if (!nextRank) return 100;

    // Calculate percentage progress to next rank
    const pointsForNextRank = this.getPointsRequiredForRank(nextRank);
    const currentProgress = (currentPoints / pointsForNextRank) * 100;
    return Math.min(currentProgress, 100);
  }

  private getPointsRequiredForRank(rank: Rank): number {
    // Implement point requirements for each rank
    return rank.id * 1000; // Placeholder calculation
  }

  getCareerPathRecommendations(currentRank: Rank): string[] {
    return currentRank.careerStage.roles;
  }

  getRequiredSkills(targetRank: Rank): string[] {
    return targetRank.requirements.skills;
  }
}