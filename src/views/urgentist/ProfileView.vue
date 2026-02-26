<template>
  <UrgentisteLayout>
    <div class="profile-page">
      <header class="page-header">
        <h2 class="page-title">Mon Profil Urgentiste</h2>
        <p class="description">Gérez et mettez à jour vos informations personnelles et professionnelles.</p>
      </header>

      <TransitionGroup name="fade">
        <div v-if="isLoading" key="loading" class="feedback-message loading-message">
          <i class="fas fa-spinner fa-spin"></i> Chargement...
        </div>
        <div v-if="error" key="error" class="feedback-message error-message">
          <i class="fas fa-exclamation-triangle"></i> {{ error }}
        </div>
        <div v-if="success" key="success" class="feedback-message success-message">
          <i class="fas fa-check-circle"></i> {{ success }}
        </div>
      </TransitionGroup>
      
      <div v-if="!isLoading && (currentUser || urgentistProfile)" class="profile-card-grid">
        <div class="profile-card">
          <div class="card-header">
            <div class="icon-circle"><i class="fas fa-user-circle"></i></div>
            <h3 class="card-title">Infos Personnelles</h3>
          </div>
          
          <div class="info-content">
            <div class="info-group">
              <label>Nom Complet</label>
              <p>{{ profileDisplay.lastName }} {{ profileDisplay.firstName }}</p>
            </div>
            <div class="info-group">
              <label>E-mail</label>
              <p class="truncate-text">{{ profileDisplay.email }}</p>
            </div>
            <div class="info-group">
              <label>Téléphone</label>
              <p>{{ profileDisplay.phone }}</p>
            </div>
            <div class="info-group">
              <label>Date de Naissance</label>
              <p>{{ profileDisplay.dob }}</p>
            </div>
          </div>
          
          <button @click="startEdit" class="btn-primary" :disabled="isLoading">
            <i class="fas fa-user-edit"></i> Modifier le profil
          </button>
        </div>

        <div class="profile-card">
          <div class="card-header">
            <div class="icon-circle medical"><i class="fas fa-ambulance"></i></div>
            <h3 class="card-title">Infos Métier</h3>
          </div>
          
          <div class="info-content">
            <div class="info-group">
              <label>Rôle</label>
              <span class="badge role">{{ profileDisplay.role }}</span>
            </div>
            <div class="info-group">
              <label>ID Urgentiste</label>
              <p><code>{{ urgentistProfile?.id || 'N/A' }}</code></p>
            </div>
            <div class="info-group">
              <label>Statut Actuel</label>
              <span :class="['status-indicator', profileDisplay.isAvailable ? 'available' : 'unavailable']">
                {{ urgentistProfile?.status || 'N/A' }}
              </span>
            </div>
            <div class="info-group">
              <label>Spécialité</label>
              <p>{{ urgentistProfile?.speciality || 'Non spécifié' }}</p>
            </div>
          </div>
          
          <button @click="toggleAvailability" :class="['btn-toggle', profileDisplay.isAvailable ? 'btn-red' : 'btn-green']" :disabled="isLoading">
            <i :class="['fas', profileDisplay.isAvailable ? 'fa-power-off' : 'fa-check-circle']"></i> 
            {{ profileDisplay.isAvailable ? 'Passer Hors-Ligne' : 'Passer Disponible' }}
          </button>
        </div>
      </div>

      <div v-if="editMode" class="modal-overlay" @click.self="editMode = false">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Modifier le profil</h3>
            <button class="close-modal" @click="editMode = false">&times;</button>
          </div>
          <form @submit.prevent="saveProfile" class="modal-form">
            <div class="form-row">
              <div class="form-group">
                <label>Prénom</label>
                <input type="text" v-model="localProfile.first_name" required>
              </div>
              <div class="form-group">
                <label>Nom</label>
                <input type="text" v-model="localProfile.last_name" required>
              </div>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" v-model="localProfile.email" required>
            </div>
            <div class="form-group">
              <label>Téléphone</label>
              <input type="text" v-model="localProfile.phone">
            </div>
            
            <div class="modal-footer">
              <button type="button" @click="editMode = false" class="btn-cancel">Annuler</button>
              <button type="submit" class="btn-save" :disabled="isLoading">
                <i class="fas fa-save"></i> Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </UrgentisteLayout>
</template>
<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import UrgentisteLayout from '@/layouts/UrgentisteLayout.vue'
import { useAuthStore } from '@/stores/authStores' 
import { useUserStore } from '@/stores/userStore' 
import { useUrgentistStore } from '@/stores/urgentistStore' 

const authStore = useAuthStore()
const userStore = useUserStore()
const urgentistStore = useUrgentistStore() 

const editMode = ref(false)
const localProfile = ref({}) 

// ----------------------------------------------------
// Computed Properties
// ----------------------------------------------------

const currentUser = computed(() => userStore.getCurrentUser)
const urgentistProfile = computed(() => userStore.getCurrentFirstResponderProfile)

const profileDisplay = computed(() => {
    const user = currentUser.value || {}
    const responder = urgentistProfile.value || {}

    return {
        firstName: user.first_name || 'N/A',
        lastName: user.last_name || 'N/A',
        email: user.email || 'N/A',
        phone: user.phone || 'N/A',
        dob: user.birth_date ? formatDate(user.birth_date) : 'N/A',
        role: user.role_id ? 'Urgentiste' : 'N/A',
        urgentistId: responder.id ? `UGT-${responder.id}` : 'N/A',
        isAvailable: responder.status === 'available',
        assignmentLocation: responder.location || 'Non spécifié',
        speciality: responder.speciality || 'Non spécifié',
    }
})

const isLoading = computed(() => userStore.loading || urgentistStore.loading)
const error = computed(() => userStore.error || urgentistStore.error)
const success = computed(() => userStore.success || urgentistStore.success)


// ----------------------------------------------------
// Fonctions de Logique
// ----------------------------------------------------

function startEdit() {
    if (!currentUser.value) return
    
    localProfile.value = {
        first_name: currentUser.value.first_name,
        last_name: currentUser.value.last_name,
        email: currentUser.value.email,
        phone: currentUser.value.phone,
    }
    userStore.resetFeedback() 
    urgentistStore.resetFeedback() 
    editMode.value = true
}

async function saveProfile() {
    try {
        await userStore.updateCurrentUserProfile(localProfile.value)
        editMode.value = false
    } catch (err) {
        console.error("Erreur lors de la sauvegarde:", err)
    }
}

async function toggleAvailability() {
    if (!urgentistProfile.value || isLoading.value) return

    const currentStatus = urgentistProfile.value.status;
    const newStatus = currentStatus === 'available' ? 'unavailable' : 'available';
    const updateData = { status: newStatus };

    try {
        // NOTE: Assurez-vous que cette méthode utilise bien la méthode HTTP PUT ou PATCH 
        // dans votre service API (e.g., apiUrgentist.js) pour éviter l'erreur 405.
        await urgentistStore.updateUrgentist(urgentistProfile.value.id, updateData);
        
        if(urgentistStore.currentUrgentist) {
             userStore.currentFirstResponderProfile = urgentistStore.currentUrgentist;
        }

    } catch (err) {
        console.error("Échec du changement de statut:", err)
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    if (isNaN(date)) return 'N/A' 
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    })
}

// ----------------------------------------------------
// Cycle de vie
// ----------------------------------------------------

onMounted(async () => {
    userStore.resetFeedback()
    urgentistStore.resetFeedback()

    const userId = authStore.user?.id || 1 

    if (userId) {
        await userStore.fetchCurrentUser()
        await userStore.fetchUrgentistByUserId(userId)
    }
})

watch(success, (newValue) => {
    if (newValue) {
        setTimeout(() => {
            userStore.setSuccess(null)
            urgentistStore.resetFeedback() 
        }, 5000)
    }
})

</script>
<style scoped>
.profile-page {
  padding: clamp(1rem, 3vw, 2rem);
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
  text-align: left;
}

.page-title {
  color: #002580;
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

/* Grille Responsive */
.profile-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* Style des Cartes */
.profile-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  border: 1px solid #edf2f7;
  transition: transform 0.3s ease;
}

.profile-card:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.icon-circle {
  width: 45px;
  height: 45px;
  background: #e0e7ff;
  color: #4338ca;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.icon-circle.medical {
  background: #fee2e2;
  color: #dc2626;
}

.card-title {
  font-size: 1.15rem;
  color: #1e293b;
  font-weight: 700;
}

/* Infos */
.info-content {
  flex-grow: 1;
}

.info-group {
  margin-bottom: 1.2rem;
}

.info-group label {
  display: block;
  font-size: 0.8rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.info-group p {
  font-size: 1rem;
  color: #0f172a;
  font-weight: 500;
  word-break: break-word;
}

.truncate-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Badges & Status */
.badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
}

.badge.role { background: #002580; color: white; }

.status-indicator {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
}

.status-indicator.available { background: #dcfce7; color: #166534; }
.status-indicator.unavailable { background: #fee2e2; color: #991b1b; }

/* Boutons */
.btn-primary, .btn-toggle {
  width: 100%;
  padding: 0.8rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
  margin-top: 1rem;
}

.btn-primary { background: #002580; color: white; }
.btn-primary:hover { background: #001a5a; }

.btn-green { background: #10b981; color: white; }
.btn-red { background: #ef4444; color: white; }

/* Modale Responsive */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 8, 45, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 1rem;
}

.modal-card {
  background: white;
  width: 100%;
  max-width: 550px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  padding: 1.5rem;
  background: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
}

.modal-form { padding: 1.5rem; }

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group { margin-bottom: 1.25rem; }
.form-group label { display: block; font-weight: 600; margin-bottom: 0.5rem; color: #475569; }
.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  transition: border-color 0.2s;
}

.form-group input:focus { border-color: #002580; outline: none; }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-save { background: #10b981; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; }
.btn-cancel { background: #e2e8f0; color: #475569; padding: 0.75rem 1.5rem; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Mobile spécifique */
@media (max-width: 640px) {
  .form-row { grid-template-columns: 1fr; }
  .profile-card-grid { grid-template-columns: 1fr; }
  .modal-card { border-radius: 0; height: 100%; max-height: 100%; }
}
</style>