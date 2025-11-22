<template>
  <MedecinLayout>
    <div class="rapports-page">
      <h1 class="title">Gestion des rapports médicaux</h1>

      <!-- Messages d'alerte -->
      <div v-if="reportStore.error" class="alert-error">
        <span class="alert-icon">⚠️</span>
        {{ reportStore.error }}
      </div>
      <div v-if="reportStore.success" class="alert-success">
        <span class="alert-icon">✅</span>
        {{ reportStore.success }}
      </div>
      <div v-if="patientStore.error" class="alert-error">
        <span class="alert-icon">⚠️</span>
        {{ patientStore.error }}
      </div> 
      
      <!-- Section création de rapport -->
      <section class="section">
        <h2>Créer un nouveau rapport</h2>
        <form @submit.prevent="ajouterRapport">
          <label for="report_type">Type de rapport *</label>
          <select id="report_type" v-model="nouveauRapport.report_type" required>
            <option disabled value="">-- Sélectionnez --</option>
            <option value="consultation">Consultation</option>
            <option value="hopitalisation">Hospitalisation</option>
            <option value="laboratoire">Laboratoire/Analyses</option>
          </select>

          <label for="title">Titre du rapport *</label>
          <input id="title" type="text" v-model="nouveauRapport.title" required />

          <label for="patientSearch">Rechercher/Sélectionner le Patient *</label>
          <div class="patient-search-container">
            <input
              id="patientSearch"
              type="text"
              placeholder="Nom, prénom ou email du patient..."
              v-model="searchPatientQuery"
              @focus="showSearchResults = true"
              @blur="handleBlur"
            />
            <div v-if="patientStore.loading" class="loading-indicator">Chargement des patients...</div> 
            <ul v-if="showSearchResults && filteredPatients.length" class="search-results-list"> 
              <li
                v-for="patient in filteredPatients"
                :key="patient.id"
                @mousedown.prevent="selectPatient(patient)"
              >
                {{ patient.user ? `${patient.user.first_name} ${patient.user.last_name}` : 'Nom inconnu' }}
              </li>
            </ul>
            <p v-if="!patientStore.loading && searchPatientQuery.length >=3 && !filteredPatients.length && showSearchResults">
                Aucun patient trouvé pour "{{ searchPatientQuery }}".
            </p>
          </div>

          <p v-if="selectedPatient.id" class="selected-patient">
            <strong>👤 Patient sélectionné:</strong> {{ selectedPatient.name }}
          </p>

          <label for="content">Contenu du rapport *</label>
          <textarea id="content" v-model="nouveauRapport.content" rows="6" required></textarea>

          <button type="submit" class="btn-submit" :disabled="reportStore.isLoading || !selectedPatient.id || !currentDoctorId">
            <span v-if="reportStore.isLoading" class="button-loading">⏳</span>
            {{ reportStore.isLoading ? 'Création...' : 'Créer le rapport' }}
          </button>
        </form>
      </section>

      <!-- Section historique des rapports -->
      <section class="section">
        <div class="section-header">
          <h2>📋 Historique des rapports</h2>
          <div class="export-controls">
            <button 
              @click="exporterTousLesRapports" 
              class="btn-export-all"
              :disabled="reportStore.isLoading || reportStore.getMedicalReports.length === 0"
              title="Exporter tous les rapports disponibles"
            >
              📥 Exporter tous les rapports
            </button>
            <button 
              @click="testerConnexion" 
              class="btn-debug"
              title="Tester la connexion"
              v-if="showDebug"
            >
              🐛 Debug
            </button>
          </div>
        </div>
        
        <!-- États de chargement et vides -->
        <div v-if="reportStore.isLoading && reportStore.getMedicalReports.length === 0" class="loading-indicator">
          ⏳ Chargement des rapports...
        </div>
        <div v-else-if="reportStore.getMedicalReports.length === 0" class="empty-state">
          📝 Aucun rapport trouvé pour le moment.
        </div>

        <!-- Tableau des rapports -->
        <table v-else class="rapport-table">
          <thead>
            <tr>
              <th>📅 Date</th>
              <th># ID</th>
              <th>📊 Type</th>
              <th>📄 Titre</th>
              <th>👤 Patient</th>
              <th>⚡ Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in reportStore.getMedicalReports" :key="r.id" :class="{'no-file': !r.file_path}">
              <td>{{ new Date(r.created_at).toLocaleDateString('fr-FR') }}</td>
              <td><strong>{{ r.id }}</strong></td>
              <td>
                <span class="report-type" :class="r.report_type">
                  {{ getReportTypeLabel(r.report_type) }}
                </span>
              </td>
              <td class="title-cell">
                {{ r.title }}
                <span v-if="!r.file_path" class="file-indicator no-file" title="Rapport sans document associé">
                  📝
                </span>
                <span v-else class="file-indicator has-file" title="Document disponible">
                  📎
                </span>
              </td>
              <td>{{ r.patient?.user?.first_name }} {{ r.patient?.user?.last_name }}</td>
              <td class="actions-cell">
                <button 
                  @click="exporterRapport(r.id)" 
                  class="btn-export"
                  :disabled="reportStore.isLoading"
                  :title="getExportButtonTitle(r)"
                >
                  <span v-if="reportStore.isLoading && currentExportingReport === r.id" class="button-loading">⏳</span>
                  <span v-else>📄</span>
                  Télécharger
                </button>
                <button 
                  @click="supprimerRapport(r.id)" 
                  class="btn-delete"
                  :disabled="reportStore.isLoading"
                  title="Supprimer ce rapport"
                >
                  🗑️ Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Statistiques -->
        <div v-if="reportStore.getMedicalReports.length > 0" class="stats-section">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">{{ reportStore.getMedicalReports.length }}</div>
              <div class="stat-label">Total rapports</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ rapportsAvecFichiers }}</div>
              <div class="stat-label">Avec documents</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ rapportsSansFichiers }}</div>
              <div class="stat-label">Sans documents</div>
            </div>
          </div>
        </div>

        <!-- Modal de confirmation de suppression -->
        <div v-if="showDeleteModal" class="modal-overlay">
          <div class="modal-content">
            <h3>🗑️ Confirmer la suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer le rapport <strong>"{{ rapportASupprimer?.title }}"</strong> ?</p>
            <p class="modal-warning">Cette action est irréversible.</p>
            <div class="modal-actions">
              <button @click="confirmerSuppression" class="btn-confirm-delete">
                ✅ Oui, supprimer
              </button>
              <button @click="annulerSuppression" class="btn-cancel">
                ❌ Annuler
              </button>
            </div>
          </div>
        </div>
      </section>
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

// --- État Local ---
const currentDoctorId = ref(null)
const currentExportingReport = ref(null)

const selectedPatient = ref({ id: null, name: '' })
const searchPatientQuery = ref('')
const showSearchResults = ref(false)
const blurTimeout = ref(null)
const showDebug = ref(import.meta.env.DEV) // Debug seulement en développement

// États pour la suppression
const showDeleteModal = ref(false)
const rapportASupprimer = ref(null)

const nouveauRapport = ref({
  report_type: 'consultation',
  title: '',
  content: '',
})

// --- Computed & Watchers ---

const urlDoctorId = computed(() => {
    const id = route.params.doctorId || route.params.id;
    return id ? parseInt(id, 10) : null;
})

// Statistiques
const rapportsAvecFichiers = computed(() => {
  return reportStore.getMedicalReports.filter(r => r.file_path).length
})

const rapportsSansFichiers = computed(() => {
  return reportStore.getMedicalReports.filter(r => !r.file_path).length
})

// Watch pour charger les rapports quand docteur/patient changent
watch(() => [currentDoctorId.value, selectedPatient.value.id], ([newDoctorId, newPatientId]) => {
    if (newDoctorId && newPatientId) {
        console.log(`🔄 Chargement des rapports pour Docteur ${newDoctorId} et Patient ${newPatientId}`)
        reportStore.fetchMedicalReportsForDoctorPatient(newDoctorId, newPatientId)
    } else if (newDoctorId && !newPatientId) {
        console.log(`ℹ️ Docteur ${newDoctorId} sélectionné, mais aucun patient. Vider les rapports.`)
        reportStore.medicalReports = []
    } else {
        reportStore.medicalReports = []
    }
}, { immediate: true })

// Liste des patients pour la recherche
const rawPatients = computed(() => {
    let patientsSource = patientStore.patients
    if (patientsSource && typeof patientsSource === 'object' && Array.isArray(patientsSource.data)) {
        return patientsSource.data
    }
    const result = Array.isArray(patientsSource) ? patientsSource : []
    return result
})

// Filtrage local des patients
const filteredPatients = computed(() => {
    const patients = rawPatients.value
    const query = searchPatientQuery.value.trim().toLowerCase()

    if (!query) {
        return patients.length > 50 ? patients.slice(0, 50) : patients
    }
    
    return patients.filter(p => {
        if (!p || !p.user) return false
        const fullName = `${p.user.first_name || ''} ${p.user.last_name || ''}`.toLowerCase()
        const email = (p.user.email || '').toLowerCase()
        const patientId = String(p.id)

        return (
            fullName.includes(query) ||
            email.includes(query) ||
            patientId.includes(query)
        )
    })
})

// --- Méthodes utilitaires ---

function getReportTypeLabel(type) {
  const types = {
    'consultation': 'Consultation',
    'hopitalisation': 'Hospitalisation',
    'laboratoire': 'Laboratoire'
  }
  return types[type] || type
}

function getExportButtonTitle(report) {
  if (!report.file_path) {
    return 'Rapport sans document associé'
  }
  return `Télécharger: ${report.title}`
}

// --- Logique de sélection de patient ---

function selectPatient(patient) {
  if (blurTimeout.value) {
    clearTimeout(blurTimeout.value)
    blurTimeout.value = null
  }

  selectedPatient.value = {
    id: patient.id,
    name: `${patient.user?.first_name || ''} ${patient.user?.last_name || ''}`,
  }
  searchPatientQuery.value = selectedPatient.value.name
  showSearchResults.value = false
  console.log("✅ Patient sélectionné:", selectedPatient.value)
}

function handleBlur() {
  blurTimeout.value = setTimeout(() => {
    showSearchResults.value = false
  }, 150)
}

// --- Logique de création de rapport ---

async function ajouterRapport() {
  if (!currentDoctorId.value || !selectedPatient.value.id) {
    reportStore.setError("❌ Erreur : ID Docteur non trouvé ou Patient non sélectionné.")
    return
  }

  const payload = {
    report_type: nouveauRapport.value.report_type,
    title: nouveauRapport.value.title,
    content: nouveauRapport.value.content,
  }

  try {
    await reportStore.createMedicalReportForDoctorPatient(
      currentDoctorId.value,
      selectedPatient.value.id,
      payload
    )

    // Réinitialiser le formulaire
    nouveauRapport.value = { report_type: 'consultation', title: '', content: '' }
    console.log("✅ Rapport créé avec succès")
    
  } catch (error) {
    console.error("❌ Échec de l'ajout du rapport:", error)
  }
}

// --- Exportation des rapports ---

async function exporterRapport(reportId) {
  currentExportingReport.value = reportId
  try {
    console.log(`🔄 Tentative d'exportation du rapport ID: ${reportId}`)
    await reportStore.downloadMedicalReport(reportId)
    console.log(`✅ Rapport ${reportId} exporté avec succès`)
  } catch (error) {
    console.error(`❌ Erreur lors de l'exportation du rapport ${reportId}:`, error)
    // Le message d'erreur est déjà géré par le store
  } finally {
    currentExportingReport.value = null
  }
}

async function exporterTousLesRapports() {
  if (reportStore.getMedicalReports.length === 0) {
    reportStore.setError("📝 Aucun rapport à exporter.")
    return
  }

  const rapportsAExporter = reportStore.getMedicalReports.filter(r => r.file_path)
  
  if (rapportsAExporter.length === 0) {
    reportStore.setError("📝 Aucun rapport avec document disponible à exporter.")
    return
  }

  try {
    let successCount = 0
    let errorCount = 0
    
    for (const rapport of rapportsAExporter) {
      try {
        console.log(`📤 Exportation du rapport: ${rapport.id} - ${rapport.title}`)
        await exporterRapport(rapport.id)
        successCount++
        
        // Petite pause pour éviter de surcharger le navigateur
        await new Promise(resolve => setTimeout(resolve, 300))
      } catch (error) {
        console.error(`❌ Échec exportation rapport ${rapport.id}:`, error)
        errorCount++
      }
    }
    
    if (errorCount === 0) {
      reportStore.setSuccess(`✅ Tous les rapports (${successCount}) exportés avec succès.`)
    } else {
      reportStore.setError(`📊 ${successCount} rapports exportés, ${errorCount} échecs.`)
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'exportation de tous les rapports:", error)
    reportStore.setError("❌ Erreur lors de l'exportation groupée")
  }
}

// --- Gestion de la suppression ---

function supprimerRapport(reportId) {
  const rapport = reportStore.getMedicalReports.find(r => r.id === reportId)
  if (rapport) {
    rapportASupprimer.value = rapport
    showDeleteModal.value = true
  }
}

async function confirmerSuppression() {
  if (!rapportASupprimer.value) return

  try {
    await reportStore.deleteMedicalReport(rapportASupprimer.value.id)
    
    // Recharger la liste après suppression
    if (currentDoctorId.value && selectedPatient.value.id) {
      await reportStore.fetchMedicalReportsForDoctorPatient(
        currentDoctorId.value, 
        selectedPatient.value.id
      )
    }
    
    console.log(`✅ Rapport ${rapportASupprimer.value.id} supprimé avec succès`)
  } catch (error) {
    console.error("❌ Erreur lors de la suppression:", error)
  } finally {
    annulerSuppression()
  }
}

function annulerSuppression() {
  showDeleteModal.value = false
  rapportASupprimer.value = null
}

// --- Debug et utilitaires ---

async function testerConnexion() {
  if (reportStore.getMedicalReports.length === 0) {
    alert("Aucun rapport à tester")
    return
  }
  
  const premierRapport = reportStore.getMedicalReports[0]
  console.log("🔍 Diagnostic - Premier rapport:", premierRapport)
  console.log("🔍 URL qui sera appelée:", `/api/medicalreports/${premierRapport.id}/download`)
  console.log("🔍 A un fichier?:", premierRapport.file_path ? 'Oui' : 'Non')
}

// --- Initialisation ---

onMounted(() => {
    currentDoctorId.value = urlDoctorId.value

    if (!currentDoctorId.value) {
        reportStore.setError("❌ Erreur: L'ID du docteur n'a pas été trouvé dans l'URL.")
        console.error("❌ Erreur: L'ID du docteur est absent de la route.")
    } else {
        console.log("✅ ID Docteur extrait de l'URL:", currentDoctorId.value)
    }
    
    patientStore.allPatient()
})
</script>

<style scoped>
.rapports-page {
  padding: 32px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.title {
  font-size: 28px;
  color: #002580;
  margin-bottom: 24px;
  font-weight: 700;
}

.section {
  margin-top: 28px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.section-header h2 {
  color: #002580;
  margin: 0;
}

.export-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

label {
  display: block;
  margin-top: 16px;
  font-weight: 600;
  color: #495057;
}

select, textarea, input[type="text"] {
  width: 100%;
  padding: 12px;
  margin-top: 8px;
  border-radius: 8px;
  border: 2px solid #e9ecef;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

select:focus, textarea:focus, input[type="text"]:focus {
  outline: none;
  border-color: #002580;
  box-shadow: 0 0 0 3px rgba(0, 37, 128, 0.1);
}

.patient-search-container {
  position: relative;
}

.search-results-list {
  position: absolute;
  z-index: 10;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  border: 2px solid #e9ecef;
  background-color: white;
  list-style: none;
  padding: 0;
  margin-top: 0;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.search-results-list li {
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #f8f9fa;
  transition: background-color 0.2s ease;
}

.search-results-list li:hover {
  background-color: #f8f9fa;
}

.search-results-list li:last-child {
  border-bottom: none;
}

.selected-patient {
  background: #e7f3ff;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #002580;
  margin: 16px 0;
}

.btn-submit {
  margin-top: 20px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #002580, #0044cc);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 37, 128, 0.3);
}

.btn-submit:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.button-loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.btn-export-all {
  padding: 10px 16px;
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-export-all:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.btn-export-all:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-debug {
  padding: 8px 12px;
  background: #ffc107;
  color: #212529;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

.rapport-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.rapport-table th {
  background: linear-gradient(135deg, #002580, #0044cc);
  color: white;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  border: none;
}

.rapport-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

.rapport-table tr:last-child td {
  border-bottom: none;
}

.rapport-table tr:hover {
  background-color: #f8f9fa;
}

.rapport-table tr.no-file {
  background-color: #fff3cd;
}

.rapport-table tr.no-file:hover {
  background-color: #ffeaa7;
}

.report-type {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.report-type.consultation {
  background: #e7f3ff;
  color: #002580;
}

.report-type.hopitalisation {
  background: #fff3cd;
  color: #856404;
}

.report-type.laboratoire {
  background: #d1ecf1;
  color: #0c5460;
}

.title-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-indicator {
  font-size: 14px;
}

.file-indicator.no-file {
  color: #dc3545;
}

.file-indicator.has-file {
  color: #28a745;
}

.actions-cell {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn-export {
  padding: 8px 12px;
  background: linear-gradient(135deg, #17a2b8, #138496);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-export:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(23, 162, 184, 0.3);
}

.btn-export:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-delete {
  padding: 8px 12px;
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-delete:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}

.btn-delete:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Section statistiques */
.stats-section {
  margin-top: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.stat-card {
  background: white;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #002580;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6c757d;
  text-transform: uppercase;
  font-weight: 600;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 32px;
  border-radius: 12px;
  max-width: 450px;
  width: 90%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.modal-content h3 {
  margin-top: 0;
  color: #dc3545;
  margin-bottom: 16px;
}

.modal-warning {
  color: #856404;
  background: #fff3cd;
  padding: 8px 12px;
  border-radius: 4px;
  margin: 12px 0;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
}

.btn-confirm-delete {
  padding: 10px 20px;
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-confirm-delete:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.btn-cancel {
  padding: 10px 20px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

/* Alert Styles */
.alert-error, .alert-success {
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid transparent;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
  border-color: #f5c6cb;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border-color: #c3e6cb;
}

.alert-icon {
  font-size: 18px;
}

.loading-indicator, .empty-state {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-size: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .rapports-page {
    padding: 16px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .export-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .actions-cell {
    flex-direction: column;
    gap: 6px;
  }
  
  .rapport-table {
    font-size: 14px;
  }
  
  .rapport-table th, .rapport-table td {
    padding: 12px 8px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .btn-export, .btn-delete {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .rapport-table {
    display: block;
    overflow-x: auto;
  }
  
  .section {
    padding: 16px;
  }
}
</style>