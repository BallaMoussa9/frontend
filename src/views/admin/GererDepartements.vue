<template>
  <AdminLayout>
    <div class="departement-management">
      <header class="header">
        <div class="header-left">
          <button @click="router.back()" class="btn-back" title="Retour">
            <span class="arrow">←</span>
          </button>
          <div class="title-group">
            <h2>Services hospitaliers</h2>
            <span class="count-badge" v-if="departmentStore.departments.length > 0">
              {{ departmentStore.departments.length }} services actifs
            </span>
          </div>
        </div>
        <button class="btn-add" @click="addDepartement">
          <span class="plus">＋</span> Ajouter un service
        </button>
      </header>

      <div v-if="departmentStore.loading" class="state-container loading">
        <div class="spinner"></div>
        <p>Chargement des services hospitaliers...</p>
      </div>

      <div v-else-if="departmentStore.error" class="state-container error">
        <div class="icon">⚠️</div>
        <p>Erreur: {{ departmentStore.error }}</p>
      </div>

      <div v-else-if="departmentStore.departments.length === 0" class="state-container empty">
        <div class="icon">🏥</div>
        <p>Aucun service hospitalier n'est enregistré pour le moment.</p>
      </div>

      <div v-else class="table-card">
        <div class="table-responsive">
          <table class="departement-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nom du service</th>
                <th>Médecin Responsable</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(dep, index) in departmentStore.departments" :key="dep.id">
                <td class="col-id">{{ index + 1 }}</td>
                <td>
                  <div class="service-name">
                    {{ dep.name }}
                  </div>
                </td>
                <td>
                  <div class="doctor-chip" :class="{ 'unassigned': !dep.doctor_id }">
                    <span class="icon">👤</span>
                    {{ getDoctorFullName(dep.doctor_id) }}
                  </div>
                </td>
                <td class="text-right">
                  <div class="action-group">
                    <RouterLink :to="{ name: 'EditDepartment', params: { id: dep.id } }" class="btn-action edit" title="Modifier">
                      ✏️
                    </RouterLink>
                    <button class="btn-action delete" title="Supprimer" @click="goDelet(dep.id)">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useRouter, RouterLink } from 'vue-router'
import { onMounted } from 'vue'
import { useDepartmentStore } from '@/stores/departmentStore'
import { useDoctorStore } from '@/stores/doctorStore'

const router = useRouter()
const departmentStore = useDepartmentStore()
const doctorStore = useDoctorStore()

onMounted(async () => {
  await departmentStore.fetchDepartments();
  await doctorStore.fetchAllDoctors();
});

const getDoctorFullName = (doctorId) => {
  if (!doctorId) return 'Non assigné';

  const doctorsList = doctorStore.doctors.data || doctorStore.doctors;
  const doctor = doctorsList.find(doc => doc.id === doctorId);

  if (doctor && doctor.user) {
    return `Dr. ${doctor.user.first_name} ${doctor.user.last_name}`;
  }
  return 'Médecin introuvable';
};

const addDepartement = () => {
  router.push({ name: 'AddUserDepartment' })
}

const goDelet = async (id) => {
  if (confirm(`Voulez-vous vraiment supprimer ce service ? Cette action est irréversible.`)) {
    try {
      await departmentStore.deleteDepartment(id)
    } catch (error) {
      console.error('Erreur suppression:', error)
    }
  }
}
</script>

<style scoped>
.departement-management {
  padding: 30px;
  background-color: #f8fafc;
  min-height: 100vh;
}

/* Header & Retour */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.btn-back {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
}

.btn-back:hover {
  background: #f1f5f9;
  transform: translateX(-3px);
  color: #0040d0;
  border-color: #cbd5e1;
}

.title-group h2 {
  font-size: 24px;
  color: #1e293b;
  margin: 0;
  font-weight: 800;
}

.count-badge {
  font-size: 12px;
  background: #e0e7ff;
  color: #4338ca;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
  margin-top: 4px;
  display: inline-block;
}

.btn-add {
  background-color: #0040d0;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: 0.2s;
}

.btn-add:hover { background: #0035b0; transform: translateY(-2px); }

/* Table Style */
.table-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.departement-table {
  width: 100%;
  border-collapse: collapse;
}

.departement-table th {
  background-color: #f8fafc;
  color: #64748b;
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 700;
  padding: 16px;
  text-align: left;
}

.departement-table td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}

.service-name { font-weight: 700; color: #1e293b; }

.doctor-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f1f5f9;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 600;
  color: #334155;
}

.doctor-chip.unassigned {
  background: #fff1f2;
  color: #e11d48;
}

/* Actions */
.text-right { text-align: right !important; }
.action-group { display: flex; gap: 8px; justify-content: flex-end; }

.btn-action {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #f1f5f9;
  border: none;
  cursor: pointer;
  transition: 0.2s;
  text-decoration: none;
}

.btn-action.edit:hover { background: #fef3c7; }
.btn-action.delete:hover { background: #fee2e2; }

/* States (Loading/Empty) */
.state-container {
  text-align: center;
  padding: 60px;
  background: white;
  border-radius: 16px;
  color: #64748b;
}

.spinner {
  width: 35px; height: 35px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #0040d0;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.icon { font-size: 32px; margin-bottom: 10px; display: block; }
</style>