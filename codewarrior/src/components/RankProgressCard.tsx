import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Rank } from '../types/ranks';

interface RankProgressCardProps {
  currentRank: Rank;
  progress: number;
  points: number;
}

export const RankProgressCard: React.FC<RankProgressCardProps> = ({
  currentRank,
  progress,
  points
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.rankTitle}>{currentRank.name}</Text>
      <Text style={styles.courseLevel}>{currentRank.courseLevel}</Text>
      
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      
      <View style={styles.careerInfo}>
        <Text style={styles.careerTitle}>{currentRank.careerStage.title}</Text>
        <Text style={styles.salaryRange}>{currentRank.careerStage.salaryRange}</Text>
      </View>
      
      <View style={styles.skillsContainer}>
        {currentRank.careerStage.skills.map((skill, index) => (
          <View key={index} style={styles.skillBadge}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  courseLevel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginVertical: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  careerInfo: {
    marginVertical: 8,
  },
  careerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  salaryRange: {
    fontSize: 16,
    color: '#666',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  skillBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  skillText: {
    color: '#1976D2',
    fontSize: 14,
  },
});