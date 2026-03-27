<template>
  <MedecinLayout>
    <div class="lab-analysis-container">
      <!-- Header Section -->
      <div class="dashboard-header">
        <div class="header-content">
          <h1 class="page-title">
            🔬 Demandes d'Analyse
          </h1>
          <p class="page-subtitle">Gérez les prescriptions d'analyses médicales</p>
        </div>
        <div class="header-actions">
          <button class="action-btn primary" @click="openModal">
            <Plus :size="18" />
            Nouvelle Prescription
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon pulse">
            <Activity :size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ labStore.labRequests.length }}</div>
            <div class="stat-label">Total Demandes</div>
          </div>
        </div>
        
        <div class="stat-card pending">
          <div class="stat-icon pulse">
            <Clock :size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ pendingCount }}</div>
            <div class="stat-label">En attente</div>
          </div>
        </div>
        
        <div class="stat-card progress">
          <div class="stat-icon pulse">
            <Loader :size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ inProgressCount }}</div>
            <div class="stat-label">En cours</div>
          </div>
        </div>
      </div>

      <!-- Search Section -->
      <div class="search-section">
        <div class="search-card">
          <div class="search-input-wrapper">
            <Search :size="20" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher patient ou analyse..."
              class="search-input"
            />
          </div>
        </div>
      </div>

      <!-- Analysis Requests Table -->
      <div class="requests-section">
        <div class="section-header">
          <h2 class="section-title">Liste des Demandes</h2>
          <div class="section-actions">
            <span class="requests-count">{{ filteredRequests.length }} demandes</span>
          </div>
        </div>

        <div v-if="labStore.loading && !showModal" class="loading-state">
          <div class="loading-spinner">
            <Loader :size="32" />
          </div>
          <p>Chargement des demandes...</p>
        </div>

        <div v-else-if="filteredRequests.length === 0" class="empty-state">
          <div class="empty-icon">
            <Search :size="48" />
          </div>
          <h4>Aucune demande trouvée</h4>
          <p>Aucune demande ne correspond à votre recherche.</p>
        </div>

        <div v-else class="requests-table-container">
          <table class="requests-table">
            <thead>
              <tr>
                <th>Réf.</th>
                <th>Patient</th>
                <th>Analyses</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="req in paginatedRequests" :key="req.id" class="request-row">
                <td>
                  <span class="ref-badge">#{{ req.id }}</span>
                </td>
                <td>
                  <div class="patient-cell">
                    <div class="patient-avatar">{{ getPatientFullName(req.patient)?.charAt(0) }}</div>
                    <span class="patient-name">{{ getPatientFullName(req.patient) }}</span>
                  </div>
                </td>
                <td>
                  <div class="analysis-cell">
                    <span class="analysis-tag">{{ req.name }}</span>
                  </div>
                </td>
                <td>
                  <div class="date-cell">{{ formatDate(req.created_at) }}</div>
                </td>
                <td>
                  <span :class="['status-badge', getStatusClass(req.status)]">
                    <template v-if="req.status === 'pending'">
                      <Clock :size="12" />
                      En attente
                    </template>
                    <template v-else-if="req.status === 'in_progress'">
                      <Loader :size="12" />
                      En cours
                    </template>
                    <template v-else-if="req.status === 'completed'">
                      <CheckCircle :size="12" />
                      Terminé
                    </template>
                    <template v-else>{{ req.status }}</template>
                  </span>
                </td>
                <td>
                  <div class="actions-cell">
                    <button class="action-btn view-btn" title="Voir les détails" @click="viewDetails(req)">
                      <Eye :size="16" />
                    </button>
                    <button class="action-btn download-btn" title="Télécharger" @click="downloadRequest(req)">
                      <Download :size="16" />
                    </button>
                    <button class="action-btn edit-btn" title="Modifier" @click="editRequest(req)">
                      <Edit :size="16" />
                    </button>
                    <button class="action-btn delete-btn" title="Supprimer" @click="deleteRequest(req)">
                      <Trash2 :size="16" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination-container">
          <div class="pagination-info">
            <span>Affichage de {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, filteredRequests.length) }} sur {{ filteredRequests.length }} demandes</span>
          </div>
          <div class="pagination-controls">
            <select v-model="itemsPerPage" @change="changeItemsPerPage(itemsPerPage)" class="items-per-page">
              <option :value="5">5 par page</option>
              <option :value="10">10 par page</option>
              <option :value="20">20 par page</option>
              <option :value="50">50 par page</option>
            </select>
            <div class="pagination-buttons">
              <button @click="prevPage" :disabled="currentPage === 1" class="pagination-btn">
                <ChevronLeft :size="16" />
                Précédent
              </button>
              <div class="page-numbers">
                <button 
                  v-for="page in Math.min(totalPages, 5)" 
                  :key="page"
                  @click="goToPage(page)"
                  :class="['page-btn', { active: currentPage === page }]"
                >
                  {{ page }}
                </button>
                <span v-if="totalPages > 5" class="page-ellipsis">...</span>
              </div>
              <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-btn">
                Suivant
                <ChevronRight :size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for New Prescription -->
    <Transition name="fade">
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">
              <FileText :size="24" />
              Prescription Médicale d'Analyse
            </h2>
            <button @click="showModal = false" class="close-btn">
              <X :size="20" />
            </button>
          </div>

          <div class="modal-body">
            <div class="form-section">
              <label class="form-label">
                <User :size="16" />
                Patient concerné
              </label>
              <div class="search-wrapper">
                <div class="search-input-wrapper">
                  <Search :size="18" />
                  <input
                    v-model="patientSearch"
                    placeholder="Tapez le nom du patient (min. 3 lettres)..."
                    class="search-input"
                    @input="handlePatientSearch"
                    @focus="showPatientList = true"
                  />
                </div>
                <div v-if="showPatientList && patientStore.searchResults.length" class="dropdown-list">
                  <div
                    v-for="p in patientStore.searchResults"
                    :key="p.id"
                    @click="selectPatient(p)"
                    class="dropdown-item"
                  >
                    <strong>{{ p.user?.first_name }} {{ p.user?.last_name }}</strong>
                    <small>(ID: {{ p.id }})</small>
                  </div>
                </div>
              </div>
              <div v-if="selectedPatient" class="selected-badge">
                <CheckCircle :size="16" />
                Patient sélectionné : <strong>{{ selectedPatient.user?.first_name }} {{ selectedPatient.user?.last_name }}</strong>
              </div>
            </div>

            <div class="form-section">
              <div class="section-header">
                <label class="form-label">
                  <List :size="16" />
                  Examens demandés
                </label>
                <div class="quick-suggestions">
                  <span>Suggestions :</span>
                  <button @click="addSuggested('NFS', 'Sang')" class="suggest-btn">NFS</button>
                  <button @click="addSuggested('Glycémie', 'Sang')" class="suggest-btn">Glycémie</button>
                  <button @click="addSuggested('ECBU', 'Urine')" class="suggest-btn">ECBU</button>
                </div>
              </div>

              <div class="analysis-items">
                <div v-for="(item, index) in newPrescription.items" :key="index" class="analysis-item">
                  <div class="item-number">{{ index + 1 }}</div>
                  <input v-model="item.name" placeholder="Nom de l'examen" class="analysis-input" />
                  <select v-model="item.type" class="analysis-select">
                    <option value="Sang">Sang</option>
                    <option value="Urine">Urine</option>
                    <option value="Selles">Selles</option>
                    <option value="Autre">Autre</option>
                  </select>
                  <button @click="removeItem(index)" class="remove-btn" :disabled="newPrescription.items.length === 1">
                    <X :size="16" />
                  </button>
                </div>
              </div>

              <button @click="addItem" class="add-item-btn">
                <Plus :size="16" />
                Ajouter un examen supplémentaire
              </button>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="showModal = false" class="btn-cancel">Annuler</button>
            <button @click="submitPrescription" class="btn-submit" :disabled="labStore.loading || !selectedPatient">
              <template v-if="!labStore.loading">
                <Send :size="16" />
                Envoyer au Laboratoire
              </template>
              <template v-else>
                <Loader :size="16" />
                Transmission...
              </template>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </MedecinLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import MedecinLayout from '@/layouts/MedecinLayout.vue'
import { useLabStore } from '@/stores/labStore'
import { usePatientStore } from '@/stores/patientStore'
import {
  Activity, Clock, Loader, Search, Plus, FileText, Printer, X, User, List, CheckCircle, Send,
  Eye, Download, Edit, Trash2, ChevronLeft, ChevronRight
} from 'lucide-vue-next'

const labStore = useLabStore()
const patientStore = usePatientStore()

// --- DATA ---
const showModal = ref(false)
const searchQuery = ref('')
const patientSearch = ref('')
const showPatientList = ref(false)
const selectedPatient = ref(null)

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

const newPrescription = reactive({
  items: [{ name: '', type: 'Sang' }]
})

// --- INITIALISATION ---
onMounted(() => {
  labStore.listLabRequests()
})

// --- COMPUTED ---
const filteredRequests = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return labStore.labRequests.filter(r => {
    const pName = getPatientFullName(r.patient).toLowerCase()
    return pName.includes(query) || r.name?.toLowerCase().includes(query)
  })
})

const paginatedRequests = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredRequests.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredRequests.value.length / itemsPerPage.value)
})

const pendingCount = computed(() => 
  labStore.labRequests.filter(r => r.status === 'pending').length
)

// NOUVEAU : Compteur pour le statut 'in_progress'
const inProgressCount = computed(() => 
  labStore.labRequests.filter(r => r.status === 'in_progress').length
)

// --- METHODS ---
const openModal = () => {
  showModal.value = true
  selectedPatient.value = null
  patientSearch.value = ''
  newPrescription.items = [{ name: '', type: 'Sang' }]
}

let searchTimeout = null
const handlePatientSearch = () => {
  clearTimeout(searchTimeout)
  if (patientSearch.value.length >= 3) {
    searchTimeout = setTimeout(() => {
      patientStore.searchPatients(patientSearch.value)
      showPatientList.value = true
    }, 500)
  }
}

const selectPatient = (p) => {
  selectedPatient.value = p
  patientSearch.value = `${p.user?.first_name} ${p.user?.last_name}`
  showPatientList.value = false
}

const addItem = () => newPrescription.items.push({ name: '', type: 'Sang' })
const removeItem = (idx) => newPrescription.items.splice(idx, 1)

const addSuggested = (name, type) => {
  if (newPrescription.items.length === 1 && !newPrescription.items[0].name) {
    newPrescription.items[0] = { name, type }
  } else {
    newPrescription.items.push({ name, type })
  }
}

const submitPrescription = async () => {
  if (!selectedPatient.value) return alert("Veuillez sélectionner un patient.");
  const validItems = newPrescription.items.filter(i => i.name.trim() !== '');
  if (validItems.length === 0) return alert("Saisissez au moins un examen.");

  const payload = {
    patient_id: selectedPatient.value.id,
    laboratory_id: 1, 
    status: 'pending',
    items: validItems.map(item => ({ name: item.name, type: item.type }))
  };

  const success = await labStore.createAnalyseRequest(payload);
  if (success) {
    showModal.value = false;
    alert("Prescription transmise avec succès au laboratoire.");
    await labStore.listLabRequests(); 
  } else {
    alert("Erreur : " + (labStore.error || "Problème de validation backend"));
  }
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '-'
const getPatientFullName = (p) => p?.user ? `${p.user.first_name} ${p.user.last_name}` : 'Inconnu'

const getStatusClass = (status) => {
  switch (status) {
    case 'pending':
      return 'pending'
    case 'in_progress':
      return 'progress'
    case 'completed':
      return 'completed'
    default:
      return 'default'
  }
}

// Pagination methods
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const changeItemsPerPage = (count) => {
  itemsPerPage.value = count
  currentPage.value = 1
}

// Action methods
const viewDetails = (request) => {
  console.log('Voir détails:', request)
  // TODO: Implémenter la vue des détails
}

const downloadRequest = (request) => {
  console.log('Télécharger:', request)
  // TODO: Implémenter le téléchargement
}

const editRequest = (request) => {
  console.log('Modifier:', request)
  // TODO: Implémenter l'édition
}

const deleteRequest = (request) => {
  console.log('Supprimer:', request)
  // TODO: Implémenter la suppression
}
</script>

<style scoped>
.lab-analysis-container {
  --primary: #2563eb;
  --primary-dark: #1e40af;
  --primary-light: #3b82f6;
  --secondary: #10b981;
  --secondary-dark: #059669;
  --accent: #8b5cf6;
  --danger: #ef4444;
  --warning: #f59e0b;
  --success: #10b981;
  --gray: #6b7280;
  --gray-light: #f3f4f6;
  
  padding: 2rem;
  margin-left: 1rem;
  margin-right: 1rem;
}

/* Header Styles */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.stat-card.pending {
  border-left: 4px solid var(--warning);
}

.stat-card.progress {
  border-left: 4px solid var(--accent);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
}

.stat-icon.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

/* Search Section */
.search-section {
  margin-bottom: 2.5rem;
}

.search-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-size: 1rem;
  outline: none;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

/* Requests Section */
.requests-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.requests-count {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.8);
}

.loading-spinner {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.6);
}

.empty-icon {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h4 {
  color: white;
  margin-bottom: 0.5rem;
}

/* Table Styles */
.requests-table-container {
  overflow-x: auto;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
}

.requests-table {
  width: 100%;
  border-collapse: collapse;
}

.requests-table th {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-weight: 600;
  text-align: left;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.requests-table th:last-child {
  text-align: center;
  width: 200px;
  min-width: 200px;
}

.requests-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: white;
}

.requests-table td:last-child {
  text-align: center;
}

.request-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Cell Styles */
.ref-badge {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #a5b4fc;
}

.patient-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.patient-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
}

.patient-name {
  font-weight: 500;
}

.analysis-tag {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #a5b4fc;
}

.date-cell {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

/* Status Badges */
.status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.pending {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.3) 100%);
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.status-badge.progress {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.3) 100%);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.status-badge.completed {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.3) 100%);
  color: #86efac;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

/* Action Buttons */
.actions-cell {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
}

.action-btn.view-btn,
.action-btn.download-btn,
.action-btn.edit-btn,
.action-btn.delete-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.action-btn.view-btn svg,
.action-btn.download-btn svg,
.action-btn.edit-btn svg,
.action-btn.delete-btn svg {
  width: 18px !important;
  height: 18px !important;
  min-width: 18px;
  min-height: 18px;
}

.action-btn.view-btn:hover,
.action-btn.download-btn:hover,
.action-btn.edit-btn:hover,
.action-btn.delete-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.action-btn.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
}

/* Pagination Styles */
.pagination-container {
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.items-per-page {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.5rem;
  color: white;
  font-size: 0.9rem;
}

.items-per-page option {
  background: #1e293b;
  color: white;
}

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-btn {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.page-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.page-btn.active {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  border-color: transparent;
}

.page-ellipsis {
  color: rgba(255, 255, 255, 0.6);
  padding: 0 0.5rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 1.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.search-wrapper {
  position: relative;
}

.dropdown-list {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  position: absolute;
  width: 100%;
  z-index: 10;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #1e293b;
  transition: all 0.3s ease;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.8);
}

.dropdown-item:last-child {
  border-bottom: none;
}

.selected-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
  color: #86efac;
  margin-top: 0.75rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.quick-suggestions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.suggest-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.suggest-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.analysis-items {
  margin-bottom: 1rem;
}

.analysis-item {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 0.75rem;
}

.item-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8rem;
}

.analysis-input,
.analysis-select {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.75rem;
  color: white;
  font-size: 0.9rem;
}

.analysis-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.analysis-input:focus,
.analysis-select:focus {
  outline: none;
  border-color: var(--primary);
}

.analysis-select option {
  background: #1e293b;
  color: white;
}

.remove-btn {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  color: #fca5a5;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.2);
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-item-btn {
  width: 100%;
  padding: 0.75rem;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  background: transparent;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.add-item-btn:hover {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.05);
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-submit {
  background: linear-gradient(135deg, var(--secondary) 0%, #059669 100%);
  border: none;
  border-radius: 8px;
  color: white;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .requests-table {
    font-size: 0.8rem;
  }
  
  .requests-table th,
  .requests-table td {
    padding: 0.5rem;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .quick-suggestions {
    flex-wrap: wrap;
  }
  
  .pagination-container {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .pagination-controls {
    flex-direction: column;
    gap: 1rem;
  }
  
  .actions-cell {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .analysis-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .analysis-input,
  .analysis-select {
    width: 100%;
  }
}
</style>