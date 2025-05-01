import { supabase } from '../lib/supabase';
import { Course, CourseLevel } from '../types/ranks';

export class CourseService {
  /**
   * Get all courses
   */
  async getAllCourses(): Promise<{ courses: Course[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*');

      if (error) {
        throw error;
      }

      const courses: Course[] = data.map(item => ({
        id: item.id,
        code: item.code,
        title: item.title,
        description: item.description,
        minRankId: item.min_rank_id,
        imageUrl: item.image_url || '',
        levels: [] // Levels will be loaded separately
      }));

      return { courses, error: null };
    } catch (error) {
      console.error('Get all courses error:', error);
      return { courses: [], error: error as Error };
    }
  }

  /**
   * Get courses available for a specific rank
   */
  async getCoursesForRank(rankId: number): Promise<{ courses: Course[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .lte('min_rank_id', rankId);

      if (error) {
        throw error;
      }

      const courses: Course[] = data.map(item => ({
        id: item.id,
        code: item.code,
        title: item.title,
        description: item.description,
        minRankId: item.min_rank_id,
        imageUrl: item.image_url || '',
        levels: [] // Levels will be loaded separately
      }));

      return { courses, error: null };
    } catch (error) {
      console.error('Get courses for rank error:', error);
      return { courses: [], error: error as Error };
    }
  }

  /**
   * Get course by ID with levels
   */
  async getCourseById(courseId: number): Promise<{ course: Course | null; error: Error | null }> {
    try {
      // Get course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) {
        throw courseError;
      }

      if (!courseData) {
        return { course: null, error: null };
      }

      // Get levels for the course
      const { data: levelsData, error: levelsError } = await supabase
        .from('levels')
        .select('*')
        .eq('course_id', courseId)
        .order('level_number', { ascending: true });

      if (levelsError) {
        throw levelsError;
      }

      const levels: CourseLevel[] = levelsData.map(item => ({
        id: item.id,
        courseId: item.course_id,
        levelNumber: item.level_number,
        title: item.title,
        description: item.description,
        points: item.points
      }));

      const course: Course = {
        id: courseData.id,
        code: courseData.code,
        title: courseData.title,
        description: courseData.description,
        minRankId: courseData.min_rank_id,
        imageUrl: courseData.image_url || '',
        levels
      };

      return { course, error: null };
    } catch (error) {
      console.error('Get course by ID error:', error);
      return { course: null, error: error as Error };
    }
  }

  /**
   * Get level by ID
   */
  async getLevelById(levelId: number): Promise<{ level: CourseLevel | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('levels')
        .select('*')
        .eq('id', levelId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        return { level: null, error: null };
      }

      const level: CourseLevel = {
        id: data.id,
        courseId: data.course_id,
        levelNumber: data.level_number,
        title: data.title,
        description: data.description,
        points: data.points
      };

      return { level, error: null };
    } catch (error) {
      console.error('Get level by ID error:', error);
      return { level: null, error: error as Error };
    }
  }

  /**
   * Get user's course progress
   */
  async getUserCourseProgress(userId: string): Promise<{ 
    completedLevels: number[]; 
    courseProgress: Record<number, number>; 
    error: Error | null 
  }> {
    try {
      // Get completed levels
      const { data: completedData, error: completedError } = await supabase
        .from('completed_levels')
        .select('level_id, levels(course_id)')
        .eq('user_id', userId);

      if (completedError) {
        throw completedError;
      }

      // Extract level IDs
      const completedLevels = completedData.map(item => item.level_id);

      // Calculate progress per course
      const courseProgress: Record<number, number> = {};
      
      // Get all courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id');

      if (coursesError) {
        throw coursesError;
      }

      // For each course, calculate completion percentage
      for (const course of coursesData) {
        const courseId = course.id;
        
        // Get total levels for this course
        const { data: levelsData, error: levelsError } = await supabase
          .from('levels')
          .select('id')
          .eq('course_id', courseId);

        if (levelsError) {
          throw levelsError;
        }

        const totalLevels = levelsData.length;
        if (totalLevels === 0) {
          courseProgress[courseId] = 0;
          continue;
        }

        // Count completed levels for this course
        const completedForCourse = completedData.filter(
          item => item.levels.course_id === courseId
        ).length;

        // Calculate percentage
        courseProgress[courseId] = Math.floor((completedForCourse / totalLevels) * 100);
      }

      return { completedLevels, courseProgress, error: null };
    } catch (error) {
      console.error('Get user course progress error:', error);
      return { completedLevels: [], courseProgress: {}, error: error as Error };
    }
  }
}
