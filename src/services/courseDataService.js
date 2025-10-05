import { supabase } from '../lib/supabase.js'

/**
 * Production-Ready Course Data Service
 * ONLY uses real scraped data stored in Supabase database
 * NO mock data, NO static data - authentic university course information only
 */
export class CourseDataService {
  
  /**
   * Initialize the service - checks if data exists in Supabase
   */
  static async initializeData() {
    try {
      console.log('🎓 Checking Supabase for course data...');
      
      // Check if we have courses in the database
      const courses = await this.getAllCourses();
      
      if (!courses || courses.length === 0) {
        console.warn('⚠️ No course data found in database');
        console.log('💡 Run enhanced scraper to populate: npm run scrape:enhanced');
        return { success: true, source: 'no_data', message: 'No course data in database - run scraper first' };
      }

      console.log(`✅ Found ${courses.length} courses in database`);
      return { success: true, source: 'supabase_data', courseCount: courses.length }
    } catch (error) {
      console.error('❌ Error checking course data:', error)
      return { success: false, error: error.message }
    }
  }
  
  /**
   * Check database status and provide guidance
   */
  static async getDatabaseStatus() {
    try {
      const courses = await this.getAllCourses();
      const universities = await this.getUniversities();
      const departments = await this.getDepartmentsByUniversity();
      
      return {
        coursesCount: courses.length,
        universitiesCount: universities.length,
        departmentsCount: departments.length,
        lastUpdated: courses.length > 0 ? courses[0].last_scraped_at : null,
        isEmpty: courses.length === 0
      };
    } catch (error) {
      console.error('❌ Error checking database status:', error);
      return {
        coursesCount: 0,
        universitiesCount: 0,
        departmentsCount: 0,
        lastUpdated: null,
        isEmpty: true,
        error: error.message
      };
    }
  }

  /**
   * Refresh course data by running the enhanced scraper
   */
  static async refreshCourseData() {
    console.log('🔄 To refresh course data, run: npm run scrape:enhanced');
    console.log('💡 This will fetch fresh data from university websites and store in Supabase');
    
    // Return current database status
    return await this.getDatabaseStatus();
  }

  /**
   * Extract university name from location string
   */
  static extractUniversityFromLocation(location) {
    if (!location) return null;
    
    const locationMap = {
      'London': 'Imperial College London', // Default for London
      'Bristol': 'University of Bristol'
    };
    
    for (const [city, university] of Object.entries(locationMap)) {
      if (location.includes(city)) {
        return university;
      }
    }
    
    return null;
  }
  
  
  /**
   * Get data source information
   */
  static async getDataSourceInfo() {
    const status = await this.getDatabaseStatus();
    return {
      source: 'supabase_database',
      timestamp: new Date().toISOString(),
      cached: false,
      courseCount: status.coursesCount,
      lastUpdated: status.lastUpdated,
      isEmpty: status.isEmpty
    };
  }
  
  
  // Removed populateMultiUniversityData - no longer using hardcoded sample data
  
  /**
   * Ensure University exists in the database (dynamic creation from scraped data)
   */
  static async ensureUniversityExists(universityName, universityData = null) {
    if (!universityName) {
      throw new Error('University name is required');
    }
    
    const { data: existing } = await supabase
      .from('universities')
      .select('*')
      .eq('name', universityName)
      .single()
    
    if (existing) {
      return existing
    }
    
    // Create university dynamically from scraped data
    const insertData = {
      name: universityName,
      country: universityData?.country || 'UK',
      city: universityData?.city || this.extractCityFromUniversityName(universityName),
      website_url: universityData?.website_url || this.generateWebsiteUrl(universityName),
      ranking: universityData?.ranking || null,
      established_year: universityData?.established_year || null,
      description: universityData?.description || `${universityName} - A leading UK university`,
      logo_url: 'https://via.placeholder.com/200x200/ea580c/ffffff?text=University'
    };
    
    const { data, error } = await supabase
      .from('universities')
      .insert(insertData)
      .select()
      .single()
    
    if (error) throw error
    console.log(`✅ Created university: ${universityName}`);
    return data
  }
  
  /**
   * Ensure Department exists (dynamic creation from scraped data)
   */
  static async ensureDepartmentExists(universityId, departmentName, departmentData = null) {
    if (!departmentName) {
      departmentName = 'Department of Computer Science'; // Default for scraped courses
    }
    
    const { data: existing } = await supabase
      .from('departments')
      .select('*')
      .eq('university_id', universityId)
      .eq('name', departmentName)
      .single()
    
    if (existing) {
      return existing
    }
    
    // Create department dynamically
    const insertData = {
      university_id: universityId,
      name: departmentName,
      code: departmentData?.code || this.generateDepartmentCode(departmentName),
      description: departmentData?.description || `${departmentName} offering advanced programs and research opportunities`,
      website_url: departmentData?.website_url || null,
      contact_email: departmentData?.contact_email || null
    };
    
    const { data, error } = await supabase
      .from('departments')
      .insert(insertData)
      .select()
      .single()
    
    if (error) throw error
    console.log(`✅ Created department: ${departmentName}`);
    return data
  }
  
  /**
   * Helper methods for dynamic university/department creation
   */
  static extractCityFromUniversityName(universityName) {
    const cityMap = {
      'Bristol': 'Bristol',
      'London': 'London'
    };
    
    for (const [city, location] of Object.entries(cityMap)) {
      if (universityName.includes(city)) {
        return location;
      }
    }
    
    return 'UK'; // Default fallback
  }
  
  static generateWebsiteUrl(universityName) {
    const name = universityName.toLowerCase()
      .replace(/university of /g, '')
      .replace(/college/g, '')
      .replace(/\s+/g, '')
      .replace(/'/g, '');
    
    if (name.includes('oxford')) return 'https://www.ox.ac.uk';
    if (name.includes('cambridge')) return 'https://www.cam.ac.uk';
    if (name.includes('edinburgh')) return 'https://www.ed.ac.uk';
    if (name.includes('imperial')) return 'https://www.imperial.ac.uk';
    if (name.includes('manchester')) return 'https://www.manchester.ac.uk';
    if (name.includes('bristol')) return 'https://www.bristol.ac.uk';
    
    return `https://www.${name}.ac.uk`;
  }
  
  static generateDepartmentCode(departmentName) {
    if (departmentName.toLowerCase().includes('computer')) return 'CS';
    if (departmentName.toLowerCase().includes('engineering')) return 'ENG';
    if (departmentName.toLowerCase().includes('business')) return 'BUS';
    if (departmentName.toLowerCase().includes('informatics')) return 'INF';
    
    return 'DEPT';
  }
  
  /**
   * Get course type (MSc)
   */
  static async getCourseType(typeName) {
    const { data, error } = await supabase
      .from('course_types')
      .select('*')
      .eq('name', typeName)
      .single()
    
    if (error) throw error
    return data
  }
  
  /**
   * Populate courses in the database with scraped data
   */
  static async populateCourses(universityId, departmentId, courseTypeId, courseDataArray) {
    for (const courseData of courseDataArray) {
      // Check if course already exists
      const { data: existing } = await supabase
        .from('courses_v2')
        .select('id')
        .eq('title', courseData.title)
        .eq('university_id', universityId)
        .single()
      
      if (existing) {
        console.log(`Course "${courseData.title}" already exists, skipping...`)
        continue
      }
      
      // Insert new course (filter out fields that don't exist in database)
      const { university, department, ...cleanCourseData } = courseData;
      
      const { error } = await supabase
        .from('courses_v2')
        .insert({
          ...cleanCourseData,
          university_id: universityId,
          department_id: departmentId,
          course_type_id: courseTypeId,
          last_scraped_at: new Date().toISOString()
        })
      
      if (error) {
        console.error(`Error inserting course "${courseData.title}":`, error)
      } else {
        console.log(`Successfully inserted course: ${courseData.title}`)
      }
    }
  }
  
  /**
   * Fetch all courses with university and department information
   */
  static async getAllCourses() {
    const { data, error } = await supabase
      .from('courses_v2')
      .select(`
        *,
        university:universities(*),
        department:departments(*),
        course_type:course_types(*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
  
  /**
   * Get all courses (for price range calculation)
   */
  static async getAllCourses() {
    const { data, error } = await supabase
      .from('courses_v2')
      .select('fees')
      .eq('is_active', true)
    
    if (error) throw error
    return data || []
  }
  
  /**
   * Search courses with filters
   */
  static async searchCourses(filters = {}) {
    let query = supabase
      .from('courses_v2')
      .select(`
        *,
        university:universities(*),
        department:departments(*),
        course_type:course_types(*)
      `)
      .eq('is_active', true)
    
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }
    
    if (filters.universityId && filters.universityId.trim() !== '') {
      query = query.eq('university_id', filters.universityId)
    }
    
    if (filters.departmentId && filters.departmentId.trim() !== '') {
      query = query.eq('department_id', filters.departmentId)
    }
    
    if (filters.courseTypeId && filters.courseTypeId.trim() !== '') {
      query = query.eq('course_type_id', filters.courseTypeId)
    }
    
    if (filters.maxFees) {
      query = query.lte('fees', filters.maxFees)
    }
    
    if (filters.minFees) {
      query = query.gte('fees', filters.minFees)
    }
    
    if (filters.scholarshipAvailable === 'true') {
      query = query.eq('scholarship_available', true)
    } else if (filters.scholarshipAvailable === 'false') {
      query = query.eq('scholarship_available', false)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
  
  /**
   * Get course by ID with full details
   */
  static async getCourseById(courseId) {
    const { data, error } = await supabase
      .from('courses_v2')
      .select(`
        *,
        university:universities(*),
        department:departments(*),
        course_type:course_types(*),
        specializations:course_specializations(*)
      `)
      .eq('id', courseId)
      .single()
    
    if (error) throw error
    return data
  }
  
  /**
   * Get all universities
   */
  static async getUniversities() {
    const { data, error } = await supabase
      .from('universities')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data || []
  }
  
  /**
   * Get departments by university
   */
  static async getDepartmentsByUniversity(universityId) {
    let query = supabase
      .from('departments')
      .select('*')
    
    // Only add university filter if universityId is provided, not empty, and not null
    if (universityId && typeof universityId === 'string' && universityId.trim() !== '') {
      query = query.eq('university_id', universityId)
    }
    
    const { data, error } = await query.order('name')
    
    if (error) {
      console.error('Error fetching departments:', error)
      throw error
    }
    return data || []
  }
  
  /**
   * Get course types
   */
  static async getCourseTypes() {
    const { data, error } = await supabase
      .from('course_types')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data || []
  }
}
