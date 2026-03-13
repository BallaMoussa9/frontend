<template>
  <AdminLayout>
    <div class="lab-management">
      <div class="header">
        <h2>Techniciens de laboratoire</h2>
        <button class="btn-add" @click="openAddLabTech">➕ Ajouter un technicien</button>
      </div>

      <div v-if="labTechnicianStore.loading" class="loading-message">Chargement des techniciens...</div>
      <div v-if="labTechnicianStore.error" class="error-message">
        {{ labTechnicianStore.error }}
      </div>

      <div class="table-container">
        <table class="lab-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nom complet</th>
              <th>Email</th>
              <th>Spécialité</th>
              <th>Laboratoire</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(technician, index) in labTechnicianStore.labTechnicians" :key="technician.id">
              <template v-if="logTechnician(technician, index)"></template>
              
              <td>{{ index + 1 }}</td>
              <td>{{ technician.user?.first_name }} {{ technician.user?.last_name }}</td>
              <td>{{ technician.user?.email }}</td>
              <td>{{ technician.speciality }}</td>
              <td>{{ technician.laboratory?.name || 'Non assigné' }}</td>
              <td>
                <span :class="getStatusClass(technician.status)">
                  {{ getStatusText(technician.status) }}
                </span>
              </td>
              <td>
                <button class="btn-edit" title="Modifier" @click="goEdit(technician.id)">✏️</button>
                <button class="btn-delete" title="Supprimer" @click="goDelet(technician.id)">🗑</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { onMounted, watch } from 'vue' // Ajout de watch
import { useRouter } from 'vue-router'
import { useLabTechnicianStore } from '@/stores/labTechnicianStore'

const router = useRouter()
const labTechnicianStore = useLabTechnicianStore()

// 1. Watcher pour voir quand les données arrivent dans le store
watch(() => labTechnicianStore.labTechnicians, (newData) => {
  console.log("DEBUG: Données reçues dans le store :", newData);
}, { deep: true });

// 2. Fonction de log appelée lors du rendu de chaque ligne
const logTechnician = (tech, index) => {
  console.log(`DEBUG: Rendu ligne ${index}`, tech);
  return true; // Nécessaire pour le v-if dans le template
};

onMounted(() => {
  labTechnicianStore.fetchAllLabTechnicians()
})

const openAddLabTech = () => { router.push({ name: 'AddUserLabTechnicians' }) }
const goEdit = (id) => { router.push({ name: 'EditLabTech', params: { id: id } }) }
const goDelet = async (id) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce technicien ?')) {
    await labTechnicianStore.deleteLabTechnician(id)
  }
}

const getStatusClass = (status) => status === 'active' ? 'badge-success' : 'badge-inactif'
const getStatusText = (status) => status === 'active' ? 'Actif' : (status === 'on_leave' ? 'En congé' : 'Inactif')
</script>

<style scoped>
/* Votre CSS existant est parfait et n'a pas besoin de modification majeure */
.lab-management {
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
.lab-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}
.lab-table th,
.lab-table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #eee;
}
.lab-table th {
  background-color: #f5f7fa;
  color: #333;
}
.badge-success {
  color: green;
  font-weight: bold;
}
.badge-inactif {
  color: #999;
  font-style: italic;
}
.btn-edit,
.btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}
.loading-message {
  color: #0040d0;
  margin-bottom: 10px;
}
.error-message {
  color: #d9534f;
  margin-bottom: 10px;
}
.success-message {
  color: #5cb85c;
  margin-bottom: 10px;
}
</style>
