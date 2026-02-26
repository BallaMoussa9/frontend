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

<!-- BLOC STYLE GLOBAL POUR LES VARIABLES CSS (Non scopé) --><style scoped>
.messaging-page { height: calc(100vh - 60px); display: flex; flex-direction: column; background: #f1f5f9; padding: 20px; }
.page-header h1 { color: #1c325f; font-size: 1.8rem; margin-bottom: 15px; }
.chat-wrapper { display: flex; flex: 1; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; }
.chat-sidebar { width: 320px; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; }
.tab-nav { display: flex; background: #f8fafc; padding: 10px; gap: 5px; }
.tab-nav button { flex: 1; padding: 10px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; background: transparent; color: #64748b; font-size: 13px; }
.tab-nav button.active { background: #007aff; color: white; }
.list-container { flex: 1; overflow-y: auto; }
.search-area { padding: 15px; border-bottom: 1px solid #f1f5f9; }
.search-area input { width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 20px; background: #f8fafc; }
.contact-list { list-style: none; padding: 0; margin: 0; }
.contact-list li { display: flex; align-items: center; gap: 12px; padding: 15px; cursor: pointer; border-bottom: 1px solid #f1f5f9; transition: 0.2s; }
.contact-list li.active { background: #eff6ff; border-left: 4px solid #007aff; }
.avatar-sm { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; background: #e2e8f0; }
.contact-meta { display: flex; flex-direction: column; overflow: hidden; }
.contact-meta .name { font-weight: 700; color: #1e293b; font-size: 14px; }
.contact-meta .preview, .contact-meta .role { font-size: 12px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.chat-window { flex: 1; display: flex; flex-direction: column; background: #ffffff; position: relative; }
.chat-header { padding: 15px 20px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 15px; background: white; z-index: 10; }
.avatar-md { width: 45px; height: 45px; border-radius: 50%; object-fit: cover; }
.header-info h2 { font-size: 16px; margin: 0; color: #1e293b; }
.status-online { font-size: 11px; color: #10b981; }
.chat-messages { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column-reverse; gap: 15px; background: #f8fafc; }
.msg-wrapper { display: flex; width: 100%; }
.msg-wrapper.sent { justify-content: flex-end; }
.msg-wrapper.received { justify-content: flex-start; }
.bubble { max-width: 70%; padding: 10px 15px; border-radius: 12px; font-size: 14px; position: relative; line-height: 1.5; }
.sent .bubble { background: #007aff; color: white; border-bottom-right-radius: 2px; }
.received .bubble { background: white; color: #1e293b; border-bottom-left-radius: 2px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
.time { display: block; font-size: 10px; margin-top: 5px; opacity: 0.7; text-align: right; }
.chat-footer { padding: 15px 20px; border-top: 1px solid #e2e8f0; background: white; }
.input-form { display: flex; gap: 10px; }
.input-form input { flex: 1; padding: 12px 15px; border: 1px solid #e2e8f0; border-radius: 8px; outline: none; }
.input-form button { padding: 0 20px; background: #007aff; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.empty-chat { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8; }
.illustration { font-size: 60px; margin-bottom: 20px; }
.error-banner { background: #fee2e2; color: #b91c1c; padding: 10px; border-radius: 8px; margin-bottom: 10px; font-size: 14px; }

@media (max-width: 768px) {
  .chat-sidebar { width: 80px; }
  .contact-meta, .search-area { display: none; }
}
</style>