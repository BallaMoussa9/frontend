<template>
  <AdminLayout>
    <div class="user-list">
      <h2>Gestion des Utilisateurs</h2>

      <div class="search-bar">
        <input type="text" v-model="filter" placeholder="🔍 Filtrer par nom, email ou rôle..." />
      </div>

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
  padding: 20px;
  background: white;
  border-radius: 12px;
  max-width: 1000px;
  margin: auto;
}

.search-bar {
  margin-bottom: 20px;
}

input[type="text"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
}

thead {
  background: #f2f2f2;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.mini-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #0040d0;
}

.btn {
  background: #0040d0;
  color: white;
  padding: 5px 10px;
  border-radius: 6px;
  margin-right: 6px;
  font-size: 14px;
}

.edit {
  background: #00a86b;
}
.danger {
  background: #cc0000;
}
</style>
