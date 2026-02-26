<template>
  <NurseLayout>
    <div class="dashboard-wrapper">
      <header class="dashboard-header">
        <div class="header-content">
          <h1 class="welcome-title">
            Bonjour, <span>{{ nurseName }}</span> 👋
          </h1>
          <p class="subtitle">Voici un aperçu de vos activités pour ce shift.</p>
        </div>
        <button @click="loadDashboardData" class="refresh-action" :disabled="loading">
          <RefreshCw :class="{ 'spinning': loading }" :size="18" />
          <span>Actualiser</span>
        </button>
      </header>

      <div v-if="error" class="error-banner">
        <AlertCircle :size="20" />
        <span>{{ error }}</span>
        <button @click="loadDashboardData" class="retry-link">Réessayer</button>
      </div>

      <section class="stats-grid">
        <div v-for="card in statCards" :key="card.title" class="stat-card" :class="{ 'is-loading': loading }">
          <div class="card-icon" :style="{ backgroundColor: card.bgColor, color: card.color }">
            <component :is="card.icon" :size="24" />
          </div>
          <div class="card-info">
            <span class="card-label">{{ card.title }}</span>
            <h3 class="card-value">{{ loading ? '--' : card.value }}</h3>
            <span class="card-trend">{{ card.desc }}</span>
          </div>
        </div>
      </section>

      <div class="dashboard-lower-grid">
        <section class="notifications-panel">
          <div class="panel-header">
            <h2 class="panel-title">
              <Bell :size="20" /> Notifications Urgentes
            </h2>
          </div>
          
          <div v-if="loading" class="panel-loading">
            <div v-for="n in 3" :key="n" class="skeleton-line"></div>
          </div>

          <div v-else-if="notifications.length === 0" class="panel-empty">
            <CheckCircle :size="40" class="empty-icon" />
            <p>Tout est à jour ! Aucune alerte en attente.</p>
          </div>

          <ul v-else class="notif-list">
            <li v-for="(notif, index) in notifications" :key="index" :class="notif.type">
              <div class="notif-indicator"></div>
              <div class="notif-body">
                <p class="notif-msg"><strong>[{{ notif.label }}]</strong> {{ notif.message }}</p>
                <span class="notif-time">{{ notif.time }}</span>
              </div>
            </li>
          </ul>
        </section>

        <section class="quick-status-panel">
          <h2 class="panel-title"><Activity :size="20" /> État du service</h2>
          <div class="status-content">
            <div class="status-item">
              <span>Relève effectuée</span>
              <span class="badge success">OUI</span>
            </div>
            <div class="status-item">
              <span>Urgentiste de garde</span>
              <span class="nurse-tag">Dr. Martin</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  </NurseLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import NurseLayout from '@/layouts/NurseLayout.vue'
import { useAuthStore } from '@/stores/authStores'
import { usePatientStore } from '@/stores/patientStore'
import { useUrgentistStore } from '@/stores/urgentistStore'
import { 
  Users, AlertCircle, Thermometer, ClipboardList, 
  Droplets, RefreshCw, Bell, CheckCircle, Activity 
} from 'lucide-vue-next'

const authStore = useAuthStore()
const patientStore = usePatientStore()
const urgentistStore = useUrgentistStore()

const loading = ref(true)
const error = ref(null)
const nurseName = computed(() => authStore.user?.first_name || 'Infirmier.ère')

const stats = ref({ patients: 0, emergencies: 0, vitals: 0, notes: 0, blood: 0 })
const notifications = ref([])

// Configuration des cartes pour le rendu dynamique
const statCards = computed(() => [
  { title: 'Patients', value: stats.value.patients, desc: 'Assignés à vous', icon: Users, color: '#0040d0', bgColor: '#eff6ff' },
  { title: 'Urgences', value: stats.value.emergencies, desc: 'Alertes SOS', icon: AlertCircle, color: '#e11d48', bgColor: '#fff1f2' },
  { title: 'Signes Vitaux', value: stats.value.vitals, desc: 'À renseigner', icon: Thermometer, color: '#d97706', bgColor: '#fffbeb' },
  { title: 'Observations', value: stats.value.notes, desc: 'En attente', icon: ClipboardList, color: '#7c3aed', bgColor: '#f5f3ff' },
  { title: 'Transfusions', value: stats.value.blood, desc: 'En cours', icon: Droplets, color: '#2563eb', bgColor: '#f0f9ff' }
])

const loadDashboardData = async () => {
  loading.value = true
  error.value = null
  try {
    // Simuler un chargement ou appeler tes stores
    await Promise.all([
      loadPatientStats(),
      loadEmergencyStats()
      // ... autres loaders
    ])
    // Simulation de données pour les signes vitaux si ton store n'est pas prêt
    stats.value.vitals = 4
    stats.value.notes = 2
    
    await loadNotifications()
  } catch (err) {
    error.value = "Impossible de charger les données."
  } finally {
    loading.value = false
  }
}

const loadPatientStats = async () => {
  await patientStore.allPatient()
  stats.value.patients = patientStore.patients.length // Logique de filtrage à affiner
}

const loadEmergencyStats = async () => {
  await urgentistStore.fetchAlertsStats()
  stats.value.emergencies = urgentistStore.statsOverview.pending
}

const loadNotifications = async () => {
  // Simulé ici, mais utilise urgentistStore.activeAlerts
  notifications.value = [
    { label: 'SOS', message: 'Patient Chambre 302 demande assistance', type: 'urgent', time: '2 min' },
    { label: 'Signes', message: 'Prise de tension attendue pour Mme. Durand', type: 'reminder', time: '15 min' }
  ]
}

onMounted(loadDashboardData)
</script>

<style scoped>
.dashboard-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

/* HEADER */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
}

.welcome-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.welcome-title span { color: #0040d0; }
.subtitle { color: #64748b; margin: 4px 0 0 0; }

.refresh-action {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-action:hover:not(:disabled) { border-color: #0040d0; color: #0040d0; }
.spinning { animation: spin 1s linear infinite; }

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* STATS GRID */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }

.card-icon {
  width: 54px;
  height: 54px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-info .card-label { font-size: 0.85rem; color: #64748b; font-weight: 600; }
.card-info .card-value { font-size: 1.5rem; font-weight: 800; color: #1e293b; margin: 4px 0; }
.card-info .card-trend { font-size: 0.75rem; color: #94a3b8; }

/* LOWER GRID */
.dashboard-lower-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.notifications-panel, .quick-status-panel {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 24px;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 20px;
}

.notif-list { list-style: none; padding: 0; margin: 0; }
.notif-list li {
  display: flex;
  gap: 15px;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 12px;
  background: #f8fafc;
  position: relative;
  overflow: hidden;
}

.notif-indicator { width: 4px; height: 100%; position: absolute; left: 0; top: 0; }
.urgent .notif-indicator { background: #e11d48; }
.reminder .notif-indicator { background: #f59e0b; }

.notif-body { flex: 1; }
.notif-msg { margin: 0; font-size: 0.95rem; color: #334155; }
.notif-time { font-size: 0.8rem; color: #94a3b8; }

.panel-empty {
  text-align: center;
  padding: 40px 0;
  color: #94a3b8;
}

.empty-icon { color: #10b981; margin-bottom: 12px; opacity: 0.5; }

/* RECENT ACTIVITY TAGS */
.status-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.badge { padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; }
.badge.success { background: #dcfce7; color: #15803d; }
.nurse-tag { color: #0040d0; font-weight: 600; font-size: 0.9rem; }

@media (max-width: 1024px) {
  .dashboard-lower-grid { grid-template-columns: 1fr; }
}
</style>