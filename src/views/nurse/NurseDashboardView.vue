<template>
  <NurseLayout>
    <div class="dashboard-container">
      <section class="header-section">
        <h1 class="title">Tableau de bord infirmier</h1>
        <p class="welcome-msg">Bienvenue **{{ nurseName }}**, voici les tâches du jour 👨‍⚕️</p>
      </section>

      <section class="cards-grid">
        <div class="dashboard-card">
          <h3>Patients assignés</h3>
          <p>{{ stats.patients }}</p>
        </div>

        <div class="dashboard-card">
          <h3>Urgences reçues</h3>
          <p>{{ stats.emergencies }}</p>
        </div>

        <div class="dashboard-card">
          <h3>Signes vitaux à renseigner</h3>
          <p>{{ stats.vitals }}</p>
        </div>

        <div class="dashboard-card">
          <h3>Observations en attente</h3>
          <p>{{ stats.notes }}</p>
        </div>

        <div class="dashboard-card">
          <h3>Transfusions en cours</h3>
          <p>{{ stats.blood }}</p>
        </div>
      </section>

      <section class="notifications-section">
        <h2 class="section-title">🛎️ Notifications urgentes</h2>
        <ul class="notification-list">
          <li v-for="(notif, index) in notifications" :key="index">
            <span class="tag" :class="notif.type">{{ notif.label }}</span> - {{ notif.message }}
          </li>
        </ul>
      </section>
    </div>
  </NurseLayout>
</template>

<script setup>
import { ref } from 'vue'
// 🔑 CORRECTION/CLARIFICATION : Utilisation de NurseLayoutView comme nom de composant
import NurseLayout from '@/layouts/NurseLayout.vue'
import { useAuthStore } from '@/stores/authStores' // Supposons que vous utilisez le store pour le nom

// Initialisation du store si vous souhaitez connecter le nom dynamiquement
const authStore = useAuthStore()

// 🔑 CONNEXION DYNAMIQUE (Meilleure pratique)
const nurseName = authStore.user?.first_name || 'Infirmier/Infirmière'

const stats = ref({
  patients: 12,
  emergencies: 3,
  vitals: 7,
  notes: 4,
  blood: 2,
})

const notifications = ref([
  { label: 'Urgence', message: 'Patient A02 signalé en détresse respiratoire.', type: 'urgent' },
  { label: 'Rappel', message: 'Saisie des signes vitaux pour Patient C14.', type: 'reminder' },
])
</script>

<style scoped>
.dashboard-container {
  padding: 30px;
  background-color: #f2f7fc;
  font-family: 'Segoe UI', sans-serif;
}

.header-section {
  margin-bottom: 25px;
}

.title {
  font-size: 26px;
  font-weight: 600;
  color: #002580;
}

.welcome-msg {
  font-size: 16px;
  color: #555;
}

.cards-grid {
  display: grid;
  /* 🔑 AJUSTEMENT CSS : Utilisez la fonction minmax pour une meilleure adaptabilité */
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.dashboard-card {
  background-color: white;
  border: 1px solid #dcdcdc;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.dashboard-card h3 {
  font-size: 16px;
  margin-bottom: 8px;
  color: #003366;
}

.dashboard-card p {
  font-size: 20px;
  font-weight: bold;
  color: #0077cc;
}

.notifications-section {
  background-color: white;
  padding: 20px;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.section-title {
  font-size: 18px;
  color: #002580;
  margin-bottom: 15px;
}

.notification-list {
  list-style: none;
  padding: 0;
}

.notification-list li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  font-size: 15px;
}

.tag {
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 4px;
  margin-right: 8px;
}

.tag.urgent {
  background-color: #e74c3c;
  color: white;
}

.tag.reminder {
  background-color: #f1c40f;
  color: #333;
}
</style>
