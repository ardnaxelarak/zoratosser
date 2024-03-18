import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import EditMyZoraView from '../views/EditMyZoraView.vue'
import ZoraOverlayView from '../views/ZoraOverlayView.vue'
import MyItemsView from '../views/MyItemsView.vue'

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
    },
    {
      path: '/overlay/:username',
      name: 'zoraoverlay',
      component: ZoraOverlayView,
    },
    {
      path: '/myitems/:channel',
      name: 'itemview',
      component: MyItemsView,
    },
  ]
})

export default router
