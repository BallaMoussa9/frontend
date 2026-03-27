<template>
  <SidebarLayout>
    <section class="history-section">
      <div class="dashboard-header">
        <div class="header-content">
          <h1 class="page-title">
            <FileText :size="32" class="title-icon" />
            Historique Médical
          </h1>
          <p class="page-subtitle">Consultez vos prescriptions, analyses et rapports médicaux centralisés.</p>
        </div>
      </div>

      <div v-if="historyLoading" class="global-loader">
        <div class="spinner"></div>
        <span>Récupération de vos données...</span>
      </div>

      <div v-if="historyError" class="alert-error">
        <AlertTriangle :size="20" /> {{ historyError }}
      </div>

      <div v-if="currentPatientData" class="patient-hero-card">
        <div class="patient-avatar"><UserCircle :size="48" /></div>
        <div class="patient-details">
          <h2>{{ currentPatientData.user.last_name }} {{ currentPatientData.user.first_name }}</h2>
          <div class="info-badges">
            <span class="badge">
              <div class="badge-icon">
                <Mail :size="16" />
              </div>
              {{ currentPatientData.user.email }}
            </span>
            <span class="badge">
              <div class="badge-icon">
                <Fingerprint :size="16" />
              </div>
              ID: #{{ currentPatientData.id }}
            </span>
          </div>
        </div>
      </div>

      <div class="history-card main-card">
        <div class="card-header">
          <div class="card-icon">
            <FileText :size="24" />
          </div>
          <h2 class="card-title">Ordonnances</h2>
        </div>
        
        <div v-if="prescriptionStore.getPrescriptions.length === 0 && !historyLoading" class="empty-state">
          <FolderOpen :size="32" />
          <p>Aucune ordonnance enregistrée.</p>
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
          <div class="compact-title">
            <div class="card-icon">
              <Beaker :size="20" />
            </div>
            <h3>Laboratoire</h3>
          </div>
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
                    <Download :size="16" /> Télécharger
                  </a>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <div class="history-card compact">
          <div class="compact-title">
            <div class="card-icon">
              <Stethoscope :size="20" />
            </div>
            <h3>Consultations</h3>
          </div>
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
import {
  FileText, User, Mail, Fingerprint, AlertTriangle, Download,
  Activity, Stethoscope, Beaker, Calendar, Clock,
  CheckCircle, XCircle, Loader, FolderOpen, UserCircle,
  FilePlus, Pill
} from 'lucide-vue-next';

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
.history-section {
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
  --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  --shadow-xl: 0 30px 60px -12px rgba(0, 0, 0, 0.5);
  --radius: 16px;
  
  padding: 2rem;
  margin: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  box-sizing: border-box;
  position: relative;
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
  color: white;
  font-size: 1.1rem;
  margin-top: 12px;
  opacity: 0.9;
}

.global-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: white;
  min-height: 60vh;
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
  box-shadow: 0 0 20px rgba(37, 99, 235, 0.3);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.global-loader span {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  opacity: 0.8;
}

.alert-error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1));
  color: #ef4444;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 600;
  animation: slideIn 0.4s ease-out;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.patient-hero-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  padding: 2rem;
  border-radius: 16px;
  color: white;
  margin-bottom: 2rem;
  margin-top: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-lg);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  max-width: 100%;
  box-sizing: border-box;
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

.patient-hero-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.5);
  border-color: var(--primary);
}

.patient-avatar {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
}

.patient-avatar svg {
  color: white;
}

.patient-details h2 {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.info-badges {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.badge {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(10px);
}

.badge-icon {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
  margin-right: 0.5rem;
}

.history-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-lg);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  margin-bottom: 2rem;
  margin-top: 2rem;
  max-width: 100%;
  box-sizing: border-box;
  animation: fadeInUp 0.8s ease-out 0.3s both;
}

.history-card::before {
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

.history-card:hover::before {
  transform: scaleX(1);
}

.history-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
}

.main-card {
  margin-bottom: 2rem;
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
  color: white; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
}

.history-card:hover .card-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.5);
}

.card-title { 
  font-size: 1.3rem; 
  font-weight: 800; 
  color: white; 
  margin: 0; 
  flex: 1;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.compact-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0 0 1.5rem 0;
}

.compact-title .card-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
}

.history-card:hover .compact-title .card-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.5);
}

.compact-title h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.empty-state {
  text-align: center;
  padding: 4rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
  backdrop-filter: blur(20px);
  border-radius: 16px;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeIn 0.6s ease-out;
  margin-bottom: 2rem;
  margin-top: 2rem;
}

.empty-state svg {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.prescriptions-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.prescription-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  animation: fadeIn 0.6s ease-out backwards;
}

.prescription-item:nth-child(1) { animation-delay: 0.1s; }
.prescription-item:nth-child(2) { animation-delay: 0.2s; }
.prescription-item:nth-child(3) { animation-delay: 0.3s; }

.prescription-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-4px);
}

.item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.presc-number {
  font-weight: 800;
  color: var(--primary-light);
  font-size: 1rem;
}

.presc-date {
  color: var(--gray);
  font-size: 0.9rem;
  font-weight: 600;
}

.item-meta {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}

.meta-info {
  color: var(--gray-light);
  font-size: 0.95rem;
}

.meta-info strong {
  color: white;
  font-weight: 700;
}

.status-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status-tag.active {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1));
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-tag.completed {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1));
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.medications-section {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 1rem;
}

.med-row {
  color: var(--gray-light);
  font-size: 0.9rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.med-row:last-child {
  border-bottom: none;
}

.med-name {
  color: white;
  font-weight: 700;
}

.secondary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
  margin-top: 1rem;
  animation: fadeInUp 0.8s ease-out 0.9s both;
}

.compact {
  padding: 1.5rem;
}

.compact h3 {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.2rem;
  font-weight: 800;
  color: white;
  margin: 0 0 1.5rem 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.compact h3 svg {
  color: white;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  padding: 6px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.document-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.document-list li {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.document-list li:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.lab-li {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.doc-title {
  color: white;
  font-weight: 700;
  font-size: 1rem;
}

.status-mini {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status-mini.completed {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1));
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-mini.pending {
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.2), rgba(251, 146, 60, 0.1));
  color: #fb923c;
  border: 1px solid rgba(251, 146, 60, 0.3);
}

.results-area {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 1rem;
  font-size: 0.9rem;
}

.res-item {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 0.8rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.res-item:last-child {
  border-bottom: none;
}

.res-item p {
  color: var(--gray-light);
  margin: 0;
  line-height: 1.5;
}

.btn-download {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-light);
  font-weight: 700;
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
  align-self: flex-start;
}

.btn-download:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
  color: white;
}

/* Variables CSS */
:root {
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
  --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  --shadow-xl: 0 30px 60px -12px rgba(0, 0, 0, 0.5);
  --radius: 16px;
}

@media (max-width: 768px) {
  .history-section {
    padding: 1rem;
  }

  .patient-hero-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .info-badges {
    justify-content: center;
  }

  .item-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .secondary-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  h1 {
    font-size: 1.8rem;
  }

  .card-header h2 {
    font-size: 1.2rem;
  }
}
</style>