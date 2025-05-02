import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabBarIcon } from '../components/TabBarIcon';
import { colors, typography } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

// Import screens
import { HomeScreen } from '../screens/HomeScreen';
import { CoursesScreen } from '../screens/CoursesScreen';
import { RankScreen } from '../screens/RankScreen';
import { CareerScreen } from '../screens/CareerScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { LoginScreen } from '../screens/LoginScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.background,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.disabled,
        tabBarLabelStyle: {
          ...typography.caption,
          marginBottom: 4,
        },
        headerStyle: {
          backgroundColor: colors.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          ...typography.h3,
          color: colors.text.inverse,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="home" focused={focused} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Courses"
        component={CoursesScreen}
        options={{
          title: 'Learning Path',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="book-open-variant" focused={focused} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Rank"
        component={RankScreen}
        options={{
          title: 'Your Rank',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="shield-star" focused={focused} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Career"
        component={CareerScreen}
        options={{
          title: 'Career Path',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="trending-up" focused={focused} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="account" focused={focused} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};