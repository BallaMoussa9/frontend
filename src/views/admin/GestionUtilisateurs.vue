<template>
  <AdminLayout>
    <div class="user-list">
      <h2>Gestion des Utilisateurs</h2>

      <div class="search-bar">
        <input type="text" v-model="filter" placeholder="🔍 Filtrer par nom, email ou rôle..." />
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Photo</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>
                <img :src="`http://localhost/storage/${user.profile_photo}`" class="mini-avatar" />
              </td>
              <td>{{ user.first_name }} {{ user.last_name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.role }}</td>
              <td>
                <RouterLink :to="`/admin/utilisateur/${user.id}`" class="btn">👁️</RouterLink>
                <RouterLink :to="`/admin/edit-user/${user.id}`" class="btn edit">✏️</RouterLink>
                <button @click="deleteUser(user.id)" class="btn danger">🗑️</button>
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
import axios from 'axios'
import { ref, computed, onMounted } from 'vue'

const users = ref([])
const filter = ref('')

onMounted(async () => {
  const { data } = await axios.get('http://localhost/api/utilisateurs')
  users.value = data
})

const filteredUsers = computed(() => {
  return users.value.filter((u) =>
    (u.first_name + u.last_name + u.email + u.role).toLowerCase().includes(filter.value.toLowerCase())
  )
})

const deleteUser = async (id) => {
  if (confirm('Supprimer cet utilisateur ?')) {
    await axios.delete(`http://localhost/api/utilisateurs/${id}`)
    users.value = users.value.filter(u => u.id !== id)
  }
}
</script>

<style scoped>
.user-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
  background-color: #f8fafc;
}

h2 {
  color: #1e293b;
  margin-bottom: 25px;
  font-size: 24px;
  font-weight: 800;
}

.search-bar {
  margin-bottom: 25px;
}

.search-bar input[type="text"] {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  font-size: 14px;
  transition: all 0.2s ease;
}

.search-bar input[type="text"]:focus {
  outline: none;
  border-color: #0040d0;
  box-shadow: 0 0 0 4px rgba(0, 64, 208, 0.05);
}

.table-container {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 0;
}

thead {
  background: #f8fafc;
}

th {
  padding: 16px;
  text-align: left;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
  color: #1e293b;
}

tbody tr:hover {
  background: #f8fafc;
}

.mini-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
  background: #f1f5f9;
}

.btn {
  background: #0040d0;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  margin-right: 8px;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.btn:hover {
  background: #0035b0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 64, 208, 0.2);
}

.edit {
  background: #10b981;
}

.edit:hover {
  background: #059669;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.danger {
  background: #ef4444;
}

.danger:hover {
  background: #dc2626;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

/* Responsive Design */
@media (max-width: 768px) {
  .user-list {
    padding: 20px 15px;
  }
  
  h2 {
    font-size: 20px;
  }
  
  .table-container {
    border-radius: 12px;
  }
  
  th, td {
    padding: 12px 8px;
    font-size: 13px;
  }
  
  .btn {
    padding: 6px 8px;
    font-size: 11px;
    margin-right: 4px;
  }
}
</style>
