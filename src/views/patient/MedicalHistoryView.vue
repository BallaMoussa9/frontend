<template>
  <SidebarLayout>
    <section class="history-section">
      <h1>Historique Médical</h1>

      <div v-if="historyLoading" class="alert-info">Chargement de l'historique médical en cours...</div>

      <div v-if="historyError" class="alert-error">
        Erreur de chargement de l'historique : {{ historyError }}
      </div>

      <!-- Section Patient Info -->
      <div v-if="currentPatientData" class="history-card patient-card">
        <h2>Informations Patient</h2>
        <div class="patient-info">
          <p><strong>Nom :</strong> {{ currentPatientData.user.last_name }} {{ currentPatientData.user.first_name }}</p>
          <p><strong>Email :</strong> {{ currentPatientData.user.email }}</p>
          <p><strong>ID Patient :</strong> {{ currentPatientData.id }}</p>
        </div>
      </div>

      <!-- Section Ordonnances -->
      <div class="history-card">
        <h2>Ordonnances (Prescriptions)</h2>
        
        <!-- États de chargement -->
        <div v-if="prescriptionStore.isLoading" class="alert-info">
          🔄 Chargement des ordonnances en cours...
        </div>

        <div v-else-if="prescriptionStore.getAuthError" class="alert-error">
          ❌ Erreur d'autorisation: {{ prescriptionStore.getAuthError }}
        </div>

        <div v-else-if="prescriptionStore.getError" class="alert-error">
          ❌ Erreur technique: {{ prescriptionStore.getError }}
        </div>

        <div v-else-if="prescriptionStore.getPrescriptions.length === 0" class="alert-info">
          ℹ️ Aucune ordonnance trouvée pour ce patient.
        </div>

        <!-- Affichage des ordonnances -->
        <div v-else class="prescriptions-container">
          <div class="prescription-count">
            📋 {{ prescriptionStore.getPrescriptions.length }} ordonnance(s) trouvée(s)
          </div>
          
          <div v-for="(prescription, index) in prescriptionStore.getPrescriptions" 
               :key="prescription.id" 
               class="prescription-item">
            
            <div class="prescription-header">
              <h4>Ordonnance #{{ index + 1 }}</h4>
              <span class="prescription-date">
                {{ formatDate(prescription.created_at) }}
              </span>
            </div>

            <div class="prescription-meta">
              <p><strong>Statut:</strong> {{ prescription.status || 'Non spécifié' }}</p>
              <p><strong>Docteur:</strong> {{ getDoctorName(prescription) }}</p>
              <p v-if="prescription.notes"><strong>Notes:</strong> {{ prescription.notes }}</p>
            </div>

            <!-- Lignes de prescription -->
            <div v-if="getPrescriptionLines(prescription).length > 0" class="prescription-lines">
              <h5>💊 Médicaments prescrits ({{ getPrescriptionLines(prescription).length }})</h5>
              <div v-for="(line, lineIndex) in getPrescriptionLines(prescription)" 
                   :key="line.id || lineIndex" 
                   class="medication-line">
                <div class="medication-info">
                  <strong>{{ line.medication_name || 'Médicament non nommé' }}</strong>
                  <span class="dosage">- {{ line.dosage || 'Dosage non spécifié' }}</span>
                </div>
                <div class="medication-details">
                  <span v-if="line.frequency">Fréquence: {{ line.frequency }}</span>
                  <span v-if="line.duration">Durée: {{ line.duration }}</span>
                  <span v-if="line.instructions">Instructions: {{ line.instructions }}</span>
                </div>
              </div>
            </div>

            <div v-else class="no-lines">
              ℹ️ Aucun médicament dans cette ordonnance
            </div>
          </div>
        </div>
      </div>

      <!-- Autres sections médicales -->
      <div class="history-card">
        <h2>Rapports Médicaux</h2>

        <div v-if="medicalReportStore.isLoadingMedicalReports" class="alert-info">
          Chargement des rapports médicaux...
        </div>
        <div v-else-if="medicalReportStore.getMedicalReports.length === 0" class="alert-info">
          Aucun rapport médical trouvé
        </div>
        <ul v-else>
          <li v-for="report in medicalReportStore.getMedicalReports" :key="report.id">
            <strong>{{ report.title }}</strong> - {{ formatDate(report.created_at) }}
          </li>
        </ul>
      </div>

      <div class="history-card">
        <h2>Consultations</h2>

        <div v-if="consultationStore.isLoading" class="alert-info">
          Chargement des consultations...
        </div>
        <div v-else-if="consultationStore.getPatientConsultations.length === 0" class="alert-info">
          Aucune consultation trouvée
        </div>
        <ul v-else>
          <li v-for="consult in consultationStore.getPatientConsultations" :key="consult.id">
            {{ formatDate(consult.created_at) }} - {{ consult.motif }} ({{ consult.status }})
          </li>
        </ul>
      </div>

      <div class="history-card">
        <h2>Analyses de Laboratoire</h2>

        <div v-if="labStore.isLoading" class="alert-info">
          Chargement des analyses...
        </div>
        <div v-else-if="labStore.getLabRequests.length === 0" class="alert-info">
          Aucune analyse trouvée
        </div>
        <ul v-else>
          <li v-for="lab in labStore.getLabRequests" :key="lab.id">
            {{ lab.name }} - {{ lab.status }}
          </li>
        </ul>
      </div>

    </section>
  </SidebarLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import SidebarLayout from '@/layouts/SidebarLayout.vue';

// Stores
import { useAuthStore } from '@/stores/authStores';
import { usePrescriptionStore } from '@/stores/prescriptionStore';
import { useLabStore } from '@/stores/labStore';
import { usePatientStore } from '@/stores/patientStore';
import { useMedicalRecordStore } from '@/stores/medicalrecordStore';
import { useConsultationStore } from '@/stores/consultationStore';
import { useMedicalReportStore } from '@/stores/medicalreportStore';

// Initialisation
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

// 🎯 MÉTHODES POUR L'AFFICHAGE
const formatDate = (dateString) => {
  if (!dateString) return 'Date inconnue';
  try {
    return new Date(dateString).toLocaleDateString('fr-FR');
  } catch (e) {
    return 'Date invalide';
  }
};

const getDoctorName = (prescription) => {
  if (prescription.doctor) {
    if (prescription.doctor.user && prescription.doctor.user.last_name) {
      return `Dr. ${prescription.doctor.user.last_name} ${prescription.doctor.user.first_name || ''}`;
    }
    if (prescription.doctor.last_name) {
      return `Dr. ${prescription.doctor.last_name}`;
    }
  }
  return 'Docteur non spécifié';
};

const getPrescriptionLines = (prescription) => {
  // 🔥 CORRECTION : Utiliser uniquement 'lines' qui correspond à votre modèle
  if (prescription.lines && Array.isArray(prescription.lines)) {
    return prescription.lines;
  }
  // Fallback pour compatibilité
  if (prescription.prescription_lines && Array.isArray(prescription.prescription_lines)) {
    return prescription.prescription_lines;
  }
  return [];
};

// 🎯 DÉTERMINATION DU PATIENT ID - VERSION CORRIGÉE
const determinePatientId = () => {
  console.log('🔍 Détermination du Patient ID...');
  
  // 1. Vérifier la route d'abord
  const idFromRoute = route.params.patientId ? parseInt(route.params.patientId) : null;
  if (idFromRoute) {
    console.log('✅ Patient ID depuis la route:', idFromRoute);
    return idFromRoute;
  }
  
  // 2. 🔥 CORRECTION : Votre user a patient_id directement
  if (authStore.user?.patient_id) {
    console.log('✅ Patient ID depuis user object:', authStore.user.patient_id);
    return authStore.user.patient_id;
  }
  
  // 3. Vérifier si l'utilisateur a le rôle patient
  const userRoles = authStore.user?.roles || [];
  const isPatient = userRoles.some(role => role.name === 'patient');
  if (isPatient && authStore.user?.id) {
    console.log('✅ Patient ID depuis user ID (rôle patient):', authStore.user.id);
    return authStore.user.id;
  }
  
  // 4. Fallback : vérifier aussi currentPatientData s'il existe
  if (currentPatientData.value?.id) {
    console.log('✅ Patient ID depuis currentPatientData:', currentPatientData.value.id);
    return currentPatientData.value.id;
  }
  
  console.warn('❌ Impossible de déterminer le Patient ID');
  return null;
};

// 🎯 CHARGEMENT DES DONNÉES AVEC LOGS DÉTAILLÉS
const loadAllHistoryData = async () => {
  const pId = patientId.value;
  
  if (!pId) {
    console.error('🚨 ERREUR: Patient ID manquant pour le chargement des données');
    return;
  }

  console.log(`🚀 DÉMARRAGE du chargement des données pour le patient ID: ${pId}`);

  try {
    // 1. Charger les données du patient
    console.log('📥 1. Chargement des données patient...');
    await patientStore.onePatient(pId);
    console.log('✅ Données patient chargées:', patientStore.currentPatient);

    // 2. Charger les ordonnances avec logging COMPLET
    console.log('📥 2. Chargement des ordonnances...');
    await prescriptionStore.fetchPatientPrescriptions(pId);
    
    // 🎯 LOGS DÉTAILLÉS DES ORDONNANCES
    console.log('📊 ===== RÉSULTAT CHARGEMENT ORDONNANCES =====');
    console.log('📦 Nombre d\'ordonnances:', prescriptionStore.getPrescriptions.length);
    console.log('🔍 Structure des données:', prescriptionStore.getPrescriptions);
    
    if (prescriptionStore.getPrescriptions.length > 0) {
      console.log('🎯 PREMIÈRE ORDONNANCE (analyse détaillée):');
      const firstPrescription = prescriptionStore.getPrescriptions[0];
      console.log('   ID:', firstPrescription.id);
      console.log('   Statut:', firstPrescription.status);
      console.log('   Date:', firstPrescription.created_at);
      console.log('   Docteur:', firstPrescription.doctor);
      console.log('   Notes:', firstPrescription.notes);
      console.log('   Clés disponibles:', Object.keys(firstPrescription));
      
      // Recherche des lignes de prescription
      const lines = getPrescriptionLines(firstPrescription);
      console.log('   Lignes trouvées:', lines);
      console.log('   Nombre de lignes:', lines.length);
      
      if (lines.length > 0) {
        console.log('   PREMIÈRE LIGNE:', lines[0]);
      }
    } else {
      console.log('❌ AUCUNE ORDONNANCE TROUVÉE');
    }
    console.log('📊 ===== FIN ANALYSE ORDONNANCES =====');

    // 3. Charger les autres données
    console.log('📥 3. Chargement des analyses labo...');
    await labStore.listLabRequests({ patient_id: pId });
    
    console.log('📥 4. Chargement des rapports médicaux...');
    await medicalReportStore.fetchAllMedicalReports({ patient_id: pId });
    
    console.log('📥 5. Chargement des consultations...');
    await consultationStore.fetchPatientConsultations(pId);

    console.log('✅ TOUTES LES DONNÉES CHARGÉES AVEC SUCCÈS');

  } catch (error) {
    console.error('❌ ERREUR lors du chargement des données:', error);
  }
};

// 🎯 WATCHERS AMÉLIORÉS
watch(() => [route.params.patientId, authStore.user?.patient_id, currentPatientData.value?.id], () => {
  console.log('🔄 Changement détecté dans les dépendances du Patient ID');
  const newId = determinePatientId();
  
  if (newId !== patientId.value) {
    console.log(`🆕 Nouveau Patient ID: ${newId} (ancien: ${patientId.value})`);
    patientId.value = newId;
    
    if (newId !== null) {
      loadAllHistoryData();
    }
  }
}, { immediate: true, deep: true });

// 🎯 COMPUTED PROPERTIES CORRIGÉES
const historyLoading = computed(() => {
  const loading = 
    patientStore.loading ||
    prescriptionStore.isLoading ||
    labStore.isLoading ||
    consultationStore.isLoading ||
    medicalReportStore.isLoadingMedicalReports;
  
  console.log('🔄 État de chargement global:', loading);
  return loading;
});

const historyError = computed(() => {
  const errors = [];
  
  if (patientStore.error) errors.push(`Patient: ${patientStore.error}`);
  if (medicalRecordStore.error) errors.push(`Dossier médical: ${medicalRecordStore.error}`);
  if (labStore.getError) errors.push(`Labo: ${labStore.getError}`);
  if (consultationStore.getError) errors.push(`Consultations: ${consultationStore.getError}`);
  if (medicalReportStore.getMedicalReportError) errors.push(`Rapports: ${medicalReportStore.getMedicalReportError}`);
  if (prescriptionStore.getError && !prescriptionStore.getAuthError) {
    errors.push(`Ordonnances: ${prescriptionStore.getError}`);
  }
  
  return errors.length > 0 ? errors.join(' | ') : null;
});

// 🎯 LOG AU MONTAGE DU COMPOSANT
onMounted(() => {
  console.log('📍 Composant Historique Médical monté');
  console.log('👤 User auth:', authStore.user);
  console.log('🆔 Patient ID initial:', patientId.value);
  
  // 🔥 CORRECTION : Forcer la détermination si pas encore fait
  if (!patientId.value) {
    const determinedId = determinePatientId();
    if (determinedId) {
      patientId.value = determinedId;
      loadAllHistoryData();
    }
  }
  
  console.log('🏪 État initial store prescriptions:', {
    loading: prescriptionStore.isLoading,
    count: prescriptionStore.getPrescriptions.length,
    error: prescriptionStore.getError
  });
});
</script>

<style scoped>
.history-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: 2.2em;
  color: #002580;
  margin-bottom: 25px;
  text-align: center;
  border-bottom: 2px solid #0040d0;
  padding-bottom: 10px;
}

.history-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e1e5e9;
}

.history-card h2 {
  font-size: 1.6em;
  color: #0040d0;
  margin-top: 0;
  margin-bottom: 20px;
  border-bottom: 2px solid #f0f4f8;
  padding-bottom: 10px;
}

/* Patient Card */
.patient-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.patient-card h2 {
  color: white;
  border-bottom-color: rgba(255,255,255,0.3);
}

.patient-info p {
  margin: 8px 0;
  font-size: 1.1em;
}

/* Prescriptions */
.prescriptions-container {
  margin-top: 20px;
}

.prescription-count {
  background: #e7f3ff;
  padding: 10px 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-weight: bold;
  color: #0040d0;
}

.prescription-item {
  background: #f8f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.prescription-item:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.prescription-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #dee2e6;
}

.prescription-header h4 {
  margin: 0;
  color: #0040d0;
}

.prescription-date {
  color: #6c757d;
  font-weight: bold;
}

.prescription-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.prescription-meta p {
  margin: 0;
  font-size: 0.9em;
}

.prescription-lines {
  margin-top: 16px;
}

.prescription-lines h5 {
  margin: 0 0 12px 0;
  color: #495057;
}

.medication-line {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
}

.medication-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.medication-info strong {
  color: #0040d0;
}

.dosage {
  color: #6c757d;
  font-style: italic;
}

.medication-details {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 0.85em;
  color: #495057;
}

.medication-details span {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 4px;
}

.no-lines {
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
}

/* Alert Styles */
.alert-info, .alert-error {
  padding: 16px;
  margin: 16px 0;
  border-radius: 8px;
  font-weight: 500;
  text-align: center;
}

.alert-info {
  background-color: #e0f2f7;
  color: #01579b;
  border: 1px solid #b3e5fc;
}

.alert-error {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
}

/* Lists */
ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

li {
  background-color: #f8fbfd;
  border: 1px solid #e3edf2;
  border-left: 4px solid #007bff;
  padding: 12px 15px;
  margin-bottom: 8px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

li:hover {
  background-color: #eaf3f8;
}

/* Responsive */
@media (max-width: 768px) {
  .history-section {
    padding: 10px;
    gap: 16px;
  }
  
  .history-card {
    padding: 16px;
  }
  
  .prescription-meta {
    grid-template-columns: 1fr;
  }
  
  .medication-details {
    flex-direction: column;
    gap: 4px;
  }
  
  .prescription-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>