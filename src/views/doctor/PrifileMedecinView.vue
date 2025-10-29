<template>
  <MedecinLayout>
    <div class="profile-page">
      <h1 class="title">Profil professionnel</h1>

      <form @submit.prevent="updateProfile">
        <div class="form-group">
          <label>Nom complet</label>
          <input type="text" v-model="form.name" />
        </div>

        <div class="form-group">
          <label>Spécialité</label>
          <input type="text" v-model="form.specialty" />
        </div>

        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="form.email" />
        </div>

        <div class="form-group">
          <label>Numéro de téléphone</label>
          <input type="text" v-model="form.phone" />
        </div>

        <div class="form-group">
          <label>Langue préférée</label>
          <select v-model="form.language">
            <option value="fr">Français</option>
            <option value="en">Anglais</option>
            <option value="bm">Bambara</option>
          </select>
        </div>

        <div class="form-group">
          <label>Photo de profil</label>
          <input type="file" @change="handleFileUpload" />
          <img v-if="form.photoUrl" :src="form.photoUrl" class="preview" />
        </div>

        <button class="btn-submit" type="submit">Enregistrer</button>
      </form>
    </div>
  </MedecinLayout>
</template>

<script setup>
import MedecinLayout from '@/layouts/MedecinLayout.vue'
import { ref } from 'vue'

const form = ref({
  name: 'Dr. Balla Moussa',
  specialty: 'Médecine générale',
  email: 'balla@example.com',
  phone: '+223 7777 8888',
  language: 'fr',
  photoUrl: '',
})

function handleFileUpload(e) {
  const file = e.target.files[0]
  if (file) {
    form.value.photoUrl = URL.createObjectURL(file)
  }
}

function updateProfile() {
  alert('Profil mis à jour !')
  // Intégration API Laravel ici
}
</script>

<style scoped>
.profile-page {
  padding: 32px;
  max-width: 600px;
  margin: 0 auto;
}

.title {
  font-size: 24px;
  margin-bottom: 28px;
  color: #002580;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
}

input, select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccd;
  border-radius: 6px;
  font-size: 14px;
}

.preview {
  margin-top: 12px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ccc;
}

.btn-submit {
  padding: 10px 16px;
  background-color: #002580;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
