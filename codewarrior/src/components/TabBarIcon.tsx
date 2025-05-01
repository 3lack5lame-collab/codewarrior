import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../constants/theme';

interface TabBarIconProps {
  name: string;
  focused: boolean;
  color?: string;
  size?: number;
}

export const TabBarIcon: React.FC<TabBarIconProps> = ({
  name,
  focused,
  color = colors.primary,
  size = 24
}) => {
  return (
    <Icon
      name={name}
      size={size}
      color={focused ? color : colors.text.disabled}
    />
  );
};