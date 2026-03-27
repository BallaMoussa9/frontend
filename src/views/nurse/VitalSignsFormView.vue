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
          <RouterLink :to="{name:'VitalSignsForm', params: { id: nurseId }}" class="menu-item active" @click="closeSidebar">
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
        <!-- Header -->
        <header class="dashboard-header">
          <div class="header-content">
            <h1 class="dashboard-title">Signes Vitaux</h1>
            <p class="dashboard-subtitle">Enregistrement des paramètres vitaux des patients</p>
          </div>
          <button @click="resetForm" class="refresh-btn">
            <RefreshCw :size="18" />
            Réinitialiser
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

        <!-- Search Section - TOUJOURS VISIBLE -->
        <section v-if="!selectedPatient" class="search-section">
          <div class="section-header">
            <h2 class="section-title"><Search :size="20" /> Recherche Patient</h2>
          </div>
          <div class="search-card">
            <div class="search-input-wrapper">
              <Search :size="20" class="search-icon" />
              <input
                type="text"
                v-model="searchQuery"
                placeholder="Nom, prénom ou ID du patient..."
                class="search-input"
                @input="handleSearchInput"
                :disabled="selectedPatient !== null"
              />
              <div v-if="patientStore.loading" class="search-loading">
                <RefreshCw :size="16" class="spinning" />
              </div>
            </div>
            
            <!-- Toujours afficher les résultats de recherche -->
            <div class="search-results">
              <!-- Message de chargement ou d'erreur -->
              <div v-if="patientStore.loading" class="loading-state">
                <div class="loading-spinner"></div>
                <p>Chargement des patients...</p>
              </div>
              
              <!-- Patients trouvés -->
              <div v-else-if="filteredPatients.length > 0">
                <div
                  v-for="patient in filteredPatients"
                  :key="patient.id ?? patient._id"
                  @click="selectPatient(patient)"
                  class="patient-result-item"
                >
                  <div class="patient-avatar">
                    {{ getInitials(patient.user?.first_name, patient.user?.last_name) }}
                  </div>
                  <div class="patient-info">
                    <h4>{{ patient.user?.first_name }} {{ patient.user?.last_name }}</h4>
                    <p>ID: {{ patient.id ?? patient._id }} • {{ patient.user?.email }}</p>
                  </div>
                  <ChevronRight :size="20" class="arrow-icon" />
                </div>
              </div>
              
              <!-- Message si aucun patient trouvé -->
              <div v-else-if="searchQuery.length >= 1" class="empty-state">
                <div class="empty-icon">
                  <Users :size="48" />
                </div>
                <h5>Aucun patient trouvé</h5>
                <p>Aucun patient ne correspond à votre recherche</p>
              </div>
              
              <!-- Message si aucun patient disponible -->
              <div v-else class="empty-state">
                <div class="empty-icon">
                  <Users :size="48" />
                </div>
                <h5>Aucun patient disponible</h5>
                <p>Veuillez contacter l'administrateur pour charger les patients</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Dashboard avec patient sélectionné -->
        <div v-if="selectedPatient" class="dashboard-admin">
          <!-- Selected Patient Section -->
          <section class="selected-patient-section">
            <div class="section-header">
              <h2 class="section-title"><User :size="20" /> Patient Sélectionné</h2>
              <button @click="clearPatient" class="clear-btn">
                <X :size="16" />
                Changer
              </button>
            </div>
            <div class="patient-card">
              <div class="patient-header">
                <div class="patient-avatar-large">
                  {{ getInitials(selectedPatient.user?.first_name, selectedPatient.user?.last_name) }}
                </div>
                <div class="patient-details">
                  <h3>{{ selectedPatient.user?.first_name }} {{ selectedPatient.user?.last_name }}</h3>
                  <p>ID: {{ selectedPatient.id ?? selectedPatient._id }} • {{ selectedPatient.user?.email }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Vitals Form Section -->
          <section class="vitals-form-section">
            <div class="section-header">
              <h2 class="section-title"><Activity :size="20" /> Paramètres Vitaux</h2>
              <span class="required-indicator">* Champs obligatoires</span>
            </div>
            <div class="vitals-form-card">
              <form @submit.prevent="submitVitals" class="vitals-form">
                <div class="vitals-grid">
                  <div class="vital-input-group">
                    <div class="vital-icon">
                      <Thermometer :size="20" />
                    </div>
                    <div class="vital-input-wrapper">
                      <label for="temperature" class="vital-label">Température (°C) <span class="required">*</span></label>
                      <input id="temperature" type="number" step="0.1" v-model="form.temperature" class="vital-input" placeholder="ex: 37.2" required />
                    </div>
                  </div>

                  <div class="vital-input-group">
                    <div class="vital-icon">
                      <Heart :size="20" />
                    </div>
                    <div class="vital-input-wrapper">
                      <label for="systolic" class="vital-label">Pression Systolique (mmHg) <span class="required">*</span></label>
                      <input type="number" id="systolic" v-model="form.blood_pressure_systolic" class="vital-input" placeholder="ex: 120" required />
                    </div>
                  </div>

                  <div class="vital-input-group">
                    <div class="vital-icon">
                      <Heart :size="20" />
                    </div>
                    <div class="vital-input-wrapper">
                      <label for="diastolic" class="vital-label">Pression Diastolique (mmHg) <span class="required">*</span></label>
                      <input type="number" id="diastolic" v-model="form.blood_pressure_diastolic" class="vital-input" placeholder="ex: 80" required />
                    </div>
                  </div>

                  <div class="vital-input-group">
                    <div class="vital-icon pulse">
                      <Heart :size="20" />
                    </div>
                    <div class="vital-input-wrapper">
                      <label for="heart_rate" class="vital-label">Fréquence Cardiaque (bpm) <span class="required">*</span></label>
                      <input id="heart_rate" type="number" v-model="form.heart_rate" class="vital-input" placeholder="ex: 75" required />
                    </div>
                  </div>

                  <div class="vital-input-group">
                    <div class="vital-icon">
                      <Wind :size="20" />
                    </div>
                    <div class="vital-input-wrapper">
                      <label for="respiratory_rate" class="vital-label">Fréquence Respiratoire (rpm)</label>
                      <input id="respiratory_rate" type="number" v-model="form.respiratory_rate" class="vital-input" placeholder="ex: 16" />
                    </div>
                  </div>

                  <div class="vital-input-group">
                    <div class="vital-icon oxygen">
                      <Wind :size="20" />
                    </div>
                    <div class="vital-input-wrapper">
                      <label for="oxygen_saturation" class="vital-label">Saturation O₂ (%)</label>
                      <input id="oxygen_saturation" type="number" step="0.1" v-model="form.oxygen_saturation" class="vital-input" placeholder="ex: 98" />
                    </div>
                  </div>

                  <div class="vital-input-group">
                    <div class="vital-icon">
                      <Ruler :size="20" />
                    </div>
                    <div class="vital-input-wrapper">
                      <label for="weight" class="vital-label">Poids (kg)</label>
                      <input id="weight" type="number" step="0.1" v-model="form.weight" class="vital-input" placeholder="ex: 70.5" />
                    </div>
                  </div>

                  <div class="vital-input-group">
                    <div class="vital-icon">
                      <Ruler :size="20" />
                    </div>
                    <div class="vital-input-wrapper">
                      <label for="height" class="vital-label">Taille (m)</label>
                      <input id="height" type="number" step="0.01" v-model="form.height" class="vital-input" placeholder="ex: 1.75" />
                    </div>
                  </div>
                </div>

                <!-- Notes Section -->
                <div class="notes-section">
                  <div class="notes-header">
                    <FileText :size="20" />
                    <label for="notes" class="notes-label">Notes de l'infirmier(e)</label>
                  </div>
                  <textarea id="notes" v-model="form.notes" rows="4" class="notes-textarea" placeholder="Observations cliniques, symptômes, traitements en cours..."></textarea>
                </div>

                <!-- Submit Button -->
                <div class="submit-section">
                  <button type="submit" :disabled="nurseStore.loading" class="submit-btn">
                    <Save :size="20" />
                    {{ nurseStore.loading ? 'Enregistrement...' : 'Enregistrer les Signes Vitaux' }}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, TransitionGroup, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePatientStore } from '@/stores/patientStore'
import { useNurseStore } from '@/stores/nurseStore'
import { useAuthStore } from '@/stores/authStores'
import {
  Users, Activity, Clock, RefreshCw, Bell, CheckCircle, XCircle, Search,
  BarChart3, User, FileText, LogOut, Heart, Thermometer, Wind, AlertTriangle,
  History, Hospital, Ruler, Beaker, Download, Save, ChevronRight, X
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const patientStore = usePatientStore()
const nurseStore = useNurseStore()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref(null)
const success = ref(null)
const isSidebarOpen = ref(false)
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

// Functions
function getInitials(firstName, lastName) {
  if (!firstName && !lastName) return 'P'
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

// Form functions
const searchQuery = ref("");
const selectedPatient = ref(null);

const form = ref({
  temperature: null,
  blood_pressure_systolic: null,
  blood_pressure_diastolic: null,
  heart_rate: null,
  respiratory_rate: null,
  oxygen_saturation: null,
  weight: null,
  height: null,
  notes: "",
});

let searchTimeout = null;

// Computed property pour les patients filtrés
const filteredPatients = computed(() => {
  const allPatients = patientStore.patients || [];
  const patientsArray = Array.isArray(allPatients) ? allPatients : 
                       (allPatients.data ? allPatients.data : []);
  
  if (!searchQuery.value.trim()) {
    return patientsArray.slice(0, 15);
  }
  
  const query = searchQuery.value.toLowerCase();
  return patientsArray.filter(patient => {
    const firstName = patient.user?.first_name?.toLowerCase() || '';
    const lastName = patient.user?.last_name?.toLowerCase() || '';
    const id = String(patient.id || patient._id || '').toLowerCase();
    return firstName.includes(query) || lastName.includes(query) || id.includes(query);
  }).slice(0, 15);
});

// Fonction de recherche - la computed property filteredPatients gère tout automatiquement
const handleSearchInput = () => {
  // Rien à faire ici, la computed property se met à jour automatiquement
  // quand searchQuery change grâce à la réactivité de Vue
};

onMounted(async () => {
  // Charger tous les patients au montage pour avoir une liste disponible
  await patientStore.allPatient();
  patientStore.clearFeedback();
  nurseStore.clearFeedback();
});

// --- RECHERCHE PATIENT ---
const selectPatient = (patient) => {
  selectedPatient.value = patient;
  searchQuery.value = `${patient.user?.first_name} ${patient.user?.last_name}`;
};

function clearPatient() {
  selectedPatient.value = null;
  searchQuery.value = "";
}

function resetForm() {
  selectedPatient.value = null;
  searchQuery.value = "";
  form.value = {
    temperature: null,
    blood_pressure_systolic: null,
    blood_pressure_diastolic: null,
    heart_rate: null,
    respiratory_rate: null,
    oxygen_saturation: null,
    weight: null,
    height: null,
    notes: "",
  };
}

async function submitVitals() {
  try {
    loading.value = true;
    error.value = null;
    success.value = null;

    const vitalData = {
      ...form.value,
      patient_id: selectedPatient.value.id,
    };

    const result = await nurseStore.recordVitals(vitalData);
    
    if (result) {
      success.value = "Signes vitaux enregistrés avec succès !";
      resetForm();
    }
  } catch (err) {
    error.value = "Erreur lors de l'enregistrement des signes vitaux";
    console.error(err);
  } finally {
    loading.value = false;
  }
}

const resetSelection = () => {
  selectedPatient.value = null;
  searchQuery.value = "";
  Object.keys(form.value).forEach(key => form.value[key] = (key === 'notes' ? "" : null));
  nurseStore.clearFeedback();
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
.search-section, .selected-patient-section, .vitals-form-section {
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

.required-indicator {
  color: var(--warning);
  font-size: 0.875rem;
  font-weight: 500;
}

/* === Cards === */
.search-card, .patient-card, .vitals-form-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  min-height: 80px;
}

.search-card:hover, .patient-card:hover, .vitals-form-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

/* === Search === */
.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  min-height: 48px;
}

.search-icon {
  color: rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  min-width: 200px;
  height: 48px;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
  font-family: inherit;
}

.search-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(37, 99, 235, 0.5);
  box-shadow: 0 0 20px rgba(37, 99, 235, 0.2);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-loading {
  color: var(--primary);
  animation: spin 1s linear infinite;
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.patient-result-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.patient-result-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
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
  flex-shrink: 0;
}

.patient-info {
  flex: 1;
}

.patient-info h4 {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.25rem 0;
}

.patient-info p {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.arrow-icon {
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
}

.patient-result-item:hover .arrow-icon {
  color: var(--primary);
  transform: translateX(4px);
}

/* === Selected Patient === */
.clear-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  color: var(--danger);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: translateY(-2px);
}

.patient-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.patient-avatar-large {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.patient-details h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
}

.patient-details p {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

/* === Vitals Form === */
.vitals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.vital-input-group {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.vital-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.vital-icon.pulse {
  animation: pulse 2s infinite;
}

.vital-icon.temp {
  background: linear-gradient(135deg, var(--warning), var(--danger));
}

.vital-icon.oxygen {
  background: linear-gradient(135deg, var(--info), var(--primary));
}

.vital-input-wrapper {
  flex: 1;
}

.vital-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
}

.vital-label .required {
  color: var(--danger);
}

.vital-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.vital-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(37, 99, 235, 0.5);
  box-shadow: 0 0 20px rgba(37, 99, 235, 0.2);
}

.vital-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

/* === Notes Section === */
.notes-section {
  margin-bottom: 2rem;
}

.notes-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.notes-header {
  color: rgba(255, 255, 255, 0.8);
}

.notes-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.notes-textarea {
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 0.875rem;
  resize: vertical;
  transition: all 0.3s ease;
}

.notes-textarea:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(37, 99, 235, 0.5);
  box-shadow: 0 0 20px rgba(37, 99, 235, 0.2);
}

.notes-textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

/* === Submit Section === */
.submit-section {
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

/* === Empty States === */
.empty-state-container, .empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: rgba(255, 255, 255, 0.6);
}

.empty-icon {
  margin-bottom: 1rem;
  color: var(--secondary);
  opacity: 0.7;
}

.empty-state h5, .empty-state-container h5 {
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.5rem 0;
}

.empty-state p, .empty-state-container p {
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
  
  .vitals-grid {
    grid-template-columns: 1fr;
  }
  
  .patient-header {
    flex-direction: column;
    text-align: center;
  }
  
  .submit-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>