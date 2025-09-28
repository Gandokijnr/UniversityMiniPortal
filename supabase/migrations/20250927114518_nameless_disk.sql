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
('Computer Science Fundamentals', 'Stanford University', '16 weeks', 'Stanford, CA', 2500.00, 'Comprehensive introduction to computer science concepts including algorithms, data structures, and programming fundamentals.', 'Dr. John Smith', 'Computer Science', 'Beginner', 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Advanced Web Development', 'MIT', '12 weeks', 'Cambridge, MA', 3200.00, 'Deep dive into modern web development technologies including React, Node.js, and database design.', 'Prof. Sarah Johnson', 'Web Development', 'Advanced', 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Data Science and Analytics', 'Harvard University', '20 weeks', 'Cambridge, MA', 4000.00, 'Complete data science program covering statistics, machine learning, and data visualization techniques.', 'Dr. Michael Brown', 'Data Science', 'Intermediate', 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Digital Marketing Strategy', 'UC Berkeley', '8 weeks', 'Berkeley, CA', 1800.00, 'Modern digital marketing techniques including SEO, social media marketing, and content strategy.', 'Lisa Chen', 'Marketing', 'Beginner', 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Machine Learning Fundamentals', 'Carnegie Mellon', '14 weeks', 'Pittsburgh, PA', 3500.00, 'Introduction to machine learning algorithms, neural networks, and AI applications.', 'Dr. Robert Wilson', 'Artificial Intelligence', 'Intermediate', 'https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Business Analytics', 'Wharton School', '10 weeks', 'Philadelphia, PA', 2800.00, 'Business-focused analytics program covering financial modeling, market research, and strategic analysis.', 'Prof. Amanda Davis', 'Business', 'Intermediate', 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800');