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
        <div class="patient-avatar"><i class="fas fa-user-circle"></i></div>
        <div class="patient-details">
          <h2>{{ currentPatientData.user.last_name }} {{ currentPatientData.user.first_name }}</h2>
          <div class="info-badges">
            <span class="badge"><i class="fas fa-envelope"></i> {{ currentPatientData.user.email }}</span>
            <span class="badge"><i class="fas fa-fingerprint"></i> ID: #{{ currentPatientData.id }}</span>
          </div>
        </div>
      </div>

      <div class="history-card main-card">
        <div class="card-header"><h2><i class="fas fa-prescription-bottle-alt"></i> Ordonnances</h2></div>
        
        <div v-if="prescriptionStore.getPrescriptions.length === 0 && !historyLoading" class="empty-state">
          <i class="fas fa-folder-open"></i> <p>Aucune ordonnance enregistrée.</p>
        </div>

        <div v-else class="prescriptions-list">
          <div v-for="(p, index) in prescriptionStore.getPrescriptions" :key="p.id" class="prescription-item">
            <div class="item-top">
              <span class="presc-number">Référence #{{ p.id || index + 1 }}</span>
              <span class="presc-date">{{ formatDate(p.created_at) }}</span>
            </div>
            <div class="item-meta">
              <div class="meta-info"><strong>Médecin :</strong> {{ getDoctorName(p) }}</div>
              <div class="meta-info"><strong>Statut :</strong> <span :class="['status-tag', p.status?.toLowerCase()]">{{ p.status }}</span></div>
            </div>
            <div class="medications-section">
              <div v-for="line in getPrescriptionLines(p)" :key="line.id" class="med-row">
                <span class="med-name">{{ line.medication_name }}</span> - {{ line.dosage }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="secondary-grid">
        <div class="history-card compact">
          <h3><i class="fas fa-vial"></i> Laboratoire</h3>
          <ul class="document-list">
            <li v-for="lab in labStore.getLabRequests" :key="lab.id" class="lab-li">
              <div class="lab-header">
                <span class="doc-title">{{ lab.name }}</span>
                <span :class="['status-mini', lab.status]">{{ lab.status }}</span>
              </div>
              <div v-if="lab.resultats && lab.resultats.length > 0" class="results-area">
                <div v-for="res in lab.resultats" :key="res.id" class="res-item">
                  <p>{{ res.comments }}</p>
                  <a v-if="res.result_file" :href="'https://santeko.abdatytch.com/storage/' + res.result_file" target="_blank" class="btn-download">
                    <i class="fas fa-download"></i> Télécharger
                  </a>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <div class="history-card compact">
          <h3><i class="fas fa-stethoscope"></i> Consultations</h3>
          <ul class="document-list">
            <li v-for="c in consultationStore.getPatientConsultations" :key="c.id">
              <span class="doc-title">{{ c.motif }}</span>
              <span class="status-mini">{{ c.status }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </SidebarLayout>
</template>

<script setup>
import { computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import SidebarLayout from '@/layouts/SidebarLayout.vue';
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

const patientId = computed(() => route.params.patientId || authStore.user?.patient_id || currentPatientData.value?.id);

const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : 'N/A';
const getDoctorName = (p) => p.doctor?.user ? `Dr. ${p.doctor.user.last_name}` : 'Médecin SantéKo';
const getPrescriptionLines = (p) => p.lines || p.prescription_lines || [];

const loadData = async (id) => {
  if (!id) return;
  console.log("🔍 Récupération des données pour patient:", id);
  await Promise.allSettled([
    patientStore.onePatient(id),
    prescriptionStore.fetchPatientPrescriptions(id),
    labStore.listLabRequests({ patient_id: id }),
    consultationStore.fetchPatientConsultations(id),
    medicalReportStore.fetchAllMedicalReports({ patient_id: id })
  ]);
  console.log("📊 Données Lab reçues avec résultats:", labStore.labRequests);
};

watch(patientId, (newId) => { if (newId) loadData(newId); }, { immediate: true });

const historyLoading = computed(() => patientStore.loading || prescriptionStore.isLoading || labStore.loading);
const historyError = computed(() => patientStore.error || prescriptionStore.getError || labStore.error);

onMounted(() => { if (patientId.value) loadData(patientId.value); });
</script>

<style scoped>
.history-section { padding: 30px; max-width: 1200px; margin: 0 auto; background: #f8fafc; min-height: 100vh; }
.patient-hero-card { display: flex; align-items: center; gap: 20px; background: linear-gradient(135deg, #002580 0%, #0040d0 100%); padding: 25px; border-radius: 15px; color: white; margin-bottom: 30px; }
.history-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; }
.lab-li { display: flex; flex-direction: column; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
.lab-header { display: flex; justify-content: space-between; align-items: center; }
.results-area { margin-top: 8px; padding: 10px; background: #f1f5f9; border-radius: 6px; font-size: 0.85rem; }
.btn-download { display: block; color: #0040d0; font-weight: bold; margin-top: 5px; }
.spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #002580; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>