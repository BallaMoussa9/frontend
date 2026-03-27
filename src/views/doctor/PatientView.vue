<template>
  <MedecinLayout>
    <div v-if="patientStore.loading" class="state-container loading-state">
      <div class="spinner-container">
        <div class="spinner"></div>
      </div>
      <h3>Chargement des patients</h3>
      <p style="color: white;">Récupération de la liste des patients...</p>
    </div>

    <div v-else-if="patientStore.error" class="state-container error-state">
      <div class="icon-container">
        <AlertCircle :size="48" />
      </div>
      <h3>Oups ! Une erreur est survenue</h3>
      <p>Nous rencontrons des difficultés techniques. Veuillez réessayer.</p>
      <button class="retry-btn" @click="loadPatients">Réessayer</button>
    </div>

    <div v-else class="dashboard-container">
      <div class="dashboard-header">
        <div class="header-content">
          <h1 class="page-title">
            <Users :size="32" class="title-icon" />
            Mes Patients
          </h1>
          <p class="page-subtitle">Gérez les dossiers médicaux de vos patients</p>
        </div>
        <div class="header-actions">
          <button class="action-btn primary" @click="loadPatients" :disabled="patientStore.loading">
            <RefreshCw :size="18" />
            Actualiser
          </button>
          <button class="action-btn secondary" @click="printPatients">
            <Printer :size="18" />
            Imprimer
          </button>
        </div>
      </div>

      <div class="search-header">
        <div class="search-card">
          <div class="search-input-wrapper">
            <Search :size="20" class="search-icon" />
            <input
              v-model="searchTerm"
              @input="handleSearch"
              placeholder="Nom, email, ID..."
              class="search-input"
            />
          </div>
        </div>

        <section class="card vitals-card">
          <div class="card-header">
            <div class="card-icon pulse">
              <Activity :size="24" />
            </div>
            <h2 class="card-title">Statistiques</h2>
          </div>
          <div class="card-content">
            <div class="vitals-grid">
              <div class="vital-item">
                <div class="vital-icon"><Users :size="20" /></div>
                <div class="vital-info">
                  <div class="vital-label">Total Patients</div>
                  <div class="vital-value">{{ filteredPatients.length }}</div>
                </div>
              </div>

              <div class="vital-item">
                <div class="vital-icon heart"><UserCheck :size="20" /></div>
                <div class="vital-info">
                  <div class="vital-label">Sélectionné</div>
                  <div class="vital-value">{{ selectedPatient ? 1 : 0 }}</div>
                </div>
              </div>

              <div class="vital-item">
                <div class="vital-icon temp"><Calendar :size="20" /></div>
                <div class="vital-info">
                  <div class="vital-label">Actifs</div>
                  <div class="vital-value">{{ getActivePatientsCount() }}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div class="patients-section">
        <div class="section-header">
          <h2 class="section-title">Liste des Patients</h2>
          <div class="section-actions">
            <span class="patients-count">{{ filteredPatients.length }} patients</span>
          </div>
        </div>

        <div v-if="!patientStore.loading && filteredPatients.length === 0" class="empty-state">
          <div class="empty-icon">
            <Users :size="48" />
          </div>
          <h4>Aucun patient trouvé</h4>
          <p>Aucun patient ne correspond à votre recherche.</p>
          <div class="empty-actions">
            <button @click="clearSearch" class="action-btn primary">
              <X :size="16" />
              Effacer la recherche
            </button>
          </div>
        </div>

        <div v-else class="patients-list">
          <div 
            v-for="patient in filteredPatients" 
            :key="patient.id" 
            @click="selectPatient(patient.id)"
            :class="{ selected: selectedPatient?.id === patient.id }"
            class="patient-card"
          >
            <div class="card-header">
              <div class="patient-info">
                <div class="patient-avatar">
                  {{ getInitials(patient.user?.first_name, patient.user?.last_name) }}
                </div>
                <div class="patient-details">
                  <h3 class="patient-name">{{ patient.user?.first_name }} {{ patient.user?.last_name }}</h3>
                  <span class="patient-id">ID: #{{ patient.id }}</span>
                  <span class="patient-email">{{ patient.user?.email }}</span>
                </div>
              </div>
              <div class="selection-indicator" v-if="selectedPatient?.id === patient.id">
                <CheckCircle :size="20" />
              </div>
            </div>

            <div class="card-content">
              <div class="patient-details-grid">
                <div class="detail-item">
                  <Calendar :size="16" />
                  <span>{{ formatDate(patient.user?.birth_date) }}</span>
                </div>
                <div class="detail-item">
                  <User :size="16" />
                  <span>{{ patient.genre || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <Activity :size="16" />
                  <span>{{ patient.group_sanguine || 'N/A' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Patient Details Modal -->
      <div v-if="selectedPatient" class="patient-details-modal">
        <div class="modal-overlay" @click="closePatientDetails"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">
              <User :size="24" />
              Dossier de {{ selectedPatient.user?.first_name }} {{ selectedPatient.user?.last_name }}
            </h2>
            <button @click="closePatientDetails" class="close-btn">
              <X :size="20" />
            </button>
          </div>

          <div class="modal-body">
            <div class="details-grid">
              <section class="card">
                <div class="card-header">
                  <div class="card-icon">
                    <User :size="20" />
                  </div>
                  <h3 class="card-title">Informations Personnelles</h3>
                </div>
                <div class="card-content">
                  <div class="info-list">
                    <div class="info-item">
                      <span class="label">Date de naissance:</span>
                      <span class="value">{{ formatDate(selectedPatient.user?.birth_date) }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Sexe:</span>
                      <span class="value badge">{{ selectedPatient.genre || 'N/A' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Groupe sanguin:</span>
                      <span class="value badge danger">{{ selectedPatient.group_sanguine || 'N/A' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Maladies chroniques:</span>
                      <span class="value">{{ selectedPatient.maladies_chroniques || 'Aucune' }}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section class="card">
                <div class="card-header">
                  <div class="card-icon">
                    <FileText :size="20" />
                  </div>
                  <h3 class="card-title">Prescriptions Récentes</h3>
                </div>
                <div class="card-content">
                  <div v-if="prescriptionStore.isLoading" class="loading-text">Chargement...</div>
                  <div v-else-if="patientPrescriptions.length > 0">
                    <div v-for="prescription in patientPrescriptions" :key="prescription.id" class="prescription-item">
                      <div class="prescription-header">
                        <strong>Ordonnance #{{ prescription.id }}</strong>
                        <span>{{ formatDate(prescription.created_at) }}</span>
                      </div>
                      <div class="medication-list">
                        <div v-for="(line, idx) in prescription.lines" :key="idx" class="medication-item">
                          <strong>{{ line.medication_name }}</strong>
                          <span>{{ line.dosage }} | {{ line.frequency }} | {{ line.duration }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p v-else class="empty-text">Aucune ordonnance.</p>
                </div>
              </section>

              <section class="card">
                <div class="card-header">
                  <div class="card-icon">
                    <Activity :size="20" />
                  </div>
                  <h3 class="card-title">Analyses Laboratoire</h3>
                </div>
                <div class="card-content">
                  <div v-if="labStore.isLoading" class="loading-text">Chargement...</div>
                  <div v-else-if="patientLabRequests.length > 0">
                    <div v-for="analysis in patientLabRequests" :key="analysis.id" class="analysis-item">
                      <div class="analysis-header">
                        <strong>{{ analysis.name }}</strong>
                        <span :class="getStatusClass(analysis.status)">{{ analysis.status }}</span>
                      </div>
                      <p class="analysis-date">Demandé le {{ formatDate(analysis.created_at) }}</p>
                    </div>
                  </div>
                  <p v-else class="empty-text">Aucune analyse trouvée.</p>
                </div>
              </section>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="imprimerDossier" class="action-btn primary">
              <Printer :size="16" />
              Imprimer le Dossier
            </button>
          </div>
        </div>
      </div>
    </div>
  </MedecinLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import MedecinLayout from '@/layouts/MedecinLayout.vue'
import {
  Users, User, UserCheck, Activity, Calendar, Search, RefreshCw, Printer,
  AlertCircle, CheckCircle, X, FileText
} from 'lucide-vue-next'

// STORES
import { usePatientStore } from '@/stores/patientStore'
import { usePrescriptionStore } from '@/stores/prescriptionStore'
import { useLabStore } from '@/stores/labStore'
import { useConsultationStore } from '@/stores/consultationStore'

const patientStore = usePatientStore()
const prescriptionStore = usePrescriptionStore()
const labStore = useLabStore()
const consultationStore = useConsultationStore()

const searchTerm = ref('')
let debounceTimeout = null
const selectedPatient = ref(null)
const loadingDme = ref(false)

// COMPUTED DATA
const patientPrescriptions = computed(() => prescriptionStore.prescriptions)
const patientLabRequests = computed(() => labStore.labRequests)
const patientConsultations = computed(() => consultationStore.patientConsultations)

const filteredPatients = computed(() => {
    let patientsSource = patientStore.patients?.data || patientStore.patients;
    if (!Array.isArray(patientsSource)) return [];

    if (!searchTerm.value) return patientsSource;

    const query = searchTerm.value.toLowerCase();
    return patientsSource.filter(p =>
        p.user && (
            p.user.first_name.toLowerCase().includes(query) ||
            p.user.last_name.toLowerCase().includes(query) ||
            p.user.email.toLowerCase().includes(query)
        )
    )
})

// SELECTION PATIENT
async function selectPatient(patientId) {
    const source = Array.isArray(patientStore.patients) ? patientStore.patients : patientStore.patients?.data;
    const patient = source?.find(p => p.id === patientId)
    
    if (patient) {
        selectedPatient.value = patient
        loadingDme.value = true;
        
        console.log("🔍 Sélection du patient :", patientId);
        
        try {
            await Promise.all([
                prescriptionStore.fetchPatientPrescriptions(patientId),
                labStore.listLabRequests({ patient_id: patientId }),
                consultationStore.fetchPatientConsultations(patientId)
            ]);
            
            // LOGS DE VÉRIFICATION APRÈS APPEL
            console.log("💊 Prescriptions reçues :", prescriptionStore.prescriptions);
            console.log("🔬 Analyses reçues :", labStore.labRequests);
            console.log("📅 Consultations reçues :", consultationStore.patientConsultations);
            
        } catch (error) {
            console.error("❌ Erreur lors du chargement des données :", error);
        }
        
        loadingDme.value = false;
    }
}
const handleSearch = () => {
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => {
        console.log(`Recherche : ${searchTerm.value}`);
    }, 300)
}

// UTILS
const getPatientPhoto = (patient) => {
    const user = patient?.user;
    if (user?.profile_photo_url) return user.profile_photo_url;
    
    if (user?.profile_photo_path) {
        const cleanedPath = user.profile_photo_path.replace('public/', '');
        return `http://localhost:8000/storage/${cleanedPath}`;
    }
    return 'https://via.placeholder.com/45/0040d0/ffffff?text=P';
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    });
}

const getStatusClass = (status) => {
    const s = status?.toLowerCase();
    if (s === 'completed' || s === 'terminé') return 'status-done';
    if (s === 'pending' || s === 'en cours') return 'status-pending';
    return 'status-default';
}

// Nouvelles fonctions utilitaires
const getInitials = (firstName, lastName) => {
  if (!firstName || !lastName) return '??'
  return `${firstName[0]}${lastName[0]}`.toUpperCase()
}

const getActivePatientsCount = () => {
  return filteredPatients.value.length
}

const clearSearch = () => {
  searchTerm.value = ''
}

const closePatientDetails = () => {
  selectedPatient.value = null
}

const loadPatients = () => {
  patientStore.allPatient()
}

const printPatients = () => {
  window.print()
}

const imprimerDossier = () => {
  if (!selectedPatient.value) return
  
  // Créer le contenu HTML à imprimer avec design amélioré
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Dossier Médical - ${selectedPatient.value.user?.first_name} ${selectedPatient.value.user?.last_name}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          padding: 25px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          color: #1a202c;
          font-size: 12px;
          line-height: 1.6;
          min-height: 100vh;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .header {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
          position: relative;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.2"/><circle cx="20" cy="60" r="0.5" fill="white" opacity="0.2"/><circle cx="80" cy="40" r="0.5" fill="white" opacity="0.2"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          opacity: 0.3;
        }
        
        .title {
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 15px 0;
          position: relative;
          z-index: 1;
        }
        
        .subtitle {
          font-size: 14px;
          opacity: 0.9;
          margin: 0;
          position: relative;
          z-index: 1;
        }
        
        .patient-info {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 20px;
          margin-top: 20px;
          position: relative;
          z-index: 1;
        }
        
        .patient-info h2 {
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 8px 0;
        }
        
        .patient-info p {
          margin: 4px 0;
          opacity: 0.9;
          font-size: 13px;
        }
        
        .content {
          padding: 30px;
        }
        
        .section {
          margin-bottom: 35px;
          page-break-inside: avoid;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #2563eb;
          margin: 0 0 20px 0;
          padding: 12px 0;
          border-bottom: 3px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        
        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 8px;
          border-left: 4px solid #2563eb;
          transition: transform 0.2s ease;
        }
        
        .info-item:hover {
          transform: translateX(4px);
        }
        
        .label {
          font-weight: 600;
          color: #475569;
          font-size: 13px;
        }
        
        .value {
          font-weight: 500;
          color: #1e293b;
          font-size: 13px;
        }
        
        .item {
          margin-bottom: 20px;
          padding: 20px;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-radius: 12px;
          border-left: 4px solid #10b981;
          transition: all 0.3s ease;
        }
        
        .item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.15);
        }
        
        .item.analysis {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-left-color: #f59e0b;
        }
        
        .item.consultation {
          background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
          border-left-color: #6366f1;
        }
        
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .item-header h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
        }
        
        .date {
          font-size: 11px;
          color: #64748b;
          font-style: italic;
        }
        
        .status {
          font-size: 10px;
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .status-done { 
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); 
          color: #166534; 
          border: 1px solid #86efac;
        }
        
        .status-pending { 
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); 
          color: #92400e; 
          border: 1px solid #fcd34d;
        }
        
        .status-default { 
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); 
          color: #374151; 
          border: 1px solid #d1d5db;
        }
        
        .medication-list {
          margin-top: 12px;
        }
        
        .medication-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: white;
          border-radius: 6px;
          margin-bottom: 6px;
          font-size: 12px;
          border: 1px solid #e5e7eb;
        }
        
        .medication-name {
          font-weight: 600;
          color: #1e293b;
        }
        
        .medication-dosage {
          color: #64748b;
          font-size: 11px;
        }
        
        .notes {
          margin-top: 12px;
          padding: 12px;
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
          border-radius: 8px;
          font-size: 11px;
          border: 1px solid #fcd34d;
        }
        
        .empty {
          text-align: center;
          padding: 30px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 12px;
          color: #64748b;
          font-style: italic;
          border: 2px dashed #cbd5e1;
        }
        
        .footer {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 25px 30px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 11px;
        }
        
        .footer p {
          margin: 4px 0;
        }
        
        @media print {
          body { 
            margin: 0; 
            padding: 0; 
            background: white;
          }
          
          .container {
            box-shadow: none;
            border-radius: 0;
          }
          
          .section { 
            page-break-inside: avoid; 
          }
          
          .item {
            break-inside: avoid;
          }
        }
        
        @media (max-width: 600px) {
          .info-grid {
            grid-template-columns: 1fr;
          }
          
          .item-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="title">📋 Dossier Médical Patient</h1>
          <p class="subtitle">Système de Gestion Médicale</p>
          <div class="patient-info">
            <h2>${selectedPatient.value.user?.first_name} ${selectedPatient.value.user?.last_name}</h2>
            <p><strong>ID Patient:</strong> #${selectedPatient.value.id}</p>
            <p><strong>Date d'impression:</strong> ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <div class="content">
          <div class="section">
            <h3 class="section-title"> Informations Personnelles</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Date de naissance:</span>
                <span class="value">${formatDate(selectedPatient.value.user?.birth_date)}</span>
              </div>
              <div class="info-item">
                <span class="label">Sexe:</span>
                <span class="value">${selectedPatient.value.genre || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="label">Groupe sanguin:</span>
                <span class="value">${selectedPatient.value.group_sanguine || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="label">Email:</span>
                <span class="value">${selectedPatient.value.user?.email}</span>
              </div>
              <div class="info-item">
                <span class="label">Téléphone:</span>
                <span class="value">${selectedPatient.value.user?.phone || 'Non renseigné'}</span>
              </div>
              <div class="info-item">
                <span class="label">Maladies chroniques:</span>
                <span class="value">${selectedPatient.value.maladies_chroniques || 'Aucune'}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">💊 Prescriptions Récentes</h3>
            ${patientPrescriptions.value.length > 0 ? 
              patientPrescriptions.value.map(prescription => `
                <div class="item">
                  <div class="item-header">
                    <h4>Ordonnance #${prescription.id}</h4>
                    <span class="date">${formatDate(prescription.created_at)}</span>
                  </div>
                  ${prescription.lines ? `
                    <div class="medication-list">
                      ${prescription.lines.map(line => `
                        <div class="medication-item">
                          <span class="medication-name">${line.medication_name}</span>
                          <span class="medication-dosage">${line.dosage} | ${line.frequency} | ${line.duration}</span>
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                  ${prescription.notes ? `<div class="notes"><strong>Notes:</strong> ${prescription.notes}</div>` : ''}
                </div>
              `).join('') : 
              '<div class="empty">📝 Aucune prescription enregistrée.</div>'
            }
          </div>

          <div class="section">
            <h3 class="section-title">🔬 Analyses Laboratoire</h3>
            ${patientLabRequests.value.length > 0 ? 
              patientLabRequests.value.map(analysis => `
                <div class="item analysis">
                  <div class="item-header">
                    <h4>${analysis.name}</h4>
                    <span class="status ${getStatusClass(analysis.status)}">${analysis.status}</span>
                  </div>
                  <p class="date">📅 Demandé le ${formatDate(analysis.created_at)}</p>
                  ${analysis.resultats && analysis.resultats.length > 0 ? 
                    analysis.resultats.map(res => res.comments ? `<div class="notes"><strong>Observations:</strong> ${res.comments}</div>` : '').join('') : 
                    ''
                  }
                </div>
              `).join('') : 
              '<div class="empty">🔬 Aucune analyse trouvée.</div>'
            }
          </div>

          <div class="section">
            <h3 class="section-title">📅 Historique des Consultations</h3>
            ${patientConsultations.value.length > 0 ? 
              patientConsultations.value.map(consultation => `
                <div class="item consultation">
                  <div class="item-header">
                    <h4>📅 ${formatDate(consultation.appointment_date)}</h4>
                    <span class="status">${consultation.status}</span>
                  </div>
                  <p><strong>Motif:</strong> ${consultation.motif}</p>
                  <p><strong>Type:</strong> ${consultation.type}</p>
                </div>
              `).join('') : 
              '<div class="empty">📅 Aucune consultation enregistrée.</div>'
            }
          </div>
        </div>

        <div class="footer">
          <p><strong>Généré le</strong> ${new Date().toLocaleString('fr-FR')}</p>
          <p><strong>par</strong> le système médical Santeko</p>
          <p>📄 Page 1</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  // Ouvrir une fenêtre d'impression
  const printWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes')
  printWindow.document.write(printContent)
  printWindow.document.close()
  
  // Imprimer automatiquement après un court délai pour s'assurer que le contenu est chargé
  setTimeout(() => {
    printWindow.print()
    // Fermer la fenêtre après l'impression (ou après un timeout si l'utilisateur annule)
    setTimeout(() => {
      printWindow.close()
    }, 1000)
  }, 500)
}

onMounted(() => {
    patientStore.allPatient();
})
</script>

<style scoped>
.dashboard-container {
  --primary: #2563eb;
  --primary-dark: #1e40af;
  --primary-light: #3b82f6;
  --secondary: #10b981;
  --secondary-dark: #059669;
  --accent: #8b5cf6;
  --danger: #ef4444;
  --warning: #f59e0b;
  --success: #22c55e;
  --dark: #0f172a;
  --light: #ffffff;
  --gray: #94a3b8;
  --gray-light: #cbd5e1;
  --gray-dark: #64748b;
  --border: rgba(255, 255, 255, 0.1);
  --shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
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
.dashboard-container::before {
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

.dashboard-container > * {
  position: relative;
  z-index: 1;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  gap: 1.5rem;
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

.page-title {
  font-size: 2.2rem;
  font-weight: 900;
  color: white;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.title-icon { 
  color: white; 
  background: linear-gradient(135deg, var(--primary), var(--secondary)); 
  padding: 12px; 
  border-radius: 14px; 
  box-shadow: var(--shadow-lg);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 15px 35px rgba(37, 99, 235, 0.5);
  }
}

.page-subtitle { 
  color: var(--light); 
  font-size: 1.1rem; 
  margin-top: 8px;
  opacity: 0.9;
}

.header-actions { display: flex; gap: 1rem; }
.action-btn {
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  transition: all 0.3s ease;
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.action-btn.primary { 
  background: linear-gradient(135deg, var(--primary), var(--secondary)); 
  color: white; 
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.5);
}

.action-btn.secondary { 
  background: rgba(255, 255, 255, 0.08); 
  color: white; 
  border: 2px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(255, 255, 255, 0.1);
}

.search-header {
  display: block;
  animation: fadeInUp 0.8s ease-out 0.3s both;
  margin-bottom: 2rem;
}

.search-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border-radius: var(--radius);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  transition: all 0.4s ease;
  position: relative;
  padding: 1.5rem;
  margin-bottom: 2rem;
  max-width: 900px;
  width: 100%;
}

.search-card::before {
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

.search-card:hover::before {
  transform: scaleX(1);
}

.search-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  animation: fadeInUp 0.8s ease-out 0.3s both;
  margin-bottom: 2rem;
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

.card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border-radius: var(--radius);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  transition: all 0.4s ease;
  position: relative;
}

.card::before {
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

.card:hover::before {
  transform: scaleX(1);
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
}

.card-header { 
  padding: 1.5rem; 
  border-bottom: 1px solid rgba(255, 255, 255, 0.1); 
  display: flex; 
  align-items: center; 
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
}

.card-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
  transition: all 0.3s ease;
}

.card-icon.pulse {
  animation: pulse 2s infinite;
}

.card-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: white;
  margin: 0;
  flex: 1;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.card-content {
  padding: 1.5rem;
}

/* Search */
.search-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: var(--gray);
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input::placeholder {
  color: var(--gray);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Vitals Grid */
.vitals-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.vital-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border-left: 3px solid var(--secondary);
  transition: all 0.3s ease;
}

.vital-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(5px);
}

.vital-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--secondary), var(--accent));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 6px 15px rgba(16, 185, 129, 0.3);
}

.vital-icon.heart {
  background: linear-gradient(135deg, #ef4444, #f97316);
}

.vital-icon.temp {
  background: linear-gradient(135deg, var(--warning), var(--accent));
}

.vital-info {
  flex: 1;
}

.vital-label {
  color: var(--gray);
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.vital-value {
  color: white;
  font-size: 1.5rem;
  font-weight: 800;
}

/* Patients Section */
.patients-section {
  margin-top: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  margin: 0;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.patients-count {
  background: linear-gradient(135deg, var(--accent), var(--secondary));
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
}

.patients-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.patient-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border-radius: var(--radius);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  transition: all 0.4s ease;
  position: relative;
  cursor: pointer;
}

.patient-card::before {
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

.patient-card:hover::before {
  transform: scaleX(1);
}

.patient-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
}

.patient-card.selected {
  border-color: var(--secondary);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
}

.patient-card .card-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.patient-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.patient-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
}

.patient-details {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.patient-name {
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  margin: 0;
}

.patient-id, .patient-email {
  color: var(--gray);
  font-size: 0.85rem;
  font-weight: 600;
}

.selection-indicator {
  color: var(--success);
}

.patient-details-grid {
  display: flex;
  gap: 2rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray);
  font-size: 0.9rem;
}

/* Modal */
.patient-details-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
}

.modal-content {
  position: relative;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
  backdrop-filter: blur(20px);
  border-radius: var(--radius);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-xl);
  max-width: 1400px;
  width: 100%;
  max-height: 95vh;
  overflow-y: auto;
}

.modal-header {
  padding: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 2rem;
}

.modal-footer {
  padding: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.info-item .label {
  color: var(--gray);
  font-weight: 600;
}

.info-item .value {
  color: white;
  font-weight: 700;
}

.info-item .value.badge {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
}

.info-item .value.badge.danger {
  background: linear-gradient(135deg, var(--danger), var(--warning));
}

.prescription-item, .analysis-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.prescription-header, .analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.medication-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.medication-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 4px;
}

.analysis-date {
  color: var(--gray);
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

/* States */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;
}

.loading-state h3 {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.error-state h3 {
  color: var(--danger);
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.state-container p {
  color: white;
  opacity: 0.8;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.icon-container {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.error-state .icon-container {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1));
  border-color: rgba(239, 68, 68, 0.3);
}

.retry-btn {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
}

.retry-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.5);
}

.spinner-container {
  margin-bottom: 2rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Empty States */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--gray);
}

.empty-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray);
  margin: 0 auto 1.5rem;
}

.empty-state h4 {
  color: white;
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--gray);
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 2rem;
}

.empty-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Status classes */
.status-done { color: var(--success); }
.status-pending { color: var(--warning); }
.status-default { color: var(--gray); }

.loading-text, .empty-text {
  color: var(--gray);
  font-style: italic;
  text-align: center;
  padding: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-header { 
    flex-direction: column; 
    align-items: flex-start; 
    gap: 1rem;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
  
  .header-actions { 
    width: 100%; 
    flex-direction: column;
  }
  
  .action-btn { 
    flex: 1; 
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .patient-details-grid {
    flex-direction: column;
    gap: 1rem;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .empty-actions {
    flex-direction: column;
  }
  
  .modal-content {
    margin: 1rem;
    max-height: 95vh;
  }
}

/* Print Styles */
@media print {
  .dashboard-container {
    background: white !important;
    color: black !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
    height: auto !important;
  }

  .dashboard-container::before {
    display: none !important;
  }

  .dashboard-header {
    background: linear-gradient(135deg, #2563eb, #10b981) !important;
    color: white !important;
    padding: 1.5rem !important;
    margin-bottom: 1rem !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    animation: none !important;
  }

  .page-title {
    color: white !important;
    font-size: 1.5rem !important;
    text-shadow: none !important;
  }

  .title-icon {
    background: white !important;
    color: #2563eb !important;
    animation: none !important;
  }

  .page-subtitle {
    color: rgba(255, 255, 255, 0.9) !important;
  }

  .header-actions {
    display: none !important;
  }

  .card {
    background: white !important;
    border: 2px solid #e5e7eb !important;
    box-shadow: none !important;
    margin-bottom: 1rem !important;
    page-break-inside: avoid;
  }

  .card::before {
    display: none !important;
  }

  .card:hover {
    transform: none !important;
    box-shadow: none !important;
  }

  .card-header {
    background: linear-gradient(135deg, #2563eb, #10b981) !important;
    color: white !important;
    border-bottom: 2px solid #e5e7eb !important;
  }

  .card-icon {
    background: white !important;
    color: #2563eb !important;
    box-shadow: none !important;
    animation: none !important;
  }

  .card-title {
    color: white !important;
    text-shadow: none !important;
  }

  .vital-item {
    background: #f9fafb !important;
    border-left: 3px solid #10b981 !important;
  }

  .vital-item:hover {
    transform: none !important;
  }

  .vital-icon {
    background: linear-gradient(135deg, #2563eb, #10b981) !important;
    color: white !important;
    box-shadow: none !important;
  }

  .vital-label {
    color: #6b7280 !important;
  }

  .vital-value {
    color: #111827 !important;
  }

  .patient-card {
    background: white !important;
    border: 2px solid #e5e7eb !important;
    box-shadow: none !important;
    margin-bottom: 1rem !important;
    page-break-inside: avoid;
  }

  .patient-card::before {
    display: none !important;
  }

  .patient-card:hover {
    transform: none !important;
    box-shadow: none !important;
  }

  .patient-card.selected {
    border-color: #10b981 !important;
    background: #f0fdf4 !important;
  }

  .patient-card .card-header {
    background: linear-gradient(135deg, #2563eb, #10b981) !important;
    color: white !important;
    border-bottom: 2px solid #e5e7eb !important;
  }

  .patient-avatar {
    background: linear-gradient(135deg, #2563eb, #10b981) !important;
    color: white !important;
    box-shadow: none !important;
  }

  .patient-name {
    color: #111827 !important;
  }

  .patient-id, .patient-email {
    color: #6b7280 !important;
  }

  .selection-indicator {
    color: #10b981 !important;
  }

  .detail-item {
    color: #6b7280 !important;
  }

  .search-container,
  .patient-details-modal,
  .empty-actions,
  .header-actions {
    display: none !important;
  }

  .section-header {
    border-bottom: 2px solid #e5e7eb !important;
    padding-bottom: 0.5rem !important;
    margin-bottom: 1rem !important;
  }

  .section-title {
    color: #111827 !important;
  }

  .patients-count {
    background: #e5e7eb !important;
    color: #374151 !important;
  }

  .empty-state {
    background: white !important;
    color: #6b7280 !important;
    border: 2px solid #e5e7eb !important;
  }

  .empty-icon {
    background: #f3f4f6 !important;
    color: #6b7280 !important;
  }

  .empty-state h4 {
    color: #111827 !important;
  }

  .empty-state p {
    color: #6b7280 !important;
  }
}

</style>