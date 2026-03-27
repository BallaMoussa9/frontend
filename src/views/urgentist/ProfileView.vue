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
          
          <RouterLink :to="{name:'UrgentisteHistorique', params: { id: urgentistId }}" class="menu-item" @click="closeSidebar">
            <Clock :size="20" class="menu-icon" /> Historique
          </RouterLink>

          <div class="menu-divider">Communication</div>

          <RouterLink :to="{name:'UrgentisteProfile', params: { id: urgentistId }}" class="menu-item active" @click="closeSidebar">
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
              <h1 class="dashboard-title">Mon Profil Urgentiste</h1>
              <p class="dashboard-subtitle">Gérez vos informations personnelles et professionnelles</p>
            </div>
            <button @click="refreshProfile" class="refresh-btn" :disabled="isLoading">
              <RefreshCw :size="18" :class="{ 'spinning': isLoading }" />
              {{ isLoading ? 'Actualisation...' : 'Actualiser' }}
            </button>
          </header>

          <!-- Messages Feedback -->
          <TransitionGroup name="fade">
            <div v-if="isLoading" key="loading" class="feedback-message loading-message">
              <RefreshCw :size="20" class="spinning" />
              <span>Chargement du profil...</span>
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
          
          <!-- Profile Cards Grid -->
          <div v-if="!isLoading && (currentUser || urgentistProfile)" class="profile-grid">
            <!-- Personal Info Card -->
            <section class="profile-section">
              <div class="section-header">
                <div class="section-title">
                  <div class="title-icon">
                    <User :size="20" />
                  </div>
                  <div>
                    <h2>Informations Personnelles</h2>
                    <p>Détails de votre identité</p>
                  </div>
                </div>
              </div>

              <div class="profile-card">
                <div class="card-header">
                  <div class="profile-avatar">
                    <User :size="32" />
                  </div>
                  <div class="profile-info">
                    <h3>{{ profileDisplay.lastName }} {{ profileDisplay.firstName }}</h3>
                    <span class="profile-role">{{ profileDisplay.role }}</span>
                  </div>
                </div>

                <div class="profile-details">
                  <div class="detail-item">
                    <div class="detail-icon">
                      <User :size="16" />
                    </div>
                    <div class="detail-content">
                      <span class="detail-label">Email</span>
                      <span class="detail-value">{{ profileDisplay.email }}</span>
                    </div>
                  </div>

                  <div class="detail-item">
                    <div class="detail-icon">
                      <Phone :size="16" />
                    </div>
                    <div class="detail-content">
                      <span class="detail-label">Téléphone</span>
                      <span class="detail-value">{{ profileDisplay.phone }}</span>
                    </div>
                  </div>

                  <div class="detail-item">
                    <div class="detail-icon">
                      <Clock :size="16" />
                    </div>
                    <div class="detail-content">
                      <span class="detail-label">Date de Naissance</span>
                      <span class="detail-value">{{ profileDisplay.dob }}</span>
                    </div>
                  </div>
                </div>

                <div class="card-actions">
                  <button @click="startEdit" class="action-btn primary" :disabled="isLoading">
                    <User :size="16" />
                    Modifier le profil
                  </button>
                </div>
              </div>
            </section>

            <!-- Professional Info Card -->
            <section class="profile-section">
              <div class="section-header">
                <div class="section-title">
                  <div class="title-icon">
                    <Activity :size="20" />
                  </div>
                  <div>
                    <h2>Informations Professionnelles</h2>
                    <p>Détails de votre activité</p>
                  </div>
                </div>
              </div>

              <div class="profile-card">
                <div class="card-header">
                  <div class="profile-avatar medical">
                    <Activity :size="32" />
                  </div>
                  <div class="profile-info">
                    <h3>Urgentiste ID: {{ urgentistProfile?.id || 'N/A' }}</h3>
                    <span :class="['profile-status', profileDisplay.isAvailable ? 'available' : 'unavailable']">
                      {{ urgentistProfile?.status || 'N/A' }}
                    </span>
                  </div>
                </div>

                <div class="profile-details">
                  <div class="detail-item">
                    <div class="detail-icon">
                      <Activity :size="16" />
                    </div>
                    <div class="detail-content">
                      <span class="detail-label">Spécialité</span>
                      <span class="detail-value">{{ urgentistProfile?.speciality || 'Non spécifié' }}</span>
                    </div>
                  </div>

                  <div class="detail-item">
                    <div class="detail-icon">
                      <MapPin :size="16" />
                    </div>
                    <div class="detail-content">
                      <span class="detail-label">Localisation</span>
                      <span class="detail-value">Service d'Urgence</span>
                    </div>
                  </div>

                  <div class="detail-item">
                    <div class="detail-icon">
                      <Clock :size="16" />
                    </div>
                    <div class="detail-content">
                      <span class="detail-label">Disponibilité</span>
                      <span class="detail-value">{{ profileDisplay.isAvailable ? 'Disponible' : 'Hors-ligne' }}</span>
                    </div>
                  </div>
                </div>

                <div class="card-actions">
                  <button @click="toggleAvailability" :class="['action-btn', profileDisplay.isAvailable ? 'danger' : 'success']" :disabled="isLoading">
                    <Activity :size="16" />
                    {{ profileDisplay.isAvailable ? 'Passer Hors-Ligne' : 'Passer Disponible' }}
                  </button>
                </div>
              </div>
            </section>
          </div>

          <!-- Edit Modal -->
          <div v-if="editMode" class="modal-overlay" @click.self="editMode = false">
            <div class="modal-card">
              <div class="modal-header">
                <h3>Modifier le profil</h3>
                <button class="close-modal" @click="editMode = false">
                  <XCircle :size="20" />
                </button>
              </div>
              <form @submit.prevent="saveProfile" class="modal-form">
                <div class="form-row">
                  <div class="form-group">
                    <label>Prénom</label>
                    <input type="text" v-model="localProfile.first_name" required>
                  </div>
                  <div class="form-group">
                    <label>Nom</label>
                    <input type="text" v-model="localProfile.last_name" required>
                  </div>
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" v-model="localProfile.email" required>
                </div>
                <div class="form-group">
                  <label>Téléphone</label>
                  <input type="text" v-model="localProfile.phone">
                </div>
                
                <div class="modal-footer">
                  <button type="button" @click="editMode = false" class="btn-cancel">
                    <XCircle :size="16" />
                    Annuler
                  </button>
                  <button type="submit" class="btn-save" :disabled="isLoading">
                    <CheckCircle :size="16" />
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed, watch, TransitionGroup } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStores' 
import { useUserStore } from '@/stores/userStore' 
import { useUrgentistStore } from '@/stores/urgentistStore' 
import {
  BarChart3,
  Clock,
  User,
  Activity,
  RefreshCw,
  XCircle,
  CheckCircle,
  Phone,
  MapPin,
  ExternalLink,
  Eye
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()
const urgentistStore = useUrgentistStore() 

// Sidebar state
const isSidebarOpen = ref(false)

// Urgentist ID from route
const urgentistId = computed(() => {
  const id = route.params.id;
  return id && !isNaN(parseInt(id)) ? parseInt(id) : null;
})

const editMode = ref(false)
const localProfile = ref({}) 

// ----------------------------------------------------
// Computed Properties
// ----------------------------------------------------

const currentUser = computed(() => userStore.getCurrentUser)
const urgentistProfile = computed(() => userStore.getCurrentFirstResponderProfile)

const profileDisplay = computed(() => {
    const user = currentUser.value || {}
    const responder = urgentistProfile.value || {}

    return {
        firstName: user.first_name || 'N/A',
        lastName: user.last_name || 'N/A',
        email: user.email || 'N/A',
        phone: user.phone || 'N/A',
        dob: user.birth_date ? formatDate(user.birth_date) : 'N/A',
        role: user.role_id ? 'Urgentiste' : 'N/A',
        urgentistId: responder.id ? `UGT-${responder.id}` : 'N/A',
        isAvailable: responder.status === 'available',
        assignmentLocation: responder.location || 'Non spécifié',
        speciality: responder.speciality || 'Non spécifié',
    }
})

const isLoading = computed(() => userStore.loading || urgentistStore.loading)
const error = computed(() => userStore.error || urgentistStore.error)
const success = computed(() => userStore.success || urgentistStore.success)


// ----------------------------------------------------
// Fonctions de Logique
// ----------------------------------------------------

function startEdit() {
    if (!currentUser.value) return
    
    localProfile.value = {
        first_name: currentUser.value.first_name,
        last_name: currentUser.value.last_name,
        email: currentUser.value.email,
        phone: currentUser.value.phone,
    }
    userStore.resetFeedback() 
    urgentistStore.resetFeedback() 
    editMode.value = true
}

async function saveProfile() {
    try {
        await userStore.updateCurrentUserProfile(localProfile.value)
        editMode.value = false
    } catch (err) {
        console.error("Erreur lors de la sauvegarde:", err)
    }
}

async function toggleAvailability() {
    if (!urgentistProfile.value || isLoading.value) return

    const currentStatus = urgentistProfile.value.status;
    const newStatus = currentStatus === 'available' ? 'unavailable' : 'available';
    const updateData = { status: newStatus };

    try {
        // NOTE: Assurez-vous que cette méthode utilise bien la méthode HTTP PUT ou PATCH 
        // dans votre service API (e.g., apiUrgentist.js) pour éviter l'erreur 405.
        await urgentistStore.updateUrgentist(urgentistProfile.value.id, updateData);
        
        if(urgentistStore.currentUrgentist) {
             userStore.currentFirstResponderProfile = urgentistStore.currentUrgentist;
        }

    } catch (err) {
        console.error("Échec du changement de statut:", err)
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    if (isNaN(date)) return 'N/A' 
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    })
}

// Sidebar functions
function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
    isSidebarOpen.value = false
}

// New functions
function refreshProfile() {
    const userId = authStore.user?.id || 1
    if (userId) {
        userStore.fetchCurrentUser()
        userStore.fetchUrgentistByUserId(userId)
    }
}

// Logout function
async function handleLogout() {
    try {
        closeSidebar() // Fermer la sidebar avant la déconnexion
        await authStore.logout()
        router.push({ name: 'Login' })
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
    }
}

// ----------------------------------------------------
// Cycle de vie
// ----------------------------------------------------

onMounted(async () => {
    userStore.resetFeedback()
    urgentistStore.resetFeedback()

    const userId = authStore.user?.id || 1 

    if (userId) {
        await userStore.fetchCurrentUser()
        await userStore.fetchUrgentistByUserId(userId)
    }
})

watch(success, (newValue) => {
    if (newValue) {
        setTimeout(() => {
            userStore.setSuccess(null)
            urgentistStore.resetFeedback() 
        }, 5000)
    }
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

.menu-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: rgba(255, 255, 255, 0.4);
}

.menu-item.disabled:hover {
  background: none;
  transform: none;
  color: rgba(255, 255, 255, 0.4);
}

.menu-item.disabled .menu-icon {
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
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.2);
  color: var(--info);
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

/* === Profile Sections === */
.profile-section {
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

/* === Profile Cards === */
.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.profile-card {
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

.profile-card::before {
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

.profile-card:hover::before {
  transform: scaleX(1);
}

.profile-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.profile-avatar {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
}

.profile-avatar.medical {
  background: linear-gradient(135deg, var(--info), var(--accent));
  box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3);
}

.profile-info h3 {
  margin: 0 0 0.5rem 0;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
}

.profile-role {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  font-weight: 500;
}

.profile-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.profile-status.available {
  background: rgba(34, 197, 94, 0.2);
  color: var(--success);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.profile-status.unavailable {
  background: rgba(239, 68, 68, 0.2);
  color: var(--danger);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* === Profile Details === */
.profile-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
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
  transform: translateX(4px);
}

.detail-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.detail-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  color: white;
  font-size: 0.95rem;
  font-weight: 500;
}

/* === Actions === */
.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
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

.action-btn.success {
  background: linear-gradient(135deg, var(--success), var(--info));
  color: white;
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
}

.action-btn.success:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(34, 197, 94, 0.4);
}

.action-btn.danger {
  background: linear-gradient(135deg, var(--danger), var(--warning));
  color: white;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.action-btn.danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
}

/* === Modal === */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 8, 45, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-card {
  background: linear-gradient(135deg, #0f172a, #1e293b);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  width: 100%;
  max-width: 500px;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  margin: 0;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
}

.close-modal {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-modal:hover {
  background: rgba(239, 68, 68, 0.2);
  color: var(--danger);
  transform: rotate(90deg);
}

.modal-form {
  padding: 2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  background: rgba(255, 255, 255, 0.08);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.btn-save {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* === Animations === */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
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
  
  .profile-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .profile-card {
    padding: 1.5rem;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-card {
    margin: 1rem;
  }
  
  .modal-form {
    padding: 1.5rem;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .detail-icon {
    width: 36px;
    height: 36px;
  }
}
</style>