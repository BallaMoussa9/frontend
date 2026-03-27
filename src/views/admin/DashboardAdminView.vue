<template>
  <div class="admin-page-container">
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside :class="['sidebar', { 'open': isSidebarOpen }]">
        <div class="sidebar-header">
          <div class="logo-icon">S</div>
          <div class="logo-text">SanTeKo <span>Admin</span></div>
        </div>

        <nav class="menu">
          <RouterLink :to="{name:'AdminDashboard'}" class="menu-item active" @click="closeSidebar">
            <BarChart3 :size="20" class="menu-icon" /> Dashboard
          </RouterLink>
          
          <div class="menu-divider">Gestion & Outils</div>
          
          <RouterLink :to="{name:'Service'}" class="menu-item" @click="closeSidebar">
            <Activity :size="20" class="menu-icon" /> Gestion Services
          </RouterLink>
          <RouterLink :to="{name:'AddRole'}" class="menu-item" @click="closeSidebar">
            <Users :size="20" class="menu-icon" /> Rôles & Accès
          </RouterLink>
          <RouterLink :to="{name:'Statistique'}" class="menu-item" @click="closeSidebar">
            <TrendingUp :size="20" class="menu-icon" /> Statistiques
          </RouterLink>

          <div class="menu-divider">Communication</div>

          <RouterLink :to="{name:'Dialogue'}" class="menu-item" @click="closeSidebar">
            <MessageSquare :size="20" class="menu-icon" /> Conversations
          </RouterLink>
          <RouterLink :to="{name:'Notification'}" class="menu-item" @click="closeSidebar">
            <Clock :size="20" class="menu-icon" /> Notifications
          </RouterLink>

          <div class="menu-divider">Configuration</div>

          <RouterLink :to="{name:'Settings'}" class="menu-item" @click="closeSidebar">
            <FileText :size="20" class="menu-icon" /> Paramètres
          </RouterLink>
        </nav>
      </aside>

      <!-- Mobile Toggle -->
      <button class="mobile-toggle" @click="toggleSidebar">
        {{ isSidebarOpen ? '✕' : '☰' }}
      </button>

      <div v-if="isSidebarOpen" class="sidebar-overlay" @click="isSidebarOpen = false"></div>

      <!-- Main Content -->
      <main class="admin-main">
        <div class="dashboard-admin">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-content">
          <h1 class="dashboard-title">Tableau de Bord Administrateur</h1>
          <p class="dashboard-subtitle">Vue d'ensemble en temps réel de l'hôpital SanTeKo</p>
        </div>
        <button @click="refreshData" class="refresh-btn" :disabled="isRefreshing">
          <RefreshCw :size="18" :class="{ 'spinning': isRefreshing }" />
          {{ isRefreshing ? 'Actualisation...' : 'Actualiser' }}
        </button>
      </header>

      <!-- Stats Cards -->
      <section class="stats-section">
        <div class="section-header">
          <h2 class="section-title">Statistiques Principales</h2>
          <span class="live-indicator">● Live</span>
        </div>
        <div class="top-stats">
          <div class="stat-box patients" v-for="card in topStats" :key="card.label">
            <div class="stat-icon">
              <component :is="card.iconComponent" :size="24" />
            </div>
            <div class="stat-details">
              <h3 class="stat-value">{{ card.value }}</h3>
              <p class="stat-label">{{ card.label }}</p>
              <div class="stat-trend">
                <span class="trend-positive">+12%</span>
                <span class="trend-period">vs mois dernier</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Charts Section -->
      <section class="charts-section">
        <div class="chart-card large-chart">
          <div class="chart-header">
            <h4>Évolution des Patients</h4>
            <div class="chart-controls">
              <select v-model="chartPeriod" class="period-select">
                <option value="week">Semaine</option>
                <option value="month">Mois</option>
                <option value="year">Année</option>
              </select>
            </div>
          </div>
          <div class="chart-container">
            <Line :data="statusChartData" :options="chartOptions" />
          </div>
        </div>
      </section>

      <!-- Tables Section -->
      <section class="tables-section">
        <div class="bottom-section">
          <div class="table-section appointments">
            <div class="table-header">
              <h4><Calendar :size="18" /> Demandes de Rendez-vous</h4>
              <span class="badge-count">{{ pendingAppointments.length }}</span>
            </div>
            <div v-if="appointmentStore.loading" class="loading-state">
              <div class="loading-spinner"></div>
              <p>Chargement des demandes...</p>
            </div>
            <div v-else-if="pendingAppointments.length === 0" class="empty-state">
              <div class="empty-icon"></div>
              <h5>Aucune demande en attente</h5>
              <p>Toutes les demandes ont été traitées</p>
            </div>
            <div v-else class="appointment-list">
              <div v-for="req in pendingAppointments.slice(0, 5)" :key="req.id" class="appointment-item">
                <div class="appointment-avatar">
                  {{ getInitials(req.patient_name || 'Patient') }}
                </div>
                <div class="appointment-content">
                  <div class="appointment-name">{{ req.patient_name || 'Patient Inconnu' }}</div>
                  <div class="appointment-info">
                    <span class="phone"><MessageSquare :size="14" /> {{ req.phone || 'N/A' }}</span>
                    <span class="date"><Calendar :size="14" /> {{ formatDate(req.appointment_date) }}</span>
                  </div>
                </div>
                <div class="appointment-actions">
                  <button class="btn-accept">
                    <CheckCircle :size="16" />
                  </button>
                  <button class="btn-reject">
                    <XCircle :size="16" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="table-section patients">
            <div class="table-header">
              <h4><Users :size="18" /> Patients Récents</h4>
              <span class="badge-count">{{ recentPatientsList.length }}</span>
            </div>
            <div v-if="patientStore.loading" class="loading-state">
              <div class="loading-spinner"></div>
              <p>Chargement des patients...</p>
            </div>
            <div v-else-if="recentPatientsList.length === 0" class="empty-state">
              <div class="empty-icon">
                <UserCheck :size="48" />
              </div>
              <h5>Aucun patient récent</h5>
              <p>Aucun nouveau patient enregistré</p>
            </div>
            <div v-else class="patients-list">
              <div v-for="pat in recentPatientsList" :key="pat.id" class="patient-item">
                <div class="patient-avatar">
                  {{ getInitials(pat.first_name + ' ' + pat.last_name) }}
                </div>
                <div class="patient-content">
                  <div class="patient-name">{{ pat.first_name }} {{ pat.last_name }}</div>
                  <div class="patient-info">
                    <span class="hospital"><Activity :size="14" /> {{ pat.hospital_name || 'Hôpital Inconnu' }}</span>
                    <span class="date"><Calendar :size="14" /> {{ formatDate(pat.created_at) }}</span>
                  </div>
                </div>
                <div class="patient-status">
                  <span class="status-badge active">Actif</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import { useAuthStore } from '../../stores/authStores'
import { usePatientStore } from '@/stores/patientStore'
import { useUrgentistStore } from '@/stores/urgentistStore'
import { useNurseStore } from '@/stores/nurseStore'
import { useDoctorStore } from '@/stores/doctorStore'
import { useLabTechnicianStore } from '@/stores/labTechnicianStore'
import { useAppointmentPatientStore } from '@/stores/appointmentPatientStore' 

import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js'
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Activity, 
  MessageSquare, 
  RefreshCw,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  FileText,
  UserCheck,
  FlaskConical
} from 'lucide-vue-next'

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement)

const auth = useAuthStore()
const patientStore = usePatientStore()
const urgentistStore = useUrgentistStore()
const nurseStore = useNurseStore()
const doctorStore = useDoctorStore()
const labTechnicianStore = useLabTechnicianStore()
const appointmentStore = useAppointmentPatientStore()

// Variables réactives
const isRefreshing = ref(false)
const chartPeriod = ref('month')
const isSidebarOpen = ref(false)
const MAX_RECENT_PATIENTS = 5;

// Fonctions sidebar
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  if (window.innerWidth <= 1024) {
    isSidebarOpen.value = false
  }
}

// Fonctions utilitaires
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return dayjs(dateString).format('DD/MM/YYYY HH:mm')
}

const getInitials = (name) => {
  if (!name) return '??'
  return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)
}

const refreshData = async () => {
  isRefreshing.value = true
  try {
    await Promise.all([
      patientStore.allPatient(),
      urgentistStore.fetchAllUrgentists(),
      nurseStore.fetchAllNurses(),
      doctorStore.fetchAllDoctors(),
      labTechnicianStore.fetchAllLabTechnicians()
    ])
    
    if (auth.user?.role === 'admin' && auth.user.doctor_id) {
      await appointmentStore.fetchDoctorAppointments(auth.user.doctor_id)
    }
  } catch (error) {
    console.error('Erreur lors du rafraîchissement des données:', error)
  } finally {
    isRefreshing.value = false
  }
}

onMounted(() => {
  refreshData()
})

// Computed properties
const patientCount = computed(() => {
  const patients = patientStore.patients?.data || patientStore.patients || []
  return patientStore.loading ? '...' : patients.length
})

const totalDoctorsCount = computed(() => {
  const doctors = doctorStore.doctors?.data || doctorStore.doctors || []
  return doctorStore.loading ? '...' : doctors.length
})

const urgentistesActifsCount = computed(() => {
  const urgentists = urgentistStore.allUrgentists || []
  const count = urgentists.filter(u => u.status === 'available' || u.status === 'on_duty').length
  return urgentistStore.loading ? '...' : count
})

const totalNursesCount = computed(() => {
  const nurses = nurseStore.nurses?.data || nurseStore.nurses || []
  return nurseStore.loading ? '...' : nurses.length
})

const totalLabTechniciansCount = computed(() => {
  const labTechnicians = labTechnicianStore.labTechnicians?.data || labTechnicianStore.labTechnicians || []
  return labTechnicianStore.loading ? '...' : labTechnicians.length
})

const topStats = computed(() => [
  {
    label: 'Patients Total',
    value: patientStore.patients?.data?.length || patientStore.patients?.length || 0,
    iconComponent: Users,
    trend: '+12%',
    period: 'vs mois dernier'
  },
  {
    label: 'Médecins',
    value: doctorStore.doctors?.data?.length || doctorStore.doctors?.length || 0,
    iconComponent: Activity,
    trend: '+8%',
    period: 'vs mois dernier'
  },
  {
    label: 'Infirmiers',
    value: nurseStore.nurses?.data?.length || nurseStore.nurses?.length || 0,
    iconComponent: UserCheck,
    trend: '+15%',
    period: 'vs mois dernier'
  },
  {
    label: 'Urgentistes',
    value: urgentistStore.allUrgentists?.length || 0,
    iconComponent: Clock,
    trend: '+5%',
    period: 'vs mois dernier'
  },
  {
    label: 'Techniciens Labo',
    value: labTechnicianStore.labTechnicians?.data?.length || labTechnicianStore.labTechnicians?.length || 0,
    iconComponent: FlaskConical,
    trend: '+3%',
    period: 'vs mois dernier'
  }
])

const pendingAppointments = computed(() => {
  if (!appointmentStore.getAppointments) return []
  return appointmentStore.getAppointments
    .filter(app => app.status === 'pending' || app.status === 'en_attente')
    .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))
})

const recentPatientsList = computed(() => {
  const patients = patientStore.patients?.data || patientStore.patients || []
  return [...patients].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, MAX_RECENT_PATIENTS)
})

const statusChartData = computed(() => {
  const labels = chartPeriod.value === 'week' ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] :
                  chartPeriod.value === 'month' ? ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'] :
                  ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin']
  
  return {
    labels,
    datasets: [
      { 
        label: 'Guéris', 
        data: [120, 150, 170, 140, 190, 210].slice(0, labels.length), 
        borderColor: '#10b981', 
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4 
      },
      { 
        label: 'En traitement', 
        data: [60, 80, 75, 95, 110, 130].slice(0, labels.length), 
        borderColor: '#0040d0', 
        backgroundColor: 'rgba(0, 64, 208, 0.1)',
        tension: 0.4 
      }
    ]
  }
})

const chartOptions = { 
  responsive: true, 
  maintainAspectRatio: false, 
  plugins: { 
    legend: { 
      display: true,
      position: 'top'
    } 
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
}
</script>

<style scoped>
/* Variables CSS - Design Glassmorphism */
:root {
  --primary: #2563eb;
  --secondary: #10b981;
  --accent: #f59e0b;
  --danger: #ef4444;
  --dark: #1e293b;
  --light: #f1f5f9;
  --shadow-lg: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 30px 60px -12px rgba(0, 0, 0, 0.5);
  --radius: 16px;
}

/* Variables CSS - Design Glassmorphism Amélioré */
:root {
  --primary: #3b82f6;
  --primary-dark: #2563eb;
  --primary-light: #60a5fa;
  --secondary: #10b981;
  --secondary-dark: #059669;
  --accent: #8b5cf6;
  --accent-light: #a78bfa;
  --danger: #ef4444;
  --danger-light: #f87171;
  --warning: #f59e0b;
  --warning-light: #fbbf24;
  --success: #22c55e;
  --success-light: #4ade80;
  --info: #06b6d4;
  --info-light: #22d3ee;
  --dark: #0f172a;
  --darker: #020617;
  --light: #ffffff;
  --gray: #94a3b8;
  --gray-light: #cbd5e1;
  --gray-dark: #64748b;
  --border: rgba(255, 255, 255, 0.15);
  --shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 30px 60px -12px rgba(0, 0, 0, 0.5);
  --shadow-2xl: 0 40px 80px -12px rgba(0, 0, 0, 0.6);
  --radius: 16px;
  --radius-lg: 20px;
  --radius-xl: 24px;
}

/* Layout Container */
.admin-page-container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  overflow: hidden;
  position: relative;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
}

.admin-layout {
  display: flex;
  height: 100%;
  position: relative;
}

/* Animation de fond améliorée (identique au DoctorDashboard) */
.admin-page-container::before {
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

.admin-layout > * {
  position: relative;
  z-index: 1;
}

/* === Sidebar (style MedecinLayout exact) === */
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  color: white;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  flex-shrink: 0;
}

.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(37, 99, 235, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.sidebar-header {
  padding: 2rem 1.5rem;
  font-size: 1.8rem;
  font-weight: 900;
  background: linear-gradient(135deg, #2563eb, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  position: relative;
  z-index: 2;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.logo-icon {
  font-size: 1.8rem;
  font-weight: 900;
  background: linear-gradient(135deg, #2563eb, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2563eb, #10b981);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.logo-text {
  font-size: 1.8rem;
  font-weight: 900;
  background: linear-gradient(135deg, #2563eb, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-text span {
  background: linear-gradient(135deg, #2563eb, #10b981);
  color: white;
  font-size: 0.6rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
  margin-left: 8px;
}

.menu {
  flex: 1;
  padding: 1.5rem 1rem;
  position: relative;
  z-index: 2;
  overflow-y: auto;
}

.menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  color: rgba(255, 255, 255, 0.7);
  padding: 14px 18px;
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-weight: 600;
  position: relative;
  overflow: hidden;
}

.menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.2), transparent);
  transition: left 0.5s ease;
}

.menu-item:hover::before {
  left: 100%;
}

.menu-item:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

.menu-item.active {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.3), rgba(16, 185, 129, 0.2));
  color: white;
  transform: translateX(5px);
}

.menu-item.active .menu-icon {
  color: #3b82f6;
}

.menu-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: inherit;
  transition: all 0.3s ease;
}

.menu-divider {
  padding: 0.5rem 1.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 1rem 0;
}

/* Mobile Toggle (style MedecinLayout exact) */
.mobile-toggle {
  display: none;
  position: fixed;
  top: 15px;
  right: 15px;
  z-index: 1100;
  background: #0f1e46;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-toggle:hover {
  background: #1e2b5c;
  transform: translateY(-2px);
}

/* Main Content (style MedecinLayout exact) */
.admin-main {
  flex: 1;
  height: 100vh;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
}

.dashboard-admin {
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

/* Sidebar Overlay (style MedecinLayout exact) */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
  display: none;
}

@media (max-width: 1024px) {
  .sidebar-overlay {
    display: block;
  }
}

/* Animation de fond */
.dashboard-admin::before {
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

.dashboard-admin > * {
  position: relative;
  z-index: 1;
}

/* === Header (style DemandeAnalyse) === */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.6s ease-out;
  transition: all 0.3s ease;
}

.dashboard-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2563eb, #10b981);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
  z-index: 1;
}

.dashboard-header:hover::before {
  transform: scaleX(1);
}

.dashboard-header:hover {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(16, 185, 129, 0.1));
  border-color: rgba(37, 99, 235, 0.3);
  transform: translateY(-2px);
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

.header-content {
  flex: 1;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-icon {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  padding: 12px;
  border-radius: 14px;
  box-shadow: var(--shadow-lg);
  animation: pulse 2s infinite;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.dashboard-subtitle {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 1rem;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.refresh-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* === Sections === */
.stats-section, .charts-section, .tables-section {
  margin-bottom: 2.5rem;
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
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.live-indicator {
  color: var(--secondary);
  font-weight: 600;
  font-size: 14px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

/* === Stats Cards (style DemandeAnalyse) === */
.top-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-box {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
}

.stat-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2563eb, #10b981);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
  z-index: 1;
}

.stat-box:hover::before {
  transform: scaleX(1);
}

.stat-box:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(16, 185, 129, 0.15));
  border-color: rgba(37, 99, 235, 0.4);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  font-size: 1.5rem;
  animation: pulse 2s infinite;
  flex-shrink: 0;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.stat-details {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 900;
  color: white;
  margin: 0 0 4px 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--light);
  margin: 0 0 12px 0;
  font-weight: 500;
  opacity: 0.9;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trend-positive {
  background: rgba(16, 185, 129, 0.2);
  color: var(--secondary);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.trend-period {
  font-size: 11px;
  color: var(--light);
  opacity: 0.7;
}

/* === Chart Section (style DemandeAnalyse) === */
.charts-section {
  margin-bottom: 2.5rem;
}

.chart-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.chart-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2563eb, #10b981);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
  z-index: 1;
}

.chart-card:hover::before {
  transform: scaleX(1);
}

.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(16, 185, 129, 0.15));
  border-color: rgba(37, 99, 235, 0.4);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-header h4 {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.period-select {
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.period-select:hover {
  background: rgba(255, 255, 255, 0.1);
}

.chart-container {
  height: 350px;
  position: relative;
}

/* === Tables Section (style DemandeAnalyse) === */
.tables-section {
  margin-bottom: 2.5rem;
}

.bottom-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.table-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.table-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2563eb, #10b981);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
  z-index: 1;
}

.table-section:hover::before {
  transform: scaleX(1);
}

.table-section:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(16, 185, 129, 0.15));
  border-color: rgba(37, 99, 235, 0.4);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.table-header h4 {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.badge-count {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

/* === Loading and Empty States === */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--light);
  opacity: 0.8;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: var(--light);
  opacity: 0.8;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.empty-state h5 {
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
}

.empty-state p {
  color: var(--light);
  font-size: 0.9rem;
  margin: 0;
  opacity: 0.8;
}

/* === Lists (style DemandeAnalyse) === */
.appointment-list, .patients-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.appointment-item, .patient-item {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.appointment-item:hover, .patient-item:hover {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(16, 185, 129, 0.1));
  border-color: rgba(37, 99, 235, 0.3);
  transform: translateY(-2px);
}

.appointment-avatar, .patient-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.patient-avatar {
  background: linear-gradient(135deg, var(--secondary), var(--primary));
}

.appointment-content, .patient-content {
  flex: 1;
}

.appointment-name, .patient-name {
  font-weight: 500;
  color: white;
  margin-bottom: 0.25rem;
}

.appointment-info, .patient-info {
  display: flex;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.appointment-actions, .patient-status {
  flex-shrink: 0;
}

/* Action Buttons (style DemandeAnalyse) */
.btn-accept, .btn-reject {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
  font-size: 12px;
  font-weight: 600;
}

.btn-accept {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.3);
  color: #86efac;
}

.btn-accept:hover {
  background: rgba(16, 185, 129, 0.3);
  transform: translateY(-2px);
}

.btn-reject {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.btn-reject:hover {
  background: rgba(239, 68, 68, 0.3);
  transform: translateY(-2px);
}

/* Status Badges (style DemandeAnalyse) */
.status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: rgba(16, 185, 129, 0.2);
  color: #86efac;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

/* === Responsive Design (style MedecinLayout exact) === */
@media (max-width: 1024px) {
  .mobile-toggle { 
    display: flex; 
    align-items: center; 
    justify-content: center; 
  }
  .sidebar {
    position: fixed;
    transform: translateX(-100%);
    height: 100vh;
  }
  .sidebar.open { 
    transform: translateX(0); 
  }
  .sidebar-overlay { 
    position: fixed; 
    inset: 0; 
    background: rgba(0,0,0,0.5); 
    z-index: 999; 
  }
  .dashboard-admin { 
    padding: 20px; 
    padding-top: 70px; 
  }
  
  .bottom-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-admin {
    padding: 1rem;
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .dashboard-title {
    font-size: 1.8rem;
  }
  
  .refresh-btn {
    width: 100%;
    justify-content: center;
  }
  
  .top-stats {
    grid-template-columns: 1fr;
  }
  
  .stat-box {
    padding: 1.5rem;
  }
  
  .chart-card {
    padding: 1.5rem;
  }
  
  .chart-container {
    height: 250px;
  }
  
  .table-section {
    padding: 1.5rem;
  }
  
  .appointment-item, .patient-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .appointment-actions, .patient-status {
    align-self: flex-end;
  }
  
  .appointment-info, .patient-info {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* Animations supplémentaires */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinning {
  animation: spin 1s linear infinite;
}

/* Animations pour les icônes dans les stats */
.stat-icon svg {
  transition: all 0.3s ease;
}

.stat-box:hover .stat-icon svg {
  transform: scale(1.1) rotate(5deg);
  filter: drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3));
}

/* Animations pour les boutons d'action */
.btn-accept svg, .btn-reject svg {
  transition: all 0.3s ease;
}

.btn-accept:hover svg {
  transform: scale(1.1);
  filter: drop-shadow(0 4px 8px rgba(34, 197, 94, 0.3));
}

.btn-reject:hover svg {
  transform: scale(1.1);
  filter: drop-shadow(0 4px 8px rgba(239, 68, 68, 0.3));
}

/* Animations pour les icônes dans les headers */
.table-header h4 svg,
.dashboard-title .title-icon svg {
  transition: all 0.3s ease;
}

.table-header:hover h4 svg {
  transform: scale(1.1);
  color: var(--primary-light);
}

/* Animations pour les icônes d'info */
.appointment-info svg,
.patient-info svg {
  transition: all 0.2s ease;
}

.appointment-item:hover .appointment-info svg,
.patient-item:hover .patient-info svg {
  transform: scale(1.1);
  color: var(--primary-light);
}
</style>