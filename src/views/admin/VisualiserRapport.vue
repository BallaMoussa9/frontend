<template>
  <AdminLayout>
    <div class="rapport-visualiser">
      <h2>Rapport Médical</h2>

      <div class="info">
        <p><strong>Patient ID :</strong> {{ rapport.patient_id }}</p>
        <p><strong>Médecin ID :</strong> {{ rapport.doctor_id }}</p>
        <p><strong>Type :</strong> {{ rapport.report_type }}</p>
        <p><strong>Titre :</strong> {{ rapport.title }}</p>
        <p><strong>Contenu :</strong></p>
        <div class="content-box">
          {{ rapport.content }}
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
const rapport = ref({})

onMounted(async () => {
  const { data } = await axios.get(`http://localhost/api/rapports-medicaux/${route.params.id}`)
  rapport.value = data
})
</script>

<style scoped>
.rapport-visualiser {
  padding: 20px;
  background: white;
  border-radius: 12px;
  max-width: 800px;
  margin: auto;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
}
.content-box {
  background: #f9f9f9;
  padding: 16px;
  border-left: 4px solid #0040d0;
  margin-top: 10px;
}
</style>
