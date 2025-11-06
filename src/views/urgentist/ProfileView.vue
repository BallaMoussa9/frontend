<template>
  <UrgentisteLayout>
    <div class="profile-page">
      <h2 class="page-title">Mon Profil Urgentiste</h2>
      <p class="description">Gérez et mettez à jour vos informations personnelles et professionnelles.</p>

      <div class="profile-card-grid">
        <div class="profile-card personal-info">
          <div class="card-header">
            <i class="fas fa-user-circle profile-icon"></i>
            <h3 class="card-title">Informations Personnelles</h3>
          </div>
          
          <div class="info-group">
            <label>Nom Complet :</label>
            <p>{{ profile.lastName }} {{ profile.firstName }}</p>
          </div>
          <div class="info-group">
            <label>Adresse E-mail :</label>
            <p>{{ profile.email }}</p>
          </div>
          <div class="info-group">
            <label>Téléphone :</label>
            <p>{{ profile.phone }}</p>
          </div>
          <div class="info-group">
            <label>Date de Naissance :</label>
            <p>{{ profile.dob }}</p>
          </div>
          
          <button @click="editMode = true" class="btn-edit primary-btn">
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
            <p class="role-badge">{{ profile.role }}</p>
          </div>
          <div class="info-group">
            <label>Numéro d'Urgentiste :</label>
            <p>{{ profile.urgentistId }}</p>
          </div>
          <div class="info-group">
            <label>Statut de Service :</label>
            <p :class="['service-status', profile.isAvailable ? 'available' : 'unavailable']">
              {{ profile.isAvailable ? 'Disponible' : 'Indisponible' }}
            </p>
          </div>
          <div class="info-group">
            <label>Lieu d'Affectation :</label>
            <p>{{ profile.assignmentLocation }}</p>
          </div>
          
          <button @click="toggleAvailability" :class="['btn-toggle', profile.isAvailable ? 'unavailable-btn' : 'available-btn']">
            <i :class="['fas', profile.isAvailable ? 'fa-times-circle' : 'fa-check-circle']"></i> 
            Rendre {{ profile.isAvailable ? 'Indisponible' : 'Disponible' }}
          </button>
        </div>
      </div>
      
      <div v-if="editMode" class="modal-overlay" @click.self="editMode = false">
        <div class="modal-content">
            <h3>Modifier les Informations</h3>
            <p>Le formulaire de modification sera implémenté ici.</p>
            <button @click="editMode = false" class="btn-close">Fermer</button>
        </div>
      </div>
    </div>
  </UrgentisteLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import UrgentisteLayout from '@/layouts/UrgentisteLayout.vue'
import { useAuthStore } from '@/stores/authStores'
// Assurez-vous d'importer l'utilisation du store utilisateur si nécessaire
// import { useUserStore } from '@/stores/userStore' 

const authStore = useAuthStore()
// const userStore = useUserStore() 
const editMode = ref(false)

// Données fictives (à remplacer par la récupération depuis les stores/API)
const profile = ref({
  firstName: 'Jean',
  lastName: 'Dupont',
  email: authStore.user?.email || 'jean.dupont@santeko.com',
  phone: '70 00 12 34',
  dob: '15/05/1988',
  role: 'Urgentiste',
  urgentistId: 'UGT-4589',
  isAvailable: true,
  assignmentLocation: 'Base Mopti / Secteur Nord',
})

// Logique pour basculer la disponibilité
function toggleAvailability() {
  profile.value.isAvailable = !profile.value.isAvailable
  // TODO: Appel API pour informer le backend du changement de statut de disponibilité
  console.log(`Statut mis à jour à: ${profile.value.isAvailable ? 'Disponible' : 'Indisponible'}`)
}

onMounted(() => {
    // TODO: Charger les vraies données du profil ici
    console.log("Chargement du profil de l'Urgentiste...");
    // Exemple : profile.value = await userStore.fetchUrgentistProfile(authStore.profileId);
})
</script>

<style scoped>
/* Styles génériques */
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

/* Grille de cartes */
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
.primary-btn:hover {
    background-color: #0056b3;
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

/* Modale */
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
    text-align: center;
}
.btn-close {
    background: #ec5865;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 20px;
}
</style>