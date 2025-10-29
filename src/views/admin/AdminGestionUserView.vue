// Fichier : src/views/admin/GestionUtilisateurs.vue
<template>
  <AdminLayout>
    <div class="gestion-utilisateurs">
      <h2>Gestion des utilisateurs</h2>
      <div class="actions">
        <button @click="selected = 'patients'">Patients</button>
        <button @click="selected = 'medecins'">Médecins</button>
        <button @click="selected = 'infirmiers'">Infirmiers</button>
        <button @click="selected = 'laboratoires'">Laboratoires</button>
        <button @click="selected = 'comptables'">Comptables</button>
      </div>
      <component :is="currentView" />
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import Patients from './utilisateurs/Patients.vue'
import Medecins from './utilisateurs/Medecins.vue'
import Infirmiers from './utilisateurs/Infirmiers.vue'
import Laboratoires from './utilisateurs/Laboratoires.vue'
import Comptables from './utilisateurs/Comptables.vue'

import { ref, computed } from 'vue'

const selected = ref('patients')

const currentView = computed(() => {
  switch (selected.value) {
    case 'patients': return Patients
    case 'medecins': return Medecins
    case 'infirmiers': return Infirmiers
    case 'laboratoires': return Laboratoires
    case 'comptables': return Comptables
  }
})
</script>

<style scoped>
.gestion-utilisateurs h2 {
  margin-bottom: 20px;
}
.actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
button {
  padding: 8px 14px;
  border: none;
  background-color: #0040d0;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}
button:hover {
  background-color: #0030a0;
}
</style>

<!-- Fichier Patients.vue, Medecins.vue, etc. seront similaires et contiendront les tables CRUD correspondantes. -->
