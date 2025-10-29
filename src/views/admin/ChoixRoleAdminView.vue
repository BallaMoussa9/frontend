<template>
  <AdminLayout>
    <div class="gestion-role">
      <h2 class="page-title">Utilisateurs : {{ roleLabel }}</h2>

      <div class="table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Date création</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in users" :key="user.id">
              <td>{{ index + 1 }}</td>
              <td>{{ user.first_name }} {{ user.last_name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.phone }}</td>
              <td>{{ formatDate(user.created_at) }}</td>
              <td>
                <button class="btn edit">✏️</button>
                <button class="btn delete">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-if="users.length === 0" class="no-users">Aucun utilisateur trouvé pour ce rôle.</p>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const role = route.params.role

// Libellés lisibles
const roleLabelMap = {
  doctor: 'Médecins',
  nurse: 'nurse',
  pharmacist: 'Pharmaciens',
  secretary: 'Secrétaires',
  accountant: 'Comptables',
  emergency_doctor: 'Médecins urgentistes',
  lab_technician: 'Techniciens labo',
  lab_manager: 'Responsables labo',
  comms_officer: 'Agents de communication',
  patient: 'Patients',
}

const roleLabel = roleLabelMap[role] || role

// Données fake à remplacer par API
const users = ref([])

onMounted(() => {
  // Exemple de récupération fake (remplacer par un appel Axios)
  users.value = [
    {
      id: 1,
      first_name: 'Fatou',
      last_name: 'Diallo',
      email: 'fatou.diallo@example.com',
      phone: '777-111-222',
      created_at: '2025-06-20 10:25'
    },
    {
      id: 2,
      first_name: 'Moussa',
      last_name: 'Konaté',
      email: 'moussa.konate@example.com',
      phone: '777-333-444',
      created_at: '2025-07-01 14:03'
    }
  ]
})

const formatDate = (date) => new Date(date).toLocaleString('fr-FR')
</script>

<style scoped>
.gestion-role {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #002580;
}

.table-container {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #eaeaea;
}

.users-table th {
  background: #f3f6fb;
  font-weight: 600;
}

.btn {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
}

.edit {
  color: #007bff;
}

.delete {
  color: #e63946;
  margin-left: 10px;
}

.no-users {
  text-align: center;
  font-style: italic;
  margin-top: 20px;
}
</style>
