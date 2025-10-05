<template>
  <div v-if="hasError" class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
      <div class="mb-6">
        <ExclamationTriangleIcon class="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p class="text-gray-600">{{ errorMessage }}</p>
      </div>
      
      <div class="space-y-3">
        <button
          @click="retry"
          class="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200"
        >
          Try Again
        </button>
        
        <button
          @click="goHome"
          class="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
        >
          Go to Homepage
        </button>
      </div>
      
      <div v-if="showDetails" class="mt-6 p-4 bg-gray-50 rounded-lg text-left">
        <h4 class="text-sm font-medium text-gray-900 mb-2">Error Details:</h4>
        <pre class="text-xs text-gray-600 whitespace-pre-wrap">{{ errorDetails }}</pre>
      </div>
      
      <button
        @click="showDetails = !showDetails"
        class="mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
      >
        {{ showDetails ? 'Hide' : 'Show' }} Details
      </button>
    </div>
  </div>
  
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const hasError = ref(false)
const errorMessage = ref('')
const errorDetails = ref('')
const showDetails = ref(false)

const emit = defineEmits(['retry'])

onErrorCaptured((error, instance, info) => {
  console.error('Error caught by boundary:', error)
  
  hasError.value = true
  errorMessage.value = getErrorMessage(error)
  errorDetails.value = `${error.message}\n\nComponent: ${info}\n\nStack: ${error.stack}`
  
  return false // Prevent error from propagating
})

const getErrorMessage = (error) => {
  if (error.message?.includes('supabase') || error.message?.includes('database')) {
    return 'Database connection error. Please check your Supabase configuration.'
  }
  
  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return 'Network error. Please check your internet connection.'
  }
  
  if (error.message?.includes('scraper') || error.message?.includes('courses')) {
    return 'No course data available. Please run the scraper to populate data.'
  }
  
  return 'An unexpected error occurred. Please try again.'
}

const retry = () => {
  hasError.value = false
  errorMessage.value = ''
  errorDetails.value = ''
  showDetails.value = false
  emit('retry')
}

const goHome = () => {
  hasError.value = false
  router.push('/')
}
</script>
