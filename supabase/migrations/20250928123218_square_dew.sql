/*
  # Create courses table for course catalog

  1. New Tables
    - `courses`
      - `id` (uuid, primary key)
      - `title` (text, course name)
      - `university` (text, institution name)
      - `duration` (text, course duration)
      - `location` (text, course location)
      - `fees` (numeric, course fees)
      - `description` (text, detailed description)
      - `instructor` (text, instructor name)
      - `category` (text, course category)
      - `level` (text, beginner/intermediate/advanced)
      - `image_url` (text, course image)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `courses` table
    - Add policy for public read access to courses

  3. Sample Data
    - Insert sample courses with various categories and levels
*/

CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  university text NOT NULL,
  duration text NOT NULL,
  location text NOT NULL,
  fees numeric NOT NULL,
  description text DEFAULT '',
  instructor text DEFAULT '',
  category text DEFAULT '',
  level text DEFAULT 'Beginner',
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to courses"
  ON courses
  FOR SELECT
  TO public
  USING (true);

-- Insert sample courses
INSERT INTO courses (title, university, duration, location, fees, description, instructor, category, level, image_url) VALUES
('Computer Science Fundamentals', 'Stanford University', '16 weeks', 'Stanford, CA', 2500.00, 'Comprehensive introduction to computer science concepts including algorithms, data structures, and programming fundamentals. Perfect for beginners looking to start their journey in technology.', 'Dr. John Smith', 'Computer Science', 'Beginner', 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800'),

('Advanced Web Development', 'MIT', '12 weeks', 'Cambridge, MA', 3200.00, 'Deep dive into modern web development technologies including React, Node.js, and database design. Build full-stack applications with industry best practices.', 'Prof. Sarah Johnson', 'Web Development', 'Advanced', 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800'),

('Data Science and Analytics', 'Harvard University', '20 weeks', 'Cambridge, MA', 4000.00, 'Complete data science program covering statistics, machine learning, and data visualization techniques. Learn to extract insights from complex datasets.', 'Dr. Michael Brown', 'Data Science', 'Intermediate', 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800'),

('Digital Marketing Strategy', 'UC Berkeley', '8 weeks', 'Berkeley, CA', 1800.00, 'Modern digital marketing techniques including SEO, social media marketing, and content strategy. Perfect for entrepreneurs and marketing professionals.', 'Lisa Chen', 'Marketing', 'Beginner', 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=800'),

('Machine Learning Fundamentals', 'Carnegie Mellon', '14 weeks', 'Pittsburgh, PA', 3500.00, 'Introduction to machine learning algorithms, neural networks, and AI applications. Hands-on experience with Python and popular ML frameworks.', 'Dr. Robert Wilson', 'Artificial Intelligence', 'Intermediate', 'https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=800'),

('Business Analytics', 'Wharton School', '10 weeks', 'Philadelphia, PA', 2800.00, 'Business-focused analytics program covering financial modeling, market research, and strategic analysis. Make data-driven business decisions.', 'Prof. Amanda Davis', 'Business', 'Intermediate', 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800'),

('Mobile App Development', 'Georgia Tech', '18 weeks', 'Atlanta, GA', 2900.00, 'Learn to build native mobile applications for iOS and Android platforms. Cover React Native, Swift, and Kotlin development.', 'Dr. Kevin Park', 'Mobile Development', 'Intermediate', 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=800'),

('Cybersecurity Essentials', 'NYU', '12 weeks', 'New York, NY', 3100.00, 'Comprehensive cybersecurity program covering network security, ethical hacking, and risk management. Prepare for industry certifications.', 'Prof. Jennifer Lee', 'Cybersecurity', 'Beginner', 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800'),

('Cloud Computing Architecture', 'University of Washington', '16 weeks', 'Seattle, WA', 3400.00, 'Master cloud platforms like AWS, Azure, and Google Cloud. Learn to design scalable, secure cloud solutions for enterprise applications.', 'Dr. Mark Thompson', 'Cloud Computing', 'Advanced', 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=800'),

('UX/UI Design Principles', 'Art Center College', '10 weeks', 'Pasadena, CA', 2200.00, 'Learn user experience and interface design principles. Create intuitive, beautiful digital experiences using modern design tools and methodologies.', 'Sarah Martinez', 'Design', 'Beginner', 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800');