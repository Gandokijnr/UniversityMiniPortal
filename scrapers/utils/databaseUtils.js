/**
 * 🗄️ Database Utilities
 * 
 * Consolidated database operations for scrapers
 * Eliminates duplicate Supabase operations across scraper files
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Database operations for scrapers
 */
export class DatabaseUtils {
  constructor() {
    this.supabase = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
    );
  }

  /**
   * Ensure university exists in database
   */
  async ensureUniversityExists(university) {
    const { data: existing } = await this.supabase
      .from('universities')
      .select('*')
      .eq('name', university.name)
      .single();
    
    if (existing) return existing;
    
    const { data, error } = await this.supabase
      .from('universities')
      .insert({
        name: university.name,
        country: 'UK',
        city: this.getUniversityLocation(university.name),
        website_url: university.baseUrl,
        description: `${university.name} - Leading UK university`,
        logo_url: 'https://via.placeholder.com/200x200/ea580c/ffffff?text=University'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * Ensure department exists in database
   */
  async ensureDepartmentExists(universityId, departmentName = 'Department of Computer Science') {
    const { data: existing } = await this.supabase
      .from('departments')
      .select('*')
      .eq('university_id', universityId)
      .eq('name', departmentName)
      .single();
    
    if (existing) return existing;
    
    const { data, error } = await this.supabase
      .from('departments')
      .insert({
        university_id: universityId,
        name: departmentName,
        code: this.generateDepartmentCode(departmentName),
        description: `${departmentName} offering advanced programs`
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * Ensure course type exists in database
   */
  async ensureCourseTypeExists(typeName = 'MSc') {
    const { data: existing } = await this.supabase
      .from('course_types')
      .select('*')
      .eq('name', typeName)
      .single();
    
    if (existing) return existing;
    
    const { data, error } = await this.supabase
      .from('course_types')
      .insert({
        name: typeName,
        description: typeName === 'MSc' ? 'Master of Science' : typeName
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * Store courses in database with duplicate checking
   */
  async storeCourses(courses, university) {
    let storedCount = 0;
    
    try {
      // Ensure university exists
      const universityRecord = await this.ensureUniversityExists(university);
      
      // Ensure department exists
      const departmentRecord = await this.ensureDepartmentExists(universityRecord.id);
      
      // Ensure course type exists
      const courseTypeRecord = await this.ensureCourseTypeExists();
      
      for (const course of courses) {
        try {
          // Check if course already exists
          const { data: existing } = await this.supabase
            .from('courses_v2')
            .select('id')
            .eq('title', course.title)
            .eq('university_id', universityRecord.id)
            .single();
          
          if (existing) {
            console.log(`  Course "${course.title}" already exists, updating...`);
            
            // Update existing course
            const { error } = await this.supabase
              .from('courses_v2')
              .update({
                ...course,
                university_id: universityRecord.id,
                department_id: departmentRecord.id,
                course_type_id: courseTypeRecord.id,
                updated_at: new Date().toISOString()
              })
              .eq('id', existing.id);
            
            if (!error) storedCount++;
          } else {
            // Insert new course
            const { error } = await this.supabase
              .from('courses_v2')
              .insert({
                ...course,
                university_id: universityRecord.id,
                department_id: departmentRecord.id,
                course_type_id: courseTypeRecord.id
              });
            
            if (!error) {
              storedCount++;
              console.log(`  ✅ Stored: ${course.title}`);
            } else {
              console.error(`  ❌ Failed to store "${course.title}":`, error.message);
            }
          }
        } catch (error) {
          console.error(`  ❌ Error processing "${course.title}":`, error.message);
        }
      }
    } catch (error) {
      console.error(`❌ Error storing courses for ${university.name}:`, error.message);
    }
    
    return storedCount;
  }

  /**
   * Batch insert courses for better performance
   */
  async batchInsertCourses(courses, universityId, departmentId, courseTypeId) {
    const batchSize = 10;
    let totalInserted = 0;

    for (let i = 0; i < courses.length; i += batchSize) {
      const batch = courses.slice(i, i + batchSize);
      
      const coursesToInsert = batch.map(course => ({
        ...course,
        university_id: universityId,
        department_id: departmentId,
        course_type_id: courseTypeId,
        created_at: new Date().toISOString()
      }));

      try {
        const { data, error } = await this.supabase
          .from('courses_v2')
          .insert(coursesToInsert)
          .select();

        if (error) {
          console.error('❌ Batch insert error:', error.message);
        } else {
          totalInserted += data.length;
          console.log(`✅ Inserted batch of ${data.length} courses`);
        }
      } catch (error) {
        console.error('❌ Batch insert failed:', error.message);
      }

      // Small delay between batches
      await this.delay(1000);
    }

    return totalInserted;
  }

  /**
   * Check if course exists
   */
  async courseExists(title, universityId) {
    const { data } = await this.supabase
      .from('courses_v2')
      .select('id')
      .eq('title', title)
      .eq('university_id', universityId)
      .single();
    
    return !!data;
  }

  /**
   * Get courses count by university
   */
  async getCoursesCountByUniversity(universityId) {
    const { count, error } = await this.supabase
      .from('courses_v2')
      .select('*', { count: 'exact', head: true })
      .eq('university_id', universityId);
    
    if (error) throw error;
    return count || 0;
  }

  /**
   * Delete courses by university (for refresh)
   */
  async deleteUniversityCourses(universityId) {
    const { error } = await this.supabase
      .from('courses_v2')
      .delete()
      .eq('university_id', universityId);
    
    if (error) throw error;
    console.log(`🗑️ Deleted existing courses for university ${universityId}`);
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats() {
    try {
      const [coursesResult, universitiesResult, departmentsResult] = await Promise.all([
        this.supabase.from('courses_v2').select('*', { count: 'exact', head: true }),
        this.supabase.from('universities').select('*', { count: 'exact', head: true }),
        this.supabase.from('departments').select('*', { count: 'exact', head: true })
      ]);

      return {
        courses: coursesResult.count || 0,
        universities: universitiesResult.count || 0,
        departments: departmentsResult.count || 0
      };
    } catch (error) {
      console.error('❌ Error getting database stats:', error.message);
      return { courses: 0, universities: 0, departments: 0 };
    }
  }

  /**
   * Helper methods
   */
  getUniversityLocation(universityName) {
    const locationMap = {
      'University of Oxford': 'Oxford',
      'University of Edinburgh': 'Edinburgh',
      'Imperial College London': 'London',
      'University of Manchester': 'Manchester',
      'King\'s College London': 'London',
      'University of Bristol': 'Bristol'
    };
    
    return locationMap[universityName] || 'UK';
  }

  generateDepartmentCode(departmentName) {
    if (departmentName.toLowerCase().includes('computer')) return 'CS';
    if (departmentName.toLowerCase().includes('engineering')) return 'ENG';
    if (departmentName.toLowerCase().includes('business')) return 'BUS';
    if (departmentName.toLowerCase().includes('informatics')) return 'INF';
    
    return 'DEPT';
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Singleton instance for easy import
 */
export const dbUtils = new DatabaseUtils();
export default DatabaseUtils;
