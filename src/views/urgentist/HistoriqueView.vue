<template>
  <UrgentisteLayout>
    <div class="historique-page">
      <div class="header-section">
        <h2 class="page-title">Historique des Interventions</h2>
        <p class="description">Consultez les détails des alertes SOS résolues ou annulées.</p>
      </div>

      <div class="filters-bar">
        <div class="filter-group">
          <label class="mobile-label">Filtrer par date</label>
          <input type="date" v-model="dateFilter" class="filter-input" />
        </div>
        <div class="filter-group search-group">
          <label class="mobile-label">Recherche</label>
          <input type="text" v-model="searchQuery" placeholder="ID ou Patient..." class="filter-input search" />
        </div>
        <button class="btn-search">
          <i class="fas fa-filter"></i> <span>Appliquer</span>
        </button>
      </div>

      <div v-if="urgentistStore.loadingHistory" class="loading-message-container">
          <i class="fas fa-spinner fa-spin"></i> Chargement...
      </div>
      
      <div v-else-if="urgentistStore.historyError" class="error-message-container">
          Erreur: {{ urgentistStore.historyError }}
      </div>
      
      <div v-else class="table-responsive">
        <table class="historique-table">
          <thead>
            <tr>
              <th>ID Alerte</th>
              <th>Date et Heure</th>
              <th>Patient</th>
              <th>Localisation</th>
              <th>Statut Final</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="intervention in filteredHistory" :key="intervention.id">
              <td data-label="ID Alerte" class="id-cell">SOS-{{ intervention.id }}</td>
              <td data-label="Date/Heure">{{ formatDateTime(intervention.initiated_at) }}</td>
              <td data-label="Patient" class="patient-cell">{{ getPatientName(intervention) }}</td>
              <td data-label="Localisation">{{ formatLocation(intervention) }}</td>
              <td data-label="Statut" class="status-cell">
                <span :class="['status-badge', formatStatusClass(intervention.status)]">
                    {{ formatStatusDisplay(intervention.status) }}
                </span>
              </td>
              <td data-label="Actions">
                <button @click="viewDetails(intervention.id)" class="btn-details">
                  <i class="fas fa-eye"></i> <span>Détails</span>
                </button>
              </td>
            </tr>
            <tr v-if="!filteredHistory.length">
              <td colspan="6" class="no-data">
                Aucun historique trouvé.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </UrgentisteLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import UrgentisteLayout from '@/layouts/UrgentisteLayout.vue'
import { useRouter } from 'vue-router'
import { useUrgentistStore } from '@/stores/urgentistStore'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const urgentistStore = useUrgentistStore()
const userStore = useUserStore()

// --- États des filtres ---
const dateFilter = ref('')
const searchQuery = ref('')

// --- Fonctions Utilitaires ---

function formatDateTime(dateTime) {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleString('fr-FR', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function getPatientName(alert) {
      return `${alert.patient?.user?.first_name || ''} ${alert.patient?.user?.last_name || 'N/A'}`.trim()
}

function formatLocation(alert) {
    if (alert.latitude && alert.longitude) {
        return `Lat: ${alert.latitude.toFixed(4)}, Long: ${alert.longitude.toFixed(4)}`
    }
    return 'N/A'
}

function formatStatusClass(status) {
    const map = {
        'traite': 'resolved-status',
        'annule': 'cancelled-status',
    };
    return map[status] || 'default-status';
}

function formatStatusDisplay(status) {
    const map = {
        'traite': 'Résolue',
        'annule': 'Annulée',
    };
    return map[status] || status;
}

// --- Logique des filtres ---

const filteredHistory = computed(() => {
    // 🔑 Utilisation du getter Pinia existant
    let data = urgentistStore.alertsHistory ?? [] // Accès direct à l'état pour les cas simples

    // ⛔ FILTRE PAR URGENTISTE ID DÉSACTIVÉ POUR LE TEST
    // Si l'historique est vide après cette étape, c'est que l'API n'a rien retourné
    // ou que les filtres restants sont trop restrictifs.

    if (dateFilter.value) {
        data = data.filter(item => item.initiated_at?.startsWith(dateFilter.value))
    }

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        data = data.filter(item => 
            String(item.id).includes(query) || 
            getPatientName(item).toLowerCase().includes(query)
        )
    }
    
    return data.slice().sort((a, b) => b.id - a.id)
})

// --- Actions ---

function viewDetails(id) {
    const currentUrgentistId = userStore.getCurrentFirstResponderProfile?.id;

    if (currentUrgentistId) {
        // Supposons que la route nécessite les deux IDs
        router.push({ 
            name: 'AlerteDetail', 
            params: { 
                urgentistId: currentUrgentistId, 
                alertId: String(id) 
            } 
        })
    } else {
        // Fallback (si l'ID urgentiste n'est pas critique pour la route)
        router.push({ name: 'AlerteDetail', params: { id: id } })
    }
}

// --- Cycle de vie ---

onMounted(async () => {
    // 🔑 Tenter de charger le profil de l'urgentiste (Nécessaire pour le filtre et la navigation)
    const currentUser = userStore.getCurrentUser;
    if (currentUser) {
        await userStore.fetchUrgentistByUserId(currentUser.id);
    }
    
    // Lancer la récupération des données de l'historique
    await urgentistStore.fetchAlertsHistory();
})
</script>
<style scoped>
.historique-page {
    padding: clamp(15px, 3vw, 30px);
    max-width: 1200px;
    margin: 0 auto;
}

.page-title {
    color: #002580;
    font-weight: 800;
    font-size: clamp(1.4rem, 4vw, 2rem);
    margin-bottom: 5px;
}

.description {
    color: #64748b;
    margin-bottom: 25px;
}

/* --- BARRE DE FILTRES --- */
.filters-bar {
    display: flex;
    gap: 15px;
    background-color: white;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 25px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    align-items: flex-end;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.search-group {
    flex-grow: 1;
}

.mobile-label {
    font-size: 0.8rem;
    font-weight: 700;
    color: #64748b;
    margin-bottom: 2px;
}

.filter-input {
    padding: 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.95rem;
    transition: border-color 0.2s;
}

.filter-input:focus {
    border-color: #002580;
    outline: none;
}

.btn-search {
    background-color: #002580;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    height: 48px;
}

/* --- TABLEAU --- */
.table-responsive {
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.historique-table {
    width: 100%;
    border-collapse: collapse;
}

.historique-table th {
    background-color: #f8fafc;
    color: #1e293b;
    padding: 15px 20px;
    text-align: left;
    font-size: 0.9rem;
    font-weight: 700;
    border-bottom: 2px solid #f1f5f9;
}

.historique-table td {
    padding: 15px 20px;
    border-bottom: 1px solid #f1f5f9;
    color: #475569;
    font-size: 0.95rem;
}

.id-cell { font-weight: 700; color: #002580; }
.patient-cell { font-weight: 600; color: #1e293b; }

/* --- STATUTS & BOUTONS --- */
.status-badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-weight: 700;
    font-size: 0.75rem;
}

.resolved-status { background-color: #dcfce7; color: #166534; }
.cancelled-status { background-color: #fee2e2; color: #991b1b; }

.btn-details {
    background-color: #ec5865;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: opacity 0.2s;
}

/* --- RESPONSIVE MOBILE (Point de rupture 850px) --- */
@media (max-width: 850px) {
    .filters-bar {
        flex-direction: column;
        align-items: stretch;
    }

    .filter-input.search {
        max-width: none;
    }

    /* Transformation du tableau en cartes */
    .historique-table thead {
        display: none;
    }

    .historique-table tr {
        display: block;
        border: 1px solid #e2e8f0;
        margin: 15px;
        border-radius: 12px;
        padding: 10px;
    }

    .historique-table td {
        display: flex;
        justify-content: space-between;
        align-items: center;
        text-align: right;
        border-bottom: 1px solid #f1f5f9;
        padding: 12px 10px;
    }

    .historique-table td:last-child {
        border-bottom: none;
    }

    .historique-table td::before {
        content: attr(data-label);
        font-weight: 800;
        color: #64748b;
        font-size: 0.8rem;
        text-align: left;
    }

    .btn-details {
        width: 100%;
        padding: 12px;
    }
}

/* Feedback messages */
.loading-message-container, .error-message-container {
    padding: 30px;
    border-radius: 12px;
    margin-top: 20px;
    text-align: center;
    font-weight: 600;
}

.no-data {
    padding: 40px !important;
    text-align: center !important;
    color: #94a3b8;
}
</style>