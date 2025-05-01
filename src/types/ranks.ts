export interface CareerStage {
  skills: string[];
}

export interface Rank {
  id: number;
  name: string;
  level: number;
  description: string;
  requiredPoints: number;
  imageUrl: string;
  careerStage: CareerStage;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface CourseLevel {
  id: number;
  courseId: number;
  levelNumber: number;
  title: string;
  description: string;
  points: number;
}

export interface Course {
  id: number;
  code: string;
  title: string;
  description: string;
  minRankId: number;
  imageUrl: string;
  levels: CourseLevel[];
}

export interface CareerPath {
  id: number;
  title: string;
  description: string;
  requiredSkills: string[];
  minRankId: number;
  salaryRange: string;
  imageUrl: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  deadline: string;
  requiredTech: string[];
  minRankId: number;
  points: number;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  description: string;
}
