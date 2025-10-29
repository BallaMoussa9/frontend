<template>
  <SidebarLayout>
    <section class="teleconsultation-section">
      <h1>Consultation en Ligne</h1>

      <!-- Informations du médecin -->
      <div class="doctor-info">
        <img :src="doctor.photo" alt="Médecin" class="doctor-avatar" />
        <div>
          <h2>{{ doctor.name }}</h2>
          <p>{{ doctor.speciality }}</p>
          <p>{{ doctor.email }}</p>
        </div>
      </div>

      <!-- Zone de vidéoconférence (simulée) -->
      <div class="video-box">
        <p>📡 Appel vidéo actif...</p>
        <button @click="endCall">Terminer l'appel</button>
      </div>

      <!-- Chat en direct -->
      <div class="chat-box">
        <h2>Discussion</h2>
        <div class="messages">
          <p v-for="msg in messages" :key="msg.id" :class="msg.sender">
            <strong>{{ msg.sender }} :</strong> {{ msg.text }}
          </p>
        </div>

        <form @submit.prevent="sendMessage">
          <input v-model="messageInput" type="text" placeholder="Écrire un message..." required />
          <button type="submit">Envoyer</button>
        </form>
      </div>

      <!-- Documents partagés -->
      <div class="attachments-box">
        <h2>Documents médicaux</h2>
        <ul>
          <li v-for="doc in attachments" :key="doc.id">
            📁 <a :href="doc.link" target="_blank">{{ doc.name }}</a>
          </li>
        </ul>
      </div>
    </section>
  </SidebarLayout>
</template>

<script setup>
import SidebarLayout from '@/layouts/SidebarLayout.vue'

const doctor = {
  name: 'Dr. Konaté Mariam',
  speciality: 'Allergologue',
  email: 'm.konate@hopital.ml',
  photo: '/images/medecin.png',
}

const messages = reactive([
  { id: 1, sender: 'Médecin', text: 'Bonjour, comment vous sentez-vous aujourd’hui ?' },
  { id: 2, sender: 'Patient', text: 'Bonjour docteur. J’ai encore des maux de tête.' },
])

const attachments = [
  { id: 1, name: 'Analyse IgE.pdf', link: '/uploads/ige.pdf' },
  { id: 2, name: 'Radiographie.pdf', link: '/uploads/xray.pdf' },
]

const messageInput = ref('')

function sendMessage() {
  messages.push({ id: Date.now(), sender: 'Patient', text: messageInput.value })
  messageInput.value = ''
}

function endCall() {
  alert('Consultation terminée ✅')
}
</script>

<style scoped>
.teleconsultation-section {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

h1 {
  font-size: 26px;
  font-weight: bold;
  color: #002580;
}

.doctor-info {
  display: flex;
  gap: 16px;
  align-items: center;
  background: #f0f4ff;
  padding: 16px;
  border-radius: 8px;
}

.doctor-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #002580;
}

.video-box {
  background-color: #e6ffe6;
  padding: 20px;
  border: 1px solid #b2f2b2;
  border-radius: 8px;
}

.chat-box {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.messages p {
  margin-bottom: 10px;
}

.messages .Médecin {
  color: #002580;
}

.messages .Patient {
  color: #333;
}

.chat-box input {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.chat-box button {
  margin-top: 10px;
  padding: 10px 16px;
  background-color: #002580;
  color: white;
  border: none;
  border-radius: 4px;
}

.attachments-box {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
}

.attachments-box a {
  color: #002580;
  text-decoration: underline;
}
</style>
