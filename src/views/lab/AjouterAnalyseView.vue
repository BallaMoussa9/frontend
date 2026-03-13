<template>
  <LabLayout>
    <div class="page-wrapper">
      <div class="form-card">
        <div v-if="labStore.isLoading" class="loader-overlay">
          <div class="spinner"></div>
        </div>

        <header class="form-header">
          <h2 class="title">Saisie des Résultats d'Analyses</h2>
        </header>

        <form @submit.prevent="submitForm" class="styled-form">
          <section class="form-section">
            <h3 class="section-title">01. Sélection du Patient</h3>
            
            <div class="search-wrapper" v-if="!selectedPatient">
              <input type="text" v-model="searchQuery" @input="handleSearch" placeholder="Rechercher par nom..." class="search-input" />
              <div v-if="patientStore.searchResults.length > 0" class="search-results">
                <div v-for="patient in patientStore.searchResults" :key="patient.id" @click="onSelectPatient(patient)" class="result-item">
                  {{ patient.user?.first_name }} {{ patient.user?.last_name }}
                </div>
              </div>
            </div>

            <div v-if="selectedPatient" class="selected-banner">
              <strong>Patient :</strong> {{ selectedPatient.user?.first_name }} {{ selectedPatient.user?.last_name }}
              <button type="button" @click="resetSelection" class="btn-change">Changer</button>
            </div>

            <div v-if="selectedPatient && !selectedRequest" style="margin-top: 20px;">
              <label>Analyses en attente pour ce patient :</label>
              <div class="requests-grid">
                <div v-for="req in patientRequests" :key="req.id" @click="selectAnalysis(req)" class="request-option">
                  <strong>{{ req.name || 'Analyse sans nom' }}</strong>
                  <p style="font-size: 12px; color: #64748b;">Type : {{ req.type || 'N/A' }}</p>
                  <p style="font-size: 10px;">ID : {{ req.id }}</p>
                </div>
              </div>
            </div>
          </section>

          <section v-if="selectedRequest" class="form-section highlight-section">
            <div class="section-header">
              <h3 class="section-title">02. Paramètres : {{ selectedRequest.name }}</h3>
              <button type="button" @click="addResultRow" class="btn-add-param">+ Ajouter</button>
            </div>

            <div v-for="(row, index) in form.results" :key="index" class="result-row">
              <input v-model="row.parameter" placeholder="Paramètre" required />
              <input v-model="row.value" placeholder="Valeur" required />
              <input v-model="row.unit" placeholder="Unité" />
              <input v-model="row.reference" placeholder="Normes" />
              <button type="button" @click="removeResultRow(index)" class="btn-delete">✕</button>
            </div>

            <textarea v-model="form.comments" placeholder="Commentaires..." class="text-area" style="width: 100%; margin-top: 15px;"></textarea>
            
            <button type="submit" class="btn-submit" style="margin-top: 20px;">
              Valider les résultats pour {{ selectedRequest.name }}
            </button>
          </section>
        </form>
      </div>
    </div>
  </LabLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useLabStore } from '@/stores/labStore'
import { usePatientStore } from '@/stores/patientStore'
import LabLayout from '@/layouts/LabLayout.vue'

const labStore = useLabStore()
const patientStore = usePatientStore()

const searchQuery = ref('')
const selectedPatient = ref(null)
const selectedRequest = ref(null)

const form = reactive({
  comments: '',
  results: [{ parameter: '', value: '', unit: '', reference: '' }]
})

const addResultRow = () => form.results.push({ parameter: '', value: '', unit: '', reference: '' })
const removeResultRow = (index) => form.results.splice(index, 1)

onMounted(async () => {
  await labStore.listReadyAnalyses()
})

const patientRequests = computed(() => {
  if (!selectedPatient.value) return []
  const targetId = Number(selectedPatient.value.id)
  // Filtrage basé sur les colonnes réelles de ta table
  return labStore.readyAnalyses.filter(req => 
    Number(req.patient_id) === targetId
  )
})

const handleSearch = async () => {
  if (searchQuery.value.length >= 3) await patientStore.searchPatients(searchQuery.value)
}

const onSelectPatient = (p) => { selectedPatient.value = p; searchQuery.value = '' }
const selectAnalysis = (req) => { selectedRequest.value = req }
const resetSelection = () => { selectedPatient.value = null; selectedRequest.value = null }

const submitForm = async () => {
  if (!selectedPatient.value || !selectedRequest.value) return;
  
  // Construction explicite des données attendues par le Backend
  const formData = new FormData();
  
  // Correspondance avec les champs de ta table 'analyses_request'
  formData.append('analyses_id', selectedRequest.value.id); 
  formData.append('patient_id', selectedPatient.value.id);
  formData.append('name', selectedRequest.value.name); // Colonne 'name'
  formData.append('analyse_type', selectedRequest.value.type); // Colonne 'type'
  formData.append('result_data_json', JSON.stringify(form.results));
  formData.append('comments', form.comments);
  formData.append('patient_name', `${selectedPatient.value.user.first_name} ${selectedPatient.value.user.last_name}`);

  const success = await labStore.uploadLabResults(selectedRequest.value.id, formData);
  
  if (success) {
    // Le reset ici déclenchera automatiquement le rafraîchissement des autres templates
    // car ils écoutent les changements dans 'labStore.readyAnalyses'
    resetSelection();
  }
}
</script>
<style scoped>
/* Conserve tes styles originaux ici */
.requests-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-top: 16px; }
.request-option { padding: 20px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 16px; cursor: pointer; transition: all 0.3s; }
.request-option:hover { border-color: #0047e1; background: #eff6ff; }
.page-wrapper { font-family: 'Inter', sans-serif; background-color: #f8fafc; min-height: 100vh; padding: 40px 20px; display: flex; justify-content: center; }
.form-card { background: #ffffff; max-width: 1000px; width: 100%; border-radius: 24px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.04); overflow: hidden; position: relative; border: 1px solid #eef2f6; }
.form-header { background: linear-gradient(135deg, #0047e1 0%, #0035a9 100%); padding: 40px; color: white; }
.header-content { display: flex; align-items: center; gap: 24px; }
.icon-box { background: rgba(255, 255, 255, 0.15); width: 64px; height: 64px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 32px; backdrop-filter: blur(10px); }
.title { font-size: 26px; font-weight: 700; margin: 0; letter-spacing: -0.5px; }
.subtitle { opacity: 0.85; margin: 6px 0 0 0; font-size: 15px; }
.styled-form { padding: 40px; }
.form-section { margin-bottom: 48px; }
.section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.section-number { background: #f1f5f9; color: #64748b; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; }
.section-title { font-size: 18px; font-weight: 700; color: #1e293b; margin: 0; }
.search-box { position: relative; margin-bottom: 10px; }
.search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-input { width: 100%; padding: 16px 16px 16px 48px; border: 2px solid #f1f5f9; border-radius: 14px; font-size: 16px; transition: all 0.3s; }
.search-input:focus { border-color: #0047e1; background: white; box-shadow: 0 0 0 4px rgba(0, 71, 225, 0.1); outline: none; }
.search-results { background: white; border: 1px solid #e2e8f0; border-radius: 14px; box-shadow: 0 15px 30px rgba(0,0,0,0.08); max-height: 280px; overflow-y: auto; position: absolute; width: calc(100% - 80px); z-index: 100; }
.result-item { padding: 14px 20px; display: flex; align-items: center; gap: 16px; cursor: pointer; transition: background 0.2s; }
.result-item:hover { background: #f8fafc; }
.patient-avatar { width: 44px; height: 44px; background: #e0e7ff; color: #4338ca; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
.patient-name { display: block; font-weight: 600; color: #1e293b; }
.selected-banner { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px 24px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; }
.banner-info { display: flex; align-items: center; gap: 20px; }
.success-icon { width: 28px; height: 28px; background: #22c55e; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; }
.patient-name-val { font-size: 18px; font-weight: 700; color: #166534; margin: 0; }
.btn-change { background: white; border: 1px solid #dcfce7; padding: 8px 16px; border-radius: 10px; color: #15803d; font-weight: 600; cursor: pointer; }
.highlight-section { background: #fcfcfd; border: 1px solid #f1f5f9; border-radius: 20px; padding: 30px; }
.result-row { display: grid; grid-template-columns: 2fr 1.2fr 1fr 1.5fr 40px; gap: 12px; margin-bottom: 12px; }
.result-row input { width: 100%; padding: 12px 14px; border: 1px solid #e2e8f0; border-radius: 10px; background: white; font-size: 14px; }
.btn-delete { background: #fff1f2; color: #e11d48; border: none; width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.btn-submit { width: 100%; background: #0047e1; color: white; padding: 20px; border: none; border-radius: 16px; font-size: 18px; font-weight: 700; cursor: pointer; }
.btn-add-param { background: #e0e7ff; color: #4338ca; border: none; padding: 10px 18px; border-radius: 12px; font-weight: 600; font-size: 14px; cursor: pointer; }
.loader-overlay { position: absolute; inset: 0; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(4px); z-index: 1000; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.spinner { width: 60px; height: 60px; border: 4px solid #f1f5f9; border-top: 4px solid #0047e1; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>