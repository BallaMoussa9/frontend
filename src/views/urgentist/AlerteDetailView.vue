<template>
  <UrgentisteLayout>
    <div class="alert-detail-page">
      <div class="header-section">
        <h2 class="title">Intervention SOS #{{ alert.id }}</h2>
        <div :class="['status-box', alert.status.toLowerCase().replace(' ', '-')]">
          Statut actuel : {{ alert.status }}
        </div>
      </div>
      
      <div class="content-grid">
        <div class="details-card">
          <h3 class="card-title">Détails du Patient</h3>
          <div class="patient-info">
            <p><strong>Patient :</strong> {{ alert.patient.name }}</p>
            <p><strong>Âge :</strong> {{ alert.patient.age }} ans</p>
            <p><strong>Contact :</strong> {{ alert.patient.phone }}</p>
            <p><strong>Groupe Sanguin :</strong> {{ alert.patient.bloodType }}</p>
          </div>
          
          <h3 class="card-title mt-4">Localisation Déclenchée</h3>
          <p class="location-text">
            <i class="fas fa-map-marker-alt"></i> {{ alert.location.address }}
          </p>
          <p class="time-text">
            <i class="fas fa-clock"></i> Déclenché à : {{ alert.time }}
          </p>

          <hr class="separator"/>

          <h3 class="card-title">Mettre à jour le statut</h3>
          <div class="action-buttons">
            <button @click="updateStatus('Prise en charge')" class="btn primary">
              <i class="fas fa-user-check"></i> Prise en Charge
            </button>
            <button @click="updateStatus('En route')" class="btn secondary">
              <i class="fas fa-truck-medical"></i> En Route
            </button>
            <button @click="updateStatus('Résolue')" class="btn success">
              <i class="fas fa-check"></i> Marquer Résolue
            </button>
          </div>
        </div>
        
        <div class="map-chat-container">
          <div class="map-container">
            <h3 class="card-title">Localisation en Temps Réel</h3>
            <div class="map-placeholder">
                          </div>
            <p class="map-status">Distance estimée : **{{ alert.location.distance }}**</p>
          </div>

          <div class="chat-container">
            <h3 class="card-title">Communication Patient</h3>
            <div class="chat-box">
              <div v-for="(msg, index) in chatMessages" :key="index" :class="['message', msg.type]">
                <span class="sender">{{ msg.sender }}:</span> {{ msg.text }}
              </div>
            </div>
            <div class="chat-input">
              <input type="text" v-model="newMessage" placeholder="Écrire un message de soutien/instruction..." @keyup.enter="sendMessage" />
              <button @click="sendMessage" class="btn send-btn"><i class="fas fa-paper-plane"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UrgentisteLayout>
</template>

<script setup>
import { ref } from 'vue'
import UrgentisteLayout from '@/layouts/UrgentisteLayout.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const alertId = route.params.id // Récupérer l'ID de l'alerte depuis la route

// Données fictives (à remplacer par un appel API : fetchAlertDetails(alertId))
const alert = ref({
  id: alertId,
  patient: { name: 'Mariam Diallo', age: 34, phone: '77-XX-XX-XX', bloodType: 'A+' },
  location: { address: 'Quartier A, Rue du marché, Bamako', distance: '1.2 km', mapLink: '#' },
  time: '18:15:30',
  status: 'Prise en charge',
})

const chatMessages = ref([
  { sender: 'Patient', text: "Aidez-moi, je respire mal !", type: 'incoming' },
  { sender: 'Vous', text: "Nous sommes en route. Restez calme. Pouvez-vous confirmer votre adresse ?", type: 'outgoing' },
])

const newMessage = ref('')

// Fonctions
function updateStatus(newStatus) {
  alert.value.status = newStatus
  console.log(`Statut de l'alerte ${alert.value.id} mis à jour à: ${newStatus}`)
  // TODO: Appel API pour mettre à jour le statut
}

function sendMessage() {
  if (newMessage.value.trim() === '') return
  
  // Ajouter le message au chat
  chatMessages.value.push({
    sender: 'Vous',
    text: newMessage.value.trim(),
    type: 'outgoing'
  })
  
  // TODO: Appel API/WebSocket pour envoyer le message au patient
  
  newMessage.value = ''
}
</script>

<style scoped>
/* Styles génériques */
.alert-detail-page {
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 15px;
}

.title {
  color: #002580;
  font-weight: 700;
}

/* Statut box */
.status-box {
  padding: 8px 15px;
  border-radius: 6px;
  font-weight: bold;
  color: white;
}
.prise-en-charge { background-color: #03a9f4; }
.en-route { background-color: #ff9800; }
.résolue { background-color: #4caf50; }

/* Grille de Contenu */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 2fr; /* 1/3 pour détails, 2/3 pour map/chat */
  gap: 30px;
}

/* Cartes */
.details-card, .map-container, .chat-container {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-title {
  color: #002580;
  font-size: 1.2rem;
  margin-bottom: 15px;
  border-left: 4px solid #ec5865;
  padding-left: 10px;
}

/* Détails Patient */
.patient-info p {
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.location-text, .time-text {
  font-size: 1rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 10px;
}
.location-text i, .time-text i {
  margin-right: 8px;
  color: #ec5865;
}

.separator {
  margin: 25px 0;
  border: 0;
  border-top: 1px dashed #e0e0e0;
}

/* Boutons d'Action */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn {
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn i {
    margin-right: 8px;
}

.primary { background-color: #002580; color: white; }
.secondary { background-color: #ff9800; color: white; }
.success { background-color: #4caf50; color: white; }

.btn:hover { opacity: 0.9; }

/* Map et Chat */
.map-chat-container {
    display: flex;
    flex-direction: column;
    gap: 30px;
}
.map-placeholder {
  height: 300px;
  background-color: #e6f7ff;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #002580;
  font-weight: bold;
  border-radius: 8px;
}
.map-status {
    text-align: center;
    margin-top: 10px;
    font-weight: 500;
}

/* Chat */
.chat-box {
  height: 200px;
  overflow-y: auto;
  border: 1px solid #f0f0f0;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  background-color: #f7f9fc;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message {
  padding: 8px 12px;
  border-radius: 15px;
  max-width: 70%;
  font-size: 0.9rem;
}

.incoming {
  align-self: flex-start;
  background-color: #e0e0e0;
  color: #333;
}

.outgoing {
  align-self: flex-end;
  background-color: #ec5865;
  color: white;
}

.sender {
    font-weight: bold;
    margin-right: 5px;
}

.chat-input {
  display: flex;
  gap: 10px;
}
.chat-input input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
.send-btn {
    width: 50px;
    padding: 10px;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr; /* Empilement sur les petits écrans */
  }
}
</style>