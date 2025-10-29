<template>
  <AdminLayout>
    <div class="edit-user-container">
      <h2>Modifier un utilisateur</h2>

      <form @submit.prevent="submit">
        <div class="form-group">
          <label>Prénom</label>
          <input type="text" v-model="form.first_name" required />
        </div>

        <div class="form-group">
          <label>Nom</label>
          <input type="text" v-model="form.last_name" required />
        </div>

        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="form.email" required />
        </div>

        <div class="form-group">
          <label>Date de naissance</label>
          <input type="date" v-model="form.birth_date" />
        </div>

        <div class="form-group">
          <label>Téléphone</label>
          <input type="text" v-model="form.phone" />
        </div>

        <div class="form-group">
          <label>Pays</label>
          <input type="text" v-model="form.country" />
        </div>

        <div class="form-group">
          <label>Ville</label>
          <input type="text" v-model="form.city" />
        </div>

        <div class="form-group">
          <label>Adresse</label>
          <input type="text" v-model="form.address" />
        </div>

        <div class="form-group">
          <label>Statut</label>
          <select v-model="form.status">
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
          </select>
        </div>

        <div class="form-group">
          <label>Rôle</label>
          <select v-model="form.role_id">
            <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>Département</label>
          <select v-model="form.department_id">
            <option value="">Aucun</option>
            <option v-for="dept in departements" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>Langue</label>
          <select v-model="form.language_id">
            <option value="">Défaut</option>
            <option v-for="lang in langues" :key="lang.id" :value="lang.id">{{ lang.name }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>Photo de profil</label>
          <input type="file" @change="handlePhotoUpload" />
          <img v-if="form.profile_photo" :src="previewPhoto" class="preview" />
        </div>

        <button type="submit" class="submit-btn">Mettre à jour</button>
      </form>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { ref, computed } from 'vue'

// Exemple initial (à remplacer par les données du backend)
const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  birth_date: '',
  phone: '',
  country: '',
  city: '',
  address: '',
  status: 'actif',
  role_id: '',
  department_id: '',
  language_id: '',
  profile_photo: null,
})

// Mock (remplacer avec API)
const roles = ref([
  { id: 1, name: 'Administrateur' },
  { id: 2, name: 'Médecin' },
  { id: 3, name: 'Patient' },
])

const departements = ref([
  { id: 1, name: 'Cardiologie' },
  { id: 2, name: 'Urgence' },
])

const langues = ref([
  { id: 1, name: 'Français' },
  { id: 2, name: 'Anglais' },
])

const previewPhoto = computed(() => {
  if (!form.value.profile_photo) return null
  return typeof form.value.profile_photo === 'string'
    ? `http://localhost/storage/${form.value.profile_photo}`
    : URL.createObjectURL(form.value.profile_photo)
})

function handlePhotoUpload(e) {
  form.value.profile_photo = e.target.files[0]
}

function submit() {
  // Envoyer `form` au backend via API (avec FormData si fichier présent)
  console.log('Formulaire soumis :', form.value)
}
</script>

<style scoped>
.edit-user-container {
  max-width: 800px;
  margin: auto;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
}

h2 {
  margin-bottom: 20px;
  color: #002580;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

label {
  font-weight: bold;
  margin-bottom: 6px;
}

input,
select {
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.preview {
  margin-top: 10px;
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #ddd;
}

.submit-btn {
  background-color: #0040d0;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}
</style>
