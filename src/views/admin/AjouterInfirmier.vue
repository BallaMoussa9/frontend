<template>
  <AdminLayout>
    <div class="ajouter-infirmier-container">
      <h2>Ajouter un Infirmier / Infirmière</h2>
      <form @submit.prevent="submitForm" class="infirmier-form">

        <fieldset>
          <legend>Informations générales</legend>
          <div class="form-row">
            <input v-model="form.first_name" type="text" placeholder="Prénom" required />
            <input v-model="form.last_name" type="text" placeholder="Nom" required />
          </div>

          <div class="form-row">
            <input v-model="form.birth_date" type="date" placeholder="Date de naissance" required />
            <input v-model="form.phone" type="text" placeholder="Téléphone" required />
          </div>

          <div class="form-row">
            <input v-model="form.email" type="email" placeholder="Email" required />
            <input v-model="form.password" type="password" placeholder="Mot de passe" required />
          </div>

          <div class="form-row">
            <input v-model="form.password_confirmation" type="password" placeholder="Confirmer le mot de passe" required />
          </div>

          <div class="form-row">
            <input v-model="form.city" type="text" placeholder="Ville" required />
            <input v-model="form.country" type="text" placeholder="Pays" />
          </div>

          <div class="form-row">
            <input v-model="form.address" type="text" placeholder="Adresse complète" required />
            <select v-model="form.department_id" required>
              <option disabled value="">-- Sélectionner un département --</option>
              <option v-if="departmentStore.loading">Chargement des départements...</option>
              <option v-for="dep in departmentStore.allDepartments" :key="dep.id" :value="dep.id">
                {{ dep.name }}
              </option>
            </select>
          </div>

          <!-- ✅ Upload fichier image -->
          <div class="form-row">
            <input type="file" accept="image/*" @change="handleFileUpload" />
          </div>
        </fieldset>

        <div v-if="nurseStore.loading" class="loading-message">Création en cours...</div>
        <div v-if="nurseStore.error" class="error-message">{{ nurseStore.error }}</div>
        <div v-if="nurseStore.success" class="success-message">{{ nurseStore.success }}</div>

        <button type="submit" class="submit-btn" :disabled="nurseStore.loading">
          Enregistrer l'infirmier
        </button>
      </form>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { reactive, onMounted } from 'vue'
import { useNurseStore } from '@/stores/nurseStore'
import { useDepartmentStore } from '@/stores/departmentStore'

// Stores
const nurseStore = useNurseStore()
const departmentStore = useDepartmentStore()

// Données du formulaire
const form = reactive({
  first_name: '',
  last_name: '',
  birth_date: '',
  phone: '',
  country: '',
  city: '',
  profile_photo: null,
  address: '',
  email: '',
  password: '',
  password_confirmation: '',
  department_id: ''
})

const initialFormState = { ...form }

// ✅ gestion du fichier image
const handleFileUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    form.profile_photo = file
  }
}

// ✅ envoi avec FormData
const submitForm = async () => {
  const formData = new FormData()
  Object.entries(form).forEach(([key, value]) => {
    if (value !== null && value !== '') {
      formData.append(key, value)
    }
  })

  try {
    await nurseStore.createNurse(formData)
    Object.assign(form, initialFormState)
  } catch (error) {
    console.error('Erreur lors de la soumission du formulaire:', error)
  }
}

onMounted(() => {
  departmentStore.fetchDepartments()
})
</script>

<style scoped>
.ajouter-infirmier-container {
  max-width: 900px;
  margin: auto;
  padding: 30px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
}
h2 {
  margin-bottom: 20px;
  color: #0040d0;
}
.infirmier-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
fieldset {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 20px;
}
legend {
  font-weight: bold;
  color: #002580;
  padding: 0 10px;
}
.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 10px;
}
input,
select {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}
.submit-btn {
  align-self: flex-end;
  background-color: #0040d0;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
}
.submit-btn:hover {
  background-color: #002fa1;
}
.loading-message {
  color: #0040d0;
  font-style: italic;
  margin-top: 10px;
}
.error-message {
  color: #d9534f;
  margin-top: 10px;
}
.success-message {
  color: #5cb85c;
  margin-top: 10px;
}
</style>
