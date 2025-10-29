<template>
  <MedecinLayout>
    <div class="alerts-page">
      <h1 class="title">Alertes SOS reçues</h1>

      <section class="section">
        <table class="sos-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Patient</th>
              <th>Type d’urgence</th>
              <th>Localisation</th>
              <th>Priorité</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="alert in alerts" :key="alert.id">
              <td>{{ alert.date }}</td>
              <td>{{ alert.patient }}</td>
              <td>{{ alert.type }}</td>
              <td>{{ alert.location }}</td>
              <td>
                <span :class="['priority', alert.priority]">{{ alert.priority }}</span>
              </td>
              <td>
                <button class="btn-details" @click="viewAlert(alert)">Voir</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section v-if="selectedAlert" class="alert-details">
        <h2>Détails de l’urgence pour {{ selectedAlert.patient }}</h2>
        <p><strong>Date :</strong> {{ selectedAlert.date }}</p>
        <p><strong>Type :</strong> {{ selectedAlert.type }}</p>
        <p><strong>Localisation :</strong> {{ selectedAlert.location }}</p>
        <p><strong>Notes patient :</strong> {{ selectedAlert.notes }}</p>
        <p><strong>Recommandation :</strong></p>
        <textarea rows="4" v-model="selectedAlert.recommendation" placeholder="Rédiger une note ou action à prendre..."></textarea>
        <button class="btn-submit">Valider la prise en charge</button>
      </section>
    </div>
  </MedecinLayout>
</template>

<script setup>
import MedecinLayout from '@/layouts/MedecinLayout.vue'
import { ref } from 'vue'

const alerts = ref([
  {
    id: 1,
    date: '15 juillet 2025',
    patient: 'Awa Koné',
    type: 'Respiration difficile',
    location: 'Sabalibougou',
    priority: 'élevée',
    notes: 'Patient indique une gêne respiratoire soudaine en pleine nuit.',
    recommendation: '',
  },
  {
    id: 2,
    date: '15 juillet 2025',
    patient: 'Mohamed Diarra',
    type: 'Fièvre extrême',
    location: 'Banankabougou',
    priority: 'moyenne',
    notes: 'Fièvre à 40.2°C depuis 4h du matin.',
    recommendation: '',
  },
])

const selectedAlert = ref(null)
function viewAlert(alert) {
  selectedAlert.value = alert
}
</script>

<style scoped>
.alerts-page {
  padding: 32px;
}

.title {
  font-size: 24px;
  color: #002580;
  margin-bottom: 24px;
}

.section {
  margin-bottom: 32px;
}

.sos-table {
  width: 100%;
  border-collapse: collapse;
}

.sos-table th,
.sos-table td {
  padding: 10px;
  border: 1px solid #ccc;
}

.sos-table th {
  background-color: #f0f4ff;
  text-align: left;
}

.priority {
  padding: 6px 10px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 13px;
}

.priority.élevée {
  background-color: #ffcccc;
  color: #b30000;
}

.priority.moyenne {
  background-color: #fff3cd;
  color: #856404;
}

.priority.faible {
  background-color: #d4edda;
  color: #155724;
}

.btn-details,
.btn-submit {
  background-color: #002580;
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 8px;
}

.alert-details {
  background-color: #f8fafc;
  padding: 24px;
  border: 1px solid #ccd;
  border-radius: 8px;
}
</style>
