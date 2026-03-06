import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomePage.vue')
  },
  {
    path: '/memorial/:part',
    name: 'memorial',
    component: () => import('@/views/MemorialView.vue')
  },
  {
    path: '/gallery',
    name: 'gallery',
    component: () => import('@/views/GalleryView.vue')
  },
  {
    path: '/diary',
    name: 'diary',
    component: () => import('@/views/DiaryView.vue')
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('@/views/ChatView.vue')
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: () => import('@/views/CalendarView.vue')
  },
  {
    path: '/announcements',
    name: 'announcements',
    component: () => import('@/views/AnnouncementView.vue')
  },
  {
    path: '/games',
    name: 'games',
    component: () => import('@/views/GamesView.vue')
  },
  {
    path: '/games/:id',
    name: 'game-detail',
    component: () => import('@/views/GameDetailView.vue')
  },
  {
    path: '/food',
    name: 'food',
    component: () => import('@/views/FoodView.vue')
  },
  {
    path: '/places',
    name: 'places',
    component: () => import('@/views/PlacesView.vue')
  },
  {
    path: '/academic',
    name: 'academic',
    component: () => import('@/views/AcademicView.vue')
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
