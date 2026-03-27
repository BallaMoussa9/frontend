<template>
  <div class="lab-page-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="brand-box">
          <Beaker :size="24" />
          <span>SanTeKo LAB</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <RouterLink :to="`/Laborantin/dashboard/${authStore.user?.id}`" class="nav-link" :class="{ active: route.name === 'LaborantinDashboard' }">
          <BarChart3 :size="20" />
          <span>Dashboard</span>
        </RouterLink>

        <RouterLink :to="`/Laborantin/AnalyseGestion/${authStore.user?.id}`" class="nav-link" :class="{ active: route.name === 'AnalyseGestion' }">
          <TestTube :size="20" />
          <span>Résultats d'examens</span>
        </RouterLink>

        <RouterLink :to="`/Laborantin/BloddGestion/${authStore.user?.id}`" class="nav-link" :class="{ active: route.name === 'BloodGestion' }">
          <Activity :size="20" />
          <span>Banque de Sang</span>
        </RouterLink>

        <div class="divider"></div>

        <RouterLink :to="`/Laborantin/profile/${authStore.user?.id}`" class="nav-link" :class="{ active: route.name === 'LaborantinProfile' }">
          <Users :size="20" />
          <span>Mon Profil</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn">
          <LogOut :size="20" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>

    <!-- Sidebar Overlay -->
    <div class="sidebar-overlay"></div>

    <!-- Main Content -->
    <main class="admin-main">
      <header class="page-header">
        <h1 class="page-title">{{ pageTitle }}</h1>
        <div class="user-badge">Technicien de Labo</div>
      </header>

      <div class="content-body">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStores'
import {
  Beaker, BarChart3, TestTube, Activity, Users, LogOut
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isSidebarOpen = ref(false)

// Titre dynamique selon la route actuelle
const pageTitle = computed(() => {
  if (route.name === 'LaborantinDashboard') return 'Tableau de Bord'
  if (route.name === 'BloodGestion') return 'Gestion du Sang'
  if (route.name === 'AnalyseGestion') return 'Nouvelle Analyse'
  if (route.name === 'ListeDemandeAnalyse') return 'Demandes reçues'
  return 'Espace Laboratoire'
})

// Fonction de déconnexion
const handleLogout = async () => {
  await authStore.logout();
  await router.push({ name: 'Login' })
};
</script>

<style scoped>
/* === Variables CSS - Glassmorphism Lab === */
:root {
  --primary: #2563eb;
  --primary-dark: #1e40af;
  --primary-light: #3b82f6;
  --secondary: #10b981;
  --secondary-dark: #059669;
  --secondary-light: #34d399;
  --accent: #8b5cf6;
  --accent-light: #a78bfa;
  --success: #22c55e;
  --success-light: #4caf50;
  --warning: #f59e0b;
  --warning-light: #ffb300;
  --danger: #ef4444;
  --danger-light: #f44336;
  --info: #06b6d4;
  --info-light: #29b6f6;
  --dark: #0f172a;
  --darker: #0d47a1;
  --light: #ffffff;
  --gray: #94a3b8;
  --gray-light: #cbd5e1;
  --gray-dark: #64748b;
  --border: rgba(255, 255, 255, 0.2);
  --shadow: rgba(0, 0, 0, 0.1);
  --blur: blur(20px);
}

/* === Main Container === */
.lab-page-container {
  position: relative;
  min-height: 100vh;
  padding: 0;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  overflow-x: hidden;
  max-width: 100%;
}

/* Animation de fond */
.lab-page-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at top, rgba(37, 99, 235, 0.15) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.lab-page-container > * {
  position: relative;
  z-index: 1;
}

/* === Sidebar === */
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1000;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  overflow: hidden;
}

.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(37, 99, 235, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.sidebar-header {
  padding: 2rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 2;
}

.brand-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
}

.brand-box svg {
  color: var(--primary);
  flex-shrink: 0;
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem 1rem;
  position: relative;
  z-index: 2;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 14px;
  color: rgba(255, 255, 255, 0.7);
  padding: 14px 18px;
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-weight: 600;
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.2), transparent);
  transition: left 0.5s ease;
}

.nav-link:hover::before {
  left: 100%;
}

.nav-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

.nav-link.active {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.3), rgba(16, 185, 129, 0.2));
  color: white;
  transform: translateX(5px);
}

.nav-link.active svg {
  color: #3b82f6;
}

.nav-link svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: inherit;
  transition: all 0.3s ease;
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 1rem 0;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  position: relative;
  z-index: 2;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #ef4444;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
  transform: translateY(-1px);
}

.logout-btn svg {
  color: #ef4444;
}

/* Sidebar Overlay */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
  display: none;
}

/* === Main Content === */
.admin-main {
  flex: 1;
  height: 100vh;
  overflow: hidden;
  margin-left: 280px;
  padding: 0;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  display: flex;
  flex-direction: column;
}

.page-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: var(--blur);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 40px var(--shadow);
  padding: 2rem;
  margin: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
  z-index: 1;
}

.page-header:hover::before {
  transform: scaleX(1);
}

.page-header:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.user-badge {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
  transition: all 0.3s ease;
}

.user-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
}

.content-body {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: var(--blur);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 40px var(--shadow);
  padding: 2rem;
  margin: 1.5rem;
  max-height: calc(100vh - 200px);
  transition: all 0.3s ease;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
}

.content-body::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--secondary), var(--primary));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
  z-index: 1;
}

.content-body:hover::before {
  transform: scaleX(1);
}

.content-body:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
}

/* --- RESPONSIVE --- */
.mobile-toggle {
  display: none;
}

@media (max-width: 992px) {
  .sidebar {
    transform: translateX(-100%);
  }
  .sidebar.is-open {
    transform: translateX(0);
  }
  .main-content {
    margin-left: 0;
    padding: 20px;
  }
  .mobile-toggle {
    display: block;
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #ffcc00;
    color: #002580;
    border: none;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    z-index: 1100;
    font-size: 1.5rem;
  }
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 900;
  }
}
</style>