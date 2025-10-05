#!/usr/bin/env node

/**
 * 🚀 University Course Scraper Runner
 * 
 * Main script to run course scraping for specific universities and departments
 * Usage: npm run scrape [university] [department]
 */

import { UniversityScraper } from './university-scraper.js';
import { 
  getUniversityConfig, 
  getAvailableUniversities, 
  getScrapingUrls,
  needsDynamicScraping,
  genericSelectors 
} from './university-configs.js';

/**
 * Enhanced University Course Scraper
 */
class CourseScraperRunner extends UniversityScraper {
  constructor(config = {}) {
    super(config);
    this.scrapedUniversities = new Set();
  }

  /**
   * Scrape courses from a specific university department
   */
  async scrapeUniversityDepartment(universityKey, departmentKey) {
    console.log(`\n🎓 Scraping ${universityKey} - ${departmentKey}`);
    
    try {
      const config = getUniversityConfig(universityKey, departmentKey);
      const urls = getScrapingUrls(universityKey, departmentKey);
      const isDynamic = needsDynamicScraping(universityKey, departmentKey);
      
      console.log(`📋 University: ${config.name}`);
      console.log(`🏢 Department: ${config.department.name}`);
      console.log(`🔗 URLs to scrape: ${urls.length}`);
      console.log(`⚡ Scraping method: ${isDynamic ? 'Dynamic (Puppeteer)' : 'Static (Cheerio)'}`);
      
      const departmentCourses = [];
      
      for (const url of urls) {
        console.log(`\n🔍 Processing: ${url}`);
        
        let courses = [];
        
        if (isDynamic) {
          courses = await this.scrapeDynamic(url, config.department.selectors);
        } else {
          courses = await this.scrapeStatic(url, config.department.selectors);
        }
        
        // If no courses found, try fallback selectors
        if (courses.length === 0 && config.department.fallbackSelectors) {
          console.log(`🔄 Trying fallback selectors...`);
          courses = await this.scrapeStatic(url, config.department.fallbackSelectors);
        }
        
        // If still no courses, try generic selectors
        if (courses.length === 0) {
          console.log(`🔄 Trying generic selectors...`);
          courses = await this.tryGenericSelectors(url, isDynamic);
        }
        
        // Add university and department info to each course
        courses.forEach(course => {
          course.university = config.name;
          course.department = config.department.name;
          course.university_key = universityKey;
          course.department_key = departmentKey;
        });
        
        departmentCourses.push(...courses);
        
        // Add delay between requests
        if (urls.length > 1) {
          await this.delay();
        }
      }
      
      this.results.push(...departmentCourses);
      this.scrapedUniversities.add(config.name);
      
      console.log(`✅ ${config.name} - ${config.department.name}: ${departmentCourses.length} courses found`);
      return departmentCourses;
      
    } catch (error) {
      console.error(`❌ Failed to scrape ${universityKey} - ${departmentKey}:`, error.message);
      this.errors.push({
        university: universityKey,
        department: departmentKey,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return [];
    }
  }

  /**
   * Try generic selectors as fallback
   */
  async tryGenericSelectors(url, isDynamic = false) {
    console.log(`🎯 Attempting generic selector extraction...`);
    
    const genericConfig = {
      courseList: genericSelectors.courseList[0],
      title: genericSelectors.title[0],
      link: genericSelectors.link[0],
      fees: genericSelectors.fees[0],
      duration: genericSelectors.duration[0]
    };
    
    let courses = [];
    
    for (const courseListSelector of genericSelectors.courseList) {
      const config = { ...genericConfig, courseList: courseListSelector };
      
      if (isDynamic) {
        courses = await this.scrapeDynamic(url, config);
      } else {
        courses = await this.scrapeStatic(url, config);
      }
      
      if (courses.length > 0) {
        console.log(`✅ Generic selectors found ${courses.length} courses`);
        break;
      }
    }
    
    return courses;
  }

  /**
   * Scrape all departments for a university
   */
  async scrapeUniversity(universityKey) {
    console.log(`\n🏛️ Scraping all departments for: ${universityKey}`);
    
    const config = getUniversityConfig(universityKey);
    const departments = Object.keys(config.departments);
    
    console.log(`📚 Departments to scrape: ${departments.join(', ')}`);
    
    const universityCourses = [];
    
    for (const departmentKey of departments) {
      const courses = await this.scrapeUniversityDepartment(universityKey, departmentKey);
      universityCourses.push(...courses);
      
      // Add delay between departments
      if (departments.length > 1) {
        await this.delay(3000); // Longer delay between departments
      }
    }
    
    console.log(`🎓 ${config.name} total: ${universityCourses.length} courses`);
    return universityCourses;
  }

  /**
   * Enhanced course data cleaning with university-specific rules
   */
  cleanCourseData(course) {
    const cleaned = super.cleanCourseData(course);
    
    // University-specific cleaning rules
    if (cleaned.university) {
      // Edinburgh specific
      if (cleaned.university.includes('Edinburgh')) {
        cleaned.currency = 'GBP';
        cleaned.country = 'Scotland';
        cleaned.city = 'Edinburgh';
      }
      
      // Imperial specific
      if (cleaned.university.includes('Imperial')) {
        cleaned.currency = 'GBP';
        cleaned.country = 'England';
        cleaned.city = 'London';
      }
      
      // Manchester specific
      if (cleaned.university.includes('Manchester')) {
        cleaned.currency = 'GBP';
        cleaned.country = 'England';
        cleaned.city = 'Manchester';
      }
      
      // King's specific
      if (cleaned.university.includes('King')) {
        cleaned.currency = 'GBP';
        cleaned.country = 'England';
        cleaned.city = 'London';
      }
      
      // Bristol specific
      if (cleaned.university.includes('Bristol')) {
        cleaned.currency = 'GBP';
        cleaned.country = 'England';
        cleaned.city = 'Bristol';
      }
    }
    
    // Standardize course titles
    if (cleaned.title) {
      // Ensure MSc prefix
      if (!cleaned.title.toLowerCase().includes('msc') && !cleaned.title.toLowerCase().includes('master')) {
        cleaned.title = `MSc ${cleaned.title}`;
      }
    }
    
    return cleaned;
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    const summary = this.getSummary();
    
    console.log('\n📊 SCRAPING REPORT');
    console.log('==================');
    console.log(`🎓 Universities scraped: ${this.scrapedUniversities.size}`);
    console.log(`📚 Total courses found: ${summary.total_courses}`);
    console.log(`❌ Total errors: ${summary.total_errors}`);
    
    if (summary.universities.length > 0) {
      console.log(`\n🏛️ Universities: ${summary.universities.join(', ')}`);
    }
    
    if (summary.departments.length > 0) {
      console.log(`🏢 Departments: ${summary.departments.join(', ')}`);
    }
    
    if (summary.fee_range) {
      console.log(`\n💰 Fee Range:`);
      console.log(`   Min: £${summary.fee_range.min?.toLocaleString() || 'N/A'}`);
      console.log(`   Max: £${summary.fee_range.max?.toLocaleString() || 'N/A'}`);
      console.log(`   Avg: £${summary.fee_range.average?.toLocaleString() || 'N/A'}`);
    }
    
    // Course breakdown by university
    const coursesByUni = {};
    this.results.forEach(course => {
      const uni = course.university || 'Unknown';
      coursesByUni[uni] = (coursesByUni[uni] || 0) + 1;
    });
    
    console.log(`\n📈 Courses by University:`);
    Object.entries(coursesByUni).forEach(([uni, count]) => {
      console.log(`   ${uni}: ${count} courses`);
    });
    
    if (this.errors.length > 0) {
      console.log(`\n❌ Errors encountered:`);
      this.errors.forEach(error => {
        console.log(`   ${error.university || error.url}: ${error.error}`);
      });
    }
    
    return summary;
  }
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2);
  const universityKey = args[0];
  const departmentKey = args[1];
  
  console.log('🎓 University Course Scraper');
  console.log('============================');
  
  // Show available options if no arguments
  if (!universityKey) {
    console.log('\n📋 Available Universities:');
    const universities = getAvailableUniversities();
    universities.forEach(uni => {
      console.log(`\n🏛️ ${uni.key}`);
      console.log(`   Name: ${uni.name}`);
      console.log(`   Departments: ${uni.departments.join(', ')}`);
    });
    
    console.log('\n📖 Usage:');
    console.log('  npm run scrape [university-key] [department-key]');
    console.log('  npm run scrape university-of-edinburgh school-of-informatics');
    console.log('  npm run scrape imperial-college-london');
    console.log('  npm run scrape:all  # Scrape all universities');
    
    return;
  }
  
  const scraper = new CourseScraperRunner({
    timeout: 30000,
    delay: 2000,
    retries: 3
  });
  
  try {
    if (departmentKey) {
      // Scrape specific department
      await scraper.scrapeUniversityDepartment(universityKey, departmentKey);
    } else {
      // Scrape all departments for university
      await scraper.scrapeUniversity(universityKey);
    }
    
    // Generate and save results
    const report = scraper.generateReport();
    const filepath = await scraper.saveResults();
    
    console.log(`\n✅ Scraping completed successfully!`);
    console.log(`📁 Results saved to: ${filepath}`);
    
  } catch (error) {
    console.error('\n❌ Scraping failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { CourseScraperRunner };
export default CourseScraperRunner;
