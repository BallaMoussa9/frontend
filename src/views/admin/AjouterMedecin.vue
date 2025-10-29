<template>
  <AdminLayout>
    <div class="ajouter-medecin-container">
      <h2>Ajouter un Médecin</h2>
      <form @submit.prevent="submitForm" class="medecin-form">

        <fieldset>
          <legend>Informations générales</legend>
          <div class="form-row">
            <input v-model="form.first_name" type="text" placeholder="Prénom" required />
            <input v-model="form.last_name" type="text" placeholder="Nom" required />
          </div>
          <div class="form-row">
            <input v-model="form.birth_date" type="date" placeholder="Date de naissance" />
            <input v-model="form.phone" type="text" placeholder="Téléphone" />
          </div>
          <div class="form-row">
            <input v-model="form.email" type="email" placeholder="Adresse email" required />
            <input v-model="form.password" type="password" placeholder="Mot de passe" required />
          </div>
          <div class="form-row">
            <input v-model="form.city" type="text" placeholder="Ville" />
            <input v-model="form.country" type="text" placeholder="Pays" />
          </div>
          <div class="form-row">
            <input v-model="form.address" type="text" placeholder="Adresse" />
            <select v-model="form.department_id">
              <option disabled value="">-- Département --</option>
              <option v-for="dept in departements" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>
          <div class="form-row">
            <input type="file" @change="handleFileUpload" />
          </div>
        </fieldset>

        <fieldset>
          <legend>Détails professionnels</legend>
          <div class="form-row">
            <input v-model="form.speciality" type="text" placeholder="Spécialité" />
            <input v-model="form.numero_ordre" type="text" placeholder="Numéro d’ordre" />
          </div>
          <div class="form-row">
            <input v-model="form.numero_professionel" type="text" placeholder="N° professionnel" />
            <input v-model="form.experience" type="number" placeholder="Expérience (années)" />
          </div>
          <textarea v-model="form.biography" placeholder="Biographie"></textarea>
        </fieldset>

        <div v-if="doctorStore.loading">Création en cours...</div>
        <div v-if="doctorStore.error" class="error-message">{{ doctorStore.error }}</div>
        <div v-if="doctorStore.success" class="success-message">{{ doctorStore.success }}</div>

        <button type="submit" class="submit-btn" :disabled="doctorStore.loading">
          Ajouter le médecin
        </button>
      </form>
    </div>
  </AdminLayout>
</template>
<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { reactive, onMounted, computed } from 'vue'
import { useDoctorStore } from '@/stores/doctorStore'
import { useDepartmentStore } from '@/stores/departmentStore' // 👈 Importez le nouveau store

const doctorStore = useDoctorStore()
const departmentStore = useDepartmentStore() // 👈 Initialisez le store

const form = reactive({
  first_name: '',
  last_name: '',
  birth_date: '',
  phone: '',
  country: '',
  city: '',
  profile_photo: null,
  status: 'active',
  address: '',
  email: '',
  password: '',
  department_id: '',
  speciality: '',
  numero_ordre: '',
  biography: '',
  experience: '',
  numero_professionel: ''
})

// Utilisez un computed pour récupérer la liste des départements du store
const departements = computed(() => departmentStore.departments);

const handleFileUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    form.profile_photo = file
  }
}

const submitForm = async () => {
  const formData = new FormData()
  for (const key in form) {
    formData.append(key, form[key])
  }

  await doctorStore.createDoctor(formData)
}

// 🎯 Appelez l'action pour récupérer les départements au chargement du composant
onMounted(() => {
  departmentStore.fetchDepartments();
});
</script>
<style scoped>
.ajouter-medecin-container {
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

.medecin-form {
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
select,
textarea {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

textarea {
  width: 100%;
  height: 100px;
  resize: vertical;
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

.error-message {
  color: red;
  margin-top: 10px;
}

.success-message {
  color: green;
  margin-top: 10px;
}
</style>
