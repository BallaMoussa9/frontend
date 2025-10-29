<template>
  <AdminLayout>
    <div class="view-report-page">
      <h2>Rapport médical du {{ rapport.date }}</h2>

      <div class="meta">
        <p><strong>Patient :</strong> {{ rapport.patient }}</p>
        <p><strong>Médecin :</strong> {{ rapport.medecin }}</p>
        <p><strong>Date :</strong> {{ rapport.date }}</p>
      </div>

      <div class="content-box">
        <p>{{ rapport.contenu }}</p>
      </div>

      <div v-if="rapport.fichier">
        📎 <a :href="rapport.fichier" target="_blank">Voir la pièce jointe</a>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { ref } from 'vue'

const rapport = ref({
  patient: 'Fatou Diallo',
  medecin: 'Dr Keita Moussa',
  date: '2025-07-14',
  contenu: `Examen clinique réalisé avec succès. Aucune anomalie détectée. Patient sous traitement léger.`,
  fichier: 'https://via.placeholder.com/120',
})
</script>

<style scoped>
.view-report-page {
  max-width: 700px;
  margin: auto;
  padding: 32px;
}

.meta p {
  margin-bottom: 6px;
}

.content-box {
  margin-top: 20px;
  padding: 16px;
  background: #f9f9f9;
  border-left: 4px solid #0040d0;
  border-radius: 6px;
  font-size: 15px;
}
</style>
