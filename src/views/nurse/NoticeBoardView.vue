<template>
  <NurseLayout :id="currentNurseIdComputed">
    <section class="messages-section">
      <h1>Messagerie Infirmière</h1>

      <div class="chat-container">

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
                <span v-if="chatStore.sending">✉️ Envoi...</span>
                <span v-else>📤 Envoyer</span>
              </button>
            </form>
          </template>
        </div>
      </div>
    </section>
  </NurseLayout>
</template>

<script setup>
import NurseLayout from '@/layouts/NurseLayout.vue'
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStores'
import { useUserStore } from '@/stores/userStore'

const route = useRoute()
const chatStore = useChatStore()
const authStore = useAuthStore()
const userStore = useUserStore()

const messageInput = ref('')
const chatThreadRef = ref(null)
const activeTab = ref('conversations')
const searchQuery = ref('')

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
/* ✅ Layout global */
.messages-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f7fb;
  overflow: hidden;
}

.chat-container {
  display: flex;
  height: calc(100vh - 120px);
  border-radius: 16px;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

/* ✅ Sidebar (liste de conversations) */
.sidebar-contacts {
  width: 300px;
  background-color: #f0f3fa;
  border-right: 1px solid #e0e6f0;
  display: flex;
  flex-direction: column;
  padding: 10px 0;
}

.tab-buttons {
  display: flex;
  justify-content: space-around;
  padding: 10px;
}

.tab-buttons button {
  flex: 1;
  margin: 0 5px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 8px;
  font-weight: 600;
  cursor: pointer;
  color: #555;
  transition: all 0.2s ease-in-out;
}

.tab-buttons button.active {
  background-color: #4a6cf7;
  color: white;
  border: none;
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
  border-bottom: 1px solid #e8ecf3;
}

.list-unstyled li:hover {
  background: #e9eefc;
}

.list-unstyled li.active,
.list-unstyled li.active-contact {
  background-color: #4a6cf7;
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
/* Assurez-vous que le nom du contact reste blanc dans l'onglet actif */
.list-unstyled li.active .contact-name,
.list-unstyled li.active-contact .contact-name {
    color: white;
}


.last-message {
  font-size: 0.85em;
  color: #6c757d;
}
.list-unstyled li.active .last-message {
    color: #e6e6e6; /* Pour qu'il reste lisible dans l'onglet actif */
}


/* ✅ Zone de chat principale */
.chat-box {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: #f9fbff;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 20px;
  border-bottom: 1px solid #e3e9f0;
  background-color: #fff;
}

.profile-photo-large {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
}

.chat-header h2 {
  font-size: 1.1em;
  color: #333;
}

/* ✅ Zone des messages */
.chat-thread {
  flex-grow: 1;
  display: flex;
  flex-direction: column-reverse; /* Pour afficher le message le plus récent en bas */
  padding: 20px;
  overflow-y: auto;
  background: #f9fbff;
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
}

.my-message {
  justify-content: flex-end;
}

.my-message .message-bubble {
  background-color: #4a6cf7;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.their-message {
  justify-content: flex-start;
}

.their-message .message-bubble {
  background-color: #e9eefc;
  color: #333;
  border-bottom-left-radius: 4px;
}

.message-time {
  display: block;
  font-size: 0.75em;
  margin-top: 5px;
  text-align: right;
  opacity: 0.7;
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
</style>