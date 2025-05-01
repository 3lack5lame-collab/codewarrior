-- Create schema for codeWarrior app

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ranks table
CREATE TABLE IF NOT EXISTS public.ranks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  level INTEGER NOT NULL,
  description TEXT,
  required_points INTEGER NOT NULL,
  image_url TEXT
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  current_rank_id INTEGER REFERENCES public.ranks(id) NOT NULL,
  total_points INTEGER DEFAULT 0,
  leetcode_solved INTEGER DEFAULT 0,
  github_commits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  min_rank_id INTEGER REFERENCES public.ranks(id),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create levels table
CREATE TABLE IF NOT EXISTS public.levels (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES public.courses(id) NOT NULL,
  level_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, level_number)
);

-- Create completed_levels table
CREATE TABLE IF NOT EXISTS public.completed_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  level_id INTEGER REFERENCES public.levels(id) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, level_id)
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  required_points INTEGER,
  required_rank_id INTEGER REFERENCES public.ranks(id),
  required_skills TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  achievement_id INTEGER REFERENCES public.achievements(id) NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create career_paths table
CREATE TABLE IF NOT EXISTS public.career_paths (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  required_skills TEXT[],
  min_rank_id INTEGER REFERENCES public.ranks(id),
  salary_range TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create challenges table (for Hell Week challenges)
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  required_tech TEXT[],
  min_rank_id INTEGER REFERENCES public.ranks(id) NOT NULL,
  points INTEGER DEFAULT 500,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create challenge_participants table
CREATE TABLE IF NOT EXISTS public.challenge_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES public.challenges(id) NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(challenge_id, user_id)
);

-- Create skills table
CREATE TABLE IF NOT EXISTS public.skills (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_skills table
CREATE TABLE IF NOT EXISTS public.user_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  skill_id INTEGER REFERENCES public.skills(id) NOT NULL,
  proficiency INTEGER DEFAULT 1, -- 1-5 scale
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

-- Create leaderboard view
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  p.id,
  p.username,
  p.avatar_url,
  up.current_rank_id,
  r.name AS rank_name,
  up.total_points,
  up.leetcode_solved,
  up.github_commits,
  COUNT(DISTINCT ua.achievement_id) AS achievements_count
FROM
  profiles p
JOIN
  user_progress up ON p.id = up.user_id
JOIN
  ranks r ON up.current_rank_id = r.id
LEFT JOIN
  user_achievements ua ON p.id = ua.user_id
GROUP BY
  p.id, p.username, p.avatar_url, up.current_rank_id, r.name, up.total_points, up.leetcode_solved, up.github_commits
ORDER BY
  up.total_points DESC;

-- Set up Row Level Security (RLS)
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Profiles: Users can read all profiles but only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- User Progress: Users can read all progress but only update their own
CREATE POLICY "Progress is viewable by everyone" ON public.user_progress
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own progress" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Completed Levels: Users can read all completed levels but only insert/update their own
CREATE POLICY "Completed levels are viewable by everyone" ON public.completed_levels
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own completed levels" ON public.completed_levels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Achievements: Users can read all achievements but only insert their own
CREATE POLICY "User achievements are viewable by everyone" ON public.user_achievements
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Challenge Participants: Users can read all participants but only insert/update their own
CREATE POLICY "Challenge participants are viewable by everyone" ON public.challenge_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own challenge participation" ON public.challenge_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge participation" ON public.challenge_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- User Skills: Users can read all skills but only insert/update their own
CREATE POLICY "User skills are viewable by everyone" ON public.user_skills
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own skills" ON public.user_skills
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills" ON public.user_skills
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_rank_id INTEGER;
BEGIN
  -- Get the ID of the first rank (assumed to be the lowest rank)
  SELECT id INTO default_rank_id FROM public.ranks ORDER BY level ASC LIMIT 1;
  
  -- Insert into profiles
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.email, '');
  
  -- Insert into user_progress with default rank
  INSERT INTO public.user_progress (user_id, current_rank_id, total_points)
  VALUES (new.id, default_rank_id, 0);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert initial ranks
INSERT INTO public.ranks (name, level, description, required_points, image_url)
VALUES
  ('Novice', 1, 'Beginning your coding journey', 0, ''),
  ('Apprentice', 2, 'Learning the basics', 100, ''),
  ('Initiate', 3, 'Grasping fundamental concepts', 300, ''),
  ('Journeyman', 4, 'Applying knowledge independently', 600, ''),
  ('Craftsman', 5, 'Skilled in multiple areas', 1000, '');

-- Insert sample courses
INSERT INTO public.courses (code, title, description, min_rank_id)
VALUES
  ('CS101', 'Introduction to Programming', 'Learn the basics of programming with Python', 1),
  ('CS201', 'Object-Oriented Programming', 'Master object-oriented concepts and design patterns', 3);

-- Insert sample levels for CS101
INSERT INTO public.levels (course_id, level_number, title, description, points)
VALUES
  ((SELECT id FROM public.courses WHERE code = 'CS101'), 1, 'Computing Fundamentals', 'Introduction to computing concepts and basic programming', 50),
  ((SELECT id FROM public.courses WHERE code = 'CS101'), 2, 'Programming Basics', 'Variables, data types, and basic operations', 50),
  ((SELECT id FROM public.courses WHERE code = 'CS101'), 3, 'Control Structures', 'Conditionals, loops, and basic problem solving', 75),
  ((SELECT id FROM public.courses WHERE code = 'CS101'), 4, 'Functions and Arrays', 'Working with functions and basic data structures', 75);

-- Insert sample levels for CS201
INSERT INTO public.levels (course_id, level_number, title, description, points)
VALUES
  ((SELECT id FROM public.courses WHERE code = 'CS201'), 1, 'Classes and Objects', 'Introduction to object-oriented programming', 100),
  ((SELECT id FROM public.courses WHERE code = 'CS201'), 2, 'Inheritance', 'Understanding inheritance and polymorphism', 100),
  ((SELECT id FROM public.courses WHERE code = 'CS201'), 3, 'Design Patterns', 'Common OOP design patterns and their applications', 125),
  ((SELECT id FROM public.courses WHERE code = 'CS201'), 4, 'Advanced OOP', 'Advanced object-oriented concepts and practices', 125);

-- Insert sample achievements
INSERT INTO public.achievements (name, description, image_url, required_points, required_rank_id)
VALUES
  ('First Steps', 'Complete your first programming lesson', '', 50, 1),
  ('Quick Learner', 'Complete 5 levels in record time', '', 500, 2),
  ('Code Warrior', 'Reach Journeyman rank', '', 600, 4),
  ('Skill Master', 'Master all fundamental programming skills', '', 1000, 5);

-- Insert sample skills
INSERT INTO public.skills (name, category, description)
VALUES
  ('Programming Basics', 'Fundamentals', 'Understanding of variables, control structures, and functions'),
  ('Problem Solving', 'Fundamentals', 'Ability to break down and solve programming problems'),
  ('Data Structures', 'Intermediate', 'Knowledge of arrays, lists, stacks, queues, and trees'),
  ('Algorithms', 'Intermediate', 'Understanding of sorting, searching, and optimization algorithms'),
  ('Object-Oriented Programming', 'Intermediate', 'Mastery of classes, inheritance, and polymorphism');

-- Insert sample career paths
INSERT INTO public.career_paths (title, description, required_skills, min_rank_id, salary_range)
VALUES
  ('Frontend Developer', 'Build user interfaces and web applications', ARRAY['Programming Basics', 'Problem Solving'], 3, '$60,000 - $120,000'),
  ('Backend Developer', 'Create server-side logic and APIs', ARRAY['Programming Basics', 'Data Structures', 'Algorithms'], 4, '$70,000 - $130,000'),
  ('Full Stack Developer', 'Work on both client and server sides', ARRAY['Programming Basics', 'Problem Solving', 'Data Structures', 'Object-Oriented Programming'], 5, '$80,000 - $150,000');
