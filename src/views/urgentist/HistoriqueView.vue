<template>
  <UrgentisteLayout>
    <div class="historique-page">
      <h2 class="page-title">Historique des Interventions (Terminées)</h2>
      <p class="description">Consultez les détails des alertes SOS qui ont été résolues ou annulées.</p>

      <div class="filters-bar">
        <input type="date" v-model="dateFilter" class="filter-input" />
        <input type="text" v-model="searchQuery" placeholder="Rechercher par ID ou Patient..." class="filter-input search" />
        <button class="btn-search"><i class="fas fa-search"></i> Filtrer</button>
      </div>

      <div v-if="urgentistStore.loadingHistory" class="loading-message-container">
          <i class="fas fa-spinner fa-spin"></i> Chargement de l'historique...
      </div>
      
      <div v-else-if="urgentistStore.historyError" class="error-message-container">
          Erreur: {{ urgentistStore.historyError }}
      </div>
      
      <div v-else class="historique-table-container">
        <table class="historique-table">
          <thead>
            <tr>
              <th>ID Alerte</th>
              <th>Date et Heure</th>
              <th>Patient</th>
              <th>Localisation Initiale</th>
              <th>Statut Final</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="intervention in filteredHistory" :key="intervention.id">
              <td>SOS-{{ intervention.id }}</td>
              <td>{{ formatDateTime(intervention.initiated_at) }}</td>
              <td>{{ getPatientName(intervention) }}</td>
              <td>{{ formatLocation(intervention) }}</td>
              <td class="status-cell">
                <span :class="['status-badge', formatStatusClass(intervention.status)]">
                    {{ formatStatusDisplay(intervention.status) }}
                </span>
              </td>
              <td>
                <button @click="viewDetails(intervention.id)" class="btn-details">
                  <i class="fas fa-eye"></i> Détails
                </button>
              </td>
            </tr>
            <tr v-if="!filteredHistory.length">
              <td colspan="6" class="no-data">
                <span v-if="(urgentistStore.alertsHistory ?? []).length > 0">
                    Aucun résultat trouvé pour les critères sélectionnés.
                </span>
                <span v-else>
                    Aucun historique d'intervention trouvé.
                </span>
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
/* Les styles restent les mêmes */
.page-title {
    color: #002580;
    font-weight: 700;
}
.description {
    color: #666;
    margin-bottom: 25px;
}
.loading-message-container, .error-message-container {
    padding: 20px;
    border-radius: 8px;
    margin-top: 20px;
    text-align: center;
    font-weight: 600;
}
.loading-message-container {
    background-color: #e6f7ff;
    color: #002580;
}
.error-message-container {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}
.loading-message-container i {
    margin-right: 10px;
}
.filters-bar {
    display: flex;
    gap: 15px;
    align-items: center;
    background-color: white;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.filter-input {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
}
.filter-input.search {
    flex-grow: 1;
    max-width: 300px;
}
.btn-search {
    background-color: #002580;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
}
.btn-search i {
    margin-right: 5px;
}
.historique-table-container {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    overflow-x: auto;
}
.historique-table {
    width: 100%;
    border-collapse: collapse;
}
.historique-table th, .historique-table td {
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
}
.historique-table th {
    background-color: #f7f9fc;
    color: #002580;
    font-weight: 600;
}
.historique-table tbody tr:hover {
    background-color: #f9f9f9;
}
.status-badge {
    display: inline-block;
    padding: 5px 10px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 0.9em;
}
.resolved-status {
    background-color: #c8e6c9;
    color: #4caf50;
}
.cancelled-status {
    background-color: #f8d7da;
    color: #dc3545;
}
.btn-details {
    background-color: #ec5865;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9em;
}
.btn-details i {
    margin-right: 5px;
}
.no-data {
    text-align: center;
    font-style: italic;
    color: #999;
}
</style>