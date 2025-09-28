import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../views/LandingPage.vue'
import CourseList from '../views/CourseList.vue'
import CourseDetail from '../views/CourseDetail.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: LandingPage
    },
    {
      path: '/courses',
      name: 'courses',
      component: CourseList
    },
    {
      path: '/course/:id',
      name: 'course-detail',
      component: CourseDetail,
      props: true
    }
  ]
})

export default router
