-- Extended Database Schema for Stage 2
-- Supports multiple universities, departments, and MSc courses

-- Universities table
CREATE TABLE universities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    country TEXT NOT NULL DEFAULT 'UK',
    city TEXT NOT NULL,
    website_url TEXT,
    logo_url TEXT,
    description TEXT,
    ranking INTEGER,
    established_year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Departments table
CREATE TABLE departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT, -- e.g., 'CS', 'ENG', 'BUS'
    description TEXT,
    website_url TEXT,
    head_of_department TEXT,
    contact_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(university_id, name)
);

-- Course types table (for better categorization)
CREATE TABLE course_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE, -- e.g., 'MSc', 'BSc', 'PhD', 'Certificate'
    description TEXT,
    duration_months INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Extended courses table
CREATE TABLE courses_v2 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    course_type_id UUID NOT NULL REFERENCES course_types(id) ON DELETE RESTRICT,
    
    -- Course details
    description TEXT,
    duration TEXT NOT NULL, -- e.g., '12 months', '2 years'
    duration_months INTEGER, -- for filtering/sorting
    location TEXT NOT NULL,
    fees NUMERIC NOT NULL,
    currency TEXT DEFAULT 'GBP',
    
    -- Academic information
    entry_requirements TEXT,
    modules TEXT[], -- Array of module names
    assessment_methods TEXT,
    career_prospects TEXT,
    accreditation TEXT,
    
    -- Practical information
    start_dates TEXT[], -- Array of start dates
    application_deadline DATE,
    language_requirements TEXT,
    scholarship_available BOOLEAN DEFAULT false,
    
    -- Media and links
    image_url TEXT,
    brochure_url TEXT,
    source_url TEXT, -- Original source URL
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    last_scraped_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Course specializations/tracks
CREATE TABLE course_specializations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses_v2(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    additional_modules TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Course comparison favorites (for users to save courses for comparison)
CREATE TABLE course_comparisons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL, -- For anonymous users
    course_id UUID NOT NULL REFERENCES courses_v2(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(session_id, course_id)
);

-- Enable Row Level Security
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_comparisons ENABLE ROW LEVEL SECURITY;



-- Create indexes for better performance
CREATE INDEX idx_courses_v2_university_id ON courses_v2(university_id);
CREATE INDEX idx_courses_v2_department_id ON courses_v2(department_id);
CREATE INDEX idx_courses_v2_course_type_id ON courses_v2(course_type_id);
CREATE INDEX idx_courses_v2_fees ON courses_v2(fees);
CREATE INDEX idx_courses_v2_duration_months ON courses_v2(duration_months);
CREATE INDEX idx_courses_v2_is_active ON courses_v2(is_active);
CREATE INDEX idx_departments_university_id ON departments(university_id);
CREATE INDEX idx_course_specializations_course_id ON course_specializations(course_id);
CREATE INDEX idx_course_comparisons_session_id ON course_comparisons(session_id);
