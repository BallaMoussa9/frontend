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

          <RouterLink :to="{name:'Dialogue'}" class="menu-item active" @click="closeSidebar">
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
        <div class="conversation-page" :class="{ 'mobile-chat-active': chatStore.selectedRecipient }">
          <!-- Header -->
          <header class="dashboard-header">
            <div class="header-content">
              <h1 class="dashboard-title">
                <span class="title-icon">
                  <MessageSquare :size="24" />
                </span>
                Messagerie Administrateur
              </h1>
              <p class="dashboard-subtitle">Communiquez avec les utilisateurs de l'hôpital</p>
            </div>
          </header>

          <!-- Chat Container -->
          <div class="chat-main-container">
            <!-- User List Panel -->
            <aside class="user-list-panel">
              <div class="panel-header">
                <h4 class="panel-title">Tous les utilisateurs</h4>
                <span class="user-count">{{ userStore.allUsers.length }}</span>
              </div>
              <div class="scrollable-user-area">
                <div v-if="userStore.loading && userStore.allUsers.length === 0" class="status-message loading-message">
                  <div class="spinner"></div>
                  <p>Chargement...</p>
                </div>
                <ul v-else class="user-list">
                  <li
                    v-for="user in userStore.allUsers"
                    :key="user.id"
                    :class="{ 'user-active': chatStore.selectedRecipient?.id === user.id, 'user-self': user.id === authStore.user?.id }"
                    @click="handleStartChat(user)"
                  >
                    <img :src="getUserPhoto(user)" :alt="user.first_name" class="user-avatar" />
                    <div class="user-details">
                      <span class="user-name">
                        {{ user.first_name }} {{ user.last_name }} 
                        <span v-if="user.id === authStore.user?.id" class="me-tag">(Moi)</span>
                      </span>
                      <small class="user-role-text">
                        {{ user.roles?.[0]?.name || 'Utilisateur' }}
                      </small>
                    </div>
                  </li>
                </ul>
              </div>
            </aside>

            <!-- Chat Display Area -->
            <div class="chat-display-area" v-if="chatStore.selectedRecipient">
              <div class="chat-header">
                <button class="btn-back-mobile" @click="chatStore.selectedRecipient = null">
                  <ArrowLeft :size="16" /> Retour
                </button>

                <img :src="chatStore.recipientProfilePhoto" :alt="chatStore.recipientName" class="recipient-avatar" />
                
                <div class="recipient-info">
                  <h4 class="chat-recipient-name">{{ chatStore.recipientName }}</h4>
                  <span class="role-badge">{{ chatStore.selectedRecipient.roles?.[0]?.name || 'Utilisateur' }}</span>
                </div>
              </div>

              <div class="messages-thread" ref="messagesContainer">
                <div v-if="chatStore.messages.length === 0 && !chatStore.loading" class="status-message no-messages">
                    <div class="empty-icon">
                      <MessageSquare :size="40" />
                    </div>
                    <p>Dites bonjour !</p>
                </div>
                <div
                  v-for="msg in chatStore.messages"
                  :key="msg.id"
                  :class="['message-item', chatStore.isMyMessage(msg) ? 'message-admin-sender' : 'message-other-user']"
                >
                  <div class="message-bubble">{{ msg.content }}</div>
                  <span class="message-timestamp">{{ formatTimestamp(msg.created_at) }}</span>
                </div>
              </div>

              <form @submit.prevent="sendChatMessage" class="message-input-form">
                <input v-model="newMessage" type="text" placeholder="Message..." required class="message-input-field" />
                <button type="submit" :disabled="chatStore.sending || !newMessage.trim()" class="send-button">
                  Envoyer
                </button>
              </form>
            </div>

            <!-- Empty State -->
            <div v-else class="chat-empty-state">
              <div class="empty-content">
                <div class="empty-icon">
                  <MessageSquare :size="40" />
                </div>
                <h3>Sélectionnez un utilisateur</h3>
                <p>Choisissez un utilisateur dans la liste pour commencer une conversation</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue';
import { useChatStore } from '@/stores/chatStore';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStores';
import { 
  BarChart3, 
  Users, 
  Activity, 
  MessageSquare, 
  Clock,
  TrendingUp,
  FileText,
  ArrowLeft
} from 'lucide-vue-next';

const chatStore = useChatStore();
const userStore = useUserStore();
const authStore = useAuthStore();
const newMessage = ref('');
const messagesContainer = ref(null);
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

function scrollMessagesToBottom() {
    nextTick(() => {
        if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    });
}

const getUserPhoto = (user) => {
    if (!user) return ''; 
    if (user.profile_photo_url) return user.profile_photo_url;
    const firstLetter = (user.first_name ? user.first_name.charAt(0) : 'U').toUpperCase();
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23002580'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='20' fill='%23ffffff' font-family='Arial'%3E${firstLetter}%3C/text%3E%3C/svg%3E`;
};

async function handleStartChat(user) {
    if (user.id === authStore.user?.id) return;
    await chatStore.startChatWithUser(user);
    scrollMessagesToBottom();
}

const formatTimestamp = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

async function sendChatMessage() {
    if (!newMessage.value.trim()) return;
    if (await chatStore.sendMessage(newMessage.value.trim())) {
        newMessage.value = '';
        scrollMessagesToBottom();
    }
}

watch(() => authStore.user?.id, async (id) => {
    if (id) { await userStore.fetchAllUsers(); await chatStore.fetchConversations(); }
}, { immediate: true });

watch(() => chatStore.messages, () => scrollMessagesToBottom(), { deep: true });
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

/* === Conversation Page === */
.conversation-page {
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
  display: flex;
  flex-direction: column;
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
  position: relative;
  z-index: 2;
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

/* === Chat Container === */
.chat-main-container {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  flex: 1;
  height: calc(100vh - 200px);
  position: relative;
}

.chat-main-container::before {
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

.chat-main-container:hover::before {
  transform: scaleX(1);
}

/* === User List Panel === */
.user-list-panel {
  width: 320px;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.02);
  position: relative;
  z-index: 2;
}

.panel-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.user-count {
  background: rgba(37, 99, 235, 0.2);
  color: #3b82f6;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.scrollable-user-area {
  flex: 1;
  overflow-y: auto;
}

.user-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.user-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1rem;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.user-list li::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.1), transparent);
  transition: left 0.5s ease;
}

.user-list li:hover::before {
  left: 100%;
}

.user-list li:hover {
  background: rgba(255, 255, 255, 0.05);
}

.user-list li.user-active {
  background: rgba(37, 99, 235, 0.1);
  border-left: 4px solid #3b82f6;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  color: white;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.me-tag {
  color: #10b981;
  font-size: 0.75rem;
  font-weight: 600;
}

.user-role-text {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

/* === Chat Display Area === */
.chat-display-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.02);
  position: relative;
  z-index: 2;
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
}

.btn-back-mobile {
  display: none;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  margin-right: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-back-mobile:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(37, 99, 235, 0.4);
}

.recipient-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.recipient-info {
  flex: 1;
  min-width: 0;
}

.chat-recipient-name {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.role-badge {
  background: rgba(37, 99, 235, 0.2);
  color: #3b82f6;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* === Messages Thread === */
.messages-thread {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-item {
  max-width: 75%;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-admin-sender {
  align-self: flex-end;
}

.message-other-user {
  align-self: flex-start;
}

.message-bubble {
  padding: 0.75rem 1rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  word-wrap: break-word;
}

.message-admin-sender .message-bubble {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-color: rgba(59, 130, 246, 0.3);
}

.message-timestamp {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.25rem;
  align-self: flex-end;
}

.message-admin-sender .message-timestamp {
  align-self: flex-end;
}

.message-other-user .message-timestamp {
  align-self: flex-start;
}

/* === Message Input Form === */
.message-input-form {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
}

.message-input-field {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  outline: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.message-input-field::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.message-input-field:focus {
  border-color: rgba(37, 99, 235, 0.5);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.send-button {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.send-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
}

.send-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* === Status Messages === */
.status-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.6);
}

.loading-message {
  flex-direction: column;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-messages {
  flex-direction: column;
}

.empty-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 1rem;
}

/* === Empty State === */
.chat-empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.02);
  position: relative;
  z-index: 2;
}

.empty-content {
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
}

.empty-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 0.5rem 0;
}

.empty-content p {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
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
  .conversation-page {
    padding: 1rem;
  }
  
  .dashboard-header {
    padding: 1rem;
  }
  
  .dashboard-title {
    font-size: 1.4rem;
  }
  
  .chat-main-container {
    height: calc(100vh - 150px);
  }
  
  .chat-display-area {
    position: fixed;
    top: 64px;
    left: 0;
    width: 100%;
    height: calc(100vh - 64px);
    z-index: 1000;
    display: none;
  }

  .mobile-chat-active .chat-display-area {
    display: flex;
  }
  
  .btn-back-mobile {
    display: flex;
  }
  
  .user-list-panel {
    width: 100%;
  }
  
  .message-item {
    max-width: 85%;
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