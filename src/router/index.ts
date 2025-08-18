import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/home', component: () => import('@/components/menu.vue') },
  { path: '/update', component: () => import('@/components/UpdateStep.vue') },
  { path: '/table', component: () => import('@/components/TableEdit.vue') },
  { path: '/showtable', component: () => import('@/components/TableView.vue') },
  { path: '/tray', component: () => import('@/components/EditTray.vue') },
  { path: '/clear', component: () => import('@/components/ClearPO.vue') },
  { path: '/update-tray', component: () => import('@/components/UpdateTray.vue') },

  { path: '/rack', component: () => import('@/components/Rack_Table.vue') },
  { path: '/scan-rack', component: () => import('@/components/Rack_Scan.vue') },
  { path: '/rack-po', component: () => import('@/components/Rack_PO.vue') },

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
