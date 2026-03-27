<template>
  <div v-if="authStore.loading || !authStore.initialized" class="loading-screen">
    <div class="spinner"></div>
    <p>Chargement...</p>
  </div>

  <div v-else-if="hasProfileId && isPatientRole" class="layout-container">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <span class="logo">SanTeKo</span>
      </div>

      <nav class="sidebar-nav">
        <ul>
          <li><RouterLink :to="{ name: 'PatientDashboard', params: { id: patientId } }"><LayoutDashboard :size="20" /> Aperçu</RouterLink></li>
          <li><RouterLink :to="{ name: 'PatientProfile', params: { id: patientId } }"><User :size="20" /> Profil Santé</RouterLink></li>
          <li><RouterLink :to="{ name: 'Appointment', params: { id: patientId } }"><Calendar :size="20" /> Rendez-vous</RouterLink></li>
          <li><RouterLink :to="{ name: 'MedicalHistory', params: { id: patientId } }"><FileText :size="20" /> Historique</RouterLink></li>
          <li><RouterLink :to="{ name: 'MessagePatient', params: { id: patientId } }"><MessageSquare :size="20" /> Messages</RouterLink></li>
          <li><RouterLink :to="{ name: 'SosAlert', params: { id: patientId } }"><Ambulance :size="20" /> SOS</RouterLink></li>
          <li><RouterLink :to="{ name: 'Teleconsultation', params: { id: patientId } }"><Video :size="20" /> Téléconsultation</RouterLink></li>
          <li><RouterLink :to="{ name: 'PatientSettings', params: { id: patientId } }"><Settings :size="20" /> Paramètres</RouterLink></li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <div class="profile-section">
          <div class="avatar-circle">{{ initials }}</div>
          <div class="user-meta">
            <span class="user-name">{{ authStore.user?.first_name }}</span>
            <span class="user-role">Patient</span>
          </div>
        </div>
        <button @click="handleLogout" class="logout-btn">
          <LogOut :size="18" /> Déconnexion
        </button>
      </div>
    </aside>

    <main class="main-content">
      <div class="content-view">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/authStores';
import { useRouter } from 'vue-router';
import {
  LayoutDashboard, User, Calendar, FileText, MessageSquare, Ambulance,
  LogOut, Activity, Heart, Shield, Stethoscope, Settings, Video
} from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();

const patientId = computed(() => authStore.profileId);
const hasProfileId = computed(() => !!authStore.profileId);
const isPatientRole = computed(() => authStore.role_name?.toLowerCase() === 'patient');
const initials = computed(() => (authStore.user?.first_name?.charAt(0) || '') + (authStore.user?.last_name?.charAt(0) || ''));

const handleLogout = async () => {
  await authStore.logout();
  await router.push({ name: 'Login' })
};
</script>

<style scoped>
/* Conteneur principal qui force l'occupation de tout l'écran */
.layout-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  margin: 0;
  padding: 0;
  box-sizing: border-box;
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

.sidebar-nav {
  flex: 1;
  padding: 1rem;
  position: relative;
  z-index: 2;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav li {
  margin-bottom: 0.5rem;
  animation: slideIn 0.4s ease-out backwards;
}

.sidebar-nav li:nth-child(1) { animation-delay: 0.1s; }
.sidebar-nav li:nth-child(2) { animation-delay: 0.2s; }
.sidebar-nav li:nth-child(3) { animation-delay: 0.3s; }
.sidebar-nav li:nth-child(4) { animation-delay: 0.4s; }
.sidebar-nav li:nth-child(5) { animation-delay: 0.5s; }
.sidebar-nav li:nth-child(6) { animation-delay: 0.6s; }
.sidebar-nav li:nth-child(7) { animation-delay: 0.7s; }
.sidebar-nav li:nth-child(8) { animation-delay: 0.8s; }

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.sidebar-nav a {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.7);
  padding: 12px 16px;
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
  border: 1px solid rgba(37, 99, 235, 0.3);
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2);
}

.sidebar-nav a.router-link-active svg {
  color: #3b82f6;
}

.sos-item a {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1));
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  font-weight: 700;
}

.sos-item a:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(239, 68, 68, 0.2));
  transform: translateX(5px) scale(1.02);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
}

.sos-item a svg {
  color: #ef4444;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.sidebar-footer {
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 2;
}

.profile-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1rem;
  padding: 12px;
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
}

.user-name {
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: 2px;
}

.user-role {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  font-weight: 600;
}

.logout-btn {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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
</style>