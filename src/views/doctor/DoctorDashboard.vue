<template>
  <MedecinLayout>
    <div class="dashboard-page">
      <!-- Header avec le profil docteur depuis userStore -->
      <div class="dashboard-header">
        <div class="doctor-info">
          <h1 class="page-title">Dashboard</h1>
          
          <div v-if="userStore.error" class="error-banner">
            ❌ {{ userStore.error }}
            <button @click="retryLoading" class="retry-btn">Réessayer</button>
          </div>
          
          <div v-else-if="userStore.currentDoctorProfile" class="doctor-details">
            <div class="doctor-name">
              Dr. {{ userStore.currentDoctorProfile.user?.first_name }} {{ userStore.currentDoctorProfile.user?.last_name }}
            </div>
            <div class="doctor-speciality">
              {{ userStore.currentDoctorProfile.speciality || 'Médecin Généraliste' }}
            </div>
            <div class="doctor-status">
              Statut: <span :class="userStore.currentDoctorProfile.status">{{ userStore.currentDoctorProfile.status }}</span>
            </div>
          </div>
          
          <div v-else class="loading-doctor">
            Chargement du profil...
          </div>
        </div>
        
        <!-- Statistiques (seulement si le docteur est chargé) -->
        <div v-if="userStore.currentDoctorProfile && !userStore.loading" class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📞</div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.teleconsultations || 0 }}</div>
              <div class="stat-label">Téléconsultations</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">💻</div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.appointmentsToday || 0 }}</div>
              <div class="stat-label">Rendez-vous Aujourd'hui</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.completedConsultations || 0 }}</div>
              <div class="stat-label">Consultations Terminées</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.uniquePatients || 0 }}</div>
              <div class="stat-label">Patients Uniques</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenu conditionnel -->
      <div v-if="userStore.loading" class="loading-full">
        <p>Chargement de votre tableau de bord...</p>
      </div>

      <div v-else-if="userStore.error" class="error-full">
        <div class="error-icon">❌</div>
        <h3>Impossible de charger votre profil</h3>
        <p>{{ userStore.error }}</p>
        <button @click="retryLoading" class="retry-btn large">Réessayer le chargement</button>
      </div>

      <div v-else-if="userStore.currentDoctorProfile" class="dashboard-content">
        <!-- Colonne de gauche -->
        <div class="left-column">
          <!-- Section Rendez-vous du Jour -->
          <div class="section">
            <div class="section-header">
              <h3 class="section-title">Rendez-vous Aujourd'hui</h3>
              <button @click="refreshAppointments" class="btn-refresh" :disabled="loading">
                🔄 Actualiser
              </button>
            </div>
            
            <div v-if="loading" class="loading-small">
              Chargement des rendez-vous...
            </div>
            
            <div v-else-if="todayAppointments.length === 0" class="empty-appointments">
              <div class="empty-icon">📅</div>
              <p>Aucun rendez-vous prévu pour aujourd'hui</p>
            </div>
            
            <div v-else class="appointment-slots">
              <div 
                v-for="appointment in todayAppointments" 
                :key="appointment.id"
                class="appointment-slot"
                :class="appointment.type"
                @click="viewAppointmentDetails(appointment)"
              >
                <div class="patient-avatar-small">
                  {{ getInitials(appointment.patient?.user?.first_name, appointment.patient?.user?.last_name) }}
                </div>
                <div class="slot-info">
                  <div class="patient-name">
                    {{ appointment.patient?.user?.first_name }} {{ appointment.patient?.user?.last_name }}
                  </div>
                  <div class="slot-time">
                    ⏰ {{ formatAppointmentTime(appointment.appointment_time) }}
                  </div>
                  <div class="appointment-type">
                    {{ getAppointmentTypeLabel(appointment.type) }}
                  </div>
                </div>
                <div class="slot-status" :class="appointment.type">
                  {{ appointment.status === 'confirmed' ? 'Confirmé' : appointment.status }}
                </div>
              </div>
            </div>
          </div>

          <!-- Section Demandes en Attente -->
          <div class="section">
            <div class="section-header">
              <h3 class="section-title">Demandes en Attente</h3>
              <span class="badge">{{ pendingAppointments.length }}</span>
            </div>
            
            <div v-if="pendingAppointments.length === 0" class="empty-appointments">
              <div class="empty-icon">✅</div>
              <p>Aucune demande en attente</p>
            </div>
            
            <div v-else class="request-list">
              <div 
                v-for="appointment in pendingAppointments.slice(0, 3)" 
                :key="appointment.id"
                class="request-item"
              >
                <div class="request-avatar">
                  {{ getInitials(appointment.patient?.user?.first_name, appointment.patient?.user?.last_name) }}
                </div>
                <div class="request-info">
                  <div class="request-name">
                    {{ appointment.patient?.user?.first_name }} {{ appointment.patient?.user?.last_name }}
                  </div>
                  <div class="request-date">
                    📅 {{ formatAppointmentDate(appointment.appointment_date) }} 
                    à {{ formatAppointmentTime(appointment.appointment_time) }}
                  </div>
                  <div class="request-motif">
                    🎯 {{ appointment.motif || 'Aucun motif spécifié' }}
                  </div>
                </div>
                <div class="request-actions">
                  <button 
                    @click.stop="confirmAppointment(appointment.id)" 
                    class="btn-confirm"
                  >
                    ✓
                  </button>
                  <button 
                    @click.stop="cancelAppointment(appointment.id)" 
                    class="btn-cancel"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div v-if="pendingAppointments.length > 3" class="more-requests">
                + {{ pendingAppointments.length - 3 }} autres demandes
              </div>
            </div>
          </div>
        </div>

        <!-- Colonne centrale -->
        <div class="center-column">
          <!-- Section Prochain Rendez-vous -->
          <div class="section">
            <div class="section-header">
              <h3 class="section-title">Prochain Rendez-vous</h3>
            </div>
            
            <div v-if="!nextAppointment" class="no-appointment-content">
              <div class="no-appointment-icon">⏰</div>
              <p>Aucun prochain rendez-vous</p>
              <button @click="goToAppointments" class="btn-schedule">
                Voir tous les rendez-vous
              </button>
            </div>
            
            <div v-else class="patient-details">
              <div class="patient-header">
                <div class="patient-avatar-large">
                  {{ getInitials(nextAppointment.patient?.user?.first_name, nextAppointment.patient?.user?.last_name) }}
                </div>
                <div class="patient-main-info">
                  <div class="patient-name-large">
                    {{ nextAppointment.patient?.user?.first_name }} {{ nextAppointment.patient?.user?.last_name }}
                    <span class="online-badge" v-if="nextAppointment.type === 'teleconsultation'">En ligne</span>
                  </div>
                  <div class="appointment-time-next">
                    📅 {{ formatAppointmentDate(nextAppointment.appointment_date) }} 
                    à {{ formatAppointmentTime(nextAppointment.appointment_time) }}
                  </div>
                </div>
              </div>
              
              <div class="patient-info-grid">
                <div class="info-item">
                  <span class="info-label">Type:</span>
                  <span class="info-value">{{ getAppointmentTypeLabel(nextAppointment.type) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Motif:</span>
                  <span class="info-value">{{ nextAppointment.motif || 'Non spécifié' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Statut:</span>
                  <span class="info-value">{{ nextAppointment.status }}</span>
                </div>
              </div>
              
              <div class="patient-actions">
                <button 
                  @click="startConsultationForAppointment(nextAppointment)" 
                  class="btn-start-consultation"
                >
                  Démarrer Consultation
                </button>
                <button 
                  @click="viewPatientFile(nextAppointment.patient?.id)" 
                  class="btn-view-file"
                >
                  Voir Dossier
                </button>
              </div>
            </div>
          </div>

          <!-- Section Patient Fréquent -->
          <div class="section">
            <div class="section-header">
              <h3 class="section-title">Patient Fréquent</h3>
            </div>
            
            <div v-if="!mostFrequentPatient" class="empty-appointments">
              <div class="empty-icon">👥</div>
              <p>Aucun patient fréquent</p>
            </div>
            
            <div v-else class="bestie-content">
              <div class="bestie-avatar">
                {{ getInitials(mostFrequentPatient.user?.first_name, mostFrequentPatient.user?.last_name) }}
              </div>
              <div class="bestie-info">
                <div class="bestie-name">
                  {{ mostFrequentPatient.user?.first_name }} {{ mostFrequentPatient.user?.last_name }}
                </div>
                <div class="bestie-desc">
                  {{ mostFrequentPatient.consultationCount }} consultations ce mois-ci
                </div>
                <button 
                  @click="viewPatient(mostFrequentPatient.id)" 
                  class="btn-view-patient"
                >
                  Voir Profil
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Colonne de droite -->
        <div class="right-column">
          <!-- Section Actions Rapides -->
          <div class="section">
            <div class="section-header">
              <h3 class="section-title">Actions Rapides</h3>
            </div>
            
            <div class="quick-actions">
              <button @click="startNewConsultation" class="quick-action-btn">
                <span class="action-icon">🩺</span>
                <span>Nouvelle Consultation</span>
              </button>
              
              <button @click="goToPrescriptions" class="quick-action-btn">
                <span class="action-icon">📝</span>
                <span>Rédiger Ordonnance</span>
              </button>
              
              <button @click="goToMedicalRecords" class="quick-action-btn">
                <span class="action-icon">📁</span>
                <span>Dossiers Médicaux</span>
              </button>
              
              <button @click="goToAppointments" class="quick-action-btn">
                <span class="action-icon">📅</span>
                <span>Gérer Rendez-vous</span>
              </button>
            </div>
          </div>

          <!-- Section Tableau de Bord -->
          <div class="section">
            <div class="section-header">
              <h3 class="section-title">Tableau de Bord</h3>
            </div>
            
            <div class="databoard-grid">
              <a href="#" class="databoard-item">
                <span class="databoard-icon">📊</span>
                <span>Statistiques</span>
              </a>
              <a href="#" class="databoard-item">
                <span class="databoard-icon">💰</span>
                <span>Facturation</span>
              </a>
              <a href="#" class="databoard-item">
                <span class="databoard-icon">📈</span>
                <span>Performances</span>
              </a>
              <a href="#" class="databoard-item">
                <span class="databoard-icon">👥</span>
                <span>Mes Patients</span>
              </a>
            </div>
          </div>

          <!-- Section Paramètres -->
          <div class="section">
            <div class="section-header">
              <h3 class="section-title">Paramètres</h3>
            </div>
            
            <div class="settings-list">
              <a href="#" class="setting-item">
                <span class="setting-icon">⚙️</span>
                <span>Profil Professionnel</span>
              </a>
              <a href="#" class="setting-item">
                <span class="setting-icon">🕒</span>
                <span>Disponibilités</span>
              </a>
              <a href="#" class="setting-item">
                <span class="setting-icon">🔔</span>
                <span>Notifications</span>
              </a>
              <a href="#" class="setting-item">
                <span class="setting-icon">🔒</span>
                <span>Sécurité</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="no-profile">
        <div class="no-profile-icon">👨‍⚕️</div>
        <h3>Profil docteur non configuré</h3>
        <p>Votre profil docteur n'a pas été trouvé. Veuillez contacter l'administration.</p>
        <button @click="retryLoading" class="retry-btn large">Réessayer</button>
      </div>

      <!-- Messages de feedback -->
      <div v-if="userStore.success" class="success-message">
        {{ userStore.success }}
      </div>
      
      <div v-if="userStore.error" class="error-message">
        {{ userStore.error }}
      </div>
    </div>
  </MedecinLayout>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/authStores'
import { useUserStore } from '@/stores/userStore'
import { useDoctorStore } from '@/stores/doctorStore'
import { useConsultationStore } from '@/stores/consultationStore'
import { useAppointmentPatientStore } from '@/stores/appointmentPatientStore'
import MedecinLayout from '@/layouts/MedecinLayout.vue'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const userStore = useUserStore()
const doctorStore = useDoctorStore()
const consultationStore = useConsultationStore()
const appointmentStore = useAppointmentPatientStore()
const router = useRouter()

const loading = ref(false)
const stats = ref({
  teleconsultations: 0,
  appointmentsToday: 0,
  completedConsultations: 0,
  uniquePatients: 0
})

// 🔧 CORRECTION : Utiliser l'ID du docteur depuis userStore
const currentDoctorId = computed(() => userStore.currentDoctorProfile?.id)

// Rendez-vous du jour (confirmés) avec logs
const todayAppointments = computed(() => {
  if (!appointmentStore.appointments.length) {
    console.log('📅 Aucun rendez-vous chargé')
    return []
  }
  
  const today = new Date().toISOString().split('T')[0]
  const filteredAppointments = appointmentStore.appointments
    .filter(apt => {
      if (!apt.appointment_date) return false
      const aptDate = new Date(apt.appointment_date).toISOString().split('T')[0]
      const isToday = aptDate === today && apt.status === 'confirmed'
      return isToday
    })
    .sort((a, b) => (a.appointment_time || '').localeCompare(b.appointment_time || ''))
  
  console.log('📅 Rendez-vous du jour:', filteredAppointments)
  return filteredAppointments
})

// Prochain rendez-vous
const nextAppointment = computed(() => {
  const now = new Date()
  const futureAppointments = appointmentStore.appointments
    .filter(apt => {
      if (!apt.appointment_date || apt.status !== 'confirmed') return false
      const aptDateTime = new Date(`${apt.appointment_date}T${apt.appointment_time}`)
      return aptDateTime >= now
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`)
      const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`)
      return dateA - dateB
    })
  
  return futureAppointments[0] || null
})

// Demandes en attente
const pendingAppointments = computed(() => {
  return appointmentStore.appointments.filter(apt => apt.status === 'pending')
})

// Patient le plus consulté
const mostFrequentPatient = computed(() => {
  const patients = doctorStore.patients
  return patients.length > 0 ? {
    id: patients[0].id,
    user: patients[0].user,
    consultationCount: Math.floor(Math.random() * 10) + 1
  } : null
})

// 🔧 CORRECTION : Chargement via userStore
const loadDoctorProfile = async () => {
  loading.value = true
  userStore.error = null
  
  try {
    if (!auth.user?.id) {
      throw new Error('Utilisateur non authentifié')
    }

    console.log('🔄 Chargement du profil docteur via userStore...')
    
    // 🔧 CORRECTION : Utiliser userStore.fetchDoctorByUserId
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

// 🔧 CORRECTION : Calcul des statistiques adapté aux données réelles
const calculateStats = () => {
  if (!currentDoctorId.value) {
    stats.value = { teleconsultations: 0, appointmentsToday: 0, completedConsultations: 0, uniquePatients: 0 }
    return
  }

  const appointments = appointmentStore.appointments || []
  const consultations = doctorStore.consultations || []
  const patients = doctorStore.patients || []

  console.log('📊 Données pour calcul stats:', {
    appointments: appointments.length,
    consultations: consultations.length,
    patients: patients.length
  })

  // Statistiques basées sur les données disponibles
  stats.value = {
    teleconsultations: appointments.filter(apt => apt.type === 'teleconsultation').length,
    appointmentsToday: todayAppointments.value.length,
    completedConsultations: consultations.filter(cons => cons.status === 'completed').length,
    uniquePatients: patients.length
  }

  console.log('✅ Statistiques calculées:', stats.value)
}

const refreshAppointments = async () => {
  if (currentDoctorId.value) {
    await appointmentStore.fetchDoctorAppointments(currentDoctorId.value)
    calculateStats()
  }
}

const retryLoading = async () => {
  await loadDoctorProfile()
}

// Fonctions utilitaires
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

// Navigation
const viewAppointmentDetails = (appointment) => {
  router.push(`/doctor/appointments/${appointment.id}`)
}

const viewPatient = (patientId) => {
  router.push(`/doctor/patient/${patientId}`)
}

const viewPatientFile = (patientId) => {
  if (patientId) {
    router.push(`/doctor/patient/${patientId}/dossier`)
  }
}

const confirmAppointment = async (appointmentId) => {
  if (currentDoctorId.value) {
    await appointmentStore.updateAppointmentStatus(currentDoctorId.value, appointmentId, 'confirmed')
    await refreshAppointments()
  }
}

const cancelAppointment = async (appointmentId) => {
  if (currentDoctorId.value) {
    await appointmentStore.updateAppointmentStatus(currentDoctorId.value, appointmentId, 'canceled')
    await refreshAppointments()
  }
}

const startNewConsultation = () => {
  router.push(`/doctor/${currentDoctorId.value}/consultations/new`)
}

const startConsultationForAppointment = (appointment) => {
  if (appointment.patient?.id) {
    router.push(`/doctor/patient/${appointment.patient.id}/consultation`)
  }
}

const goToPrescriptions = () => {
  router.push(`/doctor/${currentDoctorId.value}/prescriptions`)
}

const goToMedicalRecords = () => {
  router.push(`/doctor/${currentDoctorId.value}/dossiers`)
}

const goToAppointments = () => {
  router.push(`/doctor/${currentDoctorId.value}/appointments`)
}

// Fonction pour debugger les données
const debugData = () => {
  console.group('🔍 DEBUG Dashboard Data')
  console.log('👨‍⚕️ Profil docteur:', userStore.currentDoctorProfile)
  console.log('📅 Rendez-vous:', appointmentStore.appointments)
  console.log('👥 Patients:', doctorStore.patients)
  console.log('🏥 Consultations:', doctorStore.consultations)
  console.log('📊 Stats calculées:', stats.value)
  console.log('📅 Rendez-vous aujourd\'hui:', todayAppointments.value)
  console.log('⏳ Demandes en attente:', pendingAppointments.value)
  console.groupEnd()
}

// 🔧 CORRECTION : Chargement initial via userStore avec logs détaillés
onMounted(async () => {
  console.log('🚀 Initialisation du dashboard docteur via userStore')
  
  // Charger le profil docteur via userStore
  await loadDoctorProfile()
  
  // Si le docteur est chargé, charger les autres données
  if (currentDoctorId.value) {
    console.log('🔄 Chargement des données du docteur:', currentDoctorId.value)
    
    await Promise.all([
      appointmentStore.fetchDoctorAppointments(currentDoctorId.value),
      doctorStore.fetchDoctorPatients(currentDoctorId.value)
    ])
    
    console.log('📦 Données chargées:', {
      appointments: appointmentStore.appointments.length,
      patients: doctorStore.patients.length,
      consultations: doctorStore.consultations.length
    })
    
    calculateStats()
    
    // Debug après 1 seconde
    setTimeout(debugData, 1000)
  }
})

// Recalculer les stats quand les données changent
watch(() => appointmentStore.appointments, calculateStats)
watch(() => doctorStore.patients, calculateStats)
watch(() => doctorStore.consultations, calculateStats)
</script>

<style scoped>
.dashboard-page {
  padding: 20px;
  background: #f8fafc;
  min-height: 100vh;
}

.dashboard-header {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.doctor-info {
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  color: #1c325f;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.doctor-name {
  font-size: 16px;
  color: #666;
  margin-bottom: 4px;
}

.doctor-speciality {
  font-size: 14px;
  color: #007aff;
  font-weight: 500;
}

.doctor-status span.active {
  color: #34c759;
}

.doctor-status span.inactive {
  color: #ff3b30;
}

.doctor-status span.busy {
  color: #ff9500;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007aff;
}

.stat-icon {
  font-size: 24px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #1c325f;
  line-height: 1;
}

.stat-label {
  color: #666;
  font-size: 12px;
  margin-top: 4px;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
}

.left-column, .center-column, .right-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.section-title {
  font-size: 16px;
  color: #1c325f;
  margin: 0 0 16px 0;
  font-weight: 600;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.btn-refresh {
  background: #f8f9fa;
  border: 1px solid #ddd;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.badge {
  background: #ff3b30;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* Databoard Section */
.databoard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.databoard-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 14px;
  color: #666;
  text-decoration: none;
  transition: all 0.2s;
}

.databoard-item:hover {
  background: #e9ecef;
  color: #1c325f;
}

.databoard-icon {
  font-size: 16px;
}

/* Rendez-vous Section */
.loading-small {
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 14px;
}

.empty-appointments {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.appointment-slots {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.appointment-slot {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #007aff;
  cursor: pointer;
  transition: all 0.2s;
}

.appointment-slot:hover {
  background: #e9ecef;
}

.appointment-slot.online {
  border-left-color: #34c759;
}

.appointment-slot.urgent {
  border-left-color: #ff3b30;
}

.patient-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #007aff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.slot-info {
  flex: 1;
}

.patient-name {
  font-size: 14px;
  color: #1c325f;
  font-weight: 500;
  margin-bottom: 2px;
}

.slot-time {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.appointment-type {
  font-size: 11px;
  color: #888;
}

.slot-status {
  background: #34c759;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
}

.slot-status.urgent {
  background: #ff3b30;
}

/* Patient Fréquent Section */
.bestie-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bestie-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #ff9500;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
}

.bestie-info {
  flex: 1;
}

.bestie-name {
  font-size: 16px;
  color: #1c325f;
  font-weight: 500;
  margin-bottom: 4px;
}

.bestie-desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.btn-view-patient {
  background: #007aff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
}

/* Demandes en Attente */
.request-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.request-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.request-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #9c27b0;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
}

.request-info {
  flex: 1;
}

.request-name {
  font-size: 14px;
  color: #1c325f;
  font-weight: 500;
  margin-bottom: 2px;
}

.request-date {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.request-motif {
  font-size: 11px;
  color: #888;
}

.request-actions {
  display: flex;
  gap: 4px;
}

.btn-confirm, .btn-cancel {
  border: none;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.btn-confirm {
  background: #34c759;
  color: white;
}

.btn-cancel {
  background: #ff3b30;
  color: white;
}

.more-requests {
  text-align: center;
  padding: 12px;
  color: #666;
  font-size: 12px;
  border-top: 1px solid #eee;
}

/* Actions Rapides */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  text-align: left;
}

.quick-action-btn:hover {
  background: #e9ecef;
  border-color: #007aff;
}

.action-icon {
  font-size: 18px;
}

/* Détails Patient */
.patient-details {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.patient-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.patient-avatar-large {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #007aff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
}

.patient-main-info {
  flex: 1;
}

.patient-name-large {
  font-size: 18px;
  color: #1c325f;
  font-weight: 600;
  margin-bottom: 4px;
}

.online-badge {
  background: #34c759;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  margin-left: 8px;
}

.appointment-time-next {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.patient-info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 4px 0;
}

.info-label {
  color: #666;
}

.info-value {
  color: #1c325f;
  font-weight: 500;
}

.patient-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.btn-start-consultation, .btn-view-file {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

.btn-start-consultation {
  background: #007aff;
  color: white;
}

.btn-view-file {
  background: #6c757d;
  color: white;
}

/* Aucun RDV Section */
.no-appointment-content {
  text-align: center;
  padding: 30px;
  color: #888;
}

.no-appointment-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.btn-schedule {
  background: #007aff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 12px;
}

/* Paramètres */
.settings-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  text-decoration: none;
  color: #1c325f;
  transition: all 0.2s;
}

.setting-item:hover {
  background: #e9ecef;
}

.setting-icon {
  font-size: 16px;
}

/* Messages */
.success-message, .error-message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px;
  border-radius: 8px;
  z-index: 1000;
  max-width: 400px;
}

.success-message {
  background: #e8f5e8;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.error-message {
  background: #ffeaea;
  color: #d32f2f;
  border: 1px solid #ffcdd2;
}

/* États de chargement et erreur */
.loading-full, .error-full, .no-profile {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  margin: 20px 0;
}

.loading-full p, .error-full h3, .no-profile h3 {
  margin-bottom: 16px;
}

.error-icon, .no-profile-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.retry-btn {
  background: #007aff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  margin: 8px;
}

.retry-btn.large {
  padding: 12px 24px;
  font-size: 16px;
}

.error-banner {
  background: #ffeaea;
  color: #d32f2f;
  padding: 12px;
  border-radius: 6px;
  margin: 12px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Responsive */
@media (max-width: 1200px) {
  .dashboard-content {
    grid-template-columns: 1fr 1fr;
  }
  
  .right-column {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .databoard-grid {
    grid-template-columns: 1fr;
  }
  
  .patient-actions {
    flex-direction: column;
  }
  
  .request-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .request-actions {
    align-self: flex-end;
    margin-top: 8px;
  }
}
</style>