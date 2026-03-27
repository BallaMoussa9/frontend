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
          <RouterLink :to="{name:'UrgentisteDashboard', params: { id: urgentistId }}" class="menu-item active" @click="closeSidebar">
            <BarChart3 :size="20" class="menu-icon" /> Dashboard
          </RouterLink>
          
          <div class="menu-divider">Gestion des Urgences</div>
          
          <RouterLink :to="{name:'UrgentisteHistorique', params: { id: urgentistId }}" class="menu-item" @click="closeSidebar">
            <Clock :size="20" class="menu-icon" /> Historique
          </RouterLink>

          <div class="menu-divider">Communication</div>

          <RouterLink :to="{name:'UrgentisteProfile', params: { id: urgentistId }}" class="menu-item" @click="closeSidebar">
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
            <div class="header-content">
              <h1 class="dashboard-title">Tableau de Bord Urgentiste</h1>
              <p class="dashboard-subtitle">Gestion des alertes médicales en temps réel</p>
            </div>
            <button @click="refreshAlerts" class="refresh-btn" :disabled="store.loading">
              <RefreshCw :size="18" :class="{ 'spinning': store.loading }" />
              {{ store.loading ? 'Actualisation...' : 'Actualiser' }}
            </button>
          </header>

          <div v-if="!isValidUrgentistId" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <div>
              <strong>ERREUR CRITIQUE :</strong> L'ID de l'Urgentiste n'a pas été trouvé.
              <p>Vérifiez l'URL de votre navigateur.</p>
            </div>
          </div>

          <div v-else>
            <!-- Stats Cards -->
            <section class="stats-section">
              <div class="section-header">
                <h2 class="section-title">Statistiques des Urgences</h2>
                <span class="live-indicator">● Live</span>
              </div>
              <div class="top-stats">
                <div class="stat-box pending" v-for="card in urgentistStats" :key="card.label">
                  <div class="stat-icon">
                    <component :is="card.iconComponent" :size="24" />
                  </div>
                  <div class="stat-details">
                    <h3 class="stat-value">{{ card.value }}</h3>
                    <p class="stat-label">{{ card.label }}</p>
                    <span class="stat-trend">{{ card.trend }}</span>
                    <span class="stat-period">{{ card.period }}</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- Alertes Section -->
            <section class="alerts-section">
              <div class="section-header">
                <div class="section-title">
                  <div class="title-icon">
                    <AlertTriangle :size="20" />
                  </div>
                  <div>
                    <h2>Alertes Actives</h2>
                    <p>Gérez les urgences médicales en temps réel</p>
                  </div>
                </div>
                <span class="live-indicator" v-if="activeAlerts.length > 0">● Live</span>
              </div>

              <div v-if="store.loading" class="loading-state">
                <div class="loading-spinner">
                  <RefreshCw :size="24" class="spinning" />
                </div>
                <p>Chargement des alertes...</p>
              </div>

              <div v-else-if="store.error" class="error-state">
                <div class="error-icon">
                  <XCircle :size="24" />
                </div>
                <p>Erreur : {{ store.error }}</p>
              </div>

              <div v-else-if="activeAlerts.length === 0" class="empty-state">
                <div class="empty-icon">
                  <CheckCircle :size="24" />
                </div>
                <p>Aucune alerte SOS active</p>
                <span>Toutes les urgences sont sous contrôle</span>
              </div>

              <!-- Alertes Cards -->
              <div v-else class="alerts-grid">
                <div 
                  v-for="alert in activeAlerts" 
                  :key="alert.id" 
                  class="alert-card"
                  :class="[formatStatusClass(alert.status)]"
                >
                  <div class="alert-header">
                    <div class="alert-id">
                      <span class="alert-number">#{{ alert.id }}</span>
                      <span :class="['status-badge', formatStatusClass(alert.status)]">
                        {{ formatStatusDisplay(alert.status) }}
                      </span>
                    </div>
                    <div class="alert-time">
                      <Clock :size="16" />
                      {{ formatTime(alert.initiated_at) }}
                    </div>
                  </div>

                  <div class="alert-content">
                    <div class="patient-info">
                      <div class="patient-avatar">
                        <User :size="20" />
                      </div>
                      <div class="patient-details">
                        <h4>{{ formatPatientName(alert) }}</h4>
                        <span class="patient-id">ID: {{ alert.patient_id }}</span>
                      </div>
                    </div>

                    <div class="location-info">
                      <div class="location-header">
                        <MapPin :size="16" />
                        <span>Localisation</span>
                      </div>
                      <div class="location-details">
                        <span class="coordinates">Lat: {{ alert.latitude }}, Lng: {{ alert.longitude }}</span>
                        <a 
                          :href="`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`" 
                          target="_blank" 
                          class="map-link"
                        >
                          <ExternalLink :size="14" />
                          Voir sur carte
                        </a>
                      </div>
                    </div>
                  </div>

                  <div class="alert-actions">
                    <button 
                      @click="goToAlertDetail(alert.id)" 
                      class="action-btn primary"
                      :disabled="isActionDisabled(alert.status)"
                    >
                      <Eye :size="16" />
                      {{ alert.status === 'in_progress' ? 'Voir détails' : 'Prendre en charge' }}
                    </button>
                    <button class="action-btn secondary">
                      <Phone :size="16" />
                      Contacter
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUrgentistStore } from '@/stores/urgentistStore'
import {
  BarChart3,
  AlertTriangle,
  RefreshCw,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  User,
  MapPin,
  ExternalLink,
  Eye,
  Phone
} from 'lucide-vue-next'

const store = useUrgentistStore()
const router = useRouter()
const route = useRoute()

// Sidebar state
const isSidebarOpen = ref(false)

// 1. LECTURE ROBUSTE de l'ID Urgentiste depuis la route du Dashboard (:id)
const urgentistId = computed(() => {
    const idParam = route.params.id;
    if (idParam && !isNaN(parseInt(idParam))) {
        return String(idParam);
    }
    return null; 
});

const isValidUrgentistId = computed(() => urgentistId.value !== null);

// ----------------------------------------------------
// Computed Properties
// ----------------------------------------------------

const activeAlerts = computed(() => store.activeAlerts)

// ✅ CORRECTION APPLIQUÉE ICI : Sécurisation de l'accès à alertsStats
const summary = computed(() => {
    // ⭐ UTILISE || {} pour s'assurer que stats est au moins un objet vide {}
    const stats = store.alertsStats || {}; 
    
    return {
        // L'accès par stats['key'] est maintenant sécurisé. S'il n'existe pas, il vaut 0.
        pending: stats['en attente'] || 0,
        inProgress: stats['in_progress'] || 0,
        // Les alertes résolues sont la somme de 'traite' et 'annule'
        resolved: (stats['traite'] || 0) + (stats['annule'] || 0), 
    };
});

// Computed property pour les statistiques urgentistes
const urgentistStats = computed(() => [
  {
    label: 'Alertes en Attente',
    value: summary.value?.pending || 0,
    iconComponent: AlertTriangle,
    trend: '+12%',
    period: 'vs mois dernier'
  },
  {
    label: 'Interventions en Cours',
    value: summary.value?.inProgress || 0,
    iconComponent: Activity,
    trend: '+8%',
    period: 'vs mois dernier'
  },
  {
    label: 'Urgences Résolues',
    value: summary.value?.resolved || 0,
    iconComponent: CheckCircle,
    trend: '+15%',
    period: 'vs mois dernier'
  },
  {
    label: 'Temps de Réponse',
    value: '3.2 min',
    iconComponent: Clock,
    trend: '-5%',
    period: 'vs mois dernier'
  }
])

// ----------------------------------------------------
// Fonctions de Navigation et d'Action
// ----------------------------------------------------

function refreshAlerts() {
    if (isValidUrgentistId.value) {
        store.fetchActiveAlerts(urgentistId.value);
    }
}

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
        // Importer et utiliser le store d'authentification
        const { useAuthStore } = await import('@/stores/authStores')
        const authStore = useAuthStore()
        await authStore.logout()
        router.push({ name: 'Login' })
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
    }
}

function goToAlertDetail(alertId) {
    if (!isValidUrgentistId.value) {
        console.error("Erreur critique: ID Urgentiste manquant. Navigation annulée.");
        return; 
    }
    
    // Correction de l'URL Google Maps dans le template pour la rendre valide.
    // REDIRECTION : S'assure que l'ID est bien une chaîne.
    router.push({ 
        name: 'AlerteDetail', 
        params: { 
            urgentistId: urgentistId.value, 
            alertId: String(alertId) 
        }
    })
}

function isActionDisabled(status) {
    // Si l'alerte est 'in_progress', le bouton devient 'Détails' mais n'est pas désactivé.
    // On ne désactive que si l'ID est manquant ou si l'alerte est déjà traitée/annulée
    return !isValidUrgentistId.value || status === 'traite' || status === 'annule' || store.loading;
}

// ----------------------------------------------------
// Fonctions de Formatage
// ----------------------------------------------------

function formatStatusClass(status) {
    const map = {
        'en attente': 'en-attente',
        'in_progress': 'prise-en-charge',
        'traite': 'resolue',
        'resolved': 'resolue', 
        'annule': 'annulee', 
    };
    return map[status] || '';
}

function formatStatusDisplay(status) {
    const map = {
        'en attente': 'En Attente',
        'in_progress': 'Prise en charge',
        'traite': 'Résolue',
        'resolved': 'Résolue',
        'annule': 'Annulée',
    };
    return map[status] || status;
}

function formatPatientName(alert) {
    return `${alert.patient?.user?.first_name || ''} ${alert.patient?.user?.last_name || 'N/A'}`.trim()
}

function formatTime(dateTime) {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleTimeString('fr-FR', { 
        hour: '2-digit', minute: '2-digit' 
    });
}


// ----------------------------------------------------
// Cycle de vie & Log
// ----------------------------------------------------

const loadDashboardData = async () => {
    if (!isValidUrgentistId.value) {
        console.error("L'ID Urgentiste est manquant. Le chargement des alertes n'a pas été déclenché.");
        return;
    }
    try {
        await Promise.all([
            // Récupération des statistiques pour les cartes
            store.fetchAlertsStats(),
            // Récupération des alertes actives pour le tableau
            store.fetchActiveAlerts(),
        ]);
    } catch (error) {
        // L'erreur est déjà gérée dans le store, on peut juste loguer ici
        console.error("Échec du chargement du tableau de bord:", error);
    }
};

onMounted(() => {
    loadDashboardData();
    // Optionnel : Si vous utilisez un intervalle de rafraîchissement, le placer ici.
});

watch(activeAlerts, (newAlerts) => {
    if (newAlerts && newAlerts.length > 0) {
        console.log('====================================================');
        console.log(`⭐ LOG DES ID PATIENTS POUR LES ${newAlerts.length} ALERTES ACTIVES ⭐`);
        
        newAlerts.forEach(alert => {
            const patientIdFromAlert = alert.patient_id || alert.patient?.id || 'N/A';
            const patientName = formatPatientName(alert);

            console.log(`Alerte ID: ${alert.id} | Patient ID (sosalerts.patient_id): ${patientIdFromAlert} | Nom: ${patientName}`);
        });
        
        console.log('====================================================');
    } else if (!store.loading && store.error) {
        console.error("[Dashboard] Le chargement a échoué. Aucune alerte à loguer.");
    } else if (!store.loading && isValidUrgentistId.value) {
        console.log("[Dashboard] Aucune alerte active à afficher.");
    }
}, { immediate: true }); 
</script><style scoped>
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

.menu-item.logout-btn {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.05));
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #f87171;
  margin-top: 1rem;
}

.menu-item.logout-btn:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(245, 158, 11, 0.1));
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.menu-item.logout-btn .menu-icon {
  color: inherit;
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

.badge {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: auto;
  animation: pulse 2s infinite;
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
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
}

.refresh-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
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
.stats-section, .alerts-section {
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

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.live-indicator {
  color: var(--secondary);
  font-weight: 600;
  font-size: 14px;
  animation: pulse 2s infinite;
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
  background: linear-gradient(90deg, #dc2626, #f59e0b);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
  z-index: 1;
}

.stat-box:hover::before {
  transform: scaleX(1);
}

.stat-box:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(245, 158, 11, 0.15));
  border-color: rgba(220, 38, 38, 0.4);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  font-size: 1.5rem;
  animation: pulse 2s infinite;
  flex-shrink: 0;
}

.stat-details {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 900;
  color: white;
  margin: 0 0 4px 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--light);
  margin: 0 0 12px 0;
  font-weight: 500;
  opacity: 0.9;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--success);
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.stat-period {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
}

/* === Alerts Section === */
.alerts-section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
}

.alerts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.alert-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.alert-card::before {
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

.alert-card:hover::before {
  transform: scaleX(1);
}

.alert-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.alert-id {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.alert-number {
  font-weight: 700;
  color: white;
}

.alert-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

.alert-content {
  margin-bottom: 1.5rem;
}

.patient-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.patient-avatar {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.patient-details h4 {
  margin: 0 0 0.25rem 0;
  color: white;
  font-weight: 600;
}

.patient-id {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
}

.location-info {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 1rem;
}

.location-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  font-weight: 600;
}

.location-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.coordinates {
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

.alert-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  justify-content: center;
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
}

.action-btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(220, 38, 38, 0.4);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* === Status Badge === */
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

.status-badge.resolue {
  background: rgba(16, 185, 129, 0.2);
  color: var(--success);
  border: 1px solid rgba(16, 185, 129, 0.3);
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
  
  .top-stats {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
  
  .alerts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .refresh-btn {
    width: 100%;
    justify-content: center;
  }
  
  .top-stats {
    grid-template-columns: 1fr;
  }
  
  .alert-actions {
    flex-direction: column;
  }
  
  .alert-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>