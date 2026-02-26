<template>
  <AppLayout>
    <div class="register-wrapper">
      <div class="register-card fade-in">
        <div class="register-header">
          <div class="brand-logo">
            <span class="plus-icon">✚</span>
          </div>
          <h1>Créer un compte</h1>
          <p>Rejoignez <strong>SanTeKo</strong>, votre partenaire santé au quotidien.</p>
        </div>

        <form @submit.prevent="submitForm" class="styled-form">
          <div class="form-section-title">Informations Personnelles</div>
          
          <div class="form-row">
            <div class="field">
              <label>Prénom</label>
              <input v-model="form.first_name" type="text" placeholder="Ex: Moussa" required />
              <p v-if="errors['first_name']" class="error-msg">{{ errors['first_name'][0] }}</p>
            </div>
            <div class="field">
              <label>Nom</label>
              <input v-model="form.last_name" type="text" placeholder="Ex: Traoré" required />
              <p v-if="errors['last_name']" class="error-msg">{{ errors['last_name'][0] }}</p>
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Date de naissance</label>
              <input v-model="form.birth_date" type="date" required />
              <p v-if="errors['birth_date']" class="error-msg">{{ errors['birth_date'][0] }}</p>
            </div>
            <div class="field">
              <label>Téléphone</label>
              <input v-model="form.phone" type="tel" placeholder="+223 ..." required />
              <p v-if="errors['phone']" class="error-msg">{{ errors['phone'][0] }}</p>
            </div>
          </div>

          <div class="form-section-title">Localisation & Profil</div>
          
          <div class="form-row">
            <div class="field">
              <label>Pays</label>
              <input v-model="form.country" type="text" placeholder="Mali" required />
            </div>
            <div class="field">
              <label>Ville</label>
              <input v-model="form.city" type="text" placeholder="Bamako" required />
            </div>
          </div>

          <div class="field full-width">
            <label>Adresse</label>
            <input v-model="form.address" type="text" placeholder="Rue, Quartier..." />
          </div>

          <div class="field full-width">
            <label>Photo de profil</label>
            <div class="upload-area">
              <input type="file" id="file-input" accept="image/*" @change="handleProfilePhoto" hidden />
              <label for="file-input" class="file-btn">Choisir une image</label>
              <div v-if="previewUrl" class="preview-circle">
                <img :src="previewUrl" alt="Aperçu" />
              </div>
            </div>
          </div>

          <div class="form-section-title">Sécurité</div>

          <div class="field full-width">
            <label>Email</label>
            <input v-model="form.email" type="email" placeholder="email@exemple.com" required />
            <p v-if="errors['email']" class="error-msg">{{ errors['email'][0] }}</p>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Mot de passe</label>
              <input v-model="form.password" type="password" placeholder="********" required />
              <p v-if="errors['password']" class="error-msg">{{ errors['password'][0] }}</p>
            </div>
            <div class="field">
              <label>Confirmer</label>
              <input v-model="form.password_confirmation" type="password" placeholder="********" required />
            </div>
          </div>

          <button type="submit" class="submit-btn" :disabled="authStore.loading">
            {{ authStore.loading ? 'Inscription en cours...' : "Créer mon compte" }}
          </button>
        </form>

        <p class="login-link">
          Vous avez déjà un compte ? <router-link to="/login">Se connecter</router-link>
        </p>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStores'
import AppLayout from '../layouts/AppLayout.vue'

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

function handleProfilePhoto(event) {
  const file = event.target.files[0]
  if (file) {
    form.profile_photo = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

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
/* Fond de la page */
.register-wrapper {
  background: #f0f4f8;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 15px;
}

/* Carte principale */
.register-card {
  background: white;
  width: 100%;
  max-width: 750px;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Header */
.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.plus-icon {
  background: #0040d0;
  color: white;
  width: 50px;
  height: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 24px;
  margin-bottom: 15px;
}

h1 {
  color: #002d91;
  font-size: 28px;
  margin-bottom: 5px;
}

/* Formulaire */
.form-section-title {
  font-size: 13px;
  font-weight: 700;
  color: #0040d0;
  text-transform: uppercase;
  margin: 25px 0 15px;
  letter-spacing: 1px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.field {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.full-width {
  width: 100%;
  margin-bottom: 15px;
}

label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #4a5568;
}

input {
  padding: 12px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.2s;
  background: #f8fafc;
}

input:focus {
  outline: none;
  border-color: #0040d0;
  background: white;
  box-shadow: 0 0 0 3px rgba(0, 64, 208, 0.1);
}

/* Upload Photo */
.upload-area {
  display: flex;
  align-items: center;
  gap: 15px;
}

.file-btn {
  background: #edf2f7;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #cbd5e0;
}

.preview-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #0040d0;
}

.preview-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Bouton */
.submit-btn {
  width: 100%;
  padding: 15px;
  background: #0040d0;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 20px;
  transition: background 0.2s;
}

.submit-btn:hover {
  background: #0032a3;
}

/* Erreur et Liens */
.error-msg {
  color: #e53e3e;
  font-size: 12px;
  margin-top: 5px;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #718096;
}

.login-link a {
  color: #0040d0;
  font-weight: 700;
  text-decoration: none;
}

/* Mobile */
@media (max-width: 600px) {
  .form-row { flex-direction: column; gap: 15px; }
  .register-card { padding: 25px; }
}
</style>