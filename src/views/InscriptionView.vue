<template>
  <AppLayout>
    <div class="page-container">
      <div class="register-wrapper">
        <div class="register-card fade-in">
          <div class="register-header">
            <div class="brand-logo">
              <img src="/santeko.png" alt="SanTeKo" />
            </div>
            <h1>Créer un compte</h1>
            <p>Rejoignez <strong>SanTeKo</strong>, votre partenaire santé au quotidien.</p>
          </div>

          <form @submit.prevent="submitForm" class="styled-form">
            <div class="form-section-title">
              <User :size="18" />
              Informations Personnelles
            </div>
            
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

            <div class="form-section-title">
              <MapPin :size="18" />
              Localisation & Profil
            </div>
            
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
                <label for="file-input" class="file-btn">
                  <Upload :size="18" />
                  Choisir une image
                </label>
                <div v-if="previewUrl" class="preview-circle">
                  <img :src="previewUrl" alt="Aperçu" />
                </div>
              </div>
            </div>

            <div class="form-section-title">
              <Shield :size="18" />
              Sécurité
            </div>

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
              <UserPlus v-if="!authStore.loading" :size="20" />
              <span v-else class="loader"></span>
              {{ authStore.loading ? 'Inscription en cours...' : "Créer mon compte" }}
            </button>
          </form>

          <p class="login-link">
            Vous avez déjà un compte ? <router-link to="/connection">Se connecter</router-link>
          </p>
        </div>
      </div>

      <AppFooter />
    </div>
  </AppLayout>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStores'
import AppLayout from '../layouts/AppLayout.vue'
import AppFooter from '@/components/AppFooter.vue'
import { User, MapPin, Shield, Upload, UserPlus } from 'lucide-vue-next'

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
.page-container {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  min-height: 100vh;
  color: white;
}

.register-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 5%;
}

.register-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  width: 100%;
  max-width: 750px;
  padding: 40px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.brand-logo {
  width: 70px;
  height: 70px;
  margin: 0 auto 20px;
}

.brand-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

h1 {
  color: white;
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 8px;
}

.register-header p {
  color: #94a3b8;
  font-size: 15px;
}

.register-header strong {
  color: #3b82f6;
}

.form-section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 700;
  color: #3b82f6;
  text-transform: uppercase;
  margin: 30px 0 20px;
  letter-spacing: 1px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.field {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.full-width {
  width: 100%;
  margin-bottom: 16px;
}

label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #cbd5e1;
}

input {
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  font-size: 15px;
  color: white;
  transition: all 0.3s;
}

input::placeholder {
  color: #64748b;
}

input:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

input[type="date"] {
  color-scheme: dark;
}

.upload-area {
  display: flex;
  align-items: center;
  gap: 20px;
}

.file-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.08);
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #cbd5e1;
  transition: all 0.3s;
}

.file-btn:hover {
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.1);
}

.preview-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #3b82f6;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

.preview-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.submit-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  background: linear-gradient(135deg, #2563eb, #10b981);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 24px;
  transition: all 0.3s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.4);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-msg {
  color: #ef4444;
  font-size: 12px;
  margin-top: 6px;
}

.login-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #64748b;
}

.login-link a {
  color: #3b82f6;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.3s;
}

.login-link a:hover {
  color: #60a5fa;
}

@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .register-card {
    padding: 25px;
  }
  
  h1 {
    font-size: 1.6rem;
  }
}
</style>