import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  TextInputProps,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, typography } from '../constants/theme';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  onFocus,
  onBlur,
  secureTextEntry,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const getBorderColor = () => {
    if (error) return colors.error.main;
    if (isFocused) return colors.primary;
    return colors.border;
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[
          styles.label,
          error && styles.errorLabel,
          labelStyle
        ]}>
          {label}
        </Text>
      )}
      
      <View style={[
        styles.inputContainer,
        { borderColor: getBorderColor() },
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError,
      ]}>
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={20}
            color={error ? colors.error.main : colors.text.secondary}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
            inputStyle,
          ]}
          placeholderTextColor={colors.text.disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...rest}
        />
        
        {(rightIcon || secureTextEntry) && (
          <Icon
            name={secureTextEntry ? (isPasswordVisible ? 'eye-off' : 'eye') : rightIcon}
            size={20}
            color={colors.text.secondary}
            style={styles.rightIcon}
            onPress={secureTextEntry ? togglePasswordVisibility : onRightIconPress}
          />
        )}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  errorLabel: {
    color: colors.error.main,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: spacing.sm,
    backgroundColor: colors.surface,
    minHeight: 48,
  },
  inputContainerFocused: {
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: colors.error.main,
  },
  input: {
    flex: 1,
    ...typography.body1,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
  },
  inputWithLeftIcon: {
    paddingLeft: spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: spacing.xs,
  },
  leftIcon: {
    marginLeft: spacing.md,
  },
  rightIcon: {
    marginRight: spacing.md,
  },
  errorText: {
    ...typography.caption,
    color: colors.error.main,
    marginTop: spacing.xs,
  },
});