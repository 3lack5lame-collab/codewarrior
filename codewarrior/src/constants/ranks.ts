import { Rank } from '../types/ranks';

export const RANKS: Rank[] = [
  {
    id: 1,
    name: 'Novice',
    level: [1],
    courseLevel: 'CS101-1',
    points: 0,
    careerStage: {
      title: 'Student/Intern',
      roles: ['Intern', 'Junior QA Tester'],
      salaryRange: 'Internship Level',
      skills: ['Basic Programming', 'Problem Solving'],
      responsibilities: ['Learning fundamentals', 'Basic testing']
    },
    requirements: {
      courseLevels: ['CS101-1'],
      projects: 1,
      skills: ['Basic Computer Usage']
    },
    badges: []
  },
  {
    id: 2,
    name: 'Apprentice',
    level: [2],
    courseLevel: 'CS101-2',
    points: 100,
    careerStage: {
      title: 'Junior Developer Trainee',
      roles: ['Junior Developer', 'QA Engineer'],
      salaryRange: '$45,000 - $60,000',
      skills: ['Programming Basics', 'Testing'],
      responsibilities: ['Writing simple code', 'Bug fixing']
    },
    requirements: {
      courseLevels: ['CS101-1', 'CS101-2'],
      projects: 2,
      skills: ['Programming Basics']
    },
    badges: []
  },
  {
    id: 3,
    name: 'Initiate',
    level: [3],
    courseLevel: 'CS101-3',
    points: 250,
    careerStage: {
      title: 'Junior Developer',
      roles: ['Software Developer', 'Web Developer'],
      salaryRange: '$55,000 - $75,000',
      skills: ['Control Structures', 'Basic Algorithms'],
      responsibilities: ['Feature development', 'Code maintenance']
    },
    requirements: {
      courseLevels: ['CS101-1', 'CS101-2', 'CS101-3'],
      projects: 3,
      skills: ['Control Structures']
    },
    badges: []
  },
  {
    id: 4,
    name: 'Journeyman',
    level: [4],
    courseLevel: 'CS101-4',
    points: 500,
    careerStage: {
      title: 'Developer',
      roles: ['Software Engineer', 'Full Stack Developer'],
      salaryRange: '$65,000 - $90,000',
      skills: ['Functions', 'Data Structures', 'Web Development'],
      responsibilities: ['Complex features', 'Code optimization']
    },
    requirements: {
      courseLevels: ['CS101-1', 'CS101-2', 'CS101-3', 'CS101-4'],
      projects: 4,
      skills: ['Functions', 'Arrays']
    },
    badges: []
  },
  {
    id: 5,
    name: 'Craftsman',
    level: [5],
    courseLevel: 'CS201-1',
    points: 800,
    careerStage: {
      title: 'Senior Developer',
      roles: ['Senior Engineer', 'Team Lead'],
      salaryRange: '$85,000 - $120,000',
      skills: ['OOP', 'System Design', 'Leadership'],
      responsibilities: ['Architecture', 'Team mentoring']
    },
    requirements: {
      courseLevels: ['CS201-1'],
      projects: 5,
      skills: ['OOP Fundamentals']
    },
    badges: []
  }
];