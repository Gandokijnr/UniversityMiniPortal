<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click="closeComparison">
    <div class="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden" @click.stop>
      <!-- Header -->
      <div class="bg-orange-600 text-white p-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold">Course Comparison</h2>
            <p class="text-orange-100 mt-1">Compare up to 3 courses side by side</p>
          </div>
          <button
            @click="closeComparison"
            class="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Comparison Content -->
      <div class="p-6 overflow-auto max-h-[calc(90vh-120px)]">
        <div v-if="courses.length === 0" class="text-center py-12">
          <ScaleIcon class="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">No courses to compare</h3>
          <p class="text-gray-500">Add courses to comparison by clicking the scale icon on course cards.</p>
        </div>

        <div v-else class="grid gap-6" :class="gridClass">
          <div
            v-for="course in courses"
            :key="course.id"
            class="bg-gray-50 rounded-xl p-6 relative"
          >
            <!-- Remove Button -->
            <button
              @click="removeCourse(course)"
              class="absolute top-4 right-4 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors duration-200"
            >
              <XMarkIcon class="h-4 w-4" />
            </button>

            <!-- Course Header -->
            <div class="mb-6">
              <img
                :src="getImageForCourse(course)"
                :alt="course.title"
                class="w-full h-32 object-cover rounded-lg mb-4"
                @error="handleImageError"
              >
              <h3 class="text-lg font-bold text-gray-900 mb-2">{{ course.title }}</h3>
              <div class="flex items-center text-sm text-gray-600">
                <BuildingLibraryIcon class="h-4 w-4 mr-1" />
                <span>{{ course.university?.name }}</span>
              </div>
            </div>

            <!-- Comparison Details -->
            <div class="space-y-4">
              <!-- Price -->
              <div class="bg-white rounded-lg p-4">
                <h4 class="text-sm font-semibold text-gray-700 mb-2">Course Fee</h4>
                <div class="text-2xl font-bold text-gray-900">
                  £{{ formatPrice(course.fees) }}
                  <span class="text-sm font-normal text-gray-500">{{ course.currency }}</span>
                </div>
              </div>

              <!-- Duration -->
              <div class="bg-white rounded-lg p-4">
                <h4 class="text-sm font-semibold text-gray-700 mb-2">Duration</h4>
                <div class="flex items-center text-gray-900">
                  <ClockIcon class="h-4 w-4 mr-2 text-orange-500" />
                  <span>{{ course.duration }}</span>
                </div>
              </div>

              <!-- Location -->
              <div class="bg-white rounded-lg p-4">
                <h4 class="text-sm font-semibold text-gray-700 mb-2">Location</h4>
                <div class="flex items-center text-gray-900">
                  <MapPinIcon class="h-4 w-4 mr-2 text-red-500" />
                  <span>{{ course.location }}</span>
                </div>
              </div>

              <!-- Start Dates -->
              <div class="bg-white rounded-lg p-4">
                <h4 class="text-sm font-semibold text-gray-700 mb-2">Start Dates</h4>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="date in course.start_dates"
                    :key="date"
                    class="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full"
                  >
                    {{ date }}
                  </span>
                </div>
              </div>

              <!-- Entry Requirements -->
              <div class="bg-white rounded-lg p-4">
                <h4 class="text-sm font-semibold text-gray-700 mb-2">Entry Requirements</h4>
                <p class="text-sm text-gray-600 line-clamp-3">{{ course.entry_requirements }}</p>
              </div>

              <!-- Key Modules -->
              <div v-if="course.modules && course.modules.length > 0" class="bg-white rounded-lg p-4">
                <h4 class="text-sm font-semibold text-gray-700 mb-2">Key Modules</h4>
                <div class="space-y-1">
                  <div
                    v-for="(module, index) in course.modules.slice(0, 4)"
                    :key="index"
                    class="text-sm text-gray-600"
                  >
                    • {{ module }}
                  </div>
                  <div v-if="course.modules.length > 4" class="text-xs text-gray-500">
                    +{{ course.modules.length - 4 }} more modules
                  </div>
                </div>
              </div>

              <!-- Accreditation -->
              <div class="bg-white rounded-lg p-4">
                <h4 class="text-sm font-semibold text-gray-700 mb-2">Accreditation</h4>
                <div class="flex items-center">
                  <div
                    :class="[
                      'w-3 h-3 rounded-full mr-2',
                      course.accreditation ? 'bg-orange-500' : 'bg-gray-300'
                    ]"
                  ></div>
                  <span class="text-sm text-gray-600">
                    {{ course.accreditation || 'Not specified' }}
                  </span>
                </div>
              </div>

              <!-- Scholarship -->
              <div class="bg-white rounded-lg p-4">
                <h4 class="text-sm font-semibold text-gray-700 mb-2">Scholarship Available</h4>
                <div class="flex items-center">
                  <div
                    :class="[
                      'w-3 h-3 rounded-full mr-2',
                      course.scholarship_available ? 'bg-orange-500' : 'bg-red-500'
                    ]"
                  ></div>
                  <span class="text-sm text-gray-600">
                    {{ course.scholarship_available ? 'Yes' : 'No' }}
                  </span>
                </div>
              </div>

              <!-- Action Button -->
              <button
                @click="viewCourseDetails(course)"
                class="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors duration-200 font-medium"
              >
                View Full Details
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600">
            {{ courses.length }} of 3 courses selected
          </div>
          <div class="flex space-x-3">
            <button
              @click="clearAll"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Clear All
            </button>
            <button
              @click="closeComparison"
              class="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  XMarkIcon,
  ScaleIcon,
  ClockIcon,
  MapPinIcon,
  BuildingLibraryIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  courses: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'remove-course', 'clear-all'])

const router = useRouter()

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

const gridClass = computed(() => {
  const count = props.courses.length
  if (count === 1) return 'grid-cols-1 max-w-md mx-auto'
  if (count === 2) return 'grid-cols-1 lg:grid-cols-2'
  return 'grid-cols-1 lg:grid-cols-3'
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-GB').format(price)
}

const closeComparison = () => {
  emit('close')
}

const removeCourse = (course) => {
  emit('remove-course', course)
}

const clearAll = () => {
  emit('clear-all')
}

const handleImageError = (event) => {
  // Fallback to a reliable default image if the selected image fails to load
  event.target.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop'
}

const viewCourseDetails = (course) => {
  closeComparison()
  router.push({ name: 'course-detail', params: { id: course.id } })
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
