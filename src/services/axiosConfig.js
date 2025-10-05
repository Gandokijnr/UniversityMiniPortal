/**
 * Axios Configuration
 * Centralized HTTP client setup with default configurations
 */

import axios from 'axios'

// Create axios instance with default configuration
const apiClient = axios.create({
  timeout: 10000, // 10 seconds default timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor for logging and authentication
apiClient.interceptors.request.use(
  (config) => {
    // Log API requests in development
    if (import.meta.env.DEV) {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    }
    
    // Add Supabase authentication if needed
    if (config.url?.includes('supabase.co') && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      config.headers.Authorization = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      config.headers.apikey = import.meta.env.VITE_SUPABASE_ANON_KEY
    }
    
    return config
  },
  (error) => {
    console.error('🚨 Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and logging
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    }
    return response
  },
  (error) => {
    // Enhanced error logging
    if (error.response) {
      // Server responded with error status
      console.error(`🚨 API Error ${error.response.status}:`, {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      })
    } else if (error.request) {
      // Network error
      console.error('🌐 Network Error:', {
        url: error.config?.url,
        message: error.message,
        code: error.code
      })
    } else {
      // Request setup error
      console.error('⚙️ Request Setup Error:', error.message)
    }
    
    return Promise.reject(error)
  }
)

// Retry configuration for failed requests
const retryConfig = {
  retries: 3,
  retryDelay: (retryCount) => {
    return Math.pow(2, retryCount) * 1000 // Exponential backoff
  },
  retryCondition: (error) => {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status <= 599)
  }
}

// Add retry functionality
apiClient.interceptors.response.use(undefined, async (error) => {
  const config = error.config
  
  if (!config || !config.retry) {
    return Promise.reject(error)
  }
  
  config.retryCount = config.retryCount || 0
  
  if (config.retryCount >= retryConfig.retries) {
    return Promise.reject(error)
  }
  
  if (!retryConfig.retryCondition(error)) {
    return Promise.reject(error)
  }
  
  config.retryCount++
  
  const delay = retryConfig.retryDelay(config.retryCount)
  console.log(`🔄 Retrying request in ${delay}ms (attempt ${config.retryCount}/${retryConfig.retries})`)
  
  await new Promise(resolve => setTimeout(resolve, delay))
  
  return apiClient(config)
})

// Export configured axios instance
export default apiClient

// Export specific methods for convenience
export const get = apiClient.get.bind(apiClient)
export const post = apiClient.post.bind(apiClient)
export const put = apiClient.put.bind(apiClient)
export const del = apiClient.delete.bind(apiClient)
export const patch = apiClient.patch.bind(apiClient)

// Export axios for direct use when needed
export { axios }
