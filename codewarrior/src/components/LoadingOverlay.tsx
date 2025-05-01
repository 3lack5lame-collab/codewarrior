import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Loading } from './Loading';

interface LoadingOverlayProps {
  isVisible: boolean;
  text?: string;
  opacity?: number;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  text,
  opacity = 0.7,
}) => {
  if (!isVisible) return null;

  return (
    <View style={[styles.overlay, { opacity }]}>
      <Loading text={text} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
});