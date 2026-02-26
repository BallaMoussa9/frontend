<template>
  <AdminLayout>
    <div class="gestion-role">
      <header class="page-header">
        <div class="header-left">
          <button @click="router.back()" class="btn-back" title="Retour">
            <span class="arrow">←</span>
          </button>
          <div class="header-text">
            <h2 class="page-title">Gestion des {{ roleLabel }}</h2>
            <p class="subtitle">Liste complète des utilisateurs enregistrés comme {{ role.toLowerCase() }}.</p>
          </div>
        </div>

        <button class="btn-add" @click="handleAddUser">
          <span class="plus">+</span> Ajouter un {{ roleLabel.slice(0, -1) }}
        </button>
      </header>

      <div class="table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Utilisateur</th>
              <th>Contact</th>
              <th>Date de création</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in users" :key="user.id" class="table-row">
              <td class="index-col">{{ index + 1 }}</td>
              <td class="user-info">
                <div class="avatar">{{ user.first_name[0] }}{{ user.last_name[0] }}</div>
                <div class="name-box">
                  <span class="full-name">{{ user.first_name }} {{ user.last_name }}</span>
                  <span class="email-sub">{{ user.email }}</span>
                </div>
              </td>
              <td>
                <div class="contact-box">
                  <span>📞 {{ user.phone }}</span>
                </div>
              </td>
              <td class="date-col">{{ formatDate(user.created_at) }}</td>
              <td class="actions-col">
                <div class="action-buttons">
                  <button class="action-btn edit" @click="handleEdit(user.id)" title="Modifier">
                    ✏️
                  </button>
                  <button class="action-btn delete" @click="handleDelete(user.id)" title="Supprimer">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="users.length === 0" class="empty-state">
          <div class="empty-icon">👥</div>
          <p>Aucun utilisateur trouvé pour le rôle <strong>{{ roleLabel }}</strong>.</p>
          <button class="btn-secondary" @click="handleAddUser">Créer le premier profil</button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const role = route.params.role

const roleLabelMap = {
  doctor: 'Médecins',
  nurse: 'Infirmiers',
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

const users = ref([])

onMounted(() => {
  // Simuler chargement API
  users.value = [
    { id: 1, first_name: 'Fatou', last_name: 'Diallo', email: 'fatou.diallo@example.com', phone: '777-111-222', created_at: '2025-06-20 10:25' },
    { id: 2, first_name: 'Moussa', last_name: 'Konaté', email: 'moussa.konate@example.com', phone: '777-333-444', created_at: '2025-07-01 14:03' }
  ]
})

const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

const handleAddUser = () => {
  // Logique de redirection vers le formulaire d'ajout spécifique ou générique
  console.log(`Ajout d'un nouveau ${role}`)
}

const handleEdit = (id) => {
  console.log(`Edition utilisateur ${id}`)
}

const handleDelete = (id) => {
  if(confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
    users.value = users.value.filter(u => u.id !== id)
  }
}
</script>

<style scoped>
.gestion-role { padding: 20px; }

/* Header Styling */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-left { display: flex; align-items: center; gap: 20px; }

.btn-back {
  width: 40px; height: 40px; border-radius: 10px; border: 1px solid #e2e8f0;
  background: white; cursor: pointer; transition: 0.2s; color: #64748b;
}
.btn-back:hover { background: #f1f5f9; transform: translateX(-3px); color: #002580; }

.page-title { font-size: 24px; font-weight: 800; color: #002580; margin: 0; }
.subtitle { margin: 0; color: #64748b; font-size: 14px; }

.btn-add {
  background: #002580; color: white; border: none; padding: 12px 20px;
  border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.3s;
}
.btn-add:hover { background: #0040d0; box-shadow: 0 4px 12px rgba(0,37,128,0.2); }

/* Table Styling */
.table-container {
  background: white; border-radius: 16px; border: 1px solid #f1f5f9;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden;
}

.users-table { width: 100%; border-collapse: collapse; }
.users-table th {
  background: #f8fafc; padding: 16px; text-align: left;
  font-size: 13px; text-transform: uppercase; color: #64748b; font-weight: 700;
}

.table-row { border-bottom: 1px solid #f1f5f9; transition: 0.2s; }
.table-row:hover { background: #fcfdfe; }

.users-table td { padding: 16px; vertical-align: middle; }

/* User Info Cell */
.user-info { display: flex; align-items: center; gap: 12px; }
.avatar {
  width: 40px; height: 40px; background: #eef2ff; color: #4f46e5;
  border-radius: 10px; display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 14px;
}
.full-name { display: block; font-weight: 700; color: #1e293b; }
.email-sub { font-size: 12px; color: #64748b; }

.contact-box { font-size: 14px; color: #334155; }
.date-col { font-size: 14px; color: #64748b; }

/* Actions */
.text-right { text-align: right; }
.actions-col { text-align: right; }
.action-buttons { display: flex; justify-content: flex-end; gap: 8px; }

.action-btn {
  width: 35px; height: 35px; border-radius: 8px; border: 1px solid #f1f5f9;
  background: white; cursor: pointer; transition: 0.2s; display: flex;
  align-items: center; justify-content: center;
}
.edit:hover { background: #eff6ff; border-color: #bfdbfe; }
.delete:hover { background: #fef2f2; border-color: #fecaca; }

/* Empty State */
.empty-state {
  padding: 60px; text-align: center; color: #64748b;
}
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.btn-secondary {
  margin-top: 15px; background: #f1f5f9; border: none; padding: 10px 20px;
  border-radius: 8px; font-weight: 600; cursor: pointer;
}
</style>