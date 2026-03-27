<template>
  <LabLayout>
    <div class="lab-dashboard">
        <!-- Animated Background -->
        <div class="background-animation">
          <div class="floating-icon" style="top: 10%; left: 5%; animation-delay: 0s;">
            <Activity :size="30" />
          </div>
          <div class="floating-icon" style="top: 20%; right: 10%; animation-delay: 2s;">
            <Beaker :size="25" />
          </div>
          <div class="floating-icon" style="bottom: 30%; left: 8%; animation-delay: 4s;">
            <TestTube :size="28" />
          </div>
          <div class="floating-icon" style="bottom: 15%; right: 5%; animation-delay: 6s;">
            <CheckCircle :size="32" />
          </div>
        </div>

        <!-- Header Section -->
        <header class="dashboard-header">
          <div class="header-content">
            <div class="welcome-section">
              <div class="welcome-icon">
                <Beaker :size="40" />
              </div>
              <div class="welcome-text">
                <h1 class="dashboard-title">
                  Bienvenue, {{ authStore.user?.first_name }} {{ authStore.user?.last_name }}
                </h1>
                <p class="dashboard-subtitle">
                  <Activity :size="16" />
                  Technicien de laboratoire
                </p>
              </div>
            </div>
            <button @click="refreshData" class="refresh-btn" :disabled="labStore.loading">
              <RefreshCw :size="20" :class="{ spinning: labStore.loading }" />
              {{ labStore.loading ? 'Actualisation...' : 'Actualiser' }}
            </button>
          </div>
        </header>

        <!-- Stats Grid -->
        <section class="stats-section">
          <div class="stat-card pending">
            <div class="stat-icon">
              <Clock :size="24" />
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ pendingExams.length }}</h3>
              <p class="stat-label">En attente</p>
              <div class="stat-trend">
                <TrendingUp :size="16" />
                <span>À traiter</span>
              </div>
            </div>
          </div>

          <div class="stat-card progress">
            <div class="stat-icon">
              <Activity :size="24" />
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ inProgressExams.length }}</h3>
              <p class="stat-label">En cours</p>
              <div class="stat-trend">
                <Zap :size="16" />
                <span>Actives</span>
              </div>
            </div>
          </div>

          <div class="stat-card completed">
            <div class="stat-icon">
              <CheckCircle :size="24" />
            </div>
            <div class="stat-content">
              <h3 class="stat-number">{{ completedCountToday }}</h3>
              <p class="stat-label">Terminées aujourd'hui</p>
              <div class="stat-trend">
                <Award :size="16" />
                <span>Succès</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Main Content Grid -->
        <div class="main-content">
          <!-- New Requests Section -->
          <section class="requests-section">
            <div class="section-card">
              <div class="card-header">
                <div class="header-left">
                  <div class="header-icon">
                    <FileText :size="20" />
                  </div>
                  <div>
                    <h2 class="section-title">Nouvelles demandes</h2>
                    <p class="section-subtitle">Analyses en attente de traitement</p>
                  </div>
                </div>
                <div class="header-right">
                  <span class="badge-count">{{ pendingExams.length }}</span>
                </div>
              </div>

              <div class="requests-list">
                <div v-if="pendingExams.length > 0" class="list-container">
                  <div 
                    v-for="exam in pendingExams" 
                    :key="exam.id" 
                    class="request-item"
                  >
                    <div class="request-content">
                      <div class="patient-info">
                        <div class="patient-avatar">
                          <Users :size="20" />
                        </div>
                        <div class="patient-details">
                          <h4>{{ getPatientFullName(exam.patient) }}</h4>
                          <p>{{ exam.name }}</p>
                          <small>Demandé par: {{ getDoctorFullName(exam.doctor) }}</small>
                        </div>
                      </div>
                      <button 
                        @click="updateStatus(exam.id, 'in_progress')" 
                        class="action-btn start-btn"
                        :disabled="labStore.loading"
                      >
                        <ChevronRight :size="16" />
                        Démarrer
                      </button>
                    </div>
                  </div>
                </div>
                
                <div v-else class="empty-state">
                  <div class="empty-icon">
                    <CheckCircle :size="48" />
                  </div>
                  <h4>Aucune nouvelle demande</h4>
                  <p>Toutes les analyses ont été traitées</p>
                </div>
              </div>
            </div>
          </section>

          <!-- In Progress Section -->
          <section class="progress-section">
            <div class="section-card in-progress">
              <div class="card-header">
                <div class="header-left">
                  <div class="header-icon progress">
                    <Activity :size="20" />
                  </div>
                  <div>
                    <h2 class="section-title">En cours de traitement</h2>
                    <p class="section-subtitle">Analyses actuellement en progression</p>
                  </div>
                </div>
                <div class="header-right">
                  <span class="badge-count blue">{{ inProgressExams.length }}</span>
                </div>
              </div>

              <div class="progress-table">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Examen</th>
                      <th>Demandé par</th>
                      <th>Heure</th>
                      <th>Statut</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="analysis in inProgressExams" :key="analysis.id" class="table-row">
                      <td class="patient-cell">
                        <div class="cell-content">
                          <Users :size="16" />
                          {{ getPatientFullName(analysis.patient) }}
                        </div>
                      </td>
                      <td class="exam-cell">{{ analysis.name }}</td>
                      <td class="doctor-cell">{{ getDoctorFullName(analysis.doctor) }}</td>
                      <td class="time-cell">
                        <div class="cell-content">
                          <Clock :size="14" />
                          {{ formatDate(analysis.created_at) }}
                        </div>
                      </td>
                      <td class="status-cell">
                        <span class="status-badge in-progress">
                          {{ translateStatus(analysis.status) }}
                        </span>
                      </td>
                      <td class="action-cell">
                        <button 
                          v-if="analysis.status === 'pending'" 
                          @click="updateStatus(analysis.id, 'in_progress')" 
                          class="table-action-btn"
                        >
                          Lancer
                        </button>
                        <button 
                          v-else-if="analysis.status === 'in_progress'" 
                          @click="updateStatus(analysis.id, 'completed')" 
                          class="table-action-btn success"
                        >
                          Clôturer
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                
                <div v-if="inProgressExams.length === 0" class="empty-state">
                  <div class="empty-icon">
                    <CheckCircle :size="48" />
                  </div>
                  <h4>Toutes les analyses sont traitées !</h4>
                  <p>Aucune analyse en cours actuellement</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Workflow Tracking Section -->
          <section class="workflow-section">
            <div class="section-card">
              <div class="card-header">
                <div class="header-left">
                  <div class="header-icon workflow">
                    <Calendar :size="20" />
                  </div>
                  <div>
                    <h2 class="section-title">Suivi du flux de travail</h2>
                    <p class="section-subtitle">Historique des analyses actives</p>
                  </div>
                </div>
                <div class="header-right">
                  <span class="badge-count">{{ activeRequests.length }}</span>
                </div>
              </div>

              <div class="workflow-table">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Date Demande</th>
                      <th>Patient</th>
                      <th>Médecin</th>
                      <th>Examen</th>
                      <th>Statut</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="analysis in activeRequests" :key="analysis.id" class="table-row">
                      <td>{{ formatDate(analysis.created_at) }}</td>
                      <td>{{ getPatientFullName(analysis.patient) }}</td>
                      <td>{{ getDoctorFullName(analysis.doctor) }}</td>
                      <td>{{ analysis.name }}</td>
                      <td>
                        <span :class="['status-badge', analysis.status]">
                          {{ translateStatus(analysis.status) }}
                        </span>
                      </td>
                      <td>
                        <button 
                          v-if="analysis.status === 'pending'" 
                          @click="updateStatus(analysis.id, 'in_progress')" 
                          class="table-action-btn"
                        >
                          Lancer
                        </button>
                        <button 
                          v-else-if="analysis.status === 'in_progress'" 
                          @click="updateStatus(analysis.id, 'completed')" 
                          class="table-action-btn success"
                        >
                          Clôturer
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                
                <div v-if="activeRequests.length === 0" class="empty-state">
                  <div class="empty-icon">
                    <CheckCircle :size="48" />
                  </div>
                  <h4>Toutes les analyses sont traitées !</h4>
                  <p>Aucune analyse active actuellement</p>
                </div>
              </div>
            </div>
          </section>
        </div>
    </div>
  </LabLayout>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import LabLayout from '@/layouts/LabLayout.vue'
import { useLabStore } from '@/stores/labStore'
import { useAuthStore } from '@/stores/authStores'
import {
  Activity, Clock, CheckCircle, Users, Beaker, TestTube,
  RefreshCw, TrendingUp, AlertCircle, Calendar, Search, Filter,
  ChevronRight, Zap, Shield, Award, BarChart3, Settings
} from 'lucide-vue-next'

const labStore = useLabStore()
const authStore = useAuthStore()

onMounted(async () => {
  console.log("--- DASHBOARD MOUNTED ---")
  await labStore.listLabRequests()
})

// --- FILTRES RÉACTIFS (COMPUTED) ---

const pendingExams = computed(() => 
  labStore.labRequests.filter(r => r.status === 'pending')
)

const inProgressExams = computed(() => 
  labStore.labRequests.filter(r => r.status === 'in_progress')
)

const activeRequests = computed(() => 
  labStore.labRequests.filter(r => r.status !== 'completed')
)

const completedCountToday = computed(() => 
  labStore.labRequests.filter(r => r.status === 'completed').length
)

// --- ACTIONS ---

const updateStatus = async (id, newStatus) => {
  console.log(`[ACTION] Mise à jour ID: ${id} vers ${newStatus}`);
  
  const success = await labStore.updateLabRequestStatus(id, newStatus)
  
  if (success) {
    console.log("✅ Store mis à jour avec succès.");
    // NOTE: On ne fait plus listLabRequests() ici car le store a déjà fait le splice()
    // Cela évite de recharger toute la base de données inutilement.
  } else {
    console.error("❌ Échec de la mise à jour dans le store.");
  }
}

// --- FORMATAGE ---

const translateStatus = (status) => {
  const map = {
    'pending': 'En attente',
    'in_progress': 'En cours',
    'completed': 'Terminé'
  };
  return map[status] || status;
}

const getPatientFullName = (patient) => {
  if (!patient || !patient.user) return 'Patient Inconnu';
  return `${patient.user.first_name} ${patient.user.last_name}`;
}

const getDoctorFullName = (doctor) => {
  if (!doctor || !doctor.user) return 'Dr. Inconnu';
  return `Dr. ${doctor.user.first_name} ${doctor.user.last_name}`;
}

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  });
}

const refreshData = async () => {
  await labStore.listLabRequests()
}

</script>

<style scoped>
/* === Variables CSS - Glassmorphism Lab (Admin/Patient Style) === */
:root {
  --primary: #2563eb;
  --primary-dark: #1e40af;
  --primary-light: #3b82f6;
  --secondary: #10b981;
  --secondary-dark: #059669;
  --secondary-light: #34d399;
  --accent: #8b5cf6;
  --accent-light: #a78bfa;
  --success: #22c55e;
  --success-light: #4caf50;
  --warning: #f59e0b;
  --warning-light: #ffb300;
  --danger: #ef4444;
  --danger-light: #f44336;
  --info: #06b6d4;
  --info-light: #29b6f6;
  --dark: #0f172a;
  --darker: #0d47a1;
  --light: #ffffff;
  --gray: #94a3b8;
  --gray-light: #cbd5e1;
  --gray-dark: #64748b;
  --border: rgba(255, 255, 255, 0.2);
  --shadow: rgba(0, 0, 0, 0.1);
  --blur: blur(20px);
}

/* === Main Container === */
.lab-dashboard {
  position: relative;
  min-height: 100vh;
  padding: 1.5rem;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  overflow-x: hidden;
  max-width: 100%;
}

/* Animation de fond */
.lab-dashboard::before {
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

.lab-dashboard > * {
  position: relative;
  z-index: 1;
}

/* === Animated Background === */
.background-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.floating-icon {
  position: absolute;
  color: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

/* === Dashboard Header === */
.dashboard-header {
  position: relative;
  z-index: 1;
  margin-bottom: 2.5rem;
  animation: slideDown 0.8s ease-out;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: var(--blur);
  border-radius: 20px;
  border: 1px solid var(--border);
  box-shadow: 0 20px 40px var(--shadow);
  transition: all 0.3s ease;
}

.header-content:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.welcome-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.welcome-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 20px;
  color: white;
  box-shadow: 0 10px 30px rgba(0, 168, 143, 0.3);
}

.welcome-text h1 {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.welcome-text p {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 168, 143, 0.3);
}

.refresh-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 168, 143, 0.4);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* === Stats Section === */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
  min-width: 0;
}

@media (max-width: 1200px) {
  .stats-section {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
}

.stat-card::before {
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

.stat-card:hover::before {
  transform: scaleX(1);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(16, 185, 129, 0.15));
  border-color: rgba(37, 99, 235, 0.4);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  color: white;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.stat-card.pending .stat-icon { background: linear-gradient(135deg, var(--warning), var(--warning-light)); }
.stat-card.progress .stat-icon { background: linear-gradient(135deg, var(--secondary), var(--secondary-light)); }
.stat-card.completed .stat-icon { background: linear-gradient(135deg, var(--success), var(--success-light)); }

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.stat-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  margin-bottom: 1rem;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}



/* === Main Content === */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  position: relative;
  z-index: 1;
  min-width: 0;
}

/* === Section Cards === */
.section-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  animation: fadeInUp 0.8s ease-out 0.2s both;
  overflow: hidden;
  position: relative;
}

.section-card::before {
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

.section-card:hover::before {
  transform: scaleX(1);
}

.section-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(16, 185, 129, 0.15));
  border-color: rgba(37, 99, 235, 0.4);
}

.section-card.in-progress::before {
  background: linear-gradient(90deg, #2563eb, #10b981);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  transition: all 0.3s ease;
}

.header-icon.progress {
  background: linear-gradient(135deg, var(--secondary), var(--secondary-light));
}

.header-icon.workflow {
  background: linear-gradient(135deg, var(--accent), var(--accent-light));
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.25rem;
}

.section-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

.badge-count {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0, 168, 143, 0.3);
}

.badge-count.blue {
  background: linear-gradient(135deg, var(--secondary), var(--secondary-light));
  box-shadow: 0 4px 15px rgba(3, 105, 161, 0.3);
}

/* === Requests List === */
.requests-list {
  padding: 1.5rem 2rem;
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.request-item {
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-width: 0;
}

.request-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, var(--primary), var(--secondary));
  transform: scaleY(0);
  transform-origin: top;
  transition: transform 0.4s ease;
  z-index: 1;
}

.request-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
  border-color: rgba(255, 255, 255, 0.3);
}

.request-item:hover::before {
  transform: scaleY(1);
}

.request-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}

.patient-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
  flex: 1;
}

.patient-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.patient-details {
  min-width: 0;
  flex: 1;
}

.patient-details h4 {
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.patient-details p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.patient-details small {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--secondary), var(--accent));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
}

.action-btn:hover:not(:disabled)::before {
  transform: scaleX(1);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* === Progress Table === */
.progress-table, .workflow-table {
  padding: 1.5rem 2rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.data-table th {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-weight: 600;
  text-align: left;
  padding: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.8rem;
  white-space: nowrap;
}

.data-table th.patient-cell { width: 25%; }
.data-table th.exam-cell { width: 20%; }
.data-table th.doctor-cell { width: 20%; }
.data-table th.time-cell { width: 15%; }
.data-table th.status-cell { width: 10%; }
.data-table th.action-cell { width: 10%; }

.table-row {
  transition: all 0.3s ease;
}

.table-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.data-table td {
  padding: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.8rem;
  vertical-align: middle;
}

.cell-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.in-progress {
  background: rgba(3, 105, 161, 0.2);
  color: var(--secondary-light);
  border: 1px solid rgba(3, 105, 161, 0.3);
}

.status-badge.pending {
  background: rgba(245, 158, 11, 0.2);
  color: var(--warning-light);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.status-badge.completed {
  background: rgba(46, 125, 50, 0.2);
  color: var(--success-light);
  border: 1px solid rgba(46, 125, 50, 0.3);
}

.table-action-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.table-action-btn::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
}

.table-action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.table-action-btn:hover::before {
  transform: scaleX(1);
}

.table-action-btn.success {
  background: rgba(46, 125, 50, 0.2);
  border-color: rgba(46, 125, 50, 0.3);
  color: var(--success-light);
}

.table-action-btn.success::before {
  background: linear-gradient(90deg, var(--success), var(--success-light));
}

/* === Empty States === */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.empty-icon {
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 1rem;
}

.empty-state h4 {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

/* === Animations === */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

/* === Responsive Design === */
@media (max-width: 768px) {
  .lab-dashboard {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1.5rem;
    padding: 1rem;
  }
  
  .welcome-section {
    flex-direction: column;
    text-align: center;
  }
  
  .stats-section {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .main-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .request-content {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
  
  .data-table {
    font-size: 0.75rem;
  }
  
  .data-table th,
  .data-table td {
    padding: 0.5rem;
  }
  
  .patient-details h4 {
    font-size: 0.85rem;
  }
  
  .patient-details p {
    font-size: 0.75rem;
  }
  
  .patient-details small {
    font-size: 0.7rem;
  }
}
</style>