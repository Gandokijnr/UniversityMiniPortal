/**
 * 🔄 Data Transformation Utilities
 * 
 * Consolidated data transformation logic for scrapers
 * Handles conversion from scraped data to database schema
 */

/**
 * Data transformation utilities
 */
export class TransformationUtils {
  static transformationRules = {
    titleCleaning: {
      prefixes: ['MSc', 'Master of Science', 'Masters'],
      suffixes: ['(MSc)', '- MSc', 'MSc Programme'],
      replacements: {
        'Comp Sci': 'Computer Science',
        'AI': 'Artificial Intelligence',
        'ML': 'Machine Learning',
        'CS': 'Computer Science'
      }
    },
    
    durationMapping: {
      '1 year': '12 months',
      '18 months': '18 months',
      '2 years': '24 months',
      'full-time': '12 months',
      'part-time': '24 months'
    },
    
    subjectMapping: {
      'computer science': {
        career_prospects: 'Software Engineer, Data Scientist, Research Scientist, Technical Consultant, Product Manager',
        accreditation: 'Accredited by the British Computer Society (BCS)'
      },
      'artificial intelligence': {
        career_prospects: 'AI Engineer, Machine Learning Specialist, Research Scientist, Data Scientist, AI Consultant',
        accreditation: 'Recognized by the Institution of Engineering and Technology (IET)'
      },
      'data science': {
        career_prospects: 'Data Scientist, Business Analyst, Data Engineer, Research Analyst, Quantitative Analyst',
        accreditation: 'Endorsed by the Royal Statistical Society (RSS)'
      },
      'cybersecurity': {
        career_prospects: 'Cybersecurity Analyst, Security Consultant, Penetration Tester, Security Architect, Incident Response Specialist',
        accreditation: 'Certified by GCHQ and meets NCSC requirements'
      }
    }
  };

  /**
   * Transform scraped course to database schema
   */
  static transformCourseData(scrapedCourse, university) {
    return {
      // Basic information
      title: this.cleanTitle(scrapedCourse.title),
      description: this.cleanDescription(scrapedCourse.description),
      
      duration: this.standardizeDuration(scrapedCourse.duration),
      duration_months: this.parseDurationMonths(scrapedCourse.duration),
      
      fees: this.parseFees(scrapedCourse.fees),
      currency: 'GBP',
      
      location: this.buildLocation(scrapedCourse, university),
      
      entry_requirements: this.cleanEntryRequirements(scrapedCourse.requirements || scrapedCourse.entry_requirements),
      modules: this.parseModules(scrapedCourse.modules),
      
      assessment_methods: scrapedCourse.assessment_methods || 'Coursework, Examinations, and Dissertation',
      career_prospects: this.generateCareerProspects(scrapedCourse.title),
      
      start_dates: this.parseStartDates(scrapedCourse.start_dates || scrapedCourse.startDates),
      application_deadline: this.generateApplicationDeadline(),
      
      language_requirements: 'IELTS 7.0 overall (6.5 in each component) or equivalent',
      scholarship_available: this.determineScholarshipAvailability(scrapedCourse),
      accreditation: this.generateAccreditation(scrapedCourse.title),
      
      image_url: this.generateImageUrl(scrapedCourse.title),
      source_url: scrapedCourse.link || scrapedCourse.source_url,
      is_active: true,
      
      last_scraped_at: scrapedCourse.scraped_at || new Date().toISOString()
    };
  }

  /**
   * Clean and standardize course title
   */
  static cleanTitle(title) {
    if (!title) return null;
    
    let cleaned = title.trim();
    
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    if (!cleaned.toLowerCase().includes('msc') && !cleaned.toLowerCase().includes('master')) {
      cleaned = `MSc ${cleaned}`;
    }
    
    Object.entries(this.transformationRules.titleCleaning.replacements).forEach(([from, to]) => {
      cleaned = cleaned.replace(new RegExp(from, 'gi'), to);
    });
    
    return cleaned;
  }

 
  static cleanDescription(description) {
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
   * Parse and standardize fees
   */
  static parseFees(fees) {
    if (typeof fees === 'number') return fees;
    if (!fees) return 0; // Return 0 instead of null for database compatibility
    
    const feeStr = fees.toString().replace(/[£,\s]/g, '');
    const parsed = parseInt(feeStr);
    
    // Validate fee range
    if (isNaN(parsed) || parsed < 10000 || parsed > 100000) {
      return 0; // Return 0 instead of null for database compatibility
    }
    
    return parsed;
  }

  /**
   * Build location string
   */
  static buildLocation(course, university) {
    if (course.location) return course.location;
    
    const cityMap = {
      'University of Edinburgh': 'Edinburgh, Scotland',
      'Imperial College London': 'London, England',
      'University of Manchester': 'Manchester, England',
      'King\'s College London': 'London, England',
      'University of Bristol': 'Bristol, England',
      'University of Oxford': 'Oxford, England'
    };
    
    return cityMap[university.name] || 'United Kingdom';
  }

  /**
   * Parse modules array
   */
  static parseModules(modules) {
    if (Array.isArray(modules)) return modules;
    if (typeof modules === 'string') {
      return modules.split(',').map(m => m.trim()).filter(m => m);
    }
    return [];
  }

  /**
   * Generate career prospects based on course title
   */
  static generateCareerProspects(title) {
    if (!title) return 'Graduate-level positions in relevant field';
    
    const lowerTitle = title.toLowerCase();
    
    for (const [subject, mapping] of Object.entries(this.transformationRules.subjectMapping)) {
      if (lowerTitle.includes(subject)) {
        return mapping.career_prospects;
      }
    }
    
    return 'Graduate-level positions in technology and research';
  }

  /**
   * Generate accreditation based on course title
   */
  static generateAccreditation(title) {
    if (!title) return null;
    
    const lowerTitle = title.toLowerCase();
    
    for (const [subject, mapping] of Object.entries(this.transformationRules.subjectMapping)) {
      if (lowerTitle.includes(subject)) {
        return mapping.accreditation;
      }
    }
    
    return 'Accredited by relevant professional bodies';
  }

  /**
   * Standardize duration format
   */
  static standardizeDuration(duration) {
    if (!duration) return '12 months';
    return this.transformationRules.durationMapping[duration.toLowerCase()] || duration;
  }

  /**
   * Parse duration to months
   */
  static parseDurationMonths(duration) {
    if (typeof duration === 'number') return duration;
    if (!duration) return 12;
    
    const text = duration.toString().toLowerCase();
    if (text.includes('12') || text.includes('1 year')) return 12;
    if (text.includes('18')) return 18;
    if (text.includes('24') || text.includes('2 year')) return 24;
    
    return 12; // Default
  }

  /**
   * Parse start dates
   */
  static parseStartDates(startDates) {
    if (Array.isArray(startDates) && startDates.length > 0) {
      return startDates;
    }
    if (typeof startDates === 'string') {
      return startDates.split(',').map(d => d.trim());
    }
    return null; // Return null instead of default
  }

  /**
   * Generate application deadline
   */
  static generateApplicationDeadline() {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    
    // Generate realistic deadline based on current date
    const now = new Date();
    const month = now.getMonth();
    
    // If it's past July, deadline is for next year
    if (month >= 7) {
      return `${nextYear}-07-31`;
    } else {
      return `${currentYear}-07-31`;
    }
  }

  /**
   * Determine scholarship availability
   */
  static determineScholarshipAvailability(course) {
    // Heuristic: more expensive courses more likely to have scholarships
    if (typeof course.fees === 'number') {
      return course.fees > 35000;
    }
    return false; // Conservative default
  }

  /**
   * Generate image URL based on course title
   */
  static generateImageUrl(title) {
    const imageMap = {
      'computer science': 'https://via.placeholder.com/800x400/ea580c/ffffff?text=Computer+Science',
      'artificial intelligence': 'https://via.placeholder.com/800x400/f97316/ffffff?text=Artificial+Intelligence',
      'data science': 'https://via.placeholder.com/800x400/ea580c/ffffff?text=Data+Science',
      'cybersecurity': 'https://via.placeholder.com/800x400/f97316/ffffff?text=Cybersecurity',
      'software engineering': 'https://via.placeholder.com/800x400/ea580c/ffffff?text=Software+Engineering',
      'robotics': 'https://via.placeholder.com/800x400/f97316/ffffff?text=Robotics',
      'finance': 'https://via.placeholder.com/800x400/ea580c/ffffff?text=Finance',
      'business': 'https://via.placeholder.com/800x400/f97316/ffffff?text=Business',
      'innovation': 'https://via.placeholder.com/800x400/ea580c/ffffff?text=Innovation',
      'management': 'https://via.placeholder.com/800x400/f97316/ffffff?text=Management'
    };
    
    const lowerTitle = (title || '').toLowerCase();
    
    for (const [subject, url] of Object.entries(imageMap)) {
      if (lowerTitle.includes(subject)) {
        return url;
      }
    }
    
    // Default fallback with orange theme
    return 'https://via.placeholder.com/800x400/ea580c/ffffff?text=MSc+Course';
  }

  /**
   * Clean entry requirements
   */
  static cleanEntryRequirements(requirements) {
    if (!requirements) {
      return 'UK 2:1 honours degree or international equivalent in relevant field';
    }
    
    return requirements.trim().substring(0, 300); // Limit length
  }

  /**
   * Validate transformed course data
   */
  static validateTransformedCourse(course) {
    const errors = [];
    
    // Required fields
    if (!course.title) errors.push('Missing title');
    
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
   * Transform multiple courses
   */
  static transformCourses(scrapedCourses, university) {
    const transformed = [];
    
    for (const course of scrapedCourses) {
      try {
        const transformedCourse = this.transformCourseData(course, university);
        const validation = this.validateTransformedCourse(transformedCourse);
        
        if (validation.isValid) {
          transformed.push(transformedCourse);
        } else {
          console.warn(`⚠️ Invalid course data for "${course.title}":`, validation.errors);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to transform course: ${course.title} - ${error.message}`);
      }
    }
    
    return transformed;
  }
}

export default TransformationUtils;
