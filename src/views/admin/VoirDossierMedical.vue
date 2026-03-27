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
          <RouterLink :to="{name:'AdminDashboard'}" class="menu-item" @click="closeSidebar">
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
              <div class="title-section">
                <div class="title-content">
                  <div class="title-with-back">
                    <button class="back-btn" @click="goBack">
                      <ArrowLeft :size="20" />
                    </button>
                    <h1 class="dashboard-title">
                      <span class="title-icon">
                        <Eye :size="24" />
                      </span>
                      Dossier de {{ patientFullName }}
                    </h1>
                  </div>
                  <p class="dashboard-subtitle">
                    Patient ID: #{{ currentPatient?.id }}
                  </p>
                </div>
              </div>
              <div class="header-actions">
                <button class="action-btn secondary" @click="handlePrint">
                  <Printer :size="16" />
                  Imprimer
                </button>
              </div>
            </div>
          </header>

          <!-- Loading State -->
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Chargement du dossier...</p>
          </div>

          <!-- Dossier Content -->
          <div v-else class="dossier-content">
            <!-- Patient Information -->
            <div class="info-section">
              <h3 class="section-title">
                <User :size="20" />
                Informations du Patient
              </h3>
              
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Sexe</div>
                  <div class="info-value">{{ currentPatient?.genre || 'N/A' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Groupe sanguin</div>
                  <div class="info-value blood-type">{{ currentPatient?.group_sanguine || 'N/A' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Poids</div>
                  <div class="info-value">{{ currentPatient?.poids ? currentPatient.poids + ' kg' : 'N/A' }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Maladies Chroniques</div>
                  <div class="info-value">{{ currentPatient?.maladies_chroniques || 'Aucune' }}</div>
                </div>
              </div>
            </div>

            <!-- Prescriptions Section -->
            <div class="medical-section">
              <h3 class="section-title">
                <FileText :size="20" />
                Ordonnances
              </h3>
              
              <div v-if="!safePrescriptions.length" class="empty-state">
                <div class="empty-icon">
                  <FileText :size="48" />
                </div>
                <p>Aucune ordonnance trouvée</p>
              </div>

              <div v-else class="prescription-grid">
                <div v-for="rx in safePrescriptions" :key="rx.id" class="rx-card">
                  <div class="rx-header">
                    <div class="rx-date">
                      <Calendar :size="16" />
                      {{ formatDate(rx.date_prescription) }}
                    </div>
                    <span :class="['status-badge', getStatusClass(rx.status)]">
                      {{ getStatusText(rx.status) }}
                    </span>
                  </div>

                  <div class="rx-body">
                    <div class="doctor-info">
                      <User :size="16" />
                      Prescrit par <strong>Dr. {{ rx.doctor?.user?.first_name }} {{ rx.doctor?.user?.last_name }}</strong>
                    </div>
                    
                    <div v-for="line in rx.lines" :key="line.id" class="med-card">
                      <div class="med-header">
                        <div class="med-name">
                          <Pill :size="16" />
                          <strong>{{ line.medication_name }}</strong>
                        </div>
                        <span class="med-badge">{{ line.dosage }}</span>
                      </div>
                      <div class="med-details">
                        <div class="med-detail">
                          <Clock :size="14" />
                          <strong>Fréquence:</strong> {{ line.frequency }} fois/jour
                        </div>
                        <div class="med-detail">
                          <Calendar :size="14" />
                          <strong>Durée:</strong> {{ line.duration }} jours
                        </div>
                        <div class="med-detail instruction">
                          <MessageSquare :size="14" />
                          <em>Instruction: {{ line.instructions }}</em>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Lab Analysis Section -->
            <div class="medical-section">
              <h3 class="section-title">
                <Activity :size="20" />
                Analyses de Laboratoire
              </h3>
              
              <div v-if="!safeLabRequests.length" class="empty-state">
                <div class="empty-icon">
                  <Activity :size="48" />
                </div>
                <p>Aucune analyse enregistrée</p>
              </div>

              <div v-else class="analysis-grid">
                <div v-for="analysis in safeLabRequests" :key="analysis.id" class="analysis-card">
                  <div class="analysis-header">
                    <div class="analysis-name">
                      <Activity :size="16" />
                      <strong>{{ analysis.name }}</strong>
                    </div>
                    <span :class="['status-badge', getStatusClass(analysis.status)]">
                      {{ getStatusText(analysis.status) }}
                    </span>
                  </div>
                  
                  <div class="analysis-body">
                    <div v-if="analysis.resultats && analysis.resultats.length > 0">
                      <div v-for="res in analysis.resultats" :key="res.id" class="result-item">
                        <div class="result-info">
                          <MessageSquare :size="14" />
                          <p><strong>Commentaires:</strong> {{ res.comments || 'Pas de commentaire' }}</p>
                        </div>
                        <a :href="'https://santeko.abdatytch.com/storage/' + res.result_file" 
                           target="_blank" 
                           class="download-btn">
                          <Download :size="16" />
                          Télécharger le résultat
                        </a>
                      </div>
                    </div>
                    <div v-else class="pending-state">
                      <AlertTriangle :size="16" />
                      <p>En attente des résultats du laboratoire</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { usePatientStore } from '@/stores/patientStore'
import { usePrescriptionStore } from '@/stores/prescriptionStore'
import { useLabStore } from '@/stores/labStore'
import { useConsultationStore } from '@/stores/consultationStore'
import { 
  BarChart3, 
  Users, 
  Activity, 
  MessageSquare, 
  Clock,
  TrendingUp,
  FileText,
  ArrowLeft,
  User,
  Eye,
  Printer,
  Calendar,
  Pill,
  Download,
  AlertTriangle
} from 'lucide-vue-next';

const route = useRoute()
const router = useRouter()

// Variables pour le design moderne
const isSidebarOpen = ref(false)

// Initialisation des stores
const patientStore = usePatientStore()
const prescriptionStore = usePrescriptionStore()
const labStore = useLabStore()
const consultationStore = useConsultationStore()

// Fonctions sidebar
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  if (window.innerWidth <= 1024) {
    isSidebarOpen.value = false
  }
}

const goBack = () => {
  window.history.back()
}

// Fonctions pour les statuts
const getStatusClass = (status) => {
  switch (status) {
    case 'completed':
    case 'terminé':
      return 'status-success'
    case 'pending':
    case 'en_attente':
      return 'status-warning'
    case 'cancelled':
    case 'annulé':
      return 'status-danger'
    default:
      return 'status-pending'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'completed':
    case 'terminé':
      return 'Terminé'
    case 'pending':
    case 'en_attente':
      return 'En attente'
    case 'cancelled':
    case 'annulé':
      return 'Annulé'
    default:
      return status || 'Inconnu'
  }
}

// Récupération de la réactivité
const { currentPatient, loading: isPatientLoading } = storeToRefs(patientStore)

// Sécurisation des données calculées
const safePrescriptions = computed(() => prescriptionStore.prescriptions || [])
const safeLabRequests = computed(() => labStore.labRequests || [])
const safeConsultations = computed(() => consultationStore.patientConsultations || [])

const loading = computed(() => 
  isPatientLoading.value || prescriptionStore.loading || labStore.loading || consultationStore.loading
)

const patientFullName = computed(() => {
  if (!currentPatient.value?.user) return 'Chargement...'
  return `${currentPatient.value.user.first_name} ${currentPatient.value.user.last_name}`
})

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// FONCTION DE CHARGEMENT CORRIGÉE
const loadData = async (id) => {
  console.log(`🚀 Début du chargement complet pour le patient #${id}`);
  try {
    await Promise.all([
      patientStore.onePatient(id), // Correction ici : fetchPatientById -> onePatient
      prescriptionStore.fetchPatientPrescriptions(id),
      labStore.listLabRequests({ patient_id: id }),
      consultationStore.fetchPatientConsultations(id)
    ]);
    
    // Log spécial pour déboguer le laboratoire
    console.log("🔬 Données Analyses reçues:", labStore.labRequests);
  } catch (err) {
    console.error("❌ Erreur lors de la récupération des données:", err);
  }
}

// Surveillance de l'ID dans l'URL
watch(() => route.params.id, (newId) => {
  if (newId) loadData(parseInt(newId))
}, { immediate: true })

const handlePrint = () => window.print()
</script>

<style scoped>
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

/* Animation de fond */
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

/* === Sidebar === */
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

/* Mobile Toggle */
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

/* Main Content */
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
  min-height: 100%;
  background: transparent;
  color: white;
  box-sizing: border-box;
  position: relative;
  overflow-x: hidden;
}

/* Sidebar Overlay */
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

/* === Header === */
.dashboard-header {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
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
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(37, 99, 235, 0.3);
  transform: translateY(-2px);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  position: relative;
  z-index: 2;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.title-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.dashboard-title {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dashboard-subtitle {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
  flex-wrap: wrap;
  align-self: flex-start;
  margin-top: 0.5rem;
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

/* === Back Button === */
.title-with-back {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(37, 99, 235, 0.4);
  transform: translateY(-2px);
}

.back-btn svg {
  transition: transform 0.3s ease;
}

.back-btn:hover svg {
  transform: translateX(-2px);
}

/* === States === */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* === Dossier Content === */
.dossier-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* === Sections === */
.info-section, .medical-section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 2rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.info-section::before, .medical-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
  z-index: 1;
}

.info-section:hover::before, .medical-section:hover::before {
  transform: scaleX(1);
}

.info-section:hover, .medical-section:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(37, 99, 235, 0.4);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 2;
}

.section-title svg {
  color: var(--primary);
  flex-shrink: 0;
}

/* === Info Grid === */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  position: relative;
  z-index: 2;
}

.info-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.info-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}

.info-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.info-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
}

.info-value.blood-type {
  color: #ef4444;
}

/* === Empty States === */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  position: relative;
  z-index: 2;
}

.empty-icon {
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 1rem;
}

.empty-state p {
  margin: 0;
  font-weight: 500;
}

/* === Prescription Grid === */
.prescription-grid, .analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  position: relative;
  z-index: 2;
}

.rx-card, .analysis-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.rx-card:hover, .analysis-card:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.rx-header, .analysis-header {
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.rx-date, .analysis-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: white;
  font-size: 0.9rem;
}

.rx-body, .analysis-body {
  padding: 1.5rem;
}

.doctor-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.med-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.med-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.med-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: white;
}

.med-badge {
  background: rgba(37, 99, 235, 0.2);
  color: #3b82f6;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.med-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.med-detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
}

.med-detail.instruction {
  font-style: italic;
  color: rgba(255, 255, 255, 0.6);
}

/* === Status Badges === */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-success {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-warning {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.status-danger {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-pending {
  background: rgba(107, 114, 128, 0.2);
  color: #6b7280;
  border: 1px solid rgba(107, 114, 128, 0.3);
}

/* === Results === */
.result-item {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.result-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.download-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(37, 99, 235, 0.2);
  color: #3b82f6;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.download-btn:hover {
  background: rgba(37, 99, 235, 0.3);
  transform: translateY(-2px);
}

.pending-state {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(245, 158, 11, 0.8);
  font-size: 0.9rem;
}

/* === Action Buttons === */
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 140px;
  min-height: 44px;
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

/* === Responsive Design === */
@media (max-width: 1024px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    transform: translateX(-100%);
    z-index: 1000;
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
  
  .mobile-toggle {
    display: block;
  }
}

@media (max-width: 768px) {
  .dashboard-admin {
    padding: 1rem;
  }
  
  .dashboard-header {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .title-section {
    flex-direction: column;
    text-align: center;
  }
  
  .dashboard-title {
    font-size: 1.4rem;
  }
  
  .info-section, .medical-section {
    padding: 1.5rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .prescription-grid, .analysis-grid {
    grid-template-columns: 1fr;
  }
  
  .rx-header, .analysis-header {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}

/* === Variables === */
:root {
  --primary: #2563eb;
  --secondary: #10b981;
  --light: #f8fafc;
  --dark: #0f172a;
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
</style>