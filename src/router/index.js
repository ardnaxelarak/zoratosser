import { createRouter, createWebHistory } from 'vue-router'

const HomeView = () => import("../views/HomeView.vue");
const EditMyZoraView = () => import("../views/EditMyZoraView.vue");
const ZoraOverlayView = () => import("../views/ZoraOverlayView.vue");
const MyItemsView = () => import("../views/MyItemsView.vue");

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
