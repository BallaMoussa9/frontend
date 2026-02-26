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
            📥 Tout exporter (ZIP/PDF)
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
/* STRUCTURE GÉNÉRALE */
.rapports-page { padding: 30px; background: #f4f7fa; min-height: 100vh; }
.title { color: #1a2b4b; font-size: 2rem; margin-bottom: 30px; font-weight: 800; }
.section { background: white; border-radius: 16px; padding: 25px; margin-bottom: 25px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }

/* FORMULAIRE DESIGN */
.grid-form { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.full-width { grid-column: span 2; }
.form-group label { display: block; font-weight: 600; margin-bottom: 8px; color: #4a5568; }
input, select, textarea { 
  width: 100%; padding: 12px; border: 2px solid #edf2f7; border-radius: 10px; font-size: 14px; transition: 0.3s;
}
input:focus { border-color: #0040d0; box-shadow: 0 0 0 4px rgba(0,64,208,0.1); outline: none; }

/* RECHERCHE PATIENT */
.patient-search-wrapper { position: relative; }
.dropdown-results { 
  position: absolute; top: 100%; left: 0; right: 0; background: white; 
  border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 100; max-height: 200px; overflow-y: auto;
}
.dropdown-results li { padding: 12px; cursor: pointer; border-bottom: 1px solid #f7fafc; display: flex; justify-content: space-between; }
.dropdown-results li:hover { background: #f0f7ff; }
.selected-pill { background: #e0eaff; color: #0040d0; padding: 8px 15px; border-radius: 20px; margin-top: 10px; display: inline-block; font-size: 13px; }

/* TABLEAU MODERNE */
.table-container { overflow-x: auto; }
.modern-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
.modern-table th { text-align: left; padding: 15px; background: #f8fafc; color: #718096; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
.modern-table td { padding: 15px; border-bottom: 1px solid #edf2f7; }
.date-cell { color: #a0aec0; font-size: 13px; }
.bold { font-weight: 700; color: #2d3748; }

/* BADGES ET BOUTONS */
.badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
.consultation { background: #e0f2fe; color: #0369a1; }
.hopitalisation { background: #fef3c7; color: #92400e; }
.btn-primary { background: #0040d0; color: white; padding: 12px 25px; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.3s; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,64,208,0.3); }

/* ALERTES */
.alert { padding: 15px; border-radius: 12px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; font-weight: 600; }
.alert-error { background: #fff5f5; color: #c53030; border: 1px solid #feb2b2; }
.alert-success { background: #f0fff4; color: #2f855a; border: 1px solid #9ae6b4; }

/* MODAL */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: white; padding: 30px; border-radius: 20px; text-align: center; max-width: 400px; }
.modal-buttons { display: flex; gap: 10px; justify-content: center; margin-top: 20px; }
.btn-danger { background: #e53e3e; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }

/* ANIMATIONS */
.fade-enter-active, .fade-leave-active { transition: all 0.4s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-10px); }

.loader { width: 16px; height: 16px; border: 2px solid white; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; margin-right: 8px; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>