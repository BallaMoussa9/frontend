<template>
  <AppLayout>
    <div class="register-container">
      <h1>Créer un compte</h1>
      <form @submit.prevent="submitForm">
        <!-- Nom & Prénom -->
        <div class="form-row">
          <div class="field">
            <input v-model="form.first_name" type="text" placeholder="Prénom" required />
            <p v-if="errors['first_name']" class="error">{{ errors['first_name'][0] }}</p>
          </div>
          <div class="field">
            <input v-model="form.last_name" type="text" placeholder="Nom" required />
            <p v-if="errors['last_name']" class="error">{{ errors['last_name'][0] }}</p>
          </div>
        </div>

        <!-- Date de naissance & Téléphone -->
        <div class="form-row">
          <div class="field">
            <input v-model="form.birth_date" type="date" required />
            <p v-if="errors['birth_date']" class="error">{{ errors['birth_date'][0] }}</p>
          </div>
          <div class="field">
            <input v-model="form.phone" type="tel" placeholder="Téléphone" required />
            <p v-if="errors['phone']" class="error">{{ errors['phone'][0] }}</p>
          </div>
        </div>

        <!-- Pays & Ville -->
        <div class="form-row">
          <div class="field">
            <input v-model="form.country" type="text" placeholder="Pays" required />
            <p v-if="errors['country']" class="error">{{ errors['country'][0] }}</p>
          </div>
          <div class="field">
            <input v-model="form.city" type="text" placeholder="Ville" required />
            <p v-if="errors['city']" class="error">{{ errors['city'][0] }}</p>
          </div>
        </div>

        <!-- Photo de profil -->
        <div class="form-row">
          <div class="field">
            <input type="file" accept="image/*" @change="handleProfilePhoto" />
            <p v-if="errors['profile_photo']" class="error">{{ errors['profile_photo'][0] }}</p>
          </div>
        </div>

        <!-- Aperçu de l’image -->
        <div v-if="previewUrl" class="form-row">
          <img :src="previewUrl" alt="Photo de profil" class="preview" />
        </div>

        <!-- Adresse & Email -->
        <div class="form-row">
          <div class="field">
            <input v-model="form.address" type="text" placeholder="Adresse" />
            <p v-if="errors['address']" class="error">{{ errors['address'][0] }}</p>
          </div>
          <div class="field">
            <input v-model="form.email" type="email" placeholder="Email" required />
            <p v-if="errors['email']" class="error">{{ errors['email'][0] }}</p>
          </div>
        </div>

        <!-- Mot de passe & confirmation -->
        <div class="form-row">
          <div class="field">
            <input v-model="form.password" type="password" placeholder="Mot de passe" required />
            <p v-if="errors['password']" class="error">{{ errors['password'][0] }}</p>
          </div>
          <div class="field">
            <input v-model="form.password_confirmation" type="password" placeholder="Confirmer le mot de passe" required />
          </div>
        </div>

        <button type="submit">S'inscrire</button>
      </form>
    </div>
  </AppLayout>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStores'
import AppLayout from '../layouts/AppLayout.vue'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()

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
  password_confirmation: ''
})

const previewUrl = ref(null)
const errors = ref({})

// Gestion image de profil
function handleProfilePhoto(event) {
  const file = event.target.files[0]
  if (file) {
    form.profile_photo = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

// Formatage date


// Soumission du formulaire
async function submitForm() {
  errors.value = {}

  if (form.password !== form.password_confirmation) {
    alert("Les mots de passe ne correspondent pas.")
    return
  }

  const date = new Date(form.birth_date)
  if (isNaN(date)) {
    alert("Veuillez entrer une date de naissance valide.")
    return
  }

  form.email = form.email.trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) {
    alert("Veuillez entrer une adresse e-mail valide.")
    return
  }


  try {
    await authStore.register(form)
    alert("Inscription réussie")
    router.push({ name: 'Login' })
  } catch (error) {
    if (error.response && error.response.data.errors) {
      errors.value = error.response.data.errors
    } else {
      alert("Erreur lors de l'inscription : " + error.message)
    }
  }
}
</script>

<style scoped>
.register-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 40px;
  font-family: Arial, sans-serif;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0,0,0,0.05);
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #0040d0;
}

form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.field {
  flex: 1;
  display: flex;
  flex-direction: column;
}

input[type],
input[type="email"],
input[type="password"],
input[type="tel"],
input[type="url"],
input[type="date"],
input[type="file"] {
  flex: 1;
  min-width: 250px;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

button {
  padding: 14px;
  background-color: #0040d0;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.preview {
  max-height: 150px;
  border-radius: 8px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
}

.error {
  color: red;
  font-size: 0.9em;
  margin-top: 4px;
}
</style>
