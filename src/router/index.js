import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import EditMyZoraView from '../views/EditMyZoraView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/myzora/edit',
      name: 'editmyzora',
      component: EditMyZoraView,
    }
  ]
})

export default router
