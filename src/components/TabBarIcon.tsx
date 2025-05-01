import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface TabBarIconProps {
  name: string;
  focused: boolean;
  color: string;
}

export const TabBarIcon: React.FC<TabBarIconProps> = ({ name, focused, color }) => {
  return (
    <MaterialCommunityIcons
      name={name as any}
      size={focused ? 26 : 22}
      color={color}
    />
  );
};
