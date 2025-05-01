import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0 to 100
  height?: number;
  backgroundColor?: string;
  fillColor?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  backgroundColor = '#e0e0e0',
  fillColor = '#4CAF50'
}) => {
  return (
    <View style={[styles.container, { height, backgroundColor }]}>
      <View 
        style={[
          styles.fill, 
          { 
            width: `${Math.min(Math.max(progress, 0), 100)}%`,
            backgroundColor: fillColor 
          }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});