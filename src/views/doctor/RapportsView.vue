<template>
  <MedecinLayout>
    <div class="rapports-page">
      <h1 class="title">Gestion des rapports médicaux</h1>

      <transition-group name="fade">
        <div v-if="reportStore.error" key="err" class="alert alert-error">
          <span class="alert-icon">⚠️</span> {{ reportStore.error }}
        </div>
        <div v-if="reportStore.success" key="succ" class="alert alert-success">
          <span class="alert-icon">✅</span> {{ reportStore.success }}
        </div>
      </transition-group>
      
      <section class="section create-section">
        <div class="section-title-group">
          <span class="step-badge">1</span>
          <h2>Créer un nouveau rapport</h2>
        </div>

        <form @submit.prevent="ajouterRapport" class="grid-form">
          <div class="form-group">
            <label for="report_type">Type de rapport *</label>
            <select id="report_type" v-model="nouveauRapport.report_type" required>
              <option value="consultation">Consultation</option>
              <option value="hopitalisation">Hospitalisation</option>
              <option value="laboratoire">Laboratoire/Analyses</option>
            </select>
          </div>

          <div class="form-group">
            <label for="title">Titre du rapport *</label>
            <input id="title" type="text" v-model="nouveauRapport.title" placeholder="Ex: Bilan annuel, Rapport post-opératoire..." required />
          </div>

          <div class="form-group full-width">
            <label for="patientSearch">Rechercher le Patient *</label>
            <div class="patient-search-wrapper">
              <input
                id="patientSearch"
                type="text"
                placeholder="Entrez le nom ou l'ID du patient..."
                v-model="searchPatientQuery"
                @focus="showSearchResults = true"
                @blur="handleBlur"
                autocomplete="off"
              />
              <div v-if="patientStore.loading" class="spinner-inline"></div>
              
              <ul v-if="showSearchResults && filteredPatients.length" class="dropdown-results">
                <li
                  v-for="patient in filteredPatients"
                  :key="patient.id"
                  @mousedown.prevent="selectPatient(patient)"
                >
                  <strong>{{ patient.user?.last_name }} {{ patient.user?.first_name }}</strong>
                  <span class="id-tag">#{{ patient.id }}</span>
                </li>
              </ul>
            </div>
            <p v-if="selectedPatient.id" class="selected-pill">
              👤 Patient : <strong>{{ selectedPatient.name }}</strong>
            </p>
          </div>

          <div class="form-group full-width">
            <label for="content">Observation médicale détaillée *</label>
            <textarea id="content" v-model="nouveauRapport.content" rows="5" placeholder="Saisissez vos notes ici..." required></textarea>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="reportStore.isLoading || !selectedPatient.id">
              <span v-if="reportStore.isLoading" class="loader"></span>
              {{ reportStore.isLoading ? 'Enregistrement...' : 'Enregistrer le rapport' }}
            </button>
          </div>
        </form>
      </section>

      <section class="section history-section">
        <div class="section-header">
          <div class="section-title-group">
            <span class="step-badge">2</span>
            <h2>Historique & Documents</h2>
          </div>
          <button 
            @click="exporterTousLesRapports" 
            class="btn-outline-success"
            :disabled="!reportStore.getMedicalReports.length"
          >
            📥 Tout exporter (WORD)
          </button>
        </div>

        <div class="stats-bar" v-if="reportStore.getMedicalReports.length">
          <div class="stat-item"><strong>{{ reportStore.getMedicalReports.length }}</strong> Rapports</div>
          <div class="stat-item"><strong>{{ rapportsAvecFichiers }}</strong> PDF Générés</div>
        </div>
        
        <div v-if="reportStore.isLoading && !reportStore.getMedicalReports.length" class="empty-msg">
          <div class="loader-large"></div>Chargement des données...
        </div>

        <div v-else-if="!reportStore.getMedicalReports.length" class="empty-msg">
          📭 Aucun rapport enregistré pour ce patient.
        </div>

        <div v-else class="table-container">
          <table class="modern-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Titre</th>
                <th>Patient</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in reportStore.getMedicalReports" :key="r.id">
                <td class="date-cell">{{ new Date(r.created_at).toLocaleDateString('fr-FR') }}</td>
                <td><span class="badge" :class="r.report_type">{{ r.report_type }}</span></td>
                <td class="bold">{{ r.title }}</td>
                <td>{{ r.patient?.user?.last_name }}</td>
                <td class="actions">
                  <button @click="exporterRapport(r.id)" class="btn-icon" title="Télécharger PDF">
                    <span v-if="currentExportingReport === r.id" class="loader-sm"></span>
                    <span v-else>📄</span>
                  </button>
                  <button @click="supprimerRapport(r.id)" class="btn-icon btn-del" title="Supprimer">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div v-if="showDeleteModal" class="modal-backdrop">
        <div class="modal">
          <h3>Confirmation</h3>
          <p>Supprimer le rapport <strong>"{{ rapportASupprimer?.title }}"</strong> ?</p>
          <div class="modal-buttons">
            <button @click="confirmerSuppression" class="btn-danger">Confirmer</button>
            <button @click="showDeleteModal = false" class="btn-cancel">Annuler</button>
          </div>
        </div>
      </div>
    </div>
  </MedecinLayout>
</template>

<script setup>
import MedecinLayout from '@/layouts/MedecinLayout.vue'
import { ref, onMounted, computed, watch } from 'vue'
import { usePatientStore } from '@/stores/patientStore'
import { useMedicalReportStore } from '@/stores/medicalreportStore'
import { useRoute } from 'vue-router'

const patientStore = usePatientStore()
const reportStore = useMedicalReportStore()
const route = useRoute()

// --- STATES ---
const currentDoctorId = ref(null)
const currentExportingReport = ref(null)
const selectedPatient = ref({ id: null, name: '' })
const searchPatientQuery = ref('')
const showSearchResults = ref(false)
const showDeleteModal = ref(false)
const rapportASupprimer = ref(null)

const nouveauRapport = ref({
  report_type: 'consultation',
  title: '',
  content: '',
})

// --- COMPUTED ---
const currentUrlDoctorId = computed(() => {
  const id = route.params.doctorId || route.params.id;
  return id ? parseInt(id, 10) : null;
})

const rapportsAvecFichiers = computed(() => reportStore.getMedicalReports.filter(r => r.file_path).length)

const filteredPatients = computed(() => {
  const source = patientStore.patients?.data || patientStore.patients || []
  const query = searchPatientQuery.value.toLowerCase()
  if (!query) return source.slice(0, 10)
  return source.filter(p => 
    p.user?.last_name?.toLowerCase().includes(query) || 
    p.user?.first_name?.toLowerCase().includes(query) ||
    String(p.id).includes(query)
  )
})

// --- WATCHERS ---
watch(() => [currentDoctorId.value, selectedPatient.value.id], ([docId, patId]) => {
  if (docId && patId) {
    reportStore.fetchMedicalReportsForDoctorPatient(docId, patId)
  }
})

// --- METHODS ---
function selectPatient(patient) {
  selectedPatient.value = {
    id: patient.id,
    name: `${patient.user?.last_name} ${patient.user?.first_name}`
  }
  searchPatientQuery.value = selectedPatient.value.name
  showSearchResults.value = false
}

function handleBlur() {
  setTimeout(() => { showSearchResults.value = false }, 200)
}

async function ajouterRapport() {
  if (!currentDoctorId.value || !selectedPatient.value.id) return
  
  const success = await reportStore.createMedicalReportForDoctorPatient(
    currentDoctorId.value,
    selectedPatient.value.id,
    { ...nouveauRapport.value }
  )

  if (success) {
    nouveauRapport.value = { report_type: 'consultation', title: '', content: '' }
  }
}

async function exporterRapport(id) {
  currentExportingReport.value = id
  await reportStore.downloadMedicalReport(id)
  currentExportingReport.value = null
}

function supprimerRapport(id) {
  rapportASupprimer.value = reportStore.getMedicalReports.find(r => r.id === id)
  showDeleteModal.value = true
}

async function confirmerSuppression() {
  await reportStore.deleteMedicalReport(rapportASupprimer.value.id)
  showDeleteModal.value = false
  // On rafraîchit la liste
  reportStore.fetchMedicalReportsForDoctorPatient(currentDoctorId.value, selectedPatient.value.id)
}

async function exporterTousLesRapports() {
  for (const r of reportStore.getMedicalReports) {
    await exporterRapport(r.id)
    await new Promise(res => setTimeout(res, 500)) // Pause pour le navigateur
  }
}

onMounted(() => {
  currentDoctorId.value = currentUrlDoctorId.value
  patientStore.allPatient()
})
</script>

<style scoped>
/* VARIABLES ET DESIGN GLASSMORPHISM */
.rapports-page {
  --primary: #2563eb;
  --primary-dark: #1e40af;
  --secondary: #10b981;
  --accent: #8b5cf6;
  --danger: #ef4444;
  --warning: #f59e0b;
  --success: #10b981;
  --gray: #6b7280;
  --light: #94a3b8;
  --shadow-lg: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 30px 60px -12px rgba(0, 0, 0, 0.5);
  --radius: 16px;
  
  font-family: 'Inter', sans-serif;
  padding: 2rem;
  margin: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  color: white;
  box-sizing: border-box;
  position: relative;
  overflow-x: hidden;
}

/* Animation de fond */
.rapports-page::before {
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

.rapports-page > * {
  position: relative;
  z-index: 1;
}

/* HEADER */
.title {
  font-size: 2.2rem;
  font-weight: 900;
  color: white;
  margin-bottom: 2.5rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  animation: slideDown 0.6s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* SECTIONS GLASSMORPHISM */
.section {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border-radius: var(--radius);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-lg);
  padding: 2rem;
  margin-bottom: 2rem;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.8s ease-out;
}

.section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.section:hover::before {
  transform: scaleX(1);
}

.section:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* SECTION TITLES */
.section-title-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.step-badge {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 800;
  font-size: 1.2rem;
  box-shadow: 0 6px 15px rgba(37, 99, 235, 0.3);
}

.section h2 {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

/* FORMULAIRE DESIGN */
.grid-form { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.full-width { grid-column: span 2; }
.form-group label { 
  display: block; 
  font-weight: 600; 
  margin-bottom: 0.5rem; 
  color: white; 
  font-size: 0.9rem;
}

input, select, textarea { 
  width: 100%; 
  padding: 0.75rem; 
  border: 1px solid rgba(255, 255, 255, 0.2); 
  border-radius: 8px; 
  font-size: 1rem; 
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

input::placeholder, textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

input:focus, select:focus, textarea:focus { 
  border-color: var(--primary); 
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2); 
  outline: none;
  background: rgba(255, 255, 255, 0.15);
}

select option {
  background: #1e293b;
  color: white;
}

/* RECHERCHE PATIENT */
.patient-search-wrapper { position: relative; }
.dropdown-results { 
  position: absolute; 
  top: 100%; 
  left: 0; 
  right: 0; 
  background: rgba(30, 41, 59, 0.95); 
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px; 
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4); 
  z-index: 100; 
  max-height: 200px; 
  overflow-y: auto;
  margin-top: 0.5rem;
}

.dropdown-results li { 
  padding: 0.75rem; 
  cursor: pointer; 
  border-bottom: 1px solid rgba(255, 255, 255, 0.15); 
  display: flex; 
  justify-content: space-between; 
  color: white;
  transition: all 0.3s ease;
}

.dropdown-results li:hover { 
  background: rgba(37, 99, 235, 0.2); 
  border-color: rgba(37, 99, 235, 0.3);
}

.selected-pill { 
  background: rgba(16, 185, 129, 0.1); 
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #86efac; 
  padding: 0.5rem 1rem; 
  border-radius: 20px; 
  margin-top: 0.5rem; 
  display: inline-block; 
  font-size: 0.9rem;
}

/* TABLEAU MODERNE */
.table-container { overflow-x: auto; border-radius: 12px; background: rgba(255, 255, 255, 0.05); }
.modern-table { width: 100%; border-collapse: collapse; }
.modern-table th { 
  text-align: left; 
  padding: 1rem; 
  background: rgba(255, 255, 255, 0.1); 
  color: white; 
  font-size: 0.9rem; 
  text-transform: uppercase; 
  letter-spacing: 1px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.modern-table td { 
  padding: 1rem; 
  border-bottom: 1px solid rgba(255, 255, 255, 0.05); 
  color: white;
}
.modern-table tr:hover {
  background: rgba(255, 255, 255, 0.05);
}

.date-cell { color: rgba(255, 255, 255, 0.7); font-size: 0.9rem; }
.bold { font-weight: 700; color: white; }

/* BADGES ET BOUTONS */
.badge { 
  padding: 0.25rem 0.75rem; 
  border-radius: 12px; 
  font-size: 0.8rem; 
  font-weight: 600; 
  text-transform: uppercase;
}

.consultation { 
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(37, 99, 235, 0.3) 100%);
  color: #93c5fd; 
  border: 1px solid rgba(37, 99, 235, 0.3);
}

.hopitalisation { 
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.3) 100%);
  color: #fcd34d; 
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.laboratoire { 
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.3) 100%);
  color: #86efac; 
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.btn-primary { 
  background: linear-gradient(135deg, var(--primary), var(--secondary)); 
  color: white; 
  padding: 0.75rem 1.5rem; 
  border: none; 
  border-radius: 8px; 
  font-weight: 700; 
  cursor: pointer; 
  transition: all 0.3s; 
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
}

.btn-primary:hover { 
  transform: translateY(-2px); 
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.5);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-outline-success {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #86efac;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-outline-success:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.2);
  transform: translateY(-2px);
}

.btn-icon {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.btn-del:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
}

/* ALERTES */
.alert { 
  padding: 1rem 1.5rem; 
  border-radius: 12px; 
  margin-bottom: 1.5rem; 
  display: flex; 
  align-items: center; 
  gap: 0.75rem; 
  font-weight: 600;
  backdrop-filter: blur(20px);
}

.alert-error { 
  background: rgba(239, 68, 68, 0.1); 
  border: 1px solid rgba(239, 68, 68, 0.3); 
  color: #fca5a5; 
}

.alert-success { 
  background: rgba(16, 185, 129, 0.1); 
  border: 1px solid rgba(16, 185, 129, 0.3); 
  color: #86efac; 
}

/* MODAL */
.modal-backdrop { 
  position: fixed; 
  inset: 0; 
  background: rgba(0, 0, 0, 0.8); 
  backdrop-filter: blur(8px);
  display: flex; 
  align-items: center; 
  justify-content: center; 
  z-index: 1000; 
}

.modal { 
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 2rem; 
  border-radius: 20px; 
  text-align: center; 
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  color: white;
}

.modal h3 {
  color: white;
  margin-bottom: 1rem;
}

.modal p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1.5rem;
}

.modal-buttons { 
  display: flex; 
  gap: 1rem; 
  justify-content: center; 
}

.btn-danger { 
  background: linear-gradient(135deg, var(--danger), #dc2626); 
  color: white; 
  border: none; 
  padding: 0.75rem 1.5rem; 
  border-radius: 8px; 
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* STATS BAR */
.stats-bar {
  display: flex;
  gap: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.stat-item {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.stat-item strong {
  color: white;
  font-weight: 700;
}

/* EMPTY STATE */
.empty-msg {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
}

.loader-large {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

/* ANIMATIONS */
.fade-enter-active, .fade-leave-active { transition: all 0.4s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-10px); }

.loader { 
  width: 16px; 
  height: 16px; 
  border: 2px solid rgba(255, 255, 255, 0.3); 
  border-top-color: white; 
  border-radius: 50%; 
  animation: spin 0.8s linear infinite; 
  display: inline-block; 
  margin-right: 8px; 
}

@keyframes spin { to { transform: rotate(360deg); } }

/* RESPONSIVE */
@media (max-width: 768px) {
  .rapports-page {
    padding: 1rem;
  }
  
  .grid-form {
    grid-template-columns: 1fr;
  }
  
  .full-width {
    grid-column: span 1;
  }
  
  .modern-table {
    font-size: 0.8rem;
  }
  
  .modern-table th,
  .modern-table td {
    padding: 0.5rem;
  }
  
  .modal {
    width: 95%;
    margin: 1rem;
  }
  
  .modal-buttons {
    flex-direction: column;
  }
}
</style>