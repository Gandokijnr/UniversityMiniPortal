/**
 * 🌐 Run All University Scrapers
 * 
 * This script runs all configured university scrapers and populates the database
 * with real course data from multiple UK universities.
 * 
 * Usage: npm run scrape:all-real
 */

// Oxford scraper removed - using generic scraper system instead

// Try to import other modules, but continue if they fail
let CourseScraperRunner, getAvailableUniversities, CourseDataService, ScraperIntegrationService;

try {
  const scraperModule = await import('./scrapers/run-scraper.js');
  CourseScraperRunner = scraperModule.CourseScraperRunner;
} catch (error) {
  console.warn('⚠️ Could not load CourseScraperRunner:', error.message);
}

try {
  const configModule = await import('./scrapers/university-configs.js');
  getAvailableUniversities = configModule.getAvailableUniversities;
} catch (error) {
  console.warn('⚠️ Could not load university configs:', error.message);
}

try {
  const serviceModule = await import('./src/services/courseDataService.js');
  CourseDataService = serviceModule.CourseDataService;
} catch (error) {
  console.warn('⚠️ Could not load CourseDataService (database may not be configured):', error.message);
}

try {
  const integrationModule = await import('./scrapers/scraper-integration.js');
  ScraperIntegrationService = integrationModule.ScraperIntegrationService;
} catch (error) {
  console.warn('⚠️ Could not load ScraperIntegrationService:', error.message);
}

/**
 * Configuration for scraping all universities
 */
const SCRAPING_CONFIG = {
  // Delay between universities (in milliseconds) to be respectful
  universityDelay: 10000, // 10 seconds
  
  // Delay between departments within a university
  departmentDelay: 5000, // 5 seconds
  
  // Maximum retry attempts for failed scrapers
  maxRetries: 2,
  
  // Timeout for each scraper (in milliseconds)
  scraperTimeout: 60000, // 60 seconds
  
  // Save results to files
  saveResults: true,
  
  // Populate database
  populateDatabase: true
};

/**
 * Run all university scrapers
 */
async function runAllScrapers() {
  console.log('🌐 UNIVERSITY COURSE SCRAPER - ALL UNIVERSITIES');
  console.log('=' .repeat(60));
  console.log('Target: MSc/Postgraduate courses from UK universities');
  console.log('Strategy: Real data only, no fallbacks');
  console.log('=' .repeat(60));

  const startTime = Date.now();
  const results = {
    universities: [],
    totalCourses: 0,
    successCount: 0,
    failureCount: 0,
    errors: []
  };

  try {
    // Step 1: Get all available universities
    console.log('\n📋 Step 1: Identifying target universities...');
    
    let availableUniversities = [];
    if (getAvailableUniversities) {
      try {
        availableUniversities = getAvailableUniversities();
      } catch (error) {
        console.warn('⚠️ Could not get university configs, using Oxford only');
      }
    }
    
    // Use all available universities from configuration
    const allUniversities = availableUniversities;

    console.log(`🎯 Found ${allUniversities.length} universities to scrape:`);
    allUniversities.forEach((uni, index) => {
      console.log(`   ${index + 1}. ${uni.name}${uni.specialized ? ' (specialized scraper)' : ''}`);
    });

    // Step 2: Initialize scraper services
    console.log('\n🔧 Step 2: Initializing scraper services...');
    const scraperRunner = new CourseScraperRunner();
    const integrationService = new ScraperIntegrationService(CourseDataService);

    // Step 3: Scrape each university
    console.log('\n📡 Step 3: Scraping universities...');
    
    for (let i = 0; i < allUniversities.length; i++) {
      const university = allUniversities[i];
      const universityResult = {
        name: university.name,
        key: university.key,
        courses: [],
        success: false,
        error: null,
        duration: 0
      };

      try {
        console.log(`\n🏛️ [${i + 1}/${allUniversities.length}] Scraping ${university.name}...`);
        const uniStartTime = Date.now();

        let courses = [];

        // Use generic scraper runner for all universities
        console.log('   🔧 Using generic scraper...');
        courses = await runWithTimeout(
          scraperRunner.scrapeUniversity(university.key), 
          SCRAPING_CONFIG.scraperTimeout
        );

        universityResult.duration = Date.now() - uniStartTime;

        if (courses && courses.length > 0) {
          universityResult.courses = courses;
          universityResult.success = true;
          results.successCount++;
          results.totalCourses += courses.length;

          console.log(`   ✅ Success: ${courses.length} courses scraped`);
          console.log(`   ⏱️ Duration: ${Math.round(universityResult.duration / 1000)}s`);

          // Display sample courses
          if (courses.length > 0) {
            console.log('   📚 Sample courses:');
            courses.slice(0, 3).forEach((course, idx) => {
              console.log(`      ${idx + 1}. ${course.title}`);
            });
            if (courses.length > 3) {
              console.log(`      ... and ${courses.length - 3} more`);
            }
          }
        } else {
          universityResult.success = false;
          universityResult.error = 'No courses found';
          results.failureCount++;
          console.log('   ⚠️ No courses found');
        }

      } catch (error) {
        universityResult.success = false;
        universityResult.error = error.message;
        universityResult.duration = Date.now() - uniStartTime;
        results.failureCount++;
        results.errors.push({
          university: university.name,
          error: error.message
        });

        console.log(`   ❌ Failed: ${error.message}`);
      }

      results.universities.push(universityResult);

      // Respectful delay between universities
      if (i < allUniversities.length - 1) {
        console.log(`   ⏳ Waiting ${SCRAPING_CONFIG.universityDelay / 1000}s before next university...`);
        await delay(SCRAPING_CONFIG.universityDelay);
      }
    }

    // Step 4: Process and integrate all scraped data
    if (results.totalCourses > 0) {
      console.log('\n💾 Step 4: Processing and integrating scraped data...');
      
      // Collect all courses
      const allCourses = results.universities
        .filter(uni => uni.success)
        .flatMap(uni => uni.courses);

      if (SCRAPING_CONFIG.populateDatabase && CourseDataService) {
        console.log('   📊 Populating database...');
        try {
          const dbResult = await CourseDataService.initializeData();
          
          if (dbResult.success) {
            console.log(`   ✅ Database populated successfully`);
            console.log(`   📚 Source: ${dbResult.source}`);
          } else {
            console.log(`   ⚠️ Database population had issues: ${dbResult.error || dbResult.message}`);
          }
        } catch (dbError) {
          console.log(`   ⚠️ Database population failed: ${dbError.message}`);
        }
      } else if (SCRAPING_CONFIG.populateDatabase && !CourseDataService) {
        console.log('   ⚠️ Database service not available - skipping database population');
        console.log('   💡 Configure Supabase environment variables to enable database features');
      }

      if (SCRAPING_CONFIG.saveResults) {
        console.log('   💾 Saving results to file...');
        await saveScrapingResults(results, allCourses);
      }
    }

    // Step 5: Final verification
    console.log('\n🔍 Step 5: Verifying stored data...');
    
    let allStoredCourses = [];
    if (CourseDataService) {
      try {
        allStoredCourses = await CourseDataService.getAllCourses();
        console.log(`📊 Total courses in database: ${allStoredCourses.length}`);

        // Group by university
        const coursesByUniversity = {};
        allStoredCourses.forEach(course => {
          const uniName = course.university?.name || 'Unknown';
          coursesByUniversity[uniName] = (coursesByUniversity[uniName] || 0) + 1;
        });

        console.log('📈 Courses by university:');
        Object.entries(coursesByUniversity).forEach(([uni, count]) => {
          console.log(`   ${uni}: ${count} courses`);
        });
      } catch (error) {
        console.log(`⚠️ Could not verify database contents: ${error.message}`);
      }
    } else {
      console.log('📊 Database verification skipped (database service not available)');
    }

    // Final summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 SCRAPING SUMMARY');
    console.log('=' .repeat(60));
    console.log(`🎯 Universities targeted: ${allUniversities.length}`);
    console.log(`✅ Successful: ${results.successCount}`);
    console.log(`❌ Failed: ${results.failureCount}`);
    console.log(`📚 Total courses scraped: ${results.totalCourses}`);
    console.log(`💾 Courses in database: ${allStoredCourses.length}`);
    console.log(`⏱️ Total duration: ${Math.round((Date.now() - startTime) / 1000)}s`);

    if (results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      results.errors.forEach(error => {
        console.log(`   ${error.university}: ${error.error}`);
      });
    }

    if (results.successCount > 0) {
      console.log('\n🎉 SUCCESS! Real university course data is now available');
      console.log('🌐 The University Mini Portal shows authentic course information');
      console.log('📅 Data will be refreshed automatically by scheduled jobs');
    } else {
      console.log('\n⚠️ No data was successfully scraped');
      console.log('🔧 Check network connectivity and scraper configurations');
    }

    console.log('=' .repeat(60));

    return {
      success: results.successCount > 0,
      results,
      summary: {
        universities: allUniversities.length,
        successful: results.successCount,
        failed: results.failureCount,
        totalCourses: results.totalCourses,
        databaseCourses: allStoredCourses.length
      }
    };

  } catch (error) {
    console.error('\n💥 Critical error during scraping:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

/**
 * Run a function with timeout
 */
async function runWithTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}

/**
 * Delay function
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Save scraping results to file
 */
async function saveScrapingResults(results, allCourses) {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `all-universities-scraping-${timestamp}.json`;
    const filepath = path.join('scrapers', 'results', filename);
    
    const output = {
      timestamp: new Date().toISOString(),
      summary: {
        universities: results.universities.length,
        successful: results.successCount,
        failed: results.failureCount,
        totalCourses: results.totalCourses
      },
      universities: results.universities,
      courses: allCourses,
      errors: results.errors,
      config: SCRAPING_CONFIG
    };
    
    await fs.mkdir(path.dirname(filepath), { recursive: true });
    await fs.writeFile(filepath, JSON.stringify(output, null, 2));
    
    console.log(`   📁 Results saved to: ${filepath}`);
  } catch (error) {
    console.warn(`   ⚠️ Could not save results: ${error.message}`);
  }
}

// Run all scrapers if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllScrapers()
    .then(result => {
      console.log('\n✅ All scrapers completed');
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('\n💥 Scraping failed:', error);
      process.exit(1);
    });
}

export { runAllScrapers };
export default runAllScrapers;
