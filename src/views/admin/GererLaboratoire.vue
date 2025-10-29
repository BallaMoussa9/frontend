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
      <div v-if="labTechnicianStore.success" class="success-message">
        {{ labTechnicianStore.success }}
      </div>

      <div class="table-container">
        <table class="lab-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nom complet</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Spécialité</th>
              <th>Laboratoire</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(technician, index) in labTechnicianStore.labTechnicians" :key="technician.id">
              <td>{{ index + 1 }}</td>
              <td>{{ technician.user.first_name }} {{ technician.user.last_name }}</td>
              <td>{{ technician.user.email }}</td>
              <td>{{ technician.user.phone }}</td>
              <td>{{ technician.speciality }}</td>
              <td>{{ technician.laboratory.name }}</td>
              <td>
                <span :class="getStatusClass(technician.status)">
                  {{ getStatusText(technician.status) }}
                </span>
              </td>
              <td>
                <button class="btn-edit" title="Modifier" @click="goEdit(technician.id)">
                  ✏️
                </button>
                <button class="btn-delete" title="Supprimer" @click="goDelet(technician.id)">
                  🗑
                </button>
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
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLabTechnicianStore } from '@/stores/labTechnicianStore'

const router = useRouter()
const labTechnicianStore = useLabTechnicianStore()

// Charger les techniciens dès que le composant est monté
onMounted(() => {
  labTechnicianStore.fetchAllLabTechnicians()
})

const openAddLabTech = () => {
  router.push({ name: 'AddUserLabTechnicians' })
}

const goEdit = (id) => {
  router.push({ name: 'EditLabTech', params: { id: id } })
}

const goDelet = async (id) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce technicien ?')) {
    try {
      await labTechnicianStore.deleteLabTechnician(id)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }
}

// Fonction pour formater le statut et appliquer une classe CSS
const getStatusClass = (status) => {
  switch (status) {
    case 'active':
      return 'badge-success'
    case 'on_leave':
      return 'badge-inactif'
    case 'inactive':
      return 'badge-inactif'
    default:
      return ''
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'active':
      return 'Actif'
    case 'on_leave':
      return 'En congé'
    case 'inactive':
      return 'Inactif'
    default:
      return status
  }
}
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
