<template>
  <div class="admin-page-container">
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside :class="['sidebar', { 'open': isSidebarOpen }]">
        <div class="sidebar-header">
          <div class="logo-icon">N</div>
          <div class="logo-text">SanTeKo <span>Infirmier</span></div>
        </div>

        <nav class="menu">
          <RouterLink :to="{name:'NurseDashboard', params: { id: nurseId }}" class="menu-item" @click="closeSidebar">
            <BarChart3 :size="20" class="menu-icon" /> Dashboard
          </RouterLink>
          
          <div class="menu-divider">Gestion des Patients</div>
          
          <RouterLink :to="{name:'PatientList', params: { id: nurseId }}" class="menu-item" @click="closeSidebar">
            <Users :size="20" class="menu-icon" /> Patients
          </RouterLink>
          <RouterLink :to="{name:'VitalSignsForm', params: { id: nurseId }}" class="menu-item" @click="closeSidebar">
            <Activity :size="20" class="menu-icon" /> Signes Vitaux
          </RouterLink>
          <RouterLink :to="{name:'ActivityReport', params: { id: nurseId }}" class="menu-item" @click="closeSidebar">
            <ClipboardList :size="20" class="menu-icon" /> Rapports d'Activité
          </RouterLink>

          <div class="menu-divider">Communication</div>

          <RouterLink :to="{name:'NurseProfile', params: { id: nurseId }}" class="menu-item active" @click="closeSidebar">
            <User :size="20" class="menu-icon" /> Mon Profil
          </RouterLink>
          <RouterLink :to="{name:'NoticeBoard', params: { id: nurseId }}" class="menu-item" @click="closeSidebar">
            <Bell :size="20" class="menu-icon" /> Messagerie
          </RouterLink>
          <RouterLink :to="{name:'CareNotes', params: { id: nurseId }}" class="menu-item" @click="closeSidebar">
            <FileText :size="20" class="menu-icon" /> Notes de Soin
          </RouterLink>

          <div class="menu-divider">Système</div>

          <button @click="handleLogout" class="menu-item logout-btn">
            <LogOut :size="20" class="menu-icon" /> Déconnexion
          </button>
        </nav>
      </aside>

      <!-- Mobile Toggle -->
      <button class="mobile-toggle" @click="toggleSidebar">
        {{ isSidebarOpen ? '✕' : '☰' }}
      </button>

      <div v-if="isSidebarOpen" class="sidebar-overlay" @click="isSidebarOpen = false"></div>

      <!-- Main Content -->
      <main class="admin-main">
        <div class="dashboard-admin">
          <!-- Header -->
          <header class="dashboard-header">
            <div class="header-content">
              <h1 class="dashboard-title">Mon Profil</h1>
              <p class="dashboard-subtitle">Gestion de mes informations professionnelles</p>
            </div>
            <button @click="refreshProfile" class="refresh-btn">
              <RefreshCw :size="18" />
              Actualiser
            </button>
          </header>

          <!-- Messages Feedback -->
          <TransitionGroup name="fade">
            <div v-if="loading" key="loading" class="feedback-message loading-message">
              <RefreshCw :size="20" class="spinning" />
              <span>Chargement du profil...</span>
            </div>
            <div v-if="error" key="error" class="feedback-message error-message">
              <XCircle :size="20" />
              <span>{{ error }}</span>
            </div>
            <div v-if="success" key="success" class="feedback-message success-message">
              <CheckCircle :size="20" />
              <span>{{ success }}</span>
            </div>
          </TransitionGroup>

          <!-- Profile Content -->
          <div v-if="!loading" class="profile-content">
            <!-- Profile Photo Section -->
            <section class="profile-photo-section">
              <div class="section-header">
                <h2 class="section-title"><Camera :size="20" /> Photo de Profil</h2>
              </div>
              <div class="profile-photo-card">
                <div class="photo-upload-area" @click="$refs.photoInput.click()">
                  <div class="photo-container">
                    <img :src="profilePhotoUrl" alt="Photo de profil" class="profile-photo" />
                    <div class="photo-overlay">
                      <Camera :size="24" />
                      <span>Changer la photo</span>
                    </div>
                  </div>
                </div>
                <input type="file" ref="photoInput" @change="handlePhotoChange" style="display: none;" accept="image/*" />
                <div v-if="photoFile" class="photo-actions">
                  <button @click.prevent="uploadPhoto" class="upload-btn" :disabled="uploadingPhoto">
                    <Upload :size="20" />
                    {{ uploadingPhoto ? 'Téléchargement...' : 'Télécharger Photo' }}
                  </button>
                  <button @click.prevent="cancelPhotoUpload" class="cancel-btn">
                    <X :size="20" />
                    Annuler
                  </button>
                </div>
              </div>
            </section>

            <!-- Profile Form Section -->
            <section class="profile-form-section">
              <div class="section-header">
                <h2 class="section-title"><User :size="20" /> Informations Personnelles</h2>
              </div>
              <div class="profile-form-card">
                <form @submit.prevent="saveProfile" class="profile-form">
                  <div class="form-grid">
                    <div class="form-group">
                      <label for="first_name" class="form-label">Prénom <span class="required">*</span></label>
                      <div class="input-wrapper">
                        <User :size="20" class="input-icon" />
                        <input
                          type="text"
                          id="first_name"
                          v-model="form.first_name"
                          class="form-input"
                          required
                          placeholder="Votre prénom"
                        />
                      </div>
                    </div>

                    <div class="form-group">
                      <label for="last_name" class="form-label">Nom de famille <span class="required">*</span></label>
                      <div class="input-wrapper">
                        <User :size="20" class="input-icon" />
                        <input
                          type="text"
                          id="last_name"
                          v-model="form.last_name"
                          class="form-input"
                          required
                          placeholder="Votre nom"
                        />
                      </div>
                    </div>

                    <div class="form-group">
                      <label for="email" class="form-label">Email (Identifiant)</label>
                      <div class="input-wrapper">
                        <Mail :size="20" class="input-icon" />
                        <input
                          type="email"
                          id="email"
                          :value="authStore?.user?.email || ''"
                          class="form-input"
                          disabled
                        />
                      </div>
                      <small class="input-help">L'email ne peut pas être modifié</small>
                    </div>

                    <div class="form-group">
                      <label for="birth_date" class="form-label">Date de naissance</label>
                      <div class="input-wrapper">
                        <Calendar :size="20" class="input-icon" />
                        <input
                          type="date"
                          id="birth_date"
                          v-model="form.birth_date"
                          class="form-input"
                        />
                      </div>
                    </div>

                    <div class="form-group">
                      <label for="phone" class="form-label">Téléphone</label>
                      <div class="input-wrapper">
                        <Phone :size="20" class="input-icon" />
                        <input
                          type="tel"
                          id="phone"
                          v-model="form.phone"
                          class="form-input"
                          placeholder="Votre numéro de téléphone"
                        />
                      </div>
                    </div>

                    <div class="form-group">
                      <label for="address" class="form-label">Adresse</label>
                      <div class="input-wrapper">
                        <MapPin :size="20" class="input-icon" />
                        <input
                          type="text"
                          id="address"
                          v-model="form.address"
                          class="form-input"
                          placeholder="Votre adresse"
                        />
                      </div>
                    </div>

                    <div class="form-group">
                      <label for="country" class="form-label">Pays</label>
                      <div class="input-wrapper">
                        <Globe :size="20" class="input-icon" />
                        <input
                          type="text"
                          id="country"
                          v-model="form.country"
                          class="form-input"
                          placeholder="Votre pays"
                        />
                      </div>
                    </div>

                    <div class="form-group">
                      <label for="city" class="form-label">Ville</label>
                      <div class="input-wrapper">
                        <Building :size="20" class="input-icon" />
                        <input
                          type="text"
                          id="city"
                          v-model="form.city"
                          class="form-input"
                          placeholder="Votre ville"
                        />
                      </div>
                    </div>

                    <div class="form-group">
                      <label for="specialty" class="form-label">Spécialité</label>
                      <div class="input-wrapper">
                        <Stethoscope :size="20" class="input-icon" />
                        <input
                          type="text"
                          id="specialty"
                          v-model="form.specialty"
                          class="form-input"
                          placeholder="Votre spécialité"
                        />
                      </div>
                    </div>

                    <div class="form-group">
                      <label for="status" class="form-label">Statut</label>
                      <div class="input-wrapper">
                        <Badge :size="20" class="input-icon" />
                        <select
                          id="status"
                          v-model="form.status"
                          class="form-input"
                        >
                          <option value="">Sélectionner un statut</option>
                          <option value="disponible">Disponible</option>
                          <option value="conge">En congé</option>
                          <option value="service">En service</option>
                        </select>
                      </div>
                    </div>

                    <div class="form-group">
                      <label for="language" class="form-label">Langue</label>
                      <div class="input-wrapper">
                        <Languages :size="20" class="input-icon" />
                        <select
                          id="language"
                          v-model="form.language"
                          class="form-input"
                        >
                          <option value="">Sélectionner une langue</option>
                          <option value="fr">Français</option>
                          <option value="en">English</option>
                          <option value="bm">Bambara</option>
                        </select>
                      </div>
                    </div>

                    <div class="form-group full-width">
                      <label for="bio" class="form-label">Biographie</label>
                      <div class="textarea-wrapper">
                        <FileText :size="20" class="input-icon" />
                        <textarea
                          id="bio"
                          v-model="form.bio"
                          class="form-textarea"
                          rows="4"
                          placeholder="Parlez-vous brièvement..."
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <div class="form-actions">
                    <button type="submit" :disabled="saving" class="submit-btn">
                      <Save :size="20" />
                      {{ saving ? 'Enregistrement...' : 'Enregistrer les Modifications' }}
                    </button>
                  </div>
                </form>
              </div>
            </section>

            <!-- Password Change Section -->
            <section class="password-section">
              <div class="section-header">
                <h2 class="section-title"><Lock :size="20" /> Modification du Mot de Passe</h2>
              </div>
              <div class="password-card">
                <form @submit.prevent="changePassword" class="password-form">
                  <div class="form-grid">
                    <div class="form-group">
                      <label for="current_password" class="form-label">Mot de passe actuel <span class="required">*</span></label>
                      <div class="input-wrapper">
                        <Lock :size="20" class="input-icon" />
                        <input
                          :type="showCurrentPassword ? 'text' : 'password'"
                          id="current_password"
                          v-model="passwordForm.current_password"
                          class="form-input"
                          required
                          placeholder="Entrez votre mot de passe actuel"
                        />
                        <button 
                          type="button" 
                          @click="showCurrentPassword = !showCurrentPassword" 
                          class="password-toggle"
                        >
                          <Eye :size="18" v-if="!showCurrentPassword" />
                          <EyeOff :size="18" v-else />
                        </button>
                      </div>
                    </div>

                    <div class="form-group">
                      <label for="new_password" class="form-label">Nouveau mot de passe <span class="required">*</span></label>
                      <div class="input-wrapper">
                        <Key :size="20" class="input-icon" />
                        <input
                          :type="showNewPassword ? 'text' : 'password'"
                          id="new_password"
                          v-model="passwordForm.new_password"
                          class="form-input"
                          required
                          minlength="6"
                          placeholder="Entrez votre nouveau mot de passe"
                        />
                        <button 
                          type="button" 
                          @click="showNewPassword = !showNewPassword" 
                          class="password-toggle"
                        >
                          <Eye :size="18" v-if="!showNewPassword" />
                          <EyeOff :size="18" v-else />
                        </button>
                      </div>
                    </div>

                    <div class="form-group">
                      <label for="password_confirmation" class="form-label">Confirmation du nouveau mot de passe <span class="required">*</span></label>
                      <div class="input-wrapper">
                        <Key :size="20" class="input-icon" />
                        <input
                          :type="showConfirmPassword ? 'text' : 'password'"
                          id="password_confirmation"
                          v-model="passwordForm.password_confirmation"
                          class="form-input"
                          required
                          placeholder="Confirmez votre nouveau mot de passe"
                        />
                        <button 
                          type="button" 
                          @click="showConfirmPassword = !showConfirmPassword" 
                          class="password-toggle"
                        >
                          <Eye :size="18" v-if="!showConfirmPassword" />
                          <EyeOff :size="18" v-else />
                        </button>
                      </div>
                    </div>
                  </div>

                  
                  <div class="form-actions" style="margin-top: 2rem;">
                    <button type="submit" :disabled="changingPassword || !passwordValid" class="submit-btn">
                      <Lock :size="20" />
                      {{ changingPassword ? 'Modification...' : 'Modifier le Mot de Passe' }}
                    </button>
                  </div>
                </form>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, TransitionGroup } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStores'
import {
  Users, Activity, Clock, RefreshCw, Bell, CheckCircle, XCircle, Search,
  BarChart3, User, FileText, LogOut, Heart, Thermometer, Wind, AlertTriangle,
  History, Hospital, Ruler, Beaker, Download, Save, ChevronRight, X,
  ClipboardList, Camera, Upload, Mail, Calendar, Phone, MapPin, Globe, Building,
  Stethoscope, Badge, Languages, Lock, Key, Eye, EyeOff
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref(null)
const success = ref(null)
const isSidebarOpen = ref(false)
const nurseId = computed(() => route.params.id || authStore.user?.id || '1')

// Sidebar functions
function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
    isSidebarOpen.value = false
}

// Logout function
async function handleLogout() {
    try {
        closeSidebar()
        await authStore.logout()
        router.push({ name: 'Login' })
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
    }
}

// Profile data
const form = ref({
  first_name: '',
  last_name: '',
  birth_date: '',
  phone: '',
  address: '',
  country: '',
  city: '',
  specialty: '',
  status: '',
  language: '',
  bio: ''
})

// Password form
const passwordForm = ref({
  current_password: '',
  new_password: '',
  password_confirmation: ''
})

const changingPassword = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const photoFile = ref(null)
const uploadingPhoto = ref(false)
const saving = ref(false)

const profilePhotoUrl = computed(() => {
  if (photoFile.value) {
    return URL.createObjectURL(photoFile.value)
  }
  return authStore?.user?.profile_photo || '/default-avatar.png'
})

// Password validation simplified
const passwordValid = computed(() => 
  passwordForm.value.current_password.length > 0 &&
  passwordForm.value.new_password.length >= 6 &&
  passwordForm.value.password_confirmation.length > 0 &&
  passwordForm.value.new_password === passwordForm.value.password_confirmation
)

// Functions
function refreshProfile() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

function handlePhotoChange(event) {
  const file = event.target.files[0]
  if (file) {
    photoFile.value = file
  }
}

function cancelPhotoUpload() {
  photoFile.value = null
  if (photoInput.value) {
    photoInput.value.value = ''
  }
}

async function uploadPhoto() {
  if (!photoFile.value) return
  
  try {
    uploadingPhoto.value = true
    // Simuler l'upload
    await new Promise(resolve => setTimeout(resolve, 2000))
    success.value = 'Photo téléchargée avec succès !'
    photoFile.value = null
  } catch (err) {
    error.value = 'Erreur lors du téléchargement de la photo'
  } finally {
    uploadingPhoto.value = false
  }
}

async function saveProfile() {
  try {
    saving.value = true
    error.value = null
    success.value = null

    // Simuler la sauvegarde
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    success.value = 'Profil mis à jour avec succès !'
  } catch (err) {
    error.value = 'Erreur lors de la mise à jour du profil'
    console.error(err)
  } finally {
    saving.value = false
  }
}

async function changePassword() {
  if (!passwordValid.value) {
    error.value = 'Veuillez remplir correctement tous les champs du mot de passe'
    return
  }

  changingPassword.value = true
  try {
    // Simuler l'appel API pour changer le mot de passe
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Réinitialiser le formulaire
    passwordForm.value = {
      current_password: '',
      new_password: '',
      password_confirmation: ''
    }
    
    success.value = 'Mot de passe modifié avec succès !'
  } catch (err) {
    error.value = 'Erreur lors de la modification du mot de passe'
    console.error(err)
  } finally {
    changingPassword.value = false
  }
}

onMounted(() => {
  // Charger les données du profil
  if (authStore?.user) {
    form.value = {
      first_name: authStore.user.first_name || '',
      last_name: authStore.user.last_name || '',
      birth_date: authStore.user.birth_date || '',
      phone: authStore.user.phone || '',
      address: authStore.user.address || '',
      country: authStore.user.country || '',
      city: authStore.user.city || '',
      specialty: authStore.user.specialty || '',
      status: authStore.user.status || '',
      language: authStore.user.language || '',
      bio: authStore.user.bio || ''
    }
  }
})
</script>

<style scoped>
/* Variables CSS - Design Admin */
:root {
  --primary: #2563eb;
  --primary-dark: #1d4ed8;
  --primary-light: #3b82f6;
  --secondary: #10b981;
  --secondary-dark: #059669;
  --secondary-light: #34d399;
  --accent: #8b5cf6;
  --accent-light: #a78bfa;
  --danger: #ef4444;
  --danger-light: #f87171;
  --warning: #f59e0b;
  --warning-light: #fbbf24;
  --success: #22c55e;
  --success-light: #4ade80;
  --info: #06b6d4;
  --info-light: #22d3ee;
  --dark: #0f172a;
  --darker: #020617;
  --light: #ffffff;
  --gray: #94a3b8;
  --gray-light: #cbd5e1;
  --gray-dark: #64748b;
  --border: rgba(255, 255, 255, 0.15);
  --shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 30px 60px -12px rgba(0, 0, 0, 0.5);
  --shadow-2xl: 0 40px 80px -12px rgba(0, 0, 0, 0.6);
  --radius: 16px;
  --radius-lg: 20px;
  --radius-xl: 24px;
}

/* === Layout Principal === */
.admin-page-container {
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  color: white;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

/* Animation de fond */
.admin-page-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 50%, rgba(37, 99, 235, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
  animation: floatingGradient 20s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes floatingGradient {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(-20px, -20px) rotate(120deg); }
  66% { transform: translate(20px, -10px) rotate(240deg); }
}

.admin-page-container > * {
  position: relative;
  z-index: 1;
}

.admin-layout {
  display: flex;
  height: 100vh;
  width: 100%;
}

/* === Sidebar === */
.sidebar {
  width: 280px;
  min-width: 280px;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
}

.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(37, 99, 235, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.sidebar-header {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 2;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2563eb, #10b981);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.logo-text {
  font-size: 1.2rem;
  font-weight: 800;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.logo-text span {
  color: #10b981;
}

.menu {
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
  position: relative;
  z-index: 2;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  color: rgba(255, 255, 255, 0.7);
  padding: 14px 18px;
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-weight: 600;
  position: relative;
  overflow: hidden;
}

.menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.2), transparent);
  transition: left 0.5s ease;
}

.menu-item:hover::before {
  left: 100%;
}

.menu-item:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

.menu-item.active {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.3), rgba(16, 185, 129, 0.2));
  color: white;
  transform: translateX(5px);
}

.menu-item.active .menu-icon {
  color: #3b82f6;
}

.menu-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: inherit;
  transition: all 0.3s ease;
}

.menu-item:hover .menu-icon {
  transform: scale(1.1);
}

.menu-divider {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 12px 18px 8px;
  margin-top: 8px;
}

.logout-btn {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.05));
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #f87171;
  margin-top: 1rem;
}

.logout-btn:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(245, 158, 11, 0.1));
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.logout-btn .menu-icon {
  color: inherit;
}

/* === Mobile Toggle === */
.mobile-toggle {
  display: none;
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1001;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-toggle:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.05);
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
  display: none;
}

@media (max-width: 1024px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
  
  .sidebar-overlay {
    display: block;
  }
  
  .mobile-toggle {
    display: flex;
  }
}

/* === Main Content === */
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: transparent;
}

.dashboard-admin {
  font-family: 'Inter', sans-serif;
  padding: 2rem;
  margin: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  color: white;
  box-sizing: border-box;
  position: relative;
  overflow-x: hidden;
}

/* Animation de fond */
.dashboard-admin::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at top, rgba(37, 99, 235, 0.15) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.dashboard-admin > * {
  position: relative;
  z-index: 1;
}

/* === Header === */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.6s ease-out;
  transition: all 0.3s ease;
}

.dashboard-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2563eb, #10b981);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
  z-index: 1;
}

.dashboard-header:hover::before {
  transform: scaleX(1);
}

.dashboard-header:hover {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(16, 185, 129, 0.1));
  border-color: rgba(37, 99, 235, 0.3);
  transform: translateY(-2px);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-content {
  flex: 1;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dashboard-subtitle {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 1rem;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.refresh-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-btn .spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* === Sections === */
.profile-photo-section, .profile-form-section {
  margin-bottom: 2.5rem;
  animation: fadeInUp 0.8s ease-out 0.3s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* === Cards === */
.profile-photo-card, .profile-form-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.profile-photo-card:hover, .profile-form-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

/* === Profile Photo === */
.photo-upload-area {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.photo-container {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.photo-container:hover {
  transform: scale(1.05);
}

.profile-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.photo-container:hover .photo-overlay {
  opacity: 1;
}

.photo-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.upload-btn, .cancel-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-btn {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
}

.upload-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
}

.upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

/* === Forms === */
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.required {
  color: var(--danger);
}

.input-wrapper, .textarea-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: rgba(255, 255, 255, 0.6);
  z-index: 1;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
  font-family: inherit;
}

.form-textarea {
  min-height: 100px;
}

/* Correction spécifique pour les select */
select.form-input {
  padding-left: 3rem !important;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 16 16'%3e%3cpath d='m7.247 11.14 2.963-2.963a.5.5 0 0 0-.707-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.354a.5.5 0 1 0-.707.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.707-.707L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.354a.5.5 0 1 0-.707.708l3 3a.5.5 0 0 0 .708 0z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1rem;
  padding-right: 2.5rem !important;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(37, 99, 235, 0.5);
  box-shadow: 0 0 20px rgba(37, 99, 235, 0.2);
}

.form-input::placeholder, .form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Style spécifique pour les éléments select */
.form-input[type="text"]:not([disabled]),
.form-input:not([type]):not([disabled]) {
  padding-left: 3rem !important;
}

/* S'assurer que les select ont le bon padding */
select.form-input {
  padding-left: 3rem !important;
  text-indent: 0;
}

.input-help {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.25rem;
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
  z-index: 2;
}

.password-toggle:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.1);
}

.form-actions {
  display: flex;
  justify-content: center;
}

.submit-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* === Feedback Messages === */
.feedback-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  font-weight: 500;
  animation: slideDown 0.3s ease-out;
}

.loading-message {
  background: rgba(37, 99, 235, 0.1);
  border: 1px solid rgba(37, 99, 235, 0.2);
  color: var(--primary);
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: var(--danger);
}

.success-message {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  color: var(--success);
}

/* === Mobile === */
@media (max-width: 768px) {
  .dashboard-admin {
    padding: 1rem;
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .photo-container {
    width: 120px;
    height: 120px;
  }
  
  .photo-actions {
    flex-direction: column;
  }
  
  .submit-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
