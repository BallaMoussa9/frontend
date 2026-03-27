<template>
  <div class="demande-analyse-container">
    <!-- Animated Background -->
    <div class="background-animation">
      <div class="floating-icon" style="top: 10%; left: 5%; animation-delay: 0s;">
        <Activity :size="30" />
      </div>
      <div class="floating-icon" style="top: 20%; right: 10%; animation-delay: 2s;">
        <Search :size="25" />
      </div>
      <div class="floating-icon" style="bottom: 30%; left: 8%; animation-delay: 4s;">
        <AlertTriangle :size="28" />
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
            <Activity :size="40" />
          </div>
          <div class="welcome-text">
            <h1 class="dashboard-title">
              🔬 Demandes d'Analyse
            </h1>
            <p class="dashboard-subtitle">
              <Search :size="16" />
              Gérez les demandes d'analyse en attente
            </p>
          </div>
        </div>
        <button class="refresh-btn">
          <RefreshCw :size="20" />
          Actualiser
        </button>
      </div>
    </header>

    <!-- Stats Grid -->
    <section class="stats-section">
      <div class="stat-card total">
        <div class="stat-icon">
          <Activity :size="24" />
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ analysisRequests.length }}</h3>
          <p class="stat-label">Total Demandes</p>
          <div class="stat-trend">
            <TrendingUp :size="16" />
            <span>Toutes demandes</span>
          </div>
        </div>
      </div>

      <div class="stat-card urgent">
        <div class="stat-icon">
          <AlertTriangle :size="24" />
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ getHighPriorityCount() }}</h3>
          <p class="stat-label">Priorité Haute</p>
          <div class="stat-trend">
            <Zap :size="16" />
            <span>Urgent</span>
          </div>
        </div>
      </div>

      <div class="stat-card normal">
        <div class="stat-icon">
          <Clock :size="24" />
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ getNormalPriorityCount() }}</h3>
          <p class="stat-label">Priorité Normale</p>
          <div class="stat-trend">
            <Clock :size="16" />
            <span>Standard</span>
          </div>
        </div>
      </div>

      <div class="stat-card low">
        <div class="stat-icon">
          <CheckCircle :size="24" />
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ getLowPriorityCount() }}</h3>
          <p class="stat-label">Priorité Basse</p>
          <div class="stat-trend">
            <Award :size="16" />
            <span>Facile</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Search Section -->
    <section class="search-section">
      <div class="section-card">
        <div class="card-header">
          <div class="header-left">
            <div class="header-icon">
              <Search :size="20" />
            </div>
            <div>
              <h2 class="section-title">Recherche</h2>
              <p class="section-subtitle">Filtrer les demandes</p>
            </div>
          </div>
        </div>
        <div class="search-container">
          <div class="search-input-wrapper">
            <Search :size="20" class="search-icon" />
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Rechercher patient, analyse, médecin..."
              class="search-input"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content Grid -->
    <main class="main-content">
      <!-- Requests List -->
      <section class="requests-section">
        <div class="section-card">
          <div class="card-header">
            <div class="header-left">
              <div class="header-icon">
                <FileText :size="20" />
              </div>
              <div>
                <h2 class="section-title">Liste des Demandes</h2>
                <p class="section-subtitle">{{ filteredRequests.length }} demandes trouvées</p>
              </div>
            </div>
            <div class="header-right">
              <span class="badge-count">{{ filteredRequests.length }}</span>
            </div>
          </div>

          <div class="requests-list">
            <div v-if="filteredRequests.length > 0" class="list-container">
              <div 
                v-for="request in filteredRequests" 
                :key="request.id" 
                class="request-item"
                :class="[getPriorityClass(request.priority)]"
              >
                <div class="request-content">
                  <div class="request-info">
                    <div class="request-avatar">
                      <Users :size="20" />
                    </div>
                    <div class="request-details">
                      <h4>{{ request.patient }}</h4>
                      <p>{{ request.test }}</p>
                      <small>Demandé par: {{ request.doctor }}</small>
                    </div>
                  </div>
                  <div class="request-meta">
                    <span class="priority-badge" :class="[getPriorityClass(request.priority)]">
                      {{ request.priority }}
                    </span>
                    <span class="request-date">{{ request.date }}</span>
                  </div>
                </div>
                <div class="request-actions">
                  <button class="action-btn primary">
                    <ChevronRight :size="16" />
                    Traiter
                  </button>
                </div>
              </div>
            </div>
            
            <div v-else class="empty-state">
              <div class="empty-icon">
                <Search :size="48" />
              </div>
              <h4>Aucune demande trouvée</h4>
              <p>Aucune demande ne correspond à votre recherche.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
                <th>Description</th>
                <th>Date</th>
                <th>Médecin</th>
                <th>Service</th>
                <th>Priorité</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="request in filteredRequests" :key="request.id" class="request-row">
                <td>
                  <div class="patient-cell">
                    <div class="patient-avatar">{{ getInitials(request.patient) }}</div>
                    <span class="patient-name">{{ request.patient }}</span>
                  </div>
                </td>
                <td>
                  <div class="analysis-cell">
                    <strong>{{ request.test }}</strong>
                  </div>
                </td>
                <td>
                  <div class="description-cell">{{ request.description }}</div>
                </td>
                <td>
                  <div class="date-cell">{{ request.date }}</div>
                </td>
                <td>
                  <div class="doctor-cell">{{ request.doctor }}</div>
                </td>
                <td>
                  <div class="service-cell">{{ request.service }}</div>
                </td>
                <td>
                  <span :class="['priority-badge', getPriorityClass(request.priority)]">
                    {{ request.priority }}
                  </span>
                </td>
                <td>
                  <div class="actions-cell">
                    <button class="action-btn process-btn" @click="processRequest(request)">
                      <Play :size="16" />
                      Traiter
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </LabLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import LabLayout from '@/layouts/LabLayout.vue'
import {
  Activity, AlertTriangle, Clock, CheckCircle, Search, RefreshCw, Play,
  TrendingUp, Zap, Award, Users, FileText, ChevronRight
} from 'lucide-vue-next'

const searchTerm = ref('')

const analysisRequests = [
  {
    id: 1,
    patient: 'Fatou T.',
    test: 'Hémogramme complet',
    description: 'Fatigue persistante, suspicion d\'anémie',
    date: '09/07/2025 10:30',
    doctor: 'Dr Konaté',
    service: 'Médecine générale - Hôpital Gabriel Touré',
    priority: 'Haute',
  },
  {
    id: 2,
    patient: 'Moussa K.',
    test: 'Glycémie à jeun',
    description: 'Surveillance diabète type 2',
    date: '09/07/2025 11:15',
    doctor: 'Dr Sidibé',
    service: 'Endocrinologie - Hôpital du Point G',
    priority: 'Normale',
  },
  {
    id: 3,
    patient: 'Aminata D.',
    test: 'TSH',
    description: 'Troubles hormonaux – fatigue, frilosité',
    date: '09/07/2025 13:00',
    doctor: 'Dr Keïta',
    service: 'Gynécologie - CHU Bamako',
    priority: 'Basse',
  },
]

// Computed properties
const filteredRequests = computed(() => {
  if (!searchTerm.value) return analysisRequests
  
  const query = searchTerm.value.toLowerCase()
  return analysisRequests.filter(request =>
    request.patient.toLowerCase().includes(query) ||
    request.test.toLowerCase().includes(query) ||
    request.doctor.toLowerCase().includes(query) ||
    request.description.toLowerCase().includes(query)
  )
})

// Methods
const getHighPriorityCount = () => {
  return analysisRequests.filter(req => req.priority === 'Haute').length
}

const getNormalPriorityCount = () => {
  return analysisRequests.filter(req => req.priority === 'Normale').length
}

const getLowPriorityCount = () => {
  return analysisRequests.filter(req => req.priority === 'Basse').length
}

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const getPriorityClass = (priority) => {
  switch (priority) {
    case 'Haute':
      return 'high'
    case 'Normale':
      return 'normal'
    case 'Basse':
      return 'low'
    default:
      return 'normal'
  }
}

const processRequest = (request) => {
  console.log('Traitement de la demande:', request)
  // TODO: Implémenter la logique de traitement
}
</script>

<style scoped>
/* === Variables CSS - Glassmorphism Admin === */
:root {
  --primary: #3b82f6;
  --primary-dark: #2563eb;
  --primary-light: #60a5fa;
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
  --dark: #1a237e;
  --darker: #0d47a1;
  --light: #ffffff;
  --gray: #90a4ae;
  --gray-light: #b0bec5;
  --gray-dark: #607d8b;
  --border: rgba(255, 255, 255, 0.2);
  --shadow: rgba(0, 0, 0, 0.1);
  --blur: blur(20px);
}

/* === Main Container === */
.demande-analyse-container {
  position: relative;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #3b82f6 50%, #10b981 75%, #8b5cf6 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  overflow-x: hidden;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
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
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
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
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.refresh-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
}

/* === Stats Section === */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  position: relative;
  z-index: 1;
}

.stat-card {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: var(--blur);
  border-radius: 20px;
  border: 1px solid var(--border);
  box-shadow: 0 15px 35px var(--shadow);
  transition: all 0.3s ease;
  animation: fadeInUp 0.8s ease-out;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 20px 40px var(--shadow);
}

.stat-card:hover::before {
  transform: scaleX(1);
}

.stat-card.total::before { background: linear-gradient(90deg, var(--primary), var(--primary-light)); }
.stat-card.urgent::before { background: linear-gradient(90deg, var(--danger), var(--danger-light)); }
.stat-card.normal::before { background: linear-gradient(90deg, var(--warning), var(--warning-light)); }
.stat-card.low::before { background: linear-gradient(90deg, var(--success), var(--success-light)); }

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  color: white;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.stat-card.total .stat-icon { background: linear-gradient(135deg, var(--primary), var(--primary-light)); }
.stat-card.urgent .stat-icon { background: linear-gradient(135deg, var(--danger), var(--danger-light)); }
.stat-card.normal .stat-icon { background: linear-gradient(135deg, var(--warning), var(--warning-light)); }
.stat-card.low .stat-icon { background: linear-gradient(135deg, var(--success), var(--success-light)); }

.stat-content {
  flex: 1;
}

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

/* === Search Section === */
.search-section {
  margin-bottom: 2.5rem;
  position: relative;
  z-index: 1;
}

.section-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: var(--blur);
  border-radius: 20px;
  border: 1px solid var(--border);
  box-shadow: 0 20px 40px var(--shadow);
  transition: all 0.3s ease;
  animation: fadeInUp 0.8s ease-out 0.2s both;
  overflow: hidden;
}

.section-card:hover {
  transform: translateY(-3px);
  border-color: rgba(255, 255, 255, 0.3);
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

.search-container {
  padding: 1.5rem 2rem;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-icon {
  color: rgba(255, 255, 255, 0.6);
  position: absolute;
  left: 1rem;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  background: rgba(255, 255, 255, 0.15);
}

/* === Main Content === */
.main-content {
  position: relative;
  z-index: 1;
}

/* === Requests Section === */
.requests-section {
  margin-bottom: 2.5rem;
}

.requests-list {
  padding: 1.5rem 2rem;
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.request-item {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.request-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

.request-item.high {
  border-left: 4px solid var(--danger);
}

.request-item.normal {
  border-left: 4px solid var(--warning);
}

.request-item.low {
  border-left: 4px solid var(--success);
}

.request-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.request-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.request-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.request-details h4 {
  color: white;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.request-details p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.request-details small {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
}

.request-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.priority-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.priority-badge.high {
  background: rgba(239, 68, 68, 0.2);
  color: var(--danger-light);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.priority-badge.normal {
  background: rgba(245, 158, 11, 0.2);
  color: var(--warning-light);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.priority-badge.low {
  background: rgba(34, 197, 94, 0.2);
  color: var(--success-light);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.request-date {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
}

.request-actions {
  display: flex;
  gap: 0.5rem;
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
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

/* === Badge Count === */
.badge-count {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
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
  .demande-analyse-container {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
  }
  
  .welcome-section {
    flex-direction: column;
    text-align: center;
  }
  
  .stats-section {
    grid-template-columns: 1fr;
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
}
</style>
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
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
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.stat-card.urgent {
  border-left: 4px solid var(--danger);
}

.stat-card.normal {
  border-left: 4px solid var(--warning);
}

.stat-card.low {
  border-left: 4px solid var(--success);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
}

.stat-icon.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

/* Search Section */
.search-section {
  margin-bottom: 2rem;
}

.search-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-size: 1rem;
  outline: none;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

/* Requests Section */
.requests-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.requests-count {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.6);
}

.empty-icon {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h4 {
  color: white;
  margin-bottom: 0.5rem;
}

/* Table Styles */
.requests-table-container {
  overflow-x: auto;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
}

.requests-table {
  width: 100%;
  border-collapse: collapse;
}

.requests-table th {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-weight: 600;
  text-align: left;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.requests-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: white;
}

.request-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Cell Styles */
.patient-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.patient-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
}

.patient-name {
  font-weight: 500;
}

.analysis-cell strong {
  color: #a5b4fc;
}

.description-cell {
  max-width: 200px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.date-cell {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.doctor-cell {
  color: #a5b4fc;
  font-weight: 500;
}

.service-cell {
  max-width: 150px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

/* Priority Badges */
.priority-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-badge.high {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.3) 100%);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.priority-badge.normal {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.3) 100%);
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.priority-badge.low {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.3) 100%);
  color: #86efac;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

/* Action Buttons */
.process-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, var(--secondary) 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.process-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .requests-table {
    font-size: 0.8rem;
  }
  
  .requests-table th,
  .requests-table td {
    padding: 0.5rem;
  }
  
  .service-cell,
  .description-cell {
    max-width: 100px;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .process-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
  }
}
</style>
