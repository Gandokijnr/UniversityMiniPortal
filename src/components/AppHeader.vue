<template>
  <header class="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <div class="flex items-center">
          <router-link to="/" class="flex items-center">
            <AcademicCapIcon class="h-8 w-8 text-orange-600 mr-3" />
            <span class="text-xl font-bold text-gray-900">CourseHub</span>
          </router-link>
        </div>
        
        <nav class="hidden md:flex items-center space-x-8">
          <router-link
            to="/"
            class="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200"
            active-class="text-orange-600"
            exact-active-class="text-orange-600"
          >
            Home
          </router-link>
          <router-link
            to="/courses"
            class="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200"
            active-class="text-orange-600"
          >
            Courses
          </router-link>
          <a href="#" class="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200">
            About
          </a>
          <a href="#" class="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200">
            Contact
          </a>
        </nav>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button
            @click="toggleMobileMenu"
            class="text-gray-600 hover:text-orange-600 focus:outline-none focus:text-orange-600"
          >
            <Bars3Icon v-if="!mobileMenuOpen" class="h-6 w-6" />
            <XMarkIcon v-else class="h-6 w-6" />
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-100 py-4">
        <nav class="flex flex-col space-y-4">
          <router-link
            to="/"
            class="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200"
            active-class="text-orange-600"
            exact-active-class="text-orange-600"
            @click="closeMobileMenu"
          >
            Home
          </router-link>
          <router-link
            to="/courses"
            class="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200"
            active-class="text-orange-600"
            @click="closeMobileMenu"
          >
            Courses
          </router-link>
          <a href="#" class="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200">
            About
          </a>
          <a href="#" class="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200">
            Contact
          </a>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { AcademicCapIcon, Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'

const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}
</script>