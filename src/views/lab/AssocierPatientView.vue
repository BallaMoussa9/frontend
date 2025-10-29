<template>
  <LabLayout>
    <div class="associer-patient-page">
      <h2 class="page-title">🔗 Associer une Analyse à un Patient</h2>

      <form @submit.prevent="submitForm" class="form-container">
        <!-- Sélection du patient -->
        <div class="form-group">
          <label for="patient">Patient</label>
          <select v-model="form.patient_id" required>
            <option disabled value="">Choisir un patient</option>
            <option v-for="patient in patients" :key="patient.id" :value="patient.id">
              {{ patient.name }}
            </option>
          </select>
        </div>

        <!-- Type d’analyse -->
        <div class="form-group">
          <label for="test_type">Type d’analyse</label>
          <select v-model="form.test_type" required>
            <option disabled value="">Choisir un test</option>
            <option value="Hémogramme">Hémogramme</option>
            <option value="Glycémie">Glycémie</option>
            <option value="Bilan hépatique">Bilan hépatique</option>
            <option value="TSH">TSH</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        <!-- Date d’analyse -->
        <div class="form-group">
          <label for="date">Date de l’analyse</label>
          <input type="date" v-model="form.analysis_date" required />
        </div>

        <!-- Notes optionnelles -->
        <div class="form-group">
          <label for="notes">Notes supplémentaires</label>
          <textarea v-model="form.notes" rows="3" placeholder="Ex : patient sous traitement, à recontrôler dans 1 semaine..."></textarea>
        </div>

        <!-- Bouton -->
        <button type="submit" class="submit-btn">✅ Associer au patient</button>
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

const patients = ref([])

const form = ref({
  patient_id: '',
  test_type: '',
  analysis_date: '',
  notes: ''
})

// Charger les patients depuis l'API
const fetchPatients = async () => {
  try {
    const res = await axios.get('/api/patients')
    patients.value = res.data.data
  } catch (err) {
    console.error('Erreur chargement patients :', err)
  }
}

const submitForm = async () => {
  try {
    await axios.post('/api/lab/associer-analyse', form.value)
    alert('✅ Analyse associée au patient avec succès !')
    router.push('/lab/dashboard')
  } catch (err) {
    console.error('Erreur association :', err)
    alert('❌ Une erreur est survenue.')
  }
}

onMounted(() => {
  fetchPatients()
})
</script>

<style scoped>
.associer-patient-page {
  max-width: 700px;
  margin: auto;
  padding: 32px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
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
