import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { RankProgressCard } from '../components/RankProgressCard';
import { RankService } from '../services/rankService';
import { Rank } from '../types/ranks';

export const RankScreen = () => {
  const [currentRank, setCurrentRank] = useState<Rank | null>(null);
  const [progress, setProgress] = useState(0);
  const [points, setPoints] = useState(0);
  
  const rankService = new RankService();

  useEffect(() => {
    // In a real app, we'd fetch the user's points from an API or storage
    const mockPoints = 1500;
    setPoints(mockPoints);
    
    const rank = rankService.getCurrentRank(mockPoints);
    setCurrentRank(rank);
    
    const progressToNext = rankService.calculateProgress(mockPoints, rank);
    setProgress(progressToNext);
  }, []);

  if (!currentRank) {
    return null; // Or a loading indicator
  }

  return (
    <ScrollView style={styles.container}>
      <RankProgressCard
        currentRank={currentRank}
        progress={progress}
        points={points}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});