<template>
  <AdminLayout>
    <div class="dossier-medical">
      <h2>Dossier médical de {{ dossier.patient }}</h2>

      <div class="section">
        <p><strong>Sexe :</strong> {{ dossier.sexe }}</p>
        <p><strong>Date de naissance :</strong> {{ dossier.naissance }}</p>
        <p><strong>Groupe sanguin :</strong> {{ dossier.groupe }}</p>
        <p><strong>Allergies :</strong> {{ dossier.allergies }}</p>
      </div>

      <div class="section">
        <h3>Historique médical</h3>
        <ul>
          <li v-for="entry in dossier.historique" :key="entry.date">
            📅 {{ entry.date }} – {{ entry.detail }}
          </li>
        </ul>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
onMounted(() => {
  console.log('ID reçu :', route.params.id)
})

const dossier = {
  patient: 'Fatoumata Diallo',
  sexe: 'Femme',
  naissance: '1992-03-15',
  groupe: 'O+',
  allergies: 'Pénicilline',
  historique: [
    { date: '2025-07-10', detail: 'Consultation générale' },
    { date: '2025-06-20', detail: 'Prescription de paracétamol' },
    { date: '2025-06-01', detail: 'Analyse sanguine complète' },
  ],
}

</script>

<style scoped>
.dossier-medical {
  max-width: 800px;
  margin: auto;
  padding: 32px;
}
.section {
  margin-bottom: 20px;
}
</style>
