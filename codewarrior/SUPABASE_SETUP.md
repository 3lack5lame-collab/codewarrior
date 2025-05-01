# Supabase Setup Guide for codeWarrior

This guide will help you set up Supabase for the codeWarrior application.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in
2. Create a new project
3. Choose a name for your project (e.g., "codewarrior")
4. Set a secure database password
5. Choose a region close to your users
6. Wait for the project to be created (this may take a few minutes)

## 2. Get Your API Keys

1. Once your project is created, go to the project dashboard
2. Click on the "Settings" icon in the left sidebar
3. Click on "API" in the settings menu
4. You'll find your:
   - Project URL (e.g., `https://abcdefghijklm.supabase.co`)
   - `anon` public key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## 3. Set Up Environment Variables

1. Create a `.env` file in the root of your project
2. Add the following variables:
   ```
   SUPABASE_URL=your-project-url
   SUPABASE_ANON_KEY=your-anon-key
   ```

## 4. Set Up the Database Schema

1. In your Supabase dashboard, go to the "SQL Editor" section
2. Click "New Query"
3. Copy the contents of `supabase/schema.sql` from this project
4. Paste it into the SQL editor
5. Click "Run" to execute the SQL script
6. This will:
   - Create all necessary tables
   - Set up relationships between tables
   - Configure Row Level Security policies
   - Add sample data for ranks, courses, and skills

## 5. Configure Authentication

1. In your Supabase dashboard, go to the "Authentication" section
2. Under "Providers", enable "Email" authentication
3. If you want to use GitHub authentication:
   - Go to GitHub Developer Settings and create a new OAuth App
   - Set the callback URL to `https://your-project-url.supabase.co/auth/v1/callback`
   - Copy the Client ID and Client Secret
   - In Supabase, enable the GitHub provider and paste your Client ID and Client Secret

## 6. Test Your Setup

1. Run the application:
   ```
   npm start
   ```
2. Try to sign up with email and password
3. Check your Supabase dashboard to see if a new user was created
4. Verify that the trigger created a profile and user_progress record

## 7. Troubleshooting

If you encounter issues:

1. Check that your environment variables are correctly set
2. Verify that the SQL script executed without errors
3. Check the Supabase logs in the dashboard
4. Make sure your application has the required dependencies installed

## 8. Next Steps

After setting up Supabase:

1. Implement the remaining services to connect to Supabase
2. Update the UI components to use real data
3. Add real-time subscriptions for live updates
4. Implement GitHub and LeetCode API integrations
