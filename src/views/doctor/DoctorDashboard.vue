<template>
  <MedecinLayout>
    <div class="dashboard-page">
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
          </div>
        </div>
        
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
              <div class="stat-label">RDV Aujourd'hui</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.completedConsultations || 0 }}</div>
              <div class="stat-label">Terminées</div>
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

      <div v-if="userStore.loading" class="loading-full">
        <p>Chargement du tableau de bord...</p>
      </div>

      <div v-else-if="userStore.currentDoctorProfile" class="dashboard-content">
        <div class="grid-col">
          <div class="section">
            <div class="section-header">
              <h3 class="section-title">Rendez-vous Aujourd'hui</h3>
              <button @click="refreshAppointments" class="btn-refresh">🔄</button>
            </div>
            
            <div v-if="todayAppointments.length === 0" class="empty-state">Aucun RDV</div>
            <div v-else class="appointment-slots">
              <div v-for="appointment in todayAppointments" :key="appointment.id" class="appointment-slot" @click="viewAppointmentDetails(appointment)">
                <div class="slot-info">
                  <div class="patient-name">{{ appointment.patient?.user?.first_name }} {{ appointment.patient?.user?.last_name }}</div>
                  <div class="slot-time">⏰ {{ formatAppointmentTime(appointment.appointment_time) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid-col">
          <div class="section">
            <h3 class="section-title">Prochain Rendez-vous</h3>
            <div v-if="nextAppointment" class="patient-details">
              <div class="patient-name-large">{{ nextAppointment.patient?.user?.first_name }} {{ nextAppointment.patient?.user?.last_name }}</div>
              <button @click="startConsultationForAppointment(nextAppointment)" class="btn-start">Démarrer</button>
            </div>
            <div v-else class="empty-state">Rien de prévu</div>
          </div>
        </div>

        <div class="grid-col">
          <div class="section">
            <h3 class="section-title">Actions Rapides</h3>
            <div class="quick-actions">
              <button @click="startNewConsultation" class="quick-btn">🩺 Nouvelle Consultation</button>
              <button @click="goToPrescriptions" class="quick-btn">📝 Ordonnance</button>
            </div>
          </div>
        </div>
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
/* 1. Reset pour éviter les bandes blanches */
.dashboard-page {
  padding: 20px;
  background: #f8fafc;
  min-height: 100%; /* Important */
  width: 100%;
}

/* 2. Header adaptatif */
.dashboard-header {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

/* 3. Stats Grid : Responsive (4 col -> 2 col -> 1 col) */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

@media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .stats-grid { grid-template-columns: 1fr; } }

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: #f1f5f9;
  border-radius: 10px;
  border-left: 4px solid #007aff;
}

/* 4. Dashboard Content Grid : Responsive (3 col -> 1 col) */
.dashboard-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 1024px) { 
  .dashboard-content { grid-template-columns: 1fr; } 
}

.section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  height: 100%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

/* 5. Éléments UI */
.appointment-slot {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  border-left: 3px solid #007aff;
}

.quick-btn {
  width: 100%;
  padding: 12px;
  margin-bottom: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  text-align: left;
  cursor: pointer;
}

.quick-btn:hover { background: #f1f5f9; }

.btn-start {
  background: #007aff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  width: 100%;
  margin-top: 15px;
}
</style>