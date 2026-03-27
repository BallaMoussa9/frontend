<template>
  <MedecinLayout>
    <div v-if="loading || userStore.loading" class="state-container loading-state">
      <div class="spinner-container">
        <div class="spinner"></div>
      </div>
      <h3>Préparation de votre espace médical</h3>
      <p style="color: white;">Chargement de vos données professionnelles...</p>
    </div>

    <div v-else-if="userStore.error" class="state-container error-state">
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
            <Activity :size="32" class="title-icon" />
            Tableau de Bord Médical
          </h1>
          <p class="page-subtitle">Vue d'ensemble de votre activité et consultations</p>
        </div>
        <div class="header-actions">
          <button class="action-btn primary" @click="printDashboard">
            <Download :size="18" />
            Exporter en PDF
          </button>
          <button class="action-btn secondary" @click="printDashboard">
            <Printer :size="18" />
            Imprimer
          </button>
        </div>
      </div>

      <div class="dashboard-grid">
        <section class="card profile-card">
          <div class="card-header">
            <div class="card-icon">
              <Stethoscope :size="24" />
            </div>
            <h2 class="card-title">Profil Professionnel</h2>
          </div>
          <div class="card-content">
            <div class="profile-grid">
              <div class="profile-item">
                <div class="profile-label"><User :size="16" /> Nom complet</div>
                <div class="profile-value">Dr. {{ userStore.currentDoctorProfile.user?.first_name }} {{ userStore.currentDoctorProfile.user?.last_name }}</div>
              </div>

              <div class="profile-item">
                <div class="profile-label"><Shield :size="16" /> Spécialité</div>
                <div class="profile-value">
                  <span class="value-badge">{{ userStore.currentDoctorProfile.speciality || 'Médecin Généraliste' }}</span>
                </div>
              </div>

              <div class="profile-item">
                <div class="profile-label"><Calendar :size="16" /> Expérience</div>
                <div class="profile-value">{{ calculateExperience() }} ans</div>
              </div>

              <div class="profile-item">
                <div class="profile-label"><Users :size="16" /> Patients suivis</div>
                <div class="profile-value">
                  <span class="value-badge">{{ doctorStore.patients?.length || 0 }}</span>
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
            <h2 class="card-title">Statistiques du Jour</h2>
          </div>
          <div class="card-content">
            <div class="vitals-grid">
              <div class="vital-item">
                <div class="vital-icon"><Calendar :size="20" /></div>
                <div class="vital-info">
                  <div class="vital-label">Rendez-vous aujourd'hui</div>
                  <div class="vital-value">{{ stats.appointmentsToday || 0 }}</div>
                </div>
              </div>

              <div class="vital-item">
                <div class="vital-icon heart"><Heart :size="20" /></div>
                <div class="vital-info">
                  <div class="vital-label">Consultations terminées</div>
                  <div class="vital-value">{{ stats.completedConsultations || 0 }}</div>
                </div>
              </div>

              <div class="vital-item">
                <div class="vital-icon temp"><Phone :size="20" /></div>
                <div class="vital-info">
                  <div class="vital-label">Téléconsultations</div>
                  <div class="vital-value">{{ stats.teleconsultations || 0 }}</div>
                </div>
              </div>
            </div>

            <div class="vitals-footer">
              <Clock :size="16" /> Dernière mise à jour: {{ formatDate(new Date()) }}
            </div>
          </div>
        </section>

        <section class="card meds-card">
          <div class="card-header">
            <div class="card-icon">
              <FileText :size="24" />
            </div>
            <h2 class="card-title">Prochains Rendez-vous</h2>
            <span class="meds-count">{{ todayAppointments.length }}</span>
          </div>
          <div class="card-content">
            <div v-if="todayAppointments.length" class="meds-list">
              <div v-for="(appointment, index) in todayAppointments.slice(0, 4)" :key="index" class="med-item">
                <div class="med-icon"><Calendar :size="20" /></div>
                <div class="med-details">
                  <div class="med-name">{{ appointment.patient?.user?.first_name }} {{ appointment.patient?.user?.last_name }}</div>
                  <div class="med-specs">
                    <span class="dosage">{{ formatAppointmentTime(appointment.appointment_time) }}</span>
                    <span class="frequency">{{ getAppointmentTypeLabel(appointment.type) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="empty-state">
              <div class="empty-icon"><Calendar :size="32" /></div>
              <h4>Aucun rendez-vous aujourd'hui</h4>
              <p>Vos consultations apparaîtront ici</p>
            </div>

            <div v-if="todayAppointments.length > 4" class="meds-footer">
              <span class="more-meds">+{{ todayAppointments.length - 4 }} autres rendez-vous</span>
              <button class="view-all-btn" @click="goToAppointments">Voir tout <ChevronRight :size="16" /></button>
            </div>
          </div>
        </section>
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
import {
  Activity, User, Calendar, Users, FileText, Heart,
  Thermometer, Droplets, Pill, Clock, AlertCircle, UserX,
  Printer, Download, ChevronRight, Shield, Stethoscope, Phone
} from 'lucide-vue-next'

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

// Fonctions utilitaires
const calculateExperience = () => {
  if (!userStore.currentDoctorProfile?.user?.created_at) return 'N/A'
  const startDate = new Date(userStore.currentDoctorProfile.user.created_at)
  const currentDate = new Date()
  const years = Math.floor((currentDate - startDate) / (365.25 * 24 * 60 * 60 * 1000))
  return years
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// FONCTION IMPRIMER (Sert aussi pour l'export PDF via le navigateur)
const printDashboard = () => {
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
};

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

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  animation: fadeInUp 0.8s ease-out 0.3s both;
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

/* Profile Card Styles */
.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.profile-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border-left: 3px solid var(--primary);
  transition: all 0.3s ease;
}

.profile-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(5px);
}

.profile-item.full-width {
  grid-column: span 2;
}

.profile-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray);
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.profile-value {
  color: white;
  font-weight: 700;
  font-size: 1rem;
}

.value-badge {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-block;
}

/* Vitals Card Styles */
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

.vitals-footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--gray);
  font-size: 0.85rem;
}

/* Medications Card Styles */
.meds-count {
  background: linear-gradient(135deg, var(--accent), var(--secondary));
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  margin-left: auto;
}

.meds-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.med-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border-left: 3px solid var(--accent);
  transition: all 0.3s ease;
}

.med-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(5px);
}

.med-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--accent), var(--primary));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 6px 15px rgba(139, 92, 246, 0.3);
}

.med-details {
  flex: 1;
}

.med-name {
  color: white;
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 0.3rem;
}

.med-specs {
  display: flex;
  gap: 1rem;
}

.dosage, .frequency {
  color: var(--gray);
  font-size: 0.85rem;
  font-weight: 600;
}

.meds-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.more-meds {
  color: var(--gray);
  font-size: 0.85rem;
  font-weight: 600;
}

.view-all-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.view-all-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
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
  
  .profile-grid {
    grid-template-columns: 1fr;
  }
  
  .profile-item.full-width {
    grid-column: span 1;
  }
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