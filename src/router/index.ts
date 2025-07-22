import { createRouter, createWebHistory } from 'vue-router'
import UpdateStep from '../components/UpdateStep.vue'
import TableView from '../components/TableEdit.vue'
import ProductTableViewer from '../components/TableView.vue'
import TrayInfo from '@/components/EditTray.vue'
import ClearPO from '../components/ClearPO.vue'
import Dashboard from '../components/menu.vue'
import UpdateTray from '@/components/UpdateTray.vue'
import Rack_Table from '@/components/Rack_Table.vue'
import Rack_Scan from '@/components/Rack_Scan.vue'
import Task_Form from '@/components/Task_Form.vue'
import Task_Checkin from '@/components/Task_Checkin.vue'
import Task_Table from '@/components/Task_Table.vue'
import Task_Dashboard from '@/components/Task_Dashboard.vue'

const routes = [
  { path: '/home', component: Dashboard },
  { path: '/update', component: UpdateStep },
  { path: '/table', component: TableView },
  { path: '/showtable', component: ProductTableViewer },
  { path: '/tray', component: TrayInfo },
  { path: '/clear', component: ClearPO },
  { path: '/update-tray', component: UpdateTray },

  { path: '/rack', component: Rack_Table },
  { path: '/scan-rack', component: Rack_Scan },

  { path: '/task-form', component: Task_Form },
  { path: '/task-checkin', component: Task_Checkin },
  { path: '/task-table', component: Task_Table },
  { path: '/task-dashboard', component: Task_Dashboard, meta: { noMain: true } },
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})
export default router