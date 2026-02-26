<template>
  <AppLayout>
    <div class="profile-wrapper">
      <div class="header-banner">
        <h2>Mon Profil Personnel</h2>
      </div>

      <div class="profile-grid">
        <aside class="profile-sidebar">
          <div class="photo-card">
            <div class="image-container">
              <img 
                :src="auth.user?.profile_photo ? `http://localhost/storage/${auth.user.profile_photo}` : '/default-avatar.png'" 
                class="main-avatar"
              />
              <label for="upload-photo" class="upload-overlay">
                <i class="fas fa-camera"></i>
                <input type="file" id="upload-photo" @change="updatePhoto" hidden />
              </label>
            </div>
            <h3 class="user-full-name">{{ fullName }}</h3>
            <span class="role-badge">Utilisateur SanTeKo</span>
          </div>

          <div class="contact-info-list">
            <div class="info-item">
              <span class="icon">📧</span>
              <div class="text">
                <label>Email</label>
                <p>{{ auth.user?.email }}</p>
              </div>
            </div>
            <div class="info-item">
              <span class="icon">📱</span>
              <div class="text">
                <label>Téléphone</label>
                <p>{{ auth.user?.phone || 'Non renseigné' }}</p>
              </div>
            </div>
            <div class="info-item">
              <span class="icon">📍</span>
              <div class="text">
                <label>Localisation</label>
                <p>{{ auth.user?.city }}, {{ auth.user?.country }}</p>
              </div>
            </div>
          </div>
        </aside>

        <main class="profile-main-content">
          <section class="details-card">
            <div class="card-header">
              <h3><i class="fas fa-info-circle"></i> Informations personnelles</h3>
              <button class="edit-btn">Modifier</button>
            </div>
            <div class="details-grid">
              <div class="detail-box">
                <label>Prénom</label>
                <p>{{ auth.user?.first_name }}</p>
              </div>
              <div class="detail-box">
                <label>Nom</label>
                <p>{{ auth.user?.last_name }}</p>
              </div>
              <div class="detail-box">
                <label>Date de naissance</label>
                <p>{{ auth.user?.birth_date || 'N/A' }}</p>
              </div>
              <div class="detail-box">
                <label>Adresse complète</label>
                <p>{{ auth.user?.address || 'Non renseignée' }}</p>
              </div>
            </div>
          </section>

          <section class="stats-card">
            <div class="progress-info">
              <h3>Niveau de complétion</h3>
              <p>Un profil complet permet un meilleur suivi médical.</p>
            </div>
            <div class="progress-container">
              <div class="progress-circle">
                <svg viewBox="0 0 36 36" class="circular-chart">
                  <path class="circle-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path class="circle"
                    :stroke-dasharray="`${completion}, 100`"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div class="percentage">{{ completion }}%</div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '../stores/authStores'
import { computed } from 'vue'
import axios from 'axios'

const auth = useAuthStore()

const fullName = computed(() => auth.fullName)

const completion = computed(() => {
  let total = 0
  const fields = ['first_name', 'last_name', 'email', 'birth_date', 'phone', 'city', 'country', 'address']
  fields.forEach(field => {
    if (auth.user?.[field]) total += 100 / fields.length
  })
  return Math.round(total)
})

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
.profile-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: #f8fafc;
}

.header-banner {
  margin-bottom: 30px;
}

.header-banner h2 {
  color: #1e293b;
  font-size: 24px;
  font-weight: 800;
  position: relative;
  padding-left: 15px;
}

.header-banner h2::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: #3b82f6;
  border-radius: 4px;
}

/* Grille principale */
.profile-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 30px;
}

/* Sidebar Gauche */
.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.photo-card {
  background: white;
  padding: 30px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.image-container {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto 20px;
}

.main-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #f1f5f9;
}

.upload-overlay {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: #3b82f6;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 3px solid white;
  transition: 0.3s;
}

.upload-overlay:hover {
  background: #2563eb;
  transform: scale(1.1);
}

.user-full-name {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 5px;
}

.role-badge {
  font-size: 12px;
  background: #eff6ff;
  color: #3b82f6;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
}

.contact-info-list {
  background: white;
  padding: 25px;
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.info-item {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.info-item:last-child { margin-bottom: 0; }

.info-item .icon {
  width: 40px;
  height: 40px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 18px;
}

.info-item label {
  display: block;
  font-size: 11px;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 700;
}

.info-item p {
  color: #334155;
  font-weight: 600;
  font-size: 14px;
}

/* Colonne droite */
.profile-main-content {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.details-card, .stats-card {
  background: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f1f5f9;
}

.card-header h3 {
  font-size: 18px;
  color: #1e293b;
}

.edit-btn {
  background: #f1f5f9;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: 0.2s;
}

.edit-btn:hover { background: #e2e8f0; }

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
}

.detail-box label {
  display: block;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 6px;
}

.detail-box p {
  font-size: 16px;
  color: #1e293b;
  font-weight: 600;
}

/* Progression circulaire */
.stats-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-info h3 { margin-bottom: 10px; }
.progress-info p { color: #64748b; font-size: 14px; }

.progress-circle {
  position: relative;
  width: 120px;
  height: 120px;
}

.circular-chart {
  display: block;
  margin: 10px auto;
  max-width: 100%;
  max-height: 250px;
  transform: rotate(-90deg);
}

.circle-bg {
  fill: none;
  stroke: #f1f5f9;
  stroke-width: 3;
}

.circle {
  fill: none;
  stroke: #3b82f6;
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dasharray 0.6s ease;
}

.percentage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 22px;
  font-weight: 800;
  color: #1e293b;
}

/* Mobile Responsive */
@media (max-width: 900px) {
  .profile-grid { grid-template-columns: 1fr; }
  .profile-sidebar { max-width: 100%; }
  .details-grid { grid-template-columns: 1fr; }
  .stats-card { flex-direction: column; text-align: center; gap: 20px; }
}
</style>