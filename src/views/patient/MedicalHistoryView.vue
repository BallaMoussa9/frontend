<template>
  <SidebarLayout>
    <section class="history-section">
      <div class="header-banner">
        <h1><i class="fas fa-file-medical-alt"></i> Historique Médical</h1>
        <p>Consultez vos prescriptions, analyses et rapports médicaux centralisés.</p>
      </div>

      <div v-if="historyLoading" class="global-loader">
        <div class="spinner"></div>
        <span>Récupération de vos données...</span>
      </div>

      <div v-if="historyError" class="alert-error">
        <i class="fas fa-exclamation-triangle"></i> {{ historyError }}
      </div>

      <div v-if="currentPatientData" class="patient-hero-card">
        <div class="patient-avatar">
          <i class="fas fa-user-circle"></i>
        </div>
        <div class="patient-details">
          <h2>{{ currentPatientData.user.last_name }} {{ currentPatientData.user.first_name }}</h2>
          <div class="info-badges">
            <span class="badge"><i class="fas fa-envelope"></i> {{ currentPatientData.user.email }}</span>
            <span class="badge"><i class="fas fa-fingerprint"></i> ID: #{{ currentPatientData.id }}</span>
          </div>
        </div>
      </div>

      <div class="history-card main-card">
        <div class="card-header">
          <h2><i class="fas fa-prescription-bottle-alt"></i> Ordonnances</h2>
        </div>
        
        <div v-if="prescriptionStore.getPrescriptions.length === 0 && !prescriptionStore.isLoading" class="empty-state">
          <i class="fas fa-folder-open"></i>
          <p>Aucune ordonnance enregistrée.</p>
        </div>

        <div v-else class="prescriptions-list">
          <div v-for="(prescription, index) in prescriptionStore.getPrescriptions" 
               :key="prescription.id" 
               class="prescription-item">
            
            <div class="item-top">
              <span class="presc-number">Référence #{{ prescription.id || index + 1 }}</span>
              <span class="presc-date">{{ formatDate(prescription.created_at) }}</span>
            </div>

            <div class="item-meta">
              <div class="meta-info"><strong>Médecin :</strong> {{ getDoctorName(prescription) }}</div>
              <div class="meta-info">
                <strong>Statut :</strong> 
                <span :class="['status-tag', prescription.status?.toLowerCase()]">
                  {{ prescription.status || 'Actif' }}
                </span>
              </div>
            </div>

            <div class="medications-section">
              <div v-for="line in getPrescriptionLines(prescription)" :key="line.id" class="med-row">
                <div class="med-main">
                  <span class="med-name">{{ line.medication_name }}</span>
                  <span class="med-dosage">{{ line.dosage }}</span>
                </div>
                <div class="med-instructions">
                  <i class="fas fa-redo"></i> {{ line.frequency }} | <i class="fas fa-hourglass-half"></i> {{ line.duration }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="secondary-grid">
        <div class="history-card compact">
          <h3><i class="fas fa-file-alt"></i> Rapports</h3>
          <ul class="document-list">
            <li v-for="report in medicalReportStore.getMedicalReports" :key="report.id">
              <span class="doc-title">{{ report.title }}</span>
              <span class="doc-date">{{ formatDate(report.created_at) }}</span>
            </li>
          </ul>
        </div>

        <div class="history-card compact">
          <h3><i class="fas fa-stethoscope"></i> Consultations</h3>
          <ul class="document-list">
            <li v-for="consult in consultationStore.getPatientConsultations" :key="consult.id">
              <span class="doc-title">{{ consult.motif }}</span>
              <span class="status-mini">{{ consult.status }}</span>
            </li>
          </ul>
        </div>

        <div class="history-card compact">
          <h3><i class="fas fa-vial"></i> Laboratoire</h3>
          <ul class="document-list">
            <li v-for="lab in labStore.getLabRequests" :key="lab.id">
              <span class="doc-title">{{ lab.name }}</span>
              <span :class="['status-mini', lab.status]">{{ lab.status }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </SidebarLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import SidebarLayout from '@/layouts/SidebarLayout.vue';

// Import des stores
import { useAuthStore } from '@/stores/authStores';
import { usePrescriptionStore } from '@/stores/prescriptionStore';
import { useLabStore } from '@/stores/labStore';
import { usePatientStore } from '@/stores/patientStore';
import { useConsultationStore } from '@/stores/consultationStore';
import { useMedicalReportStore } from '@/stores/medicalreportStore';

const authStore = useAuthStore();
const prescriptionStore = usePrescriptionStore();
const labStore = useLabStore();
const patientStore = usePatientStore();
const consultationStore = useConsultationStore();
const medicalReportStore = useMedicalReportStore();

const route = useRoute();
const { getPatientData: currentPatientData } = storeToRefs(patientStore);
const patientId = ref(null);

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getDoctorName = (p) => {
  const doc = p.doctor;
  return doc?.user ? `Dr. ${doc.user.last_name}` : (doc?.last_name ? `Dr. ${doc.last_name}` : 'Médecin SantéKo');
};

const getPrescriptionLines = (p) => p.lines || p.prescription_lines || [];

const determinePatientId = () => {
  if (route.params.patientId) return parseInt(route.params.patientId);
  if (authStore.user?.patient_id) return authStore.user.patient_id;
  return currentPatientData.value?.id || null;
};

const loadData = async () => {
  if (!patientId.value) return;
  await Promise.all([
    patientStore.onePatient(patientId.value),
    prescriptionStore.fetchPatientPrescriptions(patientId.value),
    labStore.listLabRequests({ patient_id: patientId.value }),
    medicalReportStore.fetchAllMedicalReports({ patient_id: patientId.value }),
    consultationStore.fetchPatientConsultations(patientId.value)
  ]);
};

watch(() => [route.params.patientId, authStore.user?.patient_id], () => {
  const id = determinePatientId();
  if (id && id !== patientId.value) {
    patientId.value = id;
    loadData();
  }
}, { immediate: true });

const historyLoading = computed(() => patientStore.loading || prescriptionStore.isLoading);
const historyError = computed(() => patientStore.error || prescriptionStore.getError);

onMounted(() => {
  patientId.value = determinePatientId();
  loadData();
});
</script>

<style scoped>
.history-section { padding: 30px; max-width: 1200px; margin: 0 auto; background: #f8fafc; min-height: 100vh; }
.header-banner { margin-bottom: 25px; }
.header-banner h1 { color: #002580; font-size: 2rem; margin: 0; }
.header-banner p { color: #64748b; }

.patient-hero-card {
  display: flex; align-items: center; gap: 20px;
  background: linear-gradient(135deg, #002580 0%, #0040d0 100%);
  padding: 25px; border-radius: 15px; color: white; margin-bottom: 30px;
  box-shadow: 0 10px 15px -3px rgba(0, 37, 128, 0.2);
}
.patient-avatar i { font-size: 3.5rem; opacity: 0.8; }
.info-badges { display: flex; gap: 10px; margin-top: 10px; }
.badge { background: rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; }

.history-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; }
.main-card { border-top: 5px solid #002580; }
.card-header h2 { font-size: 1.25rem; color: #1e293b; display: flex; align-items: center; gap: 10px; }

.prescription-item { background: #f1f5f9; border-radius: 10px; padding: 15px; margin-top: 15px; }
.item-top { display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 10px; }
.presc-number { font-weight: bold; color: #002580; }
.presc-date { font-size: 0.85rem; color: #64748b; }

.med-row { background: white; padding: 10px; border-radius: 8px; margin-bottom: 5px; border-left: 3px solid #002580; }
.med-name { font-weight: 600; }
.med-dosage { color: #64748b; font-size: 0.9rem; margin-left: 8px; }
.med-instructions { font-size: 0.8rem; color: #475569; margin-top: 4px; }

.secondary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 25px; }
.document-list { list-style: none; padding: 0; }
.document-list li { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
.doc-title { font-size: 0.9rem; font-weight: 500; }
.doc-date, .status-mini { font-size: 0.8rem; color: #94a3b8; }

.status-tag { font-size: 0.75rem; padding: 2px 8px; border-radius: 5px; font-weight: bold; }
.status-tag.terminé { background: #dcfce7; color: #15803d; }
.status-tag.actif { background: #dbeafe; color: #1e40af; }

.global-loader { text-align: center; padding: 50px; color: #002580; }
.spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #002580; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>