-- Create tables for CodeWarrior app

-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ranks table
CREATE TABLE IF NOT EXISTS ranks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  level INTEGER NOT NULL,
  description TEXT NOT NULL,
  required_points INTEGER NOT NULL,
  image_url TEXT
);

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL
);

-- Create user_skills table
CREATE TABLE IF NOT EXISTS user_skills (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
  proficiency INTEGER DEFAULT 1,
  UNIQUE(user_id, skill_id)
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  min_rank_id INTEGER REFERENCES ranks(id) ON DELETE SET NULL,
  image_url TEXT
);

-- Create levels table
CREATE TABLE IF NOT EXISTS levels (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  level_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL,
  UNIQUE(course_id, level_number)
);

-- Create completed_levels table
CREATE TABLE IF NOT EXISTS completed_levels (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  level_id INTEGER REFERENCES levels(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, level_id)
);

-- Create career_paths table
CREATE TABLE IF NOT EXISTS career_paths (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  required_skills TEXT[] NOT NULL,
  min_rank_id INTEGER REFERENCES ranks(id) ON DELETE SET NULL,
  salary_range TEXT NOT NULL,
  image_url TEXT
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  required_points INTEGER,
  required_rank_id INTEGER REFERENCES ranks(id) ON DELETE SET NULL
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE,
  required_tech TEXT[],
  min_rank_id INTEGER REFERENCES ranks(id) ON DELETE SET NULL,
  points INTEGER NOT NULL
);

-- Create user_challenges table
CREATE TABLE IF NOT EXISTS user_challenges (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress',
  submitted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, challenge_id)
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  current_rank_id INTEGER REFERENCES ranks(id) ON DELETE SET NULL,
  total_points INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- User skills policies
CREATE POLICY "User skills are viewable by the user" 
ON user_skills FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own skills" 
ON user_skills FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills" 
ON user_skills FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skills" 
ON user_skills FOR DELETE USING (auth.uid() = user_id);

-- Completed levels policies
CREATE POLICY "Completed levels are viewable by the user" 
ON completed_levels FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completed levels" 
ON completed_levels FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User achievements policies
CREATE POLICY "User achievements are viewable by the user" 
ON user_achievements FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" 
ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User challenges policies
CREATE POLICY "User challenges are viewable by the user" 
ON user_challenges FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenges" 
ON user_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges" 
ON user_challenges FOR UPDATE USING (auth.uid() = user_id);

-- User progress policies
CREATE POLICY "User progress is viewable by the user" 
ON user_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" 
ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON user_progress FOR UPDATE USING (auth.uid() = user_id);

-- Create functions and triggers
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.email, '');
  
  INSERT INTO public.user_progress (user_id, current_rank_id, total_points)
  VALUES (new.id, 1, 0);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_user_points() 
RETURNS TRIGGER AS $$
DECLARE
  points_earned INTEGER;
  user_total_points INTEGER;
  next_rank_id INTEGER;
BEGIN
  -- Get points for the completed level
  SELECT points INTO points_earned FROM levels WHERE id = NEW.level_id;
  
  -- Update user's total points
  UPDATE user_progress 
  SET total_points = total_points + points_earned,
      updated_at = NOW()
  WHERE user_id = NEW.user_id
  RETURNING total_points INTO user_total_points;
  
  -- Check if user should be promoted to next rank
  SELECT id INTO next_rank_id 
  FROM ranks 
  WHERE required_points <= user_total_points 
  ORDER BY required_points DESC 
  LIMIT 1;
  
  IF next_rank_id IS NOT NULL THEN
    UPDATE user_progress 
    SET current_rank_id = next_rank_id,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_level_completed
  AFTER INSERT ON completed_levels
  FOR EACH ROW EXECUTE PROCEDURE public.update_user_points();

-- Insert initial data
-- Ranks
INSERT INTO ranks (name, level, description, required_points, image_url) VALUES
('Novice', 1, 'Beginning your coding journey', 0, 'https://example.com/novice.png'),
('Apprentice', 2, 'Learning the fundamentals', 500, 'https://example.com/apprentice.png'),
('Journeyman', 3, 'Building real projects', 1500, 'https://example.com/journeyman.png'),
('Craftsman', 4, 'Mastering advanced concepts', 3000, 'https://example.com/craftsman.png'),
('Master', 5, 'Expert level skills', 6000, 'https://example.com/master.png');

-- Skills
INSERT INTO skills (name, category, description) VALUES
('JavaScript', 'Programming', 'Modern JavaScript programming'),
('TypeScript', 'Programming', 'Typed JavaScript programming'),
('React', 'Frontend', 'React library for building user interfaces'),
('Node.js', 'Backend', 'JavaScript runtime for server-side development'),
('SQL', 'Database', 'Structured Query Language for databases'),
('Git', 'Tools', 'Version control system'),
('CSS', 'Frontend', 'Cascading Style Sheets for web design'),
('HTML', 'Frontend', 'HyperText Markup Language for web structure'),
('Python', 'Programming', 'Python programming language'),
('Java', 'Programming', 'Java programming language');

-- Courses
INSERT INTO courses (code, title, description, min_rank_id, image_url) VALUES
('JS101', 'JavaScript Fundamentals', 'Learn the basics of JavaScript programming', 1, 'https://example.com/js101.png'),
('TS101', 'TypeScript Essentials', 'Introduction to TypeScript', 1, 'https://example.com/ts101.png'),
('REACT101', 'React Basics', 'Getting started with React', 2, 'https://example.com/react101.png'),
('NODE101', 'Node.js Fundamentals', 'Server-side JavaScript with Node.js', 2, 'https://example.com/node101.png'),
('DB101', 'Database Fundamentals', 'Introduction to databases and SQL', 2, 'https://example.com/db101.png');

-- Levels for JavaScript Fundamentals
INSERT INTO levels (course_id, level_number, title, description, points) VALUES
(1, 1, 'JavaScript Basics', 'Variables, data types, and operators', 50),
(1, 2, 'Control Flow', 'Conditionals and loops', 75),
(1, 3, 'Functions', 'Function declarations and expressions', 100),
(1, 4, 'Arrays and Objects', 'Working with complex data structures', 125),
(1, 5, 'DOM Manipulation', 'Interacting with the Document Object Model', 150);

-- Levels for TypeScript Essentials
INSERT INTO levels (course_id, level_number, title, description, points) VALUES
(2, 1, 'TypeScript Basics', 'Types, interfaces, and type assertions', 75),
(2, 2, 'Advanced Types', 'Union types, intersection types, and generics', 100),
(2, 3, 'Classes and Interfaces', 'Object-oriented programming in TypeScript', 125),
(2, 4, 'Modules and Namespaces', 'Organizing code in TypeScript', 150),
(2, 5, 'TypeScript with React', 'Using TypeScript in React applications', 175);

-- Career Paths
INSERT INTO career_paths (title, description, required_skills, min_rank_id, salary_range, image_url) VALUES
('Frontend Developer', 'Build user interfaces and interactive web applications', ARRAY['JavaScript', 'HTML', 'CSS', 'React'], 2, '$60,000 - $100,000', 'https://example.com/frontend.png'),
('Backend Developer', 'Develop server-side logic and APIs', ARRAY['JavaScript', 'Node.js', 'SQL'], 2, '$70,000 - $110,000', 'https://example.com/backend.png'),
('Full Stack Developer', 'Work on both frontend and backend technologies', ARRAY['JavaScript', 'React', 'Node.js', 'SQL'], 3, '$80,000 - $120,000', 'https://example.com/fullstack.png'),
('DevOps Engineer', 'Manage deployment, scaling, and operations', ARRAY['Git', 'Python', 'JavaScript'], 4, '$90,000 - $130,000', 'https://example.com/devops.png');

-- Achievements
INSERT INTO achievements (name, description, image_url, required_points, required_rank_id) VALUES
('First Steps', 'Complete your first course level', 'https://example.com/first-steps.png', 50, NULL),
('Quick Learner', 'Complete 5 course levels', 'https://example.com/quick-learner.png', 250, NULL),
('JavaScript Ninja', 'Complete all JavaScript Fundamentals levels', 'https://example.com/js-ninja.png', 500, 2),
('TypeScript Wizard', 'Complete all TypeScript Essentials levels', 'https://example.com/ts-wizard.png', 625, 2),
('Rising Star', 'Reach Journeyman rank', 'https://example.com/rising-star.png', 1500, 3);

-- Challenges
INSERT INTO challenges (title, description, deadline, required_tech, min_rank_id, points) VALUES
('Build a Todo App', 'Create a simple todo application with React', '2023-12-31', ARRAY['JavaScript', 'React'], 2, 200),
('Create a REST API', 'Build a RESTful API with Node.js and Express', '2023-12-31', ARRAY['JavaScript', 'Node.js'], 2, 250),
('Full Stack Project', 'Develop a full stack application with React and Node.js', '2023-12-31', ARRAY['JavaScript', 'React', 'Node.js', 'SQL'], 3, 500);
