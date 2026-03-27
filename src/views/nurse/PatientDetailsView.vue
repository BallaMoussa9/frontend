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
        <div class="dashboard-admin" v-if="patient && patient.id">
          <!-- Header -->
          <header class="dashboard-header">
            <div class="header-content">
              <div class="header-title-section">
                <button @click="goBack" class="back-btn">
                  <ArrowLeft :size="20" />
                </button>
                <div>
                  <h1 class="dashboard-title">Dossier Patient</h1>
                  <p class="dashboard-subtitle">Informations médicales et suivi du patient</p>
                </div>
              </div>
            </div>
            <button @click="handleUpdate" class="refresh-btn" :disabled="isUpdating">
              <Save :size="18" :class="{ 'spinning': isUpdating }" />
              {{ isUpdating ? 'Mise à jour...' : 'Enregistrer' }}
            </button>
          </header>

          <!-- Messages Feedback -->
          <TransitionGroup name="fade">
            <div v-if="loading" key="loading" class="feedback-message loading-message">
              <RefreshCw :size="20" class="spinning" />
              <span>Chargement du dossier médical...</span>
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

          <!-- Patient Profile Card -->
          <section class="patient-profile-section">
            <div class="profile-card">
              <div class="profile-header">
                <div class="patient-avatar">
                  {{ getInitials(patient?.user?.first_name, patient?.user?.last_name) }}
                </div>
                <div class="patient-info">
                  <h2 class="patient-name">{{ patient?.user?.first_name }} {{ patient?.user?.last_name }}</h2>
                  <div class="patient-badges">
                    <span class="badge primary">ID: #{{ patient?.id }}</span>
                    <span class="badge info">{{ formatGender(patient?.genre) }}</span>
                    <span class="badge success">{{ calculateAge(patient?.user?.birth_date) }} ans</span>
                    <span class="badge warning">{{ patient?.group_sanguine || 'N/A' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div class="dashboard-grid">
          
          <div class="main-column">
            <!-- Vitals Section -->
            <section class="vitals-section">
              <div class="section-header">
                <h2 class="section-title"><Heart :size="20" /> Dernières Constantes</h2>
                <span class="live-indicator">● Live</span>
              </div>
              <div class="vitals-card">
                <div v-if="patient?.latest_vitals" class="vitals-grid">
                  <div class="vital-item">
                    <div class="vital-icon">
                      <Activity :size="24" />
                    </div>
                    <div class="vital-info">
                      <h4 class="vital-label">Tension</h4>
                      <p class="vital-value">{{ patient.latest_vitals.blood_pressure_systolic }}/{{ patient.latest_vitals.blood_pressure_diastolic }}</p>
                      <span class="vital-unit">mmHg</span>
                    </div>
                  </div>
                  <div class="vital-item">
                    <div class="vital-icon pulse">
                      <Heart :size="24" />
                    </div>
                    <div class="vital-info">
                      <h4 class="vital-label">Pouls</h4>
                      <p class="vital-value">{{ patient.latest_vitals.heart_rate }}</p>
                      <span class="vital-unit">bpm</span>
                    </div>
                  </div>
                  <div class="vital-item">
                    <div class="vital-icon temp">
                      <Thermometer :size="24" />
                    </div>
                    <div class="vital-info">
                      <h4 class="vital-label">Température</h4>
                      <p class="vital-value">{{ patient.latest_vitals.temperature }}</p>
                      <span class="vital-unit">°C</span>
                    </div>
                  </div>
                  <div class="vital-item">
                    <div class="vital-icon oxygen">
                      <Wind :size="24" />
                    </div>
                    <div class="vital-info">
                      <h4 class="vital-label">SpO₂</h4>
                      <p class="vital-value">{{ patient.latest_vitals.oxygen_saturation }}</p>
                      <span class="vital-unit">%</span>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-state">
                  <div class="empty-icon">
                    <Activity :size="48" />
                  </div>
                  <h5>Aucune constante récente</h5>
                  <p>Aucune mesure n'a été enregistrée récemment</p>
                </div>
              </div>
            </section>

            <!-- Medical Info Section -->
            <section class="medical-section">
              <div class="section-header">
                <h2 class="section-title"><FileText :size="20" /> Informations Médicales</h2>
              </div>
              <div class="medical-card">
                <div v-if="patient?.allergies" class="alert-card warning">
                  <div class="alert-icon">
                    <AlertTriangle :size="20" />
                  </div>
                  <div class="alert-content">
                    <h4>Allergies</h4>
                    <p>{{ patient.allergies }}</p>
                  </div>
                </div>
                
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-icon">
                      <History :size="20" />
                    </div>
                    <div class="info-content">
                      <h4>Antécédents</h4>
                      <p>{{ patient?.medical_history || 'Aucun antécédent connu' }}</p>
                    </div>
                  </div>
                  <div class="info-item">
                    <div class="info-icon">
                      <Activity :size="20" />
                    </div>
                    <div class="info-content">
                      <h4>Pathologies</h4>
                      <p>{{ patient?.maladies_chroniques || 'Aucune pathologie chronique' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div class="side-column">
            <!-- Hospitalization Section -->
            <section class="hospital-section">
              <div class="section-header">
                <h2 class="section-title"><Hospital :size="20" /> Hospitalisation</h2>
              </div>
              <div class="hospital-card">
                <div class="form-group">
                  <label>Statut clinique</label>
                  <select v-model="patientData.status" class="form-select">
                    <option value="actif">Actif</option>
                    <option value="en_traitement">En Traitement</option>
                    <option value="stable">Stable</option>
                    <option value="critique">Critique</option>
                    <option value="sorti">Sorti</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Lit assigné</label>
                  <select v-model.number="patientData.bed_id" class="form-select">
                    <option :value="null">-- Libérer le lit --</option>
                    <optgroup v-for="group in groupedAvailableBeds" :key="group.departmentId" :label="group.departmentName">
                      <option v-for="bed in group.beds" :key="bed.id" :value="bed.id">
                        Ch. {{ bed.room?.room_number }} - Lit {{ bed.bed_number }}
                      </option>
                    </optgroup>
                  </select>
                </div>
              </div>
            </section>

            <!-- Measurements Section -->
            <section class="measurements-section">
              <div class="section-header">
                <h2 class="section-title"><Ruler :size="20" /> Mesures</h2>
              </div>
              <div class="measurements-card">
                <div class="form-row">
                  <div class="form-group">
                    <label>Poids (kg)</label>
                    <input type="number" step="0.1" v-model.number="patientData.poids" class="form-input" />
                  </div>
                  <div class="form-group">
                    <label>Taille (cm)</label>
                    <input type="number" step="0.1" v-model.number="patientData.taille" class="form-input" />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <!-- Laboratory Section -->
<section class="laboratory-section">
  <div class="section-header">
    <h2 class="section-title"><Beaker :size="20" /> Analyses de Laboratoire</h2>
  </div>
  <div class="laboratory-card">
    <div v-if="labStore.labRequests && labStore.labRequests.length > 0" class="lab-list">
      <div v-for="lab in labStore.labRequests" :key="lab.id" class="lab-item">
        <div class="lab-info">
          <div class="lab-icon">
            <Beaker :size="20" />
          </div>
          <div class="lab-details">
            <h4 class="lab-name">{{ lab.name }}</h4>
            <p class="lab-type">{{ lab.type }}</p>
            <div class="lab-meta">
              <span class="lab-status">{{ lab.status }}</span>
              <span class="lab-doctor">Dr. {{ lab.doctor?.user?.first_name }} {{ lab.doctor?.user?.last_name }}</span>
            </div>
          </div>
        </div>
        <div class="lab-actions">
          <a v-if="lab.status === 'completed' && lab.resultats?.length > 0" 
             :href="'https://santeko.abdatytch.com/storage/' + lab.resultats[0].result_file" 
             target="_blank" 
             class="btn-download">
            <Download :size="16" />
            Télécharger
          </a>
          <span v-else class="status-badge">{{ lab.status }}</span>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <div class="empty-icon">
        <Beaker :size="48" />
      </div>
      <h5>Aucune analyse</h5>
      <p>Aucune analyse de laboratoire n'a été demandée pour ce patient</p>
    </div>
  </div>
</section>
        </div>
        <div v-else class="empty-state-container">
          <div class="empty-icon">
            <User :size="48" />
          </div>
          <h5>Patient introuvable</h5>
          <p>Le dossier patient demandé n'existe pas</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, TransitionGroup } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePatientStore } from '@/stores/patientStore'
import { useBedStore } from '@/stores/bedStore'
import { useLabStore } from '@/stores/labStore'
import { useAuthStore } from '@/stores/authStores'
import {
  Users, Activity, Clock, RefreshCw, Bell, CheckCircle, XCircle, Search,
  BarChart3, User, FileText, LogOut, Heart, Thermometer, Wind, AlertTriangle,
  History, Hospital, Ruler, Beaker, Download, Save, ArrowLeft
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const patientStore = usePatientStore()
const bedStore = useBedStore()
const labStore = useLabStore()
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

// Functions
function getInitials(firstName, lastName) {
  if (!firstName && !lastName) return 'P'
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

// Go back function
function goBack() {
  router.push({ name: 'PatientList', params: { id: nurseId.value } })
}

const idPatient = ref(route.params.idPatient);
const patient = ref({});
const isUpdating = ref(false);
const globalLoading = ref(false);
const previousBedId = ref(null);

const patientData = ref({
  status: '',
  poids: null,
  taille: null,
  bed_id: null,
});

// LOGIQUE DES LITS (Inchangée)
const groupedAvailableBeds = computed(() => {
    let bedsToDisplay = [...(bedStore.getAvailableBeds || [])];
    if (patient.value.bed_id && patient.value.bed && !bedsToDisplay.some(b => b.id === patient.value.bed_id)) {
        bedsToDisplay.push(patient.value.bed);
    }
    const departmentsMap = bedsToDisplay.reduce((acc, bed) => {
        const department = bed.room?.department;
        if (!department) return acc;
        const key = department.id;
        if (!acc[key]) {
            acc[key] = { departmentId: key, departmentName: department.name, beds: [] };
        }
        acc[key].beds.push(bed);
        return acc;
    }, {});
    return Object.values(departmentsMap).sort((a, b) => a.departmentName.localeCompare(b.departmentName));
});

// HELPERS (Inchangés)
const calculateAge = (birthDateString) => {
  if (!birthDateString) return "N/A";
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

const formatGender = (genre) => {
  if (!genre) return 'N/A';
  const g = genre.toLowerCase();
  if (['homme', 'm', 'male'].includes(g)) return 'Homme';
  if (['femme', 'f', 'female'].includes(g)) return 'Femme';
  return genre;
};

// ACTIONS (Modifiées pour le log)
// ... dans ton script setup
const loadPatientData = async (patientId) => {
  if (!patientId) return;
  globalLoading.value = true;
  try {
    // 1. Charge les données du patient
    await patientStore.onePatient(patientId);
    
    // 2. IMPORTANT : Charge les données du LabStore ici pour ce patient
    // (Ajuste selon la méthode qui permet de filtrer par patient, ici un exemple)
    await labStore.listLabRequests({ patient_id: patientId }); 

    // 3. MAINTENANT ton log affichera les données
    console.log("--- DEBUG LABSTORE APRÈS CHARGEMENT ---");
    console.log("labRequests pour ce patient:", labStore.labRequests);
    console.log("---------------------------------------");

    if (patientStore.currentPatient) {
      patient.value = patientStore.currentPatient;
      // ... reste de ton code inchangé
    }
  } finally {
    globalLoading.value = false;
  }
};

const handleUpdate = async () => {
  isUpdating.value = true;
  const currentBedId = patientData.value.bed_id;
  const oldBedId = previousBedId.value;
  const dataToUpdate = {};

  if (patientData.value.status !== patient.value.status) dataToUpdate.status = patientData.value.status;
  if (patientData.value.poids !== parseFloat(patient.value.poids)) dataToUpdate.poids = patientData.value.poids;
  if (patientData.value.taille !== parseFloat(patient.value.taille)) dataToUpdate.taille = patientData.value.taille;
  if (currentBedId !== oldBedId) dataToUpdate.bed_id = currentBedId;

  try {
    if (currentBedId !== oldBedId) {
        if (oldBedId) await bedStore.updateBed(oldBedId, { status: 'available' });
        if (currentBedId) await bedStore.updateBed(currentBedId, { status: 'occupied' });
    }
    const success = await patientStore.updatePatient(idPatient.value, dataToUpdate);
    if (success) await loadPatientData(idPatient.value);
  } finally {
    isUpdating.value = false;
  }
};

onMounted(() => {
    loadPatientData(idPatient.value);
});

watch(() => route.params.idPatient, (newId) => { if (newId) loadPatientData(newId); });
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

.header-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(-2px);
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
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
.patient-profile-section, .vitals-section, .medical-section, .hospital-section, .measurements-section, .laboratory-section {
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

/* === Profile Card === */
.profile-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 2rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.profile-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.patient-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.5rem;
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.patient-info {
  flex: 1;
}

.patient-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.patient-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge.primary {
  background: rgba(37, 99, 235, 0.2);
  color: var(--primary);
}

.badge.info {
  background: rgba(6, 182, 212, 0.2);
  color: var(--info);
}

.badge.success {
  background: rgba(34, 197, 94, 0.2);
  color: var(--success);
}

.badge.warning {
  background: rgba(245, 158, 11, 0.2);
  color: var(--warning);
}

/* === Dashboard Grid === */
.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

/* === Cards === */
.vitals-card, .medical-card, .hospital-card, .measurements-card, .laboratory-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.vitals-card:hover, .medical-card:hover, .hospital-card:hover, .measurements-card:hover, .laboratory-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

/* === Vitals === */
.vitals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.vital-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.vital-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.vital-icon {
  width: 48px;
  height: 48px;
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

.vital-info {
  flex: 1;
}

.vital-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 0.25rem 0;
  font-weight: 500;
}

.vital-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.25rem 0;
}

.vital-unit {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

/* === Medical Info === */
.alert-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.alert-card.warning {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.alert-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--warning), var(--danger));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.alert-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.5rem 0;
}

.alert-content p {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.info-grid {
  display: grid;
  gap: 1rem;
}

.info-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.info-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.info-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.info-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.5rem 0;
}

.info-content p {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* === Forms === */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
}

.form-select, .form-input {
  width: 100%;
  max-width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
  font-family: inherit;
}

.form-select:focus, .form-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(37, 99, 235, 0.5);
  box-shadow: 0 0 20px rgba(37, 99, 235, 0.2);
}

.form-select option {
  background: var(--dark);
  color: white;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* === Laboratory === */
.lab-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lab-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.lab-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.lab-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.lab-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--accent), var(--primary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.lab-details {
  flex: 1;
}

.lab-name {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.25rem 0;
}

.lab-type {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 0.5rem 0;
}

.lab-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
}

.lab-status {
  color: var(--secondary);
  font-weight: 600;
}

.lab-doctor {
  color: rgba(255, 255, 255, 0.6);
}

.lab-actions {
  display: flex;
  align-items: center;
}

.btn-download {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-download:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
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
  
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .vitals-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .lab-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .lab-actions {
    width: 100%;
  }
  
  .btn-download {
    width: 100%;
    justify-content: center;
  }
}
</style>