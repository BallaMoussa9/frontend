<template>
  <AdminLayout>
    <div class="doctor-management">
      <div class="header">
        <h2>Médecins enregistrés</h2>
        <button class="btn-add" @click="openAddForm">➕ Ajouter un médecin</button>
      </div>

      <div v-if="doctorStore.loading">
        Chargement des médecins...
      </div>
      <div v-if="doctorStore.error" class="error-message">
        {{ doctorStore.error }}
      </div>

      <div class="table-container" v-if="doctorStore.doctors?.data?.length">
        <table class="doctor-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nom complet</th>
              <th>Spécialité</th>
              <th>Hôpital</th>
              <th>Téléphone</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(doctor, index) in doctorStore.doctors.data" :key="doctor.id">
              <td>{{ index + 1 }}</td>
              <td>{{ doctor.user?.first_name }} {{ doctor.user?.last_name }}</td>
              <td>{{ doctor.speciality }}</td>
              <td>{{ doctor.department?.name || '—' }}</td>
              <td>{{ doctor.user?.phone || '—' }}</td>
              <td>
                <span :class="doctor.status === 'active' ? 'badge-success' : 'badge-inactif'">
                  {{ doctor.status }}
                </span>
              </td>
              <td>
                <RouterLink :to="{ name: 'EditDoctor', params: { id: doctor.id } }" class="btn-edit">
                   ✏️
                </RouterLink>
                <button class="btn-delete" @click="confirmDelete(doctor.id)">🗑</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="pagination">
          Page {{ doctorStore.doctors.current_page }} / {{ doctorStore.doctors.last_page }}
          ({{ doctorStore.doctors.total }} médecins)
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter, RouterLink } from 'vue-router'
import { useDoctorStore } from '@/stores/doctorStore'
import AdminLayout from '@/layouts/AdminLayout.vue'

const doctorStore = useDoctorStore();
const router = useRouter()

const openAddForm = () => {
  router.push({ name: 'AddUserDoctor' })
}

const confirmDelete = async (id) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer le docteur ${id} ?`)) {
    try {
      await doctorStore.deleteDoctor(id);
      alert('Docteur supprimé avec succès !');
    } catch (error) {
      alert(`Erreur de suppression : ${doctorStore.error}`);
    }
  }
}

onMounted(() => {
  doctorStore.fetchAllDoctors();
})
</script>

<style scoped>
.doctor-management {
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

.doctor-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.doctor-table th,
.doctor-table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.doctor-table th {
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

.pagination {
  margin-top: 16px;
  font-size: 14px;
  color: #444;
}
</style>
