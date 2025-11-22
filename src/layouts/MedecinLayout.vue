<template>
  <div v-if="authStore.initialized && doctorId" class="layout-wrapper">
    <aside class="sidebar">
      <!-- Correction de la balise router-link pour éviter l'erreur de compilation -->
      <router-link :to="{ name: 'DoctorDashboard' }" class="nav-item" active-class="active">Accueil</router-link>
      <router-link :to="{ name: 'Appointments', params: { id: doctorId } }" class="nav-item" active-class="active">Rendez-vous</router-link>
      <router-link :to="{ name: 'TeleConsultation', params: { id: doctorId } }" class="nav-item" active-class="active">Téléconsultations</router-link>
      <router-link :to="{ name: 'Patients', params: { id: doctorId } }" class="nav-item" active-class="active">Patients</router-link>
      <router-link :to="{ name: 'Ordonnances', params: { id: doctorId } }" class="nav-item" active-class="active">Ordonnances</router-link>
      <router-link :to="{ name: 'RapportsView' }" class="nav-item" active-class="active">Rapports Médicaux</router-link>
      <router-link :to="{ name: 'Messagerie', params: { id: doctorId } }" class="nav-item" active-class="active">Messagerie</router-link>
    </aside>

    <div class="main-content">
      <AppLayout :withSidebar="true">
        <slot />
      </AppLayout>
    </div>
  </div>

  <div v-else class="loading-screen">
    <p>Chargement du profil médecin...</p>
  </div>
</template>

<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/authStores'
import { computed } from 'vue'

const authStore = useAuthStore()
// doctorId est l'ID de profil (doctor_id) qui est stocké dans authStore.profileId
const doctorId = computed(() => authStore.profileId)
</script>

<style scoped>
.layout-wrapper { display: flex; height: 100vh; overflow: hidden; }
.sidebar { position: fixed; top: 60px; left: 0; width: 220px; height: calc(100vh - 60px); background-color: #0f1e46; padding: 20px 15px; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15); z-index: 999; }
.nav-item { text-decoration: none; color: #e0e6f0; font-weight: 600; font-size: 15px; padding: 10px 12px; border-radius: 6px; transition: all 0.2s ease-in-out; }
.nav-item:hover { background-color: rgba(255, 255, 255, 0.15); color: #fff; padding-left: 16px; }
.nav-item.active { background-color: #1a2e66; color: #fff; padding-left: 18px; }
.main-content { margin-left: 220px; margin-top: 60px; flex: 1; height: calc(100vh - 60px); overflow-y: auto; background-color: #f8fafc; padding: 20px; }
.loading-screen { display: flex; justify-content: center; align-items: center; height: 100vh; font-size: 18px; color: #002580; }
</style>