<template>
  <UrgentisteLayout>
    <div class="dashboard-page">
      <div class="header-section">
        <h2>Tableau de Bord des Alertes SOS</h2>
        <p class="description">Gérez les urgences médicales déclenchées par les patients.</p>
      </div>

      <div v-if="!isValidUrgentistId" class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <div>
          <strong>ERREUR CRITIQUE :</strong> L'ID de l'Urgentiste n'a pas été trouvé.
          <p>Vérifiez l'URL de votre navigateur.</p>
        </div>
      </div>

      <div v-else>
        <div class="summary-cards">
          <div class="card pending">
            <div class="card-icon"><i class="fas fa-exclamation-triangle"></i></div>
            <div class="card-info">
              <p>En Attente</p>
              <h3>{{ summary.pending }}</h3>
            </div>
          </div>
          <div class="card in-progress">
            <div class="card-icon"><i class="fas fa-user-md"></i></div>
            <div class="card-info">
              <p>En Cours</p>
              <h3>{{ summary.inProgress }}</h3>
            </div>
          </div>
          <div class="card resolved">
            <div class="card-icon"><i class="fas fa-check-circle"></i></div>
            <div class="card-info">
              <p>Résolues</p>
              <h3>{{ summary.resolved }}</h3>
            </div>
          </div>
        </div>

        <div class="alert-section">
          <div class="section-header">
            <h3>Nouvelles et Alertes Actives</h3>
            <span class="pulse-indicator" v-if="activeAlerts.length > 0">Live</span>
          </div>

          <div v-if="store.loading" class="loading-message">
            <i class="fas fa-spinner fa-spin"></i> Chargement des alertes...
          </div>

          <div v-else-if="store.error" class="error-message">
            Erreur : {{ store.error }}
          </div>

          <div v-else-if="activeAlerts.length === 0" class="info-message">
            <i class="fas fa-check-circle"></i> Aucune alerte SOS active.
          </div>

          <div v-else class="table-container">
            <table class="alert-table">
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
                <tr v-for="alert in activeAlerts" :key="alert.id">
                  <td data-label="ID Alerte">#{{ alert.id }}</td>
                  <td data-label="Patient" class="patient-name">{{ formatPatientName(alert) }}</td>
                  <td data-label="Localisation">
                    <div class="location-wrapper">
                      <span>Lat: {{ alert.latitude }}</span>
                      <a :href="`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`" 
                         target="_blank" class="map-link">
                        <i class="fas fa-map-marked-alt"></i> Carte
                      </a>
                    </div>
                  </td>
                  <td data-label="Heure">{{ formatTime(alert.initiated_at) }}</td>
                  <td data-label="Statut">
                    <span :class="['status-badge', formatStatusClass(alert.status)]">
                      {{ formatStatusDisplay(alert.status) }}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <button 
                      @click="goToAlertDetail(alert.id)" 
                      class="btn-action primary"
                      :disabled="isActionDisabled(alert.status)">
                      {{ alert.status === 'in_progress' ? 'Détails' : 'Prendre en Charge' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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
</script><style scoped>
/* --- CONFIGURATION GÉNÉRALE --- */
.dashboard-page {
  padding: clamp(15px, 3vw, 30px);
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 25px;
}

h2 {
  color: #002580;
  font-weight: 800;
  font-size: clamp(1.4rem, 4vw, 2rem);
}

.description {
  color: #64748b;
  font-size: 0.95rem;
}

/* --- CARTES DE RÉSUMÉ --- */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 35px;
}

.card {
  background: white;
  padding: 25px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
  border: 1px solid #edf2f7;
}

.card:hover { transform: translateY(-5px); }

.card-icon {
  width: 55px;
  height: 55px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.card-info p { color: #64748b; font-size: 0.9rem; font-weight: 600; margin-bottom: 4px; }
.card-info h3 { font-size: 1.8rem; font-weight: 800; margin: 0; color: #1e293b; }

.pending .card-icon { background: #fffbeb; color: #f59e0b; }
.in-progress .card-icon { background: #f0f9ff; color: #0ea5e9; }
.resolved .card-icon { background: #f0fdf4; color: #10b981; }

/* --- TABLEAU & ALERTES --- */
.alert-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid #edf2f7;
}

.section-header {
  padding: 20px 25px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pulse-indicator {
  background: #fecaca;
  color: #dc2626;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 800;
  animation: pulse 2s infinite;
}

/* TABLEAU DESKTOP */
.alert-table { width: 100%; border-collapse: collapse; }
.alert-table th {
  background: #f8fafc;
  padding: 15px 20px;
  text-align: left;
  font-size: 0.85rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.alert-table td { padding: 18px 20px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.patient-name { font-weight: 700; color: #1e293b; }

.location-wrapper { display: flex; flex-direction: column; gap: 5px; }
.map-link { color: #002580; font-weight: 700; text-decoration: none; font-size: 0.85rem; display: flex; align-items: center; gap: 5px; }

/* BADGES STATUT */
.status-badge {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 800;
}

.en-attente { background: #fef3c7; color: #92400e; }
.prise-en-charge { background: #e0f2fe; color: #075985; }
.resolue { background: #dcfce7; color: #166534; }

/* BOUTON */
.btn-action {
  padding: 10px 18px;
  border-radius: 10px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85rem;
}

.btn-action.primary { background: #002580; color: white; box-shadow: 0 4px 6px rgba(0, 37, 128, 0.2); }
.btn-action.primary:hover { background: #001a5a; transform: scale(1.02); }

/* --- MOBILE RESPONSIVE RADICAL --- */
@media (max-width: 992px) {
  .alert-table thead { display: none; } /* On cache les entêtes */
  
  .alert-table tr {
    display: block;
    margin: 15px;
    padding: 15px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
  }

  .alert-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #e2e8f0;
    text-align: right;
  }

  .alert-table td:last-child { border-bottom: none; }

  /* Utilisation du data-label pour afficher les titres à gauche */
  .alert-table td::before {
    content: attr(data-label);
    font-weight: 800;
    color: #64748b;
    font-size: 0.8rem;
    text-align: left;
  }

  .btn-action { width: 100%; margin-top: 10px; padding: 14px; }
  .location-wrapper { align-items: flex-end; }
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style>