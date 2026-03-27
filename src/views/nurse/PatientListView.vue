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
          <RouterLink :to="{name:'NurseDashboard'}" class="menu-item" @click="closeSidebar">
            <BarChart3 :size="20" class="menu-icon" /> Dashboard
          </RouterLink>
          
          <div class="menu-divider">Gestion des Patients</div>
          
          <RouterLink :to="{name:'PatientList'}" class="menu-item active" @click="closeSidebar">
            <Users :size="20" class="menu-icon" /> Patients
          </RouterLink>
          <RouterLink :to="{name:'VitalSignsForm'}" class="menu-item" @click="closeSidebar">
            <Activity :size="20" class="menu-icon" /> Signes Vitaux
          </RouterLink>
          <RouterLink :to="{name:'ActivityReport'}" class="menu-item" @click="closeSidebar">
            <ClipboardList :size="20" class="menu-icon" /> Rapports d'Activité
          </RouterLink>

          <div class="menu-divider">Communication</div>

          <RouterLink :to="{name:'NurseProfile'}" class="menu-item" @click="closeSidebar">
            <User :size="20" class="menu-icon" /> Mon Profil
          </RouterLink>
          <RouterLink :to="{name:'NoticeBoard'}" class="menu-item" @click="closeSidebar">
            <Bell :size="20" class="menu-icon" /> Messagerie
          </RouterLink>
          <RouterLink :to="{name:'CareNotes'}" class="menu-item" @click="closeSidebar">
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
              <h1 class="dashboard-title">Liste des Patients</h1>
              <p class="dashboard-subtitle">Gérez les dossiers médicaux de vos patients</p>
            </div>
            <button @click="refreshPatients" class="refresh-btn" :disabled="loading">
              <RefreshCw :size="18" :class="{ 'spinning': loading }" />
              {{ loading ? 'Actualisation...' : 'Actualiser' }}
            </button>
          </header>

          <!-- Messages Feedback -->
          <TransitionGroup name="fade">
            <div v-if="loading" key="loading" class="feedback-message loading-message">
              <RefreshCw :size="20" class="spinning" />
              <span>Chargement des patients...</span>
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

          <!-- Search Section -->
          <section class="search-section">
            <div class="search-card">
              <div class="search-input-wrapper">
                <Search :size="20" class="search-icon" />
                <input
                  v-model="patientStore.searchTerm"
                  @input="handleSearchInput"
                  placeholder="Rechercher par nom, email, ID..."
                  class="search-input"
                />
              </div>
            </div>
          </section>

          <!-- Stats Cards -->
          <section class="stats-section">
            <div class="section-header">
              <h2 class="section-title">Statistiques des Patients</h2>
              <span class="live-indicator">● Live</span>
            </div>
            <div class="top-stats">
              <div class="stat-box patients">
                <div class="stat-icon">
                  <Users :size="24" />
                </div>
                <div class="stat-details">
                  <h3 class="stat-value">{{ sortedPatients?.length || 0 }}</h3>
                  <p class="stat-label">Total Patients</p>
                  <div class="stat-trend">
                    <span class="trend-positive">+8%</span>
                    <span class="trend-period">vs hier</span>
                  </div>
                </div>
              </div>
              <div class="stat-box">
                <div class="stat-icon">
                  <Activity :size="24" />
                </div>
                <div class="stat-details">
                  <h3 class="stat-value">{{ getCriticalPatientsCount() }}</h3>
                  <p class="stat-label">Patients Critiques</p>
                  <div class="stat-trend">
                    <span class="trend-positive">-2</span>
                    <span class="trend-period">vs matin</span>
                  </div>
                </div>
              </div>
              <div class="stat-box">
                <div class="stat-icon">
                  <Clock :size="24" />
                </div>
                <div class="stat-details">
                  <h3 class="stat-value">{{ getActivePatientsCount() }}</h3>
                  <p class="stat-label">Patients Actifs</p>
                  <div class="stat-trend">
                    <span class="trend-positive">+5</span>
                    <span class="trend-period">vs dernière heure</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Patients Table Section -->
          <section class="tables-section">
            <div class="table-section">
              <div class="table-header">
                <h4><Users :size="18" /> Liste des Patients Actifs</h4>
                <span class="badge-count">{{ sortedPatients?.length || 0 }}</span>
              </div>
              <div v-if="loading" class="loading-state">
                <div class="loading-spinner"></div>
                <p>Chargement des patients...</p>
              </div>
              <div v-else-if="!sortedPatients || sortedPatients.length === 0" class="empty-state">
                <div class="empty-icon">
                  <Users :size="48" />
                </div>
                <h5>Aucun patient trouvé</h5>
                <p>Aucun patient ne correspond à votre recherche.</p>
                <button @click="clearSearch" class="refresh-btn">
                  <X :size="16" />
                  Effacer la recherche
                </button>
              </div>
              <div v-else class="patients-table-container">
                <div class="table-responsive">
                  <table class="patients-table">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Informations</th>
                        <th>Localisation</th>
                        <th>Dernière Consultation</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="patient in sortedPatients" :key="patient.id" class="patient-row">
                        <td>
                          <div class="patient-cell">
                            <div class="patient-avatar">
                              {{ getInitials(patient.user?.first_name, patient.user?.last_name) }}
                            </div>
                            <div class="patient-info">
                              <div class="patient-name">
                                {{ patient.user ? `${patient.user.first_name} ${patient.user.last_name}` : 'N/A' }}
                              </div>
                              <div class="patient-id">ID: {{ patient.id }}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div class="patient-details">
                            <div class="detail-item">
                              <span class="detail-label">Sexe:</span>
                              <span class="detail-value">{{ formatGender(patient.genre) }}</span>
                            </div>
                            <div class="detail-item">
                              <span class="detail-label">Âge:</span>
                              <span class="detail-value">{{ calculateAge(patient.user?.birth_date) }} ans</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div class="room-badge">
                            <MapPin :size="16" />
                            <span v-if="patient.bed?.room">Ch. {{ patient.bed.room.room_number }}</span>
                            <span v-else>N/A</span>
                          </div>
                        </td>
                        <td>
                          <div class="care-info">
                            <div class="care-time">{{ formatDate(patient.last_consultation_date) }}</div>
                            <div class="care-status">Consultation</div>
                          </div>
                        </td>
                        <td>
                          <span :class="['status-badge', getPatientStatusClass(patient.status)]">
                            {{ formatPatientStatus(patient.status) }}
                          </span>
                        </td>
                        <td>
                          <div class="action-buttons">
                            <RouterLink :to="`/nurse/${nurseId}/patient/${patient.id}`" class="btn-action primary">
                              <Eye :size="16" />
                            </RouterLink>
                            <button class="btn-action secondary" @click="viewPatientDetails(patient)">
                              <FileText :size="16" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Pagination -->
              <div v-if="patientStore.patients?.last_page > 1" class="pagination-controls">
                <button 
                  @click="patientStore.allPatient(patientStore.patients.current_page - 1)" 
                  :disabled="patientStore.patients.current_page === 1" 
                  class="pagination-btn"
                >
                  <ChevronLeft :size="16" />
                </button>
                <span class="pagination-info">
                  Page {{ patientStore.patients.current_page }} / {{ patientStore.patients.last_page }}
                </span>
                <button 
                  @click="patientStore.allPatient(patientStore.patients.current_page + 1)" 
                  :disabled="patientStore.patients.current_page === patientStore.patients.last_page" 
                  class="pagination-btn"
                >
                  <ChevronRight :size="16" />
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, TransitionGroup } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePatientStore } from '@/stores/patientStore'
import { useAuthStore } from '@/stores/authStores'
import { 
  Users, Activity, Clock, RefreshCw, Bell, CheckCircle, XCircle, Search,
  BarChart3, User, FileText, LogOut, MapPin, Eye, X, ChevronLeft, ChevronRight
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const patientStore = usePatientStore()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref(null)
const success = ref(null)
const isSidebarOpen = ref(false)
const nurseId = computed(() => route.params.idNurse || route.params.id || authStore.user?.id || '1')

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

let searchTimeout = null;

// Functions
function refreshPatients() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    success.value = 'Liste des patients actualisée'
    setTimeout(() => success.value = null, 3000)
  }, 1000)
}

function clearSearch() {
  patientStore.searchTerm = ''
  handleSearchInput()
}

function getCriticalPatientsCount() {
  if (!sortedPatients.value) return 0
  return sortedPatients.value.filter(p => p.status === 'critique').length
}

function getActivePatientsCount() {
  if (!sortedPatients.value) return 0
  return sortedPatients.value.filter(p => p.status === 'actif' || p.status === 'en_traitement').length
}

function getInitials(firstName, lastName) {
  if (!firstName && !lastName) return 'P'
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

function getPatientStatusClass(status) {
  switch(status) {
    case 'critique': return 'danger'
    case 'en_traitement': return 'warning'
    case 'actif': return 'success'
    default: return 'info'
  }
}

function viewPatientDetails(patient) {
  console.log('View patient details:', patient)
}

// util: normalise une chaîne (minuscules + suppression accents)
const normalize = (s) => {
  if (s === null || s === undefined) return '';
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

// computed : mets les correspondants en haut
const sortedPatients = computed(() => {
  const raw = patientStore.patients?.data ?? [];
  // clone pour ne pas modifier l'array d'origine
  const patients = Array.isArray(raw) ? [...raw] : [];

  const term = normalize(patientStore.searchTerm);
  if (!term) return patients;

  const matching = [];
  const others = [];

  for (const p of patients) {
    // concaténation des champs à tester
    const fields = [
      p.id,
      p.user?.first_name,
      p.user?.last_name,
      p.user?.email,
      p.status,
      p.bed?.room?.room_number,
      p.bed?.bed_number,
      p.user?.phone
    ];
    const combined = fields.map(f => normalize(f)).join(' ');
    if (combined.includes(term)) matching.push(p);
    else others.push(p);
  }

  return [...matching, ...others];
});

// --- Tri des colonnes ---
const handleSortClick = async (column) => {
  patientStore.setSort(column);
  await patientStore.allPatient(1);
};

// --- Recherche avec debounce ---
const handleSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    // relance la requête serveur (si ton API fait la recherche côté serveur)
    await patientStore.allPatient(1);
  }, 300);
};

// --- Chargement initial ---
onMounted(async () => {
  patientStore.searchTerm = patientStore.searchTerm ?? '';
  await patientStore.allPatient();
});

// --- Fonctions utilitaires (inchangées) ---
const calculateAge = (birthDateString) => {
  if (!birthDateString) return 'N/A';
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('fr-FR');
};

const formatGender = (genre) => {
  if (!genre) return 'N/A';
  switch (genre.toLowerCase()) {
    case 'homme': case 'm': case 'male': return 'Homme';
    case 'femme': case 'f': case 'female': return 'Femme';
    default: return genre.charAt(0).toUpperCase() + genre.slice(1);
  }
};

const formatPatientStatus = (status) => {
  if (!status) return 'N/A';
  const statusMap = {
    actif: 'Actif',
    en_traitement: 'En Traitement',
    stable: 'Stable',
    critique: 'Critique',
    sorti: 'Sorti',
    archive: 'Archivé',
  };
  return statusMap[status] || status.replace('_', ' ');
};
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

.refresh-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
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
.search-section, .stats-section, .charts-section, .tables-section {
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

/* === Search Section === */
.search-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.search-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: rgba(255, 255, 255, 0.6);
  z-index: 1;
}

.search-input {
  width: 100%;
  max-width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
  font-family: inherit;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(37, 99, 235, 0.5);
  box-shadow: 0 0 20px rgba(37, 99, 235, 0.2);
}

/* === Stats Cards === */
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

/* === Table Section === */
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

/* === Loading/Empty States === */
.loading-state, .empty-state {
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
  margin: 0 0 1.5rem 0;
}

/* === Patients Table === */
.patients-table-container {
  overflow-x: auto;
}

.table-responsive {
  min-width: 800px;
}

.patients-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.patients-table thead {
  background: rgba(255, 255, 255, 0.05);
}

.patients-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.patient-row {
  transition: all 0.3s ease;
}

.patient-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.patients-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  vertical-align: middle;
}

.patient-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.patient-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.patient-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.patient-name {
  font-weight: 600;
  color: white;
  font-size: 0.95rem;
}

.patient-id {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.patient-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.detail-value {
  font-size: 0.875rem;
  color: white;
  font-weight: 500;
}

.room-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(37, 99, 235, 0.2);
  border: 1px solid rgba(37, 99, 235, 0.3);
  border-radius: 8px;
  color: var(--primary);
  font-size: 0.875rem;
  font-weight: 600;
}

.care-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.care-time {
  font-size: 0.875rem;
  color: white;
  font-weight: 500;
}

.care-status {
  font-size: 0.75rem;
  color: var(--secondary);
  font-weight: 600;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.success {
  background: rgba(34, 197, 94, 0.2);
  color: var(--success);
}

.status-badge.danger {
  background: rgba(239, 68, 68, 0.2);
  color: var(--danger);
}

.status-badge.warning {
  background: rgba(245, 158, 11, 0.2);
  color: var(--warning);
}

.status-badge.info {
  background: rgba(6, 182, 212, 0.2);
  color: var(--info);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
}

.btn-action.primary {
  background: rgba(37, 99, 235, 0.2);
  color: var(--primary);
}

.btn-action.primary:hover {
  background: rgba(37, 99, 235, 0.3);
  transform: scale(1.1);
}

.btn-action.secondary {
  background: rgba(139, 92, 246, 0.2);
  color: var(--accent);
}

.btn-action.secondary:hover {
  background: rgba(139, 92, 246, 0.3);
  transform: scale(1.1);
}

/* === Pagination === */
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.pagination-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
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
  .top-stats {
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
  
  .table-section {
    padding: 1rem;
  }
  
  .patients-table-container {
    overflow-x: auto;
  }
  
  .patient-row {
    display: block;
    padding: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .patients-table td {
    display: block;
    width: 100%;
    padding: 0.5rem 0;
    border: none;
  }
  
  .patients-table th {
    display: none;
  }
}
</style>