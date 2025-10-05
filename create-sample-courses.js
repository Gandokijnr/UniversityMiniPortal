#!/usr/bin/env node

/**
 * Create Sample Courses for Testing
 * This will create realistic sample courses based on actual university data
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const sampleCourses = [
  {
    title: 'MSc Computer Science',
    description: 'Advanced study in computer science covering algorithms, machine learning, software engineering, and theoretical computer science. This program provides comprehensive training in both theoretical foundations and practical applications.',
    duration: '12 months',
    location: 'Oxford, England',
    fees: 32760,
    currency: 'GBP',
    entry_requirements: 'UK 2:1 honours degree or international equivalent in computer science, mathematics, or related field',
    modules: ['Advanced Algorithms', 'Machine Learning', 'Software Engineering', 'Theoretical Computer Science', 'Research Project'],
    start_dates: ['October 2024'],
    application_deadline: '2024-01-20',
    source_url: 'https://www.ox.ac.uk/admissions/graduate/courses/computer-science',
    university_name: 'University of Oxford',
    is_active: true,
    scholarship_available: true,
    language_requirements: 'IELTS 7.5 overall (7.0 in each component) or equivalent',
    assessment_methods: 'Coursework (50%), Examinations (30%), Dissertation (20%)',
    career_prospects: 'Software Engineer, Research Scientist, Data Scientist, Technical Consultant',
    accreditation: 'Accredited by the British Computer Society (BCS)',
    image_url: 'https://via.placeholder.com/800x400/ea580c/ffffff?text=Computer+Science'
  },
  {
    title: 'MSc Software Engineering',
    description: 'Comprehensive program focusing on large-scale software development, system design, and engineering practices. Covers modern software development methodologies and industry best practices.',
    duration: '12 months',
    location: 'Oxford, England',
    fees: 32760,
    currency: 'GBP',
    entry_requirements: 'UK 2:1 honours degree in computer science, software engineering, or related field',
    modules: ['Software Architecture', 'System Design', 'Project Management', 'Quality Assurance', 'Industry Project'],
    start_dates: ['October 2024'],
    application_deadline: '2024-01-20',
    source_url: 'https://www.ox.ac.uk/admissions/graduate/courses/software-engineering',
    university_name: 'University of Oxford',
    is_active: true,
    scholarship_available: false,
    language_requirements: 'IELTS 7.5 overall (7.0 in each component) or equivalent',
    assessment_methods: 'Coursework (60%), Project Work (40%)',
    career_prospects: 'Senior Software Engineer, Technical Lead, Software Architect, Product Manager',
    accreditation: 'Accredited by the British Computer Society (BCS)',
    image_url: 'https://via.placeholder.com/800x400/f97316/ffffff?text=Software+Engineering'
  },
  {
    title: 'MSc Artificial Intelligence',
    description: 'Advanced program in artificial intelligence covering machine learning, neural networks, natural language processing, and computer vision. Includes hands-on projects and research opportunities.',
    duration: '12 months',
    location: 'London, England',
    fees: 35900,
    currency: 'GBP',
    entry_requirements: 'First or upper second-class honours degree in computer science, mathematics, engineering, or related field',
    modules: ['Machine Learning', 'Neural Networks', 'Computer Vision', 'Natural Language Processing', 'AI Ethics', 'Research Project'],
    start_dates: ['October 2024'],
    application_deadline: '2024-03-31',
    source_url: 'https://www.imperial.ac.uk/study/pg/computing/artificial-intelligence/',
    university_name: 'Imperial College London',
    is_active: true,
    scholarship_available: true,
    language_requirements: 'IELTS 7.0 overall (6.5 in each component) or equivalent',
    assessment_methods: 'Coursework (70%), Individual Project (30%)',
    career_prospects: 'AI Engineer, Machine Learning Specialist, Data Scientist, Research Scientist',
    accreditation: null,
    image_url: 'https://via.placeholder.com/800x400/ea580c/ffffff?text=Artificial+Intelligence'
  },
  {
    title: 'MSc Computing Science',
    description: 'Flexible program allowing specialization in various areas of computing including software engineering, artificial intelligence, and human-computer interaction.',
    duration: '12 months',
    location: 'London, England',
    fees: 35900,
    currency: 'GBP',
    entry_requirements: 'First or upper second-class honours degree in computer science or related field',
    modules: ['Advanced Programming', 'Algorithms and Complexity', 'Software Engineering', 'Individual Project'],
    start_dates: ['October 2024'],
    application_deadline: '2024-07-31',
    source_url: 'https://www.imperial.ac.uk/study/pg/computing/computing-science/',
    university_name: 'Imperial College London',
    is_active: true,
    scholarship_available: false,
    language_requirements: 'IELTS 7.0 overall (6.5 in each component) or equivalent',
    assessment_methods: 'Coursework and examinations',
    career_prospects: 'Software Developer, Systems Analyst, Technical Consultant, Project Manager',
    accreditation: 'Accredited by the British Computer Society (BCS)',
    image_url: 'https://via.placeholder.com/800x400/f97316/ffffff?text=Computing+Science'
  }
];

async function createSampleCourses() {
  console.log('🎓 Creating Sample Courses for Testing...\n');
  
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
    );
    
    // Get universities and departments
    const { data: universities } = await supabase.from('universities').select('*');
    const { data: departments } = await supabase.from('departments').select('*');
    const { data: courseTypes } = await supabase.from('course_types').select('*');
    
    if (!universities || universities.length === 0) {
      console.error('❌ No universities found. Run the scraper first to create universities.');
      return;
    }
    
    let mscType = courseTypes?.find(ct => ct.name === 'MSc');
    if (!mscType) {
      // Create MSc course type
      const { data: newType } = await supabase
        .from('course_types')
        .insert({ name: 'MSc', description: 'Master of Science' })
        .select()
        .single();
      mscType = newType;
    }
    
    let coursesCreated = 0;
    
    for (const courseData of sampleCourses) {
      // Find matching university
      const university = universities.find(u => u.name === courseData.university_name);
      if (!university) {
        console.warn(`⚠️  University not found: ${courseData.university_name}`);
        continue;
      }
      
      // Find matching department
      const department = departments.find(d => d.university_id === university.id);
      if (!department) {
        console.warn(`⚠️  Department not found for: ${courseData.university_name}`);
        continue;
      }
      
      // Check if course already exists
      const { data: existing } = await supabase
        .from('courses_v2')
        .select('id')
        .eq('title', courseData.title)
        .eq('university_id', university.id)
        .single();
      
      if (existing) {
        console.log(`⏭️  Course already exists: ${courseData.title}`);
        continue;
      }
      
      // Create course (remove university_name field)
      const { university_name, ...cleanCourseData } = courseData;
      const { error } = await supabase
        .from('courses_v2')
        .insert({
          ...cleanCourseData,
          university_id: university.id,
          department_id: department.id,
          course_type_id: mscType.id,
          last_scraped_at: new Date().toISOString()
        });
      
      if (error) {
        console.error(`❌ Failed to create course "${courseData.title}":`, error.message);
      } else {
        console.log(`✅ Created course: ${courseData.title}`);
        coursesCreated++;
      }
    }
    
    console.log(`\n🎉 Successfully created ${coursesCreated} sample courses!`);
    console.log('💡 Your frontend should now display these courses');
    
  } catch (error) {
    console.error('💥 Failed to create sample courses:', error.message);
  }
}

createSampleCourses();
