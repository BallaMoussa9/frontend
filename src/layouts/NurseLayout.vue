<template>
  <AppLayout>
    <div class="nurse-layout">
      <aside class="sidebar">
        <nav>
          <RouterLink
            v-for="item in menu"
            :key="item.label"
            :to="item.to"
            class="nav-link"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </aside>

      <div class="main">
        <slot />
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import { RouterLink, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore' // Import maintenu si vous l'utilisiez

// --- GESTION DE L'ID DE L'INFIRMIER (CORRIGÉE) ---
const route = useRoute()
const userStore = useUserStore() // Si vous ne voulez pas du UserStore, retirez cette ligne.

// 🔑 CORRECTION CRITIQUE : Récupère l'ID à partir des clés 'idNurse' ou 'id',
// avec un fallback sur le store si nécessaire. Cela résout l'erreur "Missing required param id".
const nurseId = route.params.idNurse || route.params.id || userStore.nurseProfile?.id
// Si vous n'utilisez pas de store, utilisez la version simplifiée :
// const nurseId = route.params.idNurse || route.params.id


// 2. Définition du menu avec les objets de route complets
const menu = [
  // Dashboard attend l'ID sous la clé 'id'
  { label: 'Dashboard', to: { name: 'NurseDashboard', params: { id: nurseId } } },

  // PatientList attend l'ID sous la clé 'id'
  { label: 'PatientList', to: { name: 'PatientList', params: { id: nurseId } } },

  // Les autres liens nécessitant l'ID infirmier
  { label: 'ActivityReport', to: { name: 'ActivityReport', params: { id: nurseId } } },
  { label: 'NoticeBoard', to: { name: 'NoticeBoard', params: { id: nurseId } } },
  { label: 'NurseProfile', to: { name: 'NurseProfile', params: { id: nurseId } } },

  // Liens qui ne peuvent pas être dynamiques dans le menu (sans ID patient connu)
  { label: 'VitalSignsForm', to: { name: 'VitalSignsForm', params: { id: nurseId } } },
  // { label: 'CareNotes', to: { name: 'CareNotes', params: { id: nurseId } } },
]
</script>

<style scoped>
/* Styles inchangés */
.nurse-layout { display: flex; min-height: 100vh; }
.sidebar { width: 220px; background-color: #ffffff; padding: 20px; box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05); }
.nav-link { display: block; padding: 10px 14px; margin-bottom: 8px; text-decoration: none; color: #333; border-radius: 5px; font-weight: 500; transition: background 0.3s; }
.nav-link.router-link-active { background-color: #0040d0; color: #ffffff; }
.nav-link:hover:not(.router-link-active) { background-color: #f0f0f0; }
.main { flex: 1; padding: 32px; background: #f7f9fc; }
</style>
