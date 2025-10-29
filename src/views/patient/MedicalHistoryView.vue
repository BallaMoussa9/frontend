<template>
  <SidebarLayout>
    <section class="history-section">
      <h1>Historique Médical</h1>

      <div v-if="historyLoading" class="alert-info">Chargement de l'historique médical en cours...</div>

      <div v-if="historyError" class="alert-error">
        Erreur de chargement de l'historique : {{ historyError }}
      </div>

      <div v-if="currentPatientData || patientStore.loading || medicalRecordStore.loading || prescriptionStore.isLoading || labStore.isLoading || consultationStore.isLoading || medicalReportStore.isLoadingMedicalReports" class="debug-log">
        <h3>
            <span v-if="patientStore.loading || medicalRecordStore.loading">Chargement des données patient...</span>
            <span v-else-if="currentPatientData">Dossier Médical pour {{ currentPatientData.user.first_name }} {{ currentPatientData.user.last_name }}</span>
            <span v-else>Logs de Debug (Historique Patient)</span>
        </h3>

        <div v-if="currentPatientData" class="patient-info-display">
            <p><strong>Nom et Prénom :</strong> {{ currentPatientData.user.last_name }} {{ currentPatientData.user.first_name }}</p>
            <p><strong>Date de Naissance :</strong> {{ currentPatientData.user.birth_date }}</p>
            <p><strong>Groupe Sanguin :</strong> {{ currentPatientData.group_sanguine || 'N/A' }}</p>
            <p>
                <strong>N° Dossier Médical :</strong>
                <span v-if="medicalRecordStore.record">
                    {{ medicalRecordStore.record.numero_dossier || 'N/A' }}
                </span>
                <span v-else-if="currentPatientData.medical_record_id">
                    Chargement du Dossier ID {{ currentPatientData.medical_record_id }}...
                </span>
                <span v-else>
                    Dossier non créé (ID: {{ currentPatientData.medical_record_id || 'N/A' }})
                </span>
            </p>
            <p><strong>Conditions Chroniques :</strong> {{ medicalRecordStore.record?.chronic_conditions || 'Aucune' }}</p>
        </div>

        <hr/>
        <div class="tech-log">
            <p>🎯 Patient ID Cible (computed) : {{ patientId }}</p>
            <p>📖 Ordonnances chargées : {{ prescriptionStore.prescriptions.length }}</p>
            <p>🔬 Rapports de Labo chargés : {{ labStore.labRequests.length }}</p>
            <p>💬 Consultations chargées : {{ consultationStore.patientConsultations.length }}</p>
            <p>📜 Rapports Médicaux chargés : {{ medicalReportStore.getMedicalReports.length }}</p>
            <p v-if="patientStore.error" class="error-message">Erreur Patient: {{ patientStore.error }}</p>
            <p v-if="consultationStore.getError" class="error-message">Erreur Consultations: {{ consultationStore.getError }}</p>
            <p v-if="prescriptionStore.getAuthError" class="error-message">Accès Ordonnances: {{ prescriptionStore.getAuthError }}</p>
            <p v-if="prescriptionStore.getError && !prescriptionStore.getAuthError" class="error-message">Erreur Ordonnances: {{ prescriptionStore.getError }}</p>
            <p v-if="medicalReportStore.getMedicalReportError" class="error-message">Erreur Rapports Médicaux: {{ medicalReportStore.getMedicalReportError }}</p>
        </div>
      </div>

      <div class="history-card">
        <h2>Ordonnances (Prescriptions)</h2>
        <p v-if="prescriptionStore.isLoading" class="text-info">Chargement des ordonnances...</p>

        <p v-else-if="prescriptionStore.getAuthError" class="alert-error">
          {{ prescriptionStore.getAuthError }}
        </p>
        <p v-else-if="prescriptionStore.getPrescriptions.length === 0" class="text-info">
          Aucune ordonnance trouvée pour ce patient.
        </p>
        <ul v-else>
            <li v-for="rx in prescriptionStore.getPrescriptions" :key="rx.id" class="prescription-item">
                <div class="header-info">
                    <strong>Ordonnance du {{ rx.created_at ? new Date(rx.created_at).toLocaleDateString() : 'Date Inconnue' }}</strong>
                    — Dr. {{ rx.doctor && rx.doctor.user ? rx.doctor.user.last_name : 'Inconnu' }}
                    </div>

                <div v-if="rx.prescription_lines && rx.prescription_lines.length" class="lines-detail">
                    <p class="detail-title">**Lignes d'ordonnance :**</p>
                    <ul>
                        <li v-for="(line, index) in rx.prescription_lines" :key="line.id || index" class="line-item">
                            💊 **{{ line.medication_name || 'Médicament N/A' }}**
                            ({{ line.dosage || 'Dosage N/A' }})
                            <br>
                            *Instruction : {{ line.instructions || 'Aucune instruction' }}*
                        </li>
                    </ul>
                </div>
                <div v-else class="text-info lines-detail">
                    Cette ordonnance ne contient pas de lignes de médicaments.
                </div>
            </li>
        </ul>
      </div>

      <div class="history-card">
        <h2>Rapports Médicaux (Généraux)</h2>
        <p v-if="medicalReportStore.isLoadingMedicalReports" class="text-info">Chargement des rapports médicaux...</p>
        <p v-else-if="medicalReportStore.getMedicalReports.length === 0" class="text-info">
          Aucun rapport médical trouvé pour ce patient.
        </p>
        <ul v-else>
          <li v-for="report in medicalReportStore.getMedicalReports" :key="report.id">
            <div class="header-info">
                <strong>{{ report.title || 'Rapport sans titre' }}</strong> (Type: {{ report.report_type || 'N/A' }})
                <span v-if="report.doctor && report.doctor.user" class="doctor-name">Dr. {{ report.doctor.user.last_name }}</span>
                <button
                  v-if="report.file_path"
                  @click="handleDownloadMedicalReport(report.id, report.title)"
                  :disabled="medicalReportStore.isLoadingMedicalReports"
                  class="download-button"
                >
                  Télécharger 📄
                </button>
                <span v-else class="text-info">Pas de fichier attaché</span>
            </div>
            <p class="report-date">Date: {{ new Date(report.created_at).toLocaleDateString() }}</p>
            <p class="report-content">{{ report.content?.substring(0, 150) || 'Aucun contenu.' }}<span v-if="report.content?.length > 150">...</span></p>
          </li>
        </ul>
        <div v-if="medicalReportStore.getMedicalReportError" class="alert-error">
            {{ medicalReportStore.getMedicalReportError }}
        </div>
        <div v-if="medicalReportStore.getMedicalReportSuccess" class="alert-success">
            {{ medicalReportStore.getMedicalReportSuccess }}
        </div>
      </div>

      <div class="history-card">
        <h2>Consultations</h2>
        <p v-if="consultationStore.isLoading" class="text-info">Chargement des consultations...</p>
        <p v-else-if="consultationStore.getPatientConsultations.length === 0" class="text-info">
          Aucune consultation trouvée pour ce patient.
        </p>
        <ul v-else>
          <li v-for="consult in consultationStore.getPatientConsultations" :key="consult.id">
            <strong>{{ consult.consultation_date ? new Date(consult.consultation_date).toLocaleDateString() : 'Date Inconnue' }}</strong> – Dr. {{ consult.doctor ? consult.doctor.user.last_name : 'Inconnu' }}
            : {{ consult.motif || 'Non spécifié' }} (Statut: {{ consult.status }})
          </li>
        </ul>
      </div>

      <div class="history-card">
        <h2>Analyses & Rapports (Résultats de Labo)</h2>
        <p v-if="labStore.isLoading" class="text-info">Chargement des résultats de laboratoire...</p>
        <p v-else-if="labStore.getLabRequests.length === 0 && !labStore.isLoading" class="text-info">
          Aucun résultat de laboratoire trouvé.
        </p>
        <ul v-else>
            <li v-for="req in labStore.getLabRequests" :key="req.id">
                **{{ req.name || 'Analyse sans nom' }}** (Type: {{ req.type }}) – Statut: **{{ req.status }}**
                <br />
                <template v-if="req.result && req.result.result_file">
                    📎 <a :href="`/storage/${req.result.result_file}`" target="_blank">Télécharger le rapport de résultat</a>
                </template>
                <template v-else>
                    ⏳ En attente de résultat
                </template>
            </li>
        </ul>
      </div>

    </section>
  </SidebarLayout>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import SidebarLayout from '@/layouts/SidebarLayout.vue';

// 🚨 Import des Stores
import { useAuthStore } from '@/stores/authStores';
import { usePrescriptionStore } from '@/stores/prescriptionStore';
import { useLabStore } from '@/stores/labStore';
import { usePatientStore } from '@/stores/patientStore';
import { useMedicalRecordStore } from '@/stores/medicalrecordStore';
import { useConsultationStore } from '@/stores/consultationStore';
import { useMedicalReportStore } from '@/stores/medicalreportStore';

// --------------------------------------------------------
// 1. Déclaration et Initialisation des Stores et Route
// --------------------------------------------------------
const authStore = useAuthStore();
const prescriptionStore = usePrescriptionStore();
const labStore = useLabStore();
const patientStore = usePatientStore();
const medicalRecordStore = useMedicalRecordStore();
const consultationStore = useConsultationStore();
const medicalReportStore = useMedicalReportStore();

const route = useRoute();

const { getPatientData: currentPatientData } = storeToRefs(patientStore);

const patientId = ref(null);

// Fonction pour déterminer le patientId (LOG D'AVERTISSEMENT COMMENTÉ)
const determinePatientId = () => {
    const idFromRoute = route.params.patientId ? parseInt(route.params.patientId) : null;
    if (idFromRoute) return idFromRoute;
    if (authStore.userRole === 'patient' && authStore.user?.patient_id) return authStore.user.patient_id;
    // Ligne commentée pour supprimer l'avertissement de timing qui se résout par la suite
    // console.warn("[LOG - Patient ID] Impossible de déterminer le Patient ID cible.");
    return null;
};


// --------------------------------------------------------
// 2. Logique de Chargement des Données
// --------------------------------------------------------

const loadAllHistoryData = async () => {
    const pId = patientId.value;
    if (!pId) {
        console.error("[LOG - Historique] ERREUR: Patient ID manquant. Annulation du chargement.");
        return;
    }

    console.log(`[LOG - Historique] Démarrage du chargement pour le patient ID: ${pId}`);

    // 1. CHARGEMENT DES DONNÉES PATIENT
    await patientStore.onePatient(pId);
    if (patientStore.currentPatient?.medical_record_id) {
        await medicalRecordStore.fetchMedicalRecord(patientStore.currentPatient.medical_record_id);
    }

    // 2. CHARGEMENT DES PRESCRIPTIONS
    await prescriptionStore.fetchPatientPrescriptions(pId);
    if (prescriptionStore.getPrescriptions.length > 0) {
        console.log("✅ Données brutes des ordonnances récupérées :", prescriptionStore.getPrescriptions);
    } else if (prescriptionStore.getAuthError) {
        console.warn("⚠️ Accès refusé aux ordonnances, message d'erreur d'autorisation capturé.");
    } else {
        console.log("ℹ️ Aucune ordonnance à logger.");
    }

    // 3. CHARGEMENT DES ANALYSES
    await labStore.listLabRequests({ patient_id: pId });

    // 4. CHARGEMENT DES RAPPORTS MÉDICAUX
    await medicalReportStore.fetchAllMedicalReports({ patient_id: pId });
    if (medicalReportStore.getMedicalReports.length > 0) {
        console.log("✅ Données brutes des rapports médicaux récupérées :", medicalReportStore.getMedicalReports);
    } else if (medicalReportStore.getMedicalReportError) {
        console.warn("⚠️ Erreur lors de la récupération des rapports médicaux, message d'erreur capturé.");
    } else {
        console.log("ℹ️ Aucun rapport médical à logger.");
    }


    // 5. CHARGEMENT DES CONSULTATIONS
    await consultationStore.fetchPatientConsultations(pId);
    if (consultationStore.getPatientConsultations.length > 0) {
        console.log("✅ Données brutes des consultations récupérées :", consultationStore.getPatientConsultations);
    } else if (consultationStore.getError) {
        console.warn("⚠️ Erreur lors de la récupération des consultations, message d'erreur capturé.");
    } else {
        console.log("ℹ️ Aucune consultation à logger.");
    }
};

watch(() => [route.params.patientId, authStore.user?.patient_id, authStore.userRole], () => {
    const newId = determinePatientId();
    if (newId !== patientId.value && newId !== null) {
        patientId.value = newId;
        loadAllHistoryData();
    } else if (patientId.value === null && newId !== null) {
        patientId.value = newId;
        loadAllHistoryData();
    }
}, { immediate: true });

// FONCTION POUR GÉRER LE TÉLÉCHARGEMENT DES RAPPORTS MÉDICAUX
const handleDownloadMedicalReport = async (reportId, reportTitle) => {
    // Nettoyer le titre pour un nom de fichier valide
    const fileName = `rapport_${reportTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'inconnu'}.pdf`;
    await medicalReportStore.downloadMedicalReport(reportId, fileName);
};


// --------------------------------------------------------
// 3. Computed pour les états
// --------------------------------------------------------
const historyLoading = computed(() =>
    patientStore.loading ||
    medicalRecordStore.loading ||
    prescriptionStore.isLoading ||
    labStore.isLoading ||
    consultationStore.isLoading ||
    medicalReportStore.isLoadingMedicalReports
);

const historyError = computed(() => {
    let errorMessages = [];

    if (patientStore.error) errorMessages.push(patientStore.error);
    if (medicalRecordStore.error) errorMessages.push(medicalRecordStore.error);
    if (labStore.getError) errorMessages.push(labStore.getError);
    if (consultationStore.getError) errorMessages.push(consultationStore.getError);
    if (medicalReportStore.getMedicalReportError) errorMessages.push(medicalReportStore.getMedicalReportError);

    if (prescriptionStore.getError && !prescriptionStore.getAuthError) {
        errorMessages.push(prescriptionStore.getError);
    }

    return errorMessages.join(' | ') || null;
});
</script>

<style scoped>
/* Votre CSS existant pour l'affichage */
.history-section { display: flex; flex-direction: column; gap: 32px; padding: 20px; }
h1 { font-size: 2.2em; color: #002580; margin-bottom: 25px; text-align: center; border-bottom: 2px solid #0040d0; padding-bottom: 10px; }
.history-card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
.history-card h2 { font-size: 1.6em; color: #0040d0; margin-top: 0; margin-bottom: 18px; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px; }
ul { list-style-type: none; padding: 0; }
li { background-color: #f8fbfd; border: 1px solid #e3edf2; border-left: 5px solid #007bff; padding: 12px 15px; margin-bottom: 10px; border-radius: 6px; transition: background-color 0.2s ease-in-out; }
li:hover { background-color: #eaf3f8; }
li strong { color: #002580; margin-right: 8px; }
li a { color: #007bff; text-decoration: none; font-weight: 500; margin-left: 5px; }
li a:hover { text-decoration: underline; }
.alert-info, .alert-error, .alert-success { padding: 15px; margin-bottom: 20px; border-radius: 8px; font-weight: 500; text-align: center; }
.alert-info { background-color: #e0f2f7; color: #01579b; border: 1px solid #b3e5fc; }
.alert-error { background-color: #ffebee; color: #c62828; border: 1px solid #ef9a9a; }
.alert-success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; } /* 🚨 NOUVEAU STYLE */

.text-info { color: #6c757d; font-style: italic; text-align: center; padding: 10px 0; }
.debug-log { border: 1px solid #ccc; padding: 15px; background-color: #f9f9f9; border-radius: 8px; margin-bottom: 20px; }
.debug-log h3 { font-size: 18px; color: #002580; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
.patient-info-display p { margin: 5px 0; font-size: 15px; color: #333; }
.patient-info-display strong { color: #1a1a1a; display: inline-block; width: 180px; }
.tech-log { font-size: 12px; color: #666; margin-top: 15px; padding-top: 10px; border-top: 1px dashed #eee; }
.tech-log p { margin: 2px 0; }
.error-message { color: #d32f2f; font-weight: bold; }
.header-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; }
.download-link { font-size: 0.9em; font-weight: bold; }
.lines-detail { background-color: #eaf3f8; border-radius: 4px; padding: 10px; margin-top: 10px; }
.lines-detail .detail-title { font-weight: bold; font-size: 0.9em; color: #002580; margin-top: 0; margin-bottom: 5px; }
.lines-detail ul { list-style-type: disc; padding-left: 20px; margin: 0; }
.lines-detail li { background: none; border: none; border-left: none; padding: 5px 0; margin-bottom: 0; font-size: 0.95em; }
.lines-detail li strong { color: #1a1a1a; }

/* 🚨 NOUVEAUX STYLES POUR LA SECTION RAPPORTS MÉDICAUX */
.history-card .download-button {
  background-color: #28a745; /* Vert pour le téléchargement */
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
  margin-left: 10px;
  transition: background-color 0.3s ease;
  flex-shrink: 0; /* Empêche le bouton de rétrécir */
}
.history-card .download-button:hover {
  background-color: #218838;
}
.history-card .download-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
.report-date {
    font-size: 0.85em;
    color: #6c757d;
    margin-top: -5px;
    margin-bottom: 8px;
}
.report-content {
    font-size: 0.95em;
    color: #343a40;
    line-height: 1.5;
}
.doctor-name {
    font-size: 0.9em;
    color: #0056b3;
    font-weight: 500;
    margin-left: 10px;
}
</style>
