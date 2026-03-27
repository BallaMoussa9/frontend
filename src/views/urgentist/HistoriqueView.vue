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
          <RouterLink :to="{name:'UrgentisteDashboard', params: { id: urgentistId }}" class="menu-item" @click="closeSidebar">
            <BarChart3 :size="20" class="menu-icon" /> Dashboard
          </RouterLink>
          
          <div class="menu-divider">Gestion des Urgences</div>
          
          <RouterLink :to="{name:'UrgentisteHistorique', params: { id: urgentistId }}" class="menu-item active" @click="closeSidebar">
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
              <h1 class="dashboard-title">Historique des Interventions</h1>
              <p class="dashboard-subtitle">Consultez les alertes SOS résolues et annulées</p>
            </div>
            <button @click="refreshHistory" class="refresh-btn" :disabled="urgentistStore.loadingHistory">
              <RefreshCw :size="18" :class="{ 'spinning': urgentistStore.loadingHistory }" />
              {{ urgentistStore.loadingHistory ? 'Actualisation...' : 'Actualiser' }}
            </button>
          </header>

          <!-- Filters Section -->
          <section class="filters-section">
            <div class="section-header">
              <div class="section-title">
                <div class="title-icon">
                  <Filter :size="20" />
                </div>
                <div>
                  <h2>Filtres de Recherche</h2>
                  <p>Personnalisez l'affichage de l'historique</p>
                </div>
              </div>
            </div>

            <div class="filters-grid">
              <div class="filter-card">
                <label class="filter-label">Filtrer par date</label>
                <input type="date" v-model="dateFilter" class="filter-input" />
              </div>
              
              <div class="filter-card">
                <label class="filter-label">Recherche</label>
                <div class="search-input-wrapper">
                  <Search :size="16" class="search-icon" />
                  <input 
                    type="text" 
                    v-model="searchQuery" 
                    placeholder="ID ou Patient..." 
                    class="filter-input search"
                  />
                </div>
              </div>
              
              <button @click="applyFilters" class="apply-filters-btn">
                <Filter :size="16" />
                Appliquer les filtres
              </button>
            </div>
          </section>

          <!-- History Section -->
          <section class="history-section">
            <div class="section-header">
              <div class="section-title">
                <div class="title-icon">
                  <Clock :size="20" />
                </div>
                <div>
                  <h2>Interventions Terminées</h2>
                  <p>{{ filteredHistory.length }} intervention(s) trouvée(s)</p>
                </div>
              </div>
            </div>

            <div v-if="urgentistStore.loadingHistory" class="loading-state">
              <div class="loading-spinner">
                <RefreshCw :size="24" class="spinning" />
              </div>
              <p>Chargement de l'historique...</p>
            </div>
            
            <div v-else-if="urgentistStore.historyError" class="error-state">
              <XCircle :size="24" />
              <p>Erreur de chargement : {{ urgentistStore.historyError }}</p>
            </div>
            
            <div v-else-if="!filteredHistory.length" class="empty-state">
              <div class="empty-icon">
                <Clock :size="24" />
              </div>
              <p>Aucun historique trouvé</p>
              <span>Aucune intervention ne correspond à vos critères</span>
            </div>
            
            <!-- History Cards Grid -->
            <div v-else class="history-grid">
              <div 
                v-for="intervention in filteredHistory" 
                :key="intervention.id" 
                class="history-card"
                :class="[formatStatusClass(intervention.status)]"
              >
                <div class="card-header">
                  <div class="alert-id">
                    <span class="alert-number">SOS-{{ intervention.id }}</span>
                    <span :class="['status-badge', formatStatusClass(intervention.status)]">
                      {{ formatStatusDisplay(intervention.status) }}
                    </span>
                  </div>
                  <div class="alert-time">
                    <Clock :size="16" />
                    {{ formatDateTime(intervention.initiated_at) }}
                  </div>
                </div>

                <div class="card-content">
                  <div class="patient-info">
                    <div class="patient-avatar">
                      <User :size="20" />
                    </div>
                    <div class="patient-details">
                      <h4>{{ getPatientName(intervention) }}</h4>
                      <span class="patient-id">ID: {{ intervention.patient?.id }}</span>
                    </div>
                  </div>

                  <div class="location-info">
                    <div class="location-header">
                      <MapPin :size="16" />
                      <span>Localisation</span>
                    </div>
                    <div class="location-details">
                      <span class="location-text">{{ formatLocation(intervention) }}</span>
                    </div>
                  </div>
                </div>

                <div class="card-actions">
                  <button @click="viewDetails(intervention.id)" class="action-btn primary">
                    <Eye :size="16" />
                    Voir les détails
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUrgentistStore } from '@/stores/urgentistStore'
import { useUserStore } from '@/stores/userStore'
import {
  BarChart3,
  Clock,
  User,
  Filter,
  Search,
  RefreshCw,
  XCircle,
  Eye,
  MapPin
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const urgentistStore = useUrgentistStore()
const userStore = useUserStore()

// Sidebar state
const isSidebarOpen = ref(false)

// Urgentist ID from route
const urgentistId = computed(() => {
  const id = route.params.id;
  return id && !isNaN(parseInt(id)) ? parseInt(id) : null;
})

// --- États des filtres ---
const dateFilter = ref('')
const searchQuery = ref('')

// --- Fonctions Utilitaires ---

function formatDateTime(dateTime) {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleString('fr-FR', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function getPatientName(alert) {
      return `${alert.patient?.user?.first_name || ''} ${alert.patient?.user?.last_name || 'N/A'}`.trim()
}

function formatLocation(alert) {
    if (alert.latitude && alert.longitude) {
        return `Lat: ${alert.latitude.toFixed(4)}, Long: ${alert.longitude.toFixed(4)}`
    }
    return 'N/A'
}

function formatStatusClass(status) {
    const map = {
        'traite': 'resolved-status',
        'annule': 'cancelled-status',
    };
    return map[status] || 'default-status';
}

function formatStatusDisplay(status) {
    const map = {
        'traite': 'Résolue',
        'annule': 'Annulée',
    };
    return map[status] || status;
}

// --- Logique des filtres ---

const filteredHistory = computed(() => {
    // 🔑 Utilisation du getter Pinia existant
    let data = urgentistStore.alertsHistory ?? [] // Accès direct à l'état pour les cas simples

    // ⛔ FILTRE PAR URGENTISTE ID DÉSACTIVÉ POUR LE TEST
    // Si l'historique est vide après cette étape, c'est que l'API n'a rien retourné
    // ou que les filtres restants sont trop restrictifs.

    if (dateFilter.value) {
        data = data.filter(item => item.initiated_at?.startsWith(dateFilter.value))
    }

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        data = data.filter(item => 
            String(item.id).includes(query) || 
            getPatientName(item).toLowerCase().includes(query)
        )
    }
    
    return data.slice().sort((a, b) => b.id - a.id)
})

// --- Actions ---

function viewDetails(id) {
    const currentUrgentistId = userStore.getCurrentFirstResponderProfile?.id;

    if (currentUrgentistId) {
        router.push({ 
            name: 'AlerteDetail', 
            params: { 
                urgentistId: currentUrgentistId, 
                alertId: id 
            }
        })
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

// New functions
function refreshHistory() {
    urgentistStore.fetchAlertsHistory()
}

function applyFilters() {
    // Les filtres sont déjà réactifs, cette fonction peut être utilisée pour déclencher des actions supplémentaires
    console.log('Filtres appliqués:', { dateFilter: dateFilter.value, searchQuery: searchQuery.value })
}

// --- Cycle de vie ---

onMounted(async () => {
    // 🔑 Tenter de charger le profil de l'urgentiste (Nécessaire pour le filtre et la navigation)
    const currentUser = userStore.getCurrentUser;
    if (currentUser) {
        await userStore.fetchUrgentistByUserId(currentUser.id);
    }
    
    // Lancer la récupération des données de l'historique
    await urgentistStore.fetchAlertsHistory();
})
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

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(220, 38, 38, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.2);
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
.filters-section,
.history-section {
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

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

/* === Filters Section === */
.filters-grid {
  display: grid;
  grid-template-columns: 1fr 2fr auto;
  gap: 1.5rem;
  align-items: end;
}

.filter-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.filter-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.filter-label {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.filter-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.filter-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  background: rgba(255, 255, 255, 0.08);
}

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.4);
  pointer-events: none;
}

.filter-input.search {
  padding-left: 2.5rem;
}

.apply-filters-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
}

.apply-filters-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
}

/* === History Section === */
.history-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.history-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
}

.history-card::before {
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

.history-card:hover::before {
  transform: scaleX(1);
}

.history-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.card-header {
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
  font-size: 1.125rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.traite {
  background: rgba(16, 185, 129, 0.2);
  color: var(--success);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-badge.annule {
  background: rgba(239, 68, 68, 0.2);
  color: var(--danger);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-badge.en_attente {
  background: rgba(245, 158, 11, 0.2);
  color: var(--warning);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.alert-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.patient-info {
  display: flex;
  align-items: center;
  gap: 1rem;
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
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
}

.patient-details h4 {
  margin: 0 0 0.25rem 0;
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.patient-id {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
}

.location-info {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
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

.location-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  line-height: 1.4;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
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
  
  .filters-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .history-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .filter-card {
    padding: 1rem;
  }
  
  .history-card {
    padding: 1rem;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .patient-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>