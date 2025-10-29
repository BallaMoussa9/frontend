<template>
  <AppLayout>
    <div class="accueil-container">
      <!-- Hero Section -->
      <section class="hero">
        <h2>Plateforme de santé communautaire et d’urgence au Mali</h2>

        <div v-if="isLoggedIn">
          <img :src="`http://localhost/storage/${auth.user?.profile_photo}`" alt="Photo de profil" class="avatar" />
          <p class="username">Bienvenue, {{ fullName }} !</p>
          <button class="cta-button" @click="logout">Se déconnecter</button>
        </div>

        <div v-else>
          <button class="cta-button">Commencer maintenant</button>
        </div>
      </section>

      <!-- Services Section -->
      <section class="services-section">
        <h2 class="section-title">Services</h2>

        <div class="services">
          <div
            v-for="service in serviceList"
            :key="service.name"
            class="service"
            @click="toggleService(service.name)"
          >
            {{ service.icon }} {{ service.name }}
          </div>
        </div>

        <div v-if="selectedService" class="service-description">
          <h4>Description du service :</h4>
          <p>{{ selectedDescription }}</p>
        </div>
      </section>

      <!-- About Section -->
      <section class="about">
        <h3>À propos de SanKo</h3>
        <p>
          SanKo est une plateforme de santé numérique destinée à connecter les patients,
          les professionnels de santé et les services d'urgence au Mali.
        </p>
        <img src="https://via.placeholder.com/120" alt="Médecin" />
      </section>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '../stores/authStores'
import { computed, ref } from 'vue'

const auth = useAuthStore()

const isLoggedIn = computed(() => auth.isLoggedIn)
const fullName = computed(() => auth.fullName)
const profilePhoto = computed(() => auth.profilePhotoUrl)
const logout = () => auth.logout()

// Liste des services
const serviceList = [
  {
    name: 'Alerte SOS',
    icon: '🆘',
    description: 'En cas d’urgence, vous pouvez envoyer une alerte SOS à l’hôpital ou aux services de secours proches.',
  },
  {
    name: 'Téléconsultation',
    icon: '📞',
    description: 'Discutez avec un médecin à distance pour un premier avis ou un suivi médical sans vous déplacer.',
  },
  {
    name: 'Rendez-vous en ligne',
    icon: '📅',
    description: 'Prenez facilement rendez-vous avec un professionnel de santé disponible selon votre agenda.',
  },
  {
    name: 'Dossier médical',
    icon: '📁',
    description: 'Accédez à vos antécédents médicaux, ordonnances, examens et comptes rendus médicaux en un clic.',
  },
]

const selectedService = ref(null)

const toggleService = (name) => {
  selectedService.value = selectedService.value === name ? null : name
}

const selectedDescription = computed(() => {
  const service = serviceList.find((s) => s.name === selectedService.value)
  return service?.description || ''
})
</script>

<style scoped>
.accueil-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.hero {
  text-align: center;
  margin-top: 40px;
}

.hero h2 {
  font-size: 28px;
  color: #002580;
  margin-bottom: 20px;
}

.cta-button {
  background-color: var(--sanko-blue, #0040d0);
  color: white;
  padding: 14px 32px;
  border: none;
  border-radius: 30px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.cta-button:hover {
  background-color: #0030a0;
}

.section-title {
  text-align: center;
  font-size: 24px;
  color: #0040d0;
  margin-bottom: 20px;
  text-transform: uppercase;
}

.services-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.services {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.service {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  width: 220px;
  text-align: center;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

.service:hover {
  background-color: #f0f8ff;
}

.service-description {
  max-width: 600px;
  background: #f9f9f9;
  padding: 20px;
  border-left: 4px solid #0040d0;
  border-radius: 8px;
}

.about {
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
}

.about h3 {
  font-size: 20px;
  margin-bottom: 10px;
}

.about img {
  margin-top: 15px;
  width: 100px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 10px;
  border: 2px solid #0040d0;
}

.username {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}
</style>
