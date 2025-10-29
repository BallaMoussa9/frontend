<template>
  <MedecinLayout>
    <div class="patients-page">
      <div class="patient-list-container">
        <h2 class="section-title">Liste de tous les Patients</h2>

        <div class="search-bar">
          <input
            v-model="searchTerm"
            @input="handleSearch"
            placeholder="Rechercher par nom, email..."
            class="search-input"
          />
          <span class="search-icon">🔍</span>
        </div>

        <div v-if="patientStore.loading" class="loading-overlay">
          <p>Chargement des patients en cours...</p>
        </div>
        <p v-if="patientStore.error" class="error-message">Erreur lors du chargement : {{ patientStore.error }}</p>

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
                <small>Patient ID: {{ patient.id }}</small>
                <small class="email">{{ patient.user?.email }}</small>
              </div>
            </div>
             <span v-if="selectedPatient?.id === patient.id" class="arrow-indicator">►</span>
          </li>
        </ul>
      </div>

      <div class="patient-details-container">
        <div v-if="!selectedPatient" class="placeholder">
          Sélectionnez un patient dans la liste de gauche pour afficher son dossier médical.
        </div>

        <div v-else class="patient-details">
            <h2 class="details-header">
                Dossier de {{ selectedPatient.user?.first_name }} {{ selectedPatient.user?.last_name }}
                <div v-if="loadingDme" class="inline-loader">Chargement DME...</div>
            </h2>

            <section class="patient-info card-section">
                <h3>Informations Personnelles</h3>
                <p><strong>Date de naissance:</strong> {{ selectedPatient.user?.birth_date }}</p>
                <p><strong>Sexe:</strong> {{ selectedPatient.genre }}</p>
                <p><strong>Groupe Sanguin:</strong> {{ selectedPatient.group_sanguine }}</p>
                <p><strong>Maladies Chroniques:</strong> {{ selectedPatient.maladies_chroniques || 'Aucune' }}</p>
            </section>

            <section class="prescription-section card-section">
                <h3>Prescriptions Récentes</h3>
                <div v-if="prescriptionStore.isLoading" class="info-text">Chargement des prescriptions...</div>
                <div v-else-if="prescriptionStore.getError" class="error-message">{{ prescriptionStore.getError }}</div>

                <div v-else-if="patientPrescriptions.length > 0">
                    <div v-for="prescription in patientPrescriptions" :key="prescription.id" class="prescription-card">
                        <p><strong>Ordonnance ID:</strong> {{ prescription.id }} | <strong>Date:</strong> {{ formatDate(prescription.created_at) }}</p>
                        <p v-if="prescription.notes"><strong>Notes:</strong> {{ prescription.notes }}</p>

                        <ul class="medication-list" v-if="prescription.lines && prescription.lines.length > 0">
                            <li v-for="(line, index) in prescription.lines" :key="index">
                                {{ line.medicament_name || 'Médicament non spécifié' }} ({{ line.dosage || 'Dosage non spécifié' }})
                            </li>
                        </ul>
                        <p v-else class="info-text no-lines">
                           ⚠️ Cette ordonnance est enregistrée mais ne contient aucune ligne de médicament.
                        </p>
                    </div>
                </div>
                <p v-else class="info-text">
                    Aucune prescription trouvée pour ce patient.
                </p>
            </section>

            <section class="analysis-section card-section">
                <h3>Analyses Récentes & Résultats</h3>
                <div v-if="labStore.isLoading" class="info-text">Chargement des demandes d'analyses...</div>
                <div v-else-if="labStore.getError" class="error-message">{{ labStore.getError }}</div>

                <div v-else-if="patientLabRequests.length > 0">
                    <div v-for="analysis in patientLabRequests" :key="analysis.id" class="analysis-card">
                        <h4>{{ analysis.type_of_analysis || 'Analyse (Type non spécifié)' }}</h4>
                        <p><strong>Demande ID:</strong> {{ analysis.id }} | <strong>Date de la demande:</strong> {{ formatDate(analysis.created_at) }}</p>
                        <p><strong>Statut:</strong> <span :class="getStatusClass(analysis.status)">{{ analysis.status }}</span></p>

                        <div v-if="analysis.status === 'completed' || analysis.status === 'Terminé'" class="result-details">
                            <p class="info-text">Résultats : Le détail complet nécessiterait un appel à `labStore.getLabRequest(analysis.id)`. Statut : **Terminé**</p>
                            </div>
                    </div>
                </div>
                <p v-else class="info-text">Aucune demande d'analyse trouvée pour ce patient.</p>
            </section>

            <section class="consultation-section card-section">
                <h3>Historique des Consultations</h3>
                <div v-if="consultationStore.loading" class="info-text">Chargement de l'historique des consultations...</div>
                <div v-else-if="consultationStore.error" class="error-message">{{ consultationStore.error }}</div>

                <div v-else-if="patientConsultations.length > 0">
                    <div v-for="consultation in patientConsultations" :key="consultation.id" class="consultation-card">
                        <h4>Consultation du {{ formatDate(consultation.start_date) }}</h4>
                        <p><strong>ID:</strong> {{ consultation.id }}</p>
                        <p><strong>Motif:</strong> {{ consultation.reason_for_visit || 'Non spécifié' }}</p>
                        <p><strong>Statut:</strong> {{ consultation.status }}</p>
                    </div>
                </div>
                <p v-else class="info-text">Aucune consultation enregistrée.</p>
            </section>

        </div>
      </div>
    </div>
  </MedecinLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import MedecinLayout from '@/layouts/MedecinLayout.vue'

// IMPORT DES STORES
import { usePatientStore } from '@/stores/patientStore'
import { usePrescriptionStore } from '@/stores/prescriptionStore'
import { useLabStore } from '@/stores/labStore'
import { useConsultationStore } from '@/stores/consultationStore'

// INITIALISATION DES STORES
const patientStore = usePatientStore()
const prescriptionStore = usePrescriptionStore()
const labStore = useLabStore()
const consultationStore = useConsultationStore()

const searchTerm = ref('')
let debounceTimeout = null
const selectedPatient = ref(null)
const loadingDme = ref(false) // Pour gérer un loading global du DME

// Computed pour les données DME des Stores
const patientPrescriptions = computed(() => prescriptionStore.prescriptions)
const patientLabRequests = computed(() => labStore.labRequests)
const patientConsultations = computed(() => consultationStore.patientConsultations)


// ------------------- Logique de Données -------------------

const filteredPatients = computed(() => {

    let patientsSource = patientStore.patients;

    if (patientsSource && !Array.isArray(patientsSource) && Array.isArray(patientsSource.data)) {
        patientsSource = patientsSource.data;
    }

    if (!Array.isArray(patientsSource)) {
        return [];
    }

    let patients = patientsSource.filter(p => p);

    if (!searchTerm.value) {
        return patients
    }

    const query = searchTerm.value.toLowerCase()

    return patients.filter(p =>
        p.user && (
            p.user.first_name.toLowerCase().includes(query) ||
            p.user.last_name.toLowerCase().includes(query) ||
            p.user.email.toLowerCase().includes(query)
        )
    )
})


// Déclenchement des appels API lors de la sélection
async function selectPatient(patientId) {
    const source = Array.isArray(patientStore.patients) ? patientStore.patients : patientStore.patients?.data;

    const patient = source?.find(p => p.id === patientId)
    if (patient) {
        selectedPatient.value = patient
        console.log("Patient sélectionné :", patient.user?.last_name)

        loadingDme.value = true;

        // --- APPELS API RÉELS POUR LE DME ---
        await Promise.all([
            prescriptionStore.fetchPatientPrescriptions(patientId),
            // Assurez-vous que listLabRequests peut accepter {patient_id: patientId}
            labStore.listLabRequests({ patient_id: patientId }),
            consultationStore.fetchPatientConsultations(patientId)
        ])

        loadingDme.value = false;

        console.log("Prescriptions chargées:", prescriptionStore.prescriptions);
        console.log("Analyses chargées:", labStore.labRequests);
        console.log("Consultations chargées:", consultationStore.patientConsultations);
    }
}

const handleSearch = () => {
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => {
        console.log(`Filtre local appliqué pour : ${searchTerm.value}`);
    }, 300)
}


// ------------------- Utilitaires -------------------

const getPatientPhoto = (patient) => {
    const user = patient?.user;
    const photoUrl = user?.profile_photo_url;
    if (photoUrl) {
        return photoUrl;
    }
    const photoPath = user?.profile_photo_path;
    if (photoPath) {
        const cleanedPath = photoPath.startsWith('public/') ? photoPath.substring(7) : photoPath;
        return `http://localhost:8000/storage/${cleanedPath}`;
    }
    return 'https://via.placeholder.com/45/0040d0/ffffff?text=P';
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' });
}

const getStatusClass = (status) => {
    if (status === 'completed' || status === 'Terminé') return 'status-done';
    if (status === 'pending' || status === 'En cours' || status === 'created') return 'status-pending';
    return 'status-default';
}

// ------------------- Cycle de Vie -------------------

onMounted(() => {
    patientStore.allPatient();
})
</script>

<style scoped>
/* ------------------- Mise en page générale ------------------- */
.patients-page { display: flex; min-height: 80vh; gap: 20px; padding: 32px; background-color: #f4f7ff; }
.section-title { font-size: 1.5em; margin-bottom: 20px; color: #002580; border-bottom: 2px solid #e1e7f3; padding-bottom: 10px; }

/* ------------------- Colonne de gauche (Liste) ------------------- */
.patient-list-container { width: 350px; background-color: #fff; border: 1px solid #e1e7f3; padding: 20px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); position: relative; display: flex; flex-direction: column; }
.search-bar { position: relative; margin-bottom: 15px; }
.search-input { width: 100%; padding: 10px 10px 10px 40px; border-radius: 20px; border: 1px solid #ccc; box-sizing: border-box; font-size: 1em; }
.search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #6c757d; }
.patient-list { list-style: none; padding: 0; margin: 0; overflow-y: auto; flex-grow: 1; }
.patient-card { display: flex; justify-content: space-between; align-items: center; padding: 15px 10px; border-bottom: 1px solid #e9eef8; cursor: pointer; transition: background-color 0.2s, border-left 0.2s; }
.patient-card:hover { background-color: #f7f9fc; }
.patient-card.selected { background-color: #eaf0ff; border-left: 4px solid #0040d0; padding-left: 6px; font-weight: 600; }
.patient-entry { display: flex; align-items: center; gap: 15px; }
.avatar { width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: 2px solid #e1e7f3; }
.info { display: flex; flex-direction: column; }
.info strong { color: #333; font-size: 1.1em; }
.info small { font-size: 0.85em; color: #6c757d; }
.info small.email { font-size: 0.75em; }
.arrow-indicator { color: #0040d0; font-size: 1.1em; }
.empty-list, .loading-overlay p { text-align: center; padding: 20px; color: #6c757d; font-style: italic; }
.loading-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255, 255, 255, 0.8); display: flex; justify-content: center; align-items: center; z-index: 10; border-radius: 10px; }
.error-message { color: #c20000; padding: 10px; text-align: center; border-top: 1px solid #c20000; }

/* ------------------- Colonne de droite (Dossier) ------------------- */
.patient-details-container { flex: 1; background-color: #fff; border: 1px solid #e1e7f3; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); overflow-y: auto; }
.placeholder { padding: 50px; text-align: center; color: #999; font-size: 1.2em; font-style: italic; }
.patient-details { padding: 24px; }
.details-header { font-size: 1.8em; color: #0040d0; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 3px solid #eaf0ff; display: flex; justify-content: space-between; align-items: center; }
.inline-loader { font-size: 0.6em; color: #0040d0; }
.card-section { background-color: #fcfdff; border: 1px solid #e1e7f3; border-radius: 8px; padding: 20px; margin-bottom: 25px; }
.card-section h3 { color: #333; margin-bottom: 15px; font-size: 1.3em; border-bottom: 1px solid #eee; padding-bottom: 8px; }

/* Styles spécifiques aux Prescriptions et Analyses */
.prescription-card, .analysis-card, .consultation-card {
    border-left: 3px solid #0040d0;
    padding: 10px 15px;
    margin-bottom: 15px;
    background-color: #eaf0ff;
    border-radius: 4px;
}
.prescription-card strong, .consultation-card strong { color: #002580; }
.medication-list {
    list-style: disc;
    margin-left: 20px;
    padding-left: 0;
    font-size: 0.9em;
    color: #444;
}
.info-text.no-lines { color: #c20000; font-weight: 500;}

.analysis-card h4, .consultation-card h4 {
    margin: 5px 0 8px 0;
    font-size: 1.1em;
    color: #002580;
}
.result-details {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed #c0cff0;
}
.status-done {
    color: green;
    font-weight: bold;
}
.status-pending {
    color: orange;
    font-weight: bold;
}
.status-default {
    color: #444;
}
.info-text { font-style: italic; color: #6c757d; }
</style>
