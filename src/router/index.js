import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/presentation' },
  { path: '/presentation', name: 'presentation', component: () => import('../views/Presentation.vue') },
  { path: '/overview', name: 'overview', component: () => import('../views/Overview.vue') },
  { path: '/trends', name: 'trends', component: () => import('../views/Trends.vue') },
  { path: '/categories', name: 'categories', component: () => import('../views/Categories.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/presentation' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router