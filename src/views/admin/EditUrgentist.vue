<template>
  <div class="admin-page-container">
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside :class="['sidebar', { 'open': isSidebarOpen }]">
        <div class="sidebar-header">
          <div class="logo-icon">S</div>
          <div class="logo-text">SanTeKo <span>Admin</span></div>
        </div>

        <nav class="menu">
          <RouterLink :to="{name:'AdminDashboard'}" class="menu-item" @click="closeSidebar">
            <BarChart3 :size="20" class="menu-icon" /> Dashboard
          </RouterLink>
          
          <div class="menu-divider">Gestion & Outils</div>
          
          <RouterLink :to="{name:'Service'}" class="menu-item" @click="closeSidebar">
            <Activity :size="20" class="menu-icon" /> Gestion Services
          </RouterLink>
          <RouterLink :to="{name:'AddRole'}" class="menu-item" @click="closeSidebar">
            <Users :size="20" class="menu-icon" /> Rôles & Accès
          </RouterLink>
          <RouterLink :to="{name:'Statistique'}" class="menu-item" @click="closeSidebar">
            <TrendingUp :size="20" class="menu-icon" /> Statistiques
          </RouterLink>

          <div class="menu-divider">Communication</div>

          <RouterLink :to="{name:'Dialogue'}" class="menu-item" @click="closeSidebar">
            <MessageSquare :size="20" class="menu-icon" /> Conversations
          </RouterLink>
          <RouterLink :to="{name:'Notification'}" class="menu-item" @click="closeSidebar">
            <Clock :size="20" class="menu-icon" /> Notifications
          </RouterLink>

          <div class="menu-divider">Configuration</div>

          <RouterLink :to="{name:'Settings'}" class="menu-item" @click="closeSidebar">
            <FileText :size="20" class="menu-icon" /> Paramètres
          </RouterLink>
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
              <div class="title-section">
                <div class="title-content">
                  <div class="title-with-back">
                    <button class="back-btn" @click="goBack">
                      <ArrowLeft :size="20" />
                    </button>
                    <h1 class="dashboard-title">
                      <span class="title-icon">
                        <Edit :size="24" />
                      </span>
                      Modifier le Médecin Urgentiste
                    </h1>
                  </div>
                  <p class="dashboard-subtitle" v-if="urgentistStore.currentUrgentist">
                    Édition du profil de Dr. {{ urgentistStore.currentUrgentist.user?.first_name }} {{ urgentistStore.currentUrgentist.user?.last_name }}
                  </p>
                </div>
              </div>
              <div class="header-actions">
                <button class="action-btn secondary" @click="goBack">
                  <ArrowLeft :size="16" />
                  Annuler
                </button>
              </div>
            </div>
          </header>

          <!-- Feedback Messages -->
          <div class="feedback-area">
            <div v-if="urgentistStore.loading" class="state-message loading">
              <div class="spinner"></div>
              <span>Chargement des données...</span>
            </div>
            <div v-if="urgentistStore.error && typeof urgentistStore.error === 'string'" class="state-message error">
              <AlertTriangle :size="16" />
              <span>{{ urgentistStore.error }}</span>
            </div>
            <div v-if="urgentistStore.success" class="state-message success">
              <CheckCircle :size="16" />
              <span>{{ urgentistStore.success }}</span>
            </div>
          </div>

          <!-- Form Section -->
          <div class="form-section">
            <form 
              @submit.prevent="submit" 
              v-if="!urgentistStore.loading && urgentistStore.currentUrgentist"
              class="urgentist-form"
            >
              <!-- Personal Information -->
              <div class="form-group">
                <h3 class="section-title">
                  <User :size="20" />
                  Informations Personnelles
                </h3>
                
                <div class="form-row">
                  <div class="form-field">
                    <label>Prénom</label>
                    <input 
                      v-model="form.first_name" 
                      type="text" 
                      placeholder="Prénom" 
                      class="form-input"
                      :class="{ 'input-error': errors.first_name }" 
                    />
                    <span v-if="errors.first_name" class="error-text">
                      {{ errors.first_name[0] }}
                    </span>
                  </div>
                  <div class="form-field">
                    <label>Nom</label>
                    <input 
                      v-model="form.last_name" 
                      type="text" 
                      placeholder="Nom" 
                      class="form-input"
                      :class="{ 'input-error': errors.last_name }" 
                    />
                    <span v-if="errors.last_name" class="error-text">
                      {{ errors.last_name[0] }}
                    </span>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label>Email professionnel</label>
                    <input 
                      v-model="form.email" 
                      type="email" 
                      placeholder="email@exemple.com" 
                      class="form-input"
                      :class="{ 'input-error': errors.email }" 
                    />
                    <span v-if="errors.email" class="error-text">
                      {{ errors.email[0] }}
                    </span>
                  </div>
                  <div class="form-field">
                    <label>Téléphone</label>
                    <input 
                      v-model="form.phone" 
                      type="text" 
                      placeholder="Numéro de téléphone" 
                      class="form-input"
                      :class="{ 'input-error': errors.phone }" 
                    />
                    <span v-if="errors.phone" class="error-text">
                      {{ errors.phone[0] }}
                    </span>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label>Ville</label>
                    <input v-model="form.city" type="text" placeholder="Ville" class="form-input" />
                  </div>
                  <div class="form-field">
                    <label>Pays</label>
                    <input v-model="form.country" type="text" placeholder="Pays" class="form-input" />
                  </div>
                </div>
              </div>

              <!-- Professional Information -->
              <div class="form-group">
                <h3 class="section-title">
                  <Activity :size="20" />
                  Informations Professionnelles
                </h3>
                
                <div class="form-row">
                  <div class="form-field">
                    <label>Spécialité</label>
                    <input 
                      v-model="form.speciality" 
                      type="text" 
                      placeholder="Ex: Traumatologie" 
                      class="form-input"
                      :class="{ 'input-error': errors.speciality }" 
                    />
                    <span v-if="errors.speciality" class="error-text">
                      {{ errors.speciality[0] }}
                    </span>
                  </div>
                  <div class="form-field">
                    <label>Localisation (Service/Bloc)</label>
                    <input 
                      v-model="form.location" 
                      type="text" 
                      placeholder="Ex: Aile Nord, Box 4" 
                      class="form-input"
                    />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label>Statut de disponibilité</label>
                    <select v-model="form.status" class="form-select">
                      <option value="available"> Disponible</option>
                      <option value="on_duty"> En service</option>
                      <option value="off_duty"> Hors service</option>
                      <option value="suspended"> Suspendu</option>
                    </select>
                    <span v-if="errors.status" class="error-text">
                      {{ errors.status[0] }}
                    </span>
                  </div>
                  <div class="form-field">
                    <label>Photo de profil (Optionnel)</label>
                    <div class="file-upload">
                      <input 
                        type="file" 
                        @change="handlePhoto" 
                        id="photo-upload" 
                        accept="image/*" 
                        class="file-input"
                      />
                      <label for="photo-upload" class="file-label">
                        <Upload :size="16" class="upload-icon" />
                        {{ form.profile_photo ? 'Fichier sélectionné' : 'Changer la photo' }}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Form Actions -->
              <div class="form-actions">
                <button type="button" class="action-btn secondary" @click="goBack">
                  <ArrowLeft :size="16" />
                  Annuler
                </button>
                <button type="submit" class="action-btn primary" :disabled="urgentistStore.loading">
                  <div class="spinner" v-if="urgentistStore.loading"></div>
                  <Edit :size="16" v-else />
                  {{ urgentistStore.loading ? 'Enregistrement...' : 'Enregistrer les modifications' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUrgentistStore } from '@/stores/urgentistStore';
import { 
  BarChart3, 
  Users, 
  Activity, 
  MessageSquare, 
  Clock,
  TrendingUp,
  FileText,
  ArrowLeft,
  Edit,
  User,
  Upload,
  AlertTriangle,
  CheckCircle
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const urgentistStore = useUrgentistStore();
const isSidebarOpen = ref(false)

// Fonctions sidebar
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  if (window.innerWidth <= 1024) {
    isSidebarOpen.value = false
  }
}

const goBack = () => {
  window.history.back()
}

const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  city: '',
  country: '',
  profile_photo: null,
  speciality: '',
  location: '',
  status: 'available'
})

const errors = ref({})

const handlePhoto = (e) => {
  form.profile_photo = e.target.files[0]
}

const submit = async () => {
  errors.value = {}
  const data = new FormData()
  
  Object.keys(form).forEach(k => {
    if (form[k] !== null && form[k] !== '') {
      data.append(k, form[k])
    }
  })
  // Pour Laravel/Symfony, on simule un PUT via POST avec _method
  data.append('_method', 'PUT')

  try {
    await urgentistStore.updateUrgentist(route.params.id, data)

    if (urgentistStore.error && typeof urgentistStore.error === 'object') {
      errors.value = urgentistStore.error.errors || {}
    } else if (!urgentistStore.error) {
      alert('Profil mis à jour avec succès !')
      router.push({ name: 'Urgence' })
    }
  } catch (error) {
    if (error.errors) errors.value = error.errors;
  }
}

onMounted(() => {
  urgentistStore.fetchUrgentist(route.params.id) 
})

watch(() => urgentistStore.currentUrgentist, (newUrgentist) => {
  if (newUrgentist && newUrgentist.user) {
    Object.assign(form, {
      first_name: newUrgentist.user.first_name ?? '',
      last_name: newUrgentist.user.last_name ?? '',
      email: newUrgentist.user.email ?? '',
      phone: newUrgentist.user.phone ?? '',
      city: newUrgentist.user.city ?? '',
      country: newUrgentist.user.country ?? '',
      speciality: newUrgentist.speciality ?? '',
      location: newUrgentist.location ?? '',
      status: newUrgentist.status ?? 'available',
    })
  }
}, { immediate: true })
</script>

<style scoped>
/* Layout Container */
.admin-page-container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  overflow: hidden;
  position: relative;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
}

.admin-layout {
  display: flex;
  height: 100%;
  position: relative;
}

/* Animation de fond */
.admin-page-container::before {
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

.admin-layout > * {
  position: relative;
  z-index: 1;
}

/* === Sidebar === */
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  color: white;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  flex-shrink: 0;
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
  padding: 2rem 1.5rem;
  font-size: 1.8rem;
  font-weight: 900;
  background: linear-gradient(135deg, #2563eb, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  position: relative;
  z-index: 2;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
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
  font-size: 1.8rem;
  font-weight: 900;
  background: linear-gradient(135deg, #2563eb, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-text span {
  background: linear-gradient(135deg, #2563eb, #10b981);
  color: white;
  font-size: 0.6rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
  margin-left: 8px;
}

.menu {
  flex: 1;
  padding: 1.5rem 1rem;
  position: relative;
  z-index: 2;
  overflow-y: auto;
}

.menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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

.menu-divider {
  padding: 0.5rem 1.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 1rem 0;
}

/* Mobile Toggle */
.mobile-toggle {
  display: none;
  position: fixed;
  top: 15px;
  right: 15px;
  z-index: 1100;
  background: #0f1e46;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-toggle:hover {
  background: #1e2b5c;
  transform: translateY(-2px);
}

/* Main Content */
.admin-main {
  flex: 1;
  height: 100vh;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
}

.dashboard-admin {
  font-family: 'Inter', sans-serif;
  padding: 2rem;
  margin: 0;
  width: 100%;
  min-height: 100%;
  background: transparent;
  color: white;
  box-sizing: border-box;
  position: relative;
  overflow-x: hidden;
}

/* Sidebar Overlay */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
  display: none;
}

@media (max-width: 1024px) {
  .sidebar-overlay {
    display: block;
  }
}

/* === Header === */
.dashboard-header {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
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
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(37, 99, 235, 0.3);
  transform: translateY(-2px);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  position: relative;
  z-index: 2;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.title-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.dashboard-title {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dashboard-subtitle {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
  flex-wrap: wrap;
  align-self: flex-start;
  margin-top: 0.5rem;
}

.title-icon {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  padding: 12px;
  border-radius: 14px;
  box-shadow: var(--shadow-lg);
  animation: pulse 2s infinite;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

/* === Back Button === */
.title-with-back {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(37, 99, 235, 0.4);
  transform: translateY(-2px);
}

.back-btn svg {
  transition: transform 0.3s ease;
}

.back-btn:hover svg {
  transform: translateX(-2px);
}

/* === States === */
.state-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  font-weight: 500;
  font-size: 0.9rem;
}

.state-message.loading {
  background: rgba(37, 99, 235, 0.1);
  color: rgba(37, 99, 235, 0.9);
  border: 1px solid rgba(37, 99, 235, 0.2);
}

.state-message.error {
  background: rgba(239, 68, 68, 0.1);
  color: rgba(239, 68, 68, 0.9);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.state-message.success {
  background: rgba(16, 185, 129, 0.1);
  color: rgba(16, 185, 129, 0.9);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* === Form Section === */
.form-section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 2rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.form-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
  z-index: 1;
}

.form-section:hover::before {
  transform: scaleX(1);
}

.form-section:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(37, 99, 235, 0.4);
}

/* === Form Groups === */
.form-group {
  margin-bottom: 4rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 2;
}

.section-title svg {
  color: var(--primary);
  flex-shrink: 0;
}

/* === Form Layout === */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 3.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-field label {
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.form-input, .form-select {
  padding: 1rem 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  min-height: 48px;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: rgba(37, 99, 235, 0.5);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-select option {
  background: #1e293b;
  color: white;
}

.input-error {
  border-color: rgba(239, 68, 68, 0.5) !important;
  background: rgba(239, 68, 68, 0.05) !important;
}

.error-text {
  color: rgba(239, 68, 68, 0.9);
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 0.25rem;
}

/* === File Upload === */
.file-upload {
  position: relative;
}

.file-input {
  display: none;
}

.file-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.file-label:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(37, 99, 235, 0.5);
  color: white;
}

.upload-icon {
  flex-shrink: 0;
}

/* === Form Actions === */
.form-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 140px;
  min-height: 44px;
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.action-btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* === Responsive Design === */
@media (max-width: 1024px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    transform: translateX(-100%);
    z-index: 1000;
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
  
  .mobile-toggle {
    display: block;
  }
}

@media (max-width: 768px) {
  .dashboard-admin {
    padding: 1rem;
  }
  
  .dashboard-header {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .title-section {
    flex-direction: column;
    text-align: center;
  }
  
  .dashboard-title {
    font-size: 1.4rem;
  }
  
  .form-section {
    padding: 1.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .form-field.full-width {
    grid-column: span 1;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .action-btn {
    width: 100%;
    min-width: auto;
  }
}

/* === Variables === */
:root {
  --primary: #2563eb;
  --secondary: #10b981;
  --light: #f8fafc;
  --dark: #0f172a;
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
</style>