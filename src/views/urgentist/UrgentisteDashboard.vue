<template>
  <UrgentisteLayout>
    <div class="dashboard-page">
      <h2>Tableau de Bord des Alertes SOS</h2>
      <p class="description">Gérez les urgences médicales déclenchées par les patients.</p>

      <div v-if="!isValidUrgentistId" class="error-message">
        ⚠️ **ERREUR CRITIQUE :** L'ID de l'Urgentiste n'a pas été trouvé dans l'URL. **Vérifiez que l'URL est bien `/urgentiste/dashboard/ID_VALIDE`**. Le tableau de bord ne peut pas fonctionner sans cet ID.
      </div>
      
      <div v-else>
        <div class="summary-cards">
          <div class="card pending">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Alertes en Attente</p>
            <h3>{{ summary.pending }}</h3>
          </div>
          <div class="card in-progress">
            <i class="fas fa-user-md"></i>
            <p>En Cours de Prise en Charge</p>
            <h3>{{ summary.inProgress }}</h3>
          </div>
          <div class="card resolved">
            <i class="fas fa-check-circle"></i>
            <p>Alertes Résolues (Total)</p>
            <h3>{{ summary.resolved }}</h3>
          </div>
        </div>

        <div class="alert-section">
          <h3>Nouvelles et Alertes Actives</h3>
          
          <div v-if="store.loading" class="loading-message">
            <i class="fas fa-spinner fa-spin"></i> Chargement des alertes...
          </div>

          <div v-else-if="store.error" class="error-message">
            Erreur de chargement : {{ store.error }}
          </div>
          
          <div v-else-if="activeAlerts.length === 0" class="info-message">
            <i class="fas fa-check-circle"></i> Aucune alerte SOS active pour le moment.
          </div>
          
          <table v-else class="alert-table">
            <thead>
              <tr>
                <th>ID Alerte</th>
                <th>Patient</th>
                <th>Localisation</th>
                <th>Heure</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="alert in activeAlerts" :key="alert.id" :class="formatStatusClass(alert.status)">
                <td>{{ alert.id }}</td>
                <td>{{ formatPatientName(alert) }}</td>
                <td class="location-cell">
                  <i class="fas fa-map-marker-alt"></i> Lat: {{ alert.latitude }}, Long: {{ alert.longitude }}
                  <a :href="`http://maps.google.com/maps?q=${alert.latitude},${alert.longitude}`" 
                    target="_blank" 
                    class="map-link">
                    Voir Carte
                  </a>
                </td>
                <td>{{ formatTime(alert.initiated_at) }}</td>
                <td :class="['status-badge', formatStatusClass(alert.status)]">
                  {{ formatStatusDisplay(alert.status) }}
                </td>
                <td>
                  <button 
                    @click="goToAlertDetail(alert.id)" 
                    class="btn-action primary"
                    :disabled="isActionDisabled(alert.status)">
                    <span v-if="alert.status === 'in_progress'">Détails</span>
                    <span v-else>Prendre en Charge</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </UrgentisteLayout>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import UrgentisteLayout from '@/layouts/UrgentisteLayout.vue'
import { useUrgentistStore } from '@/stores/urgentistStore' 

const store = useUrgentistStore()
const router = useRouter()
const route = useRoute()

// 1. LECTURE ROBUSTE de l'ID Urgentiste depuis la route du Dashboard (:id)
const urgentistId = computed(() => {
    const idParam = route.params.id;
    if (idParam && !isNaN(parseInt(idParam))) {
        return String(idParam);
    }
    return null; 
});

const isValidUrgentistId = computed(() => urgentistId.value !== null);

// ----------------------------------------------------
// Computed Properties
// ----------------------------------------------------

const activeAlerts = computed(() => store.activeAlerts)

// ✅ CORRECTION APPLIQUÉE ICI : Sécurisation de l'accès à alertsStats
const summary = computed(() => {
    // ⭐ UTILISE || {} pour s'assurer que stats est au moins un objet vide {}
    const stats = store.alertsStats || {}; 
    
    return {
        // L'accès par stats['key'] est maintenant sécurisé. S'il n'existe pas, il vaut 0.
        pending: stats['en attente'] || 0,
        inProgress: stats['in_progress'] || 0,
        // Les alertes résolues sont la somme de 'traite' et 'annule'
        resolved: (stats['traite'] || 0) + (stats['annule'] || 0), 
    };
});


// ----------------------------------------------------
// Fonctions de Navigation et d'Action
// ----------------------------------------------------

function goToAlertDetail(alertId) {
    if (!isValidUrgentistId.value) {
        console.error("Erreur critique: ID Urgentiste manquant. Navigation annulée.");
        return; 
    }
    
    // Correction de l'URL Google Maps dans le template pour la rendre valide.
    // REDIRECTION : S'assure que l'ID est bien une chaîne.
    router.push({ 
        name: 'AlerteDetail', 
        params: { 
            urgentistId: urgentistId.value, 
            alertId: String(alertId) 
        }
    })
}

function isActionDisabled(status) {
    // Si l'alerte est 'in_progress', le bouton devient 'Détails' mais n'est pas désactivé.
    // On ne désactive que si l'ID est manquant ou si l'alerte est déjà traitée/annulée
    return !isValidUrgentistId.value || status === 'traite' || status === 'annule' || store.loading;
}

// ----------------------------------------------------
// Fonctions de Formatage
// ----------------------------------------------------

function formatStatusClass(status) {
    const map = {
        'en attente': 'en-attente',
        'in_progress': 'prise-en-charge',
        'traite': 'resolue',
        'resolved': 'resolue', 
        'annule': 'annulee', 
    };
    return map[status] || '';
}

function formatStatusDisplay(status) {
    const map = {
        'en attente': 'En Attente',
        'in_progress': 'Prise en charge',
        'traite': 'Résolue',
        'resolved': 'Résolue',
        'annule': 'Annulée',
    };
    return map[status] || status;
}

function formatPatientName(alert) {
    return `${alert.patient?.user?.first_name || ''} ${alert.patient?.user?.last_name || 'N/A'}`.trim()
}

function formatTime(dateTime) {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleTimeString('fr-FR', { 
        hour: '2-digit', minute: '2-digit' 
    });
}


// ----------------------------------------------------
// Cycle de vie & Log
// ----------------------------------------------------

const loadDashboardData = async () => {
    if (!isValidUrgentistId.value) {
        console.error("L'ID Urgentiste est manquant. Le chargement des alertes n'a pas été déclenché.");
        return;
    }
    try {
        await Promise.all([
            // Récupération des statistiques pour les cartes
            store.fetchAlertsStats(),
            // Récupération des alertes actives pour le tableau
            store.fetchActiveAlerts(),
        ]);
    } catch (error) {
        // L'erreur est déjà gérée dans le store, on peut juste loguer ici
        console.error("Échec du chargement du tableau de bord:", error);
    }
};

onMounted(() => {
    loadDashboardData();
    // Optionnel : Si vous utilisez un intervalle de rafraîchissement, le placer ici.
});

watch(activeAlerts, (newAlerts) => {
    if (newAlerts && newAlerts.length > 0) {
        console.log('====================================================');
        console.log(`⭐ LOG DES ID PATIENTS POUR LES ${newAlerts.length} ALERTES ACTIVES ⭐`);
        
        newAlerts.forEach(alert => {
            const patientIdFromAlert = alert.patient_id || alert.patient?.id || 'N/A';
            const patientName = formatPatientName(alert);

            console.log(`Alerte ID: ${alert.id} | Patient ID (sosalerts.patient_id): ${patientIdFromAlert} | Nom: ${patientName}`);
        });
        
        console.log('====================================================');
    } else if (!store.loading && store.error) {
        console.error("[Dashboard] Le chargement a échoué. Aucune alerte à loguer.");
    } else if (!store.loading && isValidUrgentistId.value) {
        console.log("[Dashboard] Aucune alerte active à afficher.");
    }
}, { immediate: true }); 
</script>

<style scoped>
.dashboard-page {}
h2 { color: #002580; margin-bottom: 5px; }
.description { color: #666; margin-bottom: 20px; }
.loading-message, .error-message, .info-message {
    padding: 20px; border-radius: 8px; text-align: center; font-weight: 600; margin-top: 20px; margin-bottom: 20px;
}
.loading-message { background-color: #e6f7ff; color: #002580; }
.error-message { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
.info-message { background-color: #e9ecef; color: #555; }
.summary-cards { display: flex; gap: 20px; margin-bottom: 30px; }
.card { flex: 1; padding: 20px; background-color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; }
.card i { font-size: 30px; margin-bottom: 10px; }
.card h3 { font-size: 28px; margin: 5px 0 0; }
.card p { font-size: 14px; color: #888; }
.pending { color: #ff9800; } 
.in-progress { color: #03a9f4; } 
.resolved { color: #4caf50; } 
.alert-section { background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
.alert-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
.alert-table th, .alert-table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; }
.alert-table th { background-color: #f7f9fc; color: #002580; font-weight: 600; }
.alert-table tbody tr:hover { background-color: #f9f9f9; }
.location-cell { display: flex; align-items: center; gap: 10px; }
.map-link { color: #ec5865; text-decoration: none; font-weight: 500; }
.status-badge { display: inline-block; padding: 5px 10px; border-radius: 4px; font-weight: bold; font-size: 12px; }
.en-attente .status-badge { background-color: #ffe0b2; color: #ff9800; }
.prise-en-charge .status-badge { background-color: #b3e5fc; color: #03a9f4; }
.resolue .status-badge { background-color: #c8e6c9; color: #4caf50; }
.annulee .status-badge { background-color: #f8d7da; color: #721c24; }
.btn-action { padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; transition: opacity 0.2s; }
.btn-action.primary { background-color: #002580; color: white; }
.btn-action:hover:not(:disabled) { opacity: 0.9; }
.btn-action:disabled { cursor: not-allowed; opacity: 0.6; }

@media (max-width: 768px) {
    .summary-cards { flex-direction: column; }
}
</style>