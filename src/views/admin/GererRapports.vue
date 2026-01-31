<template>
  <AdminLayout>
    <div class="rapport-management">
      <div class="header">
        <h2>Rapports médicaux</h2>
        <span v-if="store.pagination.total">({{ store.pagination.total }} rapports)</span>
        <button class="btn-add" @click="addRapport">➕ Ajouter un rapport</button>
      </div>

      <div v-if="store.isLoading" class="loading">Chargement des rapports...</div>

      <div v-if="store.error" class="error-message">{{ store.error }}</div>

      <div class="table-container" v-if="!store.isLoading">
        <table class="rapport-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Patient</th>
              <th>Médecin</th>
              <th>Date</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(rapport, index) in store.medicalReports" :key="rapport.id">
              <td>{{ index + 1 }}</td>
              <td>
                {{ rapport.patient?.user?.first_name }} {{ rapport.patient?.user?.last_name }}
              </td>
              <td>
                Dr. {{ rapport.doctor?.user?.last_name || 'Non assigné' }}
              </td>
              <td>{{ new Date(rapport.created_at).toLocaleDateString() }}</td>
              <td><span class="type-capsule">{{ rapport.report_type }}</span></td>
              <td>
                <button class="btn-action" title="Voir">
                  <RouterLink :to="{ name: 'SeenRapport', params: { id: rapport.id } }">📑</RouterLink>
                </button>
                <button class="btn-action" title="Modifier">
                  <RouterLink :to="{ name: 'EditRapport', params: { id: rapport.id } }">✏️</RouterLink>
                </button>
                <button @click="confirmDelete(rapport.id)" class="btn-delete" title="Supprimer">🗑</button>
              </td>
            </tr>
            <tr v-if="store.medicalReports.length === 0">
              <td colspan="6" style="text-align: center;">Aucun rapport trouvé.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { onMounted } from 'vue' 
import { useRouter, RouterLink } from 'vue-router'
import { useMedicalReportStore } from '@/stores/medicalreportStore'

const router = useRouter()
const store = useMedicalReportStore()

// Charger les données depuis l'API au montage du composant
onMounted(() => {
  store.fetchAllMedicalReports()
})

const addRapport = () => {
  router.push({ name: 'AddUserRapport' })
}

const confirmDelete = async (id) => {
  if (confirm("Voulez-vous vraiment supprimer ce rapport ?")) {
    await store.deleteMedicalReport(id)
  }
}
</script>

<style scoped>
/* Tes styles existants + quelques ajouts pour le dynamisme */
.loading { padding: 20px; text-align: center; color: #0040d0; }
.error-message { color: red; background: #fee; padding: 10px; border-radius: 5px; margin-bottom: 10px; }
.type-capsule {
  background: #eef2ff;
  padding: 4px 8px;
  border-radius: 4px;
  text-transform: capitalize;
  font-size: 0.9em;
}
/* ... reste de ton CSS ... */
</style>
<style scoped>
.rapport-management {
  padding: 32px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h2 {
  font-size: 22px;
  color: #002580;
}

.btn-add {
  background-color: #0040d0;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.table-container {
  overflow-x: auto;
}

.rapport-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.04);
}

.rapport-table th,
.rapport-table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.rapport-table th {
  background-color: #f5f7fa;
  color: #333;
}

.badge-valid {
  color: green;
  font-weight: bold;
}

.badge-attente {
  color: orange;
  font-weight: bold;
}

.btn-action,
.btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  margin-right: 8px;
}
</style>
