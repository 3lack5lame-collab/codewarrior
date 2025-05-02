export interface Rank {
  id: number;
  name: string;
  level: number;
  description: string;
  requiredPoints: number;
  imageUrl: string;
  careerStage: CareerStage;
}

export interface CareerStage {
  title: string;
  roles: string[];
  salaryRange: string;
  skills: string[];
  responsibilities: string[];
}

export interface Requirements {
  courseLevels: string[];
  projects: number;
  skills: string[];
  experience?: string;
}

export interface CourseLevel {
  id: number;
  courseId: number;
  levelNumber: number;
  title: string;
  description: string;
  points: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  requirements?: {
    courseLevelId?: string;
    pointsNeeded?: number;
    skillsNeeded?: string[];
  };
}

export interface Course {
  id: number;
  code: string;
  title: string;
  description: string;
  minRankId: number;
  imageUrl: string;
  levels: CourseLevel[];
  prerequisites?: string[];
  careers?: CareerPath[];
}

export interface CareerPath {
  id?: number;
  title: string;
  description: string;
  requiredSkills: string[];
  minRankId?: number;
  salaryRange: string;
  imageUrl?: string;
  potentialRoles?: string[];
  industryDemand?: "Low" | "Medium" | "High";
}

export interface Challenge {
  id: number;
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