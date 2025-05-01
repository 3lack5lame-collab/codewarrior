import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Text,
} from 'react-native';
import { colors, spacing, typography } from '../constants/theme';

interface LoadingProps {
  size?: number | 'small' | 'large';
  color?: string;
  text?: string;
  fullscreen?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color = colors.primary,
  text,
  fullscreen = false,
  style,
}) => {
  return (
    <View style={[
      styles.container,
      fullscreen && styles.fullscreen,
      style,
    ]}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text style={[styles.text, { color }]}>{text}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
  text: {
    ...typography.body2,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    fontSize: 14,
    fontWeight: '500',
  },
});