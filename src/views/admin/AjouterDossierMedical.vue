<template>
  <AdminLayout>
    <div class="form-container">
      <h2>Ajouter un Dossier Médical</h2>
      <form @submit.prevent="submit">
        <div class="row">
        <input type="text" v-model="filter" placeholder="🔍 Filtrer par nom, email ou rôle..." />
        </div>
        <label for="patient">Patient concerné</label>
          <select id="patient" v-model="nouveauRapport.patient">
            <option disabled value="">-- Sélectionnez --</option>
            <option v-for="patient in patients" :key="patient.id" :value="patient.name">
              {{ patient.name }}
            </option>
          </select>
        <div class="row">
          <input v-model="form.blood_type" placeholder="Groupe sanguin" />
          <input v-model="form.status" placeholder="Statut" />
        </div>
        <input v-model="form.treatment_plan" placeholder="Plan de traitement" />
        <input v-model="form.diagnosis" placeholder="Diagnostic" />
        <textarea v-model="form.chronic_conditions" placeholder="Maladies chroniques"></textarea>
        <button class="submit">Ajouter</button>
      </form>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { reactive,ref } from 'vue'
import axios from 'axios'
const patients = ref([
  { id: 1, name: 'Leslie Alexander' },
  { id: 2, name: 'Oumar Sidibé' },
])
const nouveauRapport = ref({
  type: '',
  patient: '',
  description: '',
})

const form = reactive({
  patient_id: '',
  doctor_id: '',
  blood_type: '',
  treatment_plan: '',
  diagnosis: '',
  chronic_conditions: '',
  status: ''
})

const submit = async () => {
  await axios.post('http://localhost/api/dossiers-medicaux', form)
  alert('Dossier médical ajouté !')
}
</script>

<style scoped>
@import './FormStyle.css';
</style>
