import { CareerPath } from '../types/ranks';

export const CAREER_PATHS: CareerPath[] = [
  {
    title: 'Software Development',
    description: 'Focus on building applications and systems',
    requiredSkills: [
      'Programming Fundamentals',
      'Data Structures',
      'Algorithms',
      'System Design'
    ],
    potentialRoles: [
      'Junior Developer',
      'Software Engineer',
      'Senior Developer',
      'Technical Lead',
      'Software Architect'
    ],
    averageSalary: '$70,000 - $150,000',
    industryDemand: 'High'
  },
  {
    title: 'Web Development',
    description: 'Specialization in web technologies and applications',
    requiredSkills: [
      'HTML/CSS',
      'JavaScript',
      'Frontend Frameworks',
      'Backend Development'
    ],
    potentialRoles: [
      'Frontend Developer',
      'Backend Developer',
      'Full Stack Developer',
      'Web Architect'
    ],
    averageSalary: '$65,000 - $140,000',
    industryDemand: 'High'
  },
  {
    title: 'DevOps Engineering',
    description: 'Focus on deployment, automation, and infrastructure',
    requiredSkills: [
      'Linux/Unix',
      'Cloud Platforms',
      'CI/CD',
      'Infrastructure as Code'
    ],
    potentialRoles: [
      'DevOps Engineer',
      'Site Reliability Engineer',
      'Cloud Architect',
      'Platform Engineer'
    ],
    averageSalary: '$80,000 - $160,000',
    industryDemand: 'High'
  }
];