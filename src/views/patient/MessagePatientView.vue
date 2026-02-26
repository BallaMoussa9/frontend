<template>
  <SidebarLayout>
    <section class="messages-section">
      <div class="chat-wrapper">
        <aside class="contacts-sidebar">
          <div class="tabs">
            <button :class="{ active: activeTab === 'conversations' }" @click="activeTab = 'conversations'">
              <i class="fas fa-comments"></i> Chats
            </button>
            <button :class="{ active: activeTab === 'contacts' }" @click="activeTab = 'contacts'; fetchAllUsers()">
              <i class="fas fa-search"></i> Nouveau
            </button>
          </div>

          <div class="search-box">
            <div class="search-input-wrapper">
              <i class="fas fa-search search-icon"></i>
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
          <div v-if="!chatStore.currentConversation" class="no-chat-selected">
            <div class="placeholder-content">
              <i class="fas fa-paper-plane"></i>
              <p>Sélectionnez un contact pour échanger de manière sécurisée.</p>
            </div>
          </div>

          <template v-else>
            <header class="chat-header">
              <img :src="chatStore.recipientProfilePhoto" class="avatar-small">
              <div class="header-text">
                <h3>{{ chatStore.recipientName }}</h3>
                <span class="online-status">En ligne</span>
              </div>
            </header>

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
                  <i v-if="!chatStore.sending" class="fas fa-location-arrow"></i>
                  <span v-else class="loader-mini"></span>
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
.messages-section { padding: 20px; height: 100vh; background-color: #f8fafc; }
.chat-wrapper { display: flex; height: 85vh; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }

/* Sidebar */
.contacts-sidebar { width: 340px; border-right: 1px solid #e2e8f0; background: #ffffff; display: flex; flex-direction: column; }
.tabs { display: flex; padding: 15px; gap: 8px; border-bottom: 1px solid #f1f5f9; }
.tabs button { flex: 1; padding: 10px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; color: #64748b; background: #f1f5f9; transition: 0.3s; }
.tabs button.active { background: #002580; color: white; }

/* Recherche Style Corrigé */
.search-box { padding: 12px 15px; background-color: #ffffff; }
.search-input-wrapper { position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 15px; color: #94a3b8; font-size: 0.9rem; pointer-events: none; }
.search-input-wrapper input { 
  width: 100%; 
  padding: 10px 15px 10px 42px; 
  border-radius: 25px; 
  border: 1px solid #e2e8f0; 
  background-color: #f8fafc; 
  font-size: 0.9rem; 
  outline: none; 
  transition: 0.2s;
}
.search-input-wrapper input:focus { border-color: #002580; background-color: #fff; box-shadow: 0 0 0 3px rgba(0, 37, 128, 0.05); }

/* Liste */
.scroll-area { flex: 1; overflow-y: auto; }
.contact-item { display: flex; gap: 12px; padding: 15px; cursor: pointer; border-bottom: 1px solid #f8fafc; transition: 0.2s; }
.contact-item:hover { background: #f8fafc; }
.contact-item.active { background: #eef2ff; border-left: 4px solid #002580; }
.avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 1px solid #e2e8f0; }

.contact-info { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; }
.top-line { display: flex; justify-content: space-between; margin-bottom: 4px; }
.name { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
.time { font-size: 0.75rem; color: #94a3b8; }
.last-msg { font-size: 0.85rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Rôles */
.role-label { align-self: flex-start; font-size: 0.65rem; padding: 2px 8px; border-radius: 4px; font-weight: 800; text-transform: uppercase; margin-top: 4px; }
.role-label.doctor, .role-label.docteur { background: #dbeafe; color: #1e40af; }
.role-label.patient { background: #fef3c7; color: #92400e; }
.role-label.nurse { background: #f1f5f9; color: #475569; }

/* Chat Window */
.chat-window { flex: 1; display: flex; flex-direction: column; background: #ffffff; }
.chat-header { padding: 15px 25px; border-bottom: 1px solid #e2e8f0; display: flex; gap: 15px; align-items: center; }
.avatar-small { width: 42px; height: 42px; border-radius: 50%; }
.header-text h3 { margin: 0; font-size: 1.05rem; color: #1e293b; }
.online-status { font-size: 0.75rem; color: #10b981; font-weight: 600; }

.message-thread { flex: 1; padding: 25px; overflow-y: auto; background: #f1f5f9; display: flex; flex-direction: column; gap: 15px; }
.msg-bubble-wrapper { display: flex; flex-direction: column; max-width: 75%; }
.msg-bubble-wrapper.me { align-self: flex-end; }
.msg-bubble-wrapper.them { align-self: flex-start; }
.bubble { padding: 12px 18px; border-radius: 18px; font-size: 0.95rem; line-height: 1.4; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.me .bubble { background: #002580; color: white; border-bottom-right-radius: 4px; }
.them .bubble { background: white; color: #1e293b; border-bottom-left-radius: 4px; border: 1px solid #e2e8f0; }
.msg-time { font-size: 0.7rem; display: block; margin-top: 6px; opacity: 0.7; text-align: right; }

/* Input Area */
.chat-input-area { padding: 20px; border-top: 1px solid #e2e8f0; }
.input-form { display: flex; gap: 12px; background: #f1f5f9; padding: 10px 18px; border-radius: 30px; align-items: center; }
.input-form input { flex: 1; border: none; background: transparent; outline: none; font-size: 0.95rem; }
.input-form button { background: #002580; color: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; }
.input-form button:hover:not(:disabled) { transform: scale(1.05); background: #001a5c; }
.input-form button:disabled { background: #cbd5e1; cursor: not-allowed; }

.no-chat-selected { flex: 1; display: flex; align-items: center; justify-content: center; text-align: center; color: #94a3b8; }
.no-chat-selected i { font-size: 3.5rem; margin-bottom: 15px; opacity: 0.2; }

/* Loader mini */
.loader-mini { width: 18px; height: 18px; border: 2px solid #ffffff; border-bottom-color: transparent; border-radius: 50%; display: inline-block; animation: rotation 1s linear infinite; }
@keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>