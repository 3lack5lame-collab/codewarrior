import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ProgressProvider } from './src/contexts/ProgressContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import { AuthProvider } from './src/contexts/AuthContext';
import 'react-native-url-polyfill/auto';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProgressProvider>
          <NotificationProvider>
            <AppNavigator />
          </NotificationProvider>
        </ProgressProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}