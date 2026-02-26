<template>
  <LabLayout>
    <div class="lab-dashboard">
      <div class="welcome-box">
        <h2>Bienvenue, {{ authStore.user?.first_name }} {{ authStore.user?.last_name }}</h2>
        <p>Poste : Technicien de laboratoire</p>
      </div>

      <div class="stats">
        <div class="stat-card">
          <h3>{{ pendingExams.length }}</h3>
          <p>En attente</p>
        </div>
        <div class="stat-card">
          <h3>{{ inProgressExams.length }}</h3>
          <p>En cours</p>
        </div>
        <div class="stat-card">
          <h3 class="completed-text">{{ completedCountToday }}</h3>
          <p>Terminées aujourd'hui</p>
        </div>
      </div>

      <div class="section">
        <div class="card">
          <div class="card-header">
            <h3>📥 Nouvelles demandes</h3>
            <span class="badge-count">{{ pendingExams.length }}</span>
          </div>
          <ul class="scrollable-list">
            <li v-for="exam in pendingExams" :key="exam.id" class="list-item">
              <div class="item-info">
                <strong>Patient: {{ getPatientFullName(exam.patient) }}</strong>
                <span>Examen: {{ exam.name }}</span>
                <small>Demandé par: {{ getDoctorFullName(exam.doctor) }}</small>
              </div>
              <button 
                @click="updateStatus(exam.id, 'in_progress')" 
                class="btn-action"
                :disabled="labStore.loading"
              >
                Démarrer
              </button>
            </li>
            <li v-if="pendingExams.length === 0" class="empty">Aucune nouvelle demande</li>
          </ul>
        </div>

        <div class="card in-progress-card">
          <div class="card-header">
            <h3>🧪 Analyses en cours</h3>
            <span class="badge-count blue">{{ inProgressExams.length }}</span>
          </div>
          <ul class="scrollable-list">
            <li v-for="exam in inProgressExams" :key="exam.id" class="list-item">
              <div class="item-info">
                <strong>{{ getPatientFullName(exam.patient) }}</strong>
                <span>{{ exam.name }}</span>
                <small>Lancée le: {{ formatDate(exam.updated_at) }}</small>
              </div>
              <button 
                @click="updateStatus(exam.id, 'completed')" 
                class="btn-action success"
                :disabled="labStore.loading"
              >
                Terminer
              </button>
            </li>
            <li v-if="inProgressExams.length === 0" class="empty">Aucune analyse en cours</li>
          </ul>
        </div>
      </div>

      <div class="history">
        <h3>📋 Suivi du flux de travail (Actif)</h3>
        <div class="table-mini-wrapper">
          <table class="mini-table">
            <thead>
              <tr>
                <th>Date Demande</th>
                <th>Patient</th>
                <th>Médecin</th>
                <th>Examen</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="analysis in activeRequests" :key="analysis.id">
                <td>{{ formatDate(analysis.created_at) }}</td>
                <td>{{ getPatientFullName(analysis.patient) }}</td>
                <td>{{ getDoctorFullName(analysis.doctor) }}</td>
                <td>{{ analysis.name }}</td>
                <td>
                  <span :class="['status-tag', analysis.status]">
                    {{ translateStatus(analysis.status) }}
                  </span>
                </td>
                <td>
                   <button 
                    v-if="analysis.status === 'pending'" 
                    @click="updateStatus(analysis.id, 'in_progress')" 
                    class="btn-small"
                   >Lancer</button>
                   <button 
                    v-else-if="analysis.status === 'in_progress'" 
                    @click="updateStatus(analysis.id, 'completed')" 
                    class="btn-small success"
                   >Clôturer</button>
                </td>
              </tr>
              <tr v-if="activeRequests.length === 0">
                <td colspan="6" class="empty">Toutes les analyses sont traitées !</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </LabLayout>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import LabLayout from '@/layouts/LabLayout.vue'
import { useLabStore } from '@/stores/labStore'
import { useAuthStore } from '@/stores/authStores'

const labStore = useLabStore()
const authStore = useAuthStore()

onMounted(async () => {
  console.log("--- DASHBOARD MOUNTED ---")
  await labStore.listLabRequests()
})

// --- FILTRES RÉACTIFS (COMPUTED) ---

const pendingExams = computed(() => 
  labStore.labRequests.filter(r => r.status === 'pending')
)

const inProgressExams = computed(() => 
  labStore.labRequests.filter(r => r.status === 'in_progress')
)

const activeRequests = computed(() => 
  labStore.labRequests.filter(r => r.status !== 'completed')
)

const completedCountToday = computed(() => 
  labStore.labRequests.filter(r => r.status === 'completed').length
)

// --- ACTIONS ---

const updateStatus = async (id, newStatus) => {
  console.log(`[ACTION] Mise à jour ID: ${id} vers ${newStatus}`);
  
  const success = await labStore.updateLabRequestStatus(id, newStatus)
  
  if (success) {
    console.log("✅ Store mis à jour avec succès.");
    // NOTE: On ne fait plus listLabRequests() ici car le store a déjà fait le splice()
    // Cela évite de recharger toute la base de données inutilement.
  } else {
    console.error("❌ Échec de la mise à jour dans le store.");
  }
}

// --- FORMATAGE ---

const translateStatus = (status) => {
  const map = {
    'pending': 'En attente',
    'in_progress': 'En cours',
    'completed': 'Terminé'
  };
  return map[status] || status;
}

const getPatientFullName = (patient) => {
  if (!patient || !patient.user) return 'Patient Inconnu';
  return `${patient.user.first_name} ${patient.user.last_name}`;
}

const getDoctorFullName = (doctor) => {
  if (!doctor || !doctor.user) return 'Dr. Inconnu';
  return `Dr. ${doctor.user.first_name} ${doctor.user.last_name}`;
}

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  });
}
</script>

<style scoped>
.lab-dashboard { display: flex; flex-direction: column; gap: 24px; padding: 20px; }
.welcome-box { background-color: #e7faff; padding: 20px; border-radius: 12px; border-left: 5px solid #00a88f; }
.stats { display: flex; gap: 16px; }
.stat-card { background: white; padding: 20px; border-radius: 12px; flex: 1; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
.stat-card h3 { font-size: 1.8rem; color: #00a88f; margin-bottom: 5px; }
.completed-text { color: #2e7d32 !important; }
.section { display: flex; gap: 20px; }
.card { flex: 1; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.in-progress-card { border-top: 4px solid #0369a1; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.badge-count { background: #00a88f; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem; }
.badge-count.blue { background: #0369a1; }
.scrollable-list { list-style: none; padding: 0; max-height: 300px; overflow-y: auto; }
.list-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #f0f0f0; }
.btn-action { background: #00a88f; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: opacity 0.2s; }
.btn-action:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-action.success { background: #2e7d32; }
.status-tag { padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; }
.status-tag.pending { background: #fff3e0; color: #ef6c00; }
.status-tag.in_progress { background: #e0f2fe; color: #0369a1; }
.mini-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
.mini-table th, .mini-table td { text-align: left; padding: 12px; border-bottom: 1px solid #eee; font-size: 0.85rem; }
.btn-small { padding: 4px 10px; font-size: 0.7rem; border-radius: 4px; border: 1px solid #00a88f; background: transparent; color: #00a88f; cursor: pointer; }
.btn-small.success { border-color: #2e7d32; color: #2e7d32; }
.empty { text-align: center; padding: 20px; color: #94a3b8; font-style: italic; list-style: none;}
</style>