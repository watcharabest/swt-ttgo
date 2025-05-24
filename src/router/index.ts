import { createRouter, createWebHistory } from 'vue-router'
import UpdateStep from '../components/UpdateStep.vue'
import TableView from '../components/TableEdit.vue'
import ProductTableViewer from '../components/TableView.vue'
import TrayInfo from '@/components/EditTray.vue'

const routes = [
  { path: '/update', component: UpdateStep },
  { path: '/table', component: TableView },
  { path: '/showtable', component: ProductTableViewer },
  { path: '/tray', component: TrayInfo }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})
export default router