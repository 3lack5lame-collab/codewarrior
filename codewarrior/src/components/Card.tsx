import * as React from 'react';
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

export const Card = (props: CardProps) => {
  const {
    children,
    onPress,
    style,
    elevation: elevationProp = 'medium',
    variant = 'default',
  } = props;

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

  const cardStyle = [
    styles.card,
    variant === 'outlined' && styles.outlined,
    getElevationStyle(),
    style,
  ];

  if (onPress) {
    return React.createElement(
      TouchableOpacity,
      {
        style: cardStyle,
        onPress: onPress,
        activeOpacity: 0.7
      },
      children
    );
  }

  return React.createElement(
    View,
    { style: cardStyle },
    children
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
