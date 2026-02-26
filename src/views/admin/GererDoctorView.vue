<template>
  <AdminLayout>
    <div class="doctor-management">
      <header class="page-header">
        <div class="title-section">
          <button @click="router.back()" class="btn-back" title="Retour">
            <span class="arrow">←</span>
          </button>
          
          <div class="header-text">
            <h2>Médecins enregistrés</h2>
            <span class="count-badge" v-if="paginationMeta.total">{{ paginationMeta.total }} au total</span>
          </div>
        </div>

        <button class="btn-add" @click="openAddForm">
          <span class="plus">＋</span> 
          <span class="btn-label">Ajouter un médecin</span>
        </button>
      </header>

      <div v-if="doctorStore.loading" class="state-container loading">
        <div class="spinner"></div>
        <p>Récupération de la liste des praticiens...</p>
      </div>
      
      <div v-else-if="doctorStore.error" class="state-container error">
        <div class="error-icon">⚠️</div>
        <p>Erreur de chargement: <strong>{{ doctorStore.error }}</strong></p>
      </div>
      
      <div v-else-if="!doctorsList.length" class="state-container empty">
        <div class="empty-icon">📂</div>
        <p>Aucun médecin trouvé.</p>
      </div>

      <div class="table-card shadow-sm" v-else>
        <div class="table-responsive">
          <table class="doctor-table">
            <thead>
              <tr>
                <th>Médecin</th>
                <th>Spécialité</th>
                <th>Département</th>
                <th>Contact</th>
                <th>Status</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(doctor) in doctorsList" :key="doctor.id">
                <td>
                  <div class="user-info">
                    <div class="user-avatar">
                      {{ doctor.user?.first_name?.[0] }}{{ doctor.user?.last_name?.[0] }}
                    </div>
                    <div class="user-details">
                      <span class="user-name">{{ doctor.user?.first_name }} {{ doctor.user?.last_name }}</span>
                      <span class="user-id">ID: #{{ doctor.id }}</span>
                    </div>
                  </div>
                </td>
                <td><span class="speciality-tag">{{ doctor.speciality }}</span></td>
                <td><span class="dept-name">{{ doctor.department?.name || '—' }}</span></td>
                <td><span class="phone-link">📞 {{ doctor.user?.phone || '—' }}</span></td>
                <td>
                  <span :class="['status-pill', doctor.status === 'active' ? 'active' : 'inactive']">
                    {{ doctor.status === 'active' ? 'En service' : 'Inactif' }}
                  </span>
                </td>
                <td class="text-right">
                  <div class="action-buttons">
                    <RouterLink :to="{ name: 'EditDoctor', params: { id: doctor.id } }" class="action-btn edit">✏️</RouterLink>
                    <button class="action-btn delete" @click="confirmDelete(doctor.id)">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer class="table-footer" v-if="paginationMeta.total > 0">
          <p>Page <strong>{{ paginationMeta.current_page }}</strong> sur {{ paginationMeta.last_page }}</p>
        </footer>
      </div>
    </div>
  </AdminLayout>
</template>
<script setup>
/* --- TON SCRIPT RESTE LE MÊME --- */
import { onMounted, computed } from 'vue'; 
import { useRouter, RouterLink } from 'vue-router'
import { useDoctorStore } from '@/stores/doctorStore'
import AdminLayout from '@/layouts/AdminLayout.vue'

const doctorStore = useDoctorStore();
const router = useRouter()

const doctorsList = computed(() => {
    if (doctorStore.doctors && Array.isArray(doctorStore.doctors.data)) {
        return doctorStore.doctors.data
    }
    return Array.isArray(doctorStore.doctors) ? doctorStore.doctors : []
})

const paginationMeta = computed(() => {
    return {
        current_page: doctorStore.doctors.current_page || 1,
        last_page: doctorStore.doctors.last_page || 1,
        total: doctorStore.doctors.total || 0,
    }
})

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
  padding: 30px;
  background-color: #f8fafc;
}

/* Header & Navigation */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-back {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.btn-back:hover {
  background: #f1f5f9;
  transform: translateX(-4px);
}

.header-text h2 {
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.count-badge {
  font-size: 12px;
  background: #e2e8f0;
  color: #475569;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
}

/* Bouton Ajouter */
.btn-add {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

/* Table Card */
.table-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.doctor-table {
  width: 100%;
  border-collapse: collapse;
}

.doctor-table th {
  background-color: #f8fafc;
  padding: 16px 24px;
  text-align: left;
  font-size: 13px;
  text-transform: uppercase;
  color: #64748b;
  border-bottom: 1px solid #f1f5f9;
}

.doctor-table td {
  padding: 16px 24px;
  border-bottom: 1px solid #f1f5f9;
}

/* Éléments visuels (Avatar, Pills, Tags) */
.user-info { display: flex; align-items: center; gap: 12px; }
.user-avatar {
  width: 40px; height: 40px; background: #eff6ff; color: #3b82f6;
  border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700;
}
.user-name { font-weight: 700; color: #1e293b; font-size: 14px; display: block; }
.speciality-tag { background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 13px; }
.status-pill { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
.status-pill.active { background: #dcfce7; color: #16a34a; }
.status-pill.inactive { background: #f1f5f9; color: #64748b; }

.action-buttons { display: flex; justify-content: flex-end; gap: 8px; }
.action-btn {
  width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
  background: white; border: 1px solid #f1f5f9; cursor: pointer; text-decoration: none;
}

/* =========================================
   RESPONSIVE : TABLEAU -> CARTES
   ========================================= */

@media (max-width: 768px) {
  .doctor-management { padding: 15px; padding-bottom: 80px; }

  /* Le bouton ajouter devient flottant (FAB) */
  .btn-label { display: none; }
  .btn-add {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    justify-content: center;
    font-size: 24px;
    box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.4);
    z-index: 99;
  }

  /* Transformation du tableau */
  .doctor-table thead { display: none; }
  .doctor-table tr {
    display: block;
    background: white;
    margin-bottom: 15px;
    border: 1px solid #f1f5f9;
    border-radius: 16px;
    padding: 15px;
  }

  .doctor-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f8fafc;
  }

  .doctor-table td:first-child {
    display: block;
    border-bottom: 2px solid #f1f5f9;
    padding-bottom: 15px;
    margin-bottom: 5px;
  }

  /* Ajout des labels mobiles */
  .doctor-table td:nth-child(2)::before { content: "Spécialité"; font-weight: 600; color: #94a3b8; font-size: 12px; }
  .doctor-table td:nth-child(3)::before { content: "Département"; font-weight: 600; color: #94a3b8; font-size: 12px; }
  .doctor-table td:nth-child(4)::before { content: "Contact"; font-weight: 600; color: #94a3b8; font-size: 12px; }
  .doctor-table td:nth-child(5)::before { content: "Statut"; font-weight: 600; color: #94a3b8; font-size: 12px; }

  .action-buttons { width: 100%; justify-content: center; gap: 20px; padding-top: 10px; }
}
</style>