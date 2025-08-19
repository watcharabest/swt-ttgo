import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/task-form' },
  { path: '/task-form', component: () => import('@/components/Task_Form.vue') },
  { path: '/task-checkin', component: () => import('@/components/Task_Checkin.vue') },
  { path: '/task-table', component: () => import('@/components/Task_Table.vue') },
  { path: '/task-dashboard', component: () => import('@/components/Task_Dashboard.vue'), meta: { noMain: true } },
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

export default router
