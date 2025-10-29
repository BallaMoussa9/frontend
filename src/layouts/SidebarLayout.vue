<template>
  <div v-if="authStore.loading || !authStore.initialized" class="loading-screen">
    Chargement de la session en cours...
  </div>

  <div v-else-if="hasProfileId && isPatientRole" class="layout-wrapper">
    <!-- Sidebar fixe -->
    <aside class="sidebar">
      <nav>
        <ul>
          <li>
            <RouterLink :to="{ name: 'PatientDashboard', params: { id: patientId } }">
              Aperçu
            </RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'PatientProfile', params: { id: patientId } }">
              Profil Santé
            </RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'Appointment', params: { id: patientId } }">
              Rendez-vous
            </RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'MedicalHistory', params: { id: patientId } }">
              Historique Médical
            </RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'SosAlert', params: { id: patientId } }">
              SOS
            </RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'MessagePatient', params: { id: patientId } }">
              Messages
            </RouterLink>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Contenu principal -->
    <main class="main-content">
      <AppLayout :withSidebar="true">
        <slot />
      </AppLayout>
    </main>
  </div>

  <div v-else class="error-screen">
    <p v-if="!authStore.isLoggedIn">❌ Vous devez être connecté pour accéder au Dashboard Patient.</p>

    <p v-else-if="!isPatientRole">
      ⚠️ Accès refusé. Cette section est réservée aux **Patients**.
      <br> (Votre rôle est actuellement : **{{ authStore.role_name || 'Indéfini/Non-patient' }}**)
    </p>

    <p v-else-if="!hasProfileId">
      ⏳ Connexion réussie, mais impossible de trouver votre ID de Patient. Veuillez patienter ou réessayer.
    </p>

    <p v-else>Une erreur inconnue est survenue.</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/authStores';
import AppLayout from '@/layouts/AppLayout.vue';
import { RouterLink } from 'vue-router';

const authStore = useAuthStore();

const patientId = computed(() => authStore.profileId);
const hasProfileId = computed(() => !!authStore.profileId);
const isPatientRole = computed(() =>
  authStore.role_name && authStore.role_name.toLowerCase() === 'patient'
);
</script>

<style scoped>
/* Container principal */
.layout-wrapper {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* Sidebar fixe */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 220px;
  height: 100vh;
  background-color: #002580;
  padding: 20px;
  color: white;
  overflow-y: auto;
  z-index: 999;
}

.sidebar nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sidebar nav li {
  margin-bottom: 8px;
}

.sidebar a {
  display: block;
  color: white;
  padding: 10px 12px;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s ease-in-out;
}

.sidebar a:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.sidebar a.router-link-exact-active {
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: bold;
}

/* Contenu principal avec marge pour sidebar */
.main-content {
  margin-left: 220px;
  flex-grow: 1;
  height: 100vh;
  overflow-y: auto;
  background-color: #f7f9fc;
  padding: 24px 32px 32px 32px;
}

/* Écrans de chargement / erreurs */
.loading-screen, .error-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  font-size: 1.2em;
  color: #002580;
  background-color: #e6f0ff;
}
.error-screen {
  color: red;
}
</style>
