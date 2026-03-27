<template>
  <div class="admin-page-container">
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside :class="['sidebar', { 'open': isSidebarOpen }]">
        <div class="sidebar-header">
          <div class="logo-icon">U</div>
          <div class="logo-text">SanTeKo <span>Urgentiste</span></div>
        </div>

        <nav class="menu">
          <RouterLink :to="{name:'UrgentisteDashboard', params: { id: routeUrgentistId }}" class="menu-item" @click="closeSidebar">
            <BarChart3 :size="20" class="menu-icon" /> Dashboard
          </RouterLink>
          
          <div class="menu-divider">Gestion des Urgences</div>
          
          <RouterLink :to="{name:'UrgentisteHistorique', params: { id: routeUrgentistId }}" class="menu-item" @click="closeSidebar">
            <Clock :size="20" class="menu-icon" /> Historique
          </RouterLink>

          <div class="menu-divider">Communication</div>

          <RouterLink :to="{name:'UrgentisteProfile', params: { id: routeUrgentistId }}" class="menu-item" @click="closeSidebar">
            <User :size="20" class="menu-icon" /> Mon Profil
          </RouterLink>

          <div class="menu-divider">Système</div>

          <button @click="handleLogout" class="menu-item logout-btn">
            <XCircle :size="20" class="menu-icon" /> Déconnexion
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
            <div class="header-left">
              <button @click="goBack" class="back-btn">
                <ArrowLeft :size="20" />
                
              </button>
              <div class="header-content">
                <h1 class="dashboard-title">Détails Intervention SOS #{{ alert?.id }}</h1>
                <p class="dashboard-subtitle">Gestion détaillée de l'urgence médicale</p>
              </div>
            </div>
            <div :class="['status-badge', formatStatusClass(alert?.status)]">
              {{ formatStatusDisplay(alert?.status) }}
            </div>
          </header>

          <div v-if="!isValidId" class="error-message">
            <AlertTriangle :size="24" />
            <div>
              <strong>ERREUR CRITIQUE :</strong> L'ID de l'alerte ou de l'urgentiste est manquant dans l'URL.
              <p>Veuillez vérifier l'URL.</p>
            </div>
          </div>

          <div v-else-if="store.loading && !alert" class="loading-state">
            <div class="loading-spinner">
              <RefreshCw :size="24" class="spinning" />
            </div>
            <p>Chargement des détails de l'alerte #{{ routeAlertId }}...</p>
          </div>

          <div v-else-if="store.error" class="error-state">
            <XCircle :size="24" />
            <p>Erreur de chargement : {{ store.error }}</p>
          </div>
          
          <div v-else-if="alert">
            <div class="content-grid">
              <!-- Patient Details Card -->
              <section class="patient-section">
                <div class="section-header">
                  <div class="section-title">
                    <div class="title-icon">
                      <User :size="20" />
                    </div>
                    <div>
                      <h2>Informations Patient</h2>
                      <p>Détails complets du patient</p>
                    </div>
                  </div>
                </div>

                <div class="patient-card">
                  <div class="patient-header">
                    <div class="patient-avatar">
                      <User :size="32" />
                    </div>
                    <div class="patient-info">
                      <h3>{{ patientName }}</h3>
                      <span class="patient-id">ID: {{ patientId }}</span>
                      <span class="patient-age">{{ patientAge }} ans</span>
                    </div>
                  </div>

                  <div class="patient-details">
                    <div class="detail-item">
                      <div class="detail-icon">
                        <Phone :size="16" />
                      </div>
                      <div class="detail-content">
                        <span class="detail-label">Contact</span>
                        <span class="detail-value">{{ alert.patient?.user?.phone || 'N/A' }}</span>
                      </div>
                    </div>

                    <div class="detail-item">
                      <div class="detail-icon">
                        <Activity :size="16" />
                      </div>
                      <div class="detail-content">
                        <span class="detail-label">Groupe Sanguin</span>
                        <span class="detail-value">{{ alert.patient?.group_sanguine || 'Inconnu' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Alert Details Card -->
              <section class="alert-section">
                <div class="section-header">
                  <div class="section-title">
                    <div class="title-icon">
                      <AlertTriangle :size="20" />
                    </div>
                    <div>
                      <h2>Détails de l'Alerte</h2>
                      <p>Informations sur l'intervention</p>
                    </div>
                  </div>
                </div>

                <div class="alert-details-card">
                  <div class="detail-group">
                    <h3>Localisation</h3>
                    <div class="location-info">
                      <div class="location-header">
                        <MapPin :size="16" />
                        <span>Coordonnées GPS</span>
                      </div>
                      <div class="location-coords">
                        <span class="coord-item">Lat: {{ alert.latitude }}</span>
                        <span class="coord-item">Lng: {{ alert.longitude }}</span>
                      </div>
                      <a 
                        :href="`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`" 
                        target="_blank" 
                        class="map-link"
                      >
                        <ExternalLink :size="14" />
                        Voir sur Google Maps
                      </a>
                    </div>
                  </div>

                  <div class="detail-group">
                    <h3>Chronologie</h3>
                    <div class="timeline-info">
                      <div class="timeline-item">
                        <div class="timeline-icon">
                          <Clock :size="16" />
                        </div>
                        <div class="timeline-content">
                          <span class="timeline-label">Déclenchement</span>
                          <span class="timeline-value">{{ formatDateTime(alert.initiated_at) }}</span>
                        </div>
                      </div>
                      <div class="timeline-item">
                        <div class="timeline-icon">
                          <RefreshCw :size="16" />
                        </div>
                        <div class="timeline-content">
                          <span class="timeline-label">Dernière mise à jour</span>
                          <span class="timeline-value">{{ formatDateTime(alert.updated_at) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="alert.description" class="detail-group">
                    <h3>Description</h3>
                    <div class="description-box">
                      <p>{{ alert.description }}</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <!-- Actions Section -->
            <section class="actions-section">
              <div class="section-header">
                <div class="section-title">
                  <div class="title-icon">
                    <Activity :size="20" />
                  </div>
                  <div>
                    <h2>Actions d'Intervention</h2>
                    <p>Mettre à jour le statut de l'alerte</p>
                  </div>
                </div>
              </div>

              <div class="actions-grid">
                <button 
                  @click="updateStatus('takeCharge')" 
                  :disabled="isActionDisabled('takeCharge') || store.loading" 
                  class="action-card primary">
                  <div class="action-icon">
                    <User :size="24" />
                  </div>
                  <div class="action-content">
                    <h3>Prendre en Charge</h3>
                    <p>Marquer cette alerte comme en cours de traitement</p>
                  </div>
                  <div class="action-arrow">
                    <ArrowRight :size="20" />
                  </div>
                </button>

                <button 
                  @click="updateStatus('resolve')" 
                  :disabled="isActionDisabled('resolve') || store.loading" 
                  class="action-card success">
                  <div class="action-icon">
                    <CheckCircle :size="24" />
                  </div>
                  <div class="action-content">
                    <h3>Marquer Résolue</h3>
                    <p>Clore cette intervention médicale</p>
                  </div>
                  <div class="action-arrow">
                    <ArrowRight :size="20" />
                  </div>
                </button>
              </div>
            </section>

            <!-- Map Section -->
            <section class="map-section">
              <div class="section-header">
                <div class="section-title">
                  <div class="title-icon">
                    <MapPin :size="20" />
                  </div>
                  <div>
                    <h2>Localisation en Temps Réel</h2>
                    <p>Position exacte du patient</p>
                  </div>
                </div>
              </div>

              <div class="map-card">
                <div class="map-placeholder">
                  <MapPin :size="48" />
                  <p>Carte interactive ({{ alert.latitude }}, {{ alert.longitude }})</p>
                  <span class="map-status">Dernière position : {{ formatDateTime(alert.updated_at) }}</span>
                </div>
              </div>
            </section>
          </div>

          <div v-else-if="!store.loading && !store.error" class="empty-state">
            <div class="empty-icon">
              <AlertTriangle :size="24" />
            </div>
            <p>L'alerte #{{ routeAlertId || 'N/A' }} est introuvable ou a été résolue.</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUrgentistStore } from '@/stores/urgentistStore'
import {
  BarChart3,
  AlertTriangle,
  Clock,
  User,
  Activity,
  Phone,
  MapPin,
  ExternalLink,
  RefreshCw,
  XCircle,
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = useUrgentistStore()

// Sidebar state
const isSidebarOpen = ref(false) 

// 1. LECTURE ROBUSTE des paramètres de la route de détail (:urgentistId et :alertId)
const routeUrgentistId = computed(() => {
    const id = route.params.urgentistId;
    return id && !isNaN(parseInt(id)) ? parseInt(id) : null; 
});

const routeAlertId = computed(() => {
    const id = route.params.alertId;
    return id && !isNaN(parseInt(id)) ? parseInt(id) : null;
});

// Vérifie si les deux IDs sont des nombres valides.
const isValidId = computed(() => routeUrgentistId.value !== null && routeAlertId.value !== null);

// ----------------------------------------------------
// Computed Properties
// ----------------------------------------------------
const alert = computed(() => store.alertDetails)

const patientId = computed(() => alert.value?.patient?.id || 'N/A');

const patientName = computed(() => {
    const firstName = alert.value?.patient?.user?.first_name || '';
    const lastName = alert.value?.patient?.user?.last_name || 'N/A';
    return `${firstName} ${lastName}`.trim();
})

const patientAge = computed(() => {
    return typeof calculateAge === 'function' 
        ? calculateAge(alert.value?.patient?.user?.birth_date) 
        : 'N/A (Age)';
})


// ----------------------------------------------------
// Fonctions de Logique
// ----------------------------------------------------

async function updateStatus(action) {
    if (!alert.value || !isValidId.value) return;

    try {
        if (action === 'takeCharge') {
            await store.takeChargeOfAlert(routeAlertId.value); 
        } else if (action === 'resolve') {
            await store.resolveAlert(routeAlertId.value); 
        }
        await loadAlertDetails(); 
    } catch (err) {
        console.error("Échec de la mise à jour de statut:", err);
    }
}


function isActionDisabled(action) {
    if (!alert.value) return true;
    const status = alert.value.status;
    const isResolvedOrCancelled = status === 'traite' || status === 'annule' || status === 'resolved'; 
    const isInProgress = status === 'in_progress';

    if (isResolvedOrCancelled) return true; 
    if (action === 'takeCharge') return isInProgress; 
    if (action === 'resolve') return isResolvedOrCancelled; 

    return false;
}

function calculateAge(birthDate) {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const dob = new Date(birthDate);
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
}


function formatStatusClass(status) {
    const map = {
        'en attente': 'en-attente', 'annule': 'annule', 'in_progress': 'prise-en-charge', 
        'traite': 'résolue', 'resolved': 'résolue',
    };
    return map[status] || 'en-attente';
}

function formatStatusDisplay(status) {
    const map = {
        'en attente': 'En attente', 'annule': 'Annulée', 'in_progress': 'Prise en charge',
        'traite': 'Résolue', 'resolved': 'Résolue',
    };
    return map[status] || status;
}

function formatDateTime(dateTime) {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleString('fr-FR', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
}

// Sidebar functions
function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
    isSidebarOpen.value = false
}

function goBack() {
    router.back()
}

async function loadAlertDetails() {
    if (isValidId.value) {
        console.log(`[AlerteDetailView] 🚀 Début du chargement de l'alerte ID: ${routeAlertId.value}`);
        
        await store.fetchAlertDetails(routeAlertId.value);
        
        if (store.alertDetails) {
            console.log('====================================================');
            console.log(`⭐ LOG BRUT DES DONNÉES RÉCUPÉRÉES DE L'ALERTE ID ${routeAlertId.value} ⭐`);
            console.log(JSON.stringify(store.alertDetails, null, 2));
            console.log('====================================================');
        } else if (store.error) {
            console.error(`[AlerteDetailView] Échec du chargement: ${store.error}`);
        }
        
    } else {
         console.error(`[AlerteDetailView] ID d'alerte non valide trouvé dans la route. Chargement annulé.`);
    }
}

// ----------------------------------------------------
// Cycle de vie
// ----------------------------------------------------
onMounted(() => {
    if (isValidId.value) {
        loadAlertDetails();
    }
});
</script>

<style scoped>
/* Variables CSS - Design Glassmorphism Urgentiste */
:root {
  --primary: #dc2626;
  --primary-dark: #b91c1c;
  --primary-light: #ef4444;
  --secondary: #f59e0b;
  --secondary-dark: #d97706;
  --secondary-light: #fbbf24;
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

/* Animation de fond améliorée */
.admin-page-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 50%),
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
  background: radial-gradient(circle at center, rgba(220, 38, 38, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.sidebar-header {
  padding: 2rem 1.5rem;
  font-size: 1.8rem;
  font-weight: 900;
  background: linear-gradient(135deg, #dc2626, #f59e0b);
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

.menu-divider {
  padding: 0.5rem 1.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 1rem 0;
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
  background: linear-gradient(90deg, transparent, rgba(220, 38, 38, 0.2), transparent);
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
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.3), rgba(245, 158, 11, 0.2));
  color: white;
  transform: translateX(5px);
}

.menu-item.active .menu-icon {
  color: #ef4444;
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
  height: 100%;
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

/* Animation de fond */
.dashboard-admin::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at top, rgba(220, 38, 38, 0.15) 0%, transparent 50%);
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
  background: linear-gradient(90deg, #dc2626, #f59e0b);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
  z-index: 1;
}

.dashboard-header:hover::before {
  transform: scaleX(1);
}

.dashboard-header:hover {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(245, 158, 11, 0.1));
  border-color: rgba(220, 38, 38, 0.3);
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

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.header-content {
  flex: 1;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(220, 38, 38, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.2);
}

.back-btn:active {
  transform: translateY(0);
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

/* === Status Badge === */
.status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  animation: pulse 2s infinite;
}

.status-badge.en-attente {
  background: rgba(245, 158, 11, 0.2);
  color: var(--warning);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.status-badge.prise-en-charge {
  background: rgba(59, 130, 246, 0.2);
  color: var(--info);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.status-badge.annule {
  background: rgba(239, 68, 68, 0.2);
  color: var(--danger);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-badge.résolue {
  background: rgba(16, 185, 129, 0.2);
  color: var(--success);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

/* === Sections === */
.patient-section,
.alert-section,
.actions-section,
.map-section {
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

/* === Content Grid === */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

/* === Patient Card === */
.patient-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 2rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
}

.patient-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #dc2626, #f59e0b);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
  z-index: 1;
}

.patient-card:hover::before {
  transform: scaleX(1);
}

.patient-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.patient-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.patient-avatar {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
}

.patient-info h3 {
  margin: 0 0 0.5rem 0;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
}

.patient-id,
.patient-age {
  display: block;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.patient-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.detail-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(5px);
}

.detail-icon {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.75rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary);
}

.detail-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
}

/* === Alert Details Card === */
.alert-details-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 2rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
}

.alert-details-card::before {
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
  z-index: 1;
}

.alert-details-card:hover::before {
  transform: scaleX(1);
}

.alert-details-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.detail-group {
  margin-bottom: 2rem;
}

.detail-group:last-child {
  margin-bottom: 0;
}

.detail-group h3 {
  color: white;
  font-weight: 700;
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
}

.location-info {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
}

.location-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  font-weight: 600;
}

.location-coords {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.coord-item {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  font-family: monospace;
}

.map-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--info);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  transition: color 0.3s ease;
}

.map-link:hover {
  color: var(--primary-light);
}

.timeline-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.timeline-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(5px);
}

.timeline-icon {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.75rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary);
}

.timeline-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.timeline-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.timeline-value {
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
}

.description-box {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
}

.description-box p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.6;
  font-style: italic;
}

/* === Actions Section === */
.actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.action-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  text-decoration: none;
  color: white;
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
  z-index: 1;
}

.action-card.primary::before {
  background: linear-gradient(90deg, var(--primary), var(--secondary));
}

.action-card.success::before {
  background: linear-gradient(90deg, var(--success), var(--info));
}

.action-card:hover::before {
  transform: scaleX(1);
}

.action-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.action-card:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.action-card:disabled:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: none;
  box-shadow: none;
}

.action-icon {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-card.primary .action-icon {
  color: var(--primary);
}

.action-card.success .action-icon {
  color: var(--success);
}

.action-content {
  flex: 1;
}

.action-content h3 {
  margin: 0 0 0.5rem 0;
  font-weight: 700;
  font-size: 1.125rem;
}

.action-content p {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

.action-arrow {
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
}

.action-card:hover .action-arrow {
  color: white;
  transform: translateX(5px);
}

/* === Map Section === */
.map-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 2rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
}

.map-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--info), var(--accent));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
  z-index: 1;
}

.map-card:hover::before {
  transform: scaleX(1);
}

.map-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.map-placeholder {
  height: 400px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.125rem;
  font-weight: 600;
}

.map-placeholder svg {
  color: var(--info);
}

.map-status {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.875rem;
  margin-top: 1rem;
}

/* === States === */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.loading-spinner,
.error-icon,
.empty-icon {
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.6);
}

.loading-spinner .spinning {
  animation: spin 1s linear infinite;
}

.loading-state p,
.error-state p,
.empty-state p {
  margin: 0 0 0.5rem 0;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.empty-state span {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

/* === Error Message === */
.error-message {
  background: rgba(220, 38, 38, 0.2);
  border: 1px solid rgba(220, 38, 38, 0.3);
  color: var(--primary);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* === MOBILE === */
@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
  
  .mobile-toggle {
    display: block;
  }
  
  .sidebar-overlay.show {
    display: block;
  }
  
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .patient-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .detail-item,
  .timeline-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .action-card {
    flex-direction: column;
    text-align: center;
  }
  
  .map-placeholder {
    height: 300px;
  }
}
</style>