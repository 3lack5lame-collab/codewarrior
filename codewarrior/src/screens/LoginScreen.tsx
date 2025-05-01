import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../constants/theme';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, signInWithGitHub, loading } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);
      
      if (error) {
        Alert.alert('Error', error.message);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleGitHubAuth = async () => {
    try {
      const { error } = await signInWithGitHub();
      
      if (error) {
        Alert.alert('Error', error.message);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>codeWarrior</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? 'Create your account' : 'Sign in to continue'}
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.button}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.githubButton}
          onPress={handleGitHubAuth}
          disabled={loading}
        >
          <Text style={styles.githubButtonText}>
            Continue with GitHub
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.switchButton}
          onPress={() => setIsSignUp(!isSignUp)}
        >
          <Text style={styles.switchButtonText}>
            {isSignUp 
              ? 'Already have an account? Sign In' 
              : 'Don\'t have an account? Sign Up'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.text.secondary,
  },
  form: {
    marginTop: 20,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: 'bold',
  },
  githubButton: {
    backgroundColor: '#24292e',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  githubButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 32,
    alignItems: 'center',
  },
  switchButtonText: {
    color: colors.primary,
    fontSize: 14,
  },
});
