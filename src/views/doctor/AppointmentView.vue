<template>
  <MedecinLayout>
    <div class="rendezvous-page">
      <div class="rendezvous-content">
        <header class="page-header">
          <div class="header-left">
            <h1>Rendez-vous du jour</h1>
            <p class="date-subtitle">{{ todayDisplay }}</p>
          </div>
          <button @click="refreshAppointments" class="btn-refresh" :disabled="appointmentStore.loading">
            <span v-if="!appointmentStore.loading">🔄 Actualiser</span>
            <span v-else>Chargement...</span>
          </button>
        </header>

        <div v-if="appointmentStore.error" class="alert error">
          <span class="icon">⚠️</span> {{ appointmentStore.error }}
        </div>
        <div v-if="appointmentStore.success" class="alert success">
          <span class="icon">✅</span> {{ appointmentStore.success }}
        </div>

        <div v-if="userStore.loading || appointmentStore.loading" class="loading-overlay">
          <div class="spinner"></div>
          <p>Mise à jour de votre agenda...</p>
        </div>

        <div v-else-if="userStore.error" class="error-state">
          <div class="error-icon">❌</div>
          <h3>Erreur de chargement</h3>
          <p>{{ userStore.error }}</p>
          <button @click="retryLoading" class="btn-primary">Réessayer</button>
        </div>

        <div v-else-if="!userStore.currentDoctorProfile" class="error-state">
          <div class="error-icon">👨‍⚕️</div>
          <h3>Profil non configuré</h3>
          <p>Impossible de récupérer vos informations de praticien.</p>
          <button @click="retryLoading" class="btn-primary">Réessayer</button>
        </div>

        <div v-else-if="filteredAppointments.length > 0" class="appointments-container">
          <div class="list-summary">
            Vous avez <strong>{{ filteredAppointments.length }}</strong> rendez-vous prévus aujourd'hui.
          </div>

          <div class="appointments-grid">
            <div v-for="appointment in filteredAppointments" :key="appointment.id" class="appointment-card" :class="appointment.status">
              <div class="card-main">
                <div class="patient-profile">
                  <div class="avatar">
                    {{ getInitials(appointment.patient?.user?.first_name, appointment.patient?.user?.last_name) }}
                  </div>
                  <div class="details">
                    <h3>{{ appointment.patient?.user?.first_name }} {{ appointment.patient?.user?.last_name }}</h3>
                    <span class="type-badge">{{ getAppointmentTypeLabel(appointment.type) }}</span>
                  </div>
                </div>
                <div class="status-box">
                  <span :class="['status-tag', appointment.status]">
                    {{ formatStatus(appointment.status) }}
                  </span>
                </div>
              </div>

              <div class="card-info">
                <div class="info-item">
                  <span class="label">Heure</span>
                  <span class="value">⏰ {{ formatAppointmentTime(appointment.appointment_time) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Téléphone</span>
                  <span class="value">📞 {{ appointment.patient?.user?.phone || 'Non renseigné' }}</span>
                </div>
                <div class="info-item full">
                  <span class="label">Motif de consultation</span>
                  <p class="value motif">{{ appointment.motif || 'Aucun motif spécifié' }}</p>
                </div>
              </div>

              <div class="card-footer">
                <button
                  v-if="appointment.status === 'pending'"
                  @click="updateStatus(appointment.id, 'confirmed')"
                  class="btn-action confirm"
                  :disabled="appointmentStore.loading"
                >✓ Confirmer</button>
                
                <button
                  v-if="appointment.status === 'confirmed'"
                  @click="updateStatus(appointment.id, 'completed')"
                  class="btn-action complete"
                  :disabled="appointmentStore.loading"
                >✅ Terminer</button>

                <button
                  v-if="appointment.status !== 'completed' && appointment.status !== 'canceled'"
                  @click="updateStatus(appointment.id, 'canceled')"
                  class="btn-action cancel"
                  :disabled="appointmentStore.loading"
                >✕ Annuler</button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-illustration">📅</div>
          <h3>Aucun rendez-vous aujourd'hui</h3>
          <p>Votre agenda est vide pour le moment.</p>
          <div class="empty-actions">
            <router-link to="/doctor/dashboard" class="btn-outline">← Tableau de bord</router-link>
            <button @click="refreshAppointments" class="btn-primary">Actualiser</button>
          </div>
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
.rendezvous-page {
  background-color: #f8fafc;
  min-height: 100vh;
  width: 100%;
  padding: 20px;
}

.rendezvous-content {
  max-width: 1000px;
  margin: 0 auto;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  color: #1c325f;
  font-size: 24px;
  margin: 0;
  font-weight: 700;
}

.date-subtitle {
  color: #64748b;
  margin: 5px 0 0 0;
}

/* Alertes */
.alert {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
}
.alert.error { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
.alert.success { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }

/* Liste */
.list-summary {
  margin-bottom: 20px;
  color: #475569;
}

.appointments-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Card */
.appointment-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border-left: 5px solid #cbd5e1;
  transition: transform 0.2s;
}

.appointment-card:hover {
  transform: translateX(5px);
}

/* Couleurs de bordure selon statut */
.appointment-card.confirmed { border-left-color: #34c759; }
.appointment-card.pending { border-left-color: #ff9500; }
.appointment-card.completed { border-left-color: #64748b; }
.appointment-card.canceled { border-left-color: #ff3b30; }

.card-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.patient-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 48px;
  height: 48px;
  background: #e2e8f0;
  color: #1c325f;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 700;
}

.details h3 {
  margin: 0;
  font-size: 18px;
  color: #1c325f;
}

.type-badge {
  font-size: 12px;
  color: #007aff;
  font-weight: 500;
}

/* Info Grid */
.card-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.info-item.full { grid-column: 1 / -1; }

.label {
  display: block;
  font-size: 11px;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 4px;
}

.value {
  color: #1e293b;
  font-weight: 600;
}

.motif {
  font-style: italic;
  font-weight: 400;
}

/* Actions */
.card-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-action {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.btn-action.confirm { background: #34c759; color: white; }
.btn-action.complete { background: #007aff; color: white; }
.btn-action.cancel { background: #f1f5f9; color: #ff3b30; }

.btn-action:hover:not(:disabled) { opacity: 0.8; }

/* États vides/Erreurs */
.empty-state, .error-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
}

.empty-illustration, .error-icon {
  font-size: 50px;
  margin-bottom: 20px;
}

.btn-primary {
  background: #007aff;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-outline {
  display: inline-block;
  padding: 10px 24px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  text-decoration: none;
  color: #64748b;
  margin-right: 10px;
}

/* Statuts Tags */
.status-tag {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 700;
  text-transform: uppercase;
}
.status-tag.pending { background: #fff7ed; color: #c2410c; }
.status-tag.confirmed { background: #f0fdf4; color: #15803d; }
.status-tag.completed { background: #f1f5f9; color: #475569; }
.status-tag.canceled { background: #fef2f2; color: #b91c1c; }

/* Loading */
.loading-overlay {
  text-align: center;
  padding: 40px;
}

@media (max-width: 640px) {
  .card-info { grid-template-columns: 1fr; }
  .card-footer { flex-direction: column; }
  .btn-action { width: 100%; }
}
</style>