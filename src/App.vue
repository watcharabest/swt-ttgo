<template>
  <div id="app">
    <nav class="nav" :class="{ scrolled: isScrolled }">
      <div class="nav-container">
        <div class="logo" @click="goHome">
          <span class="logo-icon">●</span>
          <span class="logo-text">Product Order</span>
        </div>
        
        <button 
          class="menu-toggle"
          @click="toggleMobileMenu"
          :class="{ active: mobileMenuOpen }"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div class="nav-links" :class="{ active: mobileMenuOpen }">
          <router-link to="/" class="nav-link" @click="closeMobileMenu">
            <i class="fas fa-home"></i>
            Home
          </router-link>
          <router-link to="/update-tray" class="nav-link" @click="closeMobileMenu">
            <i class="fas fa-sync-alt"></i>
            Map Display
          </router-link>
          <router-link to="/update" class="nav-link" @click="closeMobileMenu">
            <i class="fas fa-sync-alt"></i>
            Map PO
          </router-link>
          <router-link to="/tray" class="nav-link" @click="closeMobileMenu">
            <i class="fas fa-utensils"></i>
            Tray List
          </router-link>
          <router-link to="/table" class="nav-link" @click="closeMobileMenu">
            <i class="fas fa-edit"></i>
            Edit Database
          </router-link>

          <router-link to="/showtable" class="nav-link" @click="closeMobileMenu">
            <i class="fas fa-table"></i>
            Show Table
          </router-link>

            <router-link to="/clear" class="nav-link" @click="closeMobileMenu">
              <i class="fas fa-table"></i>
              Clear
            </router-link>
        </div>
      </div>
    </nav>

    <main class="main">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in" appear>
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const mobileMenuOpen = ref(false)
const isScrolled = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
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
  }
}

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
  font-family: 'Century', 'Century Gothic', 'Georgia', serif;
  color: var(--text);
  background: 
    linear-gradient(rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.3)),
    url('C:\Users\wiroj\OneDrive\Desktop\swt\project_IoT_TTGOdisplay\frontend\image\swarovski-swan-jewelry.webp');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

/* Clean Navigation */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  transition: var(--transition);
}

.nav.scrolled {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: var(--shadow);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.logo-text {
  letter-spacing: -0.025em;
}

/* Clean Navigation Links */
.nav-links {
  display: flex;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: var(--text-muted);
  text-decoration: none;
  border-radius: var(--radius);
  font-weight: 500;
  font-size: 0.875rem;
  transition: var(--transition);
  position: relative;
}

.nav-link i {
  font-size: 0.875rem;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--primary);
  transition: var(--transition);
  transform: translateX(-50%);
}

.nav-link:hover {
  color: var(--text);
  background: var(--bg-secondary);
}

.nav-link:hover::after {
  width: 80%;
}

.nav-link.router-link-active {
  color: var(--primary);
  background: rgba(37, 99, 235, 0.1);
}

.nav-link.router-link-active::after {
  width: 80%;
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
  overflow: hidden;
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

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: white;
  transition: var(--transition);
}

.card-icon.update {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.card-icon.edit {
  background: linear-gradient(135deg, #FCCF61, #FFE495);
}

.card-icon.tray {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.card-icon.table {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
}

.card-icon.clear {
  background: linear-gradient(135deg, #ec1b03, #822011);
}


.dashboard-card:hover .card-icon {
  transform: scale(1.1) rotate(5deg);
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

.card-arrow {
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: var(--transition);
}

.dashboard-card:hover .card-arrow {
  background: var(--primary);
  color: white;
  transform: translateX(4px);
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
  padding-top: 64px;
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
@media (max-width: 768px) {
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
    background: rgba(255, 255, 255, 0.95);
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

  .dashboard-header {
    margin-bottom: 2rem;
    padding: 0 0.5rem;
  }

  .dashboard-title {
    font-size: 1.75rem;
    line-height: 1.2;
  }

  .dashboard-subtitle {
    font-size: 1rem;
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

  .card-icon {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  .card-title {
    font-size: 1.125rem;
  }

  .card-description {
    font-size: 0.8125rem;
    margin-bottom: 0.75rem;
  }

  .card-arrow {
    width: 28px;
    height: 28px;
    bottom: 1.25rem;
    right: 1.25rem;
  }

  /* Ensure cards don't extend beyond viewport */
  .dashboard-card:hover {
    transform: translateY(-4px);
  }
}

/* Extra small screens */
@media (max-width: 480px) {
  .main {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }

  .dashboard-header {
    margin-bottom: 1.5rem;
  }

  .dashboard-title {
    font-size: 1.5rem;
  }

  .dashboard-subtitle {
    font-size: 0.9rem;
  }

  .dashboard-card {
    padding: 1rem;
    margin: 0;
  }

  .card-icon {
    width: 45px;
    height: 45px;
    font-size: 1.125rem;
  }

  .card-title {
    font-size: 1rem;
  }

  .card-description {
    font-size: 0.75rem;
  }

  .card-arrow {
    width: 24px;
    height: 24px;
    bottom: 1rem;
    right: 1rem;
  }
}

/* Clean Focus States */
.nav-link:focus-visible,
.menu-toggle:focus-visible,
.dashboard-card:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Smooth Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
</style>