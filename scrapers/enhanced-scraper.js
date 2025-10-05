
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Import consolidated utilities
import { HttpUtils, ExtractionUtils, ValidationUtils, NormalizationUtils, UniversityUtils, ArrayUtils } from './utils/scraperUtils.js';
import { DatabaseUtils } from './utils/databaseUtils.js';
import { TransformationUtils } from './utils/transformationUtils.js';

dotenv.config();

export class EnhancedCourseScraper {
  constructor() {
    this.dbUtils = new DatabaseUtils();
    this.userAgent = HttpUtils.defaultHeaders['User-Agent'];
    
    // Imperial College London configuration with tailored selectors
    this.universities = {
      imperial: {
        name: 'Imperial College London',
        baseUrl: 'https://www.imperial.ac.uk',
        urls: [
          'https://www.imperial.ac.uk/study/courses/postgraduate-taught/computing/',
          'https://www.imperial.ac.uk/study/courses/postgraduate-taught/advanced-computing/',
          'https://www.imperial.ac.uk/study/courses/postgraduate-taught/computing-science/',
        ],
        selectors: {
          courseContainer: [
            '.course-listing__item',
            '.course-card',
            '.programme-card', 
            '.content-block',
            'article',
            '.course-item',
            '.study-item'
          ],
          title: [
            'h1.page-title',
            'h1',
            'h2.course-title',
            'h2',
            'h3',
            '.course-name',
            '.programme-title',
            '.study-title'
          ],
          description: [
            '.course-overview',
            '.course-description', 
            '.programme-overview',
            '.description',
            '.course-summary',
            '.intro-text',
            'p.lead',
            '.content p'
          ],
          duration: [
            '.course-duration',
            '.duration',
            '.study-duration',
            '.course-length',
            '[data-duration]',
            '.time-commitment'
          ],
          fees: [
            '.fees',
            '.tuition-fees',
            '.course-fees',
            '.cost',
            '.fee-info',
            '.tuition-cost',
            '[data-fees]'
          ],
          requirements: [
            '.entry-requirements',
            '.admission-requirements',
            '.requirements',
            '.prerequisites',
            '.academic-requirements',
            '.entrance-requirements'
          ],
          modules: [
            '.course-modules li',
            '.curriculum li',
            '.syllabus li',
            '.course-content li',
            '.modules li',
            '.course-structure li'
          ],
          startDates: [
            '.start-date',
            '.course-start',
            '.intake-date',
            '.entry-date',
            '.term-start',
            '.commencement-date'
          ],
          deadline: [
            '.application-deadline',
            '.deadline',
            '.closing-date',
            '.application-date',
            '.apply-by'
          ],
          link: [
            'a[href*="/study/courses/"]',
            'a[href*="course"]',
            'a[href*="programme"]',
            'a.course-link',
            'a.programme-link'
          ],
          image: [
            'img',
            'img.course-image',
            'img.programme-image',
            '.course-hero img',
            '.programme-hero img',
            '.course-banner img',
            '.hero-image img',
            '.course-thumbnail img',
            '.course-card img',
            '.programme-card img',
            'img[alt*="course"]',
            'img[alt*="programme"]',
            'img[src*="course"]',
            'img[src*="programme"]',
            '.content-block img',
            'article img',
            '.main-content img'
          ]
        }
      },
      bristol: {
        name: 'University of Bristol',
        baseUrl: 'https://www.bristol.ac.uk/',
        urls: [
          'https://www.bristol.ac.uk/study/undergraduate/2026/accounting-finance/bsc-accounting-and-finance/',
          'https://www.bristol.ac.uk/study/undergraduate/2026/economics/ba-economics/'
        ],
        selectors: {
          courseContainer: [
            'div.course',
            'prospectus prospectus-ug year-2026',
            '.course-listing__item',
            '.course-card',
            '.programme-card', 
            '.content-block',
            'article',
            '.course-item',
            '.study-item'
          ],
          title: [
            'title',
            'h1.page-title',
            'h1',
            'h2.course-title',
            'h2',
            'h3',
            '.course-name',
            '.programme-title',
            '.study-title'
          ],
          description: [
            '.course-overview',
            '.course-description', 
            '.programme-overview',
            '.description',
            '.course-summary',
            '.intro-text',
            'p.lead',
            '.content p'
          ],
          duration: [
            '.course-duration',
            '.duration',
            '.study-duration',
            '.course-length',
            '[data-duration]',
            '.time-commitment'
          ],
          fees: [
            '.fees',
            '.tuition-fees',
            '.course-fees',
            '.cost',
            '.fee-info',
            '.tuition-cost',
            '[data-fees]'
          ],
          requirements: [
            '.entry-requirements',
            '.admission-requirements',
            '.requirements',
            '.prerequisites',
            '.academic-requirements',
            '.entrance-requirements'
          ],
          modules: [
            '.course-modules li',
            '.curriculum li',
            '.syllabus li',
            '.course-content li',
            '.modules li',
            '.course-structure li'
          ],
          startDates: [
            '.start-date',
            '.course-start',
            '.intake-date',
            '.entry-date',
            '.term-start',
            '.commencement-date'
          ],
          deadline: [
            '.application-deadline',
            '.deadline',
            '.closing-date',
            '.application-date',
            '.apply-by'
          ],
          link: [
            'a[href*="/study/courses/"]',
            'a[href*="course"]',
            'a[href*="programme"]',
            'a.course-link',
            'a.programme-link'
          ],
          image: [
            'img',
            'img.course-image',
            'img.programme-image',
            '.course-hero img',
            '.programme-hero img',
            '.course-banner img',
            '.hero-image img',
            '.course-thumbnail img',
            '.course-card img',
            '.programme-card img',
            'img[alt*="course"]',
            'img[alt*="programme"]',
            'img[src*="course"]',
            'img[src*="programme"]',
            '.content-block img',
            'article img',
            '.main-content img'
          ]
        }
      },
    };
  }
  /**
   * Main scraping function - scrapes all universities and stores in Supabase
   */
  async scrapeAllUniversities() {
    console.log('🎓 Starting comprehensive university course scraping...');
    
    const allResults = {
      totalCourses: 0,
      universities: {},
      errors: []
    };

    for (const [key, university] of Object.entries(this.universities)) {
      try {
        console.log(`\n📡 Scraping ${university.name}...`);
        
        const courses = await this.scrapeUniversity(university);
        
        if (courses.length > 0) {
          // Store courses in Supabase
          const stored = await this.dbUtils.storeCourses(courses, university);
          
          allResults.universities[key] = {
            name: university.name,
            coursesFound: courses.length,
            coursesStored: stored,
            success: true
          };
          
          allResults.totalCourses += stored;
          console.log(`✅ ${university.name}: ${stored} courses stored in database`);
        } else {
          allResults.universities[key] = {
            name: university.name,
            coursesFound: 0,
            coursesStored: 0,
            success: false,
            error: 'No courses found'
          };
        }
        
        await HttpUtils.delay(3000);
        
      } catch (error) {
        console.error(`❌ Error scraping ${university.name}:`, error.message);
        allResults.errors.push({
          university: university.name,
          error: error.message
        });
        
        allResults.universities[key] = {
          name: university.name,
          coursesFound: 0,
          coursesStored: 0,
          success: false,
          error: error.message
        };
      }
    }

    console.log(`\n🎉 Scraping completed! Total courses stored: ${allResults.totalCourses}`);
    return allResults;
  }


  async scrapeUniversity(university) {
    const allCourses = [];

    for (const url of university.urls) {
      try {
        console.log(`  📄 Scraping: ${url}`);
        
        const response = await HttpUtils.makeRequest(url);

        const $ = cheerio.load(response.data);
        const courses = await this.extractCourses($, university, url);
        
        allCourses.push(...courses);
        console.log(`    Found ${courses.length} courses`);
        
        // Delay between requests
        await HttpUtils.delay(2000);
        
      } catch (error) {
        console.warn(`    ⚠️ Failed to scrape ${url}: ${error.message}`);
      }
    }

    const uniqueCourses = ArrayUtils.removeDuplicates(allCourses);
    console.log(`  📊 ${university.name}: ${uniqueCourses.length} unique courses found`);
    
    return uniqueCourses;
  }

  /**
   * Extract courses from a page using multiple strategies
   */
  async extractCourses($, university, sourceUrl) {
    const courses = [];

    // Strategy 1: Use configured selectors
    for (const containerSelector of university.selectors.courseContainer) {
      $(containerSelector).each((index, element) => {
        const $element = $(element);
        const course = this.extractCourseData($element, $, university, sourceUrl);
        
        if (course && ValidationUtils.isValidCourse(course)) {
          courses.push(course);
        }
      });
      
      if (courses.length > 0) break;
    }

    // Strategy 2: Generic extraction if no courses found
    if (courses.length === 0) {
      const genericCourses = this.extractGenericCourses($, university, sourceUrl);
      courses.push(...genericCourses);
    }

    return courses;
  }

  /**
   * Extract course data from a single element
   */
  extractCourseData($element, $, university, sourceUrl) {
    const course = {
      // Required fields
      title: ExtractionUtils.extractText($element, $, university.selectors.title),
      duration: ExtractionUtils.extractText($element, $, university.selectors.duration),
      fees: ExtractionUtils.extractFees($element, $, university.selectors.fees),
      requirements: ExtractionUtils.extractText($element, $, university.selectors.requirements),
      modules: ExtractionUtils.extractList($element, $, university.selectors.modules),
      start_dates: ExtractionUtils.extractStartDates($element, $, university.selectors.startDates),
      application_deadline: ExtractionUtils.extractDeadline($element, $, university.selectors.deadline),
      
      // Additional fields
      description: ExtractionUtils.extractText($element, $, university.selectors.description),
      location: UniversityUtils.getUniversityLocation(university.name),
      source_url: ExtractionUtils.extractLink($element, $, university.selectors.link, university.baseUrl) || sourceUrl,
      image_url: this.extractImage($element, $, university.selectors.image, university.baseUrl),
      last_scraped_at: new Date().toISOString()
    };

    return TransformationUtils.transformCourseData(course, university);
  }


  extractImage($element, $, selectors, baseUrl) {
    if (!selectors) return NormalizationUtils.getDefaultCourseImage();
    
    for (const selector of selectors) {
      let imgSrc = $element.find(selector).first().attr('src');
      
      if (!imgSrc) {
        imgSrc = $element.parent().find(selector).first().attr('src');
      }
      
      if (!imgSrc) {
        imgSrc = $element.siblings().find(selector).first().attr('src');
      }
      
      if (imgSrc) {
        if (imgSrc.startsWith('//')) {
          return `https:${imgSrc}`;
        } else if (imgSrc.startsWith('/')) {
          return `${baseUrl}${imgSrc}`;
        } else if (imgSrc.startsWith('http')) {
          return imgSrc;
        } else {
          return `${baseUrl}/${imgSrc}`;
        }
      }
    }
    
    const pageImages = $('img').toArray();
    for (const img of pageImages) {
      const src = $(img).attr('src');
      const alt = $(img).attr('alt') || '';
      
      if (src && (
        alt.toLowerCase().includes('course') ||
        alt.toLowerCase().includes('programme') ||
        alt.toLowerCase().includes('study') ||
        src.includes('course') ||
        src.includes('programme')
      )) {
        if (src.startsWith('//')) {
          return `https:${src}`;
        } else if (src.startsWith('/')) {
          return `${baseUrl}${src}`;
        } else if (src.startsWith('http')) {
          return src;
        } else {
          return `${baseUrl}/${src}`;
        }
      }
    }
    
    return NormalizationUtils.getDefaultCourseImage();
  }

  // Removed getDefaultCourseImage - using NormalizationUtils.getDefaultCourseImage instead

 
  extractGenericCourses($, university, sourceUrl) {
    const courses = [];
    
    // Look for course-related headings
    $('h1, h2, h3').each((i, el) => {
      const $el = $(el);
      const text = $el.text().trim();
      if (ValidationUtils.isCourseTitle(text)) {
        const course = {
          title: ExtractionUtils.cleanText(text),
          university_name: university.name,
          location: UniversityUtils.getUniversityLocation(university.name),
          source_url: sourceUrl,
          last_scraped_at: new Date().toISOString(),
          
          description: ExtractionUtils.extractText($el, $, ['p']),
          duration: '12 months',
          fees: null,
          requirements: 'Bachelor\'s degree or equivalent',
          modules: [],
          start_dates: ['September 2024'],
          application_deadline: null,
          program_link: sourceUrl,
          image_url: NormalizationUtils.getDefaultCourseImage(text)
        };
        
        courses.push(TransformationUtils.transformCourseData(course, university));
      }
    });
    
    return courses;
  }

  /**
   * Helper methods for generic extraction
   */
  // Removed extractNearbyText - using ExtractionUtils methods instead

  // Removed extractNearbyDuration - using ExtractionUtils methods instead

  // Removed extractNearbyFees - using ExtractionUtils methods instead

  // Removed extractNearbyRequirements - using ExtractionUtils methods instead

  /**
   * Validation and normalization
   */
  // Removed isValidCourse - using ValidationUtils.isValidCourse instead

  // Removed isCourseTitle - using ValidationUtils.isCourseTitle instead

  // Removed normalizeCourseData - using TransformationUtils.transformCourseData instead

  // Removed storeCourses - using DatabaseUtils.storeCourses instead

  // Removed ensureUniversityExists - using DatabaseUtils.ensureUniversityExists instead

  // Removed ensureDepartmentExists - using DatabaseUtils.ensureDepartmentExists instead

  // Removed ensureCourseTypeExists - using DatabaseUtils.ensureCourseTypeExists instead

  // Removed getUniversityLocation - using UniversityUtils.getUniversityLocation instead

  // Removed cleanText - using ExtractionUtils.cleanText instead

  // Removed removeDuplicates - using ArrayUtils.removeDuplicates instead

  // Removed delay - using HttpUtils.delay instead
}

/**
 * Main execution function
 */
export async function runEnhancedScraper() {
  const scraper = new EnhancedCourseScraper();
  return await scraper.scrapeAllUniversities();
}

export default EnhancedCourseScraper;
