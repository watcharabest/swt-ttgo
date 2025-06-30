<template>
  <div id="app" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
    <!-- Sidebar Toggle Button (Moved outside) -->
    <button class="sidebar-toggle" @click="toggleSidebar">
      <i class="fas" :class="isSidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
      <span class="submenu-arrow"  style="margin-right: 5px;">{{ isSidebarCollapsed ? '◀' : '▶' }}</span>
    </button>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'collapsed': isSidebarCollapsed, 'mobile-visible': mobileMenuOpen }">
      <div class="sidebar-header">
        <div class="logo" @click="goHome">
          <span class="logo-icon">●</span>
          <span class="logo-text">Product Order</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div @click="toggleSubMenu" class="nav-link-header">
          <i class="fas fa-map-marked-alt"></i>
          <span class="link-text">Mapping TTGO</span>
          <span class="submenu-arrow">{{ showSubMenu ? '▲' : '▼' }}</span>
        </div>

        <transition name="submenu-slide">
          <div v-show="showSubMenu" class="submenu-wrapper">
            <router-link to="/" class="nav-link" @click="closeMobileMenu">
              <i class="fas fa-home"></i>
              <span class="link-text">Home</span>
            </router-link>
            <router-link to="/update-tray" class="nav-link" @click="closeMobileMenu">
              <i class="fas fa-map-marked-alt"></i>
              <span class="link-text">Map TTGO to Tray</span>
            </router-link>
            <router-link to="/update" class="nav-link" @click="closeMobileMenu">
              <i class="fas fa-map"></i>
              <span class="link-text">Map TTGO to Product Order</span>
            </router-link>
            <router-link to="/tray" class="nav-link" @click="closeMobileMenu">
              <i class="fas fa-utensils"></i>
              <span class="link-text">Tray List</span>
            </router-link>
            <router-link to="/table" class="nav-link" @click="closeMobileMenu">
              <i class="fas fa-edit"></i>
              <span class="link-text">Edit Database</span>
            </router-link>
            <router-link to="/showtable" class="nav-link" @click="closeMobileMenu">
              <i class="fas fa-table"></i>
              <span class="link-text">Show Table</span>
            </router-link>
            <router-link to="/clear" class="nav-link" @click="closeMobileMenu">
              <i class="fas fa-broom"></i>
              <span class="link-text">Clear</span>
            </router-link>
          </div>
        </transition>

        <div @click="toggleRackMenu" class="nav-link-header">
          <i class="fas fa-warehouse"></i>
          <span class="link-text">Rack Tracking</span>
          <span class="submenu-arrow">{{ showRackMenu ? '▲' : '▼' }}</span>
        </div>

        <transition name="submenu-slide">
          <div v-show="showRackMenu" class="submenu-wrapper">
            <router-link to="/scan-rack" class="nav-link" @click="closeMobileMenu">
              <i class="fas fa-warehouse"></i>
              <span class="link-text">Scan Rack</span>
            </router-link>
            <router-link to="/rack" class="nav-link" @click="closeMobileMenu">
              <i class="fas fa-warehouse"></i>
              <span class="link-text">Rack Table</span>
            </router-link>
          </div>
        </transition>
      </nav>

    </aside>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Mobile Header -->
      <header class="mobile-header" :class="{ 'scrolled': isScrolled }">
        <button class="mobile-menu-toggle" @click="toggleMobileMenu">
          <i class="fas fa-bars"></i>
        </button>
        <div class="mobile-title" @click="goHome">
          <span class="logo-icon">●</span>
          <span>Product Order</span>
        </div>
          <div @click="toggleSubMenu" class="nav-link-header">
            <i class="fas fa-map-marked-alt"></i>
            <span class="link-text">Mapping TTGO</span>
            <span class="submenu-arrow">{{ showSubMenu ? '▲' : '▼' }}</span>
          </div>

          <transition name="submenu-slide">
            <div v-show="showSubMenu" class="submenu-wrapper">
              <router-link to="/" class="nav-link" @click="closeMobileMenu">
                <i class="fas fa-home"></i>
                <span class="link-text">Home</span>
              </router-link>
              <router-link to="/update-tray" class="nav-link" @click="closeMobileMenu">
                <i class="fas fa-map-marked-alt"></i>
                <span class="link-text">Map TTGO to Tray</span>
              </router-link>
              <router-link to="/update" class="nav-link" @click="closeMobileMenu">
                <i class="fas fa-map"></i>
                <span class="link-text">Map TTGO to Product Order</span>
              </router-link>
              <router-link to="/tray" class="nav-link" @click="closeMobileMenu">
                <i class="fas fa-utensils"></i>
                <span class="link-text">Tray List</span>
              </router-link>
              <router-link to="/table" class="nav-link" @click="closeMobileMenu">
                <i class="fas fa-edit"></i>
                <span class="link-text">Edit Database</span>
              </router-link>
              <router-link to="/showtable" class="nav-link" @click="closeMobileMenu">
                <i class="fas fa-table"></i>
                <span class="link-text">Show Table</span>
              </router-link>
              <router-link to="/clear" class="nav-link" @click="closeMobileMenu">
                <i class="fas fa-broom"></i>
                <span class="link-text">Clear</span>
              </router-link>
            </div>
          </transition>
          <div @click="toggleRackMenu" class="nav-link-header">
            <i class="fas fa-warehouse"></i>
            <span class="link-text">Rack Tracking</span>
            <span class="submenu-arrow">{{ showRackMenu ? '▲' : '▼' }}</span>
          </div>

          <transition name="submenu-slide">
            <div v-show="showRackMenu" class="submenu-wrapper">
              <router-link to="/scan-rack" class="nav-link" @click="closeMobileMenu">
                <i class="fas fa-warehouse"></i>
                <span class="link-text">Scan Rack</span>
              </router-link>
              <router-link to="/rack" class="nav-link" @click="closeMobileMenu">
                <i class="fas fa-warehouse"></i>
                <span class="link-text">Rack Table</span>
              </router-link>
            </div>
          </transition>

      </header>

      <!-- Page Content -->
      <main class="main">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in" appear>
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const mobileMenuOpen = ref(false)
const isScrolled = ref(false)
const isSidebarCollapsed = ref(false)
const showSubMenu = ref(false)
const showRackMenu = ref(false)

const toggleSubMenu = () => {
  showSubMenu.value = !showSubMenu.value
  // Close rack menu when opening this one
  if (showRackMenu.value) showRackMenu.value = false
}

const toggleRackMenu = () => {
  showRackMenu.value = !showRackMenu.value
  // Close other submenu when opening this one
  if (showSubMenu.value) showSubMenu.value = false
}



const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
  localStorage.setItem('sidebarCollapsed', isSidebarCollapsed.value)
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  if (window.innerWidth <= 768) {
    mobileMenuOpen.value = false
  }
}

const goHome = () => {
  router.push('/')
  closeMobileMenu()
}

const navigateTo = (path) => {
  router.push(path)
  closeMobileMenu()
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

const handleResize = () => {
  if (window.innerWidth > 768) {
    mobileMenuOpen.value = false
  } else {
    isSidebarCollapsed.value = true
  }
}

// Initialize sidebar state from localStorage or default to false
onMounted(() => {
document.title = 'SMT E-TAG'
  const savedSidebarState = localStorage.getItem('sidebarCollapsed')
  if (savedSidebarState !== null) {
    isSidebarCollapsed.value = savedSidebarState === 'true'
  }

  // Auto-collapse on mobile
  if (window.innerWidth <= 768) {
    isSidebarCollapsed.value = true
  }

  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll)

  // Close mobile menu when route changes
  const unwatch = router.afterEach(() => {
    closeMobileMenu()
  })

  return () => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('scroll', handleScroll)
    unwatch()
  }
})

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --text: #0f172a;
  --text-muted: #64748b;
  --bg: #ffffff;
  --bg-secondary: #f8fafc;
  --border: #e2e8f0;
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --radius: 8px;
  --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  min-height: 100vh;
  min-width: 100vw;
  font-family: 'Roboto', sans-serif;
  color: var(--text);
  background: linear-gradient(rgba(41, 126, 175, 0.4), rgba(243, 237, 237, 0.4));
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
  background-attachment: fixed;

  display: flex;
  flex-direction: column;
}


/* Clean Navigation */

.submenu-arrow {
  margin-left: auto;
  font-size: 0.85rem;
  color: #ccc;
  transition: var(--transition);
  
}

.submenu-wrapper {
  overflow: hidden;
}

/* Transition Classes */
.submenu-slide-enter-active,
.submenu-slide-leave-active {
  transition: max-height 0.3s ease, opacity 0.3s ease;
}

.submenu-slide-enter-from,
.submenu-slide-leave-to {
  max-height: 0;
  opacity: 0;
}

.submenu-slide-enter-to,
.submenu-slide-leave-from {
  max-height: 1000px;
  /* ควรพอเหมาะกับความสูงเมนูย่อย */
  opacity: 1;
}



/* Simple Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--text);
  transition: var(--transition);
  cursor: pointer;
}

.logo:hover {
  transform: translateY(-1px);
}

.logo-icon {
  color: var(--primary);
  font-size: 1.5rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

.logo-text {
  letter-spacing: -0.025em;
}

/* Layout */
#app {
  display: flex;
  min-height: 100vh;
  transition: margin-left 0.3s ease;
}

.sidebar {
  width: 300px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  background: #2c3e50;
  color: white;
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  padding-top: 10px;
}

.sidebar.collapsed {
  width: 70px;
  overflow: hidden;
}

.sidebar-header {
  padding: 20px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  white-space: nowrap;
  color: white;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.2rem;
}

.logo-icon {
  color: #42b983;
  margin-right: 10px;
  font-size: 1.5rem;
}

.sidebar-toggle {
  position: fixed;
  left: 270px;
  top: 300px;
  z-index: 900;
  width: 50px;
  height: 50px;
  background: #576779;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

#app.sidebar-collapsed .sidebar-toggle {
  left: 40px;
}

.sidebar-toggle:hover {
  background-color: #576779;
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .sidebar-toggle {
    display: none;
  }
}

.sidebar-nav {
  padding: 15px 0;
  flex: 1;
  overflow-y: auto;
}

.nav-link-header {
  display: flex;
  align-items: center;
  padding: 12px;
  padding-right: 20px;
  color: #ecf0f1;
  text-decoration: none;
  transition: all 0.2s;
  white-space: nowrap;
  cursor: pointer;
}

.nav-link-header i {
  margin-right: 15px;
  width: 20px;
  text-align: center;
}

.nav-link-header:hover,
.nav-link-header.router-link-active {
  color: #42b983;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #ecf0f1;
  text-decoration: none;
  transition: all 0.2s;
  white-space: nowrap;
  cursor: pointer;
}

.nav-link i {
  margin-right: 15px;
  width: 20px;
  text-align: center;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #42b983;
}

.link-text {
  transition: opacity 0.2s;
}

.collapsed .link-text {
  opacity: 0;
  width: 0;
  overflow: hidden;
  display: inline-block;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

#app.sidebar-collapsed .main-content {
  margin-left: 70px;
}

.main {
  flex: 1;
  padding: 20px;
}

/* Mobile Header */
.mobile-header {
  display: none;
  padding: 15px 20px;
  background: #2c3e50;
  color: white;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 900;
  transition: all 0.3s ease;
}

.mobile-header.scrolled {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.mobile-menu-toggle {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  margin-right: 15px;
  cursor: pointer;
}

.mobile-title {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  margin-bottom: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    width: 280px;
  }

  .sidebar.mobile-visible {
    transform: translateX(0);
  }

  .sidebar.collapsed {
    width: 280px;
  }

  .main-content {
    margin-left: 0 !important;
  }

  .mobile-header {
    display: inline-block;
  }

  .main {
    padding: 15px;
  }
}

/* Transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Dashboard Styles */
.dashboard {
  padding: 2rem 0;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}


.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}

.dashboard-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: auto;
  animation: slideInUp 0.3s ease-out both;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dashboard-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), #8b5cf6);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.dashboard-card:hover::before {
  transform: scaleX(1);
}

.dashboard-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: rgba(37, 99, 235, 0.2);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.card-description {
  color: var(--text-muted);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}




/* Simple Mobile Menu */
.menu-toggle {
  display: none;
  flex-direction: column;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius);
  transition: var(--transition);
}

.menu-toggle:hover {
  background: var(--bg-secondary);
}

.menu-toggle span {
  width: 20px;
  height: 2px;
  background: var(--text);
  margin: 2px 0;
  border-radius: 1px;
  transition: var(--transition);
}

.menu-toggle.active span:nth-child(1) {
  transform: rotate(45deg) translate(4px, 4px);
}

.menu-toggle.active span:nth-child(2) {
  opacity: 0;
}

.menu-toggle.active span:nth-child(3) {
  transform: rotate(-45deg) translate(4px, -4px);
}

/* Clean Main Content */
.main {
  max-width: 1200px;
  margin: 0 auto;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  min-height: calc(100vh - 64px);
}

/* Smooth Page Transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive Design */
/* เพิ่ม media queries เหล่านี้ในส่วน responsive design */

/* Tablet Portrait (768px - 1024px) */
@media (min-width: 768px) and (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
    max-width: 100%;
    padding: 0 1rem;
  }

  .dashboard-card {
    padding: 1.5rem;
    border-radius: 14px;
  }

  .card-title {
    font-size: 1.175rem;
  }

  .card-description {
    font-size: 0.85rem;
    margin-bottom: 0.875rem;
  }

  .main {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .dashboard {
    padding: 1.5rem 0;
  }
}

/* Mobile Only (max-width: 767px) */
@media (max-width: 767px) {
  .nav-container {
    padding: 0 1rem;
  }

  .menu-toggle {
    display: flex;
  }

  .nav-links {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    background: #FFE495;
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    box-shadow: var(--shadow-lg);
    gap: 0;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: var(--transition);
  }

  .nav-links.active {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .nav-link {
    padding: 1rem 1.5rem;
    border-radius: 0;
    border-bottom: 1px solid var(--border);
  }

  .nav-link:last-child {
    border-bottom: none;
  }

  .nav-link::after {
    display: none;
  }

  .main {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }

  .dashboard {
    padding: 1rem 0;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0;
  }

  .dashboard-card {
    padding: 1.25rem;
    margin: 0 0.25rem;
    border-radius: 12px;
  }

  .card-title {
    font-size: 1.125rem;
  }

  .card-description {
    font-size: 0.8125rem;
    margin-bottom: 0.75rem;
  }


  .dashboard-card:hover {
    transform: translateY(-4px);
  }
}

/* แก้ไขการตั้งค่าเริ่มต้นของ dashboard-grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}

/* สำหรับหน้าจอใหญ่ */
@media (min-width: 1025px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, minmax(280px, 1fr));
  }
}
</style>