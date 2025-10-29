// src/services/apiChat.js
import API from './axios'; // Assurez-vous que './axios' est bien le chemin vers votre instance Axios configurée

const handleChatRequest = async (promise) => {
  try {
    const response = await promise;
    return response.data; // Retourne directement data car le store l'attend
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Erreur de connexion au chat.';
    console.error('Erreur API Chat:', error.response?.data || error.message);
    throw new Error(errorMessage); // Lève une erreur pour que le store puisse la catcher
  }
};

// Fonctions d'API exportées avec des noms clairs
export const apiGetConversations = () => handleChatRequest(API.get('/chat/conversations'));

// Crée ou obtient une conversation privée avec un utilisateur spécifique
// L'API backend s'attend à `receiver_id` dans le corps de la requête POST
export const apiCreateOrGetPrivateConversation = (receiverId) => handleChatRequest(API.post('/chat/conversations', { receiver_id: receiverId }));

export const apiGetConversationMessages = (conversationId) => handleChatRequest(API.get(`/chat/conversations/${conversationId}/messages`));

// Envoie un message à une conversation existante
// L'API backend s'attend à `content` dans le corps de la requête POST
export const apiSendMessage = (conversationId, content) => handleChatRequest(API.post(`/chat/conversations/${conversationId}/messages`, { content: content }));

// Si vous avez une API pour lister tous les utilisateurs (pas seulement les conversations)
// afin de peupler la liste 'Utilisateurs' à gauche, vous en aurez besoin ici.
// Par exemple: export const apiGetAllUsers = () => handleChatRequest(API.get('/users'));
