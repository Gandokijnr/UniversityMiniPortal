#!/usr/bin/env node

/**
 * Test Database Connection and Check Courses
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testDatabase() {
  console.log('🔍 Testing Supabase Database Connection...\n');
  
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
    );
    
    console.log('✅ Supabase client initialized');
    
    // Test connection by fetching courses
    console.log('📊 Checking courses in database...');
    const { data: courses, error: coursesError } = await supabase
      .from('courses_v2')
      .select('*')
      .limit(5);
    
    if (coursesError) {
      console.error('❌ Error fetching courses:', coursesError.message);
      return;
    }
    
    console.log(`📚 Found ${courses?.length || 0} courses in database`);
    
    if (courses && courses.length > 0) {
      console.log('\n🎓 Sample courses:');
      courses.forEach((course, index) => {
        console.log(`${index + 1}. ${course.title} - ${course.location}`);
      });
    } else {
      console.log('\n⚠️  No courses found in database');
      console.log('💡 Run "npm run scrape:enhanced" to populate with data');
    }
    
    // Check universities
    console.log('\n🏛️  Checking universities...');
    const { data: universities, error: uniError } = await supabase
      .from('universities')
      .select('*');
    
    if (uniError) {
      console.error('❌ Error fetching universities:', uniError.message);
    } else {
      console.log(`🏫 Found ${universities?.length || 0} universities`);
      if (universities && universities.length > 0) {
        universities.forEach(uni => {
          console.log(`   - ${uni.name}`);
        });
      }
    }
    
    // Check departments
    console.log('\n🏢 Checking departments...');
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('*');
    
    if (deptError) {
      console.error('❌ Error fetching departments:', deptError.message);
    } else {
      console.log(`🏛️  Found ${departments?.length || 0} departments`);
      if (departments && departments.length > 0) {
        departments.forEach(dept => {
          console.log(`   - ${dept.name}`);
        });
      }
    }
    
    console.log('\n✅ Database test completed!');
    
  } catch (error) {
    console.error('💥 Database test failed:', error.message);
    console.error('\n🔧 Check your .env file has correct Supabase credentials');
  }
}

testDatabase();
