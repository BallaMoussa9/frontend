<template>
  <div class="admin-page-container">
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside :class="['sidebar', { 'open': isSidebarOpen }]">
        <div class="sidebar-header">
          <div class="logo-icon">N</div>
          <div class="logo-text">SanTeKo <span>Infirmier</span></div>
        </div>

        <nav class="menu">
          <RouterLink :to="{name:'NurseDashboard'}" class="menu-item active" @click="closeSidebar">
            <BarChart3 :size="20" class="menu-icon" /> Dashboard
          </RouterLink>
          
          <div class="menu-divider">Gestion des Patients</div>
          
          <RouterLink :to="{name:'PatientList', params: { id: nurseId }}" class="menu-item" @click="closeSidebar">
            <Users :size="20" class="menu-icon" /> Patients
          </RouterLink>
          <RouterLink :to="{name:'VitalSignsForm', params: { id: nurseId }}" class="menu-item" @click="closeSidebar">
            <Activity :size="20" class="menu-icon" /> Signes Vitaux
          </RouterLink>
          <RouterLink :to="{name:'ActivityReport', params: { id: nurseId }}" class="menu-item" @click="closeSidebar">
            <ClipboardList :size="20" class="menu-icon" /> Rapports d'Activité
          </RouterLink>

          <div class="menu-divider">Communication</div>

          <RouterLink :to="{name:'NurseProfile', params: { id: nurseId }}" class="menu-item" @click="closeSidebar">
            <User :size="20" class="menu-icon" /> Mon Profil
          </RouterLink>
          <RouterLink :to="{name:'NoticeBoard', params: { id: nurseId }}" class="menu-item" @click="closeSidebar">
            <Bell :size="20" class="menu-icon" /> Messagerie
          </RouterLink>
          <RouterLink :to="{name:'CareNotes', params: { id: nurseId }}" class="menu-item" @click="closeSidebar">
            <FileText :size="20" class="menu-icon" /> Notes de Soin
          </RouterLink>

          <div class="menu-divider">Système</div>

          <button @click="handleLogout" class="menu-item logout-btn">
            <LogOut :size="20" class="menu-icon" /> Déconnexion
          </button>
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
              <h1 class="dashboard-title">Tableau de Bord Infirmier</h1>
              <p class="dashboard-subtitle">Vue d'ensemble des activités du shift - {{ nurseName }}</p>
            </div>
            <button @click="loadDashboardData" class="refresh-btn" :disabled="loading">
              <RefreshCw :size="18" :class="{ 'spinning': loading }" />
              {{ loading ? 'Actualisation...' : 'Actualiser' }}
            </button>
          </header>

          <!-- Messages Feedback -->
          <TransitionGroup name="fade">
            <div v-if="loading" key="loading" class="feedback-message loading-message">
              <RefreshCw :size="20" class="spinning" />
              <span>Chargement des données...</span>
            </div>
            <div v-if="error" key="error" class="feedback-message error-message">
              <XCircle :size="20" />
              <span>{{ error }}</span>
            </div>
            <div v-if="success" key="success" class="feedback-message success-message">
              <CheckCircle :size="20" />
              <span>{{ success }}</span>
            </div>
          </TransitionGroup>

          <!-- Stats Cards -->
          <section class="stats-section">
            <div class="section-header">
              <h2 class="section-title">Statistiques du Shift</h2>
              <span class="live-indicator">● Live</span>
            </div>
            <div class="top-stats">
              <div class="stat-box patients" v-for="card in statCards" :key="card.title">
                <div class="stat-icon">
                  <component :is="card.icon" :size="24" />
                </div>
                <div class="stat-details">
                  <h3 class="stat-value">{{ loading ? '--' : card.value }}</h3>
                  <p class="stat-label">{{ card.title }}</p>
                  <p class="stat-desc">{{ card.desc }}</p>
                  <div class="stat-trend">
                    <span class="trend-positive">+12%</span>
                    <span class="trend-period">vs shift précédent</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Tables Section -->
          <section class="tables-section">
            <div class="bottom-section">
              <div class="table-section appointments">
                <div class="table-header">
                  <h4><Bell :size="18" /> Notifications Urgentes</h4>
                  <span class="badge-count">{{ notifications.length }}</span>
                </div>
                <div v-if="loading" class="loading-state">
                  <div class="loading-spinner"></div>
                  <p>Chargement des notifications...</p>
                </div>
                <div v-else-if="notifications.length === 0" class="empty-state">
                  <div class="empty-icon">
                    <CheckCircle :size="48" />
                  </div>
                  <h5>Aucune notification urgente</h5>
                  <p>Tout est en ordre pour le moment</p>
                </div>
                <div v-else class="appointment-list">
                  <div v-for="(notif, index) in notifications" :key="index" class="appointment-item">
                    <div class="appointment-avatar">
                      <Bell :size="20" />
                    </div>
                    <div class="appointment-content">
                      <div class="appointment-name">{{ notif.label }}</div>
                      <div class="appointment-info">
                        <span class="phone"><MessageSquare :size="14" /> {{ notif.message }}</span>
                        <span class="date"><Clock :size="14" /> {{ notif.time }}</span>
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
                  <h4><Activity :size="18" /> État du Service</h4>
                  <span class="badge-count">2</span>
                </div>
                <div class="patients-list">
                  <div class="patient-item">
                    <div class="patient-avatar">
                      <CheckCircle :size="20" />
                    </div>
                    <div class="patient-content">
                      <div class="patient-name">Relève effectuée</div>
                      <div class="patient-info">
                        <span class="hospital"><CheckCircle :size="14" /> Status: Complété</span>
                        <span class="date"><Clock :size="14" /> Il y a 30 min</span>
                      </div>
                    </div>
                    <div class="patient-status">
                      <span class="status-badge success">OK</span>
                    </div>
                  </div>
                  <div class="patient-item">
                    <div class="patient-avatar">
                      <User :size="20" />
                    </div>
                    <div class="patient-content">
                      <div class="patient-name">Urgentiste de garde</div>
                      <div class="patient-info">
                        <span class="hospital"><User :size="14" /> Dr. Martin</span>
                        <span class="date"><Clock :size="14" /> En service</span>
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
import { ref, onMounted, computed, TransitionGroup } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStores'
import { usePatientStore } from '@/stores/patientStore'
import { useUrgentistStore } from '@/stores/urgentistStore'
import { 
  Users, AlertCircle, Thermometer, ClipboardList, 
  Droplets, RefreshCw, Bell, CheckCircle, Activity,
  XCircle, User, BarChart3, MessageSquare, Clock,
  FileText, LogOut
} from 'lucide-vue-next'

const authStore = useAuthStore()
const patientStore = usePatientStore()
const urgentistStore = useUrgentistStore()

const router = useRouter()
const loading = ref(true)
const error = ref(null)
const success = ref(null)
const isSidebarOpen = ref(false)
const nurseName = computed(() => authStore.user?.first_name || 'Infirmier.ère')
const nurseId = computed(() => authStore.user?.id || '1')

// Sidebar functions
function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
    isSidebarOpen.value = false
}

// Logout function
async function handleLogout() {
    try {
        closeSidebar() // Fermer la sidebar avant la déconnexion
        await authStore.logout()
        router.push({ name: 'Login' })
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
    }
}

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
/* Variables CSS - Design Admin */
:root {
  --primary: #2563eb;
  --primary-dark: #1d4ed8;
  --primary-light: #3b82f6;
  --secondary: #10b981;
  --secondary-dark: #059669;
  --secondary-light: #34d399;
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

/* === Layout Principal === */
.admin-page-container {
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  color: white;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

/* Animation de fond */
.admin-page-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 50%, rgba(37, 99, 235, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
  animation: floatingGradient 20s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes floatingGradient {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(-20px, -20px) rotate(120deg); }
  66% { transform: translate(20px, -10px) rotate(240deg); }
}

.admin-page-container > * {
  position: relative;
  z-index: 1;
}

.admin-layout {
  display: flex;
  height: 100vh;
  width: 100%;
}

/* === Sidebar (style UrgentisteLayout exact) === */
.sidebar {
  width: 280px;
  min-width: 280px;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
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
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 2;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
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
  font-size: 1.2rem;
  font-weight: 800;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.logo-text span {
  color: #10b981;
}

.menu {
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
  position: relative;
  z-index: 2;
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

.menu-item:hover .menu-icon {
  transform: scale(1.1);
}

.menu-divider {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 12px 18px 8px;
  margin-top: 8px;
}

.logout-btn {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.05));
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #f87171;
  margin-top: 1rem;
}

.logout-btn:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(245, 158, 11, 0.1));
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.logout-btn .menu-icon {
  color: inherit;
}

/* === Mobile Toggle === */
.mobile-toggle {
  display: none;
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1001;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-toggle:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.05);
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
  display: none;
}

@media (max-width: 1024px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
  
  .sidebar-overlay {
    display: block;
  }
  
  .mobile-toggle {
    display: flex;
  }
}

/* === Main Content === */
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: transparent;
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

.refresh-btn .spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.stat-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
  flex-shrink: 0;
}

.stat-details {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: white;
  margin: 0 0 0.25rem 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.stat-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.trend-positive {
  color: var(--secondary);
  font-weight: 600;
}

.trend-period {
  color: rgba(255, 255, 255, 0.6);
}

/* === Tables Section === */
.bottom-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.table-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.table-section:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.table-header h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge-count {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* === Loading States === */
.loading-state {
  text-align: center;
  padding: 3rem 1rem;
  color: rgba(255, 255, 255, 0.6);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

/* === Empty States === */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: rgba(255, 255, 255, 0.6);
}

.empty-icon {
  margin-bottom: 1rem;
  color: var(--secondary);
  opacity: 0.7;
}

.empty-state h5 {
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

/* === Lists === */
.appointment-list, .patients-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.appointment-item, .patient-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.appointment-item:hover, .patient-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(4px);
}

.appointment-avatar, .patient-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  flex-shrink: 0;
}

.appointment-content, .patient-content {
  flex: 1;
}

.appointment-name, .patient-name {
  font-weight: 600;
  color: white;
  margin-bottom: 0.25rem;
}

.appointment-info, .patient-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

.appointment-info span, .patient-info span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.appointment-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-accept, .btn-reject {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-accept {
  background: rgba(34, 197, 94, 0.2);
  color: var(--success);
}

.btn-accept:hover {
  background: rgba(34, 197, 94, 0.3);
  transform: scale(1.1);
}

.btn-reject {
  background: rgba(239, 68, 68, 0.2);
  color: var(--danger);
}

.btn-reject:hover {
  background: rgba(239, 68, 68, 0.3);
  transform: scale(1.1);
}

.patient-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background: rgba(37, 99, 235, 0.2);
  color: var(--primary);
}

.status-badge.success {
  background: rgba(34, 197, 94, 0.2);
  color: var(--success);
}

/* === Feedback Messages === */
.feedback-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  font-weight: 500;
  animation: slideDown 0.3s ease-out;
}

.loading-message {
  background: rgba(37, 99, 235, 0.1);
  border: 1px solid rgba(37, 99, 235, 0.2);
  color: var(--primary);
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: var(--danger);
}

.success-message {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  color: var(--success);
}

/* === Mobile === */
@media (max-width: 1024px) {
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
  
  .top-stats {
    grid-template-columns: 1fr;
  }
  
  .table-section {
    padding: 1rem;
  }
  
  .appointment-item, .patient-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .appointment-actions {
    align-self: flex-end;
  }
}
</style>