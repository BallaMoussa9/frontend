<template>
  <AdminLayout>
    <div class="doctor-management">
      <header class="page-header">
        <div class="title-section">
          <button @click="router.back()" class="btn-back" title="Retour">
            <span class="arrow">←</span>
          </button>
          
          <div class="header-text">
            <h2>Infirmiers enregistrés</h2>
            <span class="count-badge" v-if="nurseStore.nurses.length">
              {{ nurseStore.nurses.length }} au total
            </span>
          </div>
        </div>

        <button class="btn-add" @click="openAddForm">
          <span class="plus">＋</span> 
          <span class="btn-label">Ajouter un infirmier</span>
        </button>
      </header>

      <div class="table-card shadow-sm">
        <div class="table-responsive">
          <table class="doctor-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Infirmier</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Statut</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="nurseStore.loading">
                <td colspan="6" class="state-cell">
                  <div class="spinner"></div> Chargement des infirmiers...
                </td>
              </tr>

              <tr v-else-if="nurseStore.error">
                <td colspan="6" class="state-cell error">
                  ⚠️ Erreur: {{ nurseStore.error }}
                </td>
              </tr>

              <template v-else-if="nurseStore.nurses && nurseStore.nurses.length > 0">
                <tr v-for="(nurse, index) in nurseStore.nurses" :key="nurse.id">
                  <td class="col-id">{{ index + 1 }}</td>
                  <td>
                    <div class="user-info">
                      <div class="user-avatar">
                        {{ nurse.user.first_name?.[0] }}{{ nurse.user.last_name?.[0] }}
                      </div>
                      <div class="user-details">
                        <span class="user-name">{{ nurse.user.first_name }} {{ nurse.user.last_name }}</span>
                        <span class="user-id-text">ID: #{{ nurse.id }}</span>
                      </div>
                    </div>
                  </td>
                  <td><span class="email-text">{{ nurse.user.email }}</span></td>
                  <td><span class="phone-link">📞 {{ nurse.user.phone }}</span></td>
                  <td>
                    <span :class="['status-pill', nurse.user.status === 'active' ? 'active' : 'inactive']">
                      {{ nurse.user.status === 'active' ? 'En service' : 'Inactif' }}
                    </span>
                  </td>
                  <td class="text-right">
                    <div class="action-buttons">
                      <button class="action-btn edit" @click="goEdit(nurse.id)" title="Modifier">✏️</button>
                      <button class="action-btn delete" @click="goDelete(nurse.id)" title="Supprimer">🗑️</button>
                    </div>
                  </td>
                </tr>
              </template>

              <tr v-else>
                <td colspan="6" class="state-cell">Aucun infirmier trouvé.</td>
              </tr>
            </tbody>
          </table>
        </div>
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
.doctor-management {
  padding: 30px;
  background-color: #f8fafc;
}

/* Header & Retour */
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
  cursor: pointer;
  transition: all 0.2s;
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
}

/* Table Card */
.table-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #f1f5f9;
  overflow: hidden;
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
  vertical-align: middle;
}

/* User Info Styles */
.user-info { display: flex; align-items: center; gap: 12px; }
.user-avatar {
  width: 40px; height: 40px; background: #f0fdf4; color: #16a34a;
  border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700;
}
.user-name { font-weight: 700; color: #1e293b; font-size: 14px; display: block; }
.user-id-text { font-size: 11px; color: #94a3b8; }

/* Status Pills */
.status-pill { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
.status-pill.active { background: #dcfce7; color: #16a34a; }
.status-pill.inactive { background: #f1f5f9; color: #64748b; }

/* Actions */
.text-right { text-align: right; }
.action-buttons { display: flex; justify-content: flex-end; gap: 8px; }
.action-btn {
  width: 36px; height: 36px; border-radius: 10px; border: 1px solid #f1f5f9;
  background: white; cursor: pointer; transition: all 0.2s;
}
.action-btn:hover { background: #f8fafc; border-color: #3b82f6; }

/* États (Loading, Error) */
.state-cell { text-align: center; padding: 40px !important; color: #64748b; font-style: italic; }
.spinner { width: 24px; height: 24px; border: 3px solid #f3f3f3; border-top: 3px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; display: inline-block; margin-right: 10px; vertical-align: middle; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* =========================================
   RESPONSIVE : TABLEAU -> CARTES
   ========================================= */
@media (max-width: 768px) {
  .doctor-management { padding: 15px; padding-bottom: 80px; }

  /* Bouton ajouter flottant */
  .btn-label { display: none; }
  .btn-add {
    position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px;
    border-radius: 50%; justify-content: center; font-size: 24px; z-index: 100;
    box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.4);
  }

  .doctor-table thead { display: none; }
  .doctor-table tr {
    display: block; margin-bottom: 15px; background: white;
    border: 1px solid #f1f5f9; border-radius: 16px; padding: 15px;
  }

  .doctor-table td {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 0; border-bottom: 1px solid #f8fafc;
  }

  .doctor-table td:first-child { display: none; } /* On cache l'index # sur mobile */
  
  .doctor-table td:nth-child(2) {
    display: block; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; margin-bottom: 5px;
  }

  /* Labels mobiles */
  .doctor-table td:nth-child(3)::before { content: "Email"; font-weight: 600; color: #94a3b8; font-size: 12px; }
  .doctor-table td:nth-child(4)::before { content: "Téléphone"; font-weight: 600; color: #94a3b8; font-size: 12px; }
  .doctor-table td:nth-child(5)::before { content: "Statut"; font-weight: 600; color: #94a3b8; font-size: 12px; }

  .action-buttons { width: 100%; justify-content: center; padding-top: 10px; }
}
</style>
