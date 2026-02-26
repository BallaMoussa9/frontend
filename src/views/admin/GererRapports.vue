<template>
  <AdminLayout>
    <div class="rapport-management">
      <header class="header">
        <div class="header-left">
          <button @click="router.back()" class="btn-back" title="Retour">
            <span class="arrow">←</span>
          </button>
          <div class="title-group">
            <h2>Rapports médicaux</h2>
            <span class="count-badge" v-if="store.pagination?.total">
              {{ store.pagination.total }} rapports enregistrés
            </span>
          </div>
        </div>
        <button class="btn-add" @click="addRapport">
          <span class="plus">＋</span> Ajouter un rapport
        </button>
      </header>

      <div v-if="store.isLoading" class="state-container loading">
        <div class="spinner"></div>
        <p>Récupération des rapports...</p>
      </div>

      <div v-else-if="store.error" class="state-container error">
        <div class="icon">⚠️</div>
        <p>{{ store.error }}</p>
      </div>

      <div class="table-card" v-else>
        <div class="table-responsive">
          <table class="rapport-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Patient</th>
                <th>Médecin</th>
                <th>Date</th>
                <th>Type</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(rapport, index) in store.medicalReports" :key="rapport.id">
                <td class="col-id">{{ index + 1 }}</td>
                <td>
                  <div class="user-cell">
                    <span class="name">{{ rapport.patient?.user?.first_name }} {{ rapport.patient?.user?.last_name }}</span>
                    <span class="subtext">ID: #{{ rapport.patient_id }}</span>
                  </div>
                </td>
                <td>
                  <div class="doctor-cell">
                    <span class="dr-tag">Dr.</span> {{ rapport.doctor?.user?.last_name || 'Non assigné' }}
                  </div>
                </td>
                <td class="date-cell">{{ new Date(rapport.created_at).toLocaleDateString('fr-FR') }}</td>
                <td>
                  <span class="type-capsule">{{ rapport.report_type }}</span>
                </td>
                <td class="text-right">
                  <div class="action-group">
                    <RouterLink :to="{ name: 'SeenRapport', params: { id: rapport.id } }" class="btn-action view" title="Voir le rapport">
                      📑
                    </RouterLink>
                    <RouterLink :to="{ name: 'EditRapport', params: { id: rapport.id } }" class="btn-action edit" title="Modifier">
                      ✏️
                    </RouterLink>
                    <button @click="confirmDelete(rapport.id)" class="btn-delete" title="Supprimer">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="store.medicalReports.length === 0">
                <td colspan="6" class="empty-row">Aucun rapport médical trouvé dans la base.</td>
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
import { onMounted } from 'vue' 
import { useRouter, RouterLink } from 'vue-router'
import { useMedicalReportStore } from '@/stores/medicalreportStore'

const router = useRouter()
const store = useMedicalReportStore()

onMounted(() => {
  store.fetchAllMedicalReports()
})

const addRapport = () => {
  router.push({ name: 'AddUserRapport' })
}

const confirmDelete = async (id) => {
  if (confirm("Voulez-vous vraiment supprimer définitivement ce rapport ?")) {
    try {
      await store.deleteMedicalReport(id)
    } catch (err) {
      console.error("Erreur suppression:", err)
    }
  }
}
</script>

<style scoped>
.rapport-management {
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
  font-size: 18px;
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
  background: #e2e8f0;
  color: #475569;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
}

.btn-add {
  background-color: #0040d0;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-add:hover { transform: translateY(-2px); background: #0035b0; }

/* Table Design */
.table-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.table-responsive { overflow-x: auto; }

.rapport-table {
  width: 100%;
  border-collapse: collapse;
}

.rapport-table th {
  background-color: #f8fafc;
  color: #64748b;
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 700;
  padding: 16px;
  text-align: left;
}

.rapport-table td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  font-size: 14px;
}

/* Cells */
.user-cell { display: flex; flex-direction: column; }
.user-cell .name { font-weight: 700; color: #1e293b; }
.user-cell .subtext { font-size: 11px; color: #94a3b8; }

.dr-tag { color: #0040d0; font-weight: 800; font-size: 11px; }

.type-capsule {
  background: #eef2ff;
  color: #4338ca;
  padding: 5px 10px;
  border-radius: 6px;
  text-transform: capitalize;
  font-size: 12px;
  font-weight: 600;
}

/* Actions */
.text-right { text-align: right !important; }
.action-group { display: flex; gap: 8px; justify-content: flex-end; }

.btn-action, .btn-delete {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #f1f5f9;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: 0.2s;
}

.view:hover { background: #e0f2fe; }
.edit:hover { background: #fef3c7; }
.btn-delete:hover { background: #fee2e2; }

/* States */
.state-container {
  text-align: center;
  padding: 60px;
  background: white;
  border-radius: 16px;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #0040d0;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.empty-row {
  padding: 40px !important;
  text-align: center;
  color: #94a3b8;
  font-style: italic;
}
</style>