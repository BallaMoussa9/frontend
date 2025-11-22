<template>
  <NurseLayout>
    <div class="dashboard-container">
      <section class="header-section">
        <h1 class="title">Tableau de bord infirmier</h1>
        <p class="welcome-msg">Bienvenue <strong>{{ nurseName }}</strong>, voici les tâches du jour 👨‍⚕️</p>
      </section>

      <!-- Loading State -->
      <div v-if="loading" class="loading-section">
        <p>Chargement des données en cours...</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-section">
        <p class="error-message">❌ {{ error }}</p>
        <button @click="loadDashboardData" class="retry-btn">Réessayer</button>
      </div>

      <!-- Main Content -->
      <template v-else>
        <section class="cards-grid">
          <div class="dashboard-card">
            <h3>Patients assignés</h3>
            <p>{{ stats.patients }}</p>
            <small>Patients sous votre responsabilité</small>
          </div>

          <div class="dashboard-card">
            <h3>Urgences reçues</h3>
            <p>{{ stats.emergencies }}</p>
            <small>Alertes SOS aujourd'hui</small>
          </div>

          <div class="dashboard-card">
            <h3>Signes vitaux à renseigner</h3>
            <p>{{ stats.vitals }}</p>
            <small>Mesures en attente</small>
          </div>

          <div class="dashboard-card">
            <h3>Observations en attente</h3>
            <p>{{ stats.notes }}</p>
            <small>Rapports à compléter</small>
          </div>

          <div class="dashboard-card">
            <h3>Transfusions en cours</h3>
            <p>{{ stats.blood }}</p>
            <small>Unités sanguines réservées</small>
          </div>
        </section>

        <section class="notifications-section">
          <div class="section-header">
            <h2 class="section-title">🛎️ Notifications urgentes</h2>
            <button @click="loadDashboardData" class="refresh-btn" :disabled="loading">
              🔄 {{ loading ? 'Actualisation...' : 'Actualiser' }}
            </button>
          </div>
          
          <div v-if="notifications.length === 0" class="empty-notifications">
            <p>Aucune notification urgente pour le moment</p>
          </div>
          <ul v-else class="notification-list">
            <li v-for="(notif, index) in notifications" :key="index">
              <span class="tag" :class="notif.type">{{ notif.label }}</span> - {{ notif.message }}
              <small class="notification-time">{{ notif.time }}</small>
            </li>
          </ul>
        </section>
      </template>
    </div>
  </NurseLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import NurseLayout from '@/layouts/NurseLayout.vue'
import { useAuthStore } from '@/stores/authStores'
import { usePatientStore } from '@/stores/patientStore'
import { useUrgentistStore } from '@/stores/urgentistStore'
import { useNurseStore } from '@/stores/nurseStore'

// Stores
const authStore = useAuthStore()
const patientStore = usePatientStore()
const urgentistStore = useUrgentistStore()
const nurseStore = useNurseStore()

// States
const loading = ref(true)
const error = ref(null)

// Données dynamiques
const nurseName = computed(() => authStore.user?.first_name || 'Infirmier/Infirmière')

// Statistiques dynamiques
const stats = ref({
  patients: 0,
  emergencies: 0,
  vitals: 0,
  notes: 0,
  blood: 0
})

// Notifications dynamiques
const notifications = ref([])

// Chargement des données du dashboard
const loadDashboardData = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Chargement en parallèle pour meilleures performances
    await Promise.all([
      loadPatientStats(),
      loadEmergencyStats(),
      loadVitalSignsStats(),
      loadActivityReportsStats(),
      loadBloodBankStats(),
      loadNotifications()
    ])
  } catch (err) {
    console.error('Erreur chargement dashboard:', err)
    error.value = 'Erreur lors du chargement des données. Veuillez réessayer.'
  } finally {
    loading.value = false
  }
}

// 1. Statistiques des patients assignés
const loadPatientStats = async () => {
  try {
    await patientStore.allPatient()
    // Filtrer les patients assignés à cet infirmier (logique à adapter selon votre modèle)
    const assignedPatients = patientStore.patients.filter(patient => 
      patient.assigned_nurse_id === authStore.user?.nurse_id
    )
    stats.value.patients = assignedPatients.length
  } catch (err) {
    console.error('Erreur chargement patients:', err)
    stats.value.patients = 0
  }
}

// 2. Statistiques des urgences
const loadEmergencyStats = async () => {
  try {
    await urgentistStore.fetchAlertsStats()
    const statsOverview = urgentistStore.statsOverview
    stats.value.emergencies = statsOverview.pending + statsOverview.inProgress
  } catch (err) {
    console.error('Erreur chargement urgences:', err)
    stats.value.emergencies = 0
  }
}

// 3. Signes vitaux à renseigner
const loadVitalSignsStats = async () => {
  try {
    // Logique pour compter les signes vitaux en attente
    // Adaptez selon votre modèle de données
    const pendingVitals = 0 // À implémenter selon votre logique métier
    stats.value.vitals = pendingVitals
  } catch (err) {
    console.error('Erreur chargement signes vitaux:', err)
    stats.value.vitals = 0
  }
}

// 4. Observations/Rapports en attente
const loadActivityReportsStats = async () => {
  try {
    // Logique pour compter les rapports d'activité en attente
    const pendingReports = 0 // À implémenter selon votre logique métier
    stats.value.notes = pendingReports
  } catch (err) {
    console.error('Erreur chargement rapports:', err)
    stats.value.notes = 0
  }
}

// 5. Transfusions en cours
const loadBloodBankStats = async () => {
  try {
    if (authStore.user?.nurse_id) {
      await nurseStore.fetchBloodBankOverview(authStore.user.nurse_id)
      // Logique pour compter les transfusions en cours
      const activeTransfusions = 0 // À implémenter selon votre logique métier
      stats.value.blood = activeTransfusions
    }
  } catch (err) {
    console.error('Erreur chargement banque de sang:', err)
    stats.value.blood = 0
  }
}

// 6. Notifications dynamiques
const loadNotifications = async () => {
  try {
    const newNotifications = []
    
    // Alertes SOS urgentes
    await urgentistStore.fetchActiveAlerts()
    if (urgentistStore.activeAlerts.length > 0) {
      urgentistStore.activeAlerts.forEach(alert => {
        newNotifications.push({
          label: 'Urgence',
          message: `Alerte SOS - Patient ${alert.patient?.user?.first_name || 'Inconnu'}`,
          type: 'urgent',
          time: 'Maintenant'
        })
      })
    }
    
    // Rappels de signes vitaux (exemple)
    if (stats.value.vitals > 0) {
      newNotifications.push({
        label: 'Rappel',
        message: `${stats.value.vitals} signes vitaux à renseigner`,
        type: 'reminder',
        time: 'Aujourd\'hui'
      })
    }
    
    // Rappels de rapports (exemple)
    if (stats.value.notes > 0) {
      newNotifications.push({
        label: 'Rappel',
        message: `${stats.value.notes} observations en attente`,
        type: 'reminder', 
        time: 'Aujourd\'hui'
      })
    }
    
    notifications.value = newNotifications.slice(0, 5) // Limiter à 5 notifications
    
  } catch (err) {
    console.error('Erreur chargement notifications:', err)
    notifications.value = []
  }
}

// Cycle de vie
onMounted(() => {
  loadDashboardData()
})

// Actualisation automatique toutes les 2 minutes
setInterval(() => {
  if (!loading.value) {
    loadDashboardData()
  }
}, 120000)
</script>

<style scoped>
.dashboard-container {
  padding: 30px;
  background-color: #f2f7fc;
  font-family: 'Segoe UI', sans-serif;
  min-height: 100vh;
}

.header-section {
  margin-bottom: 25px;
}

.title {
  font-size: 26px;
  font-weight: 600;
  color: #002580;
}

.welcome-msg {
  font-size: 16px;
  color: #555;
}

.welcome-msg strong {
  color: #002580;
}

/* Loading & Error States */
.loading-section, .error-section {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  margin: 20px 0;
}

.error-message {
  color: #e74c3c;
  margin-bottom: 15px;
}

.retry-btn {
  background: #0077cc;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.retry-btn:hover {
  background: #005fa3;
}

/* Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.dashboard-card {
  background-color: white;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.dashboard-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.dashboard-card h3 {
  font-size: 16px;
  margin-bottom: 8px;
  color: #003366;
}

.dashboard-card p {
  font-size: 24px;
  font-weight: bold;
  color: #0077cc;
  margin: 10px 0;
}

.dashboard-card small {
  color: #666;
  font-size: 12px;
}

/* Notifications Section */
.notifications-section {
  background-color: white;
  padding: 20px;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title {
  font-size: 18px;
  color: #002580;
  margin: 0;
}

.refresh-btn {
  background: #f8f9fa;
  border: 1px solid #ddd;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-btn:hover:not(:disabled) {
  background: #e9ecef;
}

.empty-notifications {
  text-align: center;
  padding: 20px;
  color: #666;
}

.notification-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notification-list li {
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.notification-list li:last-child {
  border-bottom: none;
}

.tag {
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
  margin-right: 8px;
  font-size: 12px;
}

.tag.urgent {
  background-color: #e74c3c;
  color: white;
}

.tag.reminder {
  background-color: #f1c40f;
  color: #333;
}

.notification-time {
  color: #888;
  font-size: 12px;
  margin-left: auto;
  padding-left: 10px;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 15px;
  }
  
  .cards-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .notification-list li {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .notification-time {
    margin-left: 0;
    padding-left: 0;
  }
}
</style>