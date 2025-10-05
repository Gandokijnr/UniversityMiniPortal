<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
    <!-- Filter Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Filter & Search Courses</h3>
        <p class="text-sm text-gray-600">Find the perfect MSc program for you</p>
      </div>
      <button
        v-if="hasActiveFilters"
        @click="clearAllFilters"
        class="text-sm text-orange-600 hover:text-orange-700 font-medium"
      >
        Clear All Filters
      </button>
    </div>

    <!-- Search Bar -->
    <div class="mb-6">
      <div class="relative">
        <MagnifyingGlassIcon class="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          v-model="localFilters.search"
          type="text"
          placeholder="Search courses, universities, or keywords..."
          class="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
          @input="debouncedSearch"
        >
        <button
          v-if="localFilters.search"
          @click="localFilters.search = ''; updateFilters()"
          class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Filter Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- University Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">University</label>
        <select
          v-model="localFilters.universityId"
          @change="updateFilters"
          class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
        >
          <option value="">All Universities</option>
          <option
            v-for="university in universities"
            :key="university.id"
            :value="university.id"
          >
            {{ university.name }}
          </option>
        </select>
      </div>

      <!-- Department Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Department</label>
        <select
          v-model="localFilters.departmentId"
          @change="updateFilters"
          class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
          :disabled="!localFilters.universityId"
        >
          <option value="">All Departments</option>
          <option
            v-for="department in filteredDepartments"
            :key="department.id"
            :value="department.id"
          >
            {{ department.name }}
          </option>
        </select>
      </div>

      <!-- Course Type Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Course Type</label>
        <select
          v-model="localFilters.courseTypeId"
          @change="updateFilters"
          class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
        >
          <option value="">All Types</option>
          <option
            v-for="courseType in courseTypes"
            :key="courseType.id"
            :value="courseType.id"
          >
            {{ courseType.name }}
          </option>
        </select>
      </div>

      <!-- Scholarship Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Scholarship</label>
        <select
          v-model="localFilters.scholarshipAvailable"
          @change="updateFilters"
          class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
        >
          <option value="">All Courses</option>
          <option value="true">Scholarship Available</option>
          <option value="false">No Scholarship</option>
        </select>
      </div>
    </div>

    <!-- Price Range Filter -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-3">Course Fees Range</label>
      <div class="grid grid-cols-2 gap-4">
        <!-- Min Fees Input -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-2">Minimum Fees</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
            <input
              v-model.number="localFilters.minFees"
              type="number"
              :min="priceRange.min"
              :max="priceRange.max"
              :step="1000"
              @input="validateAndUpdateFilters"
              class="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              placeholder="Min fees"
            >
          </div>
        </div>
        
        <!-- Max Fees Input -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-2">Maximum Fees</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
            <input
              v-model.number="localFilters.maxFees"
              type="number"
              :min="priceRange.min"
              :max="priceRange.max"
              :step="1000"
              @input="validateAndUpdateFilters"
              class="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              placeholder="Max fees"
            >
          </div>
        </div>
      </div>
      
      <!-- Quick Price Buttons -->
      <div class="flex flex-wrap gap-2 mt-4">
        <button
          @click="setQuickPriceRange(0, 30000)"
          class="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-orange-100 hover:text-orange-700 transition-colors duration-200"
        >
          Under £30k
        </button>
        <button
          @click="setQuickPriceRange(30000, 40000)"
          class="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-orange-100 hover:text-orange-700 transition-colors duration-200"
        >
          £30k - £40k
        </button>
        <button
          @click="setQuickPriceRange(40000, 100000)"
          class="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-orange-100 hover:text-orange-700 transition-colors duration-200"
        >
          Above £40k
        </button>
        <button
          @click="clearPriceRange()"
          class="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors duration-200"
        >
          Clear Range
        </button>
      </div>
    </div>

    <!-- Quick Filters -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-3">Quick Filters</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="quickFilter in quickFilters"
          :key="quickFilter.id"
          @click="applyQuickFilter(quickFilter)"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
            isQuickFilterActive(quickFilter)
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          {{ quickFilter.label }}
        </button>
      </div>
    </div>

    <!-- Active Filters Display -->
    <div v-if="activeFilters.length > 0" class="mt-6 pt-6 border-t border-gray-200">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-medium text-gray-700">Active Filters:</span>
        <span class="text-sm text-gray-500">{{ activeFilters.length }} filter(s) applied</span>
      </div>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="filter in activeFilters"
          :key="filter.key"
          class="flex items-center bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm"
        >
          <span>{{ filter.label }}</span>
          <button
            @click="removeFilter(filter.key)"
            class="ml-2 hover:text-orange-900"
          >
            <XMarkIcon class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { CourseDataService } from '../services/courseDataService'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update-filters'])

// Local filter state
const localFilters = ref({
  search: '',
  universityId: '',
  departmentId: '',
  courseTypeId: '',
  minFees: 20000,
  maxFees: 50000,
  scholarshipAvailable: '',
  ...props.filters
})

// Data
const universities = ref([])
const departments = ref([])
const courseTypes = ref([])

// Price range configuration
const priceRange = {
  min: 20000,
  max: 50000
}

// Load actual price range from courses
const loadPriceRange = async () => {
  try {
    const courses = await CourseDataService.getAllCourses()
    const validFees = courses.filter(c => c.fees && c.fees > 0).map(c => c.fees)
    
    if (validFees.length > 0) {
      priceRange.min = Math.min(...validFees)
      priceRange.max = Math.max(...validFees)
      
      // Update local filters if they're at default values
      if (localFilters.value.minFees === 20000) {
        localFilters.value.minFees = priceRange.min
      }
      if (localFilters.value.maxFees === 50000) {
        localFilters.value.maxFees = priceRange.max
      }
    }
  } catch (error) {
    console.error('Error loading price range:', error)
  }
}

// Quick filters
const quickFilters = [
  { id: 'ai', label: 'AI & Machine Learning', search: 'artificial intelligence machine learning' },
  { id: 'data', label: 'Data Science', search: 'data science analytics' },
  { id: 'cyber', label: 'Cybersecurity', search: 'cybersecurity security' },
  { id: 'software', label: 'Software Engineering', search: 'software engineering development' },
  { id: 'scholarship', label: 'With Scholarship', scholarshipAvailable: 'true' },
  { id: 'affordable', label: 'Under £35k', maxFees: 35000 }
]

// Computed properties
const filteredDepartments = computed(() => {
  if (!localFilters.value.universityId) return departments.value
  return departments.value.filter(dept => dept.university_id === localFilters.value.universityId)
})

const hasActiveFilters = computed(() => {
  return localFilters.value.search ||
         localFilters.value.universityId ||
         localFilters.value.departmentId ||
         localFilters.value.courseTypeId ||
         localFilters.value.scholarshipAvailable ||
         localFilters.value.minFees !== priceRange.min ||
         localFilters.value.maxFees !== priceRange.max
})

const activeFilters = computed(() => {
  const filters = []
  
  if (localFilters.value.search) {
    filters.push({ key: 'search', label: `Search: "${localFilters.value.search}"` })
  }
  
  if (localFilters.value.universityId) {
    const university = universities.value.find(u => u.id === localFilters.value.universityId)
    if (university) {
      filters.push({ key: 'universityId', label: `University: ${university.name}` })
    }
  }
  
  if (localFilters.value.departmentId) {
    const department = departments.value.find(d => d.id === localFilters.value.departmentId)
    if (department) {
      filters.push({ key: 'departmentId', label: `Department: ${department.name}` })
    }
  }
  
  if (localFilters.value.courseTypeId) {
    const courseType = courseTypes.value.find(ct => ct.id === localFilters.value.courseTypeId)
    if (courseType) {
      filters.push({ key: 'courseTypeId', label: `Type: ${courseType.name}` })
    }
  }
  
  if (localFilters.value.scholarshipAvailable === 'true') {
    filters.push({ key: 'scholarshipAvailable', label: 'Scholarship Available' })
  }
  
  if (localFilters.value.minFees !== priceRange.min || localFilters.value.maxFees !== priceRange.max) {
    filters.push({ 
      key: 'priceRange', 
      label: `Fees: £${formatPrice(localFilters.value.minFees)} - £${formatPrice(localFilters.value.maxFees)}` 
    })
  }
  
  return filters
})

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-GB').format(price)
}

let searchTimeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    updateFilters()
  }, 300)
}

const validateAndUpdateFilters = () => {
  // Ensure min is not greater than max
  if (localFilters.value.minFees > localFilters.value.maxFees) {
    localFilters.value.minFees = localFilters.value.maxFees
  }
  updateFilters()
}

const updateFilters = () => {
  emit('update-filters', { ...localFilters.value })
}

const setQuickPriceRange = (min, max) => {
  localFilters.value.minFees = min
  localFilters.value.maxFees = max
  updateFilters()
}

const clearPriceRange = () => {
  localFilters.value.minFees = priceRange.min
  localFilters.value.maxFees = priceRange.max
  updateFilters()
}

const clearAllFilters = () => {
  localFilters.value = {
    search: '',
    universityId: '',
    departmentId: '',
    courseTypeId: '',
    minFees: priceRange.min,
    maxFees: priceRange.max,
    scholarshipAvailable: ''
  }
  updateFilters()
}

const removeFilter = (filterKey) => {
  switch (filterKey) {
    case 'search':
      localFilters.value.search = ''
      break
    case 'universityId':
      localFilters.value.universityId = ''
      localFilters.value.departmentId = '' // Clear department when university is cleared
      break
    case 'departmentId':
      localFilters.value.departmentId = ''
      break
    case 'courseTypeId':
      localFilters.value.courseTypeId = ''
      break
    case 'scholarshipAvailable':
      localFilters.value.scholarshipAvailable = ''
      break
    case 'priceRange':
      localFilters.value.minFees = priceRange.min
      localFilters.value.maxFees = priceRange.max
      break
  }
  updateFilters()
}

const applyQuickFilter = (quickFilter) => {
  if (isQuickFilterActive(quickFilter)) {
    // Remove the quick filter
    if (quickFilter.search) {
      localFilters.value.search = ''
    }
    if (quickFilter.scholarshipAvailable) {
      localFilters.value.scholarshipAvailable = ''
    }
    if (quickFilter.maxFees) {
      localFilters.value.maxFees = priceRange.max
    }
  } else {
    // Apply the quick filter
    if (quickFilter.search) {
      localFilters.value.search = quickFilter.search
    }
    if (quickFilter.scholarshipAvailable) {
      localFilters.value.scholarshipAvailable = quickFilter.scholarshipAvailable
    }
    if (quickFilter.maxFees) {
      localFilters.value.maxFees = quickFilter.maxFees
    }
  }
  updateFilters()
}

const isQuickFilterActive = (quickFilter) => {
  if (quickFilter.search && localFilters.value.search.includes(quickFilter.search)) {
    return true
  }
  if (quickFilter.scholarshipAvailable && localFilters.value.scholarshipAvailable === quickFilter.scholarshipAvailable) {
    return true
  }
  if (quickFilter.maxFees && localFilters.value.maxFees <= quickFilter.maxFees) {
    return true
  }
  return false
}

// Load data
const loadFilterData = async () => {
  try {
    const [universitiesData, departmentsData, courseTypesData] = await Promise.all([
      CourseDataService.getUniversities(),
      CourseDataService.getDepartmentsByUniversity(null), // Get all departments
      CourseDataService.getCourseTypes()
    ])
    
    universities.value = universitiesData
    departments.value = departmentsData
    courseTypes.value = courseTypesData
  } catch (error) {
    console.error('Error loading filter data:', error)
  }
}

// Watch for department clearing when university changes
watch(() => localFilters.value.universityId, (newUniversityId, oldUniversityId) => {
  if (newUniversityId !== oldUniversityId && localFilters.value.departmentId) {
    const isDepartmentValid = filteredDepartments.value.some(
      dept => dept.id === localFilters.value.departmentId
    )
    if (!isDepartmentValid) {
      localFilters.value.departmentId = ''
    }
  }
})

onMounted(async () => {
  await loadFilterData()
  await loadPriceRange()
})
</script>

<style scoped>
/* Remove spinner arrows from number inputs */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  appearance: textfield;
  -moz-appearance: textfield;
}
</style>
