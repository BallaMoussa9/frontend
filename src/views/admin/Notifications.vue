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
          <RouterLink :to="{name:'Notification'}" class="menu-item active" @click="closeSidebar">
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
                  <h1 class="dashboard-title">
                    <span class="title-icon">
                      <Clock :size="24" />
                    </span>
                    Centre de Notifications
                  </h1>
                  <p class="dashboard-subtitle">
                    Diffusez des informations importantes aux utilisateurs
                  </p>
                </div>
              </div>
            </div>
          </header>

          <!-- Feedback Messages -->
          <div class="feedback-area">
            <div v-if="notificationStore.sending" class="state-message loading">
              <div class="spinner"></div>
              <span>Envoi en cours...</span>
            </div>
            <div v-if="notificationStore.sendError" class="state-message error">
              <AlertTriangle :size="16" />
              <span>{{ notificationStore.sendError }}</span>
            </div>
            <div v-if="notificationStore.sendSuccess" class="state-message success">
              <CheckCircle :size="16" />
              <span>Notification envoyée !</span>
            </div>
          </div>

          <!-- Notification Form -->
          <div class="notification-form">
            <form @submit.prevent="handleSendNotification" class="notif-form">
              
              <!-- Destinataires Section -->
              <div class="form-section">
                <div class="section-title">
                  <Users :size="20" class="section-icon" />
                  <h3>Destinataires</h3>
                </div>
                
                <div class="checkbox-wrapper">
                  <input type="checkbox" id="sendToAll" v-model="sendToAll" class="custom-checkbox" />
                  <label for="sendToAll">Envoyer à tous les utilisateurs</label>
                </div>

                <Transition name="fade-slide">
                  <div v-if="!sendToAll" class="recipient-selection">
                    <div class="search-box">
                      <Search :size="20" class="search-icon" />
                      <input
                        type="text"
                        v-model="searchQuery"
                        placeholder="Rechercher par nom ou email..."
                        class="search-input"
                      />
                      <div v-if="userStore.loadingUsers" class="spinner-small"></div>
                    </div>

                    <div class="selection-display" v-if="selectedRecipientIds.length > 0">
                      <span class="badge-count">{{ selectedRecipientIds.length }} sélectionné(s)</span>
                      <button type="button" @click="selectedRecipientIds = []" class="btn-clear">
                        <X :size="16" />
                        Effacer tout
                      </button>
                    </div>

                    <div class="users-list-container">
                      <select
                        v-model="selectedRecipientIds"
                        multiple
                        class="modern-select-multiple"
                        :disabled="userStore.loadingUsers"
                      >
                        <option v-for="user in filteredUsers" :key="user.id" :value="user.id">
                          {{ user.first_name }} {{ user.last_name }} ({{ user.email }})
                        </option>
                      </select>
                      <p class="hint">Maintenez <b>Ctrl</b> ou <b>Cmd</b> pour sélection multiple.</p>
                    </div>
                  </div>
                </Transition>
              </div>

              <!-- Contenu Section -->
              <div class="form-section">
                <div class="section-title">
                  <FileText :size="20" class="section-icon" />
                  <h3>Contenu du message</h3>
                </div>

                <div class="grid-inputs">
                  <div class="form-group">
                    <label>Type de notification</label>
                    <div class="select-wrapper">
                      <select v-model="type" required class="form-select">
                        <option value="" disabled>Choisir un type...</option>
                        <option value="urgence"> Urgence</option>
                        <option value="laboratoire"> Laboratoire</option>
                        <option value="Administratif"> Administratif</option>
                        <option value="financiere"> Financière</option>
                      </select>
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Sujet / Titre</label>
                    <input v-model="subject" type="text" placeholder="Titre de l'alerte..." required class="form-input" />
                  </div>
                </div>

                <div class="form-group">
                  <label>Message détaillé</label>
                  <textarea v-model="message" rows="5" placeholder="Saisissez votre message ici..." class="form-textarea"></textarea>
                </div>
              </div>

              <!-- Form Footer -->
              <footer class="form-footer">
                <button type="submit" class="action-btn primary" :disabled="notificationStore.sending || !isFormValid">
                  <div class="spinner" v-if="notificationStore.sending"></div>
                  <Send :size="16" v-else />
                  {{ notificationStore.sending ? 'Envoi en cours...' : 'Diffuser maintenant' }}
                </button>
              </footer>
            </form>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { 
  BarChart3, 
  Users, 
  Activity, 
  MessageSquare, 
  Clock,
  TrendingUp,
  FileText,
  Search,
  X,
  AlertTriangle,
  CheckCircle,
  Send
} from 'lucide-vue-next';

const userStore = useUserStore();
const notificationStore = useNotificationStore();
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

const sendToAll = ref(false)
const selectedRecipientIds = ref([])
const searchQuery = ref('')
const type = ref('')
const subject = ref('')
const message = ref('')

const filteredUsers = computed(() => {
  if (!searchQuery.value) return userStore.allUsers
  const searchLower = searchQuery.value.toLowerCase()
  return userStore.allUsers.filter(user =>
    user.first_name.toLowerCase().includes(searchLower) ||
    user.last_name.toLowerCase().includes(searchLower) ||
    user.email.toLowerCase().includes(searchLower)
  )
})

const isFormValid = computed(() => {
  return type.value && subject.value.trim() && message.value.trim() && (sendToAll.value || selectedRecipientIds.value.length > 0)
})

async function handleSendNotification() {
  if (!isFormValid.value) return
  const payload = {
    recipient_ids: sendToAll.value ? [] : selectedRecipientIds.value,
    type: type.value,
    subject: subject.value,
    message: message.value,
    send_to_all: sendToAll.value,
  }
  await notificationStore.sendNotification(payload)
  if (notificationStore.sendSuccess) {
    sendToAll.value = false; selectedRecipientIds.value = []; type.value = ''; subject.value = ''; message.value = '';
  }
}

watch([subject, message, selectedRecipientIds, sendToAll, type], () => {
  notificationStore.sendSuccess = false
  notificationStore.sendError = null
})

onMounted(() => userStore.fetchAllUsers())
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
  gap: 0.65rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  color: rgba(255, 255, 255, 0.7);
  padding: 15px 19px;
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
  margin: 1.2rem 0 0.8rem 0;
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

/* === Dashboard Admin === */
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

/* === States === */
.state-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  font-weight: 500;
  font-size: 0.9rem;
}

.state-message.loading {
  background: rgba(37, 99, 235, 0.1);
  color: rgba(37, 99, 235, 0.9);
  border: 1px solid rgba(37, 99, 235, 0.2);
}

.state-message.error {
  background: rgba(239, 68, 68, 0.1);
  color: rgba(239, 68, 68, 0.9);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.state-message.success {
  background: rgba(16, 185, 129, 0.1);
  color: rgba(16, 185, 129, 0.9);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* === Notification Form === */
.notification-form {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 2rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.notification-form::before {
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

.notification-form:hover::before {
  transform: scaleX(1);
}

.notification-form:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(37, 99, 235, 0.3);
  transform: translateY(-2px);
}

/* === Form Sections === */
.form-section {
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section-title h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
}

.section-icon {
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

/* === Checkbox Wrapper === */
.checkbox-wrapper {
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.checkbox-wrapper:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(37, 99, 235, 0.3);
}

.custom-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--primary);
}

.checkbox-wrapper label {
  color: white;
  font-weight: 500;
  cursor: pointer;
  margin: 0;
}

/* === Search Box === */
.search-box {
  position: relative;
  margin-bottom: 1.5rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-input:focus {
  outline: none;
  border-color: rgba(37, 99, 235, 0.5);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.spinner-small {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  color: var(--primary);
}

/* === Selection Display === */
.selection-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  background: rgba(37, 99, 235, 0.1);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(37, 99, 235, 0.2);
}

.badge-count {
  font-weight: 700;
  color: #3b82f6;
  font-size: 0.85rem;
}

.btn-clear {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.btn-clear:hover {
  color: #dc2626;
}

/* === Modern Select Multiple === */
.modern-select-multiple {
  width: 100%;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem;
  height: 200px;
  font-family: inherit;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.modern-select-multiple:focus {
  outline: none;
  border-color: rgba(37, 99, 235, 0.5);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.modern-select-multiple option {
  background: #1e293b;
  color: white;
  padding: 0.5rem;
}

.hint {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

.hint b {
  color: var(--primary);
  font-weight: 600;
}

/* === Form Groups === */
.grid-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.75rem;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: rgba(37, 99, 235, 0.5);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-select option {
  background: #1e293b;
  color: white;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

/* === Form Footer === */
.form-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
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
  white-space: nowrap;
  min-width: 180px;
  min-height: 44px;
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.action-btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* === Animations === */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
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
  
  .dashboard-title {
    font-size: 1.4rem;
  }
  
  .notification-form {
    padding: 1.5rem;
  }
  
  .grid-inputs {
    grid-template-columns: 1fr;
  }
  
  .form-footer {
    justify-content: center;
  }
  
  .action-btn {
    width: 100%;
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