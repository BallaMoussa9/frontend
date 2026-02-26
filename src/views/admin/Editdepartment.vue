<template>
  <AdminLayout>
    <div class="form-container-wrapper">
      <header class="header-section">
        <button @click="router.back()" class="btn-back" title="Retour">
          <span class="arrow">←</span>
        </button>
        <div class="header-text">
          <h2>Modifier le Service</h2>
          <p class="subtitle" v-if="!loading">Édition du département : {{ form.name }}</p>
        </div>
      </header>

      <div v-if="loading" class="state-container loading">
        <div class="spinner"></div>
        <p>Chargement des données du service...</p>
      </div>

      <div v-else-if="error" class="state-container error-box">
        <div class="icon">⚠️</div>
        <p>{{ error }}</p>
        <button @click="router.push({ name: 'Department' })" class="btn-retry">Retour à la liste</button>
      </div>

      <form v-else @submit.prevent="submit" class="edit-department-form">
        <div class="form-card">
          <div class="form-grid">
            <div class="field-group">
              <label>Nom du service</label>
              <input v-model="form.name" type="text" placeholder="Ex: Cardiologie" required />
            </div>

            <div class="field-group">
              <label>État du service</label>
              <select v-model="form.status">
                <option value="active">🟢 Actif</option>
                <option value="inactive">🔴 Inactif</option>
              </select>
            </div>

            <div class="field-group full-width">
              <label>Position / Spécialité associée</label>
              <input v-model="form.position" type="text" placeholder="Ex: Médecine Interne - Bloc B" />
            </div>

            <div class="field-group full-width">
              <label>Description du service</label>
              <textarea v-model="form.description" placeholder="Description brève des activités du service..."></textarea>
            </div>

            <div class="field-group full-width">
              <label for="user-select">Médecin Responsable</label>
              <div class="select-wrapper">
                <select id="user-select" v-model="form.responsible_user_id">
                  <option :value="null">Aucun responsable assigné</option>
                  <option
                    v-for="user in userStore.responsibleUsers"
                    :key="user.id"
                    :value="user.id"
                  >
                    Dr. {{ user.first_name }} {{ user.last_name }} ({{ user.role }})
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="router.back()" class="btn-cancel">Annuler</button>
          <button type="submit" class="submit" :disabled="departmentStore.loading">
            {{ departmentStore.loading ? 'Enregistrement...' : 'Mettre à jour le service' }}
          </button>
        </div>
      </form>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { reactive, onMounted, ref } from 'vue' 
import { useRouter, useRoute } from 'vue-router'
import { useDepartmentStore } from '@/stores/departmentStore'
import { useUserStore } from '@/stores/userStore' 

const router = useRouter()
const route = useRoute() 
const departmentStore = useDepartmentStore()
const userStore = useUserStore()

const loading = ref(true) 
const error = ref(null) 

const form = reactive({
  name: '',
  description: '',
  position: '',
  status: 'active',
  responsible_user_id: null 
})

onMounted(async () => {
  const departmentId = route.params.id

  try {
    // 1. Charger les utilisateurs éligibles au rôle de responsable
    await userStore.fetchResponsibleUsers()

    // 2. Charger les données du département
    const department = await departmentStore.fetchDepartmentById(departmentId)

    if (department) {
      form.name = department.name
      form.description = department.description
      form.position = department.position
      form.status = department.status
      form.responsible_user_id = department.user_id || null 
    } else {
      error.value = 'Service introuvable.'
    }
  } catch (err) {
    error.value = 'Erreur lors de la récupération des données.'
    console.error(err)
  } finally {
    loading.value = false
  }
})

const submit = async () => {
  const departmentId = route.params.id
  try {
    await departmentStore.updateDepartment(departmentId, form) 
    alert('Le service a été mis à jour avec succès !')
    router.push({ name: 'Department' }) 
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message
    alert('Erreur : ' + errorMsg)
  }
}
</script>

<style scoped>
@import './FormStyle.css';

.form-container-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px;
}

/* Header */
.header-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.btn-back {
  width: 42px; height: 42px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: 0.2s;
  color: #64748b;
}

.btn-back:hover {
  background: #f1f5f9;
  transform: translateX(-3px);
  color: #0040d0;
}

.header-text h2 { margin: 0; font-size: 24px; color: #1e293b; font-weight: 800; }
.subtitle { margin: 0; color: #94a3b8; font-size: 14px; }

/* Form Design */
.form-card {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
}

.full-width { grid-column: span 2; }

.field-group { display: flex; flex-direction: column; gap: 8px; }
.field-group label { font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; }

input, select, textarea {
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  font-size: 15px;
  transition: 0.2s;
}

input:focus, select:focus, textarea:focus {
  border-color: #0040d0;
  background: white;
  outline: none;
  box-shadow: 0 0 0 4px rgba(0, 64, 208, 0.05);
}

textarea { min-height: 100px; resize: vertical; }

/* Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.submit {
  padding: 12px 30px;
  background-color: #0040d0;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  transition: 0.2s;
}

.submit:hover { background-color: #0035b0; transform: translateY(-2px); }
.submit:disabled { background-color: #94a3b8; cursor: not-allowed; }

.btn-cancel {
  padding: 12px 30px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
}

/* States */
.state-container { text-align: center; padding: 60px; background: white; border-radius: 20px; }
.spinner {
  width: 35px; height: 35px; border: 3px solid #f3f3f3; border-top: 3px solid #0040d0;
  border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.error-box { color: #e11d48; border: 1px solid #fecaca; background: #fff1f2; }
.btn-retry { margin-top: 15px; background: #e11d48; color: white; border: none; padding: 8px 20px; border-radius: 8px; cursor: pointer; }
</style>