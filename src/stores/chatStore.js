// stores/chatStore.js

import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './authStores';

// --- CORRECTION MAJEURE ICI ---
// Les noms des fonctions importées doivent correspondre aux noms exportés dans apiChat.js
// et être renommés localement pour correspondre à l'utilisation dans ce store.
import {
  apiGetConversations as fetchConversationsApi,
  apiGetConversationMessages as fetchMessagesApi,
  apiSendMessage as sendMessageApi,
  apiCreateOrGetPrivateConversation as createConversationApi,
} from '@/services/apiChat';


export const useChatStore = defineStore('chat', {
  state: () => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  loadingConversations: false,
  sending: false,
  error: null,
  selectedRecipient: null,
}),


  getters: {
    getConversations: (state) => state.conversations,
    getCurrentConversation: (state) => state.currentConversation,
    getMessages: (state) => state.messages,

    recipientProfilePhoto: (state) => {
        // Priorité 1: Photo de l'autre utilisateur dans la conversation actuelle
        if (state.currentConversation?.other_user?.profile_photo_url) {
            return state.currentConversation.other_user.profile_photo_url;
        }
        if (state.currentConversation?.other_user?.profile_photo_path) {
            const cleanedPath = state.currentConversation.other_user.profile_photo_path.startsWith('public/') ? state.currentConversation.other_user.profile_photo_path.substring(7) : state.currentConversation.other_user.profile_photo_path;
            return `https://santeko-api.onrender.com/storage/${cleanedPath}`;
        }
        // Priorité 2: Photo de l'utilisateur sélectionné (pour une nouvelle conversation)
        if (state.selectedRecipient?.profile_photo_url) {
            return state.selectedRecipient.profile_photo_url;
        }
        if (state.selectedRecipient?.profile_photo_path) {
            const cleanedPath = state.selectedRecipient.profile_photo_path.startsWith('public/') ? state.selectedRecipient.profile_photo_path.substring(7) : state.selectedRecipient.profile_photo_path;
            return `https://santeko-api.onrender.com/storage/${cleanedPath}`;
        }
        // Fallback: Génère une initiale (utiliser la même logique que dans Conversations.vue)
        const firstLetter = (state.currentConversation?.other_user?.first_name || state.selectedRecipient?.first_name || 'U').charAt(0).toUpperCase();
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23002580'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='20' fill='%23ffffff' font-family='Arial'%3E${firstLetter}%3C/text%3E%3C/svg%3E`;
    },

    recipientName: (state) => {
        if (state.currentConversation?.other_user) {
            return `${state.currentConversation.other_user.first_name} ${state.currentConversation.other_user.last_name}`;
        }
        if (state.selectedRecipient) {
            return `${state.selectedRecipient.first_name} ${state.selectedRecipient.last_name}`;
        }
        return 'Sélectionnez un contact';
    },

    isMyMessage: (state) => (message) => {
      const authStore = useAuthStore();
      return message.sender_id === authStore.user?.id;
    },
  },

  actions: {
    async fetchConversations() {
      const authStore = useAuthStore();
      if (!authStore.user?.id) {
        this.error = "ID de l'utilisateur courant non disponible pour charger les conversations.";
        console.error(this.error);
        this.loadingConversations = false;
        return;
      }

      this.loadingConversations = true;
      this.error = null;
      try {
        const data = await fetchConversationsApi();
        this.conversations = data;
        console.log("Conversations chargées:", this.conversations);

        // Mettre à jour l'état de currentConversation si elle était déjà sélectionnée
        if (this.currentConversation) {
            const updatedConv = this.conversations.find(c => c.id === this.currentConversation.id);
            if (updatedConv) {
                // S'assure de récupérer la version la plus récente de la conversation
                // Important: Conserver other_user qui peut ne pas être dans les données complètes de la conversation listée
                const previousOtherUser = this.currentConversation.other_user;
                this.currentConversation = { ...updatedConv, other_user: previousOtherUser };
            } else {
                this.currentConversation = null;
                this.messages = [];
                this.selectedRecipient = null;
            }
        }
      } catch (error) {
        this.error = error.message || "Erreur lors du chargement des conversations.";
        console.error("Erreur fetchConversations (action):", error);
      } finally {
        this.loadingConversations = false;
      }
    },

    async startChatWithConversation(conversationId) {
      const authStore = useAuthStore();
      if (!authStore.user?.id) {
        this.error = "ID de l'utilisateur courant non disponible pour démarrer la conversation.";
        console.error(this.error);
        return;
      }

      this.loading = true;
      this.error = null;
      this.currentConversation = null;
      this.messages = []; // Vider les messages avant de charger les nouveaux
      this.selectedRecipient = null;

      try {
        const conversation = this.conversations.find(conv => conv.id === conversationId);
        if (!conversation) {
          this.error = "Conversation non trouvée localement.";
          console.error(this.error);
          return;
        }

        // On définit d'abord l'autre utilisateur pour les getters
        conversation.other_user = conversation.users.find(u => u.id !== authStore.user.id);
        this.currentConversation = conversation;
        this.selectedRecipient = conversation.other_user; // Met à jour selectedRecipient aussi

        // Charge les messages pour cette conversation spécifique
        const messagesData = await fetchMessagesApi(conversationId);
        this.messages = messagesData;
        console.log("Messages chargés pour la conversation", conversationId, ":", this.messages);

      } catch (error) {
        this.error = error.message || "Erreur lors du démarrage de la conversation.";
        console.error("Erreur startChatWithConversation (action):", error);
      } finally {
        this.loading = false;
      }
    },

    async startChatWithUser(user) {
      const authStore = useAuthStore();
      if (!authStore.user?.id) {
        this.error = "ID de l'utilisateur courant non disponible pour démarrer le chat.";
        console.error(this.error);
        return;
      }

      this.loading = true;
      this.error = null;
      this.currentConversation = null;
      this.messages = []; // Vider les messages avant de charger la nouvelle conversation
      this.selectedRecipient = user;

      try {
        const existingConv = this.conversations.find(conv =>
            conv.users.some(u => u.id === user.id) &&
            conv.users.some(u => u.id === authStore.user.id)
        );

        if (existingConv) {
          console.log("Conversation existante trouvée avec", user.first_name, ". Chargement...");
          // Délègue à startChatWithConversation, qui gérera le chargement des messages.
          return await this.startChatWithConversation(existingConv.id);
        }

        console.log("Création ou obtention d'une nouvelle conversation avec", user.first_name);
        const newConversationData = await createConversationApi(user.id); // L'API renvoie la conversation créée/obtenue

        // Après création/obtention, met à jour la liste des conversations complètes
        await this.fetchConversations(); // Cela rafraîchit `this.conversations` avec la nouvelle conversation

        const createdOrFetchedConversation = this.conversations.find(c => c.id === newConversationData.id);

        if (createdOrFetchedConversation) {
            // Définir l'autre_user pour les getters
            createdOrFetchedConversation.other_user = user;
            this.currentConversation = createdOrFetchedConversation;
            this.selectedRecipient = user; // Assurez-vous que selectedRecipient est bien l'utilisateur ciblé

            // Si c'est une toute nouvelle conversation, `messages` devrait être vide, ce qui est déjà fait au début de l'action.
            // Si c'est une conversation existante qui a été 'obtenue' par createConversationApi,
            // alors fetchConversations() aura ramené des données, mais il faut quand même charger ses messages spécifiques.
            // On s'assure de charger les messages pour cette conversation, même si elle vient d'être "créée/obtenue".
            if (createdOrFetchedConversation.id) {
                const messagesData = await fetchMessagesApi(createdOrFetchedConversation.id);
                this.messages = messagesData;
                console.log("Messages chargés pour la nouvelle/obtenue conversation", createdOrFetchedConversation.id, ":", this.messages);
            }
        } else {
            this.error = "Conversation créée/obtenue mais introuvable dans la liste mise à jour.";
            console.error(this.error);
        }

      } catch (error) {
        this.error = error.message || "Erreur lors de la création ou du démarrage d'une nouvelle conversation.";
        console.error("Erreur startChatWithUser (action):", error);
      } finally {
        this.loading = false;
      }
    },

    async sendMessage(content) {
      const authStore = useAuthStore();

      if (!this.currentConversation?.id && !this.selectedRecipient) {
        this.error = "Impossible d'envoyer un message sans conversation ou destinataire.";
        return false;
      }

      this.sending = true;
      this.error = null;

      try {
        let conversationId = this.currentConversation?.id;

        // Si aucune conversation active mais un destinataire sélectionné, on en crée une (ou on l'obtient)
        if (!conversationId && this.selectedRecipient) {
          console.log("Tentative d'envoi sans conversation active, création/obtention d'une conversation.");
          const conversation = await createConversationApi(this.selectedRecipient.id);
          this.currentConversation = conversation;
          conversationId = conversation.id;

          // Mettre à jour l'other_user pour les getters après création
          this.currentConversation.other_user = this.selectedRecipient;

          // Recharger les messages après la création si la conversation était inactive
          const messagesData = await fetchMessagesApi(conversationId);
          this.messages = messagesData;
        }

        const message = await sendMessageApi(conversationId, content);
        this.messages.push(message); // Ajoute le nouveau message localement

        // Après l'envoi, rafraîchir la liste des conversations pour mettre à jour les "last_message" etc.
        await this.fetchConversations();

        return true;
      } catch (error) {
        console.error("Erreur envoi message:", error);
        this.error = "Échec de l'envoi du message.";
        return false;
      } finally {
        this.sending = false;
      }
    }

  },
});
