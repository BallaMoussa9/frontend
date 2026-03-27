<template>
  <MedecinLayout :id="currentDoctorIdComputed">
    <div class="messaging-page">
      <header class="page-header">
        <h1>Messagerie Médicale</h1>
        <div v-if="chatStore.error" class="error-banner">
          ⚠️ {{ chatStore.error }}
        </div>
      </header>

      <div class="chat-wrapper">
        <aside class="chat-sidebar">
          <nav class="tab-nav">
            <button 
              type="button"
              :class="{ active: activeTab === 'conversations' }"
              @click="activeTab = 'conversations'; chatStore.fetchConversations()"
            >
              Messages ({{ chatStore.getConversations?.length || 0 }})
            </button>
            <button 
              type="button"
              :class="{ active: activeTab === 'users' }"
              @click="activeTab = 'users'; loadAllUsersToChat()"
            >
              Annuaire
            </button>
          </nav>

          <div class="list-container">
            <div v-if="activeTab === 'users'" class="search-area">
              <input v-model="searchQuery" @input="searchUsers" placeholder="Rechercher..." />
            </div>

            <div v-if="chatStore.loadingConversations || userStore.loading" class="loading-sidebar">
              Chargement...
            </div>

            <ul class="contact-list">
              <template v-if="activeTab === 'conversations'">
                <li 
                  v-for="conv in chatStore.getConversations" 
                  :key="conv.id"
                  :class="{ 'active': conv.id === chatStore.currentConversation?.id }"
                  @click="chatStore.startChatWithConversation(conv.id)"
                >
                  <img :src="getRecipientPhotoFromConv(conv)" class="avatar-sm" alt="Photo">
                  <div class="contact-meta">
                    <span class="name">{{ getRecipientFromConv(conv).first_name }} {{ getRecipientFromConv(conv).last_name }}</span>
                    <span class="preview">{{ conv.messages[0]?.content || 'Démarrer le chat' }}</span>
                  </div>
                </li>
              </template>

              <template v-else>
                <li 
                  v-for="user in filteredUsersForChat" 
                  :key="user.id"
                  :class="{ 'selected-user': chatStore.selectedRecipient?.id === user.id }"
                  @click="startChatWithUser(user)"
                >
                  <img :src="getUserPhoto(user)" class="avatar-sm" alt="Photo">
                  <div class="contact-meta">
                    <span class="name">{{ user.first_name }} {{ user.last_name }}</span>
                    <span class="role">{{ user.roles?.[0]?.name || 'Utilisateur' }}</span>
                  </div>
                </li>
              </template>
            </ul>
          </div>
        </aside>

        <main class="chat-window">
          <div v-if="!chatStore.currentConversation?.id && !chatStore.selectedRecipient?.id" class="empty-chat">
            <div class="illustration">💬</div>
            <p>Sélectionnez une conversation</p>
          </div>

          <div v-else-if="chatStore.loading || isConversationInitializationPending" class="chat-loading-overlay">
            <p>Chargement des messages...</p>
          </div>

          <template v-else>
            <div class="chat-header">
              <img :src="chatStore.recipientProfilePhoto" class="avatar-md" alt="Destinataire">
              <div class="header-info">
                <h2>{{ chatStore.recipientName }}</h2>
                <span class="status-online">En ligne</span>
              </div>
            </div>

            <div class="chat-messages" ref="chatThreadRef">
              <div 
                v-for="msg in [...chatStore.messages].reverse()" 
                :key="msg.id"
                :class="['msg-wrapper', chatStore.isMyMessage(msg) ? 'sent' : 'received']"
              >
                <div class="bubble">
                  {{ msg.content }}
                  <span class="time">{{ formatTime(msg.created_at) }}</span>
                </div>
              </div>
            </div>

            <footer class="chat-footer">
              <form @submit.prevent="handleSendMessage" class="input-form">
                <input 
                  v-model="messageInput" 
                  type="text" 
                  placeholder="Votre message..." 
                  :disabled="isInputDisabled"
                >
                <button type="submit" :disabled="isInputDisabled || chatStore.sending">
                  {{ chatStore.sending ? '...' : 'Envoyer' }}
                </button>
              </form>
            </footer>
          </template>
        </main>
      </div>
    </div>
  </MedecinLayout>
</template>

<script setup>
import MedecinLayout from '@/layouts/MedecinLayout.vue'
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

// État pour gérer la transition de sélection d'utilisateur à l'initialisation de conversation
const isConversationInitializationPending = ref(false);

// Calcule l'ID de l'utilisateur courant (le docteur)
const currentDoctorIdComputed = computed(() => {
    if (route.params.id) {
        return Number(route.params.id);
    }
    if (authStore.user?.id) {
        return Number(authStore.user.id);
    }
    return null;
});

// Détermine si le champ de saisie doit être désactivé
const isInputDisabled = computed(() => {
    // Si chargement, envoi, ou si nous attendons l'ID de conversation
    return chatStore.loading || chatStore.sending || isConversationInitializationPending.value;
});


const loadAllUsersToChat = async () => {
    if (currentDoctorIdComputed.value === null || isNaN(currentDoctorIdComputed.value)) {
        console.warn("Doctor ID is not yet available or invalid. Cannot fetch users.");
        chatStore.error = "ID du docteur non disponible pour charger les utilisateurs.";
        return;
    }

    if (userStore.allUsers?.length === 0 || userStore.error) {
        await userStore.fetchAllUsers();
    } else {
        console.log("Users already loaded, skipping re-fetch.");
    }
};

const filteredUsersForChat = computed(() => {
    const allUsers = Array.isArray(userStore.allUsers) ? userStore.allUsers : [];
    // Filtre les utilisateurs pour ne pas inclure l'utilisateur courant
    let users = allUsers.filter(user => user.id !== currentDoctorIdComputed.value);

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        users = users.filter(user =>
            user.first_name?.toLowerCase().includes(query) ||
            user.last_name?.toLowerCase().includes(query) ||
            (user.roles && user.roles.length > 0 && user.roles[0].name?.toLowerCase().includes(query))
        );
    }
    return users;
});

const searchUsers = () => {
    // La computed `filteredUsersForChat` gère le filtrage automatiquement
};

const getRecipientFromConv = (conv) => {
    const currentUserId = currentDoctorIdComputed.value;
    const recipient = conv.users?.find(u => u.id !== currentUserId);
    return recipient || { id: -1, first_name: 'Inconnu', last_name: '' };
};

/**
 * Normalise l'URL de la photo de profil.
 */
const getUserPhoto = (user) => {
    if (user?.profile_photo_url) {
        return user.profile_photo_url;
    }
    if (user?.profile_photo_path) {
        const cleanedPath = user.profile_photo_path.startsWith('public/') ? user.profile_photo_path.substring(7) : user.profile_photo_path;
        // CORRECTION CLÉ : Utiliser un chemin relatif /storage/ pour éviter l'erreur ERR_NAME_NOT_RESOLVED
        // Si cela ne fonctionne pas, remplacez '/storage/' par l'URL complète de votre API, par exemple 'https://api.monsite.com/storage/'
        return `/storage/${cleanedPath}`; 
    }
    // Placeholder basé sur le nom
    return `https://via.placeholder.com/40/002580/ffffff?text=${user?.first_name ? user.first_name.charAt(0) : 'U'}`;
};

const getRecipientPhotoFromConv = (conv) => {
    const recipient = getRecipientFromConv(conv);
    return getUserPhoto(recipient);
};


const startChatWithUser = async (user) => {
    if (currentDoctorIdComputed.value === null || isNaN(currentDoctorIdComputed.value)) {
        chatStore.error = "Erreur: ID du docteur non trouvé ou non valide pour démarrer un chat.";
        return;
    }
    
    // 1. Indiquer que l'initialisation de la conversation est en cours
    isConversationInitializationPending.value = true;
    
    console.log(`DOCTOR CHAT: Démarrage/récupération du chat avec l'utilisateur ${user.id} (${user.first_name}).`);
    await chatStore.startChatWithUser(user);
    
    // 2. Le chat a démarré, basculer sur la vue de la conversation et arrêter l'indicateur
    activeTab.value = 'conversations';
    searchQuery.value = '';
    isConversationInitializationPending.value = false;

    await nextTick(() => scrollToBottom());
};

const scrollToBottom = () => {
    nextTick(() => {
        const thread = chatThreadRef.value;
        if (thread) {
            // Pour un conteneur en 'flex-direction: column-reverse', le défilement est à 0.
            thread.scrollTop = 0;
        }
    });
};

const handleSendMessage = async () => {
    const content = messageInput.value.trim();

    if (!content) {
        chatStore.error = "Veuillez taper un message avant d'envoyer.";
        return;
    }

    // Le store gère l'envoi, nous devons juste nous assurer qu'on ne l'appelle pas si nous sommes en attente d'initialisation
    if (isInputDisabled.value) {
        chatStore.error = "Veuillez patienter pendant l'initialisation de la conversation ou assurez-vous qu'un destinataire est sélectionné.";
        return;
    }

    const originalMessage = content;
    messageInput.value = '';

    // L'échec ici est probablement dû à l'absence de chat ID dans le store
    const success = await chatStore.sendMessage(content);
    
    if (!success) {
        console.error("Échec de l'envoi du message. Rétablissement de l'input.");
        // Si le store n'a pas mis à jour son message d'erreur, nous le faisons ici pour l'utilisateur.
        if (!chatStore.error) {
            chatStore.error = "Échec de l'envoi. Le serveur a refusé le message. Vérifiez la connexion et le destinataire.";
        }
        messageInput.value = originalMessage; 
    }
};

const formatTime = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};


onMounted(() => {
    // 1. Initialiser les conversations dès que l'ID utilisateur est prêt
    watch(() => authStore.user?.id, (newId) => {
        if (newId && chatStore.conversations.length === 0 && !chatStore.loadingConversations) {
            chatStore.fetchConversations();
        }
    }, { immediate: true });

    // 2. Gérer la navigation directe vers une conversation spécifique (via query param)
    if (route.query.conversation_id) {
        setTimeout(() => {
            chatStore.startChatWithConversation(Number(route.query.conversation_id));
        }, 100); 
    }
});

// Watcher pour le défilement lorsque de nouveaux messages arrivent
watch(
    () => chatStore.messages.length,
    (newLength, oldLength) => {
        if (newLength > oldLength) {
            scrollToBottom();
        }
    }
);

// Watcher pour réinitialiser l'état lors du changement de conversation (onglet Chats)
watch(
    () => chatStore.currentConversation?.id,
    (newValue, oldValue) => {
        if (newValue !== oldValue) {
            scrollToBottom();
            messageInput.value = '';
            chatStore.error = null;
            isConversationInitializationPending.value = false; // Important
        }
    }
);

// Watcher pour réinitialiser l'état lors de la sélection d'un nouveau destinataire (onglet Utilisateurs)
watch(
    () => chatStore.selectedRecipient?.id,
    (newValue, oldValue) => {
        if (newValue !== oldValue && !chatStore.currentConversation?.id) {
            messageInput.value = '';
            chatStore.error = null;
        }
    }
);


// Watcher pour gérer les actions lors du changement d'onglet
watch(activeTab, (newTab) => {
    if (newTab === 'users') {
        if (currentDoctorIdComputed.value) {
            loadAllUsersToChat();
        }
        // Ne pas effacer le chat courant ici pour permettre la bascule si l'utilisateur change d'avis
        chatStore.messages = [];
        messageInput.value = '';
    } else if (newTab === 'conversations') {
        // Dans l'onglet conversations, on ne garde pas de destinataire sélectionné sans conversation active
        if (!chatStore.currentConversation?.id) {
             chatStore.selectedRecipient = null;
        }
    }
    chatStore.error = null;
    isConversationInitializationPending.value = false;
});

// Watcher initial pour s'assurer de charger les utilisateurs
watch(currentDoctorIdComputed, (newId) => {
    if (newId !== null && !isNaN(newId) && activeTab.value === 'users') {
        loadAllUsersToChat();
    }
}, { immediate: true });
</script>

<style scoped>
/* VARIABLES ET DESIGN GLASSMORPHISM */
.messaging-page {
  --primary: #2563eb;
  --primary-dark: #1e40af;
  --secondary: #10b981;
  --accent: #8b5cf6;
  --danger: #ef4444;
  --warning: #f59e0b;
  --success: #10b981;
  --gray: #6b7280;
  --light: #94a3b8;
  --shadow-lg: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 30px 60px -12px rgba(0, 0, 0, 0.5);
  --radius: 16px;
  
  font-family: 'Inter', sans-serif;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  padding: 2rem;
  margin: 0;
  width: 100%;
  background: transparent;
  color: white;
  box-sizing: border-box;
  position: relative;
  overflow-x: hidden;
}

/* Animation de fond */
.messaging-page::before {
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

.messaging-page > * {
  position: relative;
  z-index: 1;
}

/* HEADER */
.page-header {
  margin-bottom: 2.5rem;
  animation: slideDown 0.6s ease-out;
}

.page-header h1 {
  font-size: 2.2rem;
  font-weight: 900;
  color: white;
  margin: 0 0 1rem 0;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
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

/* ERROR BANNER */
.error-banner { 
  background: rgba(239, 68, 68, 0.1); 
  border: 1px solid rgba(239, 68, 68, 0.3); 
  color: #fca5a5; 
  padding: 1rem 1.5rem; 
  border-radius: 12px; 
  margin-bottom: 1.5rem; 
  font-size: 0.9rem;
  font-weight: 600;
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* CHAT WRAPPER */
.chat-wrapper { 
  display: flex; 
  flex: 1; 
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border-radius: var(--radius);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  transition: all 0.4s ease;
  animation: fadeInUp 0.8s ease-out;
}

.chat-wrapper:hover {
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

/* SIDEBAR */
.chat-sidebar { 
  width: 320px; 
  border-right: 1px solid rgba(255, 255, 255, 0.1); 
  display: flex; 
  flex-direction: column;
  background: rgba(255, 255, 255, 0.02);
}

/* TAB NAVIGATION */
.tab-nav { 
  display: flex; 
  background: rgba(255, 255, 255, 0.05); 
  padding: 0.75rem; 
  gap: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-nav button { 
  flex: 1; 
  padding: 0.75rem; 
  border: none; 
  border-radius: 8px; 
  font-weight: 600; 
  cursor: pointer; 
  background: transparent; 
  color: rgba(255, 255, 255, 0.7); 
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.tab-nav button.active { 
  background: linear-gradient(135deg, var(--primary), var(--secondary)); 
  color: white;
  box-shadow: 0 6px 15px rgba(37, 99, 235, 0.3);
}

.tab-nav button:hover:not(.active) {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

/* SEARCH AREA */
.list-container { flex: 1; overflow-y: auto; }
.search-area { 
  padding: 1rem; 
  border-bottom: 1px solid rgba(255, 255, 255, 0.1); 
}

.search-area input { 
  width: 100%; 
  padding: 0.75rem 1rem; 
  border: 1px solid rgba(255, 255, 255, 0.2); 
  border-radius: 20px; 
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.search-area input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-area input:focus {
  outline: none;
  border-color: var(--primary);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
}

/* LOADING STATE */
.loading-sidebar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

/* CONTACT LIST */
.contact-list { 
  list-style: none; 
  padding: 0; 
  margin: 0; 
}

.contact-list li { 
  display: flex; 
  align-items: center; 
  gap: 0.75rem; 
  padding: 1rem; 
  cursor: pointer; 
  border-bottom: 1px solid rgba(255, 255, 255, 0.05); 
  transition: all 0.3s ease;
  color: white;
}

.contact-list li:hover {
  background: rgba(255, 255, 255, 0.05);
}

.contact-list li.active { 
  background: rgba(37, 99, 235, 0.2); 
  border-left: 4px solid var(--primary);
  border-bottom-color: rgba(37, 99, 235, 0.3);
}

/* AVATARS */
.avatar-sm { 
  width: 40px; 
  height: 40px; 
  border-radius: 50%; 
  object-fit: cover; 
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.avatar-md { 
  width: 45px; 
  height: 45px; 
  border-radius: 50%; 
  object-fit: cover;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

/* CONTACT META */
.contact-meta { 
  display: flex; 
  flex-direction: column; 
  overflow: hidden;
  flex: 1;
}

.contact-meta .name { 
  font-weight: 700; 
  color: white; 
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.contact-meta .preview, .contact-meta .role { 
  font-size: 0.8rem; 
  color: rgba(255, 255, 255, 0.7); 
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis;
}

/* CHAT WINDOW */
.chat-window { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  background: rgba(255, 255, 255, 0.02); 
  position: relative;
}

/* CHAT HEADER */
.chat-header { 
  padding: 1rem 1.5rem; 
  border-bottom: 1px solid rgba(255, 255, 255, 0.1); 
  display: flex; 
  align-items: center; 
  gap: 1rem; 
  background: rgba(255, 255, 255, 0.05); 
  z-index: 10;
}

.header-info h2 { 
  font-size: 1.1rem; 
  margin: 0; 
  color: white;
  font-weight: 700;
}

.status-online { 
  font-size: 0.8rem; 
  color: #86efac; 
  font-weight: 600;
}

/* CHAT MESSAGES */
.chat-messages { 
  flex: 1; 
  padding: 1.5rem; 
  overflow-y: auto; 
  display: flex; 
  flex-direction: column-reverse; 
  gap: 1rem; 
  background: rgba(255, 255, 255, 0.02);
}

.msg-wrapper { 
  display: flex; 
  width: 100%;
}

.msg-wrapper.sent { 
  justify-content: flex-end; 
}

.msg-wrapper.received { 
  justify-content: flex-start; 
}

.bubble { 
  max-width: 70%; 
  padding: 0.75rem 1rem; 
  border-radius: 12px; 
  font-size: 0.9rem; 
  position: relative; 
  line-height: 1.5;
  backdrop-filter: blur(10px);
}

.sent .bubble { 
  background: linear-gradient(135deg, var(--primary), var(--secondary)); 
  color: white; 
  border-bottom-right-radius: 4px;
  box-shadow: 0 6px 15px rgba(37, 99, 235, 0.3);
}

.received .bubble { 
  background: rgba(255, 255, 255, 0.1); 
  color: white; 
  border-bottom-left-radius: 4px; 
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.time { 
  display: block; 
  font-size: 0.7rem; 
  margin-top: 0.5rem; 
  opacity: 0.7; 
  text-align: right;
}

/* CHAT FOOTER */
.chat-footer { 
  padding: 1rem 1.5rem; 
  border-top: 1px solid rgba(255, 255, 255, 0.1); 
  background: rgba(255, 255, 255, 0.05);
}

.input-form { 
  display: flex; 
  gap: 0.75rem;
}

.input-form input { 
  flex: 1; 
  padding: 0.75rem 1rem; 
  border: 1px solid rgba(255, 255, 255, 0.2); 
  border-radius: 8px; 
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.3s ease;
}

.input-form input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.input-form input:focus {
  border-color: var(--primary);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
}

.input-form button { 
  padding: 0 1.5rem; 
  background: linear-gradient(135deg, var(--primary), var(--secondary)); 
  color: white; 
  border: none; 
  border-radius: 8px; 
  font-weight: 600; 
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 15px rgba(37, 99, 235, 0.3);
}

.input-form button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.5);
}

/* EMPTY STATE */
.empty-chat { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  padding: 2rem;
}

.illustration { 
  font-size: 4rem; 
  margin-bottom: 1rem;
  opacity: 0.7;
}

.empty-chat p {
  font-size: 1.1rem;
  margin: 0;
}

/* CHAT LOADING OVERLAY */
.chat-loading-overlay {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
}

/* RESPONSIVE DESIGN */
@media (max-width: 768px) {
  .messaging-page {
    padding: 1rem;
  }
  
  .chat-sidebar { 
    width: 80px; 
  }
  
  .contact-meta, .search-area { 
    display: none; 
  }
  
  .tab-nav button span {
    display: none;
  }
  
  .tab-nav button {
    padding: 0.5rem;
    font-size: 0.75rem;
  }
  
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .chat-header {
    padding: 0.75rem;
  }
  
  .chat-messages {
    padding: 1rem;
  }
  
  .chat-footer {
    padding: 0.75rem;
  }
}
</style>