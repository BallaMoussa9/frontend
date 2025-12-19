<template>
  <AdminLayout>
    <div class="notifications-page">
      <h2>Envoyer une notification</h2>

      <div class="notification-form-container">
        <form @submit.prevent="handleSendNotification" class="notif-form">
          <div class="form-group checkbox-group">
            <input type="checkbox" id="sendToAll" v-model="sendToAll" />
            <label for="sendToAll">Envoyer à tous les utilisateurs</label>
          </div>

          <div v-if="!sendToAll" class="form-group">
            <label for="recipients">Destinataires :</label>
            <div class="search-select-container">
              <input
                type="text"
                v-model="searchQuery"
                @input="debouncedSearch"
                placeholder="Rechercher des utilisateurs..."
                class="search-input"
                :disabled="userStore.loadingUsers"
              />
              <div v-if="userStore.loadingUsers" class="loading-message">Chargement des utilisateurs...</div>
              <div v-else-if="userStore.errorUsers" class="error-message">Erreur: {{ userStore.errorUsers }}</div>
              
              <select
                id="recipients"
                v-model="selectedRecipientIds"
                multiple
                class="recipient-select"
                :disabled="userStore.loadingUsers || filteredUsers.length === 0"
                size="7" 
              >
                <option v-if="filteredUsers.length === 0 && searchQuery" disabled>Aucun utilisateur trouvé.</option>
                <option v-else-if="filteredUsers.length === 0 && !searchQuery && !userStore.loadingUsers" disabled>Aucun utilisateur disponible.</option>
                <option v-for="user in filteredUsers" :key="user.id" :value="user.id">
                  {{ user.first_name }} {{ user.last_name }} ({{ user.email }})
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="type">Type de notification :</label>
            <select id="type" v-model="type">
              <option value="">Sélectionner un type</option>
              <option value="urgence">Urgence</option>
              <option value="laboratoire">Laboratoire</option>
              <option value="Administratif">Administratif</option>
              <option value="financiere">Financière</option>
            </select>
          </div>

          <div class="form-group">
            <label for="subject">Sujet / Titre :</label>
            <input id="subject" v-model="subject" type="text" placeholder="Ex: Nouvelle mise à jour importante" />
          </div>

          <div class="form-group">
            <label for="message">Message :</label>
            <textarea id="message" v-model="message" rows="7" placeholder="Écrivez le contenu de votre notification ici..."></textarea>
          </div>

          <div v-if="notificationStore.sendError" class="message-box error-message">
            Erreur: {{ notificationStore.sendError }}
          </div>
          <div v-if="notificationStore.sendSuccess" class="message-box success-message">
            Notification(s) envoyée(s) avec succès !
          </div>

          <button type="submit" :disabled="notificationStore.sending || !isFormValid">
            <span v-if="notificationStore.sending">Envoi en cours...</span>
            <span v-else>📤 Envoyer la notification</span>
          </button>
        </form>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { ref, onMounted, computed, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useNotificationStore } from '@/stores/notificationStore'

const userStore = useUserStore()
const notificationStore = useNotificationStore()

// États réactifs pour les champs du formulaire
const sendToAll = ref(false)
const selectedRecipientIds = ref([])
const searchQuery = ref('')
const type = ref('')
const subject = ref('')
const message = ref('')

// Propriété calculée pour filtrer la liste des utilisateurs affichée
const filteredUsers = computed(() => {
  if (!searchQuery.value) {
    return userStore.allUsers
  }
  const searchLower = searchQuery.value.toLowerCase()
  return userStore.allUsers.filter(user =>
    user.first_name.toLowerCase().includes(searchLower) ||
    user.last_name.toLowerCase().includes(searchLower) ||
    user.email.toLowerCase().includes(searchLower)
  )
})

// Propriété calculée pour la validation du formulaire avant l'envoi
const isFormValid = computed(() => {
  if (!type.value || !subject.value.trim() || !message.value.trim()) {
    return false;
  }
  if (!sendToAll.value && selectedRecipientIds.value.length === 0) {
    return false;
  }
  return true;
});

// Fonction de débounce pour la recherche
let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {}, 300)
}

// Gère l'envoi du formulaire de notification
async function handleSendNotification() {
  if (!isFormValid.value) {
    alert("Veuillez remplir le type, le sujet, le message et sélectionner au moins un destinataire ou choisir d'envoyer à tous.");
    return;
  }

  const payload = {
    recipient_ids: sendToAll.value ? [] : selectedRecipientIds.value,
    type: type.value,
    subject: subject.value,
    message: message.value,
    send_to_all: sendToAll.value,
  };

  await notificationStore.sendNotification(payload);

  if (notificationStore.sendSuccess) {
    // Réinitialiser le formulaire après un envoi réussi
    sendToAll.value = false;
    selectedRecipientIds.value = [];
    searchQuery.value = '';
    type.value = '';
    subject.value = '';
    message.value = '';
  }
}

// Surveille les changements pour effacer les messages d'état
watch([subject, message, selectedRecipientIds, sendToAll, type], () => {
  notificationStore.sendSuccess = false;
  notificationStore.sendError = null;
});

// Charger la liste des utilisateurs au montage
onMounted(async () => {
  await userStore.fetchAllUsers()
})
</script>

<style scoped>
/* Styles identiques à ta version précédente */
</style>

<style scoped>
/* Les styles restent inchangés */
.notifications-page {
  max-width: 900px;
  margin: 30px auto;
  background: #ffffff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  font-family: 'Inter', sans-serif;
}

h2 {
  color: #002580;
  text-align: center;
  margin-bottom: 30px;
  font-size: 2.2em;
  font-weight: 700;
}

.notif-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  font-size: 1.05em;
}

input[type="text"],
textarea,
select {
  width: 100%;
  padding: 12px 15px;
  border-radius: 8px;
  border: 1px solid #dcdcdc;
  font-size: 1em;
  box-sizing: border-box;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input[type="text"]:focus,
textarea:focus,
select:focus {
  border-color: #0056b3;
  box-shadow: 0 0 0 3px rgba(0, 86, 179, 0.1);
  outline: none;
}

textarea {
  resize: vertical;
  min-height: 120px;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
  height: 18px;
  margin-right: 5px;
  cursor: pointer;
}

.search-select-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recipient-select {
  max-height: 300px;
  overflow-y: auto;
}

button[type="submit"] {
  align-self: flex-end;
  background: #0040d0;
  color: white;
  padding: 12px 25px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 1.1em;
  font-weight: 600;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

button[type="submit"]:hover:not(:disabled) {
  background-color: #0030a0;
  transform: translateY(-1px);
}

button[type="submit"]:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.8;
}

.message-box {
  padding: 12px;
  border-radius: 8px;
  margin-top: 15px;
  font-weight: 500;
  text-align: center;
  border: 1px solid transparent;
}

.loading-message {
  background-color: #e0f2f7;
  color: #007bb5;
  border-color: #b3e5fc;
}

.error-message {
  background-color: #fce4e4;
  color: #d32f2f;
  border-color: #ef9a9a;
}

.success-message {
  background-color: #e8f5e9;
  color: #388e3c;
  border-color: #a5d6a7;
}
</style>