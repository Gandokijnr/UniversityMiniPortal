<template>
  <div class="min-h-screen">
    <!-- Page Header -->
    <div class="bg-white shadow-sm border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">Course Catalog</h1>
          <p class="text-lg text-gray-600">Discover amazing courses from top universities</p>
        </div>
      </div>
    </div>

    <!-- Search and Filter Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="search"
                v-model="searchQuery"
                type="text"
                placeholder="Search courses..."
                class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              >
            </div>
          </div>
          <div class="md:w-48">
            <select
              v-model="selectedCategory"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <ExclamationTriangleIcon class="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p class="text-red-600 font-medium">{{ error }}</p>
        </div>
      </div>

      <!-- Courses Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="course in filteredCourses"
          :key="course.id"
          class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer group"
          @click="goToCourse(course.id)"
        >
          <!-- Course Image -->
          <div class="aspect-w-16 aspect-h-9 bg-gray-200 overflow-hidden">
            <img
              :src="course.image_url || 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800'"
              :alt="course.title"
              class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            >
          </div>

          <!-- Course Content -->
          <div class="p-6">
            <!-- Category Badge -->
            <div class="flex items-center justify-between mb-3">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                {{ course.category || 'General' }}
              </span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                {{ course.level }}
              </span>
            </div>

            <!-- Course Title -->
            <h3 class="text-xl font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-200">
              {{ course.title }}
            </h3>

            <!-- University -->
            <div class="flex items-center text-gray-600 mb-3">
              <AcademicCapIcon class="h-4 w-4 mr-1" />
              <span class="text-sm font-medium">{{ course.university }}</span>
            </div>

            <!-- Course Details -->
            <div class="space-y-2 mb-4">
              <div class="flex items-center text-gray-500 text-sm">
                <ClockIcon class="h-4 w-4 mr-2" />
                <span>{{ course.duration }}</span>
              </div>
              <div class="flex items-center text-gray-500 text-sm">
                <MapPinIcon class="h-4 w-4 mr-2" />
                <span>{{ course.location }}</span>
              </div>
            </div>

            <!-- Price and CTA -->
            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
              <div class="flex flex-col">
                <span class="text-2xl font-bold text-gray-900">${{ course.fees.toLocaleString() }}</span>
                <span class="text-sm text-gray-500">Course Fee</span>
              </div>
              <div class="flex items-center text-orange-600 font-medium text-sm group-hover:text-orange-700 transition-colors duration-200">
                <span class="mr-1">View Details</span>
                <ArrowRightIcon class="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="!loading && !error && filteredCourses.length === 0" class="text-center py-12">
        <div class="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
          <AcademicCapIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 font-medium">No courses found matching your criteria.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import {
  MagnifyingGlassIcon,
  AcademicCapIcon,
  ClockIcon,
  MapPinIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const courses = ref([])
const loading = ref(true)
const error = ref('')
const searchQuery = ref('')
const selectedCategory = ref('')

const categories = computed(() => {
  const cats = courses.value.map(course => course.category).filter(Boolean)
  return [...new Set(cats)].sort()
})

const filteredCourses = computed(() => {
  let filtered = courses.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(course =>
      course.title.toLowerCase().includes(query) ||
      course.university.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query)
    )
  }

  if (selectedCategory.value) {
    filtered = filtered.filter(course => course.category === selectedCategory.value)
  }

  return filtered
})

const fetchCourses = async () => {
  try {
    loading.value = true
    error.value = ''

    const { data, error: fetchError } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      throw fetchError
    }

    courses.value = data || []
  } catch (err) {
    console.error('Error fetching courses:', err)
    error.value = 'Failed to load courses. Please try again later.'
  } finally {
    loading.value = false
  }
}

const goToCourse = (courseId) => {
  router.push({ name: 'course-detail', params: { id: courseId } })
}

onMounted(() => {
  fetchCourses()
})
</script>