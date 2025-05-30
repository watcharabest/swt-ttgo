<template>
  <div class="dashboard">

    <div class="dashboard-header">
        <div class="dashboard-grid">
        <div 
            class="dashboard-card"
            @click="navigateTo('/update')"
        >
            <div class="card-icon update">
            <i class="fas fa-sync-alt"></i>
            </div>
            <h3 class="card-title">Update Display</h3>
            <p class="card-description">Mapping Mac Address (TTGO) To Product Order</p>
            <div class="card-arrow">
            <i class="fas fa-arrow-right"></i>
            </div>
        </div>
        
        <div 
            class="dashboard-card"
            @click="navigateTo('/tray')"
        >
            <div class="card-icon tray">
            <i class="fas fa-utensils"></i>
            </div>
            <h3 class="card-title">Update Tray</h3>
            <p class="card-description">Add / Delete Tray List</p>
            <div class="card-arrow">
            <i class="fas fa-arrow-right"></i>
            </div>
        </div>

        <div 
            class="dashboard-card"
            @click="navigateTo('/table')"
        >
            <div class="card-icon edit">
            <i class="fas fa-edit"></i>
            </div>
            <h3 class="card-title">Edit Database</h3>
            <p class="card-description">Insert / Delete Product Order</p>
            <div class="card-arrow">
            <i class="fas fa-arrow-right"></i>
            </div>
        </div>

        <div 
            class="dashboard-card"
            @click="navigateTo('/showtable')"
        >
            <div class="card-icon table">
            <i class="fas fa-table"></i>
            </div>
            <h3 class="card-title">Table</h3>
            <p class="card-description">Display Table of Product Order and Track</p>
            <div class="card-arrow">
            <i class="fas fa-arrow-right"></i>
            </div>
        </div>

        <div 
            class="dashboard-card"
            @click="navigateTo('/clear')"
        >
            <div class="card-icon clear">
            <i class="fas fa-table"></i>
            </div>
            <h3 class="card-title">Clear</h3>
            <p class="card-description">Clear Product Order On Display</p>
            <div class="card-arrow">
            <i class="fas fa-arrow-right"></i>
            </div>
        </div>
        </div>
    </div>
    <CameraSwitch />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import CameraSwitch from './CameraSwitch.vue'

const router = useRouter()
const navigateTo = (path) => router.push(path)
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
    linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)),
    url('C:\Users\wiroj\OneDrive\Desktop\swt\project_IoT_TTGOdisplay\frontend\image\bg.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;  
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

/* Responsive Design */
@media (max-width: 768px) {
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

  .dashboard-card:hover {
    transform: translateY(-4px);
  }
}

@media (max-width: 480px) {
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