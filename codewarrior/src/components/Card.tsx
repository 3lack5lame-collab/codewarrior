import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { colors, spacing, elevation } from '../constants/theme';

interface CardProps {
  children: any;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  elevation?: 'none' | 'low' | 'medium' | 'high';
  variant?: 'default' | 'outlined';
}

export const Card = ({
  children,
  onPress,
  style,
  elevation: elevationProp = 'medium',
  variant = 'default',
}) => {
  const Container = onPress ? TouchableOpacity : View;

  const getElevationStyle = () => {
    if (variant === 'outlined') return {};
    switch (elevationProp) {
      case 'none':
        return {};
      case 'low':
        return elevation.small;
      case 'high':
        return elevation.high;
      default:
        return elevation.medium;
    }
  };

  return (
    <Container
      style={[
        styles.card,
        variant === 'outlined' && styles.outlined,
        getElevationStyle(),
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: spacing.lg,
    padding: spacing.lg,
    marginVertical: spacing.sm,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.primary, // Replace 'primary' with the desired existing color property
  },
});
