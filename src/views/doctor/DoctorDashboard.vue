<template>
  <MedecinLayout>
    <div class="dashboard-page">
      <h1 class="page-title">Bienvenue Dr. {{ auth.user?.first_name }}</h1>

      <section class="section">
        <h2 class="section-title">Alertes SOS récentes</h2>
        <div class="sos-cards">
          <!-- Exemple de carte d'urgence -->
          <div class="sos-card" v-for="alert in sosAlerts" :key="alert.id">
            <h3>{{ alert.patient_name }}</h3>
            <p>Urgence : {{ alert.type }}</p>
            <p>Localisation : {{ alert.location }}</p>
            <button class="btn-details">Voir détails</button>
          </div>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Rendez-vous du jour</h2>
        <ul class="rendezvous-list">
          <li v-for="rdv in todayAppointments" :key="rdv.id">
            <strong>{{ rdv.patient_name }}</strong> à {{ rdv.time }} - {{ rdv.reason }}
          </li>
        </ul>
      </section>
    </div>
  </MedecinLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStores'
import MedecinLayout from '@/layouts/MedecinLayout.vue'

const auth = useAuthStore()
const sosAlerts = ref([])
const todayAppointments = ref([])

// Simuler récupération des données
onMounted(() => {
  sosAlerts.value = [
    { id: 1, patient_name: 'Awa Koné', type: 'Cardiaque', location: 'Sogoniko' },
    { id: 2, patient_name: 'Boubacar Diallo', type: 'Accident', location: 'Bacodjicoroni' },
  ]
  todayAppointments.value = [
    { id: 1, patient_name: 'Fatoumata Traoré', time: '09h30', reason: 'Suivi tension' },
    { id: 2, patient_name: 'Oumar Sidibé', time: '11h00', reason: 'Douleur thoracique' },
  ]
})
</script>

<style scoped>
.dashboard-page {
  padding: 32px;
}

.page-title {
  font-size: 26px;
  color: #1c325f;
  margin-bottom: 24px;
}

.section {
  margin-top: 32px;
}

.section-title {
  font-size: 20px;
  margin-bottom: 16px;
  color: #0f1e46;
}

.sos-cards {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.sos-card {
  background-color: #fff;
  border: 1px solid #ccd;
  padding: 16px;
  border-radius: 8px;
  width: 280px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.btn-details {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #002580;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.rendezvous-list {
  list-style: none;
  padding: 0;
}

.rendezvous-list li {
  margin-bottom: 10px;
  font-size: 15px;
  background-color: #f2f6ff;
  padding: 10px;
  border-radius: 6px;
}
</style>
