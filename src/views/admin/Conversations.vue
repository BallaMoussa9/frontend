<template>
  <AdminLayout>
    <div class="conversation-page" :class="{ 'mobile-chat-active': chatStore.selectedRecipient }">
      <h2 class="page-title">Messagerie Administrateur</h2>
      
      <div class="chat-main-container">

        <aside class="user-list-panel">
          <h4 class="panel-title">Tous les utilisateurs</h4>
          <div class="scrollable-user-area">
            <div v-if="userStore.loading && userStore.allUsers.length === 0" class="status-message loading-message">
              Chargement...
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

        <div class="chat-display-area" v-if="chatStore.selectedRecipient">
          <div class="chat-header">
            <button class="btn-back-mobile" @click="chatStore.selectedRecipient = null">
              <span class="back-icon">←</span> Retour
            </button>

            <img :src="chatStore.recipientProfilePhoto" :alt="chatStore.recipientName" class="recipient-avatar" />
            
            <div class="recipient-info">
              <h4 class="chat-recipient-name">{{ chatStore.recipientName }}</h4>
              <span class="role-badge">{{ chatStore.selectedRecipient.roles?.[0]?.name || 'Utilisateur' }}</span>
            </div>
          </div>

          <div class="messages-thread" ref="messagesContainer">
            <div v-if="chatStore.messages.length === 0 && !chatStore.loading" class="status-message no-messages">
                Dites bonjour !
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

        <div v-else class="chat-empty-state">
          <p>Sélectionnez un utilisateur pour discuter.</p>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { ref, nextTick, watch } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/authStores'

const chatStore = useChatStore();
const userStore = useUserStore();
const authStore = useAuthStore();
const newMessage = ref('');
const messagesContainer = ref(null);

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
.conversation-page {
    --primary: #3498db;
    --bg-light: #ecf0f1;
    --border: #dfe4e6;
    padding: 20px;
    background-color: var(--bg-light);
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.chat-main-container {
    display: flex;
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    flex: 1;
    height: calc(100vh - 150px);
}

.user-list-panel { width: 320px; border-right: 1px solid var(--border); display: flex; flex-direction: column; }
.scrollable-user-area { flex: 1; overflow-y: auto; }
.user-list { list-style: none; padding: 0; }
.user-list li { display: flex; align-items: center; gap: 12px; padding: 15px; cursor: pointer; border-bottom: 1px solid #f8f9fa; }
.user-list li.user-active { background: #eef6fc; border-left: 4px solid var(--primary); }
.user-avatar { width: 40px; height: 40px; border-radius: 50%; }

.chat-display-area { flex: 1; display: flex; flex-direction: column; background: #fff; }
.chat-header { display: flex; align-items: center; padding: 12px 20px; border-bottom: 1px solid var(--border); }
.recipient-avatar { width: 40px; height: 40px; border-radius: 50%; margin-right: 12px; }

/* BOUTON RETOUR */
.btn-back-mobile {
    display: none;
    align-items: center;
    gap: 5px;
    padding: 8px 12px;
    margin-right: 10px;
    background: #f0f0f0;
    border: none;
    border-radius: 8px;
    font-weight: 600;
}

.messages-thread { flex: 1; overflow-y: auto; padding: 20px; background: #f9f9f9; display: flex; flex-direction: column; }
.message-item { max-width: 75%; margin-bottom: 10px; display: flex; flex-direction: column; }
.message-admin-sender { align-self: flex-end; }
.message-other-user { align-self: flex-start; }
.message-bubble { padding: 10px 15px; border-radius: 15px; background: #e9ecef; }
.message-admin-sender .message-bubble { background: var(--primary); color: white; }

.message-input-form { padding: 15px; border-top: 1px solid var(--border); display: flex; gap: 10px; }
.message-input-field { flex: 1; padding: 10px; border-radius: 20px; border: 1px solid #ddd; outline: none; }
.send-button { background: var(--primary); color: white; border: none; padding: 0 15px; border-radius: 20px; cursor: pointer; }

/* --- CORRECTIONS MOBILE --- */
@media (max-width: 768px) {
    .conversation-page { padding: 0; }
    
    .chat-display-area {
        position: fixed; 
        top: 64px; /* <--- AJUSTEMENT ICI : Descend le chat pour laisser voir le titre bleu */
        left: 0; 
        width: 100%; 
        height: calc(100vh - 64px);
        z-index: 1000;
        display: none;
    }

    .mobile-chat-active .chat-display-area { display: flex; }
    .btn-back-mobile { display: flex; } /* Affiche le bouton sur mobile */
    .user-list-panel { width: 100%; }
    .page-title { padding-left: 20px; }
}
</style>