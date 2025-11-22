<template>
  <UrgentisteLayout>
    <div class="alert-detail-page">
      <div v-if="!isValidId" class="error-message">
         ⚠️ **Erreur de Navigation :** L'ID de l'alerte ou de l'urgentiste est manquant dans l'URL. Veuillez vérifier l'URL.
      </div>

      <div v-else-if="store.loading && !alert" class="loading-message">
        <i class="fas fa-spinner fa-spin"></i> Chargement des détails de l'alerte #{{ routeAlertId }}...
      </div>
      <div v-else-if="store.error" class="error-message">Erreur de chargement : {{ store.error }}</div>
      
      <div v-else-if="alert">
        <div class="header-section">
          <h2 class="title">Intervention SOS #{{ alert.id }}</h2>
          <div :class="['status-box', formatStatusClass(alert.status)]">
            Statut actuel : {{ formatStatusDisplay(alert.status) }}
          </div>
        </div>
        
        <div class="content-grid">
          <div class="details-card">
            <h3 class="card-title">Paramètres de la Route (Debug)</h3>
            <div class="patient-info">
              <p><strong>ID Urgentiste (Route) :</strong> {{ routeUrgentistId || 'N/A' }}</p>
              <p><strong>ID Alerte (Route) :</strong> {{ routeAlertId || 'N/A' }}</p>
            </div>
            
            <hr class="separator"/>
            
            <h3 class="card-title">Détails du Patient (Base de Données)</h3>
            <div class="patient-info">
              <p><strong>ID Patient (Base) :</strong> {{ patientId }}</p>
              <p><strong>Patient :</strong> {{ patientName }}</p>
              <p><strong>Âge :</strong> {{ patientAge }} ans</p>
              <p><strong>Contact :</strong> {{ alert.patient?.user?.phone || 'N/A' }}</p>
              <p><strong>Groupe Sanguin :</strong> {{ alert.patient?.group_sanguine || 'Inconnu' }}</p>
            </div>
            
            <h3 class="card-title mt-4">Localisation Déclenchée</h3>
            <p class="location-text">
              <i class="fas fa-map-marker-alt"></i> Lat: {{ alert.latitude }}, Long: {{ alert.longitude }}
            </p>
            <p class="time-text">
              <i class="fas fa-clock"></i> Déclenché à : {{ formatDateTime(alert.initiated_at) }}
            </p>
            <p v-if="alert.description" class="description-text mt-3">
              **Description :** *{{ alert.description }}*
            </p>

            <hr class="separator"/>

            <h3 class="card-title">Mettre à jour le statut</h3>
            <div class="action-buttons">
              <button 
                @click="updateStatus('takeCharge')" 
                :disabled="isActionDisabled('takeCharge') || store.loading" 
                class="btn primary">
                <i class="fas fa-user-check"></i> Prise en Charge
              </button>
              
              <button 
                @click="updateStatus('resolve')" 
                :disabled="isActionDisabled('resolve') || store.loading" 
                class="btn success">
                <i class="fas fa-check"></i> Marquer Résolue
              </button>
            </div>
          </div>
          
          <div class="map-container-wrapper">
            <div class="map-container">
              <h3 class="card-title">Localisation en Temps Réel</h3>
              <div class="map-placeholder">
                <p>Carte affichant ({{ alert.latitude }}, {{ alert.longitude }})</p>
              </div>
              <p class="map-status">Dernière position reçue : {{ formatDateTime(alert.updated_at) }}</p>
            </div>
          </div>
          
        </div>
      </div>
      <div v-else-if="!store.loading && !store.error" class="info-message">
        L'alerte #{{ routeAlertId || 'N/A' }} est introuvable ou a été résolue.
      </div>
    </div>
  </UrgentisteLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import UrgentisteLayout from '@/layouts/UrgentisteLayout.vue'
import { useRoute } from 'vue-router'
// NOTE: Assurez-vous que le nom du store ici est correct (useUrgentistStore ou useSosAlertsStore)
import { useUrgentistStore } from '@/stores/urgentistStore' 

const route = useRoute()
const store = useUrgentistStore() 

// 1. LECTURE ROBUSTE des paramètres de la route de détail (:urgentistId et :alertId)
const routeUrgentistId = computed(() => {
    const id = route.params.urgentistId;
    return id && !isNaN(parseInt(id)) ? parseInt(id) : null; 
});

const routeAlertId = computed(() => {
    const id = route.params.alertId;
    return id && !isNaN(parseInt(id)) ? parseInt(id) : null;
});

// Vérifie si les deux IDs sont des nombres valides.
const isValidId = computed(() => routeUrgentistId.value !== null && routeAlertId.value !== null);

// ----------------------------------------------------
// Computed Properties
// ----------------------------------------------------
const alert = computed(() => store.alertDetails)

const patientId = computed(() => alert.value?.patient?.id || 'N/A');

const patientName = computed(() => {
    const firstName = alert.value?.patient?.user?.first_name || '';
    const lastName = alert.value?.patient?.user?.last_name || 'N/A';
    return `${firstName} ${lastName}`.trim();
})

const patientAge = computed(() => {
    return typeof calculateAge === 'function' 
        ? calculateAge(alert.value?.patient?.user?.birth_date) 
        : 'N/A (Age)';
})


// ----------------------------------------------------
// Fonctions de Logique
// ----------------------------------------------------

async function updateStatus(action) {
    if (!alert.value || !isValidId.value) return;

    try {
        if (action === 'takeCharge') {
            await store.takeChargeOfAlert(routeAlertId.value); 
        } else if (action === 'resolve') {
            await store.resolveAlert(routeAlertId.value); 
        }
        await loadAlertDetails(); 
    } catch (err) {
        console.error("Échec de la mise à jour de statut:", err);
    }
}


function isActionDisabled(action) {
    if (!alert.value) return true;
    const status = alert.value.status;
    const isResolvedOrCancelled = status === 'traite' || status === 'annule' || status === 'resolved'; 
    const isInProgress = status === 'in_progress';

    if (isResolvedOrCancelled) return true; 
    if (action === 'takeCharge') return isInProgress; 
    if (action === 'resolve') return isResolvedOrCancelled; 

    return false;
}

function calculateAge(birthDate) {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const dob = new Date(birthDate);
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
}


function formatStatusClass(status) {
    const map = {
        'en attente': 'en-attente', 'annule': 'annule', 'in_progress': 'prise-en-charge', 
        'traite': 'résolue', 'resolved': 'résolue',
    };
    return map[status] || 'en-attente';
}

function formatStatusDisplay(status) {
    const map = {
        'en attente': 'En attente', 'annule': 'Annulée', 'in_progress': 'Prise en charge',
        'traite': 'Résolue', 'resolved': 'Résolue',
    };
    return map[status] || status;
}

function formatDateTime(dateTime) {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleString('fr-FR', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
}

async function loadAlertDetails() {
    if (isValidId.value) {
        console.log(`[AlerteDetailView] 🚀 Début du chargement de l'alerte ID: ${routeAlertId.value}`);
        
        await store.fetchAlertDetails(routeAlertId.value);
        
        if (store.alertDetails) {
            console.log('====================================================');
            console.log(`⭐ LOG BRUT DES DONNÉES RÉCUPÉRÉES DE L'ALERTE ID ${routeAlertId.value} ⭐`);
            console.log(JSON.stringify(store.alertDetails, null, 2));
            console.log('====================================================');
        } else if (store.error) {
            console.error(`[AlerteDetailView] Échec du chargement: ${store.error}`);
        }
        
    } else {
         console.error(`[AlerteDetailView] ID d'alerte non valide trouvé dans la route. Chargement annulé.`);
    }
}

// ----------------------------------------------------
// Cycle de vie
// ----------------------------------------------------
onMounted(() => {
    if (isValidId.value) {
        loadAlertDetails();
    }
});
</script>

<style scoped>
.alert-detail-page { max-width: 1400px; margin: 0 auto; }
.header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 2px solid #e0e0e0; padding-bottom: 15px; }
.title { color: #002580; font-weight: 700; }
.status-box { padding: 8px 15px; border-radius: 6px; font-weight: bold; color: white; text-transform: capitalize; }
.en-attente { background-color: #ffc107; color: #333; }
.prise-en-charge { background-color: #03a9f4; }
.annule { background-color: #dc3545; }
.résolue { background-color: #4caf50; }
.content-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 30px; }
.details-card, .map-container { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
.map-container-wrapper { height: 100%; display: flex; flex-direction: column; }
.card-title { color: #002580; font-size: 1.2rem; margin-bottom: 15px; border-left: 4px solid #ec5865; padding-left: 10px; }
.patient-info p { margin-bottom: 8px; font-size: 0.95rem; }
.location-text, .time-text { font-size: 1rem; font-weight: 500; color: #555; margin-bottom: 10px; }
.location-text i, .time-text i { margin-right: 8px; color: #ec5865; }
.description-text { font-style: italic; color: #444; padding: 10px; background-color: #f7f9fc; border-left: 3px solid #002580; border-radius: 4px; }
.separator { margin: 25px 0; border: 0; border-top: 1px dashed #e0e0e0; }
.action-buttons { display: flex; flex-direction: column; gap: 10px; }
.btn { padding: 12px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: opacity 0.2s; display: flex; align-items: center; justify-content: center; }
.btn i { margin-right: 8px; }
.primary { background-color: #002580; color: white; }
.success { background-color: #4caf50; color: white; }
.btn:hover:not(:disabled) { opacity: 0.9; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.loading-message { background-color: #e6f7ff; color: #002580; padding: 15px; border-radius: 8px; text-align: center; }
.error-message { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; padding: 10px; border-radius: 6px; font-size: 0.9em; }
.map-placeholder { height: 300px; background-color: #e6f7ff; display: flex; justify-content: center; align-items: center; color: #002580; font-weight: bold; border-radius: 8px; }
.map-status { text-align: center; margin-top: 10px; font-weight: 500; }
@media (max-width: 1024px) {
  .content-grid { grid-template-columns: 1fr; }
}
</style>