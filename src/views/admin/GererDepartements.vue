<template>
  <AdminLayout>
    <div class="urgentistes-page">
      <div class="header">
        <h2>Médecins urgentistes</h2>
        <button class="btn-add" @click="ajouterUrgentiste">➕ Ajouter un urgentiste</button>
      </div>

      <div v-if="userStore.loading" class="loading-message">Chargement...</div>
      <div v-if="userStore.error" class="error-message">{{ userStore.error }}</div>
      <div v-if="userStore.success" class="success-message">{{ userStore.success }}</div>

      <div v-else-if="userStore.allFirstResponders?.length === 0 && !userStore.loading" class="info-message">
        Aucun urgentiste trouvé.
      </div>

      <div class="table-container" v-else-if="userStore.allFirstResponders?.length > 0">
        <table class="urgentistes-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Ville</th>
              <th>Spécialité</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(doc, index) in userStore.allFirstResponders" :key="doc.id">
              <td>{{ index + 1 }}</td>
              <td>{{ doc.user?.first_name }} {{ doc.user?.last_name }}</td>
              <td>{{ doc.user?.email }}</td>
              <td>{{ doc.user?.phone }}</td>
              <td>{{ doc.user?.city }}</td>
              <td>{{ doc.speciality }}</td>
              <td>
                <span :class="doc.status === 'available' ? 'badge-dispo' : 'badge-indispo'">
                  {{ doc.status === 'available' ? 'Disponible' : 'Indisponible' }}
                </span>
              </td>
              <td>
                <RouterLink :to="{ name: 'EditUrgentist', params: { id: doc.id } }" class="btn-action">✏️</RouterLink>
                <button class="btn-delete" @click="supprimer(doc.id)">🗑</button>
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
import { onMounted, watch } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useUrgentistStore } from '@/stores/urgentistStore' // Importé pour la fonction supprimer()

const router = useRouter()
const userStore = useUserStore()
const urgentistStore = useUrgentistStore() // Importé pour la fonction supprimer()

// 🔑 LOGGING : Surveiller la liste des urgentistes dans le store
watch(() => userStore.allFirstResponders, (newList) => {
    if (newList && newList.length > 0) {
        console.log('--- VUE TEMPLATE LOG: Liste des urgentistes prête à l\'affichage (userStore.allFirstResponders) ---');
        console.table(newList, ['id', 'user_id', 'speciality', 'status']);
        // Pour une inspection détaillée de toutes les données (y compris la relation 'user')
        // console.log('Détails complets de la liste Vue :', newList);
    } else if (userStore.loading === false) {
        console.log('--- VUE TEMPLATE LOG: userStore.allFirstResponders est vide. ---');
    }
}, { immediate: true });


const ajouterUrgentiste = () => {
  userStore.resetFeedback();
  router.push({ name: 'AddUserUrgentist' })
}

const supprimer = async (id) => {
  if (confirm('Voulez-vous vraiment supprimer cet urgentiste ?')) {
    try {
      await urgentistStore.deleteUrgentist(id)
      await userStore.fetchAllFirstResponders()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  }
}

onMounted(() => {
  userStore.resetFeedback();
  userStore.fetchAllFirstResponders()
})
</script>


<style scoped>
/* Le style reste inchangé */
.info-message {
  text-align: center;
  padding: 20px;
  font-size: 16px;
  color: #555;
  background-color: #f0f0f0;
  border-radius: 8px;
  margin-top: 20px;
}
.loading-message { color: #0040d0; margin-bottom: 10px; }
.error-message { color: #d9534f; margin-bottom: 10px; }
.success-message { color: #5cb85c; margin-bottom: 10px; }

.urgentistes-page { padding: 32px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.header h2 { font-size: 22px; color: #002580; }
.btn-add { background-color: #0040d0; color: white; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: 600; }

.table-container { overflow-x: auto; }
.urgentistes-table { width: 100%; border-collapse: collapse; background-color: white; border-radius: 12px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.04); }
.urgentistes-table th, .urgentistes-table td { padding: 14px 16px; text-align: left; border-bottom: 1px solid #eee; }
.urgentistes-table th { background-color: #f5f7fa; color: #333; }

.badge-dispo { color: green; font-weight: bold; }
.badge-indispo { color: red; font-weight: bold; }

.btn-action, .btn-delete { background: none; border: none; cursor: pointer; font-size: 16px; margin-right: 8px; }
</style>