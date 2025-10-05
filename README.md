# University Mini Portal

A comprehensive, modern web application for browsing and comparing MSc courses from **5 top UK universities**. Built with Vue 3, Vite, and Supabase with full multi-university support.

## **Featured Universities**

- **University of Edinburgh** (#16 ranking) - Edinburgh, Scotland
- **Imperial College London** (#8 ranking) - London, England  
- **University of Manchester** (#27 ranking) - Manchester, England
- **King's College London** (#31 ranking) - London, England
- **University of Bristol** (#58 ranking) - Bristol, England

## Enhanced Features

### Core Functionality
- **Multi-University Support** - Browse courses from multiple UK universities
- **Advanced Course Catalog** - Enhanced grid and list views with modern card design
- **Smart Filtering System** - Multi-criteria filters with price ranges and quick filters
- **Course Comparison** - Side-by-side comparison of up to 3 courses
- **Detailed Course Pages** - Rich course information with modules, requirements, and career prospects
- **Real-time Search** - Debounced search across titles, descriptions, and universities

### Design & UX
- **Modern Card Design** - Creative course cards with hover animations and badges
- **Responsive Layout** - Mobile-first design with adaptive grid systems
- **Interactive Elements** - Smooth transitions, micro-interactions, and visual feedback
- **Accessibility** - WCAG compliant with keyboard navigation and screen reader support
- **Progressive Enhancement** - Works without JavaScript, enhanced with it

### Data & Performance
- **Multi-University Architecture** - Scalable system supporting multiple UK universities
- **Independent Data Storage** - All course data stored locally in Supabase
- **Rich Metadata** - Comprehensive course information including modules and requirements
- **University-Specific Filtering** - Dynamic department filters based on selected university
- **Performance Optimized** - Lazy loading, code splitting, and optimized images
- **Offline Capable** - System functions independently of source websites

### Multi-University Features
- **5 Top UK Universities** - Edinburgh, Imperial, Manchester, King's, Bristol
- **15+ Departments** - University-specific departments and faculties
- **13+ MSc Programs** - Diverse courses across Computer Science, Engineering, Business
- **Realistic Pricing** - £27,400 - £37,900 fee range reflecting actual UK university costs
- **Geographic Diversity** - Courses across Scotland, London, Manchester, and Bristol
- **API Integration** - External APIs return multi-university course data

## Enhanced Tech Stack

- **Frontend:** Vue 3 with Composition API
- **Styling:** Tailwind CSS with custom design system
- **Icons:** Heroicons (24/outline)
- **Database:** Supabase with extended schema
- **Build Tool:** Vite with optimized config
- **Language:** JavaScript (ES6+) with JSDoc types
- **Architecture:** Component-based with service layer
- **State Management:** Reactive refs with computed properties

##  Prerequisites

Before installing this project, make sure you have the following installed on your computer:

- **Node.js** (version 16.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)
- A **code editor** (VS Code recommended)

##  Installation Instructions

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/Gandokijnr/UniversityMiniPortal.git

# Navigate to the project directory
cd UniversityMiniPortal
```

### Step 2: Install Dependencies

```bash
# Install all project dependencies
npm install

# Or if you prefer yarn
yarn install
```

### Step 3: Environment Setup

1. **Create environment file:**
   ```bash
   # Create a .env file in the root directory
   touch .env
   ```

2. **Add environment variables:**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Get Supabase Credentials:**
   - Go to [Supabase](https://supabase.com/)
   - Create a new project or use existing one
   - Go to Project Settings → API
   - Copy the Project URL and anon/public key
   - Paste them in your `.env` file

### Step 4: Database Setup (Required)

**Enhanced Database Schema for Stage 2:**

1. **Run the Complete Schema:**
   ```bash
   # Copy and execute the SQL from database/schema.sql in your Supabase SQL editor
   # This creates all necessary tables with relationships and sample data
   ```

2. **Key Tables Created:**
   - `universities` - UK university information
   - `departments` - University departments with contact details
   - `course_types` - MSc, MA, MBA, etc.
   - `courses_v2` - Enhanced course table with rich metadata
   - `course_specializations` - Course tracks and options
   - `course_comparisons` - User comparison selections

3. **Automatic Data Population:**
   ```javascript
   // The application will automatically populate sample data on first run
   // Including University of Edinburgh MSc Computer Science programs
   ```

### Step 5: Run the Development Server

```bash
# Start the development server
npm run dev

# Or with yarn
yarn dev
```

The application will be available at `http://localhost:5173/`

##  Build for Production

```bash
# Build the project for production
npm run build

# Preview the production build
npm run preview
```

##  Enhanced Project Structure

```
UniversityMiniPortal/
├── public/                 # Static assets
├── database/               # Database schema and migrations
│   └── schema.sql          # Complete database schema
├── src/
│   ├── components/         # Enhanced Vue components
│   │   ├── AppHeader.vue   # Navigation header
│   │   ├── CourseCard.vue  # Modern course card component
│   │   ├── CourseFilters.vue # Advanced filtering system
│   │   └── CourseComparison.vue # Course comparison modal
│   ├── views/              # Page components
│   │   ├── LandingPage.vue # Enhanced home page
│   │   ├── CourseList.vue  # Advanced course catalog
│   │   └── CourseDetail.vue# Rich course detail page
│   ├── services/           # Business logic layer
│   │   └── courseDataService.js # Data management service
│   ├── router/             # Vue Router configuration
│   ├── lib/                # Utility libraries
│   │   └── supabase.js     # Supabase client
│   ├── style.css           # Global styles
│   └── main.js             # Application entry point
├── tailwind.config.js      # Tailwind CSS configuration
├── vite.config.js          # Vite configuration
├── package.json            # Dependencies and scripts
├── STAGE2_DOCUMENTATION.md # Comprehensive Stage 2 documentation
└── README.md               # This file
```

##  Design System

### Enhanced Color Palette
The project uses a modern, accessible color system:
- **Primary Blue**: #3B82F6 (Trust, reliability)
- **Success Green**: #10B981 (Scholarships, achievements) 
- **Warning Orange**: #F59E0B (Actions, highlights)
- **Neutral Gray**: #6B7280 (Text, backgrounds)

1. **Colors**: Update `tailwind.config.js` for theme colors
2. **Typography**: Modify font families in Tailwind config
3. **Spacing**: Adjust component spacing in CSS classes
4. **Animations**: Customize transitions in component styles

###  **External API Integration**
- **Real API Calls**: Fetches live data from multiple sources using Axios
- **Fallback System**: Graceful degradation to sample data
- **Caching**: 30-minute cache for performance
- **Rate Limiting**: Prevents API abuse
- **Retry Logic**: Automatic retry with exponential backoff
- **Enhanced Error Handling**: Detailed error logging and recovery through Vue components

## Troubleshooting

### Common Issues:
   ```bash
   # Kill process on port 5173
   npx kill-port 5173
   ```

2. **Node modules issues:**
   ```bash
   # Clear npm cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Supabase connection errors:**
   - Verify your `.env` file has correct credentials
   - Check if your Supabase project is active
   - Ensure RLS policies allow public access

4. **Build errors:**
   ```bash
   # Clear Vite cache
   rm -rf node_modules/.vite
   npm run dev
   ```

##  Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  Additional Documentation

- **[Stage 2 Documentation](STAGE2_DOCUMENTATION.md)** - Comprehensive guide to Stage 2 enhancements
- **[Database Schema](database/schema.sql)** - Complete database structure
- **[Component Documentation](src/components/)** - Individual component guides

##  License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues during installation or setup:
1. Check the troubleshooting section above
2. Ensure all prerequisites are properly installed
3. Verify your environment variables are correct
4. Check the browser console for any error messages

##  Stage 2 Achievements

###  Requirements Met
- **Extended System**: Built upon Stage 1 with enhanced functionality
- **UK University Focus**: University of Edinburgh School of Informatics
- **Independent Storage**: Complete data independence from source sites
- **Creative Design**: Modern, unique UI/UX different from university websites
- **System Reliability**: Functions independently with local data storage

###  Key Innovations
- **Course Comparison**: Side-by-side comparison of up to 3 courses
- **Advanced Filtering**: Multi-criteria search with real-time updates
- **Modern UI**: Card-based design with micro-interactions
- **Rich Metadata**: Comprehensive course information and requirements
- **Performance**: Optimized loading and responsive design

##  Acknowledgments

- Vue.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Heroicons for the beautiful icon set
- Supabase for the backend-as-a-service platform
- University of Edinburgh for course inspiration
- Modern design patterns from Behance and Dribbble
