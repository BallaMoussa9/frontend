<template>
  <MedecinLayout>
    <div class="patients-page">
      <aside class="patient-list-container no-print">
        <h2 class="section-title">Annuaire Patients</h2>

        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchTerm"
            @input="handleSearch"
            placeholder="Nom, email, ID..."
            class="search-input"
          />
        </div>

        <div v-if="patientStore.loading" class="loading-overlay">
          <div class="spinner"></div>
          <p>Chargement...</p>
        </div>

        <div v-if="patientStore.error" class="error-banner">
          {{ patientStore.error }}
        </div>

        <ul class="patient-list">
          <li v-if="!patientStore.loading && filteredPatients.length === 0" class="empty-list">
            Aucun patient trouvé.
          </li>

          <li
            v-for="patient in filteredPatients"
            :key="patient.id"
            @click="selectPatient(patient.id)"
            :class="{ selected: selectedPatient?.id === patient.id }"
            class="patient-card"
          >
            <div class="patient-entry">
              <img :src="getPatientPhoto(patient)" alt="Photo" class="avatar" />
              <div class="info">
                <strong>{{ patient.user?.first_name }} {{ patient.user?.last_name }}</strong>
                <small class="id-tag">ID: #{{ patient.id }}</small>
                <small class="email">{{ patient.user?.email }}</small>
              </div>
            </div>
            <span v-if="selectedPatient?.id === patient.id" class="arrow-indicator">➤</span>
          </li>
        </ul>
      </aside>

      <main class="patient-details-container">
        <div v-if="!selectedPatient" class="placeholder no-print">
          <div class="placeholder-icon">📁</div>
          <p>Sélectionnez un patient pour consulter son Dossier Médical Électronique (DME)</p>
        </div>

        <div v-else class="patient-details">
          <header class="details-header">
            <div class="header-info">
              <h1>Dossier de {{ selectedPatient.user?.first_name }} {{ selectedPatient.user?.last_name }}</h1>
              <span v-if="loadingDme" class="inline-loader no-print">🔄 Actualisation du DME...</span>
            </div>
            <button class="btn-print no-print" @click="imprimerDossier">
              🖨️ Imprimer le Dossier
            </button>
          </header>

          <div class="details-grid">
            <section class="card-section">
              <h3>👤 Informations Personnelles</h3>
              <div class="info-grid">
                <p><strong>Naissance:</strong> {{ formatDate(selectedPatient.user?.birth_date) }}</p>
                <p><strong>Sexe:</strong> <span class="badge-blue">{{ selectedPatient.genre || 'N/A' }}</span></p>
                <p><strong>Groupe Sanguin:</strong> <span class="badge-red">{{ selectedPatient.group_sanguine || 'N/A' }}</span></p>
                <p><strong>Maladies Chroniques:</strong> {{ selectedPatient.maladies_chroniques || 'Aucune' }}</p>
              </div>
            </section>

            <section class="card-section">
              <h3>💊 Prescriptions Récentes</h3>
              <div v-if="prescriptionStore.isLoading" class="loading-text">Chargement...</div>
              <div v-else-if="patientPrescriptions.length > 0">
                <div v-for="prescription in patientPrescriptions" :key="prescription.id" class="data-item">
                  <div class="item-header">
                    <strong>Ordonnance #{{ prescription.id }}</strong>
                    <span>{{ formatDate(prescription.created_at) }}</span>
                  </div>
                  <ul class="med-list">
                    <li v-for="(line, idx) in prescription.lines" :key="idx">
                      🔹 {{ line.medicament_name }} ({{ line.dosage }})
                    </li>
                  </ul>
                </div>
              </div>
              <p v-else class="empty-text">Aucune ordonnance.</p>
            </section>

            <section class="card-section">
              <h3>🔬 Laboratoire & Analyses</h3>
              <div v-if="labStore.isLoading" class="loading-text">Chargement...</div>
              <div v-else-if="patientLabRequests.length > 0">
                <div v-for="analysis in patientLabRequests" :key="analysis.id" class="data-item">
                  <div class="item-header">
                    <strong>{{ analysis.type_of_analysis }}</strong>
                    <span :class="getStatusClass(analysis.status)">{{ analysis.status }}</span>
                  </div>
                  <p class="small-date">Demandé le {{ formatDate(analysis.created_at) }}</p>
                </div>
              </div>
              <p v-else class="empty-text">Aucune analyse trouvée.</p>
            </section>

            <section class="card-section">
              <h3>📅 Historique des Visites</h3>
              <div v-if="consultationStore.loading" class="loading-text">Chargement...</div>
              <div v-else-if="patientConsultations.length > 0">
                <div v-for="consultation in patientConsultations" :key="consultation.id" class="data-item consultation">
                  <div class="item-header">
                    <strong>{{ formatDate(consultation.start_date) }}</strong>
                    <span class="status-badge">{{ consultation.status }}</span>
                  </div>
                  <p><em>Motif:</em> {{ consultation.reason_for_visit }}</p>
                </div>
              </div>
              <p v-else class="empty-text">Aucun historique.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  </MedecinLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import MedecinLayout from '@/layouts/MedecinLayout.vue'

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

// LOGIQUE D'IMPRESSION
const imprimerDossier = () => {
    window.print();
}

// SELECTION PATIENT
async function selectPatient(patientId) {
    const source = Array.isArray(patientStore.patients) ? patientStore.patients : patientStore.patients?.data;
    const patient = source?.find(p => p.id === patientId)
    
    if (patient) {
        selectedPatient.value = patient
        loadingDme.value = true;
        
        await Promise.all([
            prescriptionStore.fetchPatientPrescriptions(patientId),
            labStore.listLabRequests({ patient_id: patientId }),
            consultationStore.fetchPatientConsultations(patientId)
        ])
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

onMounted(() => {
    patientStore.allPatient();
})
</script>

<style scoped>
.patients-page { display: flex; height: calc(100vh - 80px); gap: 20px; padding: 20px; background-color: #f0f2f5; }

/* Liste à gauche */
.patient-list-container { width: 350px; background: white; border-radius: 12px; display: flex; flex-direction: column; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.section-title { padding: 20px; font-size: 1.2rem; color: #1a2b4b; border-bottom: 1px solid #eee; margin: 0; }
.search-bar { padding: 15px; position: relative; }
.search-input { width: 100%; padding: 10px 10px 10px 35px; border: 1px solid #ddd; border-radius: 8px; font-size: 0.9rem; }
.search-icon { position: absolute; left: 25px; top: 25px; color: #999; }

.patient-list { flex: 1; overflow-y: auto; list-style: none; padding: 0; }
.patient-card { display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #f5f5f5; cursor: pointer; transition: 0.2s; }
.patient-card:hover { background: #f8faff; }
.patient-card.selected { background: #eef2ff; border-left: 4px solid #0040d0; }
.avatar { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; background: #eee; }
.info { display: flex; flex-direction: column; margin-left: 12px; flex: 1; }
.info strong { font-size: 0.95rem; color: #333; }
.id-tag { font-size: 0.75rem; color: #0040d0; font-weight: 600; }
.email { font-size: 0.75rem; color: #888; }

/* Dossier à droite */
.patient-details-container { flex: 1; background: white; border-radius: 12px; overflow-y: auto; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.placeholder { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8; text-align: center; padding: 40px; }
.placeholder-icon { font-size: 4rem; margin-bottom: 20px; opacity: 0.3; }

.patient-details { padding: 30px; }
.details-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #f0f2f5; padding-bottom: 20px; }
.details-header h1 { font-size: 1.5rem; color: #1a2b4b; margin: 0; }
.inline-loader { font-size: 0.8rem; color: #0040d0; animation: pulse 1.5s infinite; }

.details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.card-section { background: #f8faff; border: 1px solid #eef2ff; border-radius: 10px; padding: 20px; }
.card-section h3 { font-size: 1rem; color: #1a2b4b; margin-top: 0; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9rem; }
.badge-blue { background: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 4px; }
.badge-red { background: #fee2e2; color: #b91c1c; padding: 2px 8px; border-radius: 4px; font-weight: bold; }

.data-item { background: white; padding: 12px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #edf2f7; }
.item-header { display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 5px; }
.med-list { padding-left: 0; list-style: none; font-size: 0.85rem; margin-top: 8px; }
.status-done { color: #059669; font-weight: bold; }
.status-pending { color: #d97706; font-weight: bold; }

.btn-print { background: #0040d0; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.3s; }
.btn-print:hover { background: #0030a0; }

@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

/* --- LOGIQUE D'IMPRESSION --- */
@media print {
  .no-print { display: none !important; }
  
  .patients-page { display: block; padding: 0; background: white; }
  .patient-details-container { box-shadow: none; border: none; }
  .patient-details { padding: 0; }
  .details-grid { display: block; }
  .card-section { 
    margin-bottom: 30px; 
    border: 1px solid #eee !important; 
    break-inside: avoid;
    background: #f8faff !important;
    -webkit-print-color-adjust: exact; 
  }
  .details-header { border-bottom: 2px solid #333; }
}
</style>