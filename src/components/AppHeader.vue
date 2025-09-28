<template>
  <header class="bg-white shadow-sm border-b border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <div class="flex items-center">
          <router-link to="/" class="flex items-center">
            <AcademicCapIcon class="h-8 w-8 text-blue-600 mr-3" />
            <span class="text-xl font-bold text-gray-900">CourseHub</span>
          </router-link>
        </div>
        
        <nav class="hidden md:flex items-center space-x-8">
          <router-link
            to="/"
            class="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
            active-class="text-blue-600"
          >
            Courses
          </router-link>
          <a href="#" class="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200">
            About
          </a>
          <a href="#" class="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200">
            Contact
          </a>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { AcademicCapIcon } from '@heroicons/vue/24/outline'
</script>