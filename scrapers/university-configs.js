/**
 * 🏛️ University Scraping Configurations
 * 
 * Specific scraping configurations for each UK university
 * Includes selectors, URLs, and scraping strategies
 */

export const universityConfigs = {
  'university-of-edinburgh': {
    name: 'University of Edinburgh',
    baseUrl: 'https://www.ed.ac.uk',
    departments: {
      'school-of-informatics': {
        name: 'School of Informatics',
        urls: [
          'https://www.ed.ac.uk/studying/postgraduate/degrees/index.php?r=site/search&search_type=degree&search_text=MSc&search_college=science-engineering&search_school=informatics',
          'https://www.ed.ac.uk/informatics/postgraduate/masters'
        ],
        type: 'static', // Use axios + cheerio
        selectors: {
          courseList: '.course-listing .course-item, .degree-item, .programme-item',
          title: '.course-title, .degree-title, h3 a, .programme-name',
          courseCode: '.course-code, .degree-code',
          credits: '.credits, .course-credits',
          duration: '.duration, .course-duration, .study-mode',
          fees: '.fees, .tuition-fee, .fee-amount',
          description: '.course-description, .degree-description, .overview',
          link: 'a, .course-link',
          requirements: '.entry-requirements, .requirements',
          modules: '.modules li, .curriculum li',
          startDates: '.start-dates li, .intake-dates li'
        },
        fallbackSelectors: {
          courseList: 'article, .result-item, .search-result',
          title: 'h2, h3, .title',
          link: 'a[href*="degree"], a[href*="course"]'
        }
      }
    }
  },

  'imperial-college-london': {
    name: 'Imperial College London',
    baseUrl: 'https://www.imperial.ac.uk',
    departments: {
      'department-of-computing': {
        name: 'Department of Computing',
        urls: [
          'https://www.imperial.ac.uk/computing/prospective-students/courses/postgraduate-taught/',
          'https://www.imperial.ac.uk/study/courses/postgraduate-taught/computing/'
        ],
        type: 'dynamic', // Use Puppeteer
        selectors: {
          waitFor: '.course-list, .programme-list',
          courseList: '.course-item, .programme-card, .course-card',
          title: '.course-title, .programme-title, h3',
          courseCode: '.course-code, .programme-code',
          duration: '.duration, .study-duration',
          fees: '.fees, .tuition-fees, .fee-info',
          description: '.course-overview, .programme-overview',
          link: 'a, .course-link',
          requirements: '.entry-requirements',
          modules: '.modules li, .syllabus li'
        }
      },
      'electrical-engineering': {
        name: 'Department of Electrical and Electronic Engineering',
        urls: [
          'https://www.imperial.ac.uk/electrical-engineering/study/postgraduate-taught/'
        ],
        type: 'static',
        selectors: {
          courseList: '.course-listing .course',
          title: '.course-title, h3',
          duration: '.duration',
          fees: '.fees',
          description: '.course-summary',
          link: 'a'
        }
      }
    }
  },

  'university-of-manchester': {
    name: 'University of Manchester',
    baseUrl: 'https://www.manchester.ac.uk',
    departments: {
      'computer-science': {
        name: 'Department of Computer Science',
        urls: [
          'https://www.manchester.ac.uk/study/masters/courses/list/?subject=Computer%20Science',
          'https://www.manchester.ac.uk/study/postgraduate-taught/courses/computer-science/'
        ],
        type: 'dynamic',
        selectors: {
          waitFor: '.course-search-results, .course-list',
          courseList: '.course-result, .course-item, .programme-item',
          title: '.course-title, .programme-title, h3 a',
          courseCode: '.course-code',
          duration: '.duration, .study-mode',
          fees: '.fees, .tuition-fee',
          description: '.course-summary, .programme-summary',
          link: 'a, .course-link',
          requirements: '.entry-requirements'
        }
      },
      'business-school': {
        name: 'Alliance Manchester Business School',
        urls: [
          'https://www.manchester.ac.uk/study/masters/courses/list/?subject=Business'
        ],
        type: 'static',
        selectors: {
          courseList: '.course-result',
          title: '.course-title h3',
          duration: '.duration',
          fees: '.fees',
          description: '.course-summary',
          link: '.course-title a'
        }
      }
    }
  },

  'kings-college-london': {
    name: 'King\'s College London',
    baseUrl: 'https://www.kcl.ac.uk',
    departments: {
      'informatics': {
        name: 'Department of Informatics',
        urls: [
          'https://www.kcl.ac.uk/study/postgraduate-taught/courses/informatics',
          'https://www.kcl.ac.uk/informatics/study/postgraduate'
        ],
        type: 'dynamic',
        selectors: {
          waitFor: '.course-listing, .programme-list',
          courseList: '.course-card, .programme-item',
          title: '.course-title, .programme-name, h3',
          courseCode: '.course-code',
          duration: '.duration, .study-duration',
          fees: '.fees, .fee-information',
          description: '.course-overview, .programme-overview',
          link: 'a, .course-link'
        }
      },
      'business-school': {
        name: 'King\'s Business School',
        urls: [
          'https://www.kcl.ac.uk/business/study/masters'
        ],
        type: 'static',
        selectors: {
          courseList: '.course-item',
          title: '.course-title',
          duration: '.duration',
          fees: '.fees',
          description: '.course-summary',
          link: 'a'
        }
      }
    }
  },

  'university-of-bristol': {
    name: 'University of Bristol',
    baseUrl: 'https://www.bristol.ac.uk',
    departments: {
      'computer-science': {
        name: 'Department of Computer Science',
        urls: [
          'https://www.bristol.ac.uk/study/postgraduate/taught/computer-science/',
          'https://www.bristol.ac.uk/engineering/departments/computerscience/postgraduate/'
        ],
        type: 'static',
        selectors: {
          courseList: '.course-listing .course, .programme-list .programme',
          title: '.course-title, .programme-title, h3',
          courseCode: '.course-code',
          duration: '.duration, .study-mode',
          fees: '.fees, .tuition-fees',
          description: '.course-overview, .programme-overview',
          link: 'a, .course-link',
          requirements: '.entry-requirements'
        }
      },
      'engineering': {
        name: 'Faculty of Engineering',
        urls: [
          'https://www.bristol.ac.uk/study/postgraduate/taught/engineering/'
        ],
        type: 'static',
        selectors: {
          courseList: '.course-item',
          title: '.course-title',
          duration: '.duration',
          fees: '.fees',
          description: '.course-summary',
          link: 'a'
        }
      }
    }
  },

  'university-of-oxford': {
    name: 'University of Oxford',
    baseUrl: 'https://www.ox.ac.uk',
    departments: {
      'computer-science': {
        name: 'Department of Computer Science',
        urls: [
          'https://www.cs.ox.ac.uk/',
          'https://www.graduate.ox.ac.uk/courses'
        ],
        type: 'static', // Start with static, can upgrade to dynamic if needed
        selectors: {
          courseList: '.course-list .course, .programme-list .programme, .course-item, article.course',
          title: '.course-title, .programme-title, h2, h3, .title',
          courseCode: '.course-code, .programme-code',
          duration: '.duration, .study-mode, .course-duration',
          fees: '.fees, .tuition-fees, .fee-amount, .cost',
          description: '.course-overview, .programme-overview, .description, .summary',
          link: 'a, .course-link, .read-more',
          requirements: '.entry-requirements, .requirements, .admission-requirements',
          modules: '.modules li, .curriculum li, .syllabus li',
          startDates: '.start-dates li, .intake-dates li, .application-dates li',
          deadline: '.deadline, .application-deadline, .closing-date'
        },
        fallbackSelectors: {
          courseList: 'article, .result-item, .search-result, .content-item, div[class*="course"]',
          title: 'h1, h2, h3, .title, .heading',
          link: 'a[href*="course"], a[href*="programme"], a[href*="msc"], a[href*="masters"]',
          description: 'p, .description, .summary, .overview'
        },
        // Oxford-specific parsing rules
        oxfordSpecific: {
          feePattern: /£[\d,]+/g,
          durationPattern: /(1|2|3)\s*(year|month)/i,
          courseCodePattern: /[A-Z]{2,4}\d{3,4}/,
          applicationDeadlinePattern: /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(st|nd|rd|th)?,?\s+\d{4}/i
        }
      }
    }
  }
};

/**
 * Generic selectors for fallback scraping
 */
export const genericSelectors = {
  courseList: [
    '.course-list .course',
    '.programme-list .programme',
    '.search-results .result',
    '.courses .course-item',
    'article[class*="course"]',
    '.postgraduate-courses .course'
  ],
  title: [
    '.course-title',
    '.programme-title',
    'h2 a',
    'h3 a',
    '.title a',
    '.course-name'
  ],
  link: [
    'a[href*="course"]',
    'a[href*="programme"]',
    'a[href*="masters"]',
    'a[href*="msc"]',
    '.course-link',
    '.read-more'
  ],
  fees: [
    '.fees',
    '.tuition',
    '.cost',
    '.fee-amount',
    '[class*="fee"]',
    '[class*="tuition"]'
  ],
  duration: [
    '.duration',
    '.length',
    '.study-mode',
    '[class*="duration"]',
    '[class*="length"]'
  ]
};

/**
 * Get configuration for a specific university and department
 */
export function getUniversityConfig(universityKey, departmentKey = null) {
  const university = universityConfigs[universityKey];
  if (!university) {
    throw new Error(`University configuration not found: ${universityKey}`);
  }
  
  if (departmentKey) {
    const department = university.departments[departmentKey];
    if (!department) {
      throw new Error(`Department configuration not found: ${departmentKey} in ${universityKey}`);
    }
    return { ...university, department };
  }
  
  return university;
}

/**
 * Get all available universities
 */
export function getAvailableUniversities() {
  return Object.keys(universityConfigs).map(key => ({
    key,
    name: universityConfigs[key].name,
    departments: Object.keys(universityConfigs[key].departments)
  }));
}

/**
 * Get scraping URLs for a university department
 */
export function getScrapingUrls(universityKey, departmentKey) {
  const config = getUniversityConfig(universityKey, departmentKey);
  return config.department.urls;
}

/**
 * Determine if dynamic scraping is needed
 */
export function needsDynamicScraping(universityKey, departmentKey) {
  const config = getUniversityConfig(universityKey, departmentKey);
  return config.department.type === 'dynamic';
}

export default universityConfigs;
