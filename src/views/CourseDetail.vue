<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Enhanced Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between py-4">
          <button
            @click="goBack"
            class="flex items-center text-gray-600 hover:text-orange-600 transition-colors duration-200"
          >
            <ArrowLeftIcon class="h-5 w-5 mr-2" />
            <span class="font-medium">Back to Courses</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center">
        <div class="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
          <ExclamationTriangleIcon class="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p class="text-red-600 font-medium">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Enhanced Course Detail Content -->
    <div v-else-if="course" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Enhanced Course Header -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="relative aspect-w-16 aspect-h-9 bg-orange-50">
              <img
                :src="getImageForCourse(course)"
                :alt="course.title"
                class="w-full h-64 object-cover"
                @error="handleImageError"
              >
              <!-- University Logo Overlay -->
              <div class="absolute top-6 left-6">
                <div class="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm">
                  <span class="text-sm font-semibold text-gray-800">{{ course.university?.name }}</span>
                </div>
              </div>
              <!-- Scholarship Badge -->
              <div v-if="course.scholarship_available" class="absolute top-6 right-6">
                <div class="bg-orange-500 text-white rounded-b-0 px-4 py-2 shadow-sm">
                  <span class="text-sm font-bold">Scholarship Available</span>
                </div>
              </div>
            </div>
            <div class="p-8">
              <div class="flex items-center gap-3 mb-4">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  {{ course.course_type?.name }}
                </span>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  {{ course.department?.name }}
                </span>
              </div>
              <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ course.title }}</h1>
              <div class="flex items-center text-gray-600 mb-6">
                <BuildingLibraryIcon class="h-5 w-5 mr-2" />
                <span class="text-lg font-medium">{{ course.university?.name }}</span>
                <span class="mx-2 text-gray-400">•</span>
                <MapPinIcon class="h-4 w-4 mr-1" />
                <span class="text-lg">{{ course.location }}</span>
              </div>
            </div>
          </div>

          <!-- Course Description -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-6">Course Overview</h2>
            <p class="text-gray-700 leading-relaxed text-lg mb-6">
              {{ course.description || 'Detailed course description coming soon...' }}
            </p>
            
            <!-- Key Features -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div class="flex items-center p-4 bg-orange-50 rounded-lg">
                <ClockIcon class="h-6 w-6 text-orange-600 mr-3" />
                <div>
                  <div class="font-semibold text-gray-900">Duration</div>
                  <div class="text-sm text-gray-600">{{ course.duration }}</div>
                </div>
              </div>
              <div class="flex items-center p-4 bg-orange-50 rounded-lg">
                <CalendarIcon class="h-6 w-6 text-orange-600 mr-3" />
                <div>
                  <div class="font-semibold text-gray-900">Start Dates</div>
                  <div class="text-sm text-gray-600">{{ formatStartDates(course.start_dates) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Course Modules -->
          <div v-if="course.modules && course.modules.length > 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-6">Course Modules</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="(module, index) in course.modules"
                :key="index"
                class="flex items-start p-4 bg-gray-50 rounded-lg"
              >
                <div class="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  {{ index + 1 }}
                </div>
                <div>
                  <h3 class="font-medium text-gray-900">{{ module }}</h3>
                </div>
              </div>
            </div>
          </div>

          <!-- Entry Requirements -->
          <div v-if="course.entry_requirements" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-6">Entry Requirements</h2>
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p class="text-gray-700 leading-relaxed">{{ course.entry_requirements }}</p>
            </div>
          </div>

          <!-- Assessment & Career Prospects -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-if="course.assessment_methods" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Assessment Methods</h3>
              <p class="text-gray-700">{{ course.assessment_methods }}</p>
            </div>
            <div v-if="course.career_prospects" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Career Prospects</h3>
              <p class="text-gray-700">{{ course.career_prospects }}</p>
            </div>
          </div>
        </div>

        <!-- Enhanced Sidebar -->
        <div class="space-y-6">
          <!-- Course Details Card -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">Course Information</h3>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between py-3 border-b border-gray-100">
                <div class="flex items-center text-gray-600">
                  <ClockIcon class="h-5 w-5 mr-3 text-orange-500" />
                  <span>Duration</span>
                </div>
                <span class="font-medium text-gray-900">{{ course.duration }}</span>
              </div>

              <div class="flex items-center justify-between py-3 border-b border-gray-100">
                <div class="flex items-center text-gray-600">
                  <MapPinIcon class="h-5 w-5 mr-3 text-red-500" />
                  <span>Location</span>
                </div>
                <span class="font-medium text-gray-900">{{ course.location }}</span>
              </div>

              <!-- Show fees section only if fees exist and are greater than 0 -->
              <div v-if="course.fees && course.fees > 0" class="flex items-center justify-between py-3 border-b border-gray-100">
                <div class="flex items-center text-gray-600">
                  <CurrencyDollarIcon class="h-5 w-5 mr-3 text-orange-500" />
                  <span>Course Fee</span>
                </div>
                <div class="text-right">
                  <div class="font-bold text-2xl text-gray-900">£{{ formatPrice(course.fees) }}</div>
                  <div class="text-sm text-gray-500">{{ course.currency }}</div>
                </div>
              </div>

              <div class="flex items-center justify-between py-3 border-b border-gray-100">
                <div class="flex items-center text-gray-600">
                  <AcademicCapIcon class="h-5 w-5 mr-3 text-orange-500" />
                  <span>Course Type</span>
                </div>
                <span class="font-medium text-gray-900">{{ course.course_type?.name }}</span>
              </div>

              <div v-if="course.application_deadline" class="flex items-center justify-between py-3 border-b border-gray-100">
                <div class="flex items-center text-gray-600">
                  <CalendarIcon class="h-5 w-5 mr-3 text-orange-500" />
                  <span>Deadline</span>
                </div>
                <span class="font-medium text-gray-900">{{ formatDate(course.application_deadline) }}</span>
              </div>

              <div class="flex items-center justify-between py-3">
                <div class="flex items-center text-gray-600">
                  <CheckCircleIcon class="h-5 w-5 mr-3 text-orange-500" />
                  <span>Accredited</span>
                </div>
                <span class="font-medium text-gray-900">{{ course.accreditation ? 'Yes' : 'No' }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="mt-8 space-y-3">
              <button 
                @click="openSourceUrl"
                class="w-full bg-orange-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Apply Now
              </button>
              <button 
                v-if="course.brochure_url"
                @click="downloadBrochure"
                class="w-full bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200"
              >
                Download Brochure
              </button>
              <p class="text-xs text-gray-500 text-center mt-3">
                Click to visit the official university page
              </p>
            </div>
          </div>

          <!-- Language Requirements -->
          <div v-if="course.language_requirements" class="bg-orange-50 rounded-2xl p-6 border border-orange-100">
            <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
              <GlobeAltIcon class="h-5 w-5 mr-2 text-orange-600" />
              Language Requirements
            </h4>
            <p class="text-sm text-gray-700">{{ course.language_requirements }}</p>
          </div>

          <!-- Contact Info -->
          <div class="bg-orange-50 rounded-2xl p-6 border border-orange-100">
            <h4 class="font-semibold text-gray-900 mb-3">Need Help?</h4>
            <p class="text-sm text-gray-700 mb-4">
              Have questions about this course? Contact the admissions team.
            </p>
            <div class="space-y-2">
              <div v-if="course.department?.contact_email" class="flex items-center text-sm text-gray-600">
                <EnvelopeIcon class="h-4 w-4 mr-2" />
                <a :href="`mailto:${course.department.contact_email}`" class="text-orange-600 hover:text-orange-700">
                  {{ course.department.contact_email }}
                </a>
              </div>
              <button class="text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors duration-200">
                Visit University Website →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { CourseDataService } from '../services/courseDataService'
import {
  ArrowLeftIcon,
  AcademicCapIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  BuildingLibraryIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  ScaleIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()

const course = ref(null)
const loading = ref(true)
const error = ref('')
const isInComparison = ref(false)

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

const fetchCourse = async () => {
  try {
    loading.value = true
    error.value = ''

    const data = await CourseDataService.getCourseById(route.params.id)
    course.value = data
  } catch (err) {
    console.error('Error fetching course:', err)
    error.value = 'Failed to load course details. Please try again later.'
  } finally {
    loading.value = false
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-GB').format(price)
}

const handleImageError = (event) => {
  // Fallback to a reliable default image if the selected image fails to load
  event.target.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop'
}

const formatDate = (dateString) => {
  if (!dateString) return 'TBA'
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
const formatStartDates = (dates) => {
  if (!dates || dates.length === 0) return 'To be announced'
  if (dates.length === 1) return dates[0]
  return dates.join(', ')
}

const openSourceUrl = () => {
  if (course.value?.source_url) {
    window.open(course.value.source_url, '_blank')
  }
}

const downloadBrochure = () => {
  if (course.value?.brochure_url) {
    window.open(course.value.brochure_url, '_blank')
  }
}

const goBack = () => {
  router.push({ name: 'courses' })
}

onMounted(() => {
  fetchCourse()
})
</script>