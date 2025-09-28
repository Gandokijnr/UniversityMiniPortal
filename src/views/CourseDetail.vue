<template>
  <div class="min-h-screen">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center py-4">
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
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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

    <!-- Course Detail Content -->
    <div v-else-if="course" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Course Header -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="aspect-w-16 aspect-h-9 bg-gray-200">
              <img
                :src="course.image_url || 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800'"
                :alt="course.title"
                class="w-full h-64 object-cover"
              >
            </div>
            <div class="p-8">
              <div class="flex items-center gap-3 mb-4">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  {{ course.category || 'General' }}
                </span>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  {{ course.level }}
                </span>
              </div>
              <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ course.title }}</h1>
              <div class="flex items-center text-gray-600 mb-6">
                <AcademicCapIcon class="h-5 w-5 mr-2" />
                <span class="text-lg font-medium">{{ course.university }}</span>
              </div>
            </div>
          </div>

          <!-- Course Description -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">Course Description</h2>
            <p class="text-gray-700 leading-relaxed text-lg">
              {{ course.description || 'Detailed course description coming soon...' }}
            </p>
          </div>

          <!-- Instructor Information -->
          <div v-if="course.instructor" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">Instructor</h2>
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="h-16 w-16 bg-orange-600 rounded-full flex items-center justify-center">
                  <span class="text-white font-bold text-xl">
                    {{ course.instructor.split(' ').map(n => n[0]).join('') }}
                  </span>
                </div>
              </div>
              <div class="ml-4">
                <h3 class="text-xl font-medium text-gray-900">{{ course.instructor }}</h3>
                <p class="text-gray-600">Course Instructor</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Course Details Card -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">Course Details</h3>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div class="flex items-center text-gray-600">
                  <ClockIcon class="h-5 w-5 mr-3" />
                  <span>Duration</span>
                </div>
                <span class="font-medium text-gray-900">{{ course.duration }}</span>
              </div>

              <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div class="flex items-center text-gray-600">
                  <MapPinIcon class="h-5 w-5 mr-3" />
                  <span>Location</span>
                </div>
                <span class="font-medium text-gray-900">{{ course.location }}</span>
              </div>

              <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div class="flex items-center text-gray-600">
                  <CurrencyDollarIcon class="h-5 w-5 mr-3" />
                  <span>Course Fee</span>
                </div>
                <span class="font-bold text-2xl text-gray-900">${{ course.fees.toLocaleString() }}</span>
              </div>

              <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div class="flex items-center text-gray-600">
                  <ChartBarIcon class="h-5 w-5 mr-3" />
                  <span>Level</span>
                </div>
                <span class="font-medium text-gray-900">{{ course.level }}</span>
              </div>
            </div>

            <!-- Enroll Button -->
            <div class="mt-8">
              <button class="w-full bg-orange-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Enroll Now
              </button>
              <p class="text-xs text-gray-500 text-center mt-3">
                Click to start your enrollment process
              </p>
            </div>
          </div>

          <!-- Additional Info -->
          <div class="bg-orange-50 rounded-xl p-6 border border-orange-100">
            <h4 class="font-semibold text-gray-900 mb-3">Need Help?</h4>
            <p class="text-sm text-gray-700 mb-4">
              Have questions about this course? Our admissions team is here to help.
            </p>
            <button class="text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors duration-200">
              Contact Admissions →
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '../lib/supabase'
import {
  ArrowLeftIcon,
  AcademicCapIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()

const course = ref(null)
const loading = ref(true)
const error = ref('')

const fetchCourse = async () => {
  try {
    loading.value = true
    error.value = ''

    const { data, error: fetchError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', route.params.id)
      .single()

    if (fetchError) {
      throw fetchError
    }

    course.value = data
  } catch (err) {
    console.error('Error fetching course:', err)
    error.value = 'Failed to load course details. Please try again later.'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push({ name: 'courses' })
}

onMounted(() => {
  fetchCourse()
})
</script>