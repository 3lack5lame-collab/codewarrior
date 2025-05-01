export interface Rank {
  id: number;
  name: string;
  level: number[];
  courseLevel: string;
  careerStage: CareerStage;
  requirements: Requirements;
}

// Example usage of the interfaces
const exampleRank: Rank = {
  id: 1,
  name: "Senior Developer",
  level: [1, 2, 3],
  courseLevel: "Advanced",
  careerStage: {
    title: "Senior",
    roles: ["Developer", "Mentor"],
    salaryRange: "$80,000 - $120,000",
    skills: ["TypeScript", "React", "Node.js"],
    responsibilities: ["Code review", "Mentorship", "Project management"]
  },
  requirements: {
    courseLevels: ["Intermediate", "Advanced"],
    projects: 5,
    skills: ["Problem-solving", "Teamwork"],
    experience: "5+ years"
  }
};

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
  id: string;
  name: string;
  description: string;
  points: number;
  requiredSkills: string[];
}