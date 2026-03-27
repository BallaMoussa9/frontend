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
          <RouterLink :to="{name:'NurseDashboard', params: { id: nurseId }}" class="menu-item" @click="closeSidebar">
            <BarChart3 :size="20" class="menu-icon" /> Dashboard
          </RouterLink>
          
          <div class="menu-divider">Gestion des Patients</div>
          
          <RouterLink :to="{name:'PatientList', params: { id: nurseId }}" class="menu-item" @click="closeSidebar">
            <Users :size="20" class="menu-icon" /> Patients
          </RouterLink>
          <RouterLink :to="{name:'VitalSignsForm', params: { id: nurseId }}" class="menu-item" @click="closeSidebar">
            <Activity :size="20" class="menu-icon" /> Signes Vitaux
          </RouterLink>
          <RouterLink :to="{name:'ActivityReport', params: { id: nurseId }}" class="menu-item active" @click="closeSidebar">
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
              <h1 class="dashboard-title">Rapports d'Activité</h1>
              <p class="dashboard-subtitle">Enregistrement et suivi des activités soignantes</p>
            </div>
            <button @click="refreshReports" class="refresh-btn">
              <RefreshCw :size="18" />
              Actualiser
            </button>
          </header>

          <!-- Messages Feedback -->
          <TransitionGroup name="fade">
            <div v-if="loading" key="loading" class="feedback-message loading-message">
              <RefreshCw :size="20" class="spinning" />
              <span>Chargement...</span>
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

          <!-- New Report Section -->
          <section class="report-form-section">
            <div class="section-header">
              <h2 class="section-title"><FileText :size="20" /> Nouveau Rapport d'Activité</h2>
              <button @click="toggleForm" class="toggle-btn">
                <ChevronDown :size="20" :class="{ 'rotated': !isFormCollapsed }" />
              </button>
            </div>
            
            <div v-show="!isFormCollapsed" class="report-form-card">
              <form @submit.prevent="submitReport" class="report-form">
                <div class="form-grid">
                  <div class="form-group">
                    <label for="patient" class="form-label">Patient concerné <span class="required">*</span></label>
                    <select
                      id="patient"
                      v-model="form.patient_id"
                      class="form-input"
                      required
                      :disabled="localFormLoading || !patientsListForForm.length"
                    >
                      <option value="" disabled>
                        {{ patientsListForForm.length > 0 ? 'Sélectionner un patient' : 'Aucun patient disponible' }}
                      </option>
                      <option v-for="p in patientsListForForm" :key="p.id" :value="p.id">
                        {{ getPatientFullName(p) }}
                      </option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="report_date" class="form-label">Date et heure <span class="required">*</span></label>
                    <div class="input-wrapper">
                      <Clock :size="20" class="input-icon" />
                      <input
                        type="datetime-local"
                        id="report_date"
                        v-model="form.report_date"
                        class="form-input"
                        required
                        :disabled="localFormLoading"
                      />
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label for="title" class="form-label">Titre du rapport <span class="required">*</span></label>
                  <div class="input-wrapper">
                    <FileText :size="20" class="input-icon" />
                    <input
                      type="text"
                      id="title"
                      v-model="form.title"
                      class="form-input"
                      placeholder="Ex: Soins quotidiens, Administration médicamenteuse..."
                      required
                      :disabled="localFormLoading"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label for="content" class="form-label">Description de l'acte <span class="required">*</span></label>
                  <div class="textarea-wrapper">
                    <FileText :size="20" class="input-icon" />
                    <textarea
                      id="content"
                      v-model="form.content"
                      class="form-textarea"
                      rows="4"
                      placeholder="Décrire en détail l'intervention réalisée, les observations, les réactions du patient..."
                      required
                      :disabled="localFormLoading"
                    ></textarea>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="submit" :disabled="localFormLoading" class="submit-btn">
                    <Save :size="20" />
                    {{ localFormLoading ? 'Enregistrement...' : 'Enregistrer le Rapport' }}
                  </button>
                </div>
              </form>
            </div>
          </section>

          <!-- Reports List Section -->
          <section class="reports-list-section">
            <div class="section-header">
              <h2 class="section-title"><ClipboardList :size="20" /> Historique des Rapports</h2>
              <span class="reports-count">{{ reports.length }} rapport(s)</span>
            </div>
            
            <div v-if="reports.length > 0" class="reports-list">
              <div v-for="report in reports" :key="report.id" class="report-card">
                <div class="report-header">
                  <div class="report-title">
                    <h3>{{ report.title }}</h3>
                    <span class="report-date">{{ formatDate(report.report_date) }}</span>
                  </div>
                  <div class="report-actions">
                    <button @click="editReport(report)" class="action-btn edit-btn">
                      <Edit :size="16" />
                    </button>
                    <button @click="deleteReport(report.id)" class="action-btn delete-btn">
                      <Trash2 :size="16" />
                    </button>
                  </div>
                </div>
                
                <div class="report-content">
                  <p>{{ report.content }}</p>
                </div>
                
                <div class="report-footer">
                  <div class="patient-info">
                    <User :size="16" />
                    <span>{{ getPatientFullName(report.patient) }}</span>
                  </div>
                  <div class="author-info">
                    <span>Par: {{ report.nurse?.user?.first_name }} {{ report.nurse?.user?.last_name }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="empty-state">
              <div class="empty-icon">
                <ClipboardList :size="48" />
              </div>
              <h5>Aucun rapport d'activité</h5>
              <p>Aucun rapport d'activité n'a encore été enregistré</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, TransitionGroup } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePatientStore } from '@/stores/patientStore'
import { useAuthStore } from '@/stores/authStores'
import {
  Users, Activity, Clock, RefreshCw, Bell, CheckCircle, XCircle, Search,
  BarChart3, User, FileText, LogOut, Heart, Thermometer, Wind, AlertTriangle,
  History, Hospital, Ruler, Beaker, Download, Save, ChevronRight, X,
  ClipboardList, ChevronDown, Edit, Trash2
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const patientStore = usePatientStore()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref(null)
const success = ref(null)
const isSidebarOpen = ref(false)
const isFormCollapsed = ref(false)
const nurseId = computed(() => route.params.id || authStore.user?.id || '1')

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
        closeSidebar()
        await authStore.logout()
        router.push({ name: 'Login' })
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
    }
}

// Form data
const form = ref({
  patient_id: '',
  report_date: '',
  title: '',
  content: ''
})

const reports = ref([])
const localFormLoading = ref(false)
const localFormError = ref(null)
const localFormSuccess = ref(null)

const patientsListForForm = computed(() => {
  const patients = patientStore.patients
  if (!patients) return []
  
  // Gérer différents formats possibles
  let patientsArray = []
  if (Array.isArray(patients)) {
    patientsArray = patients
  } else if (patients.data && Array.isArray(patients.data)) {
    patientsArray = patients.data
  } else if (typeof patients === 'object') {
    patientsArray = Object.values(patients)
  }
  
  return patientsArray.filter(p => p && p.id)
})

// Functions
function getPatientFullName(patient) {
  if (!patient || !patient.user || !patient.id) return 'Patient inconnu'
  return `${patient.user.first_name} ${patient.user.last_name}`
}

function formatDate(dateString) {
  if (!dateString) return 'Date non spécifiée'
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function toggleForm() {
  isFormCollapsed.value = !isFormCollapsed.value
}

async function submitReport() {
  try {
    localFormLoading.value = true
    localFormError.value = null
    localFormSuccess.value = null

    if (!form.value.patient_id) {
      localFormError.value = 'Veuillez sélectionner un patient'
      return
    }

    const reportData = {
      ...form.value,
      nurse_id: nurseId.value,
      report_date: form.value.report_date || new Date().toISOString()
    }

    // Simuler l'enregistrement (à remplacer avec l'appel API réel)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Trouver le patient sélectionné
    const selectedPatient = patientsListForForm.value.find(p => p && p.id === reportData.patient_id)
    
    // Ajouter le rapport à la liste (simulation)
    reports.value.unshift({
      id: Date.now(),
      ...reportData,
      nurse: { user: authStore.user },
      patient: selectedPatient
    })

    // Réinitialiser le formulaire
    form.value = {
      patient_id: '',
      report_date: '',
      title: '',
      content: ''
    }

    localFormSuccess.value = 'Rapport enregistré avec succès !'
    isFormCollapsed.value = true

  } catch (err) {
    localFormError.value = 'Erreur lors de l\'enregistrement du rapport'
    console.error(err)
  } finally {
    localFormLoading.value = false
  }
}

function editReport(report) {
  if (!report) return
  
  // Remplir le formulaire avec les données du rapport
  form.value = {
    patient_id: report.patient_id || '',
    report_date: report.report_date || '',
    title: report.title || '',
    content: report.content || ''
  }
  isFormCollapsed.value = false
}

function deleteReport(reportId) {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
    reports.value = reports.value.filter(r => r.id !== reportId)
    success.value = 'Rapport supprimé avec succès'
  }
}

function refreshReports() {
  loading.value = true
  // Simuler le chargement des rapports
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

onMounted(async () => {
  loading.value = true
  try {
    // Utiliser la méthode correcte pour charger les patients
    await patientStore.allPatient()
    // Charger les rapports existants (simulation)
    reports.value = []
  } catch (err) {
    error.value = 'Erreur lors du chargement des données'
    console.error(err)
  } finally {
    loading.value = false
  }
})
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

/* === Sidebar === */
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

/* === Header === */
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
.report-form-section, .reports-list-section {
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reports-count {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
}

.toggle-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.toggle-btn .rotated {
  transform: rotate(180deg);
}

/* === Cards === */
.report-form-card, .report-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.report-form-card:hover, .report-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

/* === Forms === */
.report-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.required {
  color: var(--danger);
}

.input-wrapper, .textarea-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: rgba(255, 255, 255, 0.6);
  z-index: 1;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.form-input[type="datetime-local"] {
  padding: 0.75rem 1rem 0.75rem 3rem;
}

.form-input:not([class*="input-wrapper"] > .form-input) {
  padding: 0.75rem 1rem;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(37, 99, 235, 0.5);
  box-shadow: 0 0 20px rgba(37, 99, 235, 0.2);
}

.form-input::placeholder, .form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-actions {
  display: flex;
  justify-content: center;
}

.submit-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* === Reports List === */
.reports-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.report-title h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.25rem 0;
}

.report-date {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
}

.report-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.edit-btn:hover {
  background: rgba(37, 99, 235, 0.2);
  border-color: rgba(37, 99, 235, 0.3);
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
}

.report-content {
  margin-bottom: 1rem;
}

.report-content p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0;
}

.report-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.patient-info, .author-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
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
@media (max-width: 768px) {
  .dashboard-admin {
    padding: 1rem;
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .report-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .report-footer {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .submit-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>