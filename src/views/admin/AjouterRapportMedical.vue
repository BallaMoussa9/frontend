<template>
  <AdminLayout>
    <div class="form-container">
      <h2>Ajouter un Rapport Médical</h2>
      <form @submit.prevent="submit">
        <div class="row">
        <input type="text" v-model="filter" placeholder="🔍 Filtrer par nom, email ou rôle..." />
        </div>
        <select v-model="form.report_type">
          <option value="consultation">Consultation</option>
          <option value="hopitalisation">Hospitalisation</option>
          <option value="laboratoire">Laboratoire</option>
        </select>
        <input v-model="form.title" placeholder="Titre du rapport" />
        <textarea v-model="form.content" placeholder="Contenu détaillé"></textarea>
        <button class="submit">Ajouter</button>
      </form>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { reactive } from 'vue'
import axios from 'axios'

const form = reactive({
  patient_id: '',
  doctor_id: '',
  report_type: 'consultation',
  title: '',
  content: ''
})

const submit = async () => {
  await axios.post('http://localhost/api/rapports-medicaux', form)
  alert('Rapport médical ajouté !')
}
</script>

<style scoped>
@import './FormStyle.css';
</style>
