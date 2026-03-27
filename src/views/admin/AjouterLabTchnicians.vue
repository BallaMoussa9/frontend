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
                  <h1 class="dashboard-title">
                    <span class="title-icon">
                      <Plus :size="24" />
                    </span>
                    Ajouter un Technicien
                  </h1>
                  <p class="dashboard-subtitle">
                    Créez un nouveau compte pour le technicien de laboratoire
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
          <div v-if="labTechnicianStore.loading || departmentStore.loading || laboratoryStore.loading" class="loading-state">
            <div class="spinner"></div>
            <p>Chargement des données...</p>
          </div>
          
          <!-- Error State -->
          <div v-else-if="labTechnicianStore.error || departmentStore.error || laboratoryStore.error" class="error-state">
            <div class="error-icon">
              <AlertTriangle :size="48" />
            </div>
            <p v-if="labTechnicianStore.error">Erreur du technicien: <strong>{{ labTechnicianStore.error }}</strong></p>
            <p v-if="departmentStore.error">Erreur des départements: <strong>{{ departmentStore.error }}</strong></p>
            <p v-if="laboratoryStore.error">Erreur des laboratoires: <strong>{{ laboratoryStore.error }}</strong></p>
          </div>

          <!-- Form Errors -->
          <div v-else-if="formErrors.length" class="error-state">
            <div class="error-icon">
              <AlertTriangle :size="48" />
            </div>
            <ul>
              <li v-for="error in formErrors" :key="error">{{ error }}</li>
            </ul>
          </div>

          <!-- Form Section -->
          <div class="form-section" v-if="!labTechnicianStore.loading && !departmentStore.loading && !laboratoryStore.loading && !labTechnicianStore.error && !departmentStore.error && !laboratoryStore.error && formErrors.length === 0">
            <form @submit.prevent="submitForm" enctype="multipart/form-data" class="lab-technician-form">

        <!-- Form Groups -->
              <div class="form-group">
                <h3 class="section-title">
                  <User :size="20" />
                  Informations générales
                </h3>
                
                <div class="form-row">
                  <div class="form-field">
                    <label>Prénom</label>
                    <input v-model="form.first_name" type="text" placeholder="Prénom" required class="form-input" />
                  </div>
                  <div class="form-field">
                    <label>Nom</label>
                    <input v-model="form.last_name" type="text" placeholder="Nom" required class="form-input" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label>Date de naissance</label>
                    <input v-model="form.birth_date" type="date" placeholder="Date de naissance" class="form-input" />
                  </div>
                  <div class="form-field">
                    <label>Téléphone</label>
                    <input v-model="form.phone" type="text" placeholder="Téléphone" class="form-input" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field email-field">
                    <label>Email</label>
                    <input v-model="form.email" type="email" placeholder="Adresse email" required class="form-input" />
                  </div>
                  <div class="form-field password-field">
                    <label>Mot de passe</label>
                    <input v-model="form.password" type="password" placeholder="Mot de passe" required class="form-input" />
                  </div>
                </div>

                <div class="form-field full-width">
                  <label>Confirmer le mot de passe</label>
                  <input v-model="form.password_confirmation" type="password" placeholder="Confirmer le mot de passe" required class="form-input" />
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label>Ville</label>
                    <input v-model="form.city" type="text" placeholder="Ville" class="form-input" />
                  </div>
                  <div class="form-field">
                    <label>Pays</label>
                    <select v-model="form.country" class="form-select">
                      <option value="" disabled>-- Sélectionner --</option>
                      <option v-for="c in countries" :key="c" :value="c">{{ c }}</option>
                    </select>
                  </div>
                </div>

                <div class="form-field full-width address-field">
                  <label>Adresse</label>
                  <input v-model="form.address" type="text" placeholder="Adresse complète" class="form-input" />
                </div>
              </div>

              <div class="form-group">
                <h3 class="section-title">
                  <Activity :size="20" />
                  Détails professionnels
                </h3>
                
                <div class="form-row">
                  <div class="form-field">
                    <label>Laboratoire</label>
                    <select v-model="form.laboratory_id" class="form-select" required>
                      <option value="" disabled>-- Sélectionner --</option>
                      <option v-for="lab in laboratoryStore.laboratories" :key="lab.id" :value="lab.id">
                        {{ lab.name }}
                      </option>
                    </select>
                  </div>
                  <div class="form-field">
                    <label>Spécialité</label>
                    <input v-model="form.speciality" type="text" placeholder="Spécialité (ex: Microbiologie)" class="form-input" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label>Qualification</label>
                    <input v-model="form.qualification" type="text" placeholder="Qualification (ex: Licence en analyses biomédicales)" class="form-input" />
                  </div>
                  <div class="form-field">
                    <label>Département</label>
                    <select v-model="form.department_id" class="form-select">
                      <option value="" disabled>-- Sélectionner --</option>
                      <option v-for="dept in departmentStore.departments" :key="dept.id" :value="dept.id">
                        {{ dept.name }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label>Statut</label>
                    <select v-model="form.status" class="form-select">
                      <option value="active">Actif</option>
                      <option value="on_leave">En congé</option>
                      <option value="resigned">Démissionnaire</option>
                      <option value="suspended">Suspendu</option>
                    </select>
                  </div>
                  <div class="form-field">
                    <label>&nbsp;</label>
                    <div class="field-placeholder"></div>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <h3 class="section-title">
                  <Camera :size="20" />
                  Photo de profil
                </h3>
                
                <div class="photo-upload-section">
                  <div class="photo-upload-area" @click="triggerFileInput">
                    <input 
                      type="file" 
                      @change="handleFileUpload" 
                      ref="fileInput" 
                      id="profile_photo"
                      accept="image/*" 
                      style="display: none"
                    />
                    <div v-if="!imagePreview" class="upload-placeholder">
                      <Camera :size="48" class="upload-icon" />
                      <p>Cliquez pour télécharger une photo</p>
                      <span class="upload-hint">PNG, JPG jusqu'à 5MB</span>
                    </div>
                    <div v-else class="photo-preview">
                      <img :src="imagePreview" alt="Photo de profil" class="preview-image" />
                      <button type="button" @click.stop="removePhoto" class="remove-photo-btn">
                        <X :size="16" />
                      </button>
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
                <button type="submit" class="action-btn primary" :disabled="labTechnicianStore.loading">
                  <Save :size="16" />
                  {{ labTechnicianStore.loading ? 'Ajout en cours...' : 'Ajouter le technicien' }}
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
import { useRouter } from 'vue-router'
import { useLabTechnicianStore } from '@/stores/labTechnicianStore'
import { useDepartmentStore } from '@/stores/departmentStore'
import { useLaboratoryStore } from '@/stores/laboratoryStore'
import { 
  BarChart3, 
  Users, 
  Activity, 
  MessageSquare, 
  Clock,
  TrendingUp,
  FileText,
  Plus,
  ArrowLeft,
  AlertTriangle,
  User,
  Camera,
  X,
  Save
} from 'lucide-vue-next';

const router = useRouter()
const labTechnicianStore = useLabTechnicianStore()
const departmentStore = useDepartmentStore()
const laboratoryStore = useLaboratoryStore()

// Variables pour le design moderne
const isSidebarOpen = ref(false)
const imagePreview = ref(null)
const fileInput = ref(null)
const countries = ['Mali', 'France', 'Sénégal', 'Côte d\'Ivoire', 'Belgique']
const formErrors = ref([])

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
  try {
    router.push({ name: 'Laboratoire' })
  } catch (error) {
    console.error('Erreur de navigation:', error)
    // Fallback: utiliser window.history.back()
    window.history.back()
  }
}

// Fonctions photo
const triggerFileInput = () => {
  fileInput.value.click()
}

const form = reactive({
  first_name: '',
  last_name: '',
  birth_date: null,
  phone: '',
  country: '',
  city: '',
  profile_photo: null,
  status: 'active',
  address: '',
  email: '',
  password: '',
  password_confirmation: '',
  department_id: null,

  // Champs spécifiques au LabTechnician
  laboratory_id: null, // Initialisé à null pour la sélection
  speciality: '',
  qualification: '',
});

const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    form.profile_photo = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};

const removePhoto = () => {
  form.profile_photo = null;
  imagePreview.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

const submitForm = async () => {
  formErrors.value = [];
  labTechnicianStore.resetFeedback();

  const formData = new FormData();
  for (const key in form) {
    if (form[key] !== null && form[key] !== '') {
        formData.append(key, form[key]);
    }
  }

  // Le rôle_id est requis par votre backend, mais n'est pas dans le formulaire.
  // Ajoutez-le manuellement avec une valeur par défaut ou un champ caché.
  // Par exemple, si l'ID pour un technicien est '3'.
  formData.append('role_id', 3);

  try {
    await labTechnicianStore.createLabTechnician(formData);
    alert(labTechnicianStore.success);
    router.push({ name: 'Laboratoire' });
  } catch (error) {
    console.error('Erreur lors de la création du technicien:', error);
    if (error.response && error.response.data && error.response.data.errors) {
      for (const key in error.response.data.errors) {
        formErrors.value.push(error.response.data.errors[key][0]);
      }
    } else {
      formErrors.value.push(labTechnicianStore.error || 'Une erreur inattendue est survenue.');
    }
  }
};

// Charger les données nécessaires au montage du composant
onMounted(() => {
  departmentStore.fetchDepartments();
  laboratoryStore.fetchAllLaboratories(); // Appel à la méthode du store des laboratoires
});
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

/* === States === */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: var(--light);
  opacity: 0.8;
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

.error-state {
  color: #ef4444;
}

.error-state ul {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0 0;
}

.error-state li {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
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

/* Espacement spécifique pour certains champs */
.address-field {
  margin-top: 1.5rem;
}

.email-field {
  margin-top: 1.5rem;
}

.password-field {
  margin-top: 1.5rem;
}

.form-field label {
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.form-input, .form-select, .form-textarea {
  padding: 0.875rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 0.9rem;
  transition: all 0.3s ease;
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

/* === Photo Upload === */
.photo-upload-section {
  margin-top: 1rem;
}

.photo-upload-area {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 150px;
}

.photo-upload-area:hover {
  border-color: rgba(37, 99, 235, 0.5);
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.upload-icon {
  color: rgba(255, 255, 255, 0.6);
}

.upload-placeholder p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-weight: 500;
}

.upload-hint {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
}

.photo-preview {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  object-fit: cover;
  border: 3px solid rgba(37, 99, 235, 0.3);
}

.remove-photo-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.9);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.remove-photo-btn:hover {
  background: rgba(239, 68, 68, 1);
  transform: scale(1.1);
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

.field-placeholder {
  height: 42px;
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
