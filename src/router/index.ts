import { createRouter, createWebHistory } from 'vue-router'
import UpdateStep from '../components/UpdateStep.vue'
import TableView from '../components/TableEdit.vue'
import ProductTableViewer from '../components/TableView.vue'
import TrayInfo from '@/components/EditTray.vue'
import ClearPO from '../components/ClearPO.vue'
import Dashboard from '../components/menu.vue'
import UpdateTray from '@/components/UpdateTray.vue'
import RackTracking from '@/components/TableRack.vue'
import ScanRack from '@/components/scanRack.vue'

const routes = [
  { path: '/', component: Dashboard },
  { path: '/update', component: UpdateStep },
  { path: '/table', component: TableView },
  { path: '/showtable', component: ProductTableViewer },
  { path: '/tray', component: TrayInfo },
  { path: '/clear', component: ClearPO },
  { path: '/update-tray', component: UpdateTray },
  { path: '/rack', component: RackTracking },
  { path: '/scan-rack', component: ScanRack },
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})
export default router