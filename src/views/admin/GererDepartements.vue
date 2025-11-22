<template>
  <AdminLayout>
    <div class="departement-management">
      <div class="header">
        <h2>Services hospitaliers</h2>
        <button class="btn-add" @click="addDepartement">➕ Ajouter un service</button>
      </div>

      <div v-if="departmentStore.loading" class="loading-message">
        Chargement des services...
      </div>
      <div v-else-if="departmentStore.error" class="error-message">
        Erreur: {{ departmentStore.error }}
      </div>
      <div v-else-if="departmentStore.departments.length === 0 && !departmentStore.loading" class="info-message">
        Aucun service hospitalier trouvé.
      </div>

      <div v-else class="table-container">
        <table class="departement-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nom du service</th>
              <th>Responsable</th> <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(dep, index) in departmentStore.departments" :key="dep.id">
              <td>{{ index + 1 }}</td>
              <td>{{ dep.name }}</td>
              <td>{{ getDoctorFullName(dep.doctor_id) }}</td>
              <td>
                <button class="btn-action" title="Modifier">
                  <RouterLink :to="{ name: 'EditDepartment', params: { id: dep.id } }">✏️</RouterLink>
                </button>
                <button class="btn-delete" title="Supprimer" @click="goDelet(dep.id)">🗑</button>
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
import { onMounted } from 'vue'
import { useDepartmentStore } from '@/stores/departmentStore'
import { useDoctorStore } from '@/stores/doctorStore' // ✅ Importer le store des docteurs

const router = useRouter()
const departmentStore = useDepartmentStore()
const doctorStore = useDoctorStore() // ✅ Initialiser le store des docteurs

// Charger les départements et les docteurs au montage du composant
onMounted(async () => {
  await departmentStore.fetchDepartments();
  await doctorStore.fetchAllDoctors(); // ✅ Charger tous les docteurs
});

// ✅ Nouvelle fonction pour obtenir le nom complet du docteur
const getDoctorFullName = (doctorId) => {
  if (!doctorId) {
    return 'Non assigné'; // Si department.doctor_id est null
  }

  // Gérer la pagination possible de doctorStore.doctors
  const doctorsList = doctorStore.doctors.data || doctorStore.doctors;

  const doctor = doctorsList.find(doc => doc.id === doctorId);

  // Vérifier si le docteur et son utilisateur sont trouvés
  if (doctor && doctor.user) {
    return `${doctor.user.first_name} ${doctor.user.last_name}`;
  }

  return 'Non assigné'; // Si le docteur ou ses infos utilisateur ne sont pas trouvés
};

const addDepartement = () => {
  // Assurez-vous que cette route mène bien à votre composant d'ajout
  router.push({ name: 'AddUserDepartment' })
}

const goDelet = async (id) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer ce service ?`)) {
    try {
      await departmentStore.deleteDepartment(id)
      alert('Service supprimé avec succès !')
    } catch (error) {
      alert('Échec de la suppression: ' + departmentStore.error)
    }
  }
}
</script>

<style scoped>
/* Votre CSS existant, inchangé */
.departement-management {
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

.departement-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.departement-table th,
.departement-table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.departement-table th {
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

.btn-action,
.btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  margin-right: 8px;
}

.loading-message, .error-message, .info-message {
  text-align: center;
  padding: 20px;
  font-size: 16px;
  font-weight: 600;
}
.loading-message { color: #0040d0; }
.error-message { color: #d9534f; }
.info-message { color: #555; }
</style>