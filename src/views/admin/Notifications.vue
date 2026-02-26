<template>
  <AdminLayout>
    <div class="notifications-container">
      <header class="page-header">
        <div class="header-left">
          <button @click="$router.back()" class="btn-back" title="Retour">
            <span class="arrow">←</span>
          </button>
          <div class="header-text">
            <h2 class="page-title">Centre de Notifications</h2>
            <p class="subtitle">Diffusez des informations importantes aux utilisateurs.</p>
          </div>
        </div>
      </header>

      <div class="notification-card">
        <form @submit.prevent="handleSendNotification" class="notif-form">
          
          <div class="form-section">
            <div class="section-title">
              <span class="icon">👥</span>
              <h3>Destinataires</h3>
            </div>
            
            <div class="checkbox-wrapper">
              <input type="checkbox" id="sendToAll" v-model="sendToAll" class="custom-checkbox" />
              <label for="sendToAll">Envoyer à tous les utilisateurs</label>
            </div>

            <Transition name="fade-slide">
              <div v-if="!sendToAll" class="recipient-selection">
                <div class="search-box">
                  <input
                    type="text"
                    v-model="searchQuery"
                    placeholder="Rechercher par nom ou email..."
                    class="search-input"
                  />
                  <div v-if="userStore.loadingUsers" class="spinner-small"></div>
                </div>

                <div class="selection-display" v-if="selectedRecipientIds.length > 0">
                  <span class="badge-count">{{ selectedRecipientIds.length }} sélectionné(s)</span>
                  <button type="button" @click="selectedRecipientIds = []" class="btn-clear">Effacer tout</button>
                </div>

                <div class="users-list-container">
                  <select
                    v-model="selectedRecipientIds"
                    multiple
                    class="modern-select-multiple"
                    :disabled="userStore.loadingUsers"
                  >
                    <option v-for="user in filteredUsers" :key="user.id" :value="user.id">
                      {{ user.first_name }} {{ user.last_name }} ({{ user.email }})
                    </option>
                  </select>
                  <p class="hint">Maintenez <b>Ctrl</b> ou <b>Cmd</b> pour sélection multiple.</p>
                </div>
              </div>
            </Transition>
          </div>

          <div class="form-section">
            <div class="section-title">
              <span class="icon">📝</span>
              <h3>Contenu du message</h3>
            </div>

            <div class="grid-inputs">
              <div class="form-group">
                <label>Type de notification</label>
                <div class="select-wrapper">
                  <select v-model="type" required>
                    <option value="" disabled>Choisir un type...</option>
                    <option value="urgence">🚨 Urgence</option>
                    <option value="laboratoire">🧪 Laboratoire</option>
                    <option value="Administratif">📂 Administratif</option>
                    <option value="financiere">💰 Financière</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Sujet / Titre</label>
                <input v-model="subject" type="text" placeholder="Titre de l'alerte..." required />
              </div>
            </div>

            <div class="form-group">
              <label>Message détaillé</label>
              <textarea v-model="message" rows="5" placeholder="Saisissez votre message ici..."></textarea>
            </div>
          </div>

          <footer class="form-footer">
            <div class="feedback-messages">
              <TransitionGroup name="slide">
                <div v-if="notificationStore.sendError" key="err" class="msg error">
                  ⚠️ {{ notificationStore.sendError }}
                </div>
                <div v-if="notificationStore.sendSuccess" key="succ" class="msg success">
                  ✅ Notification envoyée !
                </div>
              </TransitionGroup>
            </div>

            <button type="submit" class="btn-send" :disabled="notificationStore.sending || !isFormValid">
              <span v-if="notificationStore.sending">Envoi en cours...</span>
              <span v-else>📤 Diffuser maintenant</span>
            </button>
          </footer>
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

const sendToAll = ref(false)
const selectedRecipientIds = ref([])
const searchQuery = ref('')
const type = ref('')
const subject = ref('')
const message = ref('')

const filteredUsers = computed(() => {
  if (!searchQuery.value) return userStore.allUsers
  const searchLower = searchQuery.value.toLowerCase()
  return userStore.allUsers.filter(user =>
    user.first_name.toLowerCase().includes(searchLower) ||
    user.last_name.toLowerCase().includes(searchLower) ||
    user.email.toLowerCase().includes(searchLower)
  )
})

const isFormValid = computed(() => {
  return type.value && subject.value.trim() && message.value.trim() && (sendToAll.value || selectedRecipientIds.value.length > 0)
})

async function handleSendNotification() {
  if (!isFormValid.value) return
  const payload = {
    recipient_ids: sendToAll.value ? [] : selectedRecipientIds.value,
    type: type.value,
    subject: subject.value,
    message: message.value,
    send_to_all: sendToAll.value,
  }
  await notificationStore.sendNotification(payload)
  if (notificationStore.sendSuccess) {
    sendToAll.value = false; selectedRecipientIds.value = []; type.value = ''; subject.value = ''; message.value = '';
  }
}

watch([subject, message, selectedRecipientIds, sendToAll, type], () => {
  notificationStore.sendSuccess = false
  notificationStore.sendError = null
})

onMounted(() => userStore.fetchAllUsers())
</script>

<style scoped>
/* CONFIGURATION DE BASE */
.notifications-container { 
  padding: 15px; 
  max-width: 1000px; 
  margin: 0 auto; 
  animation: fadeIn 0.4s ease-out;
}

/* HEADER RESPONSIVE */
.page-header { 
  display: flex; 
  flex-wrap: wrap; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 25px; 
  gap: 15px;
}
.header-left { display: flex; align-items: center; gap: 12px; }
.btn-back {  
  width: 40px; height: 40px; border-radius: 12px; border: 1px solid #e2e8f0;  
  background: white; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center;
}
.btn-back:hover { background: #f8fafc; transform: translateX(-3px); }
.page-title { margin: 0; font-size: clamp(1.2rem, 5vw, 1.5rem); color: #002580; font-weight: 800; }
.subtitle { margin: 0; color: #64748b; font-size: 0.9rem; }

/* LA CARTE (FORMULAIRE) */
.notification-card { 
  background: white; 
  border-radius: clamp(12px, 3vw, 20px); 
  box-shadow: 0 10px 25px rgba(0,0,0,0.05); 
  padding: clamp(15px, 4vw, 30px); 
}

.form-section { margin-bottom: 30px; }
.section-title { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  margin-bottom: 20px; 
  border-bottom: 1px solid #f1f5f9; 
  padding-bottom: 10px; 
}
.section-title h3 { margin: 0; font-size: 1.1rem; color: #1e293b; font-weight: 700; }

/* DESTINATAIRES */
.checkbox-wrapper { 
  background: #f8fafc; 
  padding: 15px; 
  border-radius: 12px; 
  margin-bottom: 15px; 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  border: 1px solid #edf2f7;
}
.custom-checkbox { width: 18px; height: 18px; cursor: pointer; }

.search-box { position: relative; margin-bottom: 15px; }
.search-input { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; transition: 0.3s; }
.search-input:focus { border-color: #0040d0; box-shadow: 0 0 0 3px rgba(0,64,208,0.1); outline: none; }

.modern-select-multiple { 
  width: 100%; 
  border-radius: 10px; 
  border: 1px solid #e2e8f0; 
  padding: 10px; 
  height: 200px; 
  font-family: inherit;
  font-size: 0.95rem;
}
.selection-display { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 10px; 
  background: #eff6ff; 
  padding: 8px 12px; 
  border-radius: 8px;
}
.badge-count { font-weight: 700; color: #1d4ed8; font-size: 0.85rem; }
.btn-clear { background: none; border: none; color: #dc2626; font-size: 0.8rem; font-weight: 600; cursor: pointer; text-decoration: underline; }

/* INPUTS GRIDS */
.grid-inputs { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
  gap: 20px; 
  margin-bottom: 20px; 
}

label { display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 8px; }
input, select, textarea { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 1rem; }
textarea { resize: vertical; min-height: 120px; }

/* FOOTER & ACTIONS */
.form-footer { 
  display: flex; 
  flex-direction: row; 
  justify-content: space-between; 
  align-items: center; 
  margin-top: 20px; 
  padding-top: 20px; 
  border-top: 1px solid #f1f5f9;
  gap: 20px;
}
.btn-send { 
  background: #0040d0; 
  color: white; 
  border: none; 
  padding: clamp(12px, 2vw, 14px) clamp(20px, 4vw, 32px); 
  border-radius: 12px; 
  font-weight: 700; 
  cursor: pointer; 
  transition: 0.3s; 
  white-space: nowrap;
}
.btn-send:hover:not(:disabled) { background: #0030a0; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,64,208,0.2); }
.btn-send:disabled { opacity: 0.5; cursor: not-allowed; filter: grayscale(1); }

.feedback-messages { flex: 1; }
.msg { padding: 10px; border-radius: 8px; font-size: 0.9rem; font-weight: 600; max-width: 400px; }
.error { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }
.success { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }

/* MOBILE BREAKPOINTS */
@media (max-width: 600px) {
  .page-header { flex-direction: column; align-items: flex-start; }
  .form-footer { flex-direction: column-reverse; align-items: stretch; }
  .btn-send { width: 100%; height: 50px; }
  .msg { max-width: 100%; text-align: center; }
  .notification-card { border-radius: 0; margin: -15px; width: calc(100% + 30px); box-shadow: none; }
}

/* ANIMATIONS */
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.3s ease; }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(-10px); }
.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from { opacity: 0; transform: translateX(-20px); }
.slide-leave-to { opacity: 0; transform: translateX(20px); }
</style>