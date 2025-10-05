/**
 * 🔗 Scraper Integration Service
 * 
 * Integrates web scraping results with the existing course data service
 * Handles data transformation, validation, and database population
 */

import { CourseScraperRunner } from './run-scraper.js';
import { getAvailableUniversities } from './university-configs.js';
import fs from 'fs/promises';
import path from 'path';

// Import consolidated utilities
import { HttpUtils, ArrayUtils } from './utils/scraperUtils.js';
import { TransformationUtils } from './utils/transformationUtils.js';

/**
 * Integration service for scraper results
 */
export class ScraperIntegrationService {
  constructor(courseDataService) {
    this.courseDataService = courseDataService;
    this.scraper = new CourseScraperRunner();
    this.transformationRules = this.getTransformationRules();
  }

  /**
   * Scrape and integrate courses from all universities
   */
  async scrapeAndIntegrate(options = {}) {
    console.log('🔗 Starting scraper integration process...');
    
    const {
      universities = 'all',
      saveToDatabase = true,
      saveToFile = true,
      validateData = true
    } = options;
    
    try {
      // Step 1: Scrape course data
      console.log('📡 Step 1: Scraping course data...');
      const scrapedCourses = await this.scrapeCoursesData(universities);
      
      // Step 2: Transform data to match our schema
      console.log('🔄 Step 2: Transforming scraped data...');
      const transformedCourses = await this.transformScrapedData(scrapedCourses);
      
      // Step 3: Validate data quality
      if (validateData) {
        console.log('✅ Step 3: Validating data quality...');
        const validationResults = await this.validateCourseData(transformedCourses);
        console.log(`   Valid courses: ${validationResults.valid.length}`);
        console.log(`   Invalid courses: ${validationResults.invalid.length}`);
      }
      
      // Step 4: Save to database
      if (saveToDatabase) {
        console.log('💾 Step 4: Saving to database...');
        await this.saveToDatabase(transformedCourses);
      }
      
      // Step 5: Save to file
      if (saveToFile) {
        console.log('📁 Step 5: Saving to file...');
        await this.saveToFile(transformedCourses, scrapedCourses);
      }
      
      console.log('🎉 Scraper integration completed successfully!');
      
      return {
        scraped: scrapedCourses.length,
        transformed: transformedCourses.length,
        success: true
      };
      
    } catch (error) {
      console.error('❌ Scraper integration failed:', error.message);
      throw error;
    }
  }

  /**
   * Scrape courses from specified universities
   */
  async scrapeCoursesData(universities) {
    if (universities === 'all') {
      const availableUniversities = getAvailableUniversities();
      const allCourses = [];
      
      for (const uni of availableUniversities) {
        console.log(`🏛️ Scraping ${uni.name}...`);
        const courses = await this.scraper.scrapeUniversity(uni.key);
        allCourses.push(...courses);
        
        // Respectful delay between universities
        await HttpUtils.delay(5000);
      }
      
      return allCourses;
    } else if (Array.isArray(universities)) {
      const allCourses = [];
      
      for (const uniKey of universities) {
        console.log(`🏛️ Scraping ${uniKey}...`);
        const courses = await this.scraper.scrapeUniversity(uniKey);
        allCourses.push(...courses);
        await HttpUtils.delay(3000);
      }
      
      return allCourses;
    } else {
      // Single university
      return await this.scraper.scrapeUniversity(universities);
    }
  }

  /**
   * Transform scraped data to match our database schema
   */
  async transformScrapedData(scrapedCourses) {
    console.log(`🔄 Transforming ${scrapedCourses.length} scraped courses...`);
    
    const transformed = [];
    
    for (const course of scrapedCourses) {
      try {
        const transformedCourse = TransformationUtils.transformCourseData(course, { name: course.university || 'Unknown University' });
        if (transformedCourse) {
          transformed.push(transformedCourse);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to transform course: ${course.title} - ${error.message}`);
      }
    }
    
    return transformed;
  }

  // Removed transformSingleCourse - using TransformationUtils.transformCourseData instead

  // Removed getTransformationRules - using TransformationUtils.transformationRules instead

  // Removed cleanTitle - using TransformationUtils.cleanTitle instead

  // Removed cleanDescription - using TransformationUtils.cleanDescription instead

  // Removed parseFees - using TransformationUtils.parseFees instead

  // Removed buildLocation - using TransformationUtils.buildLocation instead

  // Removed parseModules - using TransformationUtils.parseModules instead

  // Removed generateCareerProspects - using TransformationUtils.generateCareerProspects instead

  // Removed generateAccreditation - using TransformationUtils.generateAccreditation instead

  /**
   * Validate course data quality
   */
  async validateCourseData(courses) {
    const valid = [];
    const invalid = [];
    
    for (const course of courses) {
      const validation = this.validateSingleCourse(course);
      
      if (validation.isValid) {
        valid.push(course);
      } else {
        invalid.push({
          course: course.title,
          errors: validation.errors
        });
      }
    }
    
    return { valid, invalid };
  }

  /**
   * Validate a single course
   */
  validateSingleCourse(course) {
    const errors = [];
    
    // Required fields
    if (!course.title) errors.push('Missing title');
    if (!course.university_name) errors.push('Missing university');
    if (!course.department_name) errors.push('Missing department');
    
    // Data quality checks
    if (course.fees && (course.fees < 1000 || course.fees > 100000)) {
      errors.push('Fees out of reasonable range');
    }
    
    if (course.duration_months && (course.duration_months < 3 || course.duration_months > 60)) {
      errors.push('Duration out of reasonable range');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Save transformed courses to database
   */
  async saveToDatabase(courses) {
    console.log(`💾 Saving ${courses.length} courses to database...`);
    
    let saved = 0;
    let errors = 0;
    
    for (const course of courses) {
      try {
        // Resolve university and department IDs
        const university = await this.courseDataService.ensureUniversityExists(course.university_name);
        const department = await this.courseDataService.ensureDepartmentExists(university.id, course.department_name);
        const courseType = await this.courseDataService.getCourseType('MSc');
        
        // Prepare course data for database
        const courseData = {
          ...course,
          university_id: university.id,
          department_id: department.id,
          course_type_id: courseType.id
        };
        
        // Remove temporary fields
        delete courseData.university_name;
        delete courseData.department_name;
        
        // Save to database (implement based on your database structure)
        await this.courseDataService.populateCourses(university.id, department.id, courseType.id, [courseData]);
        
        saved++;
        
      } catch (error) {
        console.warn(`⚠️ Failed to save course ${course.title}: ${error.message}`);
        errors++;
      }
    }
    
    console.log(`✅ Database save complete: ${saved} saved, ${errors} errors`);
    return { saved, errors };
  }

  /**
   * Save results to file
   */
  async saveToFile(transformedCourses, originalCourses) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    const output = {
      integration_timestamp: timestamp,
      original_courses: originalCourses.length,
      transformed_courses: transformedCourses.length,
      transformation_rules: this.transformationRules,
      courses: transformedCourses,
      original_data: originalCourses
    };
    
    const filepath = path.join('scrapers', 'results', `integrated-courses-${timestamp}.json`);
    await fs.mkdir(path.dirname(filepath), { recursive: true });
    await fs.writeFile(filepath, JSON.stringify(output, null, 2));
    
    console.log(`📁 Integration results saved to: ${filepath}`);
    return filepath;
  }

  // Removed standardizeDuration - using TransformationUtils.standardizeDuration instead

  // Removed parseDurationMonths - using TransformationUtils.parseDurationMonths instead

  // Removed parseStartDates - using TransformationUtils.parseStartDates instead

  // Removed generateApplicationDeadline - using TransformationUtils.generateApplicationDeadline instead

  // Removed determineScholarshipAvailability - using TransformationUtils.determineScholarshipAvailability instead

  // Removed generateImageUrl - using TransformationUtils.generateImageUrl instead

  // Removed cleanEntryRequirements - using TransformationUtils.cleanEntryRequirements instead
}

export default ScraperIntegrationService;
