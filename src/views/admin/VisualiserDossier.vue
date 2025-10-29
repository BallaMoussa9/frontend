<template>
  <AdminLayout>
    <div class="dossier-container">
      <h2>Dossier Médical du Patient</h2>

      <div class="card">
        <p><strong>Patient ID :</strong> {{ dossier.patient_id }}</p>
        <p><strong>Médecin ID :</strong> {{ dossier.doctor_id }}</p>
        <p><strong>Groupe sanguin :</strong> {{ dossier.blood_type }}</p>
        <p><strong>Statut :</strong> {{ dossier.status }}</p>
        <p><strong>Diagnostic :</strong> {{ dossier.diagnosis }}</p>
        <p><strong>Plan de traitement :</strong> {{ dossier.treatment_plan }}</p>
        <p><strong>Maladies chroniques :</strong></p>
        <div class="box">
          {{ dossier.chronic_conditions }}
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import AdminLayout from '@/layouts/AdminLayout.vue'

const route = useRoute()
const dossier = ref({})

onMounted(async () => {
  const { data } = await axios.get(`http://localhost/api/dossiers-medicaux/${route.params.id}`)
  dossier.value = data
})
</script>

<style scoped>
.dossier-container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
}

.card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba(0,0,0,0.05);
}

.box {
  margin-top: 8px;
  padding: 12px;
  background: #f4f4f4;
  border-left: 4px solid #0040d0;
}
</style>
