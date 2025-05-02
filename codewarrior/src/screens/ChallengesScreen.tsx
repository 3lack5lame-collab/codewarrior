import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChallengeService } from '../services/ChallengeService';
import { Challenge } from '../types/ranks';
import { colors, spacing, typography, elevation } from '../constants/theme';
import { useProgressContext } from '../contexts/ProgressContext';
import { useAuth } from '../contexts/AuthContext';

export const ChallengesScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { userProgress, loading: progressLoading } = useProgressContext();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<Record<number, { status: string }>>({});
  const [loading, setLoading] = useState(true);
  const challengeService = new ChallengeService();

  useEffect(() => {
    const loadChallenges = async () => {
      if (progressLoading || !user || !userProgress) return;

      setLoading(true);
      try {
        // Get challenges for the user's rank
        const { challenges } = await challengeService.getChallengesForRank(userProgress.currentRank.id);
        setChallenges(challenges);

        // Get user's challenge progress
        const { userChallenges } = await challengeService.getUserChallenges(user.id);
        setUserChallenges(userChallenges);
      } catch (error) {
        console.error('Error loading challenges:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChallenges();
  }, [progressLoading, userProgress, user]);

  const getChallengeStatus = (challengeId: number) => {
    if (!userChallenges[challengeId]) {
      return 'Not Started';
    }
    
    const status = userChallenges[challengeId].status;
    
    switch (status) {
      case 'in_progress':
        return 'In Progress';
      case 'submitted':
        return 'Submitted';
      case 'completed':
        return 'Completed';
      default:
        return 'Not Started';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return colors.warning;
      case 'Submitted':
        return colors.info;
      case 'Completed':
        return colors.success;
      default:
        return colors.text.secondary;
    }
  };

  const handleStartChallenge = async (challengeId: number) => {
    if (!user) return;
    
    try {
      await challengeService.startChallenge(user.id, challengeId);
      
      // Update local state
      setUserChallenges(prev => ({
        ...prev,
        [challengeId]: { status: 'in_progress' }
      }));
    } catch (error) {
      console.error('Error starting challenge:', error);
    }
  };

  const renderChallengeItem = ({ item }: { item: Challenge }) => {
    const status = getChallengeStatus(item.id);
    const statusColor = getStatusColor(status);
    
    return (
      <TouchableOpacity
        style={styles.challengeCard}
        onPress={() => {
          // Navigate to challenge details
          // navigation.navigate('ChallengeDetails', { challengeId: item.id });
        }}
      >
        <View style={styles.challengeHeader}>
          <Text style={styles.challengeTitle}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>
        
        <Text style={styles.challengeDescription}>{item.description}</Text>
        
        <View style={styles.challengeDetails}>
          <Text style={styles.pointsText}>{item.points} Points</Text>
          
          {item.deadline && (
            <Text style={styles.deadlineText}>
              Due: {new Date(item.deadline).toLocaleDateString()}
            </Text>
          )}
        </View>
        
        <View style={styles.techContainer}>
          {item.requiredTech.map((tech, index) => (
            <View key={index} style={styles.techBadge}>
              <Text style={styles.techText}>{tech}</Text>
            </View>
          ))}
        </View>
        
        {status === 'Not Started' && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => handleStartChallenge(item.id)}
          >
            <Text style={styles.startButtonText}>Start Challenge</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading || progressLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading challenges...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Coding Challenges</Text>
        <Text style={styles.subtitle}>
          Test your skills with real-world problems
        </Text>
      </View>

      {challenges.length > 0 ? (
        <FlatList
          data={challenges}
          renderItem={renderChallengeItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.challengesList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No challenges available for your rank yet.</Text>
          <Text style={styles.emptySubtext}>Complete more courses to unlock challenges!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
  header: {
    padding: 20,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.inverse,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.inverse,
    opacity: 0.8,
  },
  challengesList: {
    padding: 16,
  },
  challengeCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...elevation.medium,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text.inverse,
  },
  challengeDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  challengeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  deadlineText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  techContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  techBadge: {
    backgroundColor: colors.badge.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  techText: {
    color: colors.badge.text,
    fontSize: 12,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  startButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
