<template>
  <AdminLayout>
    <div class="doctor-management">
      <div class="header">
        <h2>Infirmiers enregistrés</h2>
        <button class="btn-add" @click="openAddForm">➕ Ajouter un infirmier</button>
      </div>

      <div class="table-container">
        <table class="doctor-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nom complet</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Statut</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="nurseStore.loading">
              <td colspan="6">Chargement des infirmiers...</td>
            </tr>
            <tr v-else-if="nurseStore.error">
              <td colspan="6" class="error-message">Erreur: {{ nurseStore.error }}</td>
            </tr>
            <template v-else-if="nurseStore.nurses && nurseStore.nurses.length > 0">
              <tr v-for="(nurse, index) in nurseStore.nurses" :key="nurse.id">
                <td>{{ index + 1 }}</td>
                <td>{{ nurse.user.first_name }} {{ nurse.user.last_name }}</td>
                <td>{{ nurse.user.email }}</td>
                <td>{{ nurse.user.phone }}</td>
                <td>
                  <span :class="nurse.user.status === 'active' ? 'badge-success' : 'badge-inactif'">
                    {{ nurse.user.status }}
                  </span>
                </td>
                <td>
                  <button class="btn-edit" @click="goEdit(nurse.id)">✏️</button>
                  <button class="btn-delete" @click="goDelete(nurse.id)">🗑</button>
                </td>
              </tr>
            </template>
            <tr v-else>
              <td colspan="6">Aucun infirmier trouvé.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '@/layouts/AdminLayout.vue';
import { useNurseStore } from '@/stores/nurseStore';

const router = useRouter();
const nurseStore = useNurseStore();

const openAddForm = () => {
  router.push({ name: 'AddUserNurse' });
};

const goEdit = (id) => {
  router.push({ name: 'EditNurse', params: { id: id } });
};

const goDelete = async (id) => {
  if (confirm("Êtes-vous sûr de vouloir supprimer cet infirmier ?")) {
    await nurseStore.deleteNurse(id);
  }
};

onMounted(() => {
  nurseStore.fetchAllNurses();
});
</script>

<style scoped>
/* (Your existing styles) */
.doctor-management { padding: 32px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.header h2 { font-size: 22px; color: #002580; }
.btn-add { background-color: #0040d0; color: white; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: 600; }
.table-container { overflow-x: auto; }
.doctor-table { width: 100%; border-collapse: collapse; background-color: white; border-radius: 12px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.04); overflow: hidden; }
.doctor-table th, .doctor-table td { padding: 14px 16px; text-align: left; border-bottom: 1px solid #eee; }
.doctor-table th { background-color: #f5f7fa; color: #333; }
.badge-success { color: green; font-weight: bold; }
.badge-inactif { color: #999; font-style: italic; }
.btn-edit, .btn-delete { background: none; border: none; cursor: pointer; font-size: 16px; }
.loading-message, .error-message, .no-data-message { text-align: center; padding: 20px; font-style: italic; color: #555; }
.error-message { color: red; font-weight: bold; }
</style>
