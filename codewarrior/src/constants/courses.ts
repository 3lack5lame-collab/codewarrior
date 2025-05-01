import { Course } from '../types/ranks';

export const COURSES: Course[] = [
  {
    id: 'cs101',
    code: 'CS101',
    name: 'Introduction to Computer Science',
    description: 'Foundational concepts in computer science and programming',
    levels: [
      {
        id: 'cs101-1',
        name: 'Computing Fundamentals',
        description: 'Introduction to computing concepts and basic programming',
        points: 100,
        requiredSkills: ['Basic Computer Usage']
      },
      {
        id: 'cs101-2',
        name: 'Programming Basics',
        description: 'Variables, data types, and basic operations',
        points: 150,
        requiredSkills: ['Computing Fundamentals']
      },
      {
        id: 'cs101-3',
        name: 'Control Structures',
        description: 'Conditionals, loops, and basic problem solving',
        points: 200,
        requiredSkills: ['Programming Basics']
      },
      {
        id: 'cs101-4',
        name: 'Functions and Arrays',
        description: 'Working with functions and basic data structures',
        points: 250,
        requiredSkills: ['Control Structures']
      }
    ],
    careers: [
      {
        title: 'Junior Developer',
        description: 'Entry-level software development position',
        requiredSkills: ['Programming Basics', 'Problem Solving'],
        potentialRoles: ['Junior Software Developer', 'Junior Web Developer'],
        averageSalary: '$50,000 - $70,000',
        industryDemand: 'High'
      }
    ]
  },
  {
    id: 'cs201',
    code: 'CS201',
    name: 'Object-Oriented Programming',
    description: 'Deep dive into OOP concepts and design patterns',
    prerequisites: ['CS101'],
    levels: [
      {
        id: 'cs201-1',
        name: 'Classes and Objects',
        description: 'Introduction to object-oriented programming',
        points: 300,
        requiredSkills: ['Functions and Arrays']
      },
      {
        id: 'cs201-2',
        name: 'Inheritance',
        description: 'Understanding inheritance and polymorphism',
        points: 350,
        requiredSkills: ['Classes and Objects']
      },
      {
        id: 'cs201-3',
        name: 'Design Patterns',
        description: 'Common OOP design patterns and their applications',
        points: 400,
        requiredSkills: ['Inheritance']
      },
      {
        id: 'cs201-4',
        name: 'Advanced OOP',
        description: 'Advanced object-oriented concepts and practices',
        points: 450,
        requiredSkills: ['Design Patterns']
      }
    ],
    careers: [
      {
        title: 'Software Developer',
        description: 'Mid-level software development position',
        requiredSkills: ['OOP', 'Design Patterns', 'Problem Solving'],
        potentialRoles: ['Software Developer', 'Full Stack Developer'],
        averageSalary: '$70,000 - $100,000',
        industryDemand: 'High'
      }
    ]
  }
];