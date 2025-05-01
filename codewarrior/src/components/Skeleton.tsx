import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle, Animated } from 'react-native';
import { colors } from '../constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
  borderRadius?: number;
}

export const Skeleton = ({
  width = '100%',
  height = 20,
  style,
  borderRadius = 4
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity: opacity as any,
        },
        style,
      ]}
    />
  );
};

interface SkeletonGroupProps {
  times?: number;
  marginBottom?: number;
  children: any;
}

export const SkeletonGroup = ({
  times = 1,
  marginBottom = 16,
  children
}) => {
  return (
    <>
      {Array.from({ length: times }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.groupItem,
            { marginBottom: index < times - 1 ? marginBottom : 0 }
          ]}
        >
          {children}
        </View>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.background,
  },
  groupItem: {
    opacity: 1,
  },
});
