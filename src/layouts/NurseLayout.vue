<template>
  <div class="nurse-layout" :class="{ 'sidebar-collapsed': isCollapsed, 'mobile-open': isMobileOpen }">
    <div v-if="isMobileOpen" class="mobile-overlay" @click="isMobileOpen = false"></div>

    <aside class="sidebar no-print">
      <div class="sidebar-header">
        <div class="logo-area">
          <div class="logo-icon">H</div>
          <span class="logo-text" v-if="!isCollapsed">NurseDashboard</span>
        </div>
        <button class="collapse-btn" @click="isCollapsed = !isCollapsed">
          <ChevronLeft v-if="!isCollapsed" :size="18" />
          <ChevronRight v-else :size="18" />
        </button>
      </div>

      <nav class="nav-menu">
        <RouterLink
          v-for="item in menu"
          :key="item.label"
          :to="{ name: item.routeName, params: { id: nurseId } }"
          class="nav-link"
          @click="isMobileOpen = false"
        >
          <component :is="item.icon" class="nav-icon" :size="22" />
          <span class="nav-text" v-if="!isCollapsed">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" @click="handleLogout">
          <LogOut :size="20" />
          <span class="nav-text" v-if="!isCollapsed">Déconnexion</span>
        </button>
      </div>
    </aside>

    <main class="main-content">
      <header class="content-header no-print">
        <div class="header-left">
          <button class="menu-toggle" @click="isMobileOpen = true">
            <Menu :size="24" />
          </button>
          <h2 class="page-title">{{ currentPageLabel }}</h2>
        </div>
        <div class="header-right">
          <div class="date-chip">
            <Calendar :size="16" />
            <span>{{ currentDateTime }}</span>
          </div>
        </div>
      </header>

      <div class="page-body">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { 
  LayoutDashboard, Users, Activity, FileText, 
  ChevronLeft, ChevronRight, Menu, Calendar, LogOut, UserCircle 
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapsed = ref(false)
const isMobileOpen = ref(false)

// On récupère l'ID du nurse de façon sécurisée (Store ou URL)
const nurseId = computed(() => {
  return route.params.id || userStore.nurseProfile?.id || route.params.idNurse
})

const menu = [
  { label: 'Tableau de bord', icon: LayoutDashboard, routeName: 'NurseDashboard' },
  { label: 'Patients', icon: Users, routeName: 'PatientList' },
  { label: 'Signes Vitaux', icon: Activity, routeName: 'VitalSignsForm' },
  { label: 'Rapports', icon: FileText, routeName: 'ActivityReport' },
  { label: 'Profil', icon: UserCircle, routeName: 'NurseProfile' },
]

const handleLogout = () => {
  if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
    router.push({ name: 'Login' })
  }
}

const currentPageLabel = computed(() => {
  const currentItem = menu.find(item => route.name === item.routeName)
  return currentItem ? currentItem.label : 'Détails'
})

const currentDateTime = new Date().toLocaleDateString('fr-FR', {
  day: 'numeric', month: 'short'
})
</script>

<style scoped>
/* Variables CSS - Design Glassmorphism Infirmier */
:root {
  --primary: #2563eb;
  --primary-dark: #1d4ed8;
  --primary-light: #3b82f6;
  --secondary: #10b981;
  --secondary-dark: #059669;
  --secondary-light: #34d399;
  --accent: #8b5cf6;
  --accent-light: #a78bfa;
  --danger: #ef4444;
  --danger-light: #f87171;
  --warning: #f59e0b;
  --warning-light: #fbbf24;
  --success: #22c55e;
  --success-light: #4ade80;
  --info: #06b6d4;
  --info-light: #22d3ee;
  --dark: #0f172a;
  --darker: #020617;
  --light: #ffffff;
  --gray: #94a3b8;
  --gray-light: #cbd5e1;
  --gray-dark: #64748b;
  --border: rgba(255, 255, 255, 0.15);
  --shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 30px 60px -12px rgba(0, 0, 0, 0.5);
  --shadow-2xl: 0 40px 80px -12px rgba(0, 0, 0, 0.6);
  --radius: 16px;
  --radius-lg: 20px;
  --radius-xl: 24px;
}

.nurse-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  position: relative;
}

/* Animation de fond */
.nurse-layout::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 50%, rgba(37, 99, 235, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
  animation: floatingGradient 20s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes floatingGradient {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(-20px, -20px) rotate(120deg); }
  66% { transform: translate(20px, -10px) rotate(240deg); }
}

.nurse-layout > * {
  position: relative;
  z-index: 1;
}

/* SIDEBAR */
.sidebar {
  width: 280px;
  min-width: 280px;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  backdrop-filter: blur(20px);
  position: relative;
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

.sidebar-collapsed .sidebar {
  width: 80px;
  min-width: 80px;
}

.sidebar-header {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 2;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2563eb, #10b981);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.logo-text {
  font-size: 1.2rem;
  font-weight: 800;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.collapse-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  transform: scale(1.05);
}

.nav-menu {
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
  position: relative;
  z-index: 2;
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

.nav-link.router-link-active {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.3), rgba(16, 185, 129, 0.2));
  color: white;
  transform: translateX(5px);
}

.nav-link.router-link-active .nav-icon {
  color: #3b82f6;
}

.nav-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  color: inherit;
  transition: all 0.3s ease;
}

.nav-link:hover .nav-icon {
  transform: scale(1.1);
}

.nav-text {
  font-size: 0.9rem;
  font-weight: 600;
}

/* SIDEBAR FOOTER */
.sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 2;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 18px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.05));
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  color: #f87171;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.logout-btn:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(245, 158, 11, 0.1));
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  transform: translateY(-2px);
}

.logout-btn .nav-icon {
  color: inherit;
}

/* MAIN CONTENT */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: transparent;
}

.content-header {
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: slideDown 0.6s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menu-toggle {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.menu-toggle:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.05);
}

.page-title {
  margin: 0;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.date-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
}

/* MOBILE STYLES */
.mobile-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
}

@media (max-width: 1024px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .sidebar.mobile-open {
    transform: translateX(0);
  }
  
  .mobile-overlay {
    display: block;
  }
  
  .menu-toggle {
    display: flex;
  }
  
  .main-content {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .content-header {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.2rem;
  }
  
  .date-chip {
    display: none;
  }
}

/* Print styles */
@media print {
  .sidebar,
  .content-header,
  .menu-toggle {
    display: none !important;
  }
  
  .main-content {
    margin-left: 0 !important;
  }
}

.page-body {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background: transparent;
  position: relative;
  z-index: 1;
}
</style>