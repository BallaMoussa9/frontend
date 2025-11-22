<template>
  <UrgentisteLayout>
    <div class="profile-page">
      <h2 class="page-title">Mon Profil Urgentiste</h2>
      <p class="description">Gérez et mettez à jour vos informations personnelles et professionnelles.</p>

      <div v-if="isLoading" class="feedback-message loading-message">
        <i class="fas fa-spinner fa-spin"></i> Chargement du profil...
      </div>
      <div v-if="error" class="feedback-message error-message">
        <i class="fas fa-exclamation-triangle"></i> Erreur : {{ error }}
      </div>
      <div v-if="success" class="feedback-message success-message">
        <i class="fas fa-check-circle"></i> {{ success }}
      </div>
      
      <div v-if="!isLoading && (currentUser || urgentistProfile)" class="profile-card-grid">
        <div class="profile-card personal-info">
          <div class="card-header">
            <i class="fas fa-user-circle profile-icon"></i>
            <h3 class="card-title">Informations Personnelles</h3>
          </div>
          
          <div class="info-group">
            <label>Nom Complet :</label>
            <p>{{ profileDisplay.lastName }} {{ profileDisplay.firstName }}</p>
          </div>
          <div class="info-group">
            <label>Adresse E-mail :</label>
            <p>{{ profileDisplay.email }}</p>
          </div>
          <div class="info-group">
            <label>Téléphone :</label>
            <p>{{ profileDisplay.phone }}</p>
          </div>
          <div class="info-group">
            <label>Date de Naissance :</label>
            <p>{{ profileDisplay.dob }}</p>
          </div>
          
          <button @click="startEdit" class="btn-edit primary-btn" :disabled="isLoading">
            <i class="fas fa-edit"></i> Modifier le profil
          </button>
        </div>

        <div class="profile-card professional-info">
          <div class="card-header">
            <i class="fas fa-truck-medical profile-icon"></i>
            <h3 class="card-title">Informations Professionnelles</h3>
          </div>
          
          <div class="info-group">
            <label>Rôle :</label>
            <p class="role-badge">{{ profileDisplay.role }}</p>
          </div>
          <div class="info-group">
            <label>Numéro d'Urgentiste :</label>
            <p>{{ urgentistProfile?.id || 'N/A' }}</p>
          </div>
          <div class="info-group">
            <label>Statut de Service :</label>
            <p :class="['service-status', profileDisplay.isAvailable ? 'available' : 'unavailable']">
              {{ urgentistProfile?.status || 'N/A' }}
            </p>
          </div>
          <div class="info-group">
            <label>Spécialité :</label>
            <p>{{ urgentistProfile?.speciality || 'Non spécifié' }}</p>
          </div>
          
          <button @click="toggleAvailability" :class="['btn-toggle', profileDisplay.isAvailable ? 'unavailable-btn' : 'available-btn']" :disabled="isLoading">
            <i :class="['fas', profileDisplay.isAvailable ? 'fa-times-circle' : 'fa-check-circle']"></i> 
            Rendre {{ profileDisplay.isAvailable ? 'Indisponible' : 'Disponible' }}
          </button>
        </div>
      </div>
      <div v-else-if="!isLoading && !error" class="info-message">
        Aucune donnée de profil trouvée. Veuillez vérifier votre connexion.
      </div>
      
      <div v-if="editMode" class="modal-overlay" @click.self="editMode = false">
        <div class="modal-content">
            <h3>Modifier les Informations Personnelles</h3>
            <form @submit.prevent="saveProfile">
                <div class="form-group">
                    <label for="first_name">Prénom</label>
                    <input type="text" id="first_name" v-model="localProfile.first_name" required>
                </div>
                <div class="form-group">
                    <label for="last_name">Nom</label>
                    <input type="text" id="last_name" v-model="localProfile.last_name" required>
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" v-model="localProfile.email" required>
                </div>
                <div class="form-group">
                    <label for="phone">Téléphone</label>
                    <input type="text" id="phone" v-model="localProfile.phone">
                </div>
                
                <div class="modal-actions">
                    <button type="submit" class="btn-save primary-btn" :disabled="isLoading">
                        <i class="fas fa-save"></i> Enregistrer
                    </button>
                    <button type="button" @click="editMode = false" class="btn-close">Annuler</button>
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
/* ---------------------------------- */
/* Styles Génériques et Feedback */
/* ---------------------------------- */
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  color: #002580;
  font-weight: 700;
}
.description {
  color: #666;
  margin-bottom: 30px;
}

/* Feedback Messages */
.feedback-message {
    padding: 15px;
    margin-bottom: 20px;
    border-radius: 8px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
}
.loading-message { background-color: #e6f7ff; color: #002580; }
.error-message { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
.success-message { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
.info-message {
    padding: 20px;
    text-align: center;
    background-color: #f0f0f0;
    border-radius: 8px;
}


/* ---------------------------------- */
/* Cartes de Profil */
/* ---------------------------------- */
.profile-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
}

.profile-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.card-header {
    display: flex;
    align-items: center;
    margin-bottom: 25px;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 10px;
}
.profile-icon {
    font-size: 2rem;
    color: #ec5865;
    margin-right: 15px;
}
.card-title {
  color: #002580;
  font-size: 1.3rem;
  font-weight: 600;
}

/* Groupes d'informations */
.info-group {
  margin-bottom: 15px;
}

.info-group label {
  display: block;
  font-weight: 600;
  color: #555;
  font-size: 0.9em;
  margin-bottom: 3px;
}

.info-group p {
  font-size: 1.1em;
  color: #333;
}

.role-badge {
    display: inline-block;
    background-color: #002580;
    color: white;
    padding: 4px 10px;
    border-radius: 4px;
    font-weight: 500;
}

/* Boutons d'action */
.primary-btn {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    margin-top: 20px;
    transition: background-color 0.2s;
}
.primary-btn i {
    margin-right: 8px;
}
.primary-btn:hover:not(:disabled) {
    background-color: #0056b3;
}
.primary-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}


/* Statut de service */
.service-status {
    font-weight: bold;
    padding: 5px 10px;
    border-radius: 4px;
    display: inline-block;
}
.service-status.available {
    background-color: #d4edda;
    color: #155724;
}
.service-status.unavailable {
    background-color: #f8d7da;
    color: #721c24;
}

.btn-toggle {
    border: none;
    padding: 12px 15px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    margin-top: 15px;
    transition: background-color 0.2s;
}
.available-btn {
    background-color: #28a745; 
    color: white;
}
.unavailable-btn {
    background-color: #dc3545;
    color: white;
}
.btn-toggle i {
    margin-right: 8px;
}
.btn-toggle:hover:not(:disabled) {
    opacity: 0.9;
}
.btn-toggle:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}


/* ---------------------------------- */
/* Modale d'édition */
/* ---------------------------------- */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
}
.modal-content {
    background: white;
    padding: 30px;
    border-radius: 10px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal-content h3 {
    color: #002580;
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
}

.form-group {
    margin-bottom: 15px;
    text-align: left;
}
.form-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 5px;
}
.form-group input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
    box-sizing: border-box;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}
.btn-save {
    margin-top: 0; 
    background-color: #28a745;
}
.btn-close {
    background: #ec5865;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 0;
}

/* Media Queries */
@media (max-width: 992px) {
    .profile-card-grid {
        grid-template-columns: 1fr;
    }
}
</style>