import { defineStore } from 'pinia';
import { useAuthStore } from './authStores';

// 🔑 Assurez-vous que ces fonctions API existent et fonctionnent réellement
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
    // ... (Getters inchangés) ...
    recipientProfilePhoto: (state) => {
      const targetUser = state.currentConversation?.other_user || state.selectedRecipient;
      if (!targetUser) return '';
      if (targetUser.profile_photo_url) return targetUser.profile_photo_url;
      if (targetUser.profile_photo_path) {
          const cleanedPath = targetUser.profile_photo_path.startsWith('public/') ? targetUser.profile_photo_path.substring(7) : targetUser.profile_photo_path;
          return `http://localhost:8000/api/storage/${cleanedPath}`;
      }
      const firstLetter = (targetUser.first_name ? targetUser.first_name.charAt(0) : 'U').toUpperCase();
      return `data:image/svg+xml,...${firstLetter}...`; 
    },
    recipientName: (state) => {
      const targetUser = state.currentConversation?.other_user || state.selectedRecipient;
      if (targetUser) {
        return `${targetUser.first_name} ${targetUser.last_name}`;
      }
      return 'Sélectionnez un contact';
    },
    isMyMessage: (state) => (message) => {
      const authStore = useAuthStore();
      return message.user_id === authStore.user?.id;
    },
  },

  actions: {
    async fetchConversations() {
      // ...
    },

    // 2. Action CRITIQUE pour démarrer un chat et CHARGER L'HISTORIQUE
    async startChatWithUser(user) {
      const authStore = useAuthStore();
      if (!authStore.user?.id) {
        this.error = "ID de l'utilisateur courant non disponible.";
        return;
      }

      this.loading = true;
      this.error = null;
      this.currentConversation = null;
      this.messages = []; 
      this.selectedRecipient = user; 

      try {
        const newConversationData = await createConversationApi(user.id);
        this.currentConversation = newConversationData;
        this.selectedRecipient = newConversationData.other_user || user; 

        if (this.currentConversation.id) {
            const messagesResponse = await fetchMessagesApi(this.currentConversation.id);
            
            // CORRECTION 1 : Récupérer le tableau à partir de la clé 'data' si elle existe.
            const messagesArray = messagesResponse.data || messagesResponse;
            
            // Garantir que l'historique est un Array avant l'assignation
            if (Array.isArray(messagesArray)) {
              this.messages = messagesArray; 
            } else {
              this.messages = []; 
              console.warn("L'API n'a pas renvoyé un tableau pour l'historique des messages.");
            }
        }

        await this.fetchConversations(); 

      } catch (error) {
        this.error = error.message || "Erreur lors de la création ou du démarrage d'une nouvelle conversation.";
      } finally {
        this.loading = false;
      }
    },

    // 3. Action CRITIQUE pour ENVOYER et PERSISTER le message
    async sendMessage(payload) { // CHANGEMENT: Renommage de 'content' en 'payload' pour la flexibilité
      const authStore = useAuthStore();
      
      let contentToSend = payload;

      // 🛑 CORRECTION MAJEURE: Gérer la rétrocompatibilité
      if (typeof payload === 'object' && payload !== null && 'content' in payload) {
        // Nouveau cas (AlerteDetailView): Récupérer la chaîne de l'objet
        contentToSend = payload.content;
      }
      // Ancien cas: contentToSend est déjà la chaîne de caractères (payload = string)

      // 🛑 SÉCURITÉ: Vérifier le contenu après la déduction du format
      if (typeof contentToSend !== 'string' || contentToSend.trim() === '' || !this.selectedRecipient) {
        this.error = "Contenu ou destinataire invalide.";
        return false;
      }
      
      // On utilise trim() en toute sécurité, car contentToSend est garanti être une string.
      const content = contentToSend.trim(); 

      this.sending = true;
      this.error = null;

      try {
        let conversationId = this.currentConversation?.id;

        if (!conversationId) {
          const conversation = await createConversationApi(this.selectedRecipient.id);
          this.currentConversation = conversation;
          this.selectedRecipient = conversation.other_user; 
          conversationId = conversation.id;
          
          const messagesResponse = await fetchMessagesApi(conversationId);
          // SÉCURISATION : Garantir que l'historique est un Array, même ici.
          const messagesArray = messagesResponse.data || messagesResponse;
          this.messages = Array.isArray(messagesArray) ? messagesArray : [];
        }

        // L'appel à l'API utilise maintenant la variable 'content' nettoyée (la string)
        const message = await sendMessageApi(conversationId, content);
        
        // Assurer que les champs nécessaires pour l'affichage sont présents
        if (!message.user_id) message.user_id = authStore.user?.id;
        if (!message.user) message.user = authStore.user; 
        
        // SÉCURITÉ : Vérifier que this.messages est un Array avant d'appeler push()
        if (!Array.isArray(this.messages)) {
            console.warn("this.messages a été corrompu et réinitialisé en Array.");
            this.messages = [];
        }
         
        this.messages.push(message); 

        await this.fetchConversations();

        return true;
      } catch (error) {
        this.error = error.message || "Échec de l'envoi du message. Le message n'a pas été sauvegardé.";
        return false;
      } finally {
        this.sending = false;
      }
    },
  },
});