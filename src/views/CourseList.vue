<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Enhanced Page Header -->
    <div class="bg-orange-600 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="text-center">
          <h1 class="text-5xl font-bold mb-4">UK Universities</h1>
          <p class="text-xl text-orange-100 mb-6">Discover world-class postgraduate programs from leading UK universities</p>
          <div class="flex justify-center space-x-8 text-sm">
            <div class="flex items-center">
              <div class="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
              <span>{{ totalCourses }} Courses Available</span>
            </div>
            <div class="flex items-center">
              <div class="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
              <span>{{ universitiesCount }} Universities</span>
            </div>
            <div class="flex items-center">
              <div class="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
              <span>{{ scholarshipCount }} Scholarships Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Filters Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CourseFilters
        :filters="filters"
        @update-filters="handleFiltersUpdate"
      />

      <!-- Results Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Available Courses</h2>
          <p class="text-gray-600">{{ filteredCourses.length }} courses found</p>
        </div>
        <div class="flex items-center space-x-4">
          <!-- View Toggle -->
          <div class="flex bg-gray-100 rounded-lg p-1">
            <button
              @click="viewMode = 'grid'"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              Grid View
            </button>
            <button
              @click="viewMode = 'list'"
              :class="[
                'px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              List View
            </button>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex items-center space-x-2">
            <!-- Refresh Data Button -->
            <button
              @click="refreshData"
              :disabled="loading"
              class="flex items-center bg-orange-700 text-white px-3 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors duration-200"
              :title="dataSource?.isEmpty ? 'Run scraper to get data' : 'Refresh data from Supabase'"
            >
              <svg class="h-4 w-4 mr-1" :class="{ 'animate-spin': loading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ loading ? 'Refreshing...' : 'Refresh' }}
            </button>
            
            <!-- Comparison Button -->
            <button
              v-if="comparisonCourses.length > 0"
              @click="showComparison = true"
              class="flex items-center bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200"
            >
              <ScaleIcon class="h-4 w-4 mr-2" />
              Compare ({{ comparisonCourses.length }})
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <ExclamationTriangleIcon class="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p class="text-red-600 font-medium">{{ error }}</p>
          <button
            @click="fetchCourses"
            class="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>

      <!-- Courses Display -->
      <div v-else>
        <!-- Grid View -->
        <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CourseCard
            v-for="course in filteredCourses"
            :key="course.id"
            :course="course"
            :is-in-comparison="isInComparison(course)"
            @toggle-compare="toggleComparison"
            @view-details="viewCourseDetails"
          />
        </div>
        
        <!-- List View -->
        <div v-else class="space-y-4">
          <div
            v-for="course in filteredCourses"
            :key="course.id"
            class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200"
          >
            <div class="flex items-start space-x-6">
              <img
                :src="getImageForCourse(course)"
                :alt="course.title"
                class="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                @error="handleImageError"
              >
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between">
                  <div>
                    <h3 class="text-xl font-bold text-gray-900 mb-1">{{ course.title }}</h3>
                    <p class="text-gray-600 mb-2">{{ course.university?.name }} • {{ course.department?.name }}</p>
                    <p class="text-gray-500 text-sm line-clamp-2">{{ course.description }}</p>
                  </div>
                  <div class="text-right flex-shrink-0 ml-4">
                    <div class="text-2xl font-bold text-gray-900">£{{ formatPrice(course.fees) }}</div>
                    <div class="text-sm text-gray-500">{{ course.currency }}</div>
                  </div>
                </div>
                <div class="flex items-center justify-between mt-4">
                  <div class="flex items-center space-x-4 text-sm text-gray-500">
                    <span class="flex items-center">
                      <ClockIcon class="h-4 w-4 mr-1" />
                      {{ course.duration }}
                    </span>
                    <span class="flex items-center">
                      <MapPinIcon class="h-4 w-4 mr-1" />
                      {{ course.location }}
                    </span>
                    <span v-if="course.scholarship_available" class="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                      Scholarship Available
                    </span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button
                      @click="toggleComparison(course)"
                      :class="[
                        'p-2 rounded-lg transition-all duration-200',
                        isInComparison(course) 
                          ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      ]"
                    >
                      <ScaleIcon class="h-4 w-4" />
                    </button>
                    <button
                      @click="viewCourseDetails(course)"
                      class="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div v-if="filteredCourses.length === 0" class="text-center py-12">
          <div class="bg-white rounded-xl p-8 max-w-lg mx-auto">
            <AcademicCapIcon class="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              {{ dataSource?.isEmpty ? 'No course data available' : 'No courses found' }}
            </h3>
            <p class="text-gray-500 mb-4">
              {{ dataSource?.isEmpty 
                ? 'Run the enhanced scraper to fetch fresh course data from university websites.' 
                : 'Try adjusting your filters or search terms.' 
              }}
            </p>
            <!-- <div class="space-y-2">
              <button
                v-if="!dataSource?.isEmpty"
                @click="clearFilters"
                class="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200 mr-2"
              >
                Clear Filters
              </button>
              <div v-if="dataSource?.isEmpty" class="bg-orange-50 border border-orange-200 rounded-lg p-4 text-left">
                <p class="text-sm text-orange-800 font-medium mb-2">To get course data:</p>
                <code class="text-xs bg-orange-100 text-orange-900 px-2 py-1 rounded block">npm run scrape:enhanced</code>
                <p class="text-xs text-orange-700 mt-2">This will scrape live data from Oxford, Edinburgh, and Imperial College London.</p>
              </div>
            </div> -->
          </div>
        </div>
      </div>
    </div>

    <!-- Course Comparison Modal -->
    <CourseComparison
      v-if="showComparison"
      :courses="comparisonCourses"
      @close="showComparison = false"
      @remove-course="removeFromComparison"
      @clear-all="clearComparison"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { CourseDataService } from '../services/courseDataService'
import CourseCard from '../components/CourseCard.vue'
import CourseFilters from '../components/CourseFilters.vue'
import CourseComparison from '../components/CourseComparison.vue'
import {
  AcademicCapIcon,
  ClockIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  ScaleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const courses = ref([])
const loading = ref(true)
const error = ref('')
const viewMode = ref('grid')
const showComparison = ref(false)
const comparisonCourses = ref([])
const filters = ref({})
const dataSource = ref(null)

// Dynamic image selection based on course content
const getImageForCourse = (course) => {
  // If course has a specific image URL, use it
  if (course.image_url && course.image_url !== 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800') {
    return course.image_url
  }
  
  // Otherwise, select image based on course title/subject
  const title = course.title?.toLowerCase() || ''
  const description = course.description?.toLowerCase() || ''
  const content = `${title} ${description}`
  
  // Computing/Technology courses
  if (content.includes('computing') || content.includes('computer') || content.includes('technology') || content.includes('software')) {
    return 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=600&fit=crop'
  }
  
  // Finance/Accounting courses
  if (content.includes('finance') || content.includes('accounting') || content.includes('economics') || content.includes('business')) {
    return 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop'
  }
  
  // Engineering courses
  if (content.includes('engineering') || content.includes('mechanical') || content.includes('electrical')) {
    return 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop'
  }
  
  // Science courses
  if (content.includes('science') || content.includes('physics') || content.includes('chemistry') || content.includes('biology')) {
    return 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop'
  }
  
  // Medicine/Health courses
  if (content.includes('medicine') || content.includes('health') || content.includes('medical')) {
    return 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop'
  }
  
  // Law courses
  if (content.includes('law') || content.includes('legal')) {
    return 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=600&fit=crop'
  }
  
  // Art/Design courses
  if (content.includes('art') || content.includes('design') || content.includes('creative')) {
    return 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop'
  }
  
  // Default university image
  return 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop'
}

// Computed properties
const filteredCourses = computed(() => {
  let filtered = [...courses.value]
  
  // Apply client-side filtering for immediate feedback
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    filtered = filtered.filter(course => 
      course.title?.toLowerCase().includes(searchTerm) ||
      course.description?.toLowerCase().includes(searchTerm) ||
      course.university?.name?.toLowerCase().includes(searchTerm) ||
      course.department?.name?.toLowerCase().includes(searchTerm)
    )
  }
  
  if (filters.value.universityId) {
    // Handle both string and number comparisons
    filtered = filtered.filter(course => {
      return course.university_id == filters.value.universityId || // Loose equality for type coercion
             String(course.university_id) === String(filters.value.universityId) // String comparison
    })
  }
  
  if (filters.value.departmentId) {
    filtered = filtered.filter(course => {
      return course.department_id == filters.value.departmentId ||
             String(course.department_id) === String(filters.value.departmentId)
    })
  }
  
  if (filters.value.courseTypeId) {
    filtered = filtered.filter(course => {
      return course.course_type_id == filters.value.courseTypeId ||
             String(course.course_type_id) === String(filters.value.courseTypeId)
    })
  }
  
  if (filters.value.scholarshipAvailable === 'true') {
    filtered = filtered.filter(course => course.scholarship_available === true)
  } else if (filters.value.scholarshipAvailable === 'false') {
    filtered = filtered.filter(course => course.scholarship_available === false)
  }
  
  // Price range filtering - only apply if user has explicitly set different values from defaults
  const hasCustomPriceRange = (filters.value.minFees && filters.value.minFees > 0) || 
                              (filters.value.maxFees && filters.value.maxFees < 100000)
  
  if (hasCustomPriceRange) {
    filtered = filtered.filter(course => {
      // If course has no fees, include it (don't filter out courses without fee data)
      if (!course.fees || course.fees === 0) {
        return true
      }
      
      const minFees = filters.value.minFees || 0
      const maxFees = filters.value.maxFees || Infinity
      
      return course.fees >= minFees && course.fees <= maxFees
    })
  }
  
  return filtered
})

const totalCourses = computed(() => courses.value.length)
const universitiesCount = computed(() => {
  const universities = new Set(courses.value.map(course => course.university?.name).filter(Boolean))
  return universities.size
})
const scholarshipCount = computed(() => {
  return courses.value.filter(course => course.scholarship_available).length
})

// Methods
const fetchCourses = async () => {
  try {
    loading.value = true
    error.value = ''

    // Initialize data if needed
    const initResult = await CourseDataService.initializeData()
    
    // Get data source information
    dataSource.value = await CourseDataService.getDataSourceInfo()
    
    // Fetch courses with filters
    const data = await CourseDataService.searchCourses(filters.value)
    courses.value = data
    
    // Log data source for debugging
    console.log('Data source info:', dataSource.value)
  } catch (err) {
    console.error('Error fetching courses:', err)
    error.value = 'Failed to load courses. Please try again later.'
  } finally {
    loading.value = false
  }
}

const refreshData = async () => {
  try {
    loading.value = true
    const result = await CourseDataService.refreshCourseData()
    dataSource.value = await CourseDataService.getDataSourceInfo()
    
    // Fetch updated courses
    const data = await CourseDataService.searchCourses(filters.value)
    courses.value = data
    
    console.log('Data refreshed:', result)
  } catch (err) {
    console.error('Error refreshing data:', err)
  } finally {
    loading.value = false
  }
}

const handleFiltersUpdate = (newFilters) => {
  filters.value = newFilters
  // Client-side filtering provides immediate feedback
  // Server-side filtering can be added for performance with large datasets
}

const clearFilters = () => {
  filters.value = {}
  fetchCourses()
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-GB').format(price)
}

// Comparison methods
const toggleComparison = (course) => {
  const index = comparisonCourses.value.findIndex(c => c.id === course.id)
  if (index > -1) {
    comparisonCourses.value.splice(index, 1)
  } else if (comparisonCourses.value.length < 3) {
    comparisonCourses.value.push(course)
  } else {
    alert('You can compare up to 3 courses at a time.')
  }
}

const isInComparison = (course) => {
  return comparisonCourses.value.some(c => c.id === course.id)
}

const removeFromComparison = (course) => {
  const index = comparisonCourses.value.findIndex(c => c.id === course.id)
  if (index > -1) {
    comparisonCourses.value.splice(index, 1)
  }
}

const clearComparison = () => {
  comparisonCourses.value = []
}

const handleImageError = (event) => {
  // Fallback to a reliable default image if the selected image fails to load
  event.target.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop'
}

const viewCourseDetails = (course) => {
  router.push({ name: 'course-detail', params: { id: course.id } })
}

onMounted(() => {
  fetchCourses()
})
</script>