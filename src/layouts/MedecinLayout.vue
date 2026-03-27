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
            <router-link :to="{ name: 'DoctorDashboard' }" @click="closeSidebarMobile">
              <i class="fas fa-chart-line"></i> <span>Accueil</span>
            </router-link>
          </li>
          <li>
            <router-link :to="{ name: 'Appointments', params: { id: doctorId } }" @click="closeSidebarMobile">
              <i class="fas fa-calendar-check"></i> <span>Rendez-vous</span>
            </router-link>
          </li>
          <li>
            <router-link :to="{ name: 'Patients', params: { id: doctorId } }" @click="closeSidebarMobile">
              <i class="fas fa-user-injured"></i> <span>Mes Patients</span>
            </router-link>
          </li>
          <li>
            <router-link :to="{ name: 'demandeAnalyse', params: { id: doctorId } }" @click="closeSidebarMobile">
              <i class="fas fa-vials"></i> <span>Demandes Labo</span>
            </router-link>
          </li>
          <li>
            <router-link :to="{ name: 'Ordonnances', params: { id: doctorId } }" @click="closeSidebarMobile">
              <i class="fas fa-file-prescription"></i> <span>Ordonnances</span>
            </router-link>
          </li>
          <li>
            <router-link :to="{ name: 'RapportsView' }" @click="closeSidebarMobile">
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
        <div class="profile-section">
          <div class="avatar-circle">{{ initials }}</div>
          <div class="user-meta">
            <span class="user-name">{{ authStore.user?.first_name }} {{ authStore.user?.last_name }}</span>
            <span class="user-role">Médecin</span>
          </div>
        </div>
        <button @click="handleLogout" class="logout-btn">
          <i class="fas fa-sign-out-alt"></i> Déconnexion
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
const initials = computed(() => (authStore.user?.first_name?.charAt(0) || '') + (authStore.user?.last_name?.charAt(0) || ''))

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
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
}

.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  color: white;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  flex-shrink: 0;
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

.sidebar-brand {
  padding: 2rem 1.5rem;
  font-size: 1.8rem;
  font-weight: 900;
  background: linear-gradient(135deg, #2563eb, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  position: relative;
  z-index: 2;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-brand .logo {
  font-size: 1.8rem;
  font-weight: 900;
  background: linear-gradient(135deg, #2563eb, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar-brand .role-badge {
  background: linear-gradient(135deg, #2563eb, #10b981);
  color: white;
  font-size: 0.6rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
  margin-left: 8px;
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem 1rem;
  position: relative;
  z-index: 2;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-nav a {
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

.sidebar-nav a::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.2), transparent);
  transition: left 0.5s ease;
}

.sidebar-nav a:hover::before {
  left: 100%;
}

.sidebar-nav a:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

.sidebar-nav a.router-link-active {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.3), rgba(16, 185, 129, 0.2));
  color: white;
  transform: translateX(5px);
}

.sidebar-nav a.router-link-active svg {
  color: #3b82f6;
}

.sidebar-nav a i { 
  width: 20px; 
  font-size: 1.1rem;
  color: inherit;
}

.sidebar-footer {
  padding: 2rem 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 2;
}

.profile-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 1.5rem;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.avatar-circle {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2563eb, #10b981);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
}

.user-role {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  font-weight: 600;
}

.logout-btn {
  width: 100%;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1));
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.2);
}

/* Main Content corrigé */
.main-content {
  flex: 1;
  height: 100vh;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
}

.content-view {
  padding: 0;
  height: 100%;
  overflow-y: auto;
}

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