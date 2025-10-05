<template>
  <div class="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-orange-200 transition-all duration-500 transform hover:-translate-y-1">
    <!-- Course Image with Overlay -->
    <div class="relative aspect-w-16 aspect-h-9 bg-orange-50 overflow-hidden">
      <img
        :src="getImageForCourse(course)"
        :alt="course.title"
        class="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
        loading="lazy"
        @error="handleImageError"
      >
      <!-- University Badge -->
      <div class="absolute top-4 left-4">
        <div class="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
          <span class="text-xs font-medium text-gray-700">{{ course.university?.name }}</span>
        </div>
      </div>
      <!-- Scholarship Badge -->
      <div v-if="course.scholarship_available" class="absolute top-4 right-4">
        <div class="bg-orange-500 text-white rounded-full px-3 py-1 shadow-sm">
          <span class="text-xs font-bold">Scholarship Available</span>
        </div>
      </div>
      <!-- Course Type Badge -->
      <div class="absolute bottom-4 left-4">
        <div class="bg-orange-500 text-white rounded-b-0 px-3 py-1 shadow-sm">
          <span class="text-sm font-bold">{{ course.course_type?.name }}</span>
        </div>
      </div>
    </div>

    <!-- Course Content -->
    <div class="p-6">
      <!-- Course Title -->
      <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300 line-clamp-2">
        {{ course.title }}
      </h3>

      <!-- Department -->
      <div class="flex items-center text-gray-600 mb-3">
        <BuildingLibraryIcon class="h-4 w-4 mr-2" />
        <span class="text-sm font-medium">{{ course.department?.name }}</span>
      </div>

      <!-- Course Details Grid -->
      <div class="grid grid-cols-2 gap-3 mb-4">
        <div class="flex items-center text-gray-500 text-sm">
          <ClockIcon class="h-4 w-4 mr-2 text-orange-500" />
          <span>{{ course.duration }}</span>
        </div>
        <div class="flex items-center text-gray-500 text-sm">
          <MapPinIcon class="h-4 w-4 mr-2 text-red-500" />
          <span>{{ course.location }}</span>
        </div>
        <div class="flex items-center text-gray-500 text-sm">
          <CalendarIcon class="h-4 w-4 mr-2 text-orange-500" />
          <span>{{ formatStartDates(course.start_dates) }}</span>
        </div>
        <div class="flex items-center text-gray-500 text-sm">
          <AcademicCapIcon class="h-4 w-4 mr-2 text-purple-500" />
          <span>{{ course.accreditation ? 'Accredited' : 'Non-accredited' }}</span>
        </div>
      </div>

      <!-- Description -->
      <p class="text-gray-600 text-sm mb-4 line-clamp-3">
        {{ course.description }}
      </p>

      <!-- Key Modules -->
      <div v-if="course.modules && course.modules.length > 0" class="mb-4">
        <h4 class="text-sm font-semibold text-gray-700 mb-2">Key Modules:</h4>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="(module, index) in course.modules.slice(0, 3)"
            :key="index"
            class="inline-block bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-full"
          >
            {{ module }}
          </span>
          <span
            v-if="course.modules.length > 3"
            class="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
          >
            +{{ course.modules.length - 3 }} more
          </span>
        </div>
      </div>

      <!-- Price and Actions -->
      <div class="flex items-center justify-between pt-4 border-t border-gray-100">
        <!-- Show fees section only if fees exist and are greater than 0 -->
        <div v-if="course.fees && course.fees > 0" class="flex flex-col">
          <div class="flex items-baseline">
            <span class="text-2xl font-bold text-gray-900">£{{ formatPrice(course.fees) }}</span>
            <span class="text-sm text-gray-500 ml-1">{{ course.currency }}</span>
          </div>
          <span class="text-xs text-gray-500">Total Course Fee</span>
        </div>
        <!-- Empty div to maintain layout when no fees -->
        <div v-else></div>
        
        <div class="flex items-center space-x-2">
          <!-- Compare Button -->
          <button
            @click.stop="toggleCompare"
            :class="[
              'p-2 rounded-lg transition-all duration-200',
              isInComparison 
                ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            ]"
            :title="isInComparison ? 'Remove from comparison' : 'Add to comparison'"
          >
            <ScaleIcon class="h-4 w-4" />
          </button>
          
          <!-- View Details Button -->
          <button
            @click="viewDetails"
            class="flex items-center bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-all duration-200 group"
          >
            <span class="text-sm font-medium mr-1">View Details</span>
            <ArrowRightIcon class="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </div>

    <!-- Hover Overlay for Quick Actions -->
    <div class="absolute inset-0 bg-orange-600/0 group-hover:bg-orange-600/5 transition-all duration-300 pointer-events-none"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  ClockIcon,
  MapPinIcon,
  CalendarIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
  ArrowRightIcon,
  ScaleIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  course: {
    type: Object,
    required: true
  },
  isInComparison: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-compare', 'view-details'])

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

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-GB').format(price)
}

const formatStartDates = (dates) => {
  if (!dates || dates.length === 0) return 'TBA'
  if (dates.length === 1) return dates[0]
  return `${dates[0]} +${dates.length - 1}`
}

const toggleCompare = () => {
  emit('toggle-compare', props.course)
}

const handleImageError = (event) => {
  // Fallback to a reliable default image if the selected image fails to load
  event.target.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop'
}

const viewDetails = () => {
  emit('view-details', props.course)
  router.push({ name: 'course-detail', params: { id: props.course.id } })
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
