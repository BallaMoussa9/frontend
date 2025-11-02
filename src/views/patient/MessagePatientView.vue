<template>
  <SidebarLayout>
    <section class="messages-section">
      <h1>Messagerie Médicale</h1>

      <div class="chat-container">

        <div class="sidebar-contacts">

          <div class="tab-buttons">
            <button
              :class="{ active: activeTab === 'conversations' }"
              @click="activeTab = 'conversations'"
            >
              Chats ({{ chatStore.getConversations.length }})
            </button>
            <button
              :class="{ active: activeTab === 'contacts' }"
              @click="activeTab = 'contacts'; fetchAllUsers()"
            >
              Nouveaux Contacts
            </button>
          </div>

          <div v-if="activeTab === 'conversations'" class="contact-list-panel">
            <p v-if="chatStore.loadingConversations" class="info-text">Chargement des conversations...</p>
            <p v-else-if="chatStore.getConversations.length === 0" class="info-text">
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
                  <img :src="getRecipientPhoto(getRecipientFromConv(conv))" alt="Photo" class="profile-photo-small">
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

          <div v-else class="contact-list-panel">
            <div class="search-box">
              <input v-model="searchQuery" @input="searchUsers" placeholder="Rechercher un utilisateur..." />
            </div>

            <p v-if="userStore.loading" class="info-text">Recherche en cours...</p>
            <p v-else-if="filteredUsers.length === 0" class="info-text">
              {{ searchQuery ? 'Aucun utilisateur trouvé.' : 'Cliquez sur un nom pour chatter.' }}
            </p>

            <ul v-else class="list-unstyled">
              <li
                v-for="user in filteredUsers"
                :key="user.id"
                :class="{ 'active-contact': user.id === chatStore.selectedRecipient?.id }"
                @click="startChat(user)"
              >
                <div class="contact-info">
                  <img :src="getRecipientPhoto(user)" alt="Photo" class="profile-photo-small">
                  <span class="contact-name">
                    {{ user.first_name }} {{ user.last_name }}
                  </span>
                </div>
                <div class="user-role">
                    {{ user.roles[0]?.name || 'Utilisateur' }}
                </div>
              </li>
            </ul>
          </div>

        </div>

        <div class="chat-box">
          <div v-if="chatStore.loading" class="chat-loading">Chargement des messages...</div>

          <div v-else-if="!chatStore.currentConversation" class="chat-placeholder">
            Sélectionnez un contact pour commencer à chatter.
          </div>

          <template v-else>
            <div class="chat-header">
                <img :src="chatStore.recipientProfilePhoto" alt="Photo" class="profile-photo-large">
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
              <button type="submit" :disabled="chatStore.loading || !messageInput.trim()">
                <span v-if="chatStore.loading">Envoi...</span>
                <span v-else>Envoyer</span>
              </button>
            </form>
          </template>
        </div>
      </div>
    </section>
  </SidebarLayout>
</template>
<script setup>
import SidebarLayout from '@/layouts/SidebarLayout.vue'
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/authStores'

const chatStore = useChatStore()
const userStore = useUserStore()
const authStore = useAuthStore()

const messageInput = ref('')
const chatThreadRef = ref(null)
const activeTab = ref('conversations')
const searchQuery = ref('')


// ------------------- Logique Contacts/Recherche -------------------

const filteredUsers = computed(() => {
    const currentUserId = authStore.user?.id;
    const users = userStore.allUsers.filter(u => u.id !== currentUserId);

    if (!searchQuery.value) {
        return users.slice(0, 10);
    }

    const query = searchQuery.value.toLowerCase();
    return users.filter(user =>
        user.first_name.toLowerCase().includes(query) ||
        user.last_name.toLowerCase().includes(query) ||
        user.roles[0]?.name.toLowerCase().includes(query)
    );
});

const fetchAllUsers = async () => {
    if (userStore.allUsers.length === 0) {
        await userStore.fetchAllUsers();
    }
};

const searchUsers = () => {
    if (userStore.allUsers.length === 0) {
        fetchAllUsers();
    }
};


// ------------------- Logique Chat -------------------

const getRecipientFromConv = (conv) => {
    const currentUserId = authStore.user?.id;
    return conv.users.find(u => u.id !== currentUserId) || conv.users[0];
}

// ✅ Correction ici — on appelle la méthode existante du store
const startChat = (user) => {
    chatStore.startChatWithUser(user);
    activeTab.value = 'conversations';
    searchQuery.value = '';
};


// ------------------- Logique Générale/Utils -------------------

const scrollToBottom = () => {
  nextTick(() => {
    const thread = chatThreadRef.value;
    if (thread) {
      thread.scrollTop = thread.scrollHeight;
    }
  });
};

const handleSendMessage = async () => {
  if (!messageInput.value.trim()) return;

  const content = messageInput.value.trim();
  messageInput.value = '';

  const success = await chatStore.sendMessage(content);
  if (success) {
    scrollToBottom();
  }
};

const formatTime = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getRecipientPhoto = (user) => {
    const photoUrl = user?.profile_photo_url;
    if (photoUrl) return photoUrl;

    const photoPath = user?.profile_photo_path;
    if (photoPath) {
        const cleanedPath = photoPath.startsWith('public/') ? photoPath.substring(7) : photoPath;
        return `baseURL: 'https://santeko-api.onrender.com/api/storage/${cleanedPath}`;
    }

    return 'https://via.placeholder.com/40/002580/ffffff?text=U';
};


// ------------------- Cycle de vie et Watchers -------------------

onMounted(() => {
  chatStore.fetchConversations();
});

watch(
    () => chatStore.messages.length,
    () => {
        scrollToBottom();
    }
);

watch(
    () => chatStore.currentConversation,
    () => {
        scrollToBottom();
    }
);
</script>


<style scoped>
/* Conteneur et titres */
.messages-section {
  display: flex;
  flex-direction: column;
  padding: 20px;
}
h1 {
  font-size: 2.2em;
  color: #002580;
  margin-bottom: 25px;
  border-bottom: 2px solid #0040d0;
  padding-bottom: 10px;
}

.chat-container {
    display: flex;
    height: 75vh;
    min-height: 500px;
    background-color: #f4f7ff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Sidebar Contacts */
.sidebar-contacts {
    width: 350px;
    background: #e9eef8;
    border-right: 1px solid #ccd8ff;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.tab-buttons {
    display: flex;
    border-bottom: 1px solid #ccd8ff;
}

.tab-buttons button {
    flex: 1;
    padding: 15px 0;
    border: none;
    background-color: #f4f7ff;
    color: #002580;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
    border-bottom: 3px solid transparent;
}

.tab-buttons button.active {
    background-color: #ffffff;
    border-bottom: 3px solid #0040d0;
    color: #0040d0;
}

.contact-list-panel {
    flex-grow: 1;
    overflow-y: auto;
    padding: 0;
}

.search-box {
    padding: 15px 20px 10px;
    background-color: #ffffff;
    border-bottom: 1px solid #e1e7f3;
}
.search-box input {
    width: 100%;
    padding: 10px;
    border-radius: 20px;
    border: 1px solid #ccc;
    box-sizing: border-box;
}

.list-unstyled {
  list-style: none;
  padding: 0;
  margin: 0;
}

.list-unstyled li {
  padding: 15px 20px;
  cursor: pointer;
  border-bottom: 1px solid #e1e7f3;
  transition: background-color 0.2s;
}
.list-unstyled li:hover {
  background-color: #dbe4f2;
}

/* Styles pour les éléments actifs et les rôles */
.list-unstyled li.active,
.active-contact {
    background-color: #0040d0; /* Couleur pour les conversations actives */
    color: white;
    font-weight: 500;
}
.active-contact {
    background-color: #ccd8ff; /* Couleur différente pour l'onglet contacts */
    color: #333;
    border-left: 4px solid #0040d0;
    padding-left: 16px !important;
}

.list-unstyled li.active .contact-name,
.list-unstyled li.active .last-message,
.list-unstyled li.active .user-role {
    color: white;
}
.list-unstyled li.active .profile-photo-small {
    border: 2px solid white;
}

.user-role {
    font-size: 0.8em;
    color: #6c757d;
    font-style: italic;
    padding-left: 50px;
    margin-top: 2px;
}

.contact-info {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
}
.contact-name {
    font-weight: bold;
    color: #333;
    margin-left: 10px;
}
.last-message {
    font-size: 0.85em;
    color: #6c757d;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-left: 50px;
}
.profile-photo-small {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #fff;
}


/* Zone de Chat */
.chat-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  position: relative;
}

.chat-header {
    display: flex;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #e0e0e0;
    background-color: #fcfcfc;
}

.chat-header h2 {
    margin: 0;
    font-size: 1.2em;
    color: #333;
    margin-left: 15px;
}
.profile-photo-large {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #0040d0;
}

.chat-thread {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.message {
  margin-bottom: 10px;
  max-width: 70%;
}

.message-bubble {
    padding: 10px 15px;
    border-radius: 18px;
    line-height: 1.4;
    position: relative;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
}

.my-message {
  align-self: flex-end;
  align-items: flex-end;
  margin-left: auto;
}
.my-message .message-bubble {
  background-color: #0040d0;
  color: white;
  border-bottom-right-radius: 2px;
}

.their-message {
  align-self: flex-start;
  align-items: flex-start;
  margin-right: auto;
}
.their-message .message-bubble {
  background-color: #f1f0f0;
  color: #333;
  border-bottom-left-radius: 2px;
}

.message-time {
    display: block;
    font-size: 0.7em;
    margin-top: 3px;
    opacity: 0.7;
    text-align: right;
}

/* Formulaire d'envoi */
.message-input-form {
  display: flex;
  padding: 15px 20px;
  border-top: 1px solid #e0e0e0;
  background-color: #fcfcfc;
}
.message-input-form input {
  flex-grow: 1;
  padding: 12px;
  margin: 0 10px 0 0;
  border-radius: 20px;
  border: 1px solid #ccc;
  font-size: 1em;
}
.message-input-form button {
  padding: 12px 25px;
  background-color: #0040d0;
  color: white;
  border: none;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}
.message-input-form button:hover:not(:disabled) {
    background-color: #002580;
}
.message-input-form button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

/* États de chargement/erreur */
.info-text, .chat-placeholder, .chat-loading {
    padding: 20px;
    text-align: center;
    color: #6c757d;
    font-style: italic;
}
.chat-placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: 1.1em;
}
.chat-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.2em;
    color: #0040d0;
    z-index: 10;
}
</style>
