<template>
  <AdminLayout>
    <div class="rapport-management">
      <div class="header">
        <h2>Rapports médicaux</h2>
        <button class="btn-add" @click="addRapport">➕ Ajouter un rapport</button>
      </div>
      <div class="table-container">
        <table class="rapport-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Patient</th>
              <th>Médecin</th>
              <th>Date</th>
              <th>Type</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(rapport, index) in rapports" :key="rapport.id">
              <td>{{ index + 1 }}</td>
              <td>{{ rapport.patient }}</td>
              <td>{{ rapport.doctor }}</td>
              <td>{{ rapport.date }}</td>
              <td>{{ rapport.type }}</td>
              <td>
                <span :class="rapport.status === 'validé' ? 'badge-valid' : 'badge-attente'">
                  {{ rapport.status }}
                </span>
              </td>
              <td>
                <button class="btn-action" title="Voir">
                  <RouterLink :to="{ name: 'SeenRapport' }">📑</RouterLink>
                </button>
                <button class="btn-action" title="Modifier">
                  <RouterLink :to="{ name: 'EditRapport' }">✏️</RouterLink>
                </button>
                <button class="btn-delete" title="Supprimer">🗑</button>
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
import { useRouter, RouterLink } from 'vue-router'

const rapports = [
  {
    id: 1,
    patient: 'Awa Sidibé',
    doctor: 'Dr. Diallo',
    date: '2025-07-10',
    type: 'Examen cardiaque',
    status: 'validé',
  },
  {
    id: 2,
    patient: 'Bakary Koné',
    doctor: 'Dr. Sangaré',
    date: '2025-07-09',
    type: 'Radiographie thorax',
    status: 'en attente',
  },
  {
    id: 3,
    patient: 'Mariam Traoré',
    doctor: 'Dr. Coulibaly',
    date: '2025-07-08',
    type: 'Analyse laboratoire',
    status: 'validé',
  },
]
const router = useRouter()
const addRapport = () => {
  router.push({ name: 'AddUserRapport' })
}
</script>

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
