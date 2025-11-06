<template>
  <UrgentisteLayout>
    <div class="dashboard-page">
      <h2>Tableau de Bord des Alertes SOS</h2>
      <p class="description">Gérez les urgences médicales déclenchées par les patients.</p>

      <div class="summary-cards">
        <div class="card pending">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Alertes en Attente</p>
          <h3>{{ summary.pending }}</h3>
        </div>
        <div class="card in-progress">
          <i class="fas fa-user-md"></i>
          <p>En Cours de Prise en Charge</p>
          <h3>{{ summary.inProgress }}</h3>
        </div>
        <div class="card resolved">
          <i class="fas fa-check-circle"></i>
          <p>Alertes Résolues (Aujourd'hui)</p>
          <h3>{{ summary.resolved }}</h3>
        </div>
        </div>

      <div class="alert-section">
        <h3>Nouvelles et Alertes Actives</h3>
        <table class="alert-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Localisation</th>
              <th>Heure</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="alert in activeAlerts" :key="alert.id" :class="alert.status.toLowerCase()">
              <td>{{ alert.id }}</td>
              <td>{{ alert.patient.name }}</td>
              <td class="location-cell">
                <i class="fas fa-map-marker-alt"></i> {{ alert.location.city }}
                <a :href="alert.location.mapLink" target="_blank" class="map-link">Voir Carte</a>
              </td>
              <td>{{ alert.time }}</td>
              <td :class="['status-badge', alert.status.toLowerCase().replace(' ', '-')]">
                {{ alert.status }}
              </td>
              <td>
                <button @click="updateStatus(alert.id, 'Prise en charge')" class="btn-action primary">
                  Prendre en Charge
                </button>
                <button @click="openChat(alert.id)" class="btn-action secondary">
                  Contacter
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="chatOpen" class="chat-modal">
        <div class="chat-header">
          Chat avec {{ selectedAlert.patient.name }}
          <button @click="chatOpen = false">X</button>
        </div>
        <div class="chat-body">
          <p class="chat-message incoming">Patient : Aidez-moi, j'ai des douleurs à la poitrine!</p>
          <p class="chat-message outgoing">Urgentiste : Nous arrivons. Confirmez votre adresse : {{ selectedAlert.location.city }}</p>
        </div>
        <div class="chat-input">
          <input type="text" placeholder="Envoyer un message..." />
          <button>Envoyer</button>
        </div>
      </div>
    </div>
  </UrgentisteLayout>
</template>

<script setup>
import { ref } from 'vue'
import UrgentisteLayout from '@/layouts/UrgentisteLayout.vue' // Chemin à ajuster

// Données fictives pour l'exemple
const summary = ref({
  pending: 5,
  inProgress: 1,
  resolved: 12
})

const activeAlerts = ref([
  {
    id: 'SOS-0012',
    patient: { name: 'Mariam Diallo' },
    location: { city: 'Quartier A, Bamako', mapLink: '#' },
    time: '18:15',
    status: 'En Attente',
  },
  {
    id: 'SOS-0011',
    patient: { name: 'Moussa Coulibaly' },
    location: { city: 'Route de Koulikoro', mapLink: '#' },
    time: '17:50',
    status: 'Prise en charge',
  },
  // Ajoutez d'autres alertes ici...
])

const chatOpen = ref(false)
const selectedAlert = ref(null)

// Fonctions de gestion
function updateStatus(id, newStatus) {
  const alert = activeAlerts.value.find(a => a.id === id)
  if (alert) {
    alert.status = newStatus
    console.log(`Alerte ${id} mise à jour à : ${newStatus}`)
    // Logique API pour envoyer la mise à jour au backend
  }
}

function openChat(id) {
  selectedAlert.value = activeAlerts.value.find(a => a.id === id)
  chatOpen.value = true
}
</script>

<style scoped>
/* ---------------------------------- */
/* Styles du Tableau de Bord Principal */
/* ---------------------------------- */
.dashboard-page {
  /* Le contenu principal du tableau de bord */
}

h2 {
  color: #002580;
  margin-bottom: 5px;
}

.description {
  color: #666;
  margin-bottom: 20px;
}

/* ---------------------------------- */
/* Cartes de Résumé (Inspirées du design) */
/* ---------------------------------- */
.summary-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  flex: 1;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
}

.card i {
  font-size: 30px;
  margin-bottom: 10px;
}

.card h3 {
  font-size: 28px;
  margin: 5px 0 0;
}

.card p {
  font-size: 14px;
  color: #888;
}

.pending { color: #ff9800; } /* Orange pour l'attente */
.in-progress { color: #03a9f4; } /* Bleu pour en cours */
.resolved { color: #4caf50; } /* Vert pour résolu */

/* ---------------------------------- */
/* Tableau des Alertes */
/* ---------------------------------- */
.alert-section {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.alert-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

.alert-table th, .alert-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.alert-table th {
  background-color: #f7f9fc;
  color: #002580;
  font-weight: 600;
}

.alert-table tbody tr:hover {
  background-color: #f9f9f9;
}

/* Styles spécifiques au tableau */
.location-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.map-link {
  color: #ec5865;
  text-decoration: none;
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 12px;
}

.en-attente {
  background-color: #ffe0b2;
  color: #ff9800;
}
.prise-en-charge {
  background-color: #b3e5fc;
  color: #03a9f4;
}
.resolue {
  background-color: #c8e6c9;
  color: #4caf50;
}

/* Boutons d'action */
.btn-action {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
  transition: opacity 0.2s;
}

.btn-action.primary {
  background-color: #002580;
  color: white;
}

.btn-action.secondary {
  background-color: #ec5865;
  color: white;
}

.btn-action:hover {
  opacity: 0.9;
}

/* ---------------------------------- */
/* Modale de Chat */
/* ---------------------------------- */
.chat-modal {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px;
  height: 400px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 10px;
  background-color: #002580;
  color: white;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px 8px 0 0;
}

.chat-body {
  flex-grow: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chat-message {
  padding: 8px 12px;
  border-radius: 15px;
  max-width: 80%;
  font-size: 14px;
}

.incoming {
  align-self: flex-start;
  background-color: #f0f0f0;
  color: #333;
}

.outgoing {
  align-self: flex-end;
  background-color: #ec5865;
  color: white;
}

.chat-input {
  display: flex;
  padding: 10px;
  border-top: 1px solid #eee;
}

.chat-input input {
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
}

.chat-input button {
  background-color: #002580;
  color: white;
  border: none;
  padding: 8px 15px;
  cursor: pointer;
  border-radius: 0 4px 4px 0;
}
</style>