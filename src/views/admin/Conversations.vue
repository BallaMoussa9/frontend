<template>
  <AdminLayout>
    <div class="conversation-page">
      <h2 class="page-title">Messagerie Administrateur</h2>
      <div class="chat-main-container">

        <aside class="user-list-panel">
          <h4 class="panel-title">Tous les utilisateurs</h4>

          <div v-if="userStore.loading" class="status-message loading-message">
            Chargement des utilisateurs...
          </div>
          <div v-else-if="userStore.error" class="status-message error-message">
            Erreur: {{ userStore.error }}
          </div>
          <ul v-else-if="userStore.allUsers.length > 0" class="user-list">
            <li
              v-for="user in userStore.allUsers"
              :key="user.id"
              :class="{ 'user-active': chatStore.selectedRecipient?.id === user.id, 'user-self': user.id === authStore.user?.id }"
              @click="handleStartChat(user)"
              :title="user.id === authStore.user?.id ? 'Vous ne pouvez pas discuter avec vous-même' : ''"
            >
              <img :src="getUserPhoto(user)" :alt="user.first_name" class="user-avatar" />
              <div class="user-details">
                <span class="user-name">{{ user.first_name }} {{ user.last_name }} <span v-if="user.id === authStore.user?.id">(Moi)</span></span>
                <small class="user-role">{{ user.roles && user.roles.length > 0 ? user.roles[0].name : 'Non spécifié' }}</small>
              </div>
            </li>
          </ul>
          <div v-else class="status-message no-users-message">Aucun autre utilisateur trouvé.</div>
        </aside>

        <div class="chat-display-area" v-if="chatStore.selectedRecipient">
          <div class="chat-header">
            <img :src="chatStore.recipientProfilePhoto" :alt="chatStore.recipientName" class="recipient-avatar" />
            <h4 class="chat-recipient-name">Conversation avec {{ chatStore.recipientName }}</h4>
          </div>

          <div class="messages-thread" ref="messagesContainer">
            <div v-if="chatStore.loading && chatStore.messages.length === 0" class="status-message loading-messages">
                Chargement des messages...
            </div>
            <div v-else-if="chatStore.error" class="status-message error-messages">
                {{ chatStore.error }}
            </div>
            <div v-else-if="chatStore.messages.length === 0 && !chatStore.loading" class="status-message no-messages">
                Commencez la conversation avec {{ chatStore.recipientName }} !
            </div>
            <div
              v-for="msg in [...chatStore.messages].reverse()"
              :key="msg.id"
              :class="['message-item', chatStore.isMyMessage(msg) ? 'message-admin-sender' : 'message-other-user']"
            >
              <div class="message-bubble">{{ msg.content }}</div>
              <span class="message-timestamp">{{ formatTimestamp(msg.created_at) }}</span>
            </div>
          </div>

          <form @submit.prevent="sendChatMessage" class="message-input-form">
            <input
              v-model="newMessage"
              type="text"
              placeholder="Écrire un message..."
              required
              :disabled="chatStore.loading"
              class="message-input-field"
            />
            <button
              type="submit"
              :disabled="chatStore.loading || !newMessage.trim()"
              class="send-button"
            >
              <span v-if="chatStore.loading">Envoi...</span>
              <span v-else>Envoyer</span>
            </button>
          </form>
        </div>

        <div v-else class="chat-empty-state">
          <p>📭 Sélectionnez un utilisateur dans la liste pour commencer à discuter.</p>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/authStores'

const chatStore = useChatStore();
const userStore = useUserStore();
const authStore = useAuthStore();

const newMessage = ref('');
const messagesContainer = ref(null);

const getUserPhoto = (user) => {
    if (user?.profile_photo_url) {
        return user.profile_photo_url;
    }
    if (user?.profile_photo_path) {
        const cleanedPath = user.profile_photo_path.startsWith('public/') ? user.profile_photo_path.substring(7) : user.profile_photo_path;
        return `http://localhost:8000/storage/${cleanedPath}`;
    }
    const firstLetter = (user?.first_name ? user.first_name.charAt(0) : 'U').toUpperCase();
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23002580'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='20' fill='%23ffffff' font-family='Arial'%3E${firstLetter}%3C/text%3E%3C/svg%3E`;
};

async function handleStartChat(user) {
  if (!authStore.user?.id) {
    console.error("Erreur: ID de l'administrateur non disponible pour démarrer le chat.");
    chatStore.error = "Erreur: Votre session n'est pas complètement chargée. Veuillez recharger la page ou vous reconnecter.";
    return;
  }

  if (user.id === authStore.user.id) {
      chatStore.error = "Vous ne pouvez pas démarrer une conversation avec vous-même.";
      chatStore.currentConversation = null;
      chatStore.messages = [];
      chatStore.selectedRecipient = null;
      return;
  }

  // Si le destinataire est déjà sélectionné ET que la conversation est déjà active,
  // nous faisons juste un scroll si nécessaire, pas de rechargement.
  if (chatStore.selectedRecipient?.id === user.id && chatStore.currentConversation?.id) {
    console.log("Composant Admin: Destinataire déjà sélectionné et conversation active. Scroll.");
    // Logging des messages pour le débogage (si conversation déjà active)
    console.log(`MESSAGE entre l'admin et ${user.first_name} (déjà sélectionné) :`, chatStore.messages);
    await nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
    });
    return;
  }

  try {
      console.log(`Composant Admin: Démarrage/récupération du chat avec l'utilisateur ${user.id}`);
      await chatStore.startChatWithUser(user);

      // Log des messages APRÈS que la conversation et les messages aient été chargés dans le store
      if (chatStore.currentConversation && chatStore.selectedRecipient) {
          console.log(`MESSAGE entre l'admin et ${chatStore.selectedRecipient.first_name} :`, chatStore.messages);
      } else {
          console.warn(`Aucune conversation active ou destinataire sélectionné après le démarrage du chat avec ${user.first_name}.`);
      }

  } catch (error) {
    console.error("Composant Admin: Erreur lors du démarrage du chat :", error);
  }

  await nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

const formatTimestamp = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

async function sendChatMessage() {
  if (!newMessage.value.trim()) {
    console.warn("Tente d'envoyer un message vide.");
    return;
  }

  const content = newMessage.value.trim();
  const originalMessage = content;
  newMessage.value = '';

  const sent = await chatStore.sendMessage(content);
  if (sent) {
    console.log("Message envoyé avec succès.");
  } else {
    console.error("Échec de l'envoi du message. Vérifier le chatStore.error pour plus de détails.");
    newMessage.value = originalMessage;
  }
}

onMounted(async () => {
  if (authStore.user?.id) {
      await userStore.fetchAllUsers();
  }
});

watch(() => authStore.user?.id, async (newId) => {
    if (newId) {
        console.log("Composant Admin: ID utilisateur authentifié disponible, chargement des utilisateurs.");
        await userStore.fetchAllUsers();
    }
}, { immediate: true });

watch(() => chatStore.messages, async () => {
  console.log("Composant Admin: Messages mis à jour, défilement vers le bas.");
  await nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}, { deep: true });

watch(
    () => chatStore.currentConversation?.id,
    (newValue, oldValue) => {
        if (newValue !== oldValue) {
            console.log("Composant Admin: Changement de conversation active, réinitialisation de l'input et des erreurs.");
            newMessage.value = '';
            chatStore.error = null;
            if (chatStore.currentConversation) {
                const currentUserId = authStore.user?.id;
                chatStore.selectedRecipient = chatStore.currentConversation.users.find(u => u.id !== currentUserId);
            } else {
                chatStore.selectedRecipient = null;
            }
        }
    }
);
</script>

<style scoped>
/* ************************************** */
/* ********** Styles Générales ********** */
/* ************************************** */
:root {
    --admin-primary-dark: #2c3e50; /* Bleu marine foncé, presque noir */
    --admin-accent-blue: #3498db;   /* Bleu ciel pour les accents */
    --admin-light-bg: #ecf0f1;      /* Gris très clair pour les fonds */
    --admin-white: #ffffff;
    --admin-border-light: #dfe4e6;  /* Bordures subtiles */
    --admin-text-dark: #2c3e50;
    --admin-text-light: #7f8c8d;
    --admin-success: #2ecc71;
    --admin-error: #e74c3c;
    --admin-hover-light: #e0e6e8;
    --admin-active-bg: #dbe4f2; /* Similaire au bleu docteur mais plus clair pour l'admin */
}

.conversation-page {
  padding: 30px;
  background-color: var(--admin-light-bg);
  min-height: 100vh;
  font-family: 'Inter', sans-serif; /* Une police plus moderne */
}

.page-title {
    color: var(--admin-primary-dark);
    margin-bottom: 30px;
    font-size: 2.5em;
    font-weight: 700;
    border-bottom: 3px solid var(--admin-accent-blue);
    padding-bottom: 15px;
}

.chat-main-container {
  display: flex;
  background: var(--admin-white);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 15px 40px rgba(0,0,0,0.15); /* Ombre plus prononcée */
  height: calc(100vh - 180px); /* Ajusté pour une meilleure proportion */
  min-height: 600px;
}

/* ************************************** */
/* ************ Sidebar Utilisateurs **** */
/* ************************************** */
.user-list-panel {
  width: 350px;
  background: var(--admin-white);
  border-right: 1px solid var(--admin-border-light);
  padding: 20px 0;
  overflow-y: auto;
  box-shadow: inset -2px 0 5px rgba(0,0,0,0.05); /* Petite ombre interne */
}

.panel-title {
  margin: 0 25px 20px 25px;
  color: var(--admin-primary-dark);
  font-weight: 600;
  font-size: 1.3em;
  border-bottom: 1px solid var(--admin-border-light);
  padding-bottom: 15px;
}

.user-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.user-list li {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 25px;
  cursor: pointer;
  transition: background-color 0.2s, border-left 0.2s;
  border-left: 5px solid transparent;
}

.user-list li:hover {
  background: var(--admin-hover-light);
}

.user-list li.user-active {
  background: var(--admin-active-bg);
  border-left-color: var(--admin-accent-blue);
  font-weight: 600;
  color: var(--admin-primary-dark);
}

/* Style pour l'utilisateur admin lui-même */
.user-list li.user-self {
    background-color: #f0f0f0; /* Gris clair pour indiquer "Moi" */
    cursor: not-allowed;
    opacity: 0.7;
    border-left-color: #ccc;
}
.user-list li.user-self:hover {
    background-color: #f0f0f0; /* Pas de changement de couleur au survol */
}


.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid var(--admin-border-light);
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.user-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.user-name {
    color: var(--admin-text-dark);
    font-size: 1.05em;
    font-weight: 500;
}

.user-role {
    font-size: 0.75rem;
    color: var(--admin-text-light);
    text-transform: uppercase;
    margin-top: 2px;
}

/* ************************************** */
/* ********** Zone de Chat ************** */
/* ************************************** */
.chat-display-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
    display: flex;
    align-items: center;
    padding: 18px 25px;
    background: var(--admin-light-bg);
    border-bottom: 1px solid var(--admin-border-light);
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.recipient-avatar {
    width: 55px;
    height: 55px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 15px;
    border: 3px solid var(--admin-accent-blue);
}

.chat-recipient-name {
    margin: 0;
    color: var(--admin-primary-dark);
    font-size: 1.4em;
    font-weight: 600;
}

.messages-thread {
  flex: 1;
  overflow-y: auto;
  padding: 25px;
  background-color: #fcfdfe; /* Un blanc très légèrement teinté */
  display: flex;
  flex-direction: column-reverse; /* Affichage du plus récent en bas */
}

/* ************************************** */
/* ********** Bulles de Message ********* */
/* ************************************** */
.message-item {
  max-width: 65%; /* Légèrement plus large */
  margin-top: 15px; /* Important pour column-reverse */
  display: flex;
  flex-direction: column;
  position: relative;
}

.message-bubble {
    padding: 14px 20px;
    border-radius: 22px; /* Plus arrondi */
    font-size: 1.05em;
    line-height: 1.5;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* Ombre plus douce */
}

.message-admin-sender {
  align-self: flex-end; /* Mes messages à droite */
  margin-left: auto;
}
.message-admin-sender .message-bubble {
  background: var(--admin-accent-blue);
  color: var(--admin-white);
  border-bottom-right-radius: 8px; /* Détail stylistique */
}

.message-other-user {
  align-self: flex-start; /* Messages des autres à gauche */
  margin-right: auto;
}
.message-other-user .message-bubble {
  background: var(--admin-light-bg);
  color: var(--admin-text-dark);
  border-bottom-left-radius: 8px; /* Détail stylistique */
}

.message-timestamp {
    font-size: 0.75em;
    display: block;
    margin-top: 5px;
    text-align: right; /* Pour l'expéditeur */
    opacity: 0.8;
    color: inherit; /* Hérite de la couleur de la bulle */
}
.message-other-user .message-timestamp {
    text-align: left; /* Pour le récepteur */
}
.message-admin-sender .message-timestamp {
    color: rgba(255, 255, 255, 0.8);
}


/* ************************************** */
/* ********** Formulaire d'entrée ******* */
/* ************************************** */
.message-input-form {
  display: flex;
  align-items: center;
  gap: 15px; /* Espacement amélioré */
  padding: 20px 25px;
  border-top: 1px solid var(--admin-border-light);
  background-color: var(--admin-white);
  box-shadow: 0 -2px 8px rgba(0,0,0,0.05); /* Ombre au-dessus */
}

.message-input-field {
  flex-grow: 1;
  padding: 14px 20px;
  border-radius: 28px; /* Très arrondi */
  border: 1px solid var(--admin-border-light);
  font-size: 1.05em;
  transition: border-color 0.2s, box-shadow 0.2s;
  background-color: #fbfcfe;
}

.message-input-field:focus {
    border-color: var(--admin-accent-blue);
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.25);
    outline: none;
}

.send-button {
  flex-shrink: 0;
  background: var(--admin-accent-blue);
  color: var(--admin-white);
  border: none;
  padding: 14px 28px;
  border-radius: 28px;
  cursor: pointer;
  font-size: 1.05em;
  font-weight: 600;
  transition: background-color 0.2s ease, opacity 0.2s, transform 0.1s;
}

.send-button:hover:not(:disabled) {
  background-color: #2980b9; /* Teinte plus foncée au survol */
  transform: translateY(-1px); /* Léger effet de soulèvement */
}

.send-button:disabled {
    background-color: #bdc3c7; /* Grisâtre pour désactivé */
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
}

/* ************************************** */
/* ********** Messages d'état *********** */
/* ************************************** */
.status-message {
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--admin-text-light);
  font-size: 1.2em;
  text-align: center;
  padding: 30px;
  background-color: #fdfdfd;
}
.chat-empty-state {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--admin-text-light);
    font-size: 1.2em;
    text-align: center;
    padding: 30px;
    background-color: #fdfdfd;
}

.loading-message, .loading-messages {
    color: var(--admin-accent-blue);
    font-weight: 500;
}

.error-message, .error-messages {
    color: var(--admin-error);
    background-color: rgba(231, 76, 60, 0.1);
    border: 1px solid var(--admin-error);
    border-radius: 8px;
    margin: 20px;
    font-weight: 500;
}
.no-users-message, .no-messages {
  font-style: italic;
  opacity: 0.9;
}
</style>
