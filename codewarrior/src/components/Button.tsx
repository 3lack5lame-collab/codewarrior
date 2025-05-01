import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, typography } from '../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}: ButtonProps) => {
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: colors.secondary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: colors.primary,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
      default:
        return {
          backgroundColor: colors.primary,
        };
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.md,
        };
      case 'large':
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xl,
        };
      default:
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.lg,
        };
    }
  };

  const getTextColor = (): string => {
    if (disabled) return colors.text.disabled;
    switch (variant) {
      case 'outline':
      case 'ghost':
        return colors.primary;
      default:
        return colors.text.inverse;
    }
  };

  const buttonStyles = [
    styles.button,
    getVariantStyles(),
    getSizeStyles(),
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    { color: getTextColor() },
    size === 'small' && { fontSize: 14 },
    textStyle,
  ];

  const iconColor = getTextColor();
  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={buttonStyles}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator
          color={getTextColor()}
          size={size === 'large' ? 'large' : 'small'}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Icon
              name={icon}
              size={iconSize}
              color={iconColor}
              style={styles.iconLeft}
            />
          )}
          <Text style={textStyles}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Icon
              name={icon}
              size={iconSize}
              color={iconColor}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.md,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    ...typography.body1,
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: spacing.xs,
  },
  iconRight: {
    marginLeft: spacing.xs,
  },
});
