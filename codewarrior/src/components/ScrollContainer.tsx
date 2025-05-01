import React from 'react';
import {
  ScrollView,
  RefreshControl,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../constants/theme';

interface ScrollContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

export const ScrollContainer: React.FC<ScrollContainerProps> = ({
  children,
  style,
  contentContainerStyle,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <SafeAreaView style={[styles.container, style]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: spacing.md,
  },
});