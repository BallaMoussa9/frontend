<template>
  <MedecinLayout>
    <div class="rendezvous-container">
      <h1>Rendez-vous du jour</h1>
      <p class="date-header">Aujourd'hui, {{ todayDisplay }}</p>

      <!-- Messages d'erreur/succès -->
      <div v-if="appointmentStore.error" class="message-box error">
        {{ appointmentStore.error }}
      </div>
      <div v-if="appointmentStore.success" class="message-box success">
        {{ appointmentStore.success }}
      </div>

      <!-- État de chargement -->
      <div v-if="userStore.loading || appointmentStore.loading" class="loading-state">
        <p>Chargement des rendez-vous...</p>
      </div>

      <!-- Erreur de profil docteur -->
      <div v-else-if="userStore.error" class="message-box error">
        ❌ {{ userStore.error }}
        <button @click="retryLoading" class="retry-btn">Réessayer</button>
      </div>

      <!-- Aucun profil docteur -->
      <div v-else-if="!userStore.currentDoctorProfile" class="no-appointments">
        <div class="no-profile-icon">👨‍⚕️</div>
        <h3>Profil docteur non configuré</h3>
        <p>Votre profil docteur n'a pas été trouvé. Veuillez contacter l'administration.</p>
        <button @click="retryLoading" class="retry-btn large">Réessayer</button>
      </div>

      <!-- Liste des rendez-vous -->
      <div v-else-if="filteredAppointments.length > 0" class="appointments-list">
        <div class="appointments-header">
          <h2>Vos rendez-vous du jour ({{ filteredAppointments.length }})</h2>
          <button @click="refreshAppointments" class="btn-refresh" :disabled="appointmentStore.loading">
            🔄 Actualiser
          </button>
        </div>

        <div v-for="appointment in filteredAppointments" :key="appointment.id" class="appointment-card">
          <div class="card-header">
            <div class="patient-info">
              <div class="patient-avatar">
                {{ getInitials(appointment.patient?.user?.first_name, appointment.patient?.user?.last_name) }}
              </div>
              <div>
                <h3>
                  {{ appointment.patient?.user?.first_name || 'Patient' }}
                  {{ appointment.patient?.user?.last_name || 'Inconnu' }}
                </h3>
                <p class="appointment-type">{{ getAppointmentTypeLabel(appointment.type) }}</p>
              </div>
            </div>
            <span :class="['status-tag', appointment.status]">
              {{ formatStatus(appointment.status) }}
            </span>
          </div>

          <div class="card-body">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-icon">⏰</span>
                <span class="info-text">{{ formatAppointmentTime(appointment.appointment_time) }}</span>
              </div>
              <div class="info-item">
                <span class="info-icon">📅</span>
                <span class="info-text">{{ formatAppointmentDate(appointment.appointment_date) }}</span>
              </div>
              <div class="info-item">
                <span class="info-icon">📞</span>
                <span class="info-text">{{ appointment.patient?.user?.phone || 'Non renseigné' }}</span>
              </div>
              <div class="info-item full-width">
                <span class="info-icon">🎯</span>
                <span class="info-text">{{ appointment.motif || 'Aucun motif spécifié' }}</span>
              </div>
            </div>
          </div>

          <div class="card-actions">
            <button
              @click="updateStatus(appointment.id, 'confirmed')"
              :disabled="appointment.status === 'confirmed' || appointment.status === 'completed' || appointmentStore.loading"
              class="action-btn confirm"
              v-if="appointment.status === 'pending'">
              ✓ Confirmer
            </button>
            <button
              @click="updateStatus(appointment.id, 'completed')"
              :disabled="appointment.status === 'completed' || appointmentStore.loading"
              class="action-btn complete"
              v-if="appointment.status === 'confirmed'">
              ✅ Terminer
            </button>
            <button
              @click="updateStatus(appointment.id, 'canceled')"
              :disabled="appointment.status === 'canceled' || appointment.status === 'completed' || appointmentStore.loading"
              class="action-btn cancel"
              v-if="appointment.status !== 'completed' && appointment.status !== 'canceled'">
              ✕ Annuler
            </button>
          </div>
        </div>
      </div>

      <!-- Aucun rendez-vous -->
      <div v-else class="no-appointments">
        <div class="empty-icon">📅</div>
        <h3>Aucun rendez-vous aujourd'hui</h3>
        <p>Vous n'avez aucun rendez-vous planifié pour aujourd'hui.</p>
        <div class="action-buttons">
          <router-link to="/doctor/dashboard" class="back-link">
            ← Retour au tableau de bord
          </router-link>
          <button @click="refreshAppointments" class="btn-refresh">
            🔄 Actualiser
          </button>
        </div>
      </div>
    </div>
  </MedecinLayout>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppointmentPatientStore } from '@/stores/appointmentPatientStore'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/authStores'
import MedecinLayout from '@/layouts/MedecinLayout.vue'

const router = useRouter()
const appointmentStore = useAppointmentPatientStore()
const userStore = useUserStore()
const auth = useAuthStore()

const loading = ref(false)

// 🔧 CORRECTION : Récupération de l'ID du docteur depuis userStore
const currentDoctorId = computed(() => userStore.currentDoctorProfile?.id)

// Format pour l'affichage français
const todayDisplay = new Date().toLocaleDateString('fr-FR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

// 🔧 CORRECTION : Normalisation de la date
function getTodayDateFormat() {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

// 🔧 CORRECTION : Filtrage des rendez-vous du jour
const filteredAppointments = computed(() => {
  const todayDate = getTodayDateFormat()

  if (!Array.isArray(appointmentStore.appointments)) return []

  const todayAppointments = appointmentStore.appointments
    .filter(rdv => {
      if (!rdv.appointment_date) return false
      const appointmentDatePart = rdv.appointment_date.split(' ')[0].split('T')[0]
      return appointmentDatePart === todayDate
    })
    .sort((a, b) => (a.appointment_time || '').localeCompare(b.appointment_time || ''))

  console.log('📅 Rendez-vous du jour filtrés:', todayAppointments)
  return todayAppointments
})

// 🔧 CORRECTION : Chargement du profil docteur
const loadDoctorProfile = async () => {
  loading.value = true
  userStore.error = null
  
  try {
    if (!auth.user?.id) {
      throw new Error('Utilisateur non authentifié')
    }

    console.log('🔄 Chargement du profil docteur via userStore...')
    await userStore.fetchDoctorByUserId(auth.user.id)
    
    if (!userStore.currentDoctorProfile) {
      throw new Error('Profil docteur non trouvé pour cet utilisateur')
    }
    
    console.log('✅ Profil docteur chargé avec succès:', userStore.currentDoctorProfile)
    
  } catch (error) {
    console.error('❌ Erreur chargement profil docteur:', error)
    userStore.error = 'Impossible de charger le profil docteur: ' + error.message
  } finally {
    loading.value = false
  }
}

// 🔧 CORRECTION : Chargement initial
onMounted(async () => {
  console.log('🚀 Initialisation de la page rendez-vous')
  
  await loadDoctorProfile()
  
  if (currentDoctorId.value) {
    console.log('🔄 Chargement des rendez-vous du docteur:', currentDoctorId.value)
    await appointmentStore.fetchDoctorAppointments(currentDoctorId.value)
  }
})

// 🔧 CORRECTION : Rafraîchissement des rendez-vous
const refreshAppointments = async () => {
  if (currentDoctorId.value) {
    await appointmentStore.fetchDoctorAppointments(currentDoctorId.value)
  }
}

const retryLoading = async () => {
  await loadDoctorProfile()
}

// 🔧 CORRECTION : Mise à jour du statut
async function updateStatus(appointmentId, status) {
  if (currentDoctorId.value) {
    console.log(`🔄 Mise à jour statut RDV ${appointmentId} vers: ${status}`)
    await appointmentStore.updateAppointmentStatus(currentDoctorId.value, appointmentId, status)
    await refreshAppointments()
  }
}

// Fonctions utilitaires
function formatStatus(status) {
  const statuses = {
    'pending': 'En attente',
    'confirmed': 'Confirmé',
    'canceled': 'Annulé',
    'rescheduled': 'Reprogrammé',
    'completed': 'Terminé',
    'scheduled': 'Planifié',
  }
  return statuses[status] || status
}

const formatAppointmentTime = (timeString) => {
  if (!timeString) return '--:--'
  return timeString.substring(0, 5)
}

const formatAppointmentDate = (dateString) => {
  if (!dateString) return '--/--/----'
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const getAppointmentTypeLabel = (type) => {
  const labels = {
    'consultation': 'Consultation',
    'suivi': 'Suivi',
    'urgence': 'Urgence',
    'vaccination': 'Vaccination',
    'examen': 'Examen',
    'teleconsultation': 'Téléconsultation'
  }
  return labels[type] || type || 'Non spécifié'
}

const getInitials = (firstName, lastName) => {
  if (!firstName || !lastName) return '??'
  return `${firstName[0]}${lastName[0]}`.toUpperCase()
}
</script>

<style scoped>
/* Conteneur principal */
.rendezvous-container {
  padding: 30px;
  background-color: #f8fafc;
  min-height: 100vh;
}

h1 {
  color: #1c325f;
  margin-bottom: 5px;
  font-size: 2em;
  font-weight: 600;
}

.date-header {
  color: #6c757d;
  font-size: 1.1em;
  margin-bottom: 25px;
}

/* Header des rendez-vous */
.appointments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e9ecef;
}

.appointments-header h2 {
  color: #1c325f;
  margin: 0;
  font-size: 1.4em;
}

.btn-refresh {
  background: #f8f9fa;
  border: 1px solid #ddd;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-refresh:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #007aff;
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Messages de feedback */
.message-box {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 600;
  border: 1px solid transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-box.error {
  background-color: #ffebee;
  color: #d32f2f;
  border-color: #ef9a9a;
}

.message-box.success {
  background-color: #e8f5e9;
  color: #388e3c;
  border-color: #a5d6a7;
}

.retry-btn {
  background: #007aff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.retry-btn.large {
  padding: 10px 20px;
  font-size: 14px;
  margin-top: 10px;
}

/* Carte de rendez-vous */
.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.appointment-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-left: 4px solid #007aff;
  transition: all 0.2s;
}

.appointment-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.appointment-card.online {
  border-left-color: #34c759;
}

.appointment-card.urgent {
  border-left-color: #ff3b30;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.patient-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.patient-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #007aff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
}

.patient-info h3 {
  margin: 0 0 4px 0;
  font-size: 1.3em;
  color: #1c325f;
  font-weight: 600;
}

.appointment-type {
  margin: 0;
  color: #666;
  font-size: 0.9em;
}

/* Tags de statut */
.status-tag {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8em;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-tag.pending { background-color: #ff9500; }
.status-tag.confirmed { background-color: #34c759; }
.status-tag.canceled { background-color: #ff3b30; }
.status-tag.completed { background-color: #6c757d; }
.status-tag.rescheduled { background-color: #007aff; }
.status-tag.scheduled { background-color: #9c27b0; }

/* Corps de la carte */
.card-body {
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.info-text {
  color: #555;
  font-size: 0.95em;
}

/* Actions des cartes */
.card-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85em;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn.confirm {
  background-color: #34c759;
  color: white;
}

.action-btn.complete {
  background-color: #007aff;
  color: white;
}

.action-btn.cancel {
  background-color: #ff3b30;
  color: white;
}

.action-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* État de non-rendez-vous */
.no-appointments {
  text-align: center;
  padding: 60px 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.no-appointments h3 {
  color: #1c325f;
  margin-bottom: 12px;
  font-size: 1.4em;
}

.no-appointments p {
  color: #666;
  font-size: 1.1em;
  margin-bottom: 25px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.back-link {
  background: #007aff;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
}

.back-link:hover {
  background: #0056cc;
  text-decoration: none;
}

/* État de chargement */
.loading-state {
  text-align: center;
  padding: 40px;
  font-size: 1.1em;
  color: #007aff;
}

/* Profil non trouvé */
.no-profile-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

/* Responsive */
@media (max-width: 768px) {
  .rendezvous-container {
    padding: 20px 15px;
  }

  .appointments-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .card-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .card-actions {
    flex-direction: column;
  }

  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .action-btn {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .patient-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .patient-avatar {
    width: 40px;
    height: 40px;
    font-size: 14px;
  }
}
</style>