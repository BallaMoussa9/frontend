<template>
  <AdminLayout>
    <div class="form-container">
      <h2>Modifier Département</h2>
      <form @submit.prevent="submit">
        <input v-model="form.name" placeholder="Nom du département" />
        <input v-model="form.description" placeholder="Description" />
        <input v-model="form.position" placeholder="Poste associé (Cardiologie...)" />

        <select v-model="form.status">
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
        </select>

        <label for="user-select">Responsable du département :</label>

        <select id="user-select" v-model="form.responsible_user_id">
          <option :value="null">Sélectionner un responsable</option>
          <option
            v-for="user in userStore.responsibleUsers"
            :key="user.id"
            :value="user.id"
          >
            {{ user.first_name }} {{ user.last_name }} ({{ user.role }})
          </option>
        </select>

        <button class="submit">Modifier</button>
      </form>
      <div v-if="loading" class="loading-message">Chargement des données...</div>
      <div v-if="error" class="error-message">{{ error }}</div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { reactive, onMounted, ref } from 'vue' 
import { useRouter, useRoute } from 'vue-router'
import { useDepartmentStore } from '@/stores/departmentStore'

// ✅ CORRECTION : Importation du VRAI store utilisateur
import { useUserStore } from '@/stores/userStore' 

const router = useRouter()
const route = useRoute() 
const departmentStore = useDepartmentStore()
const userStore = useUserStore() // Initialisation du store utilisateur

const loading = ref(true) 
const error = ref(null) 

const form = reactive({
  name: '',
  description: '',
  position: '',
  status: 'active',
  // Clé attendue par le Request Laravel
  responsible_user_id: null 
})

onMounted(async () => {
  const departmentId = route.params.id

  try {
    // 1. Charger la liste des utilisateurs
    await userStore.fetchResponsibleUsers()

    // 2. Charger les détails du département spécifique
    const department = await departmentStore.fetchDepartmentById(departmentId)

    if (department) {
      // 3. Pré-remplir le formulaire avec les données du département
      form.name = department.name
      form.description = department.description
      form.position = department.position
      form.status = department.status
      
      // Pré-sélectionner l'ID de l'utilisateur (user_id)
      form.responsible_user_id = department.user_id || null 
    } else {
      error.value = 'Département non trouvé.'
    }
  } catch (err) {
    error.value = 'Échec du chargement des données du département : ' + err.message
    console.error('Erreur de chargement du département:', err)
  } finally {
    loading.value = false
  }
})

const submit = async () => {
  const departmentId = route.params.id

  console.log("Données envoyées pour mise à jour (responsible_user_id):", form);

  try {
    await departmentStore.updateDepartment(departmentId, form) 
    
    alert('Département mis à jour avec succès !')
    router.push({ name: 'Department' }) 
  } catch (err) {
    error.value = 'Échec de la mise à jour du département : ' + (err.response?.data?.message || err.message)
    console.error('Erreur de mise à jour:', err.response?.data || err)
    alert(error.value)
  }
}
</script>

<style scoped>
@import './FormStyle.css';

.form-container {
  max-width: 600px;
  margin: auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-container h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

input,
select {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  width: 100%;
}

.submit {
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
}

.submit:hover {
  background-color: #0056b3;
}

label {
  font-size: 14px;
  color: #555;
  margin-top: 10px;
}
.loading-message, .error-message {
  text-align: center;
  padding: 10px;
  margin-top: 15px;
  font-size: 14px;
  font-weight: 600;
}
.loading-message { color: #0040d0; }
.error-message { color: #d9534f; border: 1px solid #d9534f; border-radius: 5px; background-color: #fcebeb;}
</style>