import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, typography } from '../constants/theme';

interface BadgeProps {
  label: string;
  color?: string;
  backgroundColor?: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color = colors.badge.text,
  backgroundColor = colors.badge.background,
  size = 'medium',
  style,
  textStyle
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { padding: spacing.xs },
          text: { ...typography.caption }
        };
      case 'large':
        return {
          container: { padding: spacing.md },
          text: { ...typography.body1 }
        };
      default:
        return {
          container: { padding: spacing.sm },
          text: { ...typography.body2 }
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.container,
        sizeStyles.container,
        { backgroundColor },
        style
      ]}
    >
      <Text
        style={[
          styles.text,
          sizeStyles.text,
          { color },
          textStyle
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: spacing.lg,
    margin: spacing.xs,
  },
  text: {
    fontWeight: '500',
  },
});