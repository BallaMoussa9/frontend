<template>
  <AppLayout>
    <div class="profile-page">
      <div class="profile-container">
        <!-- Header -->
        <header class="profile-header">
          <div class="header-content">
            <div class="header-left">
              <button @click="$router.back()" class="back-btn" title="Retour">
                <ArrowLeft :size="20" />
              </button>
              <div class="header-icon">
                <User :size="28" />
              </div>
              <div class="header-text">
                <h1>Mon Profil</h1>
                <p>Gérez vos informations personnelles et accédez à votre espace</p>
              </div>
            </div>
            <div class="header-actions">
              <button class="space-access-btn" @click="goToPersonalSpace">
                <LayoutDashboard :size="20" />
                Mon Espace Personnel
              </button>
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main class="profile-main">
          <div class="profile-grid">
            <!-- Profile Sidebar -->
            <aside class="profile-sidebar">
              <div class="profile-card">
                <div class="avatar-section">
                  <div class="avatar-container">
                    <img 
                      :src="auth.user?.profile_photo ? `http://localhost/storage/${auth.user.profile_photo}` : '/default-avatar.png'" 
                      class="profile-avatar"
                      :alt="fullName"
                    />
                    <label for="upload-photo" class="upload-btn">
                      <Camera :size="16" />
                      <input type="file" id="upload-photo" @change="updatePhoto" hidden />
                    </label>
                  </div>
                  <div class="profile-info">
                    <h2 class="profile-name">{{ fullName }}</h2>
                    <div class="role-badge">
                      <Shield :size="14" />
                      <span>{{ getRoleDisplay(auth.user?.role_name) }}</span>
                    </div>
                  </div>
                </div>

                <div class="contact-section">
                  <h3 class="section-title">Coordonnées</h3>
                  <div class="contact-list">
                    <div class="contact-item">
                      <div class="contact-icon">
                        <Mail :size="16" />
                      </div>
                      <div class="contact-content">
                        <label>Email</label>
                        <p>{{ auth.user?.email }}</p>
                      </div>
                    </div>
                    <div class="contact-item">
                      <div class="contact-icon">
                        <Phone :size="16" />
                      </div>
                      <div class="contact-content">
                        <label>Téléphone</label>
                        <p>{{ auth.user?.phone || 'Non renseigné' }}</p>
                      </div>
                    </div>
                    <div class="contact-item">
                      <div class="contact-icon">
                        <MapPin :size="16" />
                      </div>
                      <div class="contact-content">
                        <label>Localisation</label>
                        <p>{{ auth.user?.city }}, {{ auth.user?.country }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <!-- Main Content Area -->
            <div class="profile-content">
              <!-- Personal Information -->
              <section class="info-card">
                <div class="card-header">
                  <div class="card-title">
                    <div class="title-icon">
                      <User :size="20" />
                    </div>
                    <div>
                      <h3>Informations Personnelles</h3>
                      <p>Détails de votre profil</p>
                    </div>
                  </div>
                  <button class="edit-profile-btn" @click="editProfile">
                    <Edit :size="16" />
                    Modifier
                  </button>
                </div>
                <div class="info-grid">
                  <div class="info-item">
                    <label>Prénom</label>
                    <p>{{ auth.user?.first_name || 'Non renseigné' }}</p>
                  </div>
                  <div class="info-item">
                    <label>Nom</label>
                    <p>{{ auth.user?.last_name || 'Non renseigné' }}</p>
                  </div>
                  <div class="info-item">
                    <label>Date de naissance</label>
                    <p>{{ formatDate(auth.user?.birth_date) }}</p>
                  </div>
                  <div class="info-item">
                    <label>Adresse</label>
                    <p>{{ auth.user?.address || 'Non renseignée' }}</p>
                  </div>
                </div>
              </section>

              <!-- Profile Completion -->
              <section class="completion-card">
                <div class="completion-header">
                  <div class="completion-title">
                    <div class="title-icon">
                      <Target :size="20" />
                    </div>
                    <div style="margin-top: 1rem;">
                      <h3>Complétion du Profil</h3>
                      <p class="completion-description">Un profil complet permet une meilleure expérience</p>
                    </div>
                  </div>
                </div>
                <div class="completion-content">
                  <div class="progress-circle">
                    <svg viewBox="0 0 36 36" class="circular-chart">
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#10b981;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <path class="circle-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path class="circle"
                        :stroke-dasharray="`${completion}, 100`"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div class="percentage">{{ completion }}%</div>
                  </div>
                  <div class="completion-details">
                    <div class="completion-status">
                      <span :class="['status-badge', getStatusClass(completion)]">
                        {{ getStatusText(completion) }}
                      </span>
                    </div>
                    <p class="completion-message">
                      {{ getCompletionMessage(completion) }}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '../stores/authStores'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import {
  User,
  LayoutDashboard,
  Camera,
  Shield,
  Mail,
  Phone,
  MapPin,
  Edit,
  Target,
  Zap,
  Settings,
  ArrowLeft
} from 'lucide-vue-next'

const auth = useAuthStore()
const router = useRouter()

const fullName = computed(() => auth.fullName)

const completion = computed(() => {
  let total = 0
  const fields = ['first_name', 'last_name', 'email', 'birth_date', 'phone', 'city', 'country', 'address']
  fields.forEach(field => {
    if (auth.user?.[field]) total += 100 / fields.length
  })
  return Math.round(total)
})

// Fonctions utilitaires
const formatDate = (dateString) => {
  if (!dateString) return 'Non renseigné'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const getRoleDisplay = (role) => {
  const roleMap = {
    'admin': 'Administrateur',
    'doctor': 'Médecin',
    'nurse': 'Infirmier',
    'patient': 'Patient',
    'urgentist': 'Urgentiste',
    'lab_technician': 'Technicien Labo'
  }
  return roleMap[role] || 'Utilisateur SanTeKo'
}

const getStatusClass = (completion) => {
  if (completion >= 80) return 'excellent'
  if (completion >= 60) return 'good'
  if (completion >= 40) return 'fair'
  return 'poor'
}

const getStatusText = (completion) => {
  if (completion >= 80) return 'Excellent'
  if (completion >= 60) return 'Bon'
  if (completion >= 40) return 'Moyen'
  return 'À compléter'
}

const getCompletionMessage = (completion) => {
  if (completion >= 80) return 'Votre profil est très bien rempli !'
  if (completion >= 60) return 'Votre profil est bien rempli.'
  if (completion >= 40) return 'Votre profil nécessite quelques informations.'
  return 'Veuillez compléter votre profil pour une meilleure expérience.'
}

// Fonctions d'action
const goToPersonalSpace = () => {
  // Redirection vers le dashboard principal selon le rôle de l'utilisateur
  const role = auth.user?.role_name
  switch (role) {
    case 'admin':
      router.push({ name: 'AdminDashboard' })
      break
    case 'doctor':
      router.push({ name: 'DoctorDashboard' })
      break
    case 'patient':
      router.push({ name: 'PatientDashboardView' })
      break
    case 'nurse':
      router.push({ name: 'NurseDashboardView' })
      break
    case 'urgentist':
      router.push({ name: 'UrgentistDashboardView' })
      break
    case 'lab_technician':
      router.push({ name: 'LabDashboard' })
      break
    default:
      router.push({ name: 'AcceuilView' })
  }
}

const editProfile = () => {
  alert('La fonction d\'édition du profil sera bientôt disponible.')
}

const updatePhoto = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('profile_photo', file)

  try {
    const { data } = await axios.post('http://localhost/api/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${auth.token}`,
      },
    })
    auth.user = data.user
    localStorage.setItem('user', JSON.stringify(data.user))
  } catch (error) {
    console.error('Erreur upload:', error)
    alert('Échec de la mise à jour de la photo')
  }
}
</script>

<style scoped>
/* === Profile Page === */
.profile-page {
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  color: white;
}

.profile-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* === Header === */
.profile-header {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
}

.profile-header::before {
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
}

.profile-header:hover::before {
  transform: scaleX(1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 0.75rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 0.5rem;
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

.header-icon {
  background: linear-gradient(135deg, #2563eb, #10b981);
  padding: 1rem;
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(37, 99, 235, 0.3);
  color: white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.header-text h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #2563eb, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-text p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-size: 1rem;
}

.space-access-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #2563eb, #10b981);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.space-access-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
}

/* === Main Grid === */
.profile-main {
  margin-top: 2rem;
}

.profile-grid {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 2rem;
}

/* === Sidebar === */
.profile-sidebar {
  position: sticky;
  top: 2rem;
  height: fit-content;
}

.profile-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
  transition: all 0.3s ease;
}

.profile-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(37, 99, 235, 0.3);
  transform: translateY(-2px);
}

.avatar-section {
  text-align: center;
  margin-bottom: 2rem;
}

.avatar-container {
  position: relative;
  display: inline-block;
  margin-bottom: 1.5rem;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(37, 99, 235, 0.3);
  box-shadow: 0 8px 32px rgba(37, 99, 235, 0.2);
}

.upload-btn {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: linear-gradient(135deg, #2563eb, #10b981);
  color: white;
  border: 2px solid white;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.upload-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: white;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(37, 99, 235, 0.2);
  color: #3b82f6;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid rgba(37, 99, 235, 0.3);
}

.contact-section {
  margin-top: 2rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.contact-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(5px);
}

.contact-icon {
  background: rgba(37, 99, 235, 0.2);
  color: #3b82f6;
  padding: 0.75rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.contact-content label {
  display: block;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.contact-content p {
  margin: 0;
  color: white;
  font-weight: 500;
}

/* === Content Area === */
.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-card,
.completion-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
  transition: all 0.3s ease;
}

.info-card:hover,
.completion-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(37, 99, 235, 0.3);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-icon {
  background: linear-gradient(135deg, #2563eb, #10b981);
  padding: 0.75rem;
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.card-title h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1rem 0 0.25rem 0;
  color: white;
}

.card-title p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

.completion-description{
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.edit-profile-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-profile-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(37, 99, 235, 0.4);
  transform: translateY(-2px);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-item {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.info-item label {
  display: block;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item p {
  margin: 0;
  color: white;
  font-weight: 500;
  font-size: 1rem;
}

/* === Completion Card === */
.completion-content {
  display: flex;
  align-items: center;
  gap: 3rem;
}

.progress-circle {
  position: relative;
  width: 120px;
  height: 120px;
}

.circular-chart {
  width: 120px;
  height: 120px;
  transform: rotate(-90deg);
}

.circle-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 3;
}

.circle {
  fill: none;
  stroke: url(#gradient);
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dasharray 0.5s ease;
}

.percentage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.completion-details {
  flex: 1;
}

.status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.status-badge.excellent {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-badge.good {
  background: rgba(37, 99, 235, 0.2);
  color: #3b82f6;
  border: 1px solid rgba(37, 99, 235, 0.3);
}

.status-badge.fair {
  background: rgba(251, 191, 36, 0.2);
  color: #f59e0b;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.status-badge.poor {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.completion-message {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
}


/* === Responsive Design === */
@media (max-width: 1024px) {
  .profile-container {
    padding: 1rem;
  }
  
  .profile-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .profile-sidebar {
    position: static;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .space-access-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .profile-container {
    padding: 0.5rem;
  }
  
  .profile-header {
    padding: 1.5rem;
  }
  
  .header-text h1 {
    font-size: 1.5rem;
  }
  
  .profile-card,
  .info-card,
  .completion-card {
    padding: 1.5rem;
  }
  
  .completion-content {
    flex-direction: column;
    gap: 2rem;
    text-align: center;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}

/* === SVG Gradient === */
.circular-chart {
  filter: drop-shadow(0 4px 15px rgba(37, 99, 235, 0.3));
}
</style>
