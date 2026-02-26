<template>
  <div v-if="authStore.loading || !authStore.initialized" class="loading-screen">
    <div class="spinner"></div>
  </div>

  <div v-else-if="doctorId" class="layout-container">
    <button class="mobile-toggle" @click="isSidebarOpen = !isSidebarOpen">
      <i class="fas" :class="isSidebarOpen ? 'fa-times' : 'fa-bars'"></i>
    </button>

    <aside class="sidebar" :class="{ 'sidebar-open': isSidebarOpen }">
      <div class="sidebar-brand">
        <span class="logo">SanTeKo</span>
        <span class="role-badge">PRO</span>
      </div>

      <nav class="sidebar-nav">
        <ul>
          <li>
            <router-link :to="{ name: 'DoctorDashboard' }" class="nav-item" @click="closeSidebarMobile">
              <i class="fas fa-chart-line"></i> <span>Accueil</span>
            </router-link>
          </li>
          <li>
            <router-link :to="{ name: 'Appointments', params: { id: doctorId } }" class="nav-item" @click="closeSidebarMobile">
              <i class="fas fa-calendar-check"></i> <span>Rendez-vous</span>
            </router-link>
          </li>
          <li>
            <router-link :to="{ name: 'Patients', params: { id: doctorId } }" class="nav-item" @click="closeSidebarMobile">
              <i class="fas fa-user-injured"></i> <span>Mes Patients</span>
            </router-link>
          </li>

          <li>
            <router-link :to="{ name: 'demandeAnalyse', params: { id: doctorId } }" class="nav-item" @click="closeSidebarMobile">
              <i class="fas fa-vials"></i> <span>Demandes Labo</span>
            </router-link>
          </li>

          <li>
            <router-link :to="{ name: 'Ordonnances', params: { id: doctorId } }" class="nav-item" @click="closeSidebarMobile">
              <i class="fas fa-file-prescription"></i> <span>Ordonnances</span>
            </router-link>
          </li>
          <li>
            <router-link :to="{ name: 'RapportsView' }" class="nav-item" @click="closeSidebarMobile">
              <i class="fas fa-clipboard-list"></i> <span>Rapports</span>
            </router-link>
          </li>
          <li>
            <router-link :to="{ name: 'Messagerie', params: { id: doctorId } }" class="nav-item" @click="closeSidebarMobile">
              <i class="fas fa-envelope"></i> <span>Messagerie</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="avatar">{{ authStore.user?.last_name?.charAt(0) }}</div>
          <div class="meta">
            <span class="name">Dr. {{ authStore.user?.last_name }}</span>
          </div>
        </div>
        <button @click="handleLogout" class="logout-btn">
          <i class="fas fa-sign-out-alt"></i> <span>Déconnexion</span>
        </button>
      </div>
    </aside>

    <div v-if="isSidebarOpen" class="sidebar-overlay" @click="isSidebarOpen = false"></div>

    <main class="main-content">
      <div class="content-view">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStores'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const isSidebarOpen = ref(false)

const doctorId = computed(() => authStore.profileId)

const closeSidebarMobile = () => {
  if (window.innerWidth < 1024) isSidebarOpen.value = false
}

const handleLogout = async () => {
  await authStore.logout()
  await router.push({ name: 'Login' })
}
</script>

<style scoped>
/* Le CSS reste identique à ton code original */
.layout-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #f8fafc;
  position: fixed;
  top: 0;
  left: 0;
}

.sidebar {
  width: 260px;
  background-color: #0f1e46;
  color: white;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  flex-shrink: 0;
}

.sidebar-brand { padding: 30px 20px; display: flex; align-items: center; gap: 10px; }
.logo { font-size: 22px; font-weight: 800; }
.role-badge { background: #3b82f6; font-size: 10px; padding: 2px 6px; border-radius: 4px; }

.sidebar-nav { flex: 1; padding: 10px; overflow-y: auto; }
.nav-item {
  display: flex; align-items: center; gap: 12px; color: #a3b1cc;
  padding: 12px 15px; text-decoration: none; border-radius: 8px; margin-bottom: 5px;
  transition: 0.2s;
}
.nav-item i { width: 20px; font-size: 1.1rem; }
.nav-item:hover, .router-link-active { background: #1e3a8a; color: white; }

.sidebar-footer { padding: 20px; background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.05); }
.user-info { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
.avatar { width: 35px; height: 35px; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.logout-btn { width: 100%; padding: 10px; background: transparent; border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 8px; cursor: pointer; display: flex; justify-content: center; gap: 8px; }
.logout-btn:hover { background: #ef4444; }

.main-content { flex: 1; overflow-y: auto; width: 100%; }
.content-view { padding: 30px; }

.mobile-toggle {
  display: none;
  position: fixed;
  top: 15px;
  right: 15px;
  z-index: 1100;
  background: #0f1e46;
  color: white;
  border: none;
  width: 40px; height: 40px;
  border-radius: 8px;
  cursor: pointer;
}

@media (max-width: 1024px) {
  .mobile-toggle { display: flex; align-items: center; justify-content: center; }
  .sidebar {
    position: fixed;
    transform: translateX(-100%);
    height: 100vh;
  }
  .sidebar-open { transform: translateX(0); }
  .sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 999; }
  .content-view { padding: 20px; padding-top: 70px; }
}

.loading-screen { height: 100vh; display: flex; justify-content: center; align-items: center; }
.spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #1e3a8a; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>