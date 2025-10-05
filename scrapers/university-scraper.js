/**
 * 🎓 University Course Scraper
 * 
 * Comprehensive web scraper for extracting MSc course data from UK university websites
 * Supports both static (axios + cheerio) and dynamic (Puppeteer) scraping
 */

import axios from 'axios';
import { load } from 'cheerio';
import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

// Import consolidated utilities
import { HttpUtils, ExtractionUtils, ValidationUtils, NormalizationUtils, ArrayUtils, DurationUtils } from './utils/scraperUtils.js';
import { TransformationUtils } from './utils/transformationUtils.js';

/**
 * Base scraper class with common functionality
 */
export class UniversityScraper {
  constructor(config = {}) {
    this.config = {
      timeout: 30000,
      retries: 3,
      delay: 2000,
      userAgent: HttpUtils.defaultHeaders['User-Agent'],
      ...config
    };
    
    this.results = [];
    this.errors = [];
  }

  /**
   * Static scraper using axios + cheerio (for static HTML)
   */
  async scrapeStatic(url, selectors) {
    console.log(`🔍 Static scraping: ${url}`);
    
    try {
      const response = await HttpUtils.makeRequest(url, {
        timeout: this.config.timeout
      });

      const $ = load(response.data);
      return this.extractCourseData($, selectors, url);
      
    } catch (error) {
      console.error(`❌ Static scraping failed for ${url}:`, error.message);
      this.errors.push({ url, error: error.message, type: 'static' });
      return [];
    }
  }

  /**
   * Dynamic scraper using Puppeteer (for JavaScript-rendered pages)
   */
  async scrapeDynamic(url, selectors, options = {}) {
    console.log(`🚀 Dynamic scraping: ${url}`);
    
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        ...options
      });
      
      const page = await browser.newPage();
      
      // Set user agent and viewport
      await page.setUserAgent(this.config.userAgent);
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Navigate to page
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: this.config.timeout 
      });
      
      // Wait for content to load
      if (selectors.waitFor) {
        await page.waitForSelector(selectors.waitFor, { timeout: 10000 });
      }
      
      // Extract data using page.evaluate
      const courses = await page.evaluate((sel) => {
        return this.extractCourseDataFromDOM(sel);
      }, selectors);
      
      return courses;
      
    } catch (error) {
      console.error(`❌ Dynamic scraping failed for ${url}:`, error.message);
      this.errors.push({ url, error: error.message, type: 'dynamic' });
      return [];
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Extract course data from cheerio $ object (static scraping)
   */
  extractCourseData($, selectors, baseUrl) {
    const courses = [];
    
    try {
      const courseElements = $(selectors.courseList);
      
      courseElements.each((index, element) => {
        const $course = $(element);
        
        const course = {
          title: ExtractionUtils.extractText($course, $, selectors.title),
          courseCode: ExtractionUtils.extractText($course, $, selectors.courseCode),
          credits: ExtractionUtils.extractText($course, $, selectors.credits),
          duration: ExtractionUtils.extractText($course, $, selectors.duration),
          fees: ExtractionUtils.extractFees($course, $, selectors.fees),
          description: ExtractionUtils.extractText($course, $, selectors.description),
          link: ExtractionUtils.extractLink($course, $, selectors.link, baseUrl),
          requirements: ExtractionUtils.extractText($course, $, selectors.requirements),
          modules: ExtractionUtils.extractList($course, $, selectors.modules),
          startDates: ExtractionUtils.extractList($course, $, selectors.startDates),
          scraped_at: new Date().toISOString(),
          source_url: baseUrl
        };
        
        // Only add if we have essential data
        if (course.title && course.title.trim()) {
          courses.push(TransformationUtils.transformCourseData(course, { name: 'Unknown University', baseUrl }));
        }
      });
      
      console.log(`✅ Extracted ${courses.length} courses from ${baseUrl}`);
      return courses;
      
    } catch (error) {
      console.error(`❌ Data extraction failed:`, error.message);
      return [];
    }
  }

  // Removed extractText - using ExtractionUtils.extractText instead

  // Removed extractFees - using ExtractionUtils.extractFees instead

  // Removed extractLink - using ExtractionUtils.extractLink instead

  // Removed extractList - using ExtractionUtils.extractList instead

  // Removed cleanCourseData - using TransformationUtils.transformCourseData instead

  // Removed parseDuration - using DurationUtils.parseDurationMonths instead

  // Removed delay - using HttpUtils.delay instead

  /**
   * Save results to JSON file
   */
  async saveResults(filename = null) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const defaultFilename = `scraped-courses-${timestamp}.json`;
    const filepath = path.join('scrapers', 'results', filename || defaultFilename);
    
    // Ensure results directory exists
    await fs.mkdir(path.dirname(filepath), { recursive: true });
    
    const output = {
      scraped_at: new Date().toISOString(),
      total_courses: this.results.length,
      total_errors: this.errors.length,
      courses: this.results,
      errors: this.errors,
      config: this.config
    };
    
    await fs.writeFile(filepath, JSON.stringify(output, null, 2));
    console.log(`💾 Results saved to: ${filepath}`);
    
    return filepath;
  }

  /**
   * Get scraping summary
   */
  getSummary() {
    return {
      total_courses: this.results.length,
      total_errors: this.errors.length,
      universities: [...new Set(this.results.map(c => c.university))],
      departments: [...new Set(this.results.map(c => c.department))],
      fee_range: this.getFeeRange()
    };
  }

  /**
   * Calculate fee range from results
   */
  getFeeRange() {
    const fees = this.results
      .map(c => c.fees)
      .filter(f => typeof f === 'number')
      .sort((a, b) => a - b);
    
    if (fees.length === 0) return null;
    
    return {
      min: fees[0],
      max: fees[fees.length - 1],
      average: Math.round(fees.reduce((a, b) => a + b, 0) / fees.length)
    };
  }
}

/**
 * Extract course data from DOM (for Puppeteer)
 * This function runs in the browser context
 */
function extractCourseDataFromDOM(selectors) {
  const courses = [];
  const courseElements = document.querySelectorAll(selectors.courseList);
  
  courseElements.forEach(element => {
    const course = {
      title: getTextContent(element, selectors.title),
      courseCode: getTextContent(element, selectors.courseCode),
      credits: getTextContent(element, selectors.credits),
      duration: getTextContent(element, selectors.duration),
      fees: getTextContent(element, selectors.fees),
      description: getTextContent(element, selectors.description),
      link: getLinkHref(element, selectors.link),
      requirements: getTextContent(element, selectors.requirements),
      modules: getListItems(element, selectors.modules),
      startDates: getListItems(element, selectors.startDates),
      scraped_at: new Date().toISOString()
    };
    
    if (course.title && course.title.trim()) {
      courses.push(course);
    }
  });
  
  return courses;
  
  // Helper functions for DOM extraction
  function getTextContent(parent, selector) {
    if (!selector) return null;
    const element = parent.querySelector(selector);
    return element ? element.textContent.trim() : null;
  }
  
  function getLinkHref(parent, selector) {
    if (!selector) return null;
    const element = parent.querySelector(selector);
    return element ? element.href : null;
  }
  
  function getListItems(parent, selector) {
    if (!selector) return [];
    const elements = parent.querySelectorAll(selector);
    return Array.from(elements).map(el => el.textContent.trim()).filter(text => text);
  }
}

export default UniversityScraper;
