<template>
  <LabLayout>
    <div class="result-upload-page">
      <h2 class="page-title">📤 Envoi des Résultats d’Analyse</h2>

      <form @submit.prevent="submitForm" class="form-container" enctype="multipart/form-data">
        <!-- Sélection de la demande -->
        <div class="form-group">
          <label for="request">Demande d’analyse</label>
          <select v-model="form.request_id" required>
            <option disabled value="">Sélectionnez une demande</option>
            <option v-for="req in pendingRequests" :key="req.id" :value="req.id">
              {{ req.patient_name }} - {{ req.test_type }} ({{ req.date }})
            </option>
          </select>
        </div>

        <!-- Résultat texte -->
        <div class="form-group">
          <label for="result_text">Interprétation (résumé)</label>
          <textarea v-model="form.result_text" rows="4" placeholder="Saisie du résultat..."></textarea>
        </div>

        <!-- Fichier PDF -->
        <div class="form-group">
          <label for="result_file">Fichier PDF du résultat</label>
          <input type="file" @change="handleFile" accept=".pdf" required />
        </div>

        <button type="submit" class="submit-btn">✅ Envoyer le résultat</button>
      </form>
    </div>
  </LabLayout>
</template>

<script setup>
import LabLayout from '@/layouts/LabLayout.vue'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const pendingRequests = ref([])

const form = ref({
  request_id: '',
  result_text: '',
  result_file: null,
})

// Charger les demandes d’analyse en attente
const fetchRequests = async () => {
  try {
    const res = await axios.get('/api/lab/pending-requests')
    pendingRequests.value = res.data.data
  } catch (err) {
    console.error('Erreur chargement des demandes :', err)
  }
}

const handleFile = (e) => {
  form.value.result_file = e.target.files[0]
}

const submitForm = async () => {
  const formData = new FormData()
  formData.append('request_id', form.value.request_id)
  formData.append('result_text', form.value.result_text)
  formData.append('result_file', form.value.result_file)

  try {
    await axios.post('/api/lab/resultats', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    alert('✅ Résultat envoyé avec succès')
    router.push('/lab/dashboard')
  } catch (err) {
    console.error('Erreur envoi résultat :', err)
    alert('❌ Une erreur est survenue.')
  }
}

onMounted(() => {
  fetchRequests()
})
</script>

<style scoped>
.result-upload-page {
  max-width: 750px;
  margin: auto;
  padding: 32px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.06);
}

.page-title {
  font-size: 24px;
  color: #0040d0;
  margin-bottom: 24px;
  text-align: center;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 600;
  margin-bottom: 6px;
}

input,
select,
textarea {
  padding: 10px;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  font-size: 14px;
}

.submit-btn {
  background-color: #0040d0;
  color: white;
  font-weight: bold;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover {
  background-color: #002fa0;
}
</style>
