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
          <li><RouterLink :to="{ name: 'PatientDashboard', params: { id: patientId } }"><i class="fas fa-th-large"></i> Aperçu</RouterLink></li>
          <li><RouterLink :to="{ name: 'PatientProfile', params: { id: patientId } }"><i class="fas fa-user-circle"></i> Profil Santé</RouterLink></li>
          <li><RouterLink :to="{ name: 'Appointment', params: { id: patientId } }"><i class="fas fa-calendar-alt"></i> Rendez-vous</RouterLink></li>
          <li><RouterLink :to="{ name: 'MedicalHistory', params: { id: patientId } }"><i class="fas fa-file-medical"></i> Historique</RouterLink></li>
          <li><RouterLink :to="{ name: 'MessagePatient', params: { id: patientId } }"><i class="fas fa-comments"></i> Messages</RouterLink></li>
          <li class="sos-item"><RouterLink :to="{ name: 'SosAlert', params: { id: patientId } }"><i class="fas fa-ambulance"></i> SOS</RouterLink></li>
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
          <i class="fas fa-sign-out-alt"></i> Déconnexion
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
  position: fixed; /* Fixe le layout pour ignorer les marges parentes */
  top: 0;
  left: 0;
  background-color: #f4f7fe;
}

.sidebar {
  width: 260px;
  background-color: #001140;
  color: white;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-brand { padding: 30px 25px; font-size: 24px; font-weight: 800; }
.sidebar-nav { flex: 1; padding: 10px 15px; }
.sidebar-nav ul { list-style: none; padding: 0; }
.sidebar-nav a {
  display: flex; align-items: center; gap: 12px; color: #a3b1cc;
  padding: 12px 15px; text-decoration: none; border-radius: 8px;
}
.sidebar-nav a.router-link-active { background: #002580; color: white; }

.sidebar-footer { padding: 20px; background: rgba(0,0,0,0.2); }
.profile-section { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
.avatar-circle { width: 35px; height: 35px; background: #002580; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; }
.logout-btn { width: 100%; padding: 10px; background: transparent; color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; cursor: pointer; }
.logout-btn:hover { background: #d32f2f; }

/* Main Content corrigé */
.main-content {
  flex: 1;
  height: 100vh;
  overflow-y: auto;
  margin: 0;
  padding: 0;
}

.content-view {
  padding: 30px; /* Padding interne pour tes cartes et tableaux */
}
</style>