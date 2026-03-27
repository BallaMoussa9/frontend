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
          <RouterLink :to="{name:'NurseDashboard', params: { id: currentNurseIdComputed }}" class="menu-item" @click="closeSidebar">
            <BarChart3 :size="20" class="menu-icon" /> Dashboard
          </RouterLink>
          
          <div class="menu-divider">Gestion des Patients</div>
          
          <RouterLink :to="{name:'PatientList', params: { id: currentNurseIdComputed }}" class="menu-item" @click="closeSidebar">
            <Users :size="20" class="menu-icon" /> Patients
          </RouterLink>
          <RouterLink :to="{name:'VitalSignsForm', params: { id: currentNurseIdComputed }}" class="menu-item" @click="closeSidebar">
            <Activity :size="20" class="menu-icon" /> Signes Vitaux
          </RouterLink>
          <RouterLink :to="{name:'ActivityReport', params: { id: currentNurseIdComputed }}" class="menu-item" @click="closeSidebar">
            <ClipboardList :size="20" class="menu-icon" /> Rapports d'Activité
          </RouterLink>

          <div class="menu-divider">Communication</div>

          <RouterLink :to="{name:'NoticeBoard', params: { id: currentNurseIdComputed }}" class="menu-item active" @click="closeSidebar">
            <Bell :size="20" class="menu-icon" /> Messagerie
          </RouterLink>
          <RouterLink :to="{name:'NurseProfile', params: { id: currentNurseIdComputed }}" class="menu-item" @click="closeSidebar">
            <User :size="20" class="menu-icon" /> Mon Profil
          </RouterLink>
          <RouterLink :to="{name:'CareNotes', params: { id: currentNurseIdComputed }}" class="menu-item" @click="closeSidebar">
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
        <div class="dashboard-admin">
          <!-- Header -->
          <header class="dashboard-header">
            <div class="header-content">
              <h1 class="dashboard-title">Messagerie Infirmière</h1>
              <p class="dashboard-subtitle">Communications et conversations avec l'équipe</p>
            </div>
            <button @click="refreshData" class="refresh-btn">
              <RefreshCw :size="18" />
              Actualiser
            </button>
          </header>

          <!-- Messages Feedback -->
          <TransitionGroup name="fade">
            <div v-if="chatStore.loadingConversations || chatStore.loading" key="loading" class="feedback-message loading-message">
              <RefreshCw :size="20" class="spinning" />
              <span>Chargement...</span>
            </div>
            <div v-if="chatStore.error" key="error" class="feedback-message error-message">
              <XCircle :size="20" />
              <span>{{ chatStore.error }}</span>
            </div>
            <div v-if="userStore.error" key="error" class="feedback-message error-message">
              <XCircle :size="20" />
              <span>{{ userStore.error }}</span>
            </div>
          </TransitionGroup>

          <!-- Chat Container -->
          <div v-if="!chatStore.loadingConversations && !chatStore.loading" class="chat-container">
            <div class="sidebar-contacts">
              <div class="tab-buttons">
                <button
                  :class="{ active: activeTab === 'conversations' }"
                  @click="activeTab = 'conversations'; chatStore.fetchConversations()"
                >
                  Chats ({{ chatStore.getConversations?.length || 0 }})
                </button>
                <button
                  :class="{ active: activeTab === 'users' }"
                  @click="activeTab = 'users'; loadAllUsersToChat()"
                >
                  Utilisateurs ({{ filteredUsersForChat?.length || 0 }})
                </button>
              </div>

              <div v-if="activeTab === 'conversations'" class="contact-list-panel">
                <p v-if="chatStore.loadingConversations" class="info-text">Chargement des conversations...</p>
                <p v-else-if="chatStore.error" class="error-text">{{ chatStore.error }}</p>
                <p v-else-if="chatStore.getConversations?.length === 0" class="info-text">
                  Aucune conversation existante.
                </p>

                <ul v-else class="list-unstyled">
                  <li
                    v-for="conv in chatStore.getConversations"
                    :key="conv.id"
                    :class="{ active: conv.id === chatStore.currentConversation?.id }"
                    @click="chatStore.startChatWithConversation(conv.id)"
                  >
                    <div class="contact-info">
                      <img :src="getRecipientPhotoFromConv(conv)" alt="Photo" class="profile-photo-small" />
                      <span class="contact-name">
                        {{ getRecipientFromConv(conv).first_name }} {{ getRecipientFromConv(conv).last_name }}
                      </span>
                    </div>
                    <div class="last-message">
                      {{ conv.messages[0]?.content.substring(0, 30) || 'Démarrer le chat' }}
                    </div>
                  </li>
                </ul>
              </div>

              <div v-else-if="activeTab === 'users'" class="contact-list-panel">
                <div class="search-box">
                  <input v-model="searchQuery" @input="searchUsers" placeholder="Rechercher un utilisateur..." />
                </div>

                <p v-if="userStore.loading" class="info-text">Chargement des utilisateurs...</p>
                <p v-else-if="userStore.error" class="error-text">{{ userStore.error }}</p>
                <p v-else-if="filteredUsersForChat?.length === 0" class="info-text">
                  {{ searchQuery ? 'Aucun utilisateur trouvé.' : 'Cliquez sur un nom pour chatter.' }}
                </p>

                <ul v-else class="list-unstyled">
                  <li
                    v-for="user in filteredUsersForChat"
                    :key="user.id"
                    :class="{ 'active-contact': chatStore.selectedRecipient?.id === user.id }"
                    @click="startChatWithUser(user)"
                  >
                    <div class="contact-info">
                      <img :src="getUserPhoto(user)" alt="Photo" class="profile-photo-small" />
                      <span class="contact-name">
                        {{ user.first_name }} {{ user.last_name }}
                      </span>
                    </div>
                    <div class="user-role">
                      {{ user.roles && user.roles.length > 0 ? user.roles[0].name : 'Utilisateur' }}
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div class="chat-box">
              <p v-if="chatStore.error" class="error-text chat-error-display">{{ chatStore.error }}</p>

              <div v-if="chatStore.loading" class="chat-loading">Chargement des messages...</div>

              <div
                v-else-if="!chatStore.currentConversation?.id && !chatStore.selectedRecipient?.id"
                class="chat-placeholder"
              >
                Sélectionnez une personne pour commencer à chatter.
              </div>

              <template v-else>
                <div class="chat-header">
                  <img :src="chatStore.recipientProfilePhoto" alt="Photo" class="profile-photo-large" />
                  <h2>Chat avec {{ chatStore.recipientName }}</h2>
                </div>

                <div class="chat-thread" ref="chatThreadRef">
                  <div
                    v-for="msg in [...chatStore.messages].reverse()"
                    :key="msg.id"
                    :class="['message', { 'my-message': chatStore.isMyMessage(msg), 'their-message': !chatStore.isMyMessage(msg) }]"
                  >
                    <div class="message-bubble">
                      {{ msg.content }}
                      <span class="message-time">{{ formatTime(msg.created_at) }}</span>
                    </div>
                  </div>
                </div>

                <form @submit.prevent="handleSendMessage" class="message-input-form">
                  <input
                    v-model="messageInput"
                    type="text"
                    placeholder="Écrire un message..."
                    required
                    :disabled="chatStore.loading"
                  />
                  <button type="submit" :disabled="chatStore.sending">
                    <div v-if="chatStore.sending" class="button-content">
                      <Send :size="16" />
                      <span>Envoi...</span>
                    </div>
                    <div v-else class="button-content">
                      <Send :size="16" />
                      <span>Envoyer</span>
                    </div>
                  </button>
                </form>
              </template>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import NurseLayout from '@/layouts/NurseLayout.vue'
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStores'
import { useUserStore } from '@/stores/userStore'
import {
  Users, Activity, Clock, RefreshCw, Bell, CheckCircle, XCircle, Search,
  BarChart3, User, FileText, LogOut, Heart, Thermometer, Wind, AlertTriangle,
  History, Hospital, Ruler, Beaker, Download, Save, ChevronRight, X,
  ClipboardList, MessageSquare, Plus, Edit, Trash2, Eye, Reply, Check, Send
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()
const authStore = useAuthStore()
const userStore = useUserStore()

const messageInput = ref('')
const chatThreadRef = ref(null)
const activeTab = ref('conversations')
const searchQuery = ref('')
const isSidebarOpen = ref(false)

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

// Refresh function
function refreshData() {
  if (activeTab.value === 'conversations') {
    chatStore.fetchConversations()
  } else {
    loadAllUsersToChat()
  }
}

const currentNurseIdComputed = computed(() => {
  // Préfère l'ID de l'utilisateur connecté
  if (authStore.user?.id) return Number(authStore.user.id)
  // Utilise le paramètre de route comme fallback
  if (route.params.id) return Number(route.params.id)
  return null
})

const loadAllUsersToChat = async () => {
  if (!currentNurseIdComputed.value) return
  if (userStore.allUsers?.length === 0 || userStore.error) {
    await userStore.fetchAllUsers()
  }
}

// ✅ C'est cette computed property qui filtre l'utilisateur courant
const filteredUsersForChat = computed(() => {
  const allUsers = Array.isArray(userStore.allUsers) ? userStore.allUsers : []
  const currentId = currentNurseIdComputed.value

  // Filtre tous les utilisateurs dont l'ID est différent de l'ID courant
  let users = currentId ? allUsers.filter((u) => u.id !== currentId) : allUsers
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    users = users.filter(
      (u) =>
        u.first_name?.toLowerCase().includes(q) ||
        u.last_name?.toLowerCase().includes(q) ||
        u.roles?.[0]?.name?.toLowerCase().includes(q)
    )
  }
  return users
})

const getUserPhoto = (user) => {
  if (user?.profile_photo_url) return user.profile_photo_url
  if (user?.profile_photo_path) {
    const path = user.profile_photo_path.replace(/^public\//, '')
    // Assurez-vous que l'URL de base est correcte pour votre environnement
    return `http://localhost:8000/storage/${path}` 
  }
  return `https://via.placeholder.com/40/28a745/ffffff?text=${user?.first_name?.[0] ?? 'U'}`
}

const getRecipientFromConv = (conv) => {
  const id = currentNurseIdComputed.value
  // Retourne l'utilisateur qui n'est pas l'utilisateur courant
  return conv.users?.find((u) => u.id !== id) ?? { first_name: 'Inconnu', last_name: '' }
}

const getRecipientPhotoFromConv = (conv) => getUserPhoto(getRecipientFromConv(conv))

const startChatWithUser = async (user) => {
  await chatStore.startChatWithUser(user)
  activeTab.value = 'conversations'
  searchQuery.value = ''
  nextTick(scrollToBottom)
}

const scrollToBottom = () => {
  const thread = chatThreadRef.value
  if (thread) thread.scrollTop = thread.scrollHeight
}

const handleSendMessage = async () => {
  if (!messageInput.value.trim()) return
  const content = messageInput.value.trim()
  messageInput.value = ''
  const success = await chatStore.sendMessage(content)
  if (!success) messageInput.value = content
}

const formatTime = (isoString) =>
  isoString ? new Date(isoString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''

onMounted(() => {
  if (authStore.user?.id) chatStore.fetchConversations()
})

// S'assurer que le chat défile au bas lorsqu'on change de conversation ou reçoit des messages
watch(() => chatStore.messages.length, () => {
    nextTick(scrollToBottom)
})

watch(() => chatStore.currentConversation, () => {
    nextTick(scrollToBottom)
})
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
.tabs-section, .notices-section, .messages-section, .alerts-section {
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

/* === Tabs === */
.tab-navigation {
  display: flex;
  gap: 1rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.tab-btn.active {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.3), rgba(16, 185, 129, 0.2));
  color: white;
}

/* === Cards === */
.notice-card, .message-card, .alert-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.notice-card:hover, .message-card:hover, .alert-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

/* === Notice Card === */
.notice-header, .message-header, .alert-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.notice-meta, .message-sender, .alert-severity {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notice-type, .notice-priority, .message-status, .alert-time {
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.notice-type.meeting, .notice-priority.high {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.notice-type.protocol, .notice-priority.medium {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

.notice-type.announcement, .notice-priority.low {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

.message-status.unread {
  background: rgba(37, 99, 235, 0.2);
  color: #3b82f6;
}

.message-status.read {
  background: rgba(107, 114, 128, 0.2);
  color: #94a3b8;
}

.notice-actions, .message-actions, .alert-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn, .view-btn, .reply-btn, .acknowledge-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.edit-btn {
  background: rgba(37, 99, 235, 0.2);
  color: #3b82f6;
}

.edit-btn:hover {
  background: rgba(37, 99, 235, 0.3);
}

.delete-btn {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

.view-btn {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.view-btn:hover {
  background: rgba(16, 185, 129, 0.3);
}

.reply-btn {
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
}

.reply-btn:hover {
  background: rgba(139, 92, 246, 0.3);
}

.acknowledge-btn {
  background: rgba(34, 197, 94, 0.2);
  color: #10b981;
}

.acknowledge-btn:hover {
  background: rgba(34, 197, 94, 0.3);
}

.notice-content, .message-content, .alert-content {
  margin-bottom: 1rem;
}

.notice-title, .message-title, .alert-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
}

.notice-description, .message-text, .alert-description {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0;
}

.notice-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notice-author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

/* === Message Card === */
.sender-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.sender-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sender-name {
  font-weight: 600;
  color: white;
}

.message-time {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

/* === Alert Card === */
.alert-card.critical {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.1);
}

.alert-card.high {
  border-color: rgba(245, 158, 11, 0.3);
  background: rgba(245, 158, 11, 0.1);
}

.alert-card.medium {
  border-color: rgba(37, 99, 235, 0.3);
  background: rgba(37, 99, 235, 0.1);
}

.alert-card.low {
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.1);
}

.alert-severity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #f87171;
  font-weight: 600;
}

.alert-time {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

/* === Buttons === */
.create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
}

/* === Empty State === */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.6);
}

.empty-icon {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h5 {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
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
  
  .tab-navigation {
    flex-direction: column;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

/* ✅ Champ d’envoi */
.message-input-form {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border-top: 1px solid #e3e9f0;
  background-color: #fff;
  gap: 10px;
}

.message-input-form input {
  flex: 1;
  padding: 12px 18px;
  border-radius: 20px;
  border: 1px solid #cfd8e3;
  font-size: 1em;
  background: #f8f9fb;
  outline: none;
}

.message-input-form input:focus {
  border-color: #4a6cf7;
  background: white;
}

.message-input-form button {
  background-color: #4a6cf7;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 18px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.message-input-form button:hover {
  background-color: #3c5be0;
  transform: scale(1.05);
}

/* ✅ Placeholder si aucune conversation */
.chat-placeholder {
  margin: auto;
  text-align: center;
  color: #777;
  font-size: 1.1em;
}

.error-text {
  color: #d9534f;
  text-align: center;
}

/* === Chat Container === */
.chat-container {
  display: flex;
  height: calc(100vh - 200px);
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* === Sidebar Contacts === */
.sidebar-contacts {
  width: 300px;
  background: rgba(255, 255, 255, 0.05);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  padding: 10px 0;
}

.tab-buttons {
  display: flex;
  justify-content: space-around;
  padding: 10px;
  gap: 0.5rem;
}

.tab-buttons button {
  flex: 1;
  margin: 0 5px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 8px;
  font-weight: 600;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease-in-out;
}

.tab-buttons button:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.tab-buttons button.active {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.3), rgba(16, 185, 129, 0.2));
  color: white;
  border-color: rgba(37, 99, 235, 0.3);
}

.contact-list-panel {
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px 0;
}

.list-unstyled {
  list-style: none;
  padding: 0;
  margin: 0;
}

.list-unstyled li {
  display: flex;
  flex-direction: column;
  padding: 10px 15px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.list-unstyled li:hover {
  background: rgba(255, 255, 255, 0.1);
}

.list-unstyled li.active,
.list-unstyled li.active-contact {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(16, 185, 129, 0.1));
  color: white;
}

.contact-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.profile-photo-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.contact-name {
  font-weight: 600;
  font-size: 0.95em;
}

.list-unstyled li.active .contact-name,
.list-unstyled li.active-contact .contact-name {
  color: white;
}

.last-message {
  font-size: 0.85em;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 5px;
}

.list-unstyled li.active .last-message {
  color: rgba(255, 255, 255, 0.8);
}

.user-role {
  font-size: 0.8em;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
}

.search-box {
  padding: 10px;
}

.search-box input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.9em;
  max-width: 250px;
  margin: 0 auto;
  display: block;
}

.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-box input:focus {
  outline: none;
  border-color: rgba(37, 99, 235, 0.5);
  background: rgba(255, 255, 255, 0.15);
}

/* === Chat Box === */
.chat-box {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.05);
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.1);
}

.profile-photo-large {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
}

.chat-header h2 {
  font-size: 1.1em;
  color: white;
  margin: 0;
}

/* === Chat Thread === */
.chat-thread {
  flex-grow: 1;
  display: flex;
  flex-direction: column-reverse;
  padding: 20px;
  overflow-y: auto;
  background: transparent;
}

.message {
  display: flex;
  margin-bottom: 10px;
}

.message-bubble {
  max-width: 60%;
  padding: 10px 15px;
  border-radius: 16px;
  position: relative;
  font-size: 0.95em;
  line-height: 1.4;
  word-break: break-word;
  backdrop-filter: blur(10px);
}

.my-message {
  justify-content: flex-end;
}

.my-message .message-bubble {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.3), rgba(16, 185, 129, 0.2));
  color: white;
  border-bottom-right-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.their-message {
  justify-content: flex-start;
}

.their-message .message-bubble {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-bottom-left-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.message-time {
  display: block;
  font-size: 0.75em;
  margin-top: 5px;
  text-align: right;
  opacity: 0.7;
}

/* === Message Input Form === */
.message-input-form {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.1);
  gap: 10px;
}

.message-input-form input {
  flex: 1;
  padding: 12px 18px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 1em;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  outline: none;
}

.message-input-form input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.message-input-form input:focus {
  border-color: rgba(37, 99, 235, 0.5);
  background: rgba(255, 255, 255, 0.15);
}

.message-input-form button {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 18px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-input-form button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--secondary-dark) 100%);
}

.message-input-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* === Chat Placeholder === */
.chat-placeholder {
  margin: auto;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.1em;
  padding: 2rem;
}

.chat-loading {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.8);
}

/* === Info/Error Text === */
.info-text, .error-text {
  text-align: center;
  padding: 1rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9em;
}

.error-text {
  color: #f87171;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  margin: 10px;
}

.chat-error-display {
  margin: 10px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  padding: 10px;
}

/* === Responsive Design === */
@media (max-width: 768px) {
  .chat-container {
    flex-direction: column;
    height: calc(100vh - 150px);
  }
  
  .sidebar-contacts {
    width: 100%;
    height: 200px;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .chat-box {
    flex: 1;
  }
  
  .message-bubble {
    max-width: 80%;
  }
}
</style>