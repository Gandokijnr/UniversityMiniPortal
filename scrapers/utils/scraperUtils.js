/**
 * 🛠️ Scraper Utilities
 * 
 * Consolidated utility functions used across all scrapers
 * Eliminates code duplication and provides consistent functionality
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * HTTP Request utilities
 */
export class HttpUtils {
  static defaultHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive'
  };

  static async makeRequest(url, options = {}) {
    try {
      const response = await axios.get(url, {
        headers: this.defaultHeaders,
        timeout: 30000,
        ...options
      });
      return response;
    } catch (error) {
      console.error(`❌ HTTP request failed for ${url}:`, error.message);
      throw error;
    }
  }

  static async fetchWithRetry(url, maxRetries = 3, delay = 2000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.makeRequest(url);
      } catch (error) {
        if (attempt === maxRetries) throw error;
        console.warn(`⚠️ Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await this.delay(delay);
      }
    }
  }

  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Data extraction utilities
 */
export class ExtractionUtils {
  /**
   * Extract text content safely using multiple selectors
   */
  static extractText($element, $, selectors) {
    if (!selectors) return null;
    
    const selectorList = Array.isArray(selectors) ? selectors : [selectors];
    
    for (const selector of selectorList) {
      // Try finding within element
      let text = $element.find(selector).first().text().trim();
      if (text) return this.cleanText(text);
      
      // Try if element itself matches selector
      if ($element.is(selector)) {
        text = $element.text().trim();
        if (text) return this.cleanText(text);
      }
      
      // Try siblings
      text = $element.siblings(selector).first().text().trim();
      if (text) return this.cleanText(text);
    }
    
    return null;
  }

  /**
   * Extract and parse fees with validation
   */
  static extractFees($element, $, selectors) {
    const feeText = this.extractText($element, $, selectors);
    if (!feeText) return 0; // Return 0 instead of null for database compatibility

    // Multiple fee parsing patterns
    const feePatterns = [
      /£?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,
      /(\d{1,3}(?:,\d{3})*)\s*(?:pounds|gbp|£)/i,
      /fee[s]?[:\s]*£?(\d{1,3}(?:,\d{3})*)/i
    ];

    for (const pattern of feePatterns) {
      const match = feeText.match(pattern);
      if (match) {
        const fee = parseInt(match[1].replace(/,/g, ''));
        // Validate fee range (£10,000 - £100,000)
        if (fee >= 10000 && fee <= 100000) {
          return fee;
        }
      }
    }

    // Try broader context search
    const contextText = $element.text() + ' ' + $element.parent().text();
    const contextMatch = contextText.match(/£(\d{1,3}(?:,\d{3})*)/);
    if (contextMatch) {
      const fee = parseInt(contextMatch[1].replace(/,/g, ''));
      if (fee >= 10000 && fee <= 100000) {
        return fee;
      }
    }

    return 0; // Return 0 instead of null for database compatibility
  }

  /**
   * Extract links with proper URL resolution
   */
  static extractLink($element, $, selectors, baseUrl) {
    if (!selectors) return null;
    
    const selectorList = Array.isArray(selectors) ? selectors : [selectors];
    
    for (const selector of selectorList) {
      const href = $element.find(selector).first().attr('href') || 
                   $element.closest('a').attr('href');
      
      if (href) {
        return this.resolveUrl(href, baseUrl);
      }
    }
    
    return null;
  }

  /**
   * Extract list items (modules, dates, etc.)
   */
  static extractList($element, $, selectors) {
    const items = [];
    
    if (!selectors) return items;
    
    const selectorList = Array.isArray(selectors) ? selectors : [selectors];
    
    for (const selector of selectorList) {
      $element.find(selector).each((i, el) => {
        const text = $(el).text().trim();
        if (text && !items.includes(text)) {
          items.push(this.cleanText(text));
        }
      });
      
      if (items.length > 0) break;
    }
    
    return items;
  }

  /**
   * Extract start dates with multiple patterns
   */
  static extractStartDates($element, $, selectors) {
    const dates = [];
    const dateText = this.extractText($element, $, selectors);
    
    if (dateText) {
      const datePatterns = [
        /September \d{4}/gi,
        /October \d{4}/gi,
        /January \d{4}/gi,
        /February \d{4}/gi,
        /September/gi,
        /October/gi,
        /January/gi,
        /Autumn \d{4}/gi,
        /Fall \d{4}/gi,
        /Spring \d{4}/gi
      ];
      
      for (const pattern of datePatterns) {
        const matches = dateText.match(pattern);
        if (matches) {
          dates.push(...matches.map(match => match.trim()));
        }
      }
    }
    
    // Return null if no dates found (instead of default)
    return dates.length > 0 ? dates : null;
  }

  /**
   * Extract application deadline
   */
  static extractDeadline($element, $, selectors) {
    const deadlineText = this.extractText($element, $, selectors);
    if (!deadlineText) return null;

    const datePatterns = [
      /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/,
      /\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/i,
      /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i
    ];

    for (const pattern of datePatterns) {
      const match = deadlineText.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return deadlineText;
  }

  /**
   * Resolve relative URLs to absolute
   */
  static resolveUrl(href, baseUrl) {
    if (!href) return null;
    
    if (href.startsWith('http')) return href;
    if (href.startsWith('//')) return `https:${href}`;
    if (href.startsWith('/')) return `${baseUrl}${href}`;
    
    return `${baseUrl}/${href}`;
  }

  /**
   * Clean text content
   */
  static cleanText(text) {
    if (!text) return null;
    
    return text
      .replace(/\s+/g, ' ')
      .replace(/^\s*[-•]\s*/, '')
      .replace(/\n/g, ' ')
      .trim();
  }
}

/**
 * Data validation utilities
 */
export class ValidationUtils {
  /**
   * Check if text looks like a course title
   */
  static isCourseTitle(title) {
    if (!title) return false;
    const lowerTitle = title.toLowerCase();
    
    // Exclude navigation and non-course elements
    const excludeKeywords = [
      'navigation', 'menu', 'quick links', 'admissions', 'undergraduate',
      'department of', 'courses', 'postgraduate courses', 'undergraduate courses',
      'taught postgraduate', 'research postgraduate', 'graduate destinations',
      'life as a', 'student', 'overview', 'about', 'why choose', 'career'
    ];
    
    if (excludeKeywords.some(keyword => lowerTitle.includes(keyword))) {
      return false;
    }
    
    // Course indicators
    const courseKeywords = [
      'msc', 'master', 'postgraduate', 'graduate', 'phd', 'dphil',
      'computer science', 'software engineering', 'data science',
      'artificial intelligence', 'machine learning', 'cybersecurity',
      'information technology', 'computing', 'informatics',
      'advanced computing', 'computing science', 'ai', 'ml'
    ];
    
    return courseKeywords.some(keyword => lowerTitle.includes(keyword));
  }

  /**
   * Check if course data is valid
   */
  static isValidCourse(course) {
    return course && 
           course.title && 
           course.title.length > 3 &&
           this.isCourseTitle(course.title);
  }

  /**
   * Validate fee range
   */
  static isValidFee(fee) {
    return typeof fee === 'number' && fee >= 10000 && fee <= 100000;
  }
}

/**
 * Data normalization utilities
 */
export class NormalizationUtils {
  /**
   * Normalize course data to standard format
   */
  static normalizeCourseData(course) {
    return {
      title: course.title || 'Untitled Course',
      description: this.normalizeDescription(course.description),
      duration: course.duration || '12 months',
      location: course.location || 'UK',
      fees: this.normalizeFees(course.fees),
      currency: 'GBP',
      entry_requirements: course.requirements || course.entry_requirements || 'Bachelor\'s degree or equivalent',
      modules: Array.isArray(course.modules) ? course.modules : [],
      start_dates: this.normalizeStartDates(course.start_dates),
      application_deadline: course.application_deadline || null,
      source_url: course.source_url,
      last_scraped_at: course.last_scraped_at || new Date().toISOString(),
      is_active: true,
      scholarship_available: false,
      language_requirements: 'IELTS 6.5 or equivalent',
      assessment_methods: 'Coursework and examinations',
      career_prospects: 'Excellent career opportunities in technology sector',
      accreditation: null,
      image_url: this.getDefaultCourseImage(course.title)
    };
  }

  /**
   * Normalize description
   */
  static normalizeDescription(description) {
    if (!description) return 'Course description not available';
    
    let cleaned = description.trim();
    cleaned = cleaned.replace(/\s+/g, ' ');
    cleaned = cleaned.replace(/\n/g, ' ');
    
    // Limit length
    if (cleaned.length > 500) {
      cleaned = cleaned.substring(0, 497) + '...';
    }
    
    return cleaned;
  }

  /**
   * Normalize fees
   */
  static normalizeFees(fees) {
    if (typeof fees === 'number') {
      // Ensure fees are never negative and within reasonable range
      return Math.max(0, fees);
    }
    if (!fees) return 0;
    
    const feeStr = fees.toString().replace(/[£,\s]/g, '');
    const parsed = parseInt(feeStr);
    
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  }

  /**
   * Normalize start dates
   */
  static normalizeStartDates(startDates) {
    if (Array.isArray(startDates) && startDates.length > 0) {
      return startDates;
    }
    if (typeof startDates === 'string') {
      return [startDates];
    }
    return ['September 2024']; // Default fallback
  }

  /**
   * Get default course image based on title
   */
  static getDefaultCourseImage(title = '') {
    const lowerTitle = title.toLowerCase();
    
    // Use more reliable placeholder images
    const imageMap = {
      'computer science': 'https://via.placeholder.com/800x400/ea580c/ffffff?text=Computer+Science',
      'artificial intelligence': 'https://via.placeholder.com/800x400/f97316/ffffff?text=Artificial+Intelligence',
      'data science': 'https://via.placeholder.com/800x400/ea580c/ffffff?text=Data+Science',
      'cybersecurity': 'https://via.placeholder.com/800x400/f97316/ffffff?text=Cybersecurity',
      'software engineering': 'https://via.placeholder.com/800x400/ea580c/ffffff?text=Software+Engineering',
      'robotics': 'https://via.placeholder.com/800x400/f97316/ffffff?text=Robotics',
      'machine learning': 'https://via.placeholder.com/800x400/ea580c/ffffff?text=Machine+Learning',
      'computing': 'https://via.placeholder.com/800x400/f97316/ffffff?text=Computing',
      'finance': 'https://via.placeholder.com/800x400/ea580c/ffffff?text=Finance',
      'business': 'https://via.placeholder.com/800x400/f97316/ffffff?text=Business',
      'innovation': 'https://via.placeholder.com/800x400/ea580c/ffffff?text=Innovation',
      'management': 'https://via.placeholder.com/800x400/f97316/ffffff?text=Management'
    };
    
    for (const [subject, url] of Object.entries(imageMap)) {
      if (lowerTitle.includes(subject)) {
        return url;
      }
    }
    
    // Default fallback with orange theme
    return 'https://via.placeholder.com/800x400/ea580c/ffffff?text=MSc+Course';
  }
}

/**
 * University and location utilities
 */
export class UniversityUtils {
  static universityLocationMap = {
    'University of Oxford': 'Oxford',
    'University of Edinburgh': 'Edinburgh',
    'Imperial College London': 'London',
    'University of Manchester': 'Manchester',
    'King\'s College London': 'London',
    'University of Bristol': 'Bristol',
    'University of Cambridge': 'Cambridge'
  };

  static getUniversityLocation(universityName) {
    return this.universityLocationMap[universityName] || 'UK';
  }

  static extractCityFromUniversityName(universityName) {
    const cityMap = {
      'Oxford': 'Oxford',
      'Cambridge': 'Cambridge', 
      'Edinburgh': 'Edinburgh',
      'Manchester': 'Manchester',
      'Bristol': 'Bristol',
      'London': 'London'
    };
    
    for (const [city, location] of Object.entries(cityMap)) {
      if (universityName.includes(city)) {
        return location;
      }
    }
    
    return 'UK';
  }

  static generateWebsiteUrl(universityName) {
    const name = universityName.toLowerCase()
      .replace(/university of /g, '')
      .replace(/college/g, '')
      .replace(/\s+/g, '')
      .replace(/'/g, '');
    
    const urlMap = {
      'oxford': 'https://www.ox.ac.uk',
      'cambridge': 'https://www.cam.ac.uk',
      'edinburgh': 'https://www.ed.ac.uk',
      'imperial': 'https://www.imperial.ac.uk',
      'manchester': 'https://www.manchester.ac.uk',
      'bristol': 'https://www.bristol.ac.uk'
    };
    
    for (const [key, url] of Object.entries(urlMap)) {
      if (name.includes(key)) return url;
    }
    
    return `https://www.${name}.ac.uk`;
  }
}

/**
 * Array and data utilities
 */
export class ArrayUtils {
  /**
   * Remove duplicate courses based on title and university
   */
  static removeDuplicates(courses) {
    const seen = new Set();
    return courses.filter(course => {
      const key = `${course.title}-${course.university_name || course.university}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Chunk array into smaller arrays
   */
  static chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

/**
 * Duration parsing utilities
 */
export class DurationUtils {
  /**
   * Parse duration text to months
   */
  static parseDurationMonths(durationText) {
    if (typeof durationText === 'number') return durationText;
    if (!durationText) return 12;
    
    const text = durationText.toLowerCase();
    
    if (text.includes('12 month') || text.includes('1 year')) return 12;
    if (text.includes('18 month')) return 18;
    if (text.includes('24 month') || text.includes('2 year')) return 24;
    if (text.includes('9 month')) return 9;
    if (text.includes('6 month')) return 6;
    
    // Try to extract number + month/year
    const monthMatch = text.match(/(\d+)\s*month/);
    if (monthMatch) return parseInt(monthMatch[1]);
    
    const yearMatch = text.match(/(\d+)\s*year/);
    if (yearMatch) return parseInt(yearMatch[1]) * 12;
    
    return 12; // Default
  }

  /**
   * Standardize duration format
   */
  static standardizeDuration(duration) {
    if (!duration) return '12 months';
    
    const durationMapping = {
      '1 year': '12 months',
      '18 months': '18 months',
      '2 years': '24 months',
      'full-time': '12 months',
      'part-time': '24 months'
    };
    
    return durationMapping[duration.toLowerCase()] || duration;
  }
}
