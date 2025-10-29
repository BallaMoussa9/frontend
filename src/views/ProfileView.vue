<template>
  <AppLayout>
    <div class="profile-container">
      <h2>Mon Profil</h2>

      <div class="profile-content">
        <!-- Colonne gauche -->
        <div class="profile-left">
          <div class="profile-photo-section">
            <img :src="`http://localhost/storage/${auth.user?.profile_photo}`" />

            <p class="user-name">{{ fullName }}</p>
            <input type="file" @change="updatePhoto" />
          </div>

          <ul class="profile-sections">
            <li>📧 {{ auth.user?.email }}</li>
            <li>📱 {{ auth.user?.phone }}</li>
            <li>📍 {{ auth.user?.city }}, {{ auth.user?.country }}</li>
          </ul>
        </div>

        <!-- Colonne droite -->
        <div class="profile-right">
          <div class="card">
            <h3>Informations personnelles</h3>
            <p><strong>Nom :</strong> {{ auth.user?.first_name }} {{ auth.user?.last_name }}</p>
            <p><strong>Date de naissance :</strong> {{ auth.user?.birth_date }}</p>
            <p><strong>Adresse :</strong> {{ auth.user?.address }}</p>
          </div>

          <div class="card">
            <h3>Complétion du profil</h3>
            <div class="progress-circle">
              <svg viewBox="0 0 36 36">
                <path class="circle-bg"
                      d="M18 2.0845
                         a 15.9155 15.9155 0 0 1 0 31.831
                         a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path class="circle"
                      :stroke-dasharray="`${completion}, 100`"
                      d="M18 2.0845
                         a 15.9155 15.9155 0 0 1 0 31.831
                         a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div class="percentage">{{ completion }}%</div>
            </div>
          </div>
        </div>
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

// Affichage dynamique
const fullName = computed(() => auth.fullName)
const photoUrl = computed(() => auth.profilePhotoUrl)

const completion = computed(() => {
  let total = 0
  const fields = ['first_name', 'last_name', 'email', 'birth_date', 'phone', 'city', 'country', 'address']
  fields.forEach(field => {
    if (auth.user?.[field]) total += 100 / fields.length
  })
  return Math.round(total)
})

// ✅ Fonction d'upload de la nouvelle photo
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

    // 🔁 Mise à jour du store avec la nouvelle photo
    auth.user = data.user
    localStorage.setItem('user', JSON.stringify(data.user))
  } catch (error) {
    console.error('Erreur lors de l’upload :', error)
    alert('Échec du téléchargement de la photo')
  }
}
</script>


<style scoped>
.profile-container {
  padding: 2rem;
  max-width: 1100px;
  margin: auto;
}

.profile-content {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}

.profile-left {
  flex: 1;
  max-width: 300px;
  text-align: center;
}

.profile-photo-section {
  margin-bottom: 1rem;
}

.profile-photo {
  width: 120px;
  height: 120px;
  border-radius: 100px;
  object-fit: cover;
  margin-bottom: 10px;
}

.user-name {
  font-weight: bold;
  font-size: 18px;
}

.profile-sections {
  list-style: none;
  padding: 0;
  text-align: left;
}

.profile-right {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card {
  background-color: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
}

.progress-circle {
  position: relative;
  width: 100px;
  height: 100px;
  margin: auto;
}

svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.circle-bg {
  fill: none;
  stroke: #eee;
  stroke-width: 3.8;
}

.circle {
  fill: none;
  stroke: #3f83f8;
  stroke-width: 3.8;
  stroke-linecap: round;
}

.percentage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 20px;
  font-weight: bold;
}
</style>
