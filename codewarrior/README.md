
# CodeWarrior

CodeWarrior is a gamified coding education platform that helps users learn programming skills, track their progress, and explore career paths.

## Features

- User authentication with Supabase
- Progress tracking and rank system
- Course management with levels and points
- Career path recommendations
- Achievement system
- Profile management

## Tech Stack

- React Native / Expo
- TypeScript
- Supabase (Authentication, Database)
- React Navigation

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Supabase account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/codewarrior.git
   cd codewarrior
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a Supabase project:
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Run the schema.sql script in the SQL Editor

4. Set up environment variables:
   - Update the Supabase URL and anon key in the `.env` file

5. Start the development server:
   ```
   npm start
   ```

6. Run on your device or emulator:
   - Press `a` to run on Android
   - Press `i` to run on iOS
   - Press `w` to run on web

## Project Structure

```
codewarrior/
├── src/
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Reusable components
│   ├── constants/      # Constants and theme
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Library code
│   ├── screens/        # Screen components
│   ├── services/       # API services
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main app component
│   └── index.tsx       # Entry point
├── .env                # Environment variables
├── app.json            # Expo configuration
├── babel.config.js     # Babel configuration
├── package.json        # Dependencies
├── schema.sql          # Database schema
└── tsconfig.json       # TypeScript configuration
```

## Database Schema

The application uses the following tables:

- profiles: User profiles
- ranks: User ranks and levels
- skills: Programming skills
- user_skills: User's acquired skills
- courses: Available courses
- levels: Course levels
- completed_levels: User's completed levels
- career_paths: Career path recommendations
- achievements: Available achievements
- user_achievements: User's earned achievements
- challenges: Coding challenges
- user_challenges: User's challenge progress
- user_progress: User's overall progress
