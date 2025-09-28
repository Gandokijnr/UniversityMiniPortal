<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center">
        <!-- Hero Content -->
        <div class="max-w-4xl mx-auto">
          <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Discover Your Next
            <span class="text-orange-600">Learning Journey</span>
          </h1>
          <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Explore courses from top universities around the world. Find the perfect program to advance your career and expand your knowledge.
          </p>
          
          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <router-link
              to="/courses"
              class="bg-orange-600 text-white px-8 py-4 rounded-lg hover:bg-orange-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Explore Courses
            </router-link>
            <button class="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:border-orange-600 hover:text-orange-600 transition-all duration-200 font-semibold text-lg">
              Learn More
            </button>
          </div>
        </div>

        <!-- Features Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div class="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpenIcon class="h-8 w-8 text-orange-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Quality Education</h3>
            <p class="text-gray-600">
              Access courses from renowned universities and institutions worldwide with expert instructors.
            </p>
          </div>

          <div class="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ClockIcon class="h-8 w-8 text-orange-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Flexible Learning</h3>
            <p class="text-gray-600">
              Study at your own pace with flexible schedules that fit your lifestyle and commitments.
            </p>
          </div>

          <div class="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <StarIcon class="h-8 w-8 text-orange-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Certified Programs</h3>
            <p class="text-gray-600">
              Earn recognized certificates and credentials that boost your career prospects.
            </p>
          </div>
        </div>

        <!-- Stats Section -->
        <div class="mt-20 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div class="text-center">
              <div class="text-3xl font-bold text-orange-600 mb-2">500+</div>
              <div class="text-gray-600">Courses Available</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-orange-600 mb-2">50+</div>
              <div class="text-gray-600">Partner Universities</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-orange-600 mb-2">10k+</div>
              <div class="text-gray-600">Students Enrolled</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-orange-600 mb-2">95%</div>
              <div class="text-gray-600">Satisfaction Rate</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-orange-600 mb-2">4.5/5</div>
              <div class="text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="text-center">
          <div class="flex items-center justify-center mb-6">
            <AcademicCapIcon class="h-8 w-8 text-orange-400 mr-3" />
            <span class="text-xl font-bold">CourseHub</span>
          </div>
          <p class="text-gray-400 mb-6">
            Empowering learners worldwide with quality education and flexible learning opportunities.
          </p>
          <div class="flex justify-center space-x-6">
            <a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">About</a>
            <a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">Contact</a>
            <a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">Privacy</a>
            <a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import {
  AcademicCapIcon,
  BookOpenIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/vue/24/outline'
</script>
