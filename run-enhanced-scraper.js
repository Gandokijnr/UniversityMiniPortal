#!/usr/bin/env node

/**
 * Enhanced Scraper Runner
 * 
 * Runs the comprehensive university course scraper and stores data in Supabase
 * Usage: npm run scrape:enhanced
 */

import { runEnhancedScraper } from './scrapers/enhanced-scraper.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  console.log('🚀 Starting Enhanced University Course Scraper');
  console.log('=' .repeat(60));
  
  try {
    // Validate environment variables
    if (!process.env.VITE_SUPABASE_URL && !process.env.SUPABASE_URL) {
      throw new Error('Missing SUPABASE_URL environment variable');
    }
    if (!process.env.VITE_SUPABASE_ANON_KEY && !process.env.SUPABASE_ANON_KEY) {
      throw new Error('Missing SUPABASE_ANON_KEY environment variable');
    }
    
    console.log('✅ Environment variables validated');
    console.log('🎯 Target: Supabase database');
    console.log('🎓 University: Imperial College London (Computing Courses)');
    console.log('');
    
    // Run the enhanced scraper
    const results = await runEnhancedScraper();
    console.log('\n' + '='.repeat(60));
    console.log('📊 SCRAPING RESULTS');
    console.log('='.repeat(60));
    
    console.log(`🎉 Total courses stored in database: ${results.totalCourses}`);
    console.log('');
    
    // University breakdown
    for (const [key, uni] of Object.entries(results.universities)) {
      const status = uni.success ? '✅' : '❌';
      console.log(`${status} ${uni.name}:`);
      console.log(`   📚 Courses found: ${uni.coursesFound}`);
      console.log(`   💾 Courses stored: ${uni.coursesStored}`);
      if (uni.error) {
        console.log(`   ⚠️  Error: ${uni.error}`);
      }
      console.log('');
    }
    
    // Error summary
    if (results.errors.length > 0) {
      console.log('⚠️  ERRORS ENCOUNTERED:');
      results.errors.forEach(error => {
        console.log(`   ${error.university}: ${error.error}`);
      });
      console.log('');
    }
    
    if (results.totalCourses > 0) {
      console.log('🎯 SUCCESS: Course data has been stored in Supabase!');
      console.log('💡 Your frontend will now display live scraped data');
      console.log('🔄 Run this scraper periodically to keep data fresh');
    } else {
      console.log('⚠️  WARNING: No courses were stored in the database');
      console.log('💡 Check your internet connection and university websites');
    }
    
  } catch (error) {
    console.error('\n❌ SCRAPER FAILED:');
    console.error(error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check your .env file has SUPABASE_URL and SUPABASE_ANON_KEY');
    console.error('2. Verify your Supabase database is accessible');
    console.error('3. Ensure you have internet connection');
    console.error('4. Check if university websites are accessible');
    
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Scraper interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Scraper terminated');
  process.exit(0);
});

// Run the scraper
main().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
