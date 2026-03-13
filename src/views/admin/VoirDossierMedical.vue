<template>
  <AdminLayout>
    <div class="dossier-medical-wrapper">
      <header class="page-header">
        <div class="title-section">
          <button @click="goBack" class="btn-back">←</button>
          <div class="header-text">
            <h2>Dossier de {{ patientFullName }}</h2>
            <p class="subtitle">Patient ID: #{{ currentPatient?.id }}</p>
          </div>
        </div>
        <button class="btn-print" @click="handlePrint">🖨️ Imprimer</button>
      </header>

      <div v-if="loading" class="state-container">
        <div class="spinner"></div>
        <p>Chargement complet du dossier...</p>
      </div>

      <div v-else class="dossier-content">
        <div class="info-card">
          <h3>👤 Informations Clés</h3>
          <div class="grid-details">
            <div class="detail-item">
              <span class="label">Sexe</span>
              <span class="value">{{ currentPatient?.genre || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Groupe sanguin</span>
              <span class="value blood-type">{{ currentPatient?.group_sanguine || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Poids</span>
              <span class="value">{{ currentPatient?.poids ? currentPatient.poids + ' kg' : 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Maladies Chroniques</span>
              <span class="value">{{ currentPatient?.maladies_chroniques || 'Aucune' }}</span>
            </div>
          </div>
        </div>

        <section class="medical-section">
          <h3>💊 Ordonnances</h3>
          <div v-if="!safePrescriptions.length" class="empty-state">Aucune ordonnance.</div>

          <div v-else class="prescription-grid">
            <div v-for="rx in safePrescriptions" :key="rx.id" class="rx-card">
              <div class="rx-header">
                <span class="rx-date">📅 {{ formatDate(rx.date_prescription) }}</span>
                <span :class="['status-pill', rx.status]">{{ rx.status }}</span>
              </div>

              <div class="rx-body">
                <p class="doctor-info">
                  Prescrit par <strong>Dr. {{ rx.doctor?.user?.first_name }} {{ rx.doctor?.user?.last_name }}</strong>
                </p>
                
                <div v-for="line in rx.lines" :key="line.id" class="med-card">
                  <div class="med-header">
                    <strong>{{ line.medication_name }}</strong>
                    <span class="med-badge">{{ line.dosage }}</span>
                  </div>
                  <div class="med-details">
                    <p><strong>Fréquence:</strong> {{ line.frequency }} fois/jour</p>
                    <p><strong>Durée:</strong> {{ line.duration }} jours</p>
                    <p class="med-instr"><em>Instruction: {{ line.instructions }}</em></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="medical-section">
          <h3>🔬 Analyses de Laboratoire</h3>
          <div v-if="!safeLabRequests.length" class="empty-state">Aucune analyse enregistrée.</div>

          <div v-else class="prescription-grid">
            <div v-for="analysis in safeLabRequests" :key="analysis.id" class="rx-card">
              <div class="rx-header">
                <strong>{{ analysis.name }}</strong>
                <span :class="['status-pill', analysis.status]">{{ analysis.status }}</span>
              </div>
              <div class="rx-body">
                <div v-if="analysis.resultats && analysis.resultats.length > 0">
                  <div v-for="res in analysis.resultats" :key="res.id" class="result-card">
                    <p><strong>Commentaires:</strong> {{ res.comments || 'Pas de commentaire' }}</p>
                    <a :href="'http://localhost:8000/storage/' + res.result_file" 
                       target="_blank" 
                       class="btn-download">
                       📎 Télécharger le résultat (DOCX)
                    </a>
                  </div>
                </div>
                <div v-else class="empty-state-mini">
                  <p>⚠️ En attente des résultats du laboratoire.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="medical-section">
          <h3>📅 Historique des Consultations</h3>
          <div v-if="!safeConsultations.length" class="empty-state">Aucun historique de consultation.</div>
          <div v-else class="prescription-grid">
            <div v-for="c in safeConsultations" :key="c.id" class="rx-card">
              <div class="rx-header">
                <span>{{ formatDate(c.created_at) }}</span>
                <span class="type-badge">{{ c.type }}</span>
              </div>
              <div class="rx-body">
                <p><strong>Motif:</strong> {{ c.motif }}</p>
                <p v-if="c.diagnostic"><strong>Diagnostic:</strong> {{ c.diagnostic }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { usePatientStore } from '@/stores/patientStore'
import { usePrescriptionStore } from '@/stores/prescriptionStore'
import { useLabStore } from '@/stores/labStore'
import { useConsultationStore } from '@/stores/consultationStore'

const route = useRoute()
const router = useRouter()

// Initialisation des stores
const patientStore = usePatientStore()
const prescriptionStore = usePrescriptionStore()
const labStore = useLabStore()
const consultationStore = useConsultationStore()

// Récupération de la réactivité
const { currentPatient, loading: isPatientLoading } = storeToRefs(patientStore)

// Sécurisation des données calculées
const safePrescriptions = computed(() => prescriptionStore.prescriptions || [])
const safeLabRequests = computed(() => labStore.labRequests || [])
const safeConsultations = computed(() => consultationStore.patientConsultations || [])

const loading = computed(() => 
  isPatientLoading.value || prescriptionStore.loading || labStore.loading || consultationStore.loading
)

const patientFullName = computed(() => {
  if (!currentPatient.value?.user) return 'Chargement...'
  return `${currentPatient.value.user.first_name} ${currentPatient.value.user.last_name}`
})

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// FONCTION DE CHARGEMENT CORRIGÉE
const loadData = async (id) => {
  console.log(`🚀 Début du chargement complet pour le patient #${id}`);
  try {
    await Promise.all([
      patientStore.onePatient(id), // Correction ici : fetchPatientById -> onePatient
      prescriptionStore.fetchPatientPrescriptions(id),
      labStore.listLabRequests({ patient_id: id }),
      consultationStore.fetchPatientConsultations(id)
    ]);
    
    // Log spécial pour déboguer le laboratoire
    console.log("🔬 Données Analyses reçues:", labStore.labRequests);
  } catch (err) {
    console.error("❌ Erreur lors de la récupération des données:", err);
  }
}

// Surveillance de l'ID dans l'URL
watch(() => route.params.id, (newId) => {
  if (newId) loadData(parseInt(newId))
}, { immediate: true })

const goBack = () => router.back()
const handlePrint = () => window.print()
</script>

<style scoped>
.dossier-medical-wrapper { max-width: 1100px; margin: 0 auto; padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.title-section { display: flex; align-items: center; gap: 15px; }
.btn-back { border: 1px solid #ddd; background: #fff; padding: 8px 15px; border-radius: 8px; cursor: pointer; }

.info-card { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.grid-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 15px; }
.detail-item .label { display: block; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; }
.detail-item .value { font-size: 16px; font-weight: 600; color: #1e293b; }
.blood-type { color: #e11d48 !important; }

.medical-section { margin-top: 40px; }
.medical-section h3 { border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px; }

.prescription-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
.rx-card { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
.rx-header { background: #f8fafc; padding: 12px 20px; display: flex; justify-content: space-between; font-weight: bold; }
.rx-body { padding: 20px; }

.med-card { background: #f1f5f9; padding: 12px; border-radius: 8px; margin-top: 10px; }
.med-header { display: flex; justify-content: space-between; font-weight: bold; }
.med-badge { background: #0040d0; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
.med-instr { font-size: 13px; color: #64748b; font-style: italic; }

.status-pill { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
.status-pill.completed { background: #dcfce7; color: #15803d; }
.status-pill.pending { background: #fef9c3; color: #854d0e; }

.btn-download { color: #0040d0; text-decoration: none; font-weight: bold; display: inline-block; margin-top: 10px; }
.empty-state { text-align: center; padding: 40px; background: #f8fafc; border-radius: 12px; color: #94a3b8; }
.empty-state-mini { font-size: 13px; color: #94a3b8; text-align: center; }

.spinner { width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #0040d0; border-radius: 50%; animation: spin 1s linear infinite; margin: 20px auto; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>