<template>
  <MedecinLayout :id="currentDoctorIdComputed">
    <section class="messages-section">
      <h1>Messagerie Docteur</h1>

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
              @click="activeTab = 'users'; loadAllUsersToChat()" >
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
                :class="{ 'active': conv.id === chatStore.currentConversation?.id }"
                @click="chatStore.startChatWithConversation(conv.id)"
              >
                <div class="contact-info">
                  <img :src="getRecipientPhotoFromConv(conv)" alt="Photo" class="profile-photo-small">
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
                v-for="user in filteredUsersForChat" :key="user.id"
                :class="{ 'active-contact': chatStore.selectedRecipient?.id === user.id }"
                @click="startChatWithUser(user)" >
                <div class="contact-info">
                  <img :src="getUserPhoto(user)" alt="Photo" class="profile-photo-small">
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

          <div v-if="chatStore.loading || isConversationInitializationPending" class="chat-loading">
            {{ isConversationInitializationPending ? 'Initialisation de la conversation...' : 'Chargement des messages...' }}
          </div>

          <div v-else-if="!chatStore.currentConversation?.id && !chatStore.selectedRecipient?.id" class="chat-placeholder">
            Sélectionnez une personne pour commencer à chatter.
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
                :disabled="isInputDisabled"
              />
              <button
                type="submit"
                :disabled="isInputDisabled || chatStore.sending"
              >
                <span v-if="chatStore.sending">Envoi...</span>
                <span v-else>Envoyer</span>
              </button>
            </form>
          </template>
        </div>
      </div>
    </section>
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

<!-- BLOC STYLE GLOBAL POUR LES VARIABLES CSS (Non scopé) -->
<style>
/* COULEURS DU THÈME DOCTEUR DÉFINIES GLOBALEMENT POUR ÉVITER LES ERREURS DE SCOPE */
:root {
    --primary-doctor-blue: #002580; /* Bleu profond principal */
    --accent-doctor-blue: #0040d0; /* Bleu plus clair pour les accents */
    --patient-bubble-bg: #e2e6ea; /* Gris clair pour les messages des patients */
    --light-bg: #f8f9fa; /* Fond général */
    --white: #ffffff;
    --border-color: #e9ecef; /* Bordures générales */
    --text-color: #343a40; /* Texte sombre */
    --light-text: #6c757d; /* Texte secondaire */
    --tab-inactive-bg: #e9eef8; /* Fond inactif des onglets */
    --tab-active-bg: #ffffff; /* Fond actif des onglets */
    --list-hover-bg: #dbe4f2; /* Survol de la liste */
    --list-active-bg: #0040d0; /* Conversation active */
    --contact-active-bg: #ccd8ff; /* Contact actif dans l'onglet patients */
    --send-button-disabled-bg: #cccccc; /* Couleur pour le bouton désactivé */
}
</style>

<!-- BLOC STYLE SCOPÉ (Contient toutes les règles du composant) -->
<style scoped>
/* Conteneur et titres */
.messages-section {
    display: flex;
    flex-direction: column;
    padding: 20px;
}
h1 {
    font-size: 2.2em;
    color: var(--primary-doctor-blue);
    margin-bottom: 25px;
    border-bottom: 2px solid var(--accent-doctor-blue);
    padding-bottom: 10px;
}

.chat-container {
    display: flex;
    height: 75vh;
    min-height: 500px;
    background-color: var(--light-bg);
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Sidebar Contacts / Utilisateurs */
.sidebar-contacts {
    width: 350px;
    background: var(--tab-inactive-bg);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.tab-buttons {
    display: flex;
    border-bottom: 1px solid var(--border-color);
}

.tab-buttons button {
    flex: 1;
    padding: 15px 0;
    border: none;
    background-color: var(--tab-inactive-bg);
    color: var(--primary-doctor-blue);
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
    border-bottom: 3px solid transparent;
}

.tab-buttons button.active {
    background-color: var(--tab-active-bg);
    border-bottom: 3px solid var(--accent-doctor-blue);
    color: var(--accent-doctor-blue);
}

.contact-list-panel {
    flex-grow: 1;
    overflow-y: auto;
    padding: 0;
}

.search-box {
    padding: 15px 20px 10px;
    background-color: var(--tab-active-bg);
    border-bottom: 1px solid var(--border-color);
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
    border-bottom: 1px solid var(--border-color);
    transition: background-color 0.2s;
}
.list-unstyled li:hover {
    background-color: var(--list-hover-bg);
}

/* Styles pour les éléments actifs et les rôles */
.list-unstyled li.active { /* Pour les conversations existantes */
    background-color: var(--list-active-bg);
    color: white;
    font-weight: 500;
}
.list-unstyled li.active .contact-name,
.list-unstyled li.active .last-message,
.list-unstyled li.active .user-role {
    color: white;
}
.list-unstyled li.active .profile-photo-small {
    border: 2px solid white;
}

.active-contact { /* Pour l'utilisateur sélectionné dans l'onglet "Utilisateurs" */
    background-color: var(--contact-active-bg);
    color: var(--text-color);
    border-left: 4px solid var(--accent-doctor-blue);
    padding-left: 16px !important;
}

.user-role {
    font-size: 0.8em;
    color: var(--light-text);
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
    color: var(--text-color);
    margin-left: 10px;
}
/* Adapte la couleur du nom si l'élément de liste est actif */
.list-unstyled li.active .contact-name,
.list-unstyled li.active-contact .contact-name {
    color: inherit;
}

.last-message {
    font-size: 0.85em;
    color: var(--light-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-left: 50px;
}
/* Adapte la couleur du dernier message si l'élément de liste est actif */
.list-unstyled li.active .last-message {
    color: rgba(255, 255, 255, 0.8);
}
.list-unstyled li.active-contact .last-message {
    color: var(--light-text);
}

.profile-photo-small {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--white);
}


/* Zone de Chat */
.chat-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: var(--white);
    position: relative;
}

.chat-error-display {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    width: auto;
    max-width: 90%;
}


.chat-header {
    display: flex;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--light-bg);
}

.chat-header h2 {
    margin: 0;
    font-size: 1.2em;
    color: var(--text-color);
    margin-left: 15px;
}
.profile-photo-large {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--accent-doctor-blue);
}

.chat-thread {
    flex-grow: 1;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column-reverse;
}

.message {
    margin-top: 10px;
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
    background-color: var(--primary-doctor-blue);
    color: white;
    border-bottom-right-radius: 2px;
}

.their-message {
    align-self: flex-start;
    align-items: flex-start;
    margin-right: auto;
}
.their-message .message-bubble {
    background-color: var(--patient-bubble-bg);
    color: var(--text-color);
    border-bottom-left-radius: 2px;
}

.message-time {
    display: block;
    font-size: 0.7em;
    margin-top: 3px;
    opacity: 0.7;
    text-align: right;
    color: inherit;
}
.my-message .message-time {
    color: rgba(255, 255, 255, 0.7);
}

/* Formulaire d'envoi */
.message-input-form {
    display: flex;
    padding: 15px 20px;
    border-top: 1px solid var(--border-color);
    background-color: var(--light-bg);
    align-items: center; /* Centrer verticalement les éléments */
    gap: 10px; /* Espace entre input et bouton */
}

.message-input-form input {
    flex-grow: 1;
    padding: 12px;
    margin: 0;
    border-radius: 20px;
    border: 1px solid #ccc;
    font-size: 1em;
}
.message-input-form input:focus {
    border-color: var(--accent-doctor-blue);
    box-shadow: 0 0 0 2px rgba(0, 64, 208, 0.25);
    outline: none;
}

.message-input-form button {
    flex-shrink: 0; /* Empêche le bouton de rétrécir */
    padding: 12px 25px;
    background-color: var(--primary-doctor-blue); /* Couleur active par défaut */
    color: white;
    border: none;
    border-radius: 20px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
}
.message-input-form button:hover:not(:disabled) {
    background-color: var(--accent-doctor-blue); /* Couleur au survol */
}
.message-input-form button:disabled {
    background-color: var(--send-button-disabled-bg); /* Couleur quand désactivé */
    cursor: not-allowed;
    opacity: 0.7;
}

/* États de chargement/erreur */
.info-text, .chat-placeholder, .chat-loading {
    padding: 20px;
    text-align: center;
    color: var(--light-text);
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
    /* Style du chat-loading si vous le rendez statique ou absolu */
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
    color: var(--accent-doctor-blue);
    z-index: 10;
}
.error-text {
    color: #dc3545;
    padding: 15px;
    border-radius: 5px;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    margin: 10px 20px;
    text-align: center;
}
</style>