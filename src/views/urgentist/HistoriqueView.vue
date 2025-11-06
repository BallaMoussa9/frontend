<template>
  <UrgentisteLayout>
    <div class="historique-page">
      <h2 class="page-title">Historique des Interventions (Terminées)</h2>
      <p class="description">Consultez les détails des alertes SOS qui ont été résolues.</p>

      <div class="filters-bar">
        <input type="date" v-model="dateFilter" class="filter-input" />
        <input type="text" v-model="searchQuery" placeholder="Rechercher par ID ou Patient..." class="filter-input search" />
        <button class="btn-search"><i class="fas fa-search"></i> Filtrer</button>
      </div>
      
      <div class="historique-table-container">
        <table class="historique-table">
          <thead>
            <tr>
              <th>ID Alerte</th>
              <th>Date et Heure</th>
              <th>Patient</th>
              <th>Localisation Finale</th>
              <th>Statut Final</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="intervention in filteredHistory" :key="intervention.id">
              <td>{{ intervention.id }}</td>
              <td>{{ intervention.dateTime }}</td>
              <td>{{ intervention.patient }}</td>
              <td>{{ intervention.location }}</td>
              <td class="status-cell">
                <span class="status-badge resolved-status">{{ intervention.status }}</span>
              </td>
              <td>
                <button @click="viewDetails(intervention.id)" class="btn-details">
                  <i class="fas fa-eye"></i> Détails
                </button>
              </td>
            </tr>
            <tr v-if="!filteredHistory.length">
                <td colspan="6" class="no-data">Aucun historique trouvé pour les critères sélectionnés.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </UrgentisteLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import UrgentisteLayout from '@/layouts/UrgentisteLayout.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const historyData = ref([
  { id: 'SOS-0010', dateTime: '2025-10-28 10:30', patient: 'Aisha Traore', location: 'Clinique Pasteur', status: 'Résolue' },
  { id: 'SOS-0009', dateTime: '2025-10-27 05:45', patient: 'Lamine Kante', location: 'Domicile sécurisé', status: 'Résolue' },
  { id: 'SOS-0008', dateTime: '2025-10-26 21:00', patient: 'Fati Diarra', location: 'Hôpital Gabriel Touré', status: 'Résolue' },
  // ... autres données historiques
])

const dateFilter = ref('')
const searchQuery = ref('')

const filteredHistory = computed(() => {
  let data = historyData.value
  
  if (dateFilter.value) {
    data = data.filter(item => item.dateTime.startsWith(dateFilter.value))
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    data = data.filter(item => 
      item.id.toLowerCase().includes(query) || 
      item.patient.toLowerCase().includes(query)
    )
  }
  
  return data
})

function viewDetails(id) {
  router.push({ name: 'AlerteDetail', params: { id: id } })
}
</script>

<style scoped>
.page-title {
  color: #002580;
  font-weight: 700;
}
.description {
  color: #666;
  margin-bottom: 25px;
}

/* Filtres */
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

/* Tableau */
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