<template>
  <MedecinLayout>
    <div v-if="loading || userStore.loading || appointmentStore.loading" class="state-container loading-state">
      <div class="spinner-container">
        <div class="spinner"></div>
      </div>
      <h3>Préparation de votre agenda</h3>
      <p style="color: white;">Chargement de vos rendez-vous...</p>
    </div>

    <div v-else-if="userStore.error || appointmentStore.error" class="state-container error-state">
      <div class="icon-container">
        <AlertCircle :size="48" />
      </div>
      <h3>Oups ! Une erreur est survenue</h3>
      <p>Nous rencontrons des difficultés techniques. Veuillez réessayer.</p>
      <button class="retry-btn" @click="retryLoading">Réessayer</button>
    </div>

    <div v-else-if="!userStore.currentDoctorProfile" class="state-container info-state">
      <div class="icon-container">
        <UserX :size="48" />
      </div>
      <h3>Profil médecin introuvable</h3>
      <p>Nous n'avons pas trouvé votre profil professionnel. Contactez le support.</p>
    </div>

    <div v-else class="dashboard-container">
      <div class="dashboard-header">
        <div class="header-content">
          <h1 class="page-title">
            <Calendar :size="32" class="title-icon" />
            Rendez-vous du Jour
          </h1>
          <p class="page-subtitle">Gérez vos consultations et rendez-vous</p>
        </div>
        <div class="header-actions">
          <button class="action-btn primary" @click="refreshAppointments" :disabled="appointmentStore.loading">
            <RefreshCw :size="18" />
            Actualiser
          </button>
          <button class="action-btn secondary" @click="printAppointments">
            <Printer :size="18" />
            Imprimer
          </button>
        </div>
      </div>

      <div v-if="appointmentStore.success" class="success-banner">
        <CheckCircle :size="20" />
        {{ appointmentStore.success }}
      </div>

      <div class="dashboard-grid">
        <section class="card profile-card">
          <div class="card-header">
            <div class="card-icon">
              <CalendarCheck :size="24" />
            </div>
            <h2 class="card-title">Aujourd'hui</h2>
          </div>
          <div class="card-content">
            <div class="vitals-grid">
              <div class="vital-item">
                <div class="vital-icon"><Calendar :size="20" /></div>
                <div class="vital-info">
                  <div class="vital-label">Date</div>
                  <div class="vital-value">{{ todayDisplay }}</div>
                </div>
              </div>

              <div class="vital-item">
                <div class="vital-icon heart"><Users :size="20" /></div>
                <div class="vital-info">
                  <div class="vital-label">Total RDV</div>
                  <div class="vital-value">{{ filteredAppointments.length }}</div>
                </div>
              </div>

              <div class="vital-item">
                <div class="vital-icon temp"><Clock :size="20" /></div>
                <div class="vital-info">
                  <div class="vital-label">Prochain</div>
                  <div class="vital-value">{{ getNextAppointmentTime() }}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="card vitals-card">
          <div class="card-header">
            <div class="card-icon pulse">
              <Activity :size="24" />
            </div>
            <h2 class="card-title">Statistiques</h2>
          </div>
          <div class="card-content">
            <div class="vitals-grid">
              <div class="vital-item">
                <div class="vital-icon"><CheckCircle :size="20" /></div>
                <div class="vital-info">
                  <div class="vital-label">Confirmés</div>
                  <div class="vital-value">{{ getConfirmedCount() }}</div>
                </div>
              </div>

              <div class="vital-item">
                <div class="vital-icon heart"><AlertCircle :size="20" /></div>
                <div class="vital-info">
                  <div class="vital-label">En attente</div>
                  <div class="vital-value">{{ getPendingCount() }}</div>
                </div>
              </div>

              <div class="vital-item">
                <div class="vital-icon temp"><XCircle :size="20" /></div>
                <div class="vital-info">
                  <div class="vital-label">Annulés</div>
                  <div class="vital-value">{{ getCanceledCount() }}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div class="appointments-section">
        <div class="section-header">
          <h2 class="section-title">Liste des Rendez-vous</h2>
          <div class="section-actions">
            <span class="appointments-count">{{ filteredAppointments.length }} rendez-vous</span>
          </div>
        </div>

        <div v-if="filteredAppointments.length > 0" class="appointments-list">
          <div v-for="appointment in filteredAppointments" :key="appointment.id" class="appointment-card" :class="appointment.status">
            <div class="card-header">
              <div class="patient-info">
                <div class="patient-avatar">
                  {{ getInitials(appointment.patient?.user?.first_name, appointment.patient?.user?.last_name) }}
                </div>
                <div class="patient-details">
                  <h3 class="patient-name">{{ appointment.patient?.user?.first_name }} {{ appointment.patient?.user?.last_name }}</h3>
                  <span class="appointment-type">{{ getAppointmentTypeLabel(appointment.type) }}</span>
                </div>
              </div>
              <div class="status-badge" :class="appointment.status">
                {{ formatStatus(appointment.status) }}
              </div>
            </div>

            <div class="card-content">
              <div class="appointment-details">
                <div class="detail-item">
                  <Clock :size="16" />
                  <span>{{ formatAppointmentTime(appointment.appointment_time) }}</span>
                </div>
                <div class="detail-item">
                  <Phone :size="16" />
                  <span>{{ appointment.patient?.user?.phone || 'Non renseigné' }}</span>
                </div>
              </div>
              
              <div v-if="appointment.motif" class="appointment-motif">
                <FileText :size="16" />
                <p>{{ appointment.motif }}</p>
              </div>
            </div>

            <div class="card-actions">
              <button
                v-if="appointment.status === 'pending'"
                @click="updateStatus(appointment.id, 'confirmed')"
                class="action-btn confirm"
                :disabled="appointmentStore.loading"
              >
                <CheckCircle :size="16" />
                Confirmer
              </button>
              
              <button
                v-if="appointment.status === 'confirmed'"
                @click="updateStatus(appointment.id, 'completed')"
                class="action-btn complete"
                :disabled="appointmentStore.loading"
              >
                <CheckSquare :size="16" />
                Terminer
              </button>

              <button
                v-if="appointment.status !== 'completed' && appointment.status !== 'canceled'"
                @click="updateStatus(appointment.id, 'canceled')"
                class="action-btn cancel"
                :disabled="appointmentStore.loading"
              >
                <XCircle :size="16" />
                Annuler
              </button>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">
            <Calendar :size="48" />
          </div>
          <h4>Aucun rendez-vous aujourd'hui</h4>
          <p>Votre agenda est vide pour le moment.</p>
          <div class="empty-actions">
            <router-link to="/doctor/dashboard" class="view-all-btn">
              <ArrowLeft :size="16" />
              Tableau de bord
            </router-link>
            <button @click="refreshAppointments" class="action-btn primary">
              <RefreshCw :size="16" />
              Actualiser
            </button>
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
import {
  Calendar, CalendarCheck, Activity, Users, Clock, CheckCircle, AlertCircle,
  UserX, RefreshCw, Printer, FileText, Phone, XCircle, CheckSquare, ArrowLeft
} from 'lucide-vue-next'

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

// Nouvelles fonctions utilitaires
const getNextAppointmentTime = () => {
  if (filteredAppointments.value.length === 0) return 'Aucun'
  const next = filteredAppointments.value[0]
  return formatAppointmentTime(next.appointment_time)
}

const getConfirmedCount = () => {
  return filteredAppointments.value.filter(apt => apt.status === 'confirmed').length
}

const getPendingCount = () => {
  return filteredAppointments.value.filter(apt => apt.status === 'pending').length
}

const getCanceledCount = () => {
  return filteredAppointments.value.filter(apt => apt.status === 'canceled').length
}

const printAppointments = () => {
  // Ajouter les attributs de date et heure pour le footer d'impression
  const dashboardContainer = document.querySelector('.dashboard-container');
  if (dashboardContainer) {
    const now = new Date();
    dashboardContainer.setAttribute('data-date', now.toLocaleDateString('fr-FR'));
    dashboardContainer.setAttribute('data-time', now.toLocaleTimeString('fr-FR'));
  }
  
  // Attendre un peu que les attributs soient appliqués puis imprimer
  setTimeout(() => {
    window.print();
  }, 100);
}
</script>
<style scoped>
.dashboard-container {
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
  --shadow-lg: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 30px 60px -12px rgba(0, 0, 0, 0.5);
  --radius: 16px;
  
  font-family: 'Inter', sans-serif;
  padding: 2rem;
  margin: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  color: white;
  box-sizing: border-box;
  position: relative;
  overflow-x: hidden;
}

/* Animation de fond */
.dashboard-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at top, rgba(37, 99, 235, 0.15) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.dashboard-container > * {
  position: relative;
  z-index: 1;
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
  color: var(--light); 
  font-size: 1.1rem; 
  margin-top: 8px;
  opacity: 0.9;
}

.header-actions { display: flex; gap: 1rem; }
.action-btn {
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  transition: all 0.3s ease;
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.action-btn.primary { 
  background: linear-gradient(135deg, var(--primary), var(--secondary)); 
  color: white; 
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.5);
}

.action-btn.secondary { 
  background: rgba(255, 255, 255, 0.08); 
  color: white; 
  border: 2px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(255, 255, 255, 0.1);
}

.success-banner {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1));
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #22c55e;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  font-weight: 600;
  backdrop-filter: blur(20px);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  animation: fadeInUp 0.8s ease-out 0.3s both;
  margin-bottom: 2rem;
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

.card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border-radius: var(--radius);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  transition: all 0.4s ease;
  position: relative;
}

.card::before {
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

.card:hover::before {
  transform: scaleX(1);
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
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
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
  transition: all 0.3s ease;
}

.card-icon.pulse {
  animation: pulse 2s infinite;
}

.card-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: white;
  margin: 0;
  flex: 1;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.card-content {
  padding: 1.5rem;
}

/* Vitals Grid */
.vitals-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.vital-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border-left: 3px solid var(--secondary);
  transition: all 0.3s ease;
}

.vital-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(5px);
}

.vital-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--secondary), var(--accent));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 6px 15px rgba(16, 185, 129, 0.3);
}

.vital-icon.heart {
  background: linear-gradient(135deg, #ef4444, #f97316);
}

.vital-icon.temp {
  background: linear-gradient(135deg, var(--warning), var(--accent));
}

.vital-info {
  flex: 1;
}

.vital-label {
  color: var(--gray);
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.vital-value {
  color: white;
  font-size: 1.5rem;
  font-weight: 800;
}

/* Appointments Section */
.appointments-section {
  margin-top: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  margin: 0;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.appointments-count {
  background: linear-gradient(135deg, var(--accent), var(--secondary));
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
}

.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.appointment-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border-radius: var(--radius);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  transition: all 0.4s ease;
  position: relative;
}

.appointment-card::before {
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

.appointment-card:hover::before {
  transform: scaleX(1);
}

.appointment-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
}

.appointment-card .card-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.patient-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.patient-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
}

.patient-details {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.patient-name {
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  margin: 0;
}

.appointment-type {
  color: var(--gray);
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.pending {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1));
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #f59e0b;
}

.status-badge.confirmed {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1));
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #22c55e;
}

.status-badge.completed {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(37, 99, 235, 0.1));
  border: 1px solid rgba(37, 99, 235, 0.3);
  color: #2563eb;
}

.status-badge.canceled {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1));
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.appointment-details {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray);
  font-size: 0.9rem;
}

.appointment-motif {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  color: var(--gray);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.appointment-motif p {
  margin: 0;
  line-height: 1.4;
}

.card-actions {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.action-btn.confirm {
  background: linear-gradient(135deg, var(--success), #16a34a);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.action-btn.confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
}

.action-btn.complete {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.action-btn.complete:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
}

.action-btn.cancel {
  background: linear-gradient(135deg, var(--danger), #dc2626);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.action-btn.cancel:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
}

/* Loading and Error States */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;
}

.loading-state h3 {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.error-state h3 {
  color: var(--danger);
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.info-state h3 {
  color: var(--warning);
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.state-container p {
  color: white;
  opacity: 0.8;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.icon-container {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.error-state .icon-container {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1));
  border-color: rgba(239, 68, 68, 0.3);
}

.info-state .icon-container {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1));
  border-color: rgba(245, 158, 11, 0.3);
}

.retry-btn {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
}

.retry-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.5);
  background: linear-gradient(135deg, var(--primary-dark), var(--secondary-dark));
}

/* Spinner */
.spinner-container {
  margin-bottom: 2rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Empty States */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--gray);
}

.empty-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray);
  margin: 0 auto 1.5rem;
}

.empty-state h4 {
  color: white;
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--gray);
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 2rem;
}

.empty-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.view-all-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  text-decoration: none;
}

.view-all-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-header { 
    flex-direction: column; 
    align-items: flex-start; 
    gap: 1rem;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
  
  .header-actions { 
    width: 100%; 
    flex-direction: column;
  }
  
  .action-btn { 
    flex: 1; 
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .appointment-details {
    flex-direction: column;
    gap: 1rem;
  }
  
  .card-actions {
    flex-direction: column;
  }
  
  .empty-actions {
    flex-direction: column;
  }
}

/* Print Styles */
@media print {
  .dashboard-container {
    background: white !important;
    color: black !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
    height: auto !important;
  }

  .dashboard-container::before {
    display: none !important;
  }

  .dashboard-header {
    background: linear-gradient(135deg, #2563eb, #10b981) !important;
    color: white !important;
    padding: 1.5rem !important;
    margin-bottom: 1rem !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    animation: none !important;
  }

  .page-title {
    color: white !important;
    font-size: 1.5rem !important;
    text-shadow: none !important;
  }

  .title-icon {
    background: white !important;
    color: #2563eb !important;
    animation: none !important;
  }

  .page-subtitle {
    color: rgba(255, 255, 255, 0.9) !important;
  }

  .header-actions {
    display: none !important;
  }

  .success-banner {
    display: none !important;
  }

  .card {
    background: white !important;
    border: 2px solid #e5e7eb !important;
    box-shadow: none !important;
    margin-bottom: 1rem !important;
    page-break-inside: avoid;
  }

  .card::before {
    display: none !important;
  }

  .card:hover {
    transform: none !important;
    box-shadow: none !important;
  }

  .card-header {
    background: linear-gradient(135deg, #2563eb, #10b981) !important;
    color: white !important;
    border-bottom: 2px solid #e5e7eb !important;
  }

  .card-icon {
    background: white !important;
    color: #2563eb !important;
    box-shadow: none !important;
    animation: none !important;
  }

  .card-title {
    color: white !important;
    text-shadow: none !important;
  }

  .vital-item {
    background: #f9fafb !important;
    border-left: 3px solid #10b981 !important;
  }

  .vital-item:hover {
    transform: none !important;
  }

  .vital-icon {
    background: linear-gradient(135deg, #2563eb, #10b981) !important;
    color: white !important;
    box-shadow: none !important;
  }

  .vital-label {
    color: #6b7280 !important;
  }

  .vital-value {
    color: #111827 !important;
  }

  .appointment-card {
    background: white !important;
    border: 2px solid #e5e7eb !important;
    box-shadow: none !important;
    margin-bottom: 1rem !important;
    page-break-inside: avoid;
  }

  .appointment-card::before {
    display: none !important;
  }

  .appointment-card:hover {
    transform: none !important;
    box-shadow: none !important;
  }

  .appointment-card .card-header {
    background: linear-gradient(135deg, #2563eb, #10b981) !important;
    color: white !important;
    border-bottom: 2px solid #e5e7eb !important;
  }

  .patient-avatar {
    background: linear-gradient(135deg, #2563eb, #10b981) !important;
    color: white !important;
    box-shadow: none !important;
  }

  .patient-name {
    color: #111827 !important;
  }

  .appointment-type {
    color: #6b7280 !important;
  }

  .status-badge {
    border: 1px solid #d1d5db !important;
  }

  .status-badge.pending {
    background: #fef3c7 !important;
    color: #92400e !important;
  }

  .status-badge.confirmed {
    background: #d1fae5 !important;
    color: #065f46 !important;
  }

  .status-badge.completed {
    background: #dbeafe !important;
    color: #1e40af !important;
  }

  .status-badge.canceled {
    background: #fee2e2 !important;
    color: #991b1b !important;
  }

  .detail-item {
    color: #6b7280 !important;
  }

  .appointment-motif {
    color: #6b7280 !important;
  }

  .card-actions {
    display: none !important;
  }

  .empty-state {
    background: white !important;
    color: #6b7280 !important;
    border: 2px solid #e5e7eb !important;
  }

  .empty-icon {
    background: #f3f4f6 !important;
    color: #6b7280 !important;
  }

  .empty-state h4 {
    color: #111827 !important;
  }

  .empty-state p {
    color: #6b7280 !important;
  }

  .empty-actions {
    display: none !important;
  }

  .section-header {
    border-bottom: 2px solid #e5e7eb !important;
    padding-bottom: 0.5rem !important;
    margin-bottom: 1rem !important;
  }

  .section-title {
    color: #111827 !important;
  }

  .appointments-count {
    background: #e5e7eb !important;
    color: #374151 !important;
  }

  /* Footer d'impression */
  .dashboard-container::after {
    content: attr(data-date) " - " attr(data-time);
    position: fixed;
    bottom: 10px;
    right: 10px;
    font-size: 10px;
    color: #6b7280;
    background: white;
    padding: 2px 5px;
    border: 1px solid #e5e7eb;
    border-radius: 3px;
  }
}
</style>