<template>
  <AdminLayout>
    <div class="dossier-medical-wrapper">
      <header class="page-header">
        <div class="title-section">
          <button @click="goBack" class="btn-back" title="Retour">
            <span class="arrow">←</span>
          </button>
          <div class="header-text">
            <h2 v-if="currentPatient">Dossier de {{ patientFullName }}</h2>
            <h2 v-else>Dossier Médical</h2>
            <p class="subtitle" v-if="currentPatient">Patient ID: #{{ currentPatient.id }}</p>
          </div>
        </div>
        <div class="actions">
          <button class="btn-print" @click="handlePrint">🖨️ Imprimer</button>
        </div>
      </header>

      <div v-if="loading" class="state-container loading">
        <div class="spinner"></div>
        <p>Chargement du dossier médical...</p>
      </div>

      <div v-else-if="patientStore.error" class="state-container error">
        <div class="icon">❌</div>
        <p>Erreur : {{ patientStore.error }}</p>
      </div>

      <div v-else-if="!currentPatient" class="state-container empty">
        <div class="icon">🔍</div>
        <p>Patient introuvable avec l'ID #{{ route.params.id }}.</p>
      </div>

      <div v-else class="dossier-content">
        
        <div class="info-card vital-card">
          <h3>Informations Clés</h3>
          <div class="grid-details">
            <div class="detail-item">
              <span class="label">Sexe</span>
              <span class="value">{{ currentPatient.user?.genre || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Date de naissance</span>
              <span class="value">{{ currentPatient.user?.birth_date || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Groupe sanguin</span>
              <span class="value blood-type">{{ currentPatient.group_sanguine || 'N/A' }}</span>
            </div>
            <div class="detail-item full-width">
              <span class="label">Conditions Chroniques</span>
              <span class="value condition-pill">{{ currentPatient.maladies_chroniques || 'Aucune enregistrée' }}</span>
            </div>
          </div>
        </div>

        <section class="medical-section">
          <div class="section-header">
            <h3>Ordonnances ({{ prescriptionStore.getPrescriptions.length }})</h3>
          </div>

          <div v-if="prescriptionStore.isLoading" class="inner-loading">
            Chargement des ordonnances...
          </div>
          
          <div v-else-if="!prescriptionStore.getPrescriptions.length" class="empty-state-mini">
            <p>Aucune ordonnance n'est enregistrée pour ce patient.</p>
          </div>

          <div v-else class="prescription-grid">
            <div v-for="rx in prescriptionStore.getPrescriptions" :key="rx.id" class="rx-card">
              <div class="rx-header">
                <div class="date-tag">
                  📅 {{ rx.date_prescription ? new Date(rx.date_prescription).toLocaleDateString('fr-FR') : 'Date Inconnue' }}
                </div>
                <span :class="['status-pill', rx.status]">
                  {{ rx.status }}
                </span>
              </div>

              <div class="rx-body">
                <p class="doctor-name">Prescrit par <strong>Dr. {{ rx.doctor?.user?.last_name || 'Inconnu' }}</strong></p>
                
                <div v-if="rx.prescription_lines?.length" class="medication-list">
                  <div v-for="(line, index) in rx.prescription_lines" :key="line.id || index" class="med-item">
                    <div class="med-icon">💊</div>
                    <div class="med-info">
                      <p class="med-name">{{ line.medication_name }} <span class="dosage">({{ line.dosage }})</span></p>
                      <p class="med-usage">{{ line.frequency }} — {{ line.instructions }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="medical-section placeholder-section">
          <h3>Historique Médical & Consultations</h3>
          <div class="coming-soon">
            <p>Cette section sera alimentée par les futurs rapports de consultations.</p>
          </div>
        </section>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { usePatientStore } from '@/stores/patientStore'
import { usePrescriptionStore } from '@/stores/prescriptionStore'

const route = useRoute()
const router = useRouter() // Requis pour router.back()

const patientStore = usePatientStore()
const prescriptionStore = usePrescriptionStore()

const { currentPatient, loading: isPatientLoading } = storeToRefs(patientStore)
const loading = computed(() => isPatientLoading.value || prescriptionStore.isLoading)

// --- LOGIQUE DE NAVIGATION ---
const goBack = () => {
  router.back()
}

const handlePrint = () => {
  window.print()
}

// --- LOGIQUE DE DONNÉES ---
const patientFullName = computed(() => {
  const user = currentPatient.value?.user
  return user ? `${user.first_name} ${user.last_name}` : 'Patient Inconnu'
})

const loadPatientAndPrescriptions = async (id) => {
  if (!id || isNaN(id)) return;
  await patientStore.onePatient(id);
  await prescriptionStore.fetchPatientPrescriptions(id);
}

watch(() => route.params.id, (newId) => {
  const id = parseInt(newId);
  if (id) loadPatientAndPrescriptions(id);
}, { immediate: true })
</script>

<style scoped>
.dossier-medical-wrapper {
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px;
}

/* Header & Retour */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.btn-back {
  width: 45px;
  height: 45px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.2s ease;
}

.btn-back:hover {
  background: #f1f5f9;
  transform: translateX(-4px);
  border-color: #cbd5e1;
}

.header-text h2 { margin: 0; color: #1e293b; font-size: 26px; font-weight: 800; }
.subtitle { margin: 0; color: #64748b; font-size: 14px; }

.btn-print {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  color: #475569;
}

/* Info Card Style */
.info-card {
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  border: 1px solid #f1f5f9;
}

.info-card h3 { margin-top: 0; color: #0040d0; font-size: 18px; margin-bottom: 20px; }

.grid-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.detail-item { display: flex; flex-direction: column; gap: 4px; }
.detail-item .label { color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
.detail-item .value { color: #1e293b; font-weight: 700; font-size: 15px; }

.blood-type { color: #e11d48 !important; background: #fff1f2; padding: 2px 8px; border-radius: 6px; width: fit-content; }

/* Ordonnances */
.medical-section { margin-top: 40px; }
.section-header { margin-bottom: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; }

.prescription-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.rx-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: transform 0.2s;
}

.rx-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }

.rx-header {
  padding: 15px 20px;
  background: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
}

.rx-body { padding: 20px; }
.medication-list { display: flex; flex-direction: column; gap: 15px; }
.med-item { display: flex; gap: 12px; }
.med-name { font-weight: 700; color: #1e293b; margin: 0; }
.med-usage { font-size: 12px; color: #64748b; margin: 2px 0; }

/* Status Labels */
.status-pill {
  font-size: 10px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 20px;
  text-transform: uppercase;
  background: #f1f5f9;
  color: #64748b;
}

/* Spinner */
.state-container { text-align: center; padding: 80px; }
.spinner {
  width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #0040d0;
  border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.coming-soon {
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  color: #94a3b8;
}

@media (max-width: 600px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 15px; }
  .grid-details { grid-template-columns: 1fr; }
}
</style>