# Supabase Integration for codeWarrior

This document outlines the changes made to integrate Supabase into the codeWarrior application.

## Files Created/Modified

### Configuration
- `src/lib/supabase.ts` - Supabase client configuration
- `app.config.js` - Environment configuration for Expo
- `.env.example` - Example environment variables
- `babel.config.js` - Babel configuration for environment variables

### Database Schema
- `supabase/schema.sql` - Complete SQL schema for Supabase

### Authentication
- `src/services/AuthService.ts` - Authentication service for Supabase
- `src/contexts/AuthContext.tsx` - Authentication context provider
- `src/screens/LoginScreen.tsx` - Login/signup screen

### Progress Tracking
- `src/services/ProgressService.ts` - Service for tracking user progress and ranks
- `src/contexts/ProgressContext.tsx` - Context for progress data

### Achievements
- `src/services/AchievementService.ts` - Service for managing achievements

### Career Paths
- `src/services/CareerService.ts` - Service for career paths and recommendations

### Challenges
- `src/services/ChallengeService.ts` - Service for Hell Week challenges

### Courses
- `src/services/CourseService.ts` - Service for courses and levels

### Types
- `src/types/ranks.ts` - TypeScript interfaces for data models

### UI Components
- `src/components/TabBarIcon.tsx` - Icon component for tab navigation
- `src/constants/theme.ts` - Theme constants for styling

### Navigation
- Modified `codewarrior/src/navigation/AppNavigator.tsx` - Added authentication flow
- Modified `codewarrior/App.tsx` - Added AuthProvider

## Setup Instructions

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your Supabase URL and anon key
3. Create a `.env` file with:
   ```
   SUPABASE_URL=your-project-url
   SUPABASE_ANON_KEY=your-anon-key
   ```
4. Run the SQL script in `supabase/schema.sql` in the Supabase SQL Editor
5. Install dependencies:
   ```
   npm install @supabase/supabase-js expo-secure-store expo-constants react-native-url-polyfill
   ```
6. Start the app:
   ```
   npm start
   ```

## Data Model

The Supabase integration implements the following data model:

- **Users**: Authentication and profiles
- **Ranks**: 10 ranks from Novice to Star Rank
- **Progress**: User's current rank, points, and stats
- **Courses**: CS101 to CS401 with levels
- **Achievements**: Badges and rewards for accomplishments
- **Challenges**: Hell Week time-bound coding challenges
- **Career Paths**: Job roles unlocked by rank

## Next Steps

1. Implement GitHub API integration for commit tracking
2. Implement LeetCode API integration for problem-solving tracking
3. Create UI components for achievements, challenges, and career paths
4. Add real-time updates using Supabase subscriptions
5. Implement admin dashboard for managing content
