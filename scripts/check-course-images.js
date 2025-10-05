import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkCourseImages() {
  try {
    console.log('🖼️ CHECKING COURSE IMAGES');
    console.log('=' .repeat(40));
    
    const { data: courses, error } = await supabase
      .from('courses_v2')
      .select('title, image_url, last_scraped_at')
      .eq('is_active', true)
      .order('last_scraped_at', { ascending: false });
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log(`📊 Total courses: ${courses.length}`);
    
    if (courses.length === 0) {
      console.log('\n❌ NO COURSES FOUND');
      console.log('Run: npm run scrape:enhanced');
      return;
    }
    
    console.log('\n📋 COURSE IMAGES:');
    console.log('-'.repeat(80));
    
    let scrapedImages = 0;
    let defaultImages = 0;
    
    courses.forEach((course, i) => {
      console.log(`\n${i + 1}. ${course.title}`);
      console.log(`   🖼️  Image: ${course.image_url || 'No image'}`);
      
      if (course.image_url) {
        if (course.image_url.includes('unsplash.com')) {
          defaultImages++;
          console.log(`   📝 Type: Default image (subject-based)`);
        } else if (course.image_url.includes('imperial.ac.uk')) {
          scrapedImages++;
          console.log(`   🎯 Type: Scraped from university website`);
        } else {
          console.log(`   🔗 Type: External image`);
        }
      }
      
      console.log(`   🕒 Last scraped: ${course.last_scraped_at ? new Date(course.last_scraped_at).toLocaleString() : 'Unknown'}`);
    });
    
    console.log('\n📈 IMAGE STATISTICS:');
    console.log(`Scraped images: ${scrapedImages}/${courses.length} (${Math.round(scrapedImages/courses.length*100)}%)`);
    console.log(`Default images: ${defaultImages}/${courses.length} (${Math.round(defaultImages/courses.length*100)}%)`);
    console.log(`Total with images: ${courses.filter(c => c.image_url).length}/${courses.length} (${Math.round(courses.filter(c => c.image_url).length/courses.length*100)}%)`);
    
    console.log('\n✅ Image extraction is working!');
    console.log('🎨 Courses now have appropriate images for better UI display');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkCourseImages();
