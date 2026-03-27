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
              <div class="search-input-wrapper">
                <input type="text" v-model="searchQuery" @input="handleSearch" placeholder="Rechercher par nom..." class="search-input" />
                <button v-if="searchQuery" @click="clearSearch" class="clear-search-btn">
                  <X :size="18" />
                </button>
              </div>
              <div v-if="patientStore.searchResults.length > 0" class="search-results">
                <div v-for="patient in patientStore.searchResults" :key="patient.id" @click="onSelectPatient(patient)" class="result-item">
                  {{ patient.user?.first_name }} {{ patient.user?.last_name }}
                </div>
              </div>
            </div>

            <div v-if="selectedPatient" class="selected-banner">
              <strong>Patient :</strong> {{ selectedPatient.user?.first_name }} {{ selectedPatient.user?.last_name }}
              <button type="button" @click="resetSelection" class="btn-clear-patient">
                <X :size="16" />
              </button>
            </div>

            <div v-if="selectedPatient && !selectedRequest" style="margin-top: 20px;">
              <label>Analyses en attente pour ce patient :</label>
              <div class="requests-grid">
                <div v-for="req in patientRequests" :key="req.id" @click="selectAnalysis(req)" class="request-option">
                  <strong>{{ req.name || 'Analyse sans nom' }}</strong>
                  <div class="request-meta">
                    <p>Type : {{ req.type || 'N/A' }}</p>
                    <p class="request-date">
                      <i class="fas fa-calendar-alt"></i> Demandé le : {{ formatDate(req.created_at) }}
                    </p>
                  </div>
                  <p style="font-size: 10px; color: #94a3b8; margin-top: 8px;">ID : {{ req.id }}</p>
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
import { X } from 'lucide-vue-next'
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

const formatDate = (dateString) => {
  if (!dateString) return 'Date inconnue';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const addResultRow = () => form.results.push({ parameter: '', value: '', unit: '', reference: '' })
const removeResultRow = (index) => form.results.splice(index, 1)

onMounted(async () => {
  await labStore.listReadyAnalyses()
})

const patientRequests = computed(() => {
  if (!selectedPatient.value) return []
  const targetId = Number(selectedPatient.value.id)
  return labStore.readyAnalyses.filter(req => Number(req.patient_id) === targetId)
})

const handleSearch = async () => {
  if (searchQuery.value.length >= 3) await patientStore.searchPatients(searchQuery.value)
}

const clearSearch = () => {
  searchQuery.value = ''
  patientStore.searchResults = []
}

const onSelectPatient = (p) => { selectedPatient.value = p; searchQuery.value = '' }
const selectAnalysis = (req) => { selectedRequest.value = req }
const resetSelection = () => { selectedPatient.value = null; selectedRequest.value = null }

const submitForm = async () => {
  if (!selectedPatient.value || !selectedRequest.value) return;
  const formData = new FormData();
  formData.append('analyses_id', selectedRequest.value.id); 
  formData.append('patient_id', selectedPatient.value.id);
  formData.append('name', selectedRequest.value.name);
  formData.append('analyse_type', selectedRequest.value.type);
  formData.append('result_data_json', JSON.stringify(form.results));
  formData.append('comments', form.comments);
  formData.append('patient_name', `${selectedPatient.value.user.first_name} ${selectedPatient.value.user.last_name}`);

  const success = await labStore.uploadLabResults(selectedRequest.value.id, formData);
  if (success) resetSelection();
}
</script>

<style scoped>
/* === Variables CSS - Glassmorphism Lab === */
:root {
  --primary: #2563eb;
  --primary-dark: #1e40af;
  --primary-light: #3b82f6;
  --secondary: #10b981;
  --secondary-dark: #059669;
  --secondary-light: #34d399;
  --accent: #8b5cf6;
  --accent-light: #a78bfa;
  --success: #22c55e;
  --success-light: #4caf50;
  --warning: #f59e0b;
  --warning-light: #ffb300;
  --danger: #ef4444;
  --danger-light: #f44336;
  --info: #06b6d4;
  --info-light: #29b6f6;
  --dark: #0f172a;
  --darker: #0d47a1;
  --light: #ffffff;
  --gray: #94a3b8;
  --gray-light: #cbd5e1;
  --gray-dark: #64748b;
  --border: rgba(255, 255, 255, 0.2);
  --shadow: rgba(0, 0, 0, 0.1);
  --blur: blur(20px);
}

/* Page Wrapper */
.page-wrapper {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* Animation de fond */
.page-wrapper::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at top, rgba(37, 99, 235, 0.15) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.page-wrapper > * {
  position: relative;
  z-index: 1;
}

/* Form Card */
.form-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: var(--blur);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 50px var(--shadow);
  max-width: 1000px;
  width: 100%;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
}

.form-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
  z-index: 1;
}

.form-card:hover::before {
  transform: scaleX(1);
}

.form-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);
}

/* Form Header */
.form-header {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  padding: 3rem;
  color: white;
  position: relative;
  overflow: hidden;
}

.form-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

/* Styled Form */
.styled-form {
  padding: 3rem;
}

.form-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin: 0 0 1.5rem 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

/* Labels */
label {
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  display: block;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

/* Search Input Wrapper */
.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

/* Search Input */
.search-input {
  width: 100%;
  padding: 1rem 3rem 1rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: var(--blur);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  font-size: 1rem;
  color: white;
  transition: all 0.3s ease;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.1rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 20px rgba(37, 99, 235, 0.3);
}

/* Clear Search Button */
.clear-search-btn {
  position: absolute;
  right: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: var(--blur);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-search-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
  transform: scale(1.1);
}

.clear-search-btn:active {
  transform: scale(0.95);
}

/* Search Results */
.search-results {
  margin-top: 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: var(--blur);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  overflow: hidden;
  max-height: 200px;
  overflow-y: auto;
}

.result-item {
  padding: 1rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background: rgba(255, 255, 255, 0.1);
  padding-left: 1.5rem;
}

/* Selected Banner */
.selected-banner {
  background: rgba(34, 197, 94, 0.1);
  backdrop-filter: var(--blur);
  border: 1px solid rgba(34, 197, 94, 0.3);
  padding: 1.5rem;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.btn-clear-patient {
  background: rgba(239, 68, 68, 0.1);
  backdrop-filter: var(--blur);
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 0.4rem;
  border-radius: 8px;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-clear-patient:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
  transform: scale(1.1);
}

.btn-clear-patient:active {
  transform: scale(0.95);
}

/* Requests Grid */
.requests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.request-option {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: var(--blur);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.request-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
  z-index: 1;
}

.request-option:hover::before {
  transform: scaleX(1);
}

.request-option:hover {
  transform: translateY(-3px);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.request-option strong {
  display: block;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: white;
  font-weight: 600;
}

.request-meta {
  margin: 1rem 0;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.request-date {
  font-weight: 600;
  color: var(--primary);
  margin-top: 0.5rem;
}

/* Highlight Section */
.highlight-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: var(--blur);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.highlight-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--secondary), var(--primary));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
  z-index: 1;
}

.highlight-section:hover::before {
  transform: scaleX(1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

/* Result Row */
.result-row {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1fr 1.5fr 40px;
  gap: 1rem;
  margin-bottom: 1rem;
}

.result-row input {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: var(--blur);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: white;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.result-row input::placeholder {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
}

.result-row input:focus {
  outline: none;
  border-color: var(--primary);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 15px rgba(37, 99, 235, 0.3);
}

.text-area {
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: var(--blur);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.text-area::placeholder {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
}

.text-area:focus {
  outline: none;
  border-color: var(--primary);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 15px rgba(37, 99, 235, 0.3);
}

/* Buttons */
.btn-submit {
  width: 100%;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  padding: 1.25rem;
  border: none;
  border-radius: 16px;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
  position: relative;
  overflow: hidden;
}

.btn-submit::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.btn-submit:hover::before {
  left: 100%;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
}

.btn-delete {
  background: rgba(239, 68, 68, 0.1);
  backdrop-filter: var(--blur);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.75rem;
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: translateY(-2px);
}

.btn-add-param {
  background: linear-gradient(135deg, var(--secondary), var(--secondary-dark));
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.btn-add-param:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

/* Loader */
.loader-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: var(--blur);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .page-wrapper {
    padding: 1rem;
  }
  
  .form-header {
    padding: 2rem;
  }
  
  .styled-form {
    padding: 2rem;
  }
  
  .result-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .requests-grid {
    grid-template-columns: 1fr;
  }
}
</style>