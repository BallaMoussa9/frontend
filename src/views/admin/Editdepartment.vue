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
                      Modifier le Service
                    </h1>
                  </div>
                  <p class="dashboard-subtitle" v-if="!loading">
                    Édition du département : {{ form.name }}
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

          <!-- Loading State -->
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Chargement des données du service...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="error-state">
            <div class="error-icon">
              <AlertTriangle :size="48" />
            </div>
            <p>{{ error }}</p>
            <button @click="router.push({ name: 'Department' })" class="action-btn primary">
              <ArrowLeft :size="16" />
              Retour à la liste
            </button>
          </div>

          <!-- Form Section -->
          <div class="form-section" v-else>
            <form @submit.prevent="submit" class="department-form">
              <!-- Service Information -->
              <div class="form-group">
                <h3 class="section-title">
                  <Activity :size="20" />
                  Informations Générales
                </h3>
                
                <div class="form-row">
                  <div class="form-field">
                    <label>Nom du service</label>
                    <input 
                      v-model="form.name" 
                      type="text" 
                      placeholder="Ex: Cardiologie" 
                      class="form-input"
                      required 
                    />
                  </div>
                  <div class="form-field">
                    <label>État du service</label>
                    <select v-model="form.status" class="form-select">
                      <option value="active"> Actif</option>
                      <option value="inactive"> Inactif</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Location Details -->
              <div class="form-group">
                <h3 class="section-title">
                  <MapPin :size="20" />
                  Localisation et Description
                </h3>
                
                <div class="form-field full-width">
                  <label>Position / Spécialité associée</label>
                  <input 
                    v-model="form.position" 
                    type="text" 
                    placeholder="Ex: Médecine Interne - Bloc B" 
                    class="form-input"
                  />
                </div>

                <div class="form-field full-width margin-top-field">
                  <label>Description du service</label>
                  <textarea 
                    v-model="form.description" 
                    placeholder="Description brève des activités du service..."
                    class="form-textarea"
                    rows="4"
                  ></textarea>
                </div>
              </div>

              <!-- Responsible Assignment -->
              <div class="form-group">
                <h3 class="section-title">
                  <User :size="20" />
                  Assignation du Responsable
                </h3>
                
                <div class="form-field full-width margin-top-field">
                  <label for="user-select">Médecin Responsable</label>
                  <select 
                    id="user-select" 
                    v-model="form.responsible_user_id"
                    class="form-select large-field"
                  >
                    <option :value="null">Aucun responsable assigné</option>
                    <option
                      v-for="user in userStore.responsibleUsers"
                      :key="user.id"
                      :value="user.id"
                    >
                      Dr. {{ user.first_name }} {{ user.last_name }} ({{ user.role }})
                    </option>
                  </select>
                </div>
              </div>

              <!-- Form Actions -->
              <div class="form-actions">
                <button type="button" class="action-btn secondary" @click="goBack">
                  <ArrowLeft :size="16" />
                  Annuler
                </button>
                <button type="submit" class="action-btn primary" :disabled="departmentStore.loading">
                  <div class="spinner" v-if="departmentStore.loading"></div>
                  <Save :size="16" v-else />
                  {{ departmentStore.loading ? 'Mise à jour en cours...' : 'Mettre à jour le service' }}
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
import { ref, reactive, onMounted } from 'vue' 
import { useRouter, useRoute } from 'vue-router'
import { useDepartmentStore } from '@/stores/departmentStore'
import { useUserStore } from '@/stores/userStore' 
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
  Save,
  User,
  MapPin,
  AlertTriangle
} from 'lucide-vue-next';

const router = useRouter()
const route = useRoute() 
const departmentStore = useDepartmentStore()
const userStore = useUserStore()
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

const loading = ref(true) 
const error = ref(null) 

const form = reactive({
  name: '',
  description: '',
  position: '',
  status: 'active',
  responsible_user_id: null 
})

onMounted(async () => {
  const departmentId = route.params.id

  try {
    // 1. Charger les utilisateurs éligibles au rôle de responsable
    await userStore.fetchResponsibleUsers()

    // 2. Charger les données du département
    const department = await departmentStore.fetchDepartmentById(departmentId)

    if (department) {
      form.name = department.name
      form.description = department.description
      form.position = department.position
      form.status = department.status
      form.responsible_user_id = department.user_id || null 
    } else {
      error.value = 'Service introuvable.'
    }
  } catch (err) {
    error.value = 'Erreur lors de la récupération des données.'
    console.error(err)
  } finally {
    loading.value = false
  }
})

const submit = async () => {
  const departmentId = route.params.id
  try {
    await departmentStore.updateDepartment(departmentId, form) 
    alert('Le service a été mis à jour avec succès !')
    router.push({ name: 'Department' }) 
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message
    alert('Erreur : ' + errorMsg)
  }
}
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
  gap: 0.65rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  color: rgba(255, 255, 255, 0.7);
  padding: 15px 19px;
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
  margin: 1.2rem 0 0.8rem 0;
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
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
}

.error-icon {
  color: rgba(239, 68, 68, 0.8);
  margin-bottom: 1rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
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

.form-input, .form-select, .form-textarea {
  padding: 1rem 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  min-height: 48px;
}

/* Champs agrandis spécifiques */
.form-select.large-field {
  padding: 1.25rem 1.5rem;
  font-size: 1rem;
  min-height: 56px;
}

.form-input::placeholder, .form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: rgba(37, 99, 235, 0.5);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-select option {
  background: #1e293b;
  color: white;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

/* Margin top pour certains champs */
.margin-top-field {
  margin-top: 2rem;
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