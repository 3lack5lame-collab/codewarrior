import { Rank } from '../types/ranks';

export const RANKS: Rank[] = [
  {
    id: 1,
    name: 'Novice',
    level: [1, 2],
    courseLevel: 'CS101',
    careerStage: {
      title: 'Student/Intern',
      roles: ['Intern', 'Code Camp Participant', 'Junior QA Tester'],
      salaryRange: 'Entry-level/Internship',
      skills: ['Basic Programming', 'Problem Solving', 'Version Control'],
      responsibilities: ['Learning fundamentals', 'Completing basic exercises', 'Contributing to small tasks']
    },
    requirements: {
      courseLevels: ['CS101-1', 'CS101-2'],
      projects: 2,
      skills: ['Basic syntax', 'Simple algorithms', 'Git basics']
    }
  },
  {
    id: 2,
    name: 'Apprentice',
    level: [3, 4],
    courseLevel: 'CS101',
    careerStage: {
      title: 'Junior Developer',
      roles: ['Junior Software Developer', 'Junior Web Developer', 'Technical Support'],
      salaryRange: '$50,000-$70,000',
      skills: ['OOP Basics', 'Debugging', 'Team Collaboration'],
      responsibilities: ['Writing basic features', 'Bug fixing', 'Code documentation']
    },
    requirements: {
      courseLevels: ['CS101-3', 'CS101-4'],
      projects: 3,
      skills: ['OOP', 'Basic debugging', 'Team tools']
    }
  },
  // Add more ranks following the same pattern...
];