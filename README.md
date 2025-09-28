# University Mini Portal

A modern course catalog web application built with Vue 3, JavaScript, and Tailwind CSS. This application allows users to browse university courses, view detailed course information, and explore educational opportunities from various institutions.

## 🚀 Features

- **Landing Page** - Modern hero section with course statistics and features
- **Course Catalog** - Browse and search through available courses
- **Course Details** - Detailed view of individual courses with enrollment options
- **Responsive Design** - Mobile-first design that works on all devices
- **Modern UI** - Clean orange and white color scheme with smooth animations
- **Search & Filter** - Find courses by name, university, or category

## 🛠️ Tech Stack

- **Frontend:** Vue 3 with Composition API
- **Styling:** Tailwind CSS
- **Icons:** Heroicons
- **Database:** Supabase
- **Build Tool:** Vite
- **Language:** JavaScript (ES6+)

## 📋 Prerequisites

Before installing this project, make sure you have the following installed on your computer:

- **Node.js** (version 16.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)
- A **code editor** (VS Code recommended)

## 🔧 Installation Instructions

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

### Step 4: Database Setup (Optional)

If you want to use the course data functionality:

1. **Create Supabase Table:**
   ```sql
   CREATE TABLE courses (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title TEXT NOT NULL,
     university TEXT NOT NULL,
     duration TEXT NOT NULL,
     location TEXT NOT NULL,
     fees NUMERIC NOT NULL,
     description TEXT,
     instructor TEXT,
     category TEXT,
     level TEXT,
     image_url TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
   );
   ```

2. **Enable Row Level Security (RLS):**
   ```sql
   ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
   
   -- Allow public read access
   CREATE POLICY "Allow public read access" ON courses
   FOR SELECT USING (true);
   ```

### Step 5: Run the Development Server

```bash
# Start the development server
npm run dev

# Or with yarn
yarn dev
```

The application will be available at `http://localhost:5173/`

## 🏗️ Build for Production

```bash
# Build the project for production
npm run build

# Preview the production build
npm run preview
```

## 📁 Project Structure

```
UniversityMiniPortal/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable Vue components
│   │   └── AppHeader.vue   # Navigation header
│   ├── views/              # Page components
│   │   ├── LandingPage.vue # Home page
│   │   ├── CourseList.vue  # Course catalog
│   │   └── CourseDetail.vue# Individual course page
│   ├── router/             # Vue Router configuration
│   ├── lib/                # Utility libraries
│   │   └── supabase.js     # Supabase client
│   ├── style.css           # Global styles
│   └── main.js             # Application entry point
├── tailwind.config.js      # Tailwind CSS configuration
├── vite.config.js          # Vite configuration
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## 🎨 Customization

### Colors
The project uses an orange and white color scheme. To change colors:
1. Update `tailwind.config.js` primary colors
2. Modify color classes in Vue components
3. Update CSS custom properties in `src/style.css`

### Content
- Update course data in your Supabase database
- Modify text content in Vue components
- Replace images by updating `image_url` in the database

## 🚨 Troubleshooting

### Common Issues:

1. **Port already in use:**
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

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues during installation or setup:
1. Check the troubleshooting section above
2. Ensure all prerequisites are properly installed
3. Verify your environment variables are correct
4. Check the browser console for any error messages

## 🌟 Acknowledgments

- Vue.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Heroicons for the beautiful icon set
- Supabase for the backend-as-a-service platform
