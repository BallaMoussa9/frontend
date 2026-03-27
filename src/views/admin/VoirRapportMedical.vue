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
          <header class="dashboard-header no-print">
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
                      Rapport Médical
                    </h1>
                  </div>
                  <p class="dashboard-subtitle" v-if="store.currentReport">
                    Du {{ formatDate(store.currentReport.created_at) }} • Référence #RP-{{ store.currentReport.id }}
                  </p>
                </div>
              </div>
              <div class="header-actions">
                <button class="action-btn secondary no-print" @click="handlePrint">
                  <Printer :size="16" />
                  Imprimer
                </button>
                <button class="action-btn secondary no-print" @click="handleDownload" v-if="store.currentReport?.file_path">
                  <Download :size="16" />
                  PDF
                </button>
              </div>
            </div>
          </header>

          <!-- Loading State -->
          <div v-if="store.isLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Chargement du rapport...</p>
          </div>
          
          <!-- Report Content -->
          <div class="report-section" v-else-if="store.currentReport">
            <!-- Patient & Doctor Info -->
            <div class="info-cards">
              <div class="info-card">
                <div class="card-header">
                  <User :size="20" />
                  <h3>Informations Patient</h3>
                </div>
                <div class="card-content">
                  <div class="patient-avatar">
                    {{ getPatientInitials(store.currentReport.patient) }}
                  </div>
                  <div class="patient-details">
                    <h4>{{ store.currentReport.patient?.user?.first_name }} {{ store.currentReport.patient?.user?.last_name }}</h4>
                    <p>Date de naissance: {{ store.currentReport.patient?.user?.birth_date || 'N/A' }}</p>
                    <p>ID Patient: #{{ store.currentReport.patient_id }}</p>
                  </div>
                </div>
              </div>

              <div class="info-card">
                <div class="card-header">
                  <Activity :size="20" />
                  <h3>Informations Médecin</h3>
                </div>
                <div class="card-content">
                  <div class="doctor-avatar">
                    Dr.
                  </div>
                  <div class="doctor-details">
                    <h4>Dr. {{ store.currentReport.doctor?.user?.first_name }} {{ store.currentReport.doctor?.user?.last_name }}</h4>
                    <p>Spécialité: {{ store.currentReport.report_type }}</p>
                    <p>ID Médecin: #{{ store.currentReport.doctor_id }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Report Details -->
            <div class="report-content-section printable-content" id="report-to-print">
              <!-- Document Header -->
              <div class="document-header">
                <div class="clinic-info">
                  <h1>CENTRE MÉDICAL SanTeKo</h1>
                  <p>Service de {{ store.currentReport.report_type }}</p>
                </div>
                <div class="doc-meta">
                  <p><strong>Date:</strong> {{ formatDate(store.currentReport.created_at) }}</p>
                  <p><strong>Réf:</strong> #RP-{{ store.currentReport.id }}</p>
                </div>
              </div>

              <div class="separator"></div>

              <!-- Patient & Doctor Grid -->
              <div class="patient-doctor-grid">
                <div class="info-block">
                  <label>PATIENT</label>
                  <p class="val-large">{{ store.currentReport.patient?.user?.first_name }} {{ store.currentReport.patient?.user?.last_name }}</p>
                  <p>Né(e) le : {{ store.currentReport.patient?.user?.birth_date || 'N/A' }}</p>
                </div>
                <div class="info-block text-right">
                  <label>MÉDECIN RÉFÉRENT</label>
                  <p class="val-large">Dr. {{ store.currentReport.doctor?.user?.first_name }} {{ store.currentReport.doctor?.user?.last_name }}</p>
                  <p>Spécialité : {{ store.currentReport.report_type }}</p>
                </div>
              </div>

              <!-- Report Body -->
              <div class="report-body">
                <h3 class="report-title">{{ store.currentReport.title }}</h3>
                <label>COMPTE-RENDU / OBSERVATIONS</label>
                <div class="text-content">
                  {{ store.currentReport.content }}
                </div>
              </div>

              <!-- Document Footer -->
              <div class="document-footer">
                <div class="signature-space">
                  <p>Signature et cachet du médecin</p>
                  <div class="signature-line"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state">
            <div class="empty-icon">
              <FileText :size="48" />
            </div>
            <p>Aucun rapport trouvé</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMedicalReportStore } from '@/stores/medicalreportStore'
import { 
  BarChart3, 
  Users, 
  Activity, 
  MessageSquare, 
  Clock,
  TrendingUp,
  FileText,
  ArrowLeft,
  Eye,
  User,
  Printer,
  Download
} from 'lucide-vue-next';

const route = useRoute()
const router = useRouter()
const store = useMedicalReportStore()
const isSidebarOpen = ref(false)

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

// Fonctions utilitaires
const getPatientInitials = (patient) => {
  if (!patient?.user?.first_name || !patient?.user?.last_name) return 'N/A'
  return `${patient.user.first_name.charAt(0)}${patient.user.last_name.charAt(0)}`.toUpperCase()
}

onMounted(async () => {
  const reportId = route.params.id
  if (reportId) await store.fetchMedicalReportById(reportId)
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

const handlePrint = () => {
  window.print() // Lance la boîte de dialogue d'impression du navigateur
}

const handleDownload = async () => {
  try {
    await store.downloadMedicalReport(store.currentReport.id)
  } catch (err) {
    alert("Erreur de téléchargement")
  }
}
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
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
}

.empty-icon {
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 1rem;
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

/* === Report Section === */
.report-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* === Info Cards === */
.info-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.info-card::before {
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

.info-card:hover::before {
  transform: scaleX(1);
}

.info-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(37, 99, 235, 0.4);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 2;
}

.card-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.card-header svg {
  color: var(--primary);
  flex-shrink: 0;
}

.card-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  z-index: 2;
}

.patient-avatar, .doctor-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.doctor-avatar {
  background: linear-gradient(135deg, #10b981, #2563eb);
  font-size: 0.7rem;
}

.patient-details, .doctor-details {
  flex: 1;
}

.patient-details h4, .doctor-details h4 {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.5rem 0;
}

.patient-details p, .doctor-details p {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0.25rem 0;
}

/* === Report Content Section === */
.report-content-section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 2rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.report-content-section::before {
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

.report-content-section:hover::before {
  transform: scaleX(1);
}

.report-content-section:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(37, 99, 235, 0.4);
}

/* === Printable Content === */
.printable-content {
  background: white;
  padding: 3rem;
  border-radius: 12px;
  min-height: 600px;
  color: #1a1a1a;
  position: relative;
  z-index: 2;
}

.document-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #333;
}

.clinic-info h1 {
  margin: 0;
  color: #2563eb;
  font-size: 1.5rem;
  font-weight: 700;
}

.clinic-info p {
  margin: 0.5rem 0 0 0;
  color: #666;
  font-size: 1rem;
}

.doc-meta {
  text-align: right;
  font-size: 0.9rem;
  color: #666;
}

.doc-meta p {
  margin: 0.25rem 0;
}

.separator {
  border: 0;
  border-top: 2px solid #333;
  margin: 2rem 0;
}

.patient-doctor-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

.info-block label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #666;
  display: block;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.val-large {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #1a1a1a;
}

.info-block p {
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
}

.text-right {
  text-align: right;
}

.report-title {
  text-align: center;
  text-decoration: underline;
  margin-bottom: 2rem;
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a1a1a;
}

.report-body label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #666;
  display: block;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.text-content {
  margin-top: 1rem;
  line-height: 1.6;
  white-space: pre-wrap;
  font-size: 1rem;
  text-align: justify;
  color: #333;
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid var(--primary);
}

.document-footer {
  margin-top: 4rem;
  display: flex;
  justify-content: flex-end;
}

.signature-space {
  width: 200px;
  text-align: center;
}

.signature-space p {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 2rem;
}

.signature-line {
  border-top: 1px solid #000;
  margin-top: 2rem;
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
  min-width: 120px;
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

/* === Print Styles === */
@media print {
  .no-print {
    display: none !important;
  }

  .admin-page-container {
    background: white;
  }

  .dashboard-admin {
    padding: 0;
    background: white;
  }

  .report-section {
    background: white;
  }

  .info-cards {
    display: none;
  }

  .report-content-section {
    background: white;
    border: none;
    padding: 0;
    box-shadow: none;
    backdrop-filter: none;
  }

  .printable-content {
    background: white;
    padding: 0;
    margin: 0;
    border: none;
    box-shadow: none;
    border-radius: 0;
  }

  body {
    background: white;
    color: #1a1a1a;
  }

  @page {
    margin: 2cm;
  }
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
  
  .info-cards {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .card-content {
    flex-direction: column;
    text-align: center;
  }
  
  .report-content-section {
    padding: 1rem;
  }
  
  .printable-content {
    padding: 1.5rem;
  }
  
  .patient-doctor-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .document-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .doc-meta {
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