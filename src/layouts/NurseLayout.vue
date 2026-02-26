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
.nurse-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #f8fafc;
}

/* SIDEBAR */
.sidebar {
  width: 260px;
  min-width: 260px;
  background: white;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
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
  border-bottom: 1px solid #f1f5f9;
}

.nav-menu {
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 4px;
  color: #64748b;
  text-decoration: none;
  border-radius: 12px;
  white-space: nowrap;
}

.nav-link:hover { background: #f1f5f9; color: #0040d0; }
.router-link-active { background: #eff6ff; color: #0040d0; font-weight: 600; }

.sidebar-footer {
  padding: 20px 16px;
  border-top: 1px solid #f1f5f9;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  background-color: #fff1f2;
  color: #e11d48;
  border: none;
  border-radius: 12px;
  cursor: pointer;
}

/* MAIN CONTENT */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* Empêche l'éclatement du layout par les tableaux */
}

.content-header {
  height: 70px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.page-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: #1e293b;
}

/* RESPONSIVE LOGIC */
@media (max-width: 1024px) {
  .menu-toggle {
    display: block;
  }

  .sidebar {
    position: fixed;
    left: -260px; /* Caché par défaut */
    height: 100vh;
  }

  .mobile-open .sidebar {
    left: 0; /* Apparaît au clic burger */
  }

  .mobile-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 90;
  }
  
  .sidebar-collapsed .sidebar {
    left: -80px; /* Cache aussi la version réduite sur mobile */
  }
}

.logo-icon {
  background: #0040d0;
  color: white;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: bold;
}

.logo-area { display: flex; align-items: center; gap: 10px; }

@media print { .no-print { display: none !important; } }
</style>