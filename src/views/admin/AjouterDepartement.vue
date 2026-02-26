<template>
  <AdminLayout>
    <div class="form-container-wrapper">
      <header class="header-section">
        <button @click="router.back()" class="btn-back" title="Retour">
          <span class="arrow">←</span>
        </button>
        <div class="header-text">
          <h2>Ajouter un Nouveau Service</h2>
          <p class="subtitle">Créez un nouveau département hospitalier et assignez un responsable.</p>
        </div>
      </header>

      <form @submit.prevent="submit" class="add-department-form">
        <div class="form-card">
          <div class="form-grid">
            <div class="field-group">
              <label>Nom du service</label>
              <input 
                v-model="form.name" 
                type="text" 
                placeholder="Ex: Cardiologie, Pédiatrie..." 
                required 
              />
            </div>

            <div class="field-group">
              <label>État initial</label>
              <select v-model="form.status">
                <option value="active">🟢 Actif (Opérationnel)</option>
                <option value="inactive">🔴 Inactif (En attente)</option>
              </select>
            </div>

            <div class="field-group full-width">
              <label>Localisation / Poste associé</label>
              <input 
                v-model="form.position" 
                type="text" 
                placeholder="Ex: Aile Est, 2ème étage, Bloc B" 
              />
            </div>

            <div class="field-group full-width">
              <label>Description du service</label>
              <textarea 
                v-model="form.description" 
                placeholder="Décrivez brièvement les missions de ce service..."
              ></textarea>
            </div>

            <hr class="separator full-width" />

            <div class="field-group full-width">
              <label for="user-search">Rechercher un responsable (Médecin/Admin)</label>
              <div class="search-input-wrapper">
                <span class="search-icon">🔍</span>
                <input 
                  id="user-search" 
                  v-model="searchQuery" 
                  type="text"
                  placeholder="Tapez le nom pour filtrer la liste ci-dessous..." 
                />
              </div>
            </div>

            <div class="field-group full-width">
              <label for="user-select">Responsable sélectionné</label>
              <select 
                id="user-select" 
                v-model="form.responsible_user_id"
                :class="{ 'has-value': form.responsible_user_id }"
              >
                <option :value="null">-- Choisir un responsable dans la liste --</option>
                <option
                  v-for="user in filteredResponsibleUsers" 
                  :key="user.id"
                  :value="user.id"
                >
                  Dr. {{ user.first_name }} {{ user.last_name }} ({{ user.role }})
                </option>
              </select>
              <p class="helper-text" v-if="filteredResponsibleUsers.length === 0 && searchQuery">
                Aucun utilisateur ne correspond à votre recherche.
              </p>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="router.back()" class="btn-cancel">Annuler</button>
          <button type="submit" class="submit" :disabled="departmentStore.loading">
            <span v-if="departmentStore.loading" class="mini-spinner"></span>
            {{ departmentStore.loading ? 'Création...' : 'Créer le service' }}
          </button>
        </div>
      </form>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { reactive, onMounted, ref, computed } from 'vue' 
import { useRouter } from 'vue-router'
import { useDepartmentStore } from '@/stores/departmentStore'
import { useUserStore } from '@/stores/userStore' 

const router = useRouter()
const departmentStore = useDepartmentStore()
const userStore = useUserStore() 

const searchQuery = ref('') 

const form = reactive({
  name: '',
  description: '',
  position: '',
  status: 'active',
  responsible_user_id: null 
})

const filteredResponsibleUsers = computed(() => {
  if (!userStore.responsibleUsers) return []
  if (!searchQuery.value) return userStore.responsibleUsers
  
  const query = searchQuery.value.toLowerCase()
  return userStore.responsibleUsers.filter(user => {
    if (!user || !user.first_name || !user.last_name) return false;
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
    return fullName.includes(query)
  })
})

onMounted(async () => {
  await userStore.fetchResponsibleUsers(); 
});

const submit = async () => {
  if (departmentStore.loading) return; 
  
  try {
    await departmentStore.createDepartment(form)
    alert('Le nouveau service a été créé avec succès !')
    router.push({ name: 'Department' }) 
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    alert('Échec de la création : ' + errorMsg);
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

/* Header & Bouton Retour */
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
  border-color: #cbd5e1;
}

.header-text h2 { margin: 0; font-size: 24px; color: #1e293b; font-weight: 800; }
.subtitle { margin: 0; color: #64748b; font-size: 14px; margin-top: 4px; }

/* Carte de Formulaire */
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
.field-group label { font-size: 13px; font-weight: 700; color: #475569; text-transform: uppercase; }

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

.separator { border: 0; border-top: 1px solid #f1f5f9; margin: 10px 0; }

/* Zone de recherche */
.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 15px;
  color: #94a3b8;
}

.search-input-wrapper input {
  padding-left: 45px;
}

.helper-text { font-size: 12px; color: #e11d48; margin-top: 4px; }

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
  display: flex;
  align-items: center;
  gap: 10px;
  transition: 0.2s;
}

.submit:hover:not(:disabled) { background-color: #0035b0; transform: translateY(-2px); }
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

.mini-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>