<template>
  <AdminLayout>
    <div class="urgentistes-page">
      <header class="header">
        <div class="header-left">
          <button @click="router.back()" class="btn-back" title="Retour">
            <span class="arrow">←</span>
          </button>
          <div class="title-group">
            <h2>Médecins urgentistes</h2>
            <span class="count-badge" v-if="urgentistStore.allUrgentists?.length > 0">
              {{ urgentistStore.allUrgentists.length }} praticiens
            </span>
          </div>
        </div>
        <button class="btn-add" @click="ajouterUrgentiste">
          <span>➕</span> Ajouter un urgentiste
        </button>
      </header>

      <div class="feedback-area">
        <div v-if="urgentistStore.loading" class="state-msg loading">
          <div class="mini-spinner"></div> Chargement des données...
        </div>
        <div v-if="urgentistStore.error" class="state-msg error">
          ⚠️ {{ urgentistStore.error }}
        </div>
        <div v-if="urgentistStore.success" class="state-msg success">
          ✅ {{ urgentistStore.success }}
        </div>
      </div>

      <div v-if="urgentistStore.allUrgentists?.length === 0 && !urgentistStore.loading" class="empty-state">
        <div class="icon">🚑</div>
        <p>Aucun urgentiste n'est répertorié pour le moment.</p>
        <button @click="ajouterUrgentiste" class="btn-link">Enregistrer un premier médecin</button>
      </div>

      <div class="table-card" v-else-if="urgentistStore.allUrgentists?.length > 0">
        <div class="table-responsive">
          <table class="urgentistes-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Praticien</th>
                <th>Coordonnées</th>
                <th>Ville</th>
                <th>Spécialité</th>
                <th>Statut</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(doc, index) in urgentistStore.allUrgentists" :key="doc.id">
                <td class="col-id">{{ index + 1 }}</td>
                <td>
                  <div class="user-info">
                    <div class="avatar-sm">{{ doc.user?.first_name?.charAt(0) }}</div>
                    <div>
                      <div class="name">Dr. {{ doc.user?.first_name }} {{ doc.user?.last_name }}</div>
                      <div class="role-sub">Urgentiste</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="contact-info">
                    <span>📧 {{ doc.user?.email }}</span>
                    <span>📞 {{ doc.user?.phone }}</span>
                  </div>
                </td>
                <td><span class="city-tag">{{ doc.user?.city }}</span></td>
                <td><span class="speciality-text">{{ doc.speciality }}</span></td>
                <td>
                  <span :class="doc.status === 'available' ? 'badge-dispo' : 'badge-indispo'">
                    {{ doc.status === 'available' ? 'Disponible' : 'Indisponible' }}
                  </span>
                </td>
                <td class="text-right">
                  <div class="action-buttons">
                    <RouterLink :to="{ name: 'EditUrgentist', params: { id: doc.id } }" class="btn-edit" title="Modifier">
                      ✏️
                    </RouterLink>
                    <button class="btn-delete" @click="supprimer(doc.id)" title="Supprimer">
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
import { onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useUrgentistStore } from '@/stores/urgentistStore'

const router = useRouter()
const urgentistStore = useUrgentistStore()

const ajouterUrgentiste = () => {
  urgentistStore.resetFeedback();
  router.push({ name: 'AddUserUrgentist' }) 
}

const supprimer = async (id) => {
  if (confirm('Voulez-vous vraiment retirer cet urgentiste de la liste ?')) {
    try {
      await urgentistStore.deleteUrgentist(id)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  }
}

onMounted(() => {
  urgentistStore.resetFeedback();
  urgentistStore.fetchAllUrgentists()
})
</script>

<style scoped>
.urgentistes-page { padding: 30px; background: #f8fafc; min-height: 100vh; }

/* Header & Navigation */
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.header-left { display: flex; align-items: center; gap: 20px; }

.btn-back {
  width: 40px; height: 40px; border-radius: 10px; border: 1px solid #e2e8f0;
  background: white; cursor: pointer; transition: 0.2s; color: #64748b;
}
.btn-back:hover { background: #f1f5f9; transform: translateX(-3px); color: #0040d0; }

.title-group h2 { font-size: 24px; color: #1e293b; margin: 0; font-weight: 800; }
.count-badge { font-size: 12px; background: #e0e7ff; color: #4338ca; padding: 4px 12px; border-radius: 20px; font-weight: 600; margin-top: 4px; display: inline-block; }

.btn-add { background: #0040d0; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 700; transition: 0.2s; }
.btn-add:hover { background: #0035b0; transform: translateY(-2px); }

/* Feedback Messages */
.state-msg { padding: 12px 20px; border-radius: 10px; margin-bottom: 20px; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 10px; }
.loading { background: #eff6ff; color: #2563eb; }
.error { background: #fef2f2; color: #dc2626; }
.success { background: #f0fdf4; color: #16a34a; }

/* Table Design */
.table-card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; }
.urgentistes-table { width: 100%; border-collapse: collapse; }
.urgentistes-table th { background: #f8fafc; color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; padding: 16px; text-align: left; }
.urgentistes-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }

.user-info { display: flex; align-items: center; gap: 12px; }
.avatar-sm { width: 35px; height: 35px; background: #e0e7ff; color: #4338ca; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; }
.name { font-weight: 700; color: #1e293b; }
.role-sub { font-size: 12px; color: #94a3b8; }

.contact-info { display: flex; flex-direction: column; gap: 2px; font-size: 13px; color: #64748b; }
.city-tag { background: #f1f5f9; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; }
.speciality-text { color: #0040d0; font-weight: 600; }

/* Badges Status */
.badge-dispo, .badge-indispo {
  padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;
}
.badge-dispo { background: #dcfce7; color: #15803d; }
.badge-indispo { background: #fee2e2; color: #b91c1c; }

/* Actions */
.text-right { text-align: right !important; }
.action-buttons { display: flex; gap: 8px; justify-content: flex-end; }
.btn-edit, .btn-delete { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: none; cursor: pointer; transition: 0.2s; text-decoration: none; font-size: 14px; }
.btn-edit { background: #f1f5f9; }
.btn-edit:hover { background: #e0e7ff; }
.btn-delete { background: #f1f5f9; }
.btn-delete:hover { background: #fee2e2; }

/* Empty State */
.empty-state { text-align: center; padding: 60px; background: white; border-radius: 16px; border: 2px dashed #e2e8f0; }
.empty-state .icon { font-size: 40px; margin-bottom: 15px; }
.btn-link { background: none; border: none; color: #0040d0; font-weight: 700; cursor: pointer; text-decoration: underline; margin-top: 10px; }

.mini-spinner { width: 14px; height: 14px; border: 2px solid #2563eb; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>