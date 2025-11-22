<template>
  <AdminLayout>
    <div class="form-container">
      <h2>Ajouter un Département</h2>
      <form @submit.prevent="submit">
        <input v-model="form.name" placeholder="Nom du département" />
        <input v-model="form.description" placeholder="Description" />
        <input v-model="form.position" placeholder="Poste associé (Cardiologie...)" />

        <select v-model="form.status">
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
        </select>

        <label for="user-search">Rechercher un responsable :</label>
        <input 
          id="user-search" 
          v-model="searchQuery" 
          placeholder="Entrez le nom ou prénom de l'utilisateur..." 
        />
        
        <label for="user-select">Responsable sélectionné :</label>
        <select 
          id="user-select" 
          v-model="form.responsible_user_id"
        >
          <option :value="null">Sélectionner un responsable</option>
          <option
            v-for="user in filteredResponsibleUsers" 
            :key="user.id"
            :value="user.id"
          >
            {{ user.first_name }} {{ user.last_name }} ({{ user.role }})
          </option>
        </select>

        <button class="submit" :disabled="userStore.loading">
          {{ userStore.loading ? 'Chargement...' : 'Ajouter' }}
        </button>
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

// Propriété calculée pour filtrer la liste des utilisateurs affichés
const filteredResponsibleUsers = computed(() => {
  if (!userStore.responsibleUsers) {
    return []
  }
  
  if (!searchQuery.value) {
    return userStore.responsibleUsers
  }
  
  const query = searchQuery.value.toLowerCase()
  return userStore.responsibleUsers.filter(user => {
    // Vérifier si user existe avant d'accéder aux propriétés
    if (!user || !user.first_name || !user.last_name) return false;
    
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
    return fullName.includes(query)
  })
})


onMounted(async () => {
  // Cette ligne est correcte, mais dépend de la résolution du bug 500 dans l'API backend.
  await userStore.fetchResponsibleUsers(); 
});

const submit = async () => {
  if (userStore.loading) return; 
  
  try {
    console.log("Données envoyées au backend (responsible_user_id):", form);
    
    await departmentStore.createDepartment(form)
    
    alert('Département créé avec succès !')
    router.push({ name: 'Department' }) 
  } catch (error) {
    console.error("Erreur détaillée lors de la création du département:", error);
    alert('Échec de la création du département : ' + (error.response?.data?.message || error.message));
  }
}
</script>

<style scoped>
/* Votre style CSS */
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

.submit:disabled {
    background-color: #a0c3e8;
    cursor: not-allowed;
}

.submit:hover:not(:disabled) {
  background-color: #0056b3;
}

label {
  font-size: 14px;
  color: #555;
  margin-top: 10px;
}
</style>