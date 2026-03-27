<template>
  <SidebarLayout>
    <section class="messages-section">
      <div class="chat-wrapper">
        <aside class="contacts-sidebar">
          <div class="tabs">
            <button :class="{ active: activeTab === 'conversations' }" @click="activeTab = 'conversations'">
              <MessageSquare :size="18" /> Chats
            </button>
            <button :class="{ active: activeTab === 'contacts' }" @click="activeTab = 'contacts'; fetchAllUsers()">
              <Search :size="18" /> Nouveau
            </button>
          </div>

          <div class="search-box">
            <div class="search-input-wrapper">
              <Search :size="18" class="search-icon" />
              <input 
                v-model="searchQuery" 
                placeholder="Rechercher un contact..." 
                @input="searchUsers"
              />
            </div>
          </div>

          <div v-if="activeTab === 'conversations'" class="scroll-area">
            <div v-if="chatStore.conversations.length === 0" class="empty-notif">Aucun message.</div>
            <div v-for="conv in chatStore.conversations" :key="conv.id" 
                 :class="['contact-item', { active: conv.id === chatStore.currentConversation?.id }]"
                 @click="startChatFromConversation(conv)">
              <img :src="getRecipientPhoto(getRecipientFromConv(conv))" class="avatar">
              <div class="contact-info">
                <div class="top-line">
                  <span class="name">{{ getRecipientFromConv(conv).first_name }}</span>
                  <span class="time">{{ conv.messages[0] ? formatTime(conv.messages[0].created_at) : '' }}</span>
                </div>
                <p class="last-msg">{{ conv.messages[0]?.content || 'Démarrer le chat' }}</p>
              </div>
            </div>
          </div>

          <div v-else class="scroll-area">
            <div v-for="user in filteredUsers" :key="user.id" 
                 :class="['contact-item', { 'active-selection': user.id === chatStore.selectedRecipient?.id }]" 
                 @click="startChatWithNewUser(user)">
              <img :src="getRecipientPhoto(user)" class="avatar">
              <div class="contact-info">
                <span class="name">{{ user.first_name }} {{ user.last_name }}</span>
                <span :class="['role-label', user.roles[0]?.name.toLowerCase()]">
                  {{ user.roles[0]?.name || 'Utilisateur' }}
                </span>
              </div>
            </div>
          </div>
        </aside>

        <main class="chat-window">
          <div class="chat-header">
            <div class="chat-icon">
              <MessageSquare :size="24" />
            </div>
            <h2 class="chat-title">Discussion</h2>
          </div>
          <div v-if="!chatStore.currentConversation" class="no-chat-selected">
            <div class="placeholder-content">
              <Send :size="48" />
              <p>Sélectionnez un contact pour échanger de manière sécurisée.</p>
            </div>
          </div>

          <template v-else>
            <div class="conversation-header">
              <img :src="chatStore.recipientProfilePhoto" class="avatar-small">
              <div class="header-text">
                <h3>{{ chatStore.recipientName }}</h3>
                <span class="online-status">En ligne</span>
              </div>
            </div>

            <div class="message-thread" ref="chatThreadRef">
              <div v-for="msg in chatStore.messages" :key="msg.id" 
                   :class="['msg-bubble-wrapper', chatStore.isMyMessage(msg) ? 'me' : 'them']">
                <div class="bubble">
                  {{ msg.content }}
                  <span class="msg-time">{{ formatTime(msg.created_at) }}</span>
                </div>
              </div>
            </div>

            <footer class="chat-input-area">
              <form @submit.prevent="handleSendMessage" class="input-form">
                <input v-model="messageInput" placeholder="Écrire un message..." :disabled="chatStore.sending" />
                <button type="submit" :disabled="!messageInput.trim() || chatStore.sending">
                  <Send :size="18" v-if="!chatStore.sending" />
                  <Loader2 :size="18" v-else class="animate-spin" />
                </button>
              </form>
            </footer>
          </template>
        </main>
      </div>
    </section>
  </SidebarLayout>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue';
import SidebarLayout from '@/layouts/SidebarLayout.vue';
import { useChatStore } from '@/stores/chatStore';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStores';
import {
  MessageSquare, Search, Send, Users, Clock,
  User, Circle, Loader2, Sparkles, Activity, Heart,
  Zap, Star, Shield, CheckCircle, AlertCircle
} from 'lucide-vue-next';

const chatStore = useChatStore();
const userStore = useUserStore();
const authStore = useAuthStore();

const messageInput = ref('');
const chatThreadRef = ref(null);
const activeTab = ref('conversations');
const searchQuery = ref('');

// --- Logique de recherche ---
const filteredUsers = computed(() => {
  const users = userStore.allUsers.filter(u => u.id !== authStore.user?.id);
  if (!searchQuery.value) return users.slice(0, 10);
  const q = searchQuery.value.toLowerCase();
  return users.filter(u => 
    u.first_name.toLowerCase().includes(q) || 
    u.last_name.toLowerCase().includes(q) ||
    u.roles[0]?.name.toLowerCase().includes(q)
  );
});

const fetchAllUsers = () => userStore.allUsers.length === 0 && userStore.fetchAllUsers();
const searchUsers = () => userStore.allUsers.length === 0 && fetchAllUsers();

// --- Logique de chat ---
const getRecipientFromConv = (conv) => conv.users.find(u => u.id !== authStore.user?.id) || conv.users[0];
const startChatFromConversation = (c) => chatStore.startChatWithUser(getRecipientFromConv(c));
const startChatWithNewUser = (u) => { 
  chatStore.startChatWithUser(u); 
  activeTab.value = 'conversations'; 
  searchQuery.value = ''; 
};

const handleSendMessage = async () => {
  const content = messageInput.value.trim();
  if (!content) return;
  messageInput.value = '';
  const success = await chatStore.sendMessage(content);
  if (success) scrollToBottom();
};

const scrollToBottom = () => nextTick(() => {
  if (chatThreadRef.value) chatThreadRef.value.scrollTop = chatThreadRef.value.scrollHeight;
});

const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

const getRecipientPhoto = (u) => {
  if (u?.profile_photo_url) return u.profile_photo_url;
  return `https://ui-avatars.com/api/?name=${u?.first_name}+${u?.last_name}&background=002580&color=fff`;
};

onMounted(() => chatStore.fetchConversations());
watch(() => chatStore.messages.length, scrollToBottom);
watch(() => chatStore.currentConversation, scrollToBottom);
</script>

<style scoped>
.messages-section {
  --primary: #2563eb;
  --primary-dark: #1e40af;
  --primary-light: #3b82f6;
  --secondary: #10b981;
  --secondary-dark: #059669;
  --accent: #8b5cf6;
  --danger: #ef4444;
  --warning: #f59e0b;
  --success: #22c55e;
  --dark: #0f172a;
  --light: #ffffff;
  --gray: #94a3b8;
  --gray-light: #cbd5e1;
  --gray-dark: #64748b;
  --border: rgba(255, 255, 255, 0.1);
  --shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  --shadow-xl: 0 30px 60px -12px rgba(0, 0, 0, 0.5);
  --radius: 16px;
  
  padding: 2rem;
  height: 100vh;
  width: 100%;
  background: transparent;
  box-sizing: border-box;
  position: relative;
}

.chat-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
}

.chat-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white !important;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
}

.chat-box:hover .chat-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.5);
}

.chat-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: white;
  margin: 0;
  flex: 1;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.chat-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.chat-box:hover::before {
  transform: scaleX(1);
}

.chat-box:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
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

/* Sidebar */
.contacts-sidebar {
  width: 340px;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.tabs {
  display: flex;
  padding: 1.5rem;
  gap: 0.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tabs button {
  flex: 1;
  padding: 0.8rem;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  color: var(--gray);
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  backdrop-filter: blur(10px);
}

.tabs button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.5);
  background: linear-gradient(135deg, var(--primary-dark), var(--secondary-dark));
}

.tabs button.send-btn:hover {
  background: linear-gradient(135deg, var(--primary-dark), var(--secondary-dark));
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.5);
}

.tabs button.active {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
  transform: translateY(-3px);
}

/* Recherche Style */
.search-box {
  padding: 1rem 1.5rem;
  background: rgba(0, 0, 0, 0.1);
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: var(--gray);
  pointer-events: none;
}

.search-input-wrapper input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.8rem;
  border-radius: 25px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.search-input-wrapper input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.search-input-wrapper input:focus {
  border-color: var(--primary);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
  transform: translateY(-2px);
}

/* Liste */
.scroll-area {
  flex: 1;
  overflow-y: auto;
}

.contact-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  animation: fadeIn 0.6s ease-out backwards;
}

.contact-item:nth-child(1) { animation-delay: 0.1s; }
.contact-item:nth-child(2) { animation-delay: 0.2s; }
.contact-item:nth-child(3) { animation-delay: 0.3s; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

.contact-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(5px);
}

.contact-item.active {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(16, 185, 129, 0.2));
  border-left: 4px solid var(--primary);
}

.contact-item.active-selection {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1));
  border-left: 4px solid #8b5cf6;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.contact-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.top-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.4rem;
}

.name {
  font-weight: 800;
  color: white;
  font-size: 1rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.time {
  font-size: 0.75rem;
  color: white;
  font-weight: 600;
  opacity: 0.7;
}

.last-msg {
  font-size: 0.85rem;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  opacity: 0.8;
}

/* Rôles */
.role-label {
  align-self: flex-start;
  font-size: 0.65rem;
  padding: 3px 8px;
  border-radius: 8px;
  font-weight: 800;
  text-transform: uppercase;
  margin-top: 0.4rem;
}

.role-label.doctor, .role-label.docteur {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1));
  color: white !important;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.role-label.patient {
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.2), rgba(251, 146, 60, 0.1));
  color: white !important;
  border: 1px solid rgba(251, 146, 60, 0.3);
}

.role-label.nurse {
  background: linear-gradient(135deg, rgba(107, 114, 128, 0.2), rgba(107, 114, 128, 0.1));
  color: white !important;
  border: 1px solid rgba(107, 114, 128, 0.3);
}

/* Chat Window */
.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  transition: all 0.4s ease;
  position: relative;
}

.chat-window::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.chat-window:hover::before {
  transform: scaleX(1);
}

.chat-window:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
}

.chat-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 1rem;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
}

.avatar-small {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.header-text h3 {
  margin: 0;
  font-size: 1.2rem;
  color: white;
  font-weight: 800;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.online-status {
  font-size: 0.75rem;
  color: #22c55e;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.online-status::before {
  content: '';
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

.message-thread {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.msg-bubble-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 75%;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.msg-bubble-wrapper.me {
  align-self: flex-end;
}

.msg-bubble-wrapper.them {
  align-self: flex-start;
}

.bubble {
  padding: 1rem 1.2rem;
  border-radius: 18px;
  font-size: 0.95rem;
  line-height: 1.4;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  position: relative;
  transition: all 0.3s ease;
}

.bubble:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.me .bubble {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border-bottom-right-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.them .bubble {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  color: white;
  border-bottom-left-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.msg-time {
  font-size: 0.7rem;
  display: block;
  margin-top: 0.5rem;
  opacity: 0.7;
  text-align: right;
  font-weight: 600;
}

/* Input Area */
.chat-input-area {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.input-form {
  display: flex;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.8rem 1.2rem;
  border-radius: 30px;
  align-items: center;
  border: 2px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.input-form:focus-within {
  border-color: var(--primary);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
}

.input-form input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.95rem;
  color: white;
}

.input-form input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.input-form button.send-btn {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-lg);
}

.input-form button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.5);
}

.input-form button:disabled {
  background: var(--gray);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.no-chat-selected {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--gray);
  animation: fadeIn 0.6s ease-out;
}

.no-chat-selected svg {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.3;
  color: var(--primary-light);
}

.no-chat-selected p {
  font-size: 1.1rem;
  font-weight: 600;
  max-width: 300px;
  line-height: 1.5;
}

.empty-notif {
  text-align: center;
  padding: 2rem;
  color: var(--gray);
  font-weight: 600;
}

/* Animations */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Variables CSS */
:root {
  --primary: #2563eb;
  --primary-dark: #1e40af;
  --primary-light: #3b82f6;
  --secondary: #10b981;
  --secondary-dark: #059669;
  --gray: #94a3b8;
  --gray-light: #cbd5e1;
  --dark: #0f172a;
}

.chat-wrapper {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-lg);
  margin-bottom: 2rem;
  margin-top: 2rem;
  max-width: 100%;
  box-sizing: border-box;
  animation: fadeInUp 0.8s ease-out 0.3s both;
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
  height: 90vh;
  display: flex;
  gap: 1rem;
}

.chat-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.chat-wrapper:hover::before {
  transform: scaleX(1);
}

.chat-wrapper:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
}

@media (max-width: 768px) {
  .messages-section {
    padding: 1rem;
  }

  .chat-wrapper {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    backdrop-filter: blur(20px);
    padding: 2rem;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: var(--shadow-lg);
    margin-bottom: 2rem;
    margin-top: 2rem;
    max-width: 100%;
    box-sizing: border-box;
    animation: fadeInUp 0.8s ease-out 0.3s both;
    position: relative;
    overflow: hidden;
    transition: all 0.4s ease;
    height: 90vh;
  }

  .chat-wrapper::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary), var(--secondary));
    transform: scaleX(0);
    transition: transform 0.4s ease;
  }

  .chat-wrapper:hover::before {
    transform: scaleX(1);
  }

  .chat-wrapper:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-xl);
    border-color: var(--primary);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
  }

  .contacts-sidebar {
    width: 280px;
  }

  .tabs {
    padding: 1rem;
  }

  .tabs button {
    padding: 0.6rem;
    font-size: 0.85rem;
  }

  .contact-item {
    padding: 0.8rem;
  }

  .avatar {
    width: 40px;
    height: 40px;
  }

  .chat-header {
    padding: 1rem;
  }

  .message-thread {
    padding: 1rem;
  }

  .chat-input-area {
    padding: 1rem;
  }

  .input-form {
    padding: 0.6rem 1rem;
  }

  .input-form button {
    width: 38px;
    height: 38px;
  }
}
</style>