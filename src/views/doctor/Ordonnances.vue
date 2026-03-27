<template>
  <MedecinLayout>
    <div class="ordonnances-container">
      <!-- Header Section -->
      <div class="dashboard-header">
        <div class="header-content">
          <h1 class="page-title">
            💊 Gestion des Ordonnances
          </h1>
          <p class="page-subtitle">Créez et gérez les prescriptions médicales</p>
        </div>
        <div class="header-actions">
          <button class="action-btn secondary" @click="showGlobalHistoryModal = true">
            <FileText :size="18" />
            Voir l'Historique
          </button>
        </div>
      </div>

      <!-- Messages -->
      <Transition name="fade">
        <div v-if="prescriptionStore.getSuccess" class="message-container success">
          <CheckCircle :size="20" />
          {{ prescriptionStore.getSuccess }}
        </div>
      </Transition>
      <Transition name="fade">
        <div v-if="prescriptionStore.getError" class="message-container error">
          <AlertCircle :size="20" />
          {{ prescriptionStore.getError }}
        </div>
      </Transition>

      <!-- Patient Selection Section -->
      <div class="patient-selection-card">
        <div class="card-header">
          <h2 class="card-title">
            <User :size="24" />
            Sélection du Patient
          </h2>
        </div>
        <div class="card-content">
          <div class="selection-grid">
            <div class="search-section">
              <label class="form-label">
                <Search :size="16" />
                Rechercher un patient
              </label>
              <div class="search-input-wrapper">
                <Search :size="18" />
                <input
                  v-model="searchPatient"
                  type="text"
                  placeholder="Nom, ID ou Email du patient..."
                  class="search-input"
                />
              </div>
            </div>
            
            <div class="select-section">
              <label class="form-label">
                <Users :size="16" />
                Patient sélectionné
              </label>
              <select v-model="selectedPatientId" @change="fetchPatientHistory" class="patient-select">
                <option :value="null" disabled>
                  {{ patientStore.loading ? 'Chargement...' : '-- Sélectionnez un patient --' }}
                </option>
                <option
                  v-for="patient in filteredPatients"
                  :key="patient.id"
                  :value="patient.id"
                >
                  {{ patient.user?.first_name }} {{ patient.user?.last_name }} (ID: {{ patient.id }})
                </option>
              </select>
              <p v-if="patientStore.error" class="error-text">Erreur de chargement des patients.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Prescription Form Section -->
      <div v-if="selectedPatient" class="prescription-card">
        <div class="card-header">
          <h2 class="card-title">
            <FilePlus :size="24" />
            Nouvelle Ordonnance
          </h2>
          <div class="patient-info">
            <span class="patient-name">{{ selectedPatient.user?.first_name }} {{ selectedPatient.user?.last_name }}</span>
          </div>
        </div>
        
        <div class="card-content">
          <!-- Add Medication Form -->
          <div class="medication-form">
            <h3 class="form-section-title">
              <Plus :size="20" />
              Ajouter un médicament
            </h3>
            <form @submit.prevent="addLocalLine" class="medication-grid">
              <div class="form-group full-width">
                <label class="input-label">Nom du Médicament *</label>
                <div class="input-wrapper">
                  <Pill :size="18" />
                  <input v-model="newLine.medicationName" type="text" required placeholder="ex: Paracétamol 500mg" class="form-input" />
                </div>
              </div>
              
              <div class="form-group">
                <label class="input-label">Posologie *</label>
                <div class="input-wrapper">
                  <Droplet :size="18" />
                  <input v-model="newLine.dosage" type="text" required placeholder="ex: 1 gélule" class="form-input" />
                </div>
              </div>

              <div class="form-group">
                <label class="input-label">Fréquence *</label>
                <div class="input-wrapper">
                  <Clock :size="18" />
                  <input v-model="newLine.frequency" type="text" required placeholder="ex: 3x par jour" class="form-input" />
                </div>
              </div>

              <div class="form-group">
                <label class="input-label">Durée *</label>
                <div class="input-wrapper">
                  <Calendar :size="18" />
                  <input v-model="newLine.duration" type="text" required placeholder="ex: 7 jours" class="form-input" />
                </div>
              </div>
              
              <div class="form-group full-width">
                <label class="input-label">Instructions</label>
                <div class="input-wrapper">
                  <Info :size="18" />
                  <input v-model="newLine.instructions" type="text" placeholder="ex: Après le repas" class="form-input" />
                </div>
              </div>

              <button type="submit" class="add-medication-btn">
                <Plus :size="16" />
                Ajouter au brouillon
              </button>
            </form>
          </div>
          
          <!-- Current Medications -->
          <div class="current-medications">
            <h3 class="medications-title">
              <Package :size="20" />
              Médicaments dans l'ordonnance ({{ prescriptionLines.length }})
            </h3>
            <div class="medications-list">
              <div v-if="prescriptionLines.length === 0" class="empty-state">
                <PackageOpen :size="48" />
                <h4>Aucun médicament ajouté</h4>
                <p>Ajoutez des médicaments pour créer l'ordonnance</p>
              </div>
              <div v-for="(line, index) in prescriptionLines" :key="index" class="medication-item">
                <div class="medication-info">
                  <div class="medication-name">{{ line.medicationName }}</div>
                  <div class="medication-details">
                    {{ line.dosage }} ({{ line.frequency }}, {{ line.duration }})
                  </div>
                  <div v-if="line.instructions" class="medication-instructions">
                    <Info :size="14" />
                    {{ line.instructions }}
                  </div>
                </div>
                <button @click="removeLocalLine(index)" class="remove-btn" title="Supprimer">
                  <X :size="16" />
                </button>
              </div>
            </div>
          </div>

          <!-- Finalization -->
          <div class="finalization-section">
            <h3 class="finalization-title">
              <FileText :size="20" />
              Notes du médecin
            </h3>
            <div class="notes-wrapper">
              <textarea v-model="finalNotes" rows="3" placeholder="Conseils, régime, observations pour le patient..." class="notes-textarea"></textarea>
            </div>
            
            <button
              @click="createOrdonnanceAndFinalize"
              :disabled="prescriptionLines.length === 0 || prescriptionStore.isLoading"
              class="submit-btn"
            >
              <template v-if="!prescriptionStore.isLoading">
                <Send :size="18" />
                Finaliser et Enregistrer l'Ordonnance
              </template>
              <template v-else>
                <Loader :size="18" />
                Enregistrement en cours...
              </template>
            </button>
          </div>
        </div>
      </div>

      <!-- Global History Section -->
      <div class="global-history-card">
        <div class="card-header">
          <h2 class="card-title">
            <History :size="24" />
            Historique Global des Ordonnances
          </h2>
          <div class="header-actions">
            <button class="action-btn secondary" @click="fetchAllPrescriptions">
              <RefreshCw :size="16" />
              Actualiser
            </button>
          </div>
        </div>
        <div class="card-content">
          <!-- Search and Filter -->
          <div class="history-search-section">
            <div class="search-input-wrapper">
              <Search :size="18" />
              <input
                v-model="historySearchQuery"
                type="text"
                placeholder="Rechercher par patient, médicament, docteur..."
                class="search-input"
              />
            </div>
            <div class="filter-controls">
              <select v-model="statusFilter" class="status-filter">
                <option :value="null">Tous les statuts</option>
                <option value="active">Active</option>
                <option value="pending">En attente</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <!-- Stats Cards -->
          <div class="history-stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <FileText :size="20" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ allPrescriptions.length }}</div>
                <div class="stat-label">Total Ordonnances</div>
              </div>
            </div>
            <div class="stat-card active">
              <div class="stat-icon">
                <CheckCircle :size="20" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ getActivePrescriptionsCount() }}</div>
                <div class="stat-label">Actives</div>
              </div>
            </div>
            <div class="stat-card pending">
              <div class="stat-icon">
                <Clock :size="20" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ getPendingPrescriptionsCount() }}</div>
                <div class="stat-label">En attente</div>
              </div>
            </div>
          </div>

          <div v-if="prescriptionStore.isLoading" class="loading-state">
            <Loader :size="32" />
            <p>Chargement de l'historique global...</p>
          </div>
          
          <div v-else-if="filteredAllPrescriptions.length" class="history-table-container">
            <table class="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Patient</th>
                  <th>Docteur</th>
                  <th>Médicaments</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ord in filteredAllPrescriptions" :key="ord.id" class="history-row">
                  <td>
                    <div class="date-cell">{{ formatDate(ord.created_at) }}</div>
                  </td>
                  <td>
                    <div class="patient-cell">
                      <div class="patient-avatar">{{ getPatientInitials(ord.patient) }}</div>
                      <span>{{ getPatientName(ord.patient) }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="doctor-cell">
                      <div class="doctor-avatar">DR</div>
                      <span>Dr. {{ ord.doctor?.user?.last_name || 'Non spécifié' }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="medications-cell">
                      <span v-if="ord.lines?.length" class="medication-tag">
                        {{ ord.lines[0].medicament_name }}
                        <span v-if="ord.lines.length > 1" class="more-indicator">+{{ ord.lines.length - 1 }}</span>
                      </span>
                      <span v-else class="empty-text">Vide</span>
                    </div>
                  </td>
                  <td>
                    <span :class="['status-badge', getStatusClass(ord.status)]">
                      {{ getStatusText(ord.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="actions-cell">
                      <button class="action-btn view-btn" title="Voir les détails" @click="viewPrescriptionDetails(ord)">
                        <Eye :size="16" />
                      </button>
                      <button class="action-btn print-btn" title="Imprimer" @click="printPrescription(ord)">
                        <Printer :size="16" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="empty-history">
            <History :size="48" />
            <h4>Aucune ordonnance trouvée</h4>
            <p>Aucune ordonnance ne correspond à votre recherche.</p>
          </div>
        </div>
      </div>

      <!-- Patient History Section -->
      <div v-if="selectedPatientId" class="history-card">
        <div class="card-header">
          <h2 class="card-title">
            <History :size="24" />
            Historique du Patient
          </h2>
          <div class="patient-info">
            <span class="patient-name">{{ selectedPatient.user?.first_name }} {{ selectedPatient.user?.last_name }}</span>
          </div>
        </div>
        <div class="card-content">
          <div v-if="prescriptionStore.isLoading" class="loading-state">
            <Loader :size="32" />
            <p>Chargement de l'historique...</p>
          </div>
          
          <div v-else-if="patientPrescriptions.length" class="history-table-container">
            <table class="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Docteur</th>
                  <th>Médicaments</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ord in patientPrescriptions" :key="ord.id" class="history-row">
                  <td>
                    <div class="date-cell">{{ formatDate(ord.created_at) }}</div>
                  </td>
                  <td>
                    <div class="doctor-cell">
                      <div class="doctor-avatar">DR</div>
                      <span>Dr. {{ ord.doctor?.user?.last_name || 'Non spécifié' }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="medications-cell">
                      <span v-if="ord.lines?.length" class="medication-tag">
                        {{ ord.lines[0].medicament_name }}
                        <span v-if="ord.lines.length > 1" class="more-indicator">+{{ ord.lines.length - 1 }}</span>
                      </span>
                      <span v-else class="empty-text">Vide</span>
                    </div>
                  </td>
                  <td>
                    <span :class="['status-badge', getStatusClass(ord.status)]">
                      {{ getStatusText(ord.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="actions-cell">
                      <button class="action-btn view-btn" title="Voir les détails" @click="viewPrescriptionDetails(ord)">
                        <Eye :size="16" />
                      </button>
                      <button class="action-btn print-btn" title="Imprimer" @click="printPrescription(ord)">
                        <Printer :size="16" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="empty-history">
            <History :size="48" />
            <h4>Aucune prescription antérieure</h4>
            <p>Ce patient n'a pas encore d'historique de prescriptions</p>
          </div>
        </div>
      </div>

      <!-- Modal pour les détails de l'historique -->
      <Transition name="fade">
        <div v-if="showHistoryModal" class="modal-overlay">
          <div class="modal-content large">
            <div class="modal-header">
              <h2 class="modal-title">
                <FileText :size="24" />
                Détails de l'Ordonnance
              </h2>
              <button @click="showHistoryModal = false" class="close-btn">
                <X :size="20" />
              </button>
            </div>

            <div class="modal-body">
              <!-- Informations générales -->
              <div class="prescription-info-section">
                <h3 class="section-title">Informations générales</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <label class="info-label">
                      <Calendar :size="16" />
                      Date de création
                    </label>
                    <div class="info-value">{{ formatDate(selectedPrescription?.created_at) }}</div>
                  </div>
                  <div class="info-item">
                    <label class="info-label">
                      <User :size="16" />
                      Patient
                    </label>
                    <div class="info-value">{{ getPatientName(selectedPrescription?.patient) }}</div>
                  </div>
                  <div class="info-item">
                    <label class="info-label">
                      <User :size="16" />
                      Docteur
                    </label>
                    <div class="info-value">Dr. {{ selectedPrescription?.doctor?.user?.last_name || 'Non spécifié' }}</div>
                  </div>
                  <div class="info-item">
                    <label class="info-label">
                      <CheckCircle :size="16" />
                      Statut
                    </label>
                    <div class="info-value">
                      <span :class="['status-badge', getStatusClass(selectedPrescription?.status)]">
                        {{ getStatusText(selectedPrescription?.status) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Médicaments -->
              <div class="medications-section">
                <h3 class="section-title">
                  <Package :size="20" />
                  Médicaments prescrits ({{ selectedPrescription?.lines?.length || 0 }})
                </h3>
                <div v-if="selectedPrescription?.lines?.length" class="medications-list">
                  <div v-for="(line, index) in selectedPrescription.lines" :key="index" class="medication-detail-item">
                    <div class="medication-number">{{ index + 1 }}</div>
                    <div class="medication-details">
                      <div class="medication-name">{{ line.medicament_name }}</div>
                      <div class="medication-prescription">
                        <span class="dosage">{{ line.dosage }}</span>
                        <span class="frequency">{{ line.frequency }}</span>
                        <span class="duration">{{ line.duration }}</span>
                      </div>
                      <div v-if="line.instructions" class="medication-instructions">
                        <Info :size="14" />
                        {{ line.instructions }}
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-medications">
                  <PackageOpen :size="48" />
                  <h4>Aucun médicament prescrit</h4>
                </div>
              </div>

              <!-- Notes du médecin -->
              <div v-if="selectedPrescription?.notes" class="notes-section">
                <h3 class="section-title">
                  <FileText :size="20" />
                  Notes du médecin
                </h3>
                <div class="notes-content">
                  {{ selectedPrescription.notes }}
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button @click="showHistoryModal = false" class="btn-cancel">Fermer</button>
              <button @click="printPrescription(selectedPrescription)" class="btn-primary">
                <Printer :size="16" />
                Imprimer l'ordonnance
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Modal pour l'historique global -->
      <Transition name="fade">
        <div v-if="showGlobalHistoryModal" class="modal-overlay">
          <div class="modal-content extra-large">
            <div class="modal-header">
              <h2 class="modal-title">
                <History :size="24" />
                Historique Global des Ordonnances
              </h2>
              <button @click="showGlobalHistoryModal = false" class="close-btn">
                <X :size="20" />
              </button>
            </div>

            <div class="modal-body">
              <!-- Search and Filter -->
              <div class="history-search-section">
                <div class="search-input-wrapper">
                  <Search :size="18" />
                  <input
                    v-model="historySearchQuery"
                    type="text"
                    placeholder="Rechercher par patient, médicament, docteur..."
                    class="search-input"
                  />
                </div>
                <div class="filter-controls">
                  <select v-model="statusFilter" class="status-filter">
                    <option :value="null">Tous les statuts</option>
                    <option value="active">Active</option>
                    <option value="pending">En attente</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <button class="action-btn secondary" @click="fetchAllPrescriptions">
                    <RefreshCw :size="16" />
                    Actualiser
                  </button>
                </div>
              </div>

              <!-- Stats Cards -->
              <div class="history-stats-grid">
                <div class="stat-card">
                  <div class="stat-icon">
                    <FileText :size="20" />
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ allPrescriptions.length }}</div>
                    <div class="stat-label">Total Ordonnances</div>
                  </div>
                </div>
                <div class="stat-card active">
                  <div class="stat-icon">
                    <CheckCircle :size="20" />
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ getActivePrescriptionsCount() }}</div>
                    <div class="stat-label">Actives</div>
                  </div>
                </div>
                <div class="stat-card pending">
                  <div class="stat-icon">
                    <Clock :size="20" />
                  </div>
                  <div class="stat-content">
                    <div class="stat-value">{{ getPendingPrescriptionsCount() }}</div>
                    <div class="stat-label">En attente</div>
                  </div>
                </div>
              </div>

              <div v-if="prescriptionStore.isLoading" class="loading-state">
                <Loader :size="32" />
                <p>Chargement de l'historique global...</p>
              </div>
              
              <div v-else-if="filteredAllPrescriptions.length" class="history-table-container">
                <table class="history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Patient</th>
                      <th>Docteur</th>
                      <th>Médicaments</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="ord in filteredAllPrescriptions" :key="ord.id" class="history-row">
                      <td>
                        <div class="date-cell">{{ formatDate(ord.created_at) }}</div>
                      </td>
                      <td>
                        <div class="patient-cell">
                          <div class="patient-avatar">{{ getPatientInitials(ord.patient) }}</div>
                          <span>{{ getPatientName(ord.patient) }}</span>
                        </div>
                      </td>
                      <td>
                        <div class="doctor-cell">
                          <div class="doctor-avatar">DR</div>
                          <span>Dr. {{ ord.doctor?.user?.last_name || 'Non spécifié' }}</span>
                        </div>
                      </td>
                      <td>
                        <div class="medications-cell">
                          <span v-if="ord.lines?.length" class="medication-tag">
                            {{ ord.lines[0].medicament_name }}
                            <span v-if="ord.lines.length > 1" class="more-indicator">+{{ ord.lines.length - 1 }}</span>
                          </span>
                          <span v-else class="empty-text">Vide</span>
                        </div>
                      </td>
                      <td>
                        <span :class="['status-badge', getStatusClass(ord.status)]">
                          {{ getStatusText(ord.status) }}
                        </span>
                      </td>
                      <td>
                        <div class="actions-cell">
                          <button class="action-btn view-btn" title="Voir les détails" @click="viewPrescriptionDetails(ord)">
                            <Eye :size="16" />
                          </button>
                          <button class="action-btn print-btn" title="Imprimer" @click="printPrescription(ord)">
                            <Printer :size="16" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="empty-history">
                <History :size="48" />
                <h4>Aucune ordonnance trouvée</h4>
                <p>Aucune ordonnance ne correspond à votre recherche.</p>
              </div>
            </div>

            <div class="modal-footer">
              <button @click="showGlobalHistoryModal = false" class="btn-cancel">Fermer</button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </MedecinLayout>
</template>

<script setup>
import MedecinLayout from '@/layouts/MedecinLayout.vue'
import { ref, computed, onMounted } from 'vue'
import { usePatientStore } from '@/stores/patientStore'
import { usePrescriptionStore } from '@/stores/prescriptionStore'
import { useRoute } from 'vue-router'
import {
  FileText, CheckCircle, AlertCircle, User, Search, Users, FilePlus, Plus, Pill, Droplet, 
  Clock, Calendar, Info, Package, PackageOpen, X, Send, Loader, History, RefreshCw, Eye, Printer
} from 'lucide-vue-next' 

// --- Initialisation ---
const patientStore = usePatientStore()
const prescriptionStore = usePrescriptionStore()
const route = useRoute()

// --- État Local ---
const searchPatient = ref('')
const selectedPatientId = ref(null) 
const finalNotes = ref('')
const prescriptionLines = ref([]) 
const newLine = ref({
    medicationName: '', 
    dosage: '',
    frequency: '', 
    duration: '',
    instructions: '', 
})

// Historique Global
const allPrescriptions = ref([])
const historySearchQuery = ref('')
const statusFilter = ref(null)

// Modal pour les détails
const showHistoryModal = ref(false)
const selectedPrescription = ref(null)

// Modal pour l'historique global
const showGlobalHistoryModal = ref(false)

// --- Computed ---
const doctorIdFromRoute = computed(() => {
    const id = route.params.id || route.params.doctorId; 
    return id ? parseInt(id) : null;
});

const filteredPatients = computed(() => {
    let source = patientStore.patients?.data || patientStore.patients || [];
    if (!Array.isArray(source)) return [];
    
    const query = searchPatient.value.trim().toLowerCase();
    if (!query) return source.slice(0, 20);

    return source.filter(p => {
        const fullName = `${p.user?.first_name || ''} ${p.user?.last_name || ''}`.toLowerCase();
        return fullName.includes(query) || p.user?.email?.toLowerCase().includes(query) || String(p.id).includes(query);
    });
});

const selectedPatient = computed(() => {
    let source = patientStore.patients?.data || patientStore.patients || [];
    return source.find(p => p.id === selectedPatientId.value);
});

const patientPrescriptions = computed(() => prescriptionStore.prescriptions);

const filteredAllPrescriptions = computed(() => {
  let filtered = allPrescriptions.value;
  
  // Filtrer par statut
  if (statusFilter.value) {
    filtered = filtered.filter(p => p.status === statusFilter.value);
  }
  
  // Filtrer par recherche
  if (historySearchQuery.value) {
    const query = historySearchQuery.value.toLowerCase();
    filtered = filtered.filter(p => {
      const patientName = getPatientName(p.patient).toLowerCase();
      const doctorName = `Dr. ${p.doctor?.user?.last_name || ''}`.toLowerCase();
      const medications = p.lines?.map(l => l.medicament_name).join(' ').toLowerCase() || '';
      
      return patientName.includes(query) || 
             doctorName.includes(query) || 
             medications.includes(query);
    });
  }
  
  return filtered;
});

// --- Méthodes ---
function fetchPatientHistory() {
    prescriptionLines.value = [];
    finalNotes.value = '';
    prescriptionStore.clearMessages(); 
    if (selectedPatientId.value) {
        prescriptionStore.fetchPatientPrescriptions(selectedPatientId.value);
    }
}

function addLocalLine() {
    if (!newLine.value.medicationName || !newLine.value.dosage || !newLine.value.frequency || !newLine.value.duration) {
        alert('Veuillez remplir tous les champs obligatoires (*)');
        return;
    }

    prescriptionLines.value.push({ ...newLine.value });
    // Reset du formulaire de ligne
    newLine.value = { medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' };
}

function removeLocalLine(index) {
    prescriptionLines.value.splice(index, 1);
}

async function createOrdonnanceAndFinalize() {
    const currentDoctorId = doctorIdFromRoute.value;

    if (!currentDoctorId || !selectedPatientId.value) {
        prescriptionStore.setError("Données manquantes (Docteur ou Patient).");
        return;
    }

    // Mapping vers le format attendu par l'API (prescription_lines)
    const payload = {
        notes: finalNotes.value,
        prescription_lines: prescriptionLines.value.map(line => ({
            medication_name: line.medicationName, // Attention : vérifier si l'API attend medicament_name ou medication_name
            dosage: line.dosage,
            frequency: line.frequency,
            duration: line.duration,
            instructions: line.instructions || null
        }))
    };

    const success = await prescriptionStore.createPrescription(currentDoctorId, selectedPatientId.value, payload);
    
    if (success) {
        prescriptionLines.value = [];
        finalNotes.value = '';
        fetchPatientHistory(); // Rafraîchir l'historique en bas
    }
}

const formatDate = (date) => date ? new Date(date).toLocaleDateString('fr-FR') : 'N/A';

const getStatusClass = (status) => {
    const s = status?.toLowerCase();
    if (s === 'active') return 'active';
    if (['draft', 'pending'].includes(s)) return 'pending';
    return 'inactive';
}

const getStatusText = (status) => {
    const s = status?.toLowerCase();
    if (s === 'active') return 'Active';
    if (['draft', 'pending'].includes(s)) return 'En attente';
    return 'Inactive';
}

// Méthodes pour l'historique global
const fetchAllPrescriptions = async () => {
    try {
        // TODO: Implémenter l'appel API pour récupérer toutes les ordonnances
        // prescriptionStore.fetchAllPrescriptions();
        // allPrescriptions.value = prescriptionStore.allPrescriptions;
        console.log('Récupération de toutes les ordonnances...');
    } catch (error) {
        console.error('Erreur lors de la récupération des ordonnances:', error);
    }
}

const getActivePrescriptionsCount = () => {
    return allPrescriptions.value.filter(p => p.status === 'active').length;
}

const getPendingPrescriptionsCount = () => {
    return allPrescriptions.value.filter(p => ['draft', 'pending'].includes(p.status)).length;
}

const getPatientName = (patient) => {
    if (!patient?.user) return 'Patient inconnu';
    return `${patient.user.first_name} ${patient.user.last_name}`;
}

const getPatientInitials = (patient) => {
    if (!patient?.user) return 'P';
    const name = `${patient.user.first_name} ${patient.user.last_name}`;
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const viewPrescriptionDetails = (prescription) => {
    selectedPrescription.value = prescription;
    showHistoryModal.value = true;
}

const printPrescription = (prescription) => {
    console.log('Imprimer l\'ordonnance:', prescription);
    // TODO: Implémenter l'impression
    // Générer un PDF ou ouvrir la page d'impression
}

onMounted(() => {
    patientStore.allPatient();
    fetchAllPrescriptions(); // Charger l'historique global au montage
})
</script>

<style scoped>
.ordonnances-container {
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

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Messages */
.message-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.message-container.success {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #86efac;
}

.message-container.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

/* Cards Styles */
.patient-selection-card,
.prescription-card,
.global-history-card,
.history-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* Global History Styles */
.global-history-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.global-history-card .header-actions {
  display: flex;
  gap: 0.5rem;
}

.history-search-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
}

.filter-controls {
  display: flex;
  gap: 0.5rem;
}

.status-filter {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.75rem;
  color: white;
  font-size: 0.9rem;
  min-width: 150px;
}

.status-filter option {
  background: #1e293b;
  color: white;
}

.history-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.history-stats-grid .stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
}

.history-stats-grid .stat-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.history-stats-grid .stat-card.active {
  border-left: 4px solid var(--success);
}

.history-stats-grid .stat-card.pending {
  border-left: 4px solid var(--warning);
}

.history-stats-grid .stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.history-stats-grid .stat-content {
  flex: 1;
}

.history-stats-grid .stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
}

.history-stats-grid .stat-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.patient-info {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.patient-name {
  color: #a5b4fc;
  font-weight: 500;
}

.card-content {
  padding: 1.5rem;
}

/* Patient Selection */
.selection-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.75rem;
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

.patient-select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.75rem;
  color: white;
  font-size: 1rem;
  width: 100%;
}

.patient-select option {
  background: #1e293b;
  color: white;
}

.error-text {
  color: #fca5a5;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

/* Prescription Form */
.medication-form {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.form-section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.medication-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: span 2;
}

.input-label {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.form-input {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-size: 1rem;
  outline: none;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-input:focus {
  outline: none;
}

.add-medication-btn {
  grid-column: span 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-dark) 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.add-medication-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

/* Current Medications */
.current-medications {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.medications-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.medications-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.6);
}

.empty-state h4 {
  color: white;
  margin-bottom: 0.5rem;
}

.medication-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 1rem;
  border-left: 4px solid var(--secondary);
}

.medication-info {
  flex: 1;
}

.medication-name {
  font-weight: 600;
  color: white;
  margin-bottom: 0.25rem;
}

.medication-details {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.medication-instructions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
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

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* Finalization */
.finalization-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
}

.finalization-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.notes-wrapper {
  margin-bottom: 1.5rem;
}

.notes-textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.75rem;
  color: white;
  font-size: 1rem;
  resize: vertical;
}

.notes-textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.notes-textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.submit-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* History Section */
.loading-state {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.8);
}

.history-table-container {
  overflow-x: auto;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-weight: 600;
  text-align: left;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.history-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: white;
}

.history-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.date-cell {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.doctor-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.doctor-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
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

.actions-cell {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.action-btn.view-btn,
.action-btn.print-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.action-btn.view-btn:hover,
.action-btn.print-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.medications-cell {
  max-width: 200px;
}

.medication-tag {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #a5b4fc;
}

.more-indicator {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.1rem 0.4rem;
  border-radius: 8px;
  font-size: 0.7rem;
  margin-left: 0.5rem;
}

.empty-text {
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.active {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.3) 100%);
  color: #86efac;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-badge.pending {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.3) 100%);
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.status-badge.inactive {
  background: linear-gradient(135deg, rgba(107, 114, 128, 0.2) 0%, rgba(107, 114, 128, 0.3) 100%);
  color: #d1d5db;
  border: 1px solid rgba(107, 114, 128, 0.3);
}

.empty-history {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.6);
}

.empty-history h4 {
  color: white;
  margin-bottom: 0.5rem;
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

/* Modal Styles for History Details */
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

.modal-content.large {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-content.extra-large {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 95%;
  max-width: 1200px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 2rem;
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
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
}

/* Modal Content Styles */
.prescription-info-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

/* Modal History Section Styles */
.modal-content.extra-large .history-search-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.modal-content.extra-large .filter-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.modal-content.extra-large .status-filter {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.75rem;
  color: white;
  font-size: 0.9rem;
  min-width: 150px;
}

.modal-content.extra-large .status-filter option {
  background: #1e293b;
  color: white;
}

.modal-content.extra-large .history-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.modal-content.extra-large .history-stats-grid .stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
}

.modal-content.extra-large .history-stats-grid .stat-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.modal-content.extra-large .history-stats-grid .stat-card.active {
  border-left: 4px solid var(--success);
}

.modal-content.extra-large .history-stats-grid .stat-card.pending {
  border-left: 4px solid var(--warning);
}

.modal-content.extra-large .history-stats-grid .stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.modal-content.extra-large .history-stats-grid .stat-content {
  flex: 1;
}

.modal-content.extra-large .history-stats-grid .stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
}

.modal-content.extra-large .history-stats-grid .stat-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
}

.modal-content.extra-large .history-table-container {
  overflow-x: auto;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
}

.modal-content.extra-large .empty-history {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.6);
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  font-size: 0.9rem;
}

.info-value {
  color: white;
  font-weight: 600;
}

.medications-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.medications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.medication-detail-item {
  display: flex;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1rem;
  border-left: 4px solid var(--secondary);
}

.medication-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.medication-details {
  flex: 1;
}

.medication-name {
  font-weight: 600;
  color: white;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.medication-prescription {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.dosage,
.frequency,
.duration {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #a5b4fc;
}

.medication-instructions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.empty-medications {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.6);
}

.notes-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
}

.notes-content {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 1rem;
  color: white;
  line-height: 1.6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .selection-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .medication-grid {
    grid-template-columns: 1fr;
  }
  
  .form-group.full-width {
    grid-column: span 1;
  }
  
  .add-medication-btn {
    grid-column: span 1;
  }
  
  .history-search-section {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .filter-controls {
    justify-content: center;
  }
  
  .history-stats-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .history-table {
    font-size: 0.8rem;
  }
  
  .history-table th,
  .history-table td {
    padding: 0.5rem;
  }
  
  .global-history-card .header-actions {
    justify-content: center;
  }
  
  .actions-cell {
    flex-wrap: wrap;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }
  
  .card-header {
    padding: 1rem;
  }
  
  .card-content {
    padding: 1rem;
  }
  
  .medication-item {
    flex-direction: column;
    gap: 1rem;
  }
  
  .remove-btn {
    align-self: flex-end;
  }
  
  .modal-content.large {
    width: 95%;
    margin: 1rem;
  }
  
  .modal-content.extra-large {
    width: 98%;
    margin: 0.5rem;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .medication-prescription {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .modal-content.extra-large .history-search-section {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .modal-content.extra-large .filter-controls {
    justify-content: center;
  }
  
  .modal-content.extra-large .history-stats-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}
</style>