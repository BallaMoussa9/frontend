<template>
  <MedecinLayout>
    <div class="teleconsultation-page">
      <h1 class="title">Téléconsultation</h1>

      <!-- Sélection du patient -->
      <section class="section">
        <label for="patient">Patient :</label>
        <select id="patient" v-model="selectedPatient">
          <option disabled value="">-- Sélectionnez --</option>
          <option v-for="p in patients" :key="p.id" :value="p.name">{{ p.name }}</option>
        </select>
      </section>

      <!-- Espace téléconsultation -->
      <section v-if="selectedPatient" class="consult-area">
        <div class="video-section">
          <div class="video-box">📹 Appel vidéo simulé avec {{ selectedPatient }}</div>
        </div>

        <div class="chat-section">
          <div class="chat-box">
            <div v-for="msg in messages" :key="msg.id" :class="['msg', msg.sender]">
              <span>{{ msg.sender === 'doctor' ? 'Vous' : selectedPatient }} :</span> {{ msg.text }}
            </div>
          </div>

          <form @submit.prevent="sendMessage" class="chat-form">
            <input type="text" v-model="newMessage" placeholder="Écrire un message..." />
            <button type="submit">Envoyer</button>
          </form>
        </div>
      </section>
    </div>
  </MedecinLayout>
</template>

<script setup>
import MedecinLayout from '@/layouts/MedecinLayout.vue'
import { ref } from 'vue'

const patients = ref([
  { id: 1, name: 'Leslie Alexander' },
  { id: 2, name: 'Oumar Sidibé' },
])

const selectedPatient = ref('')
const newMessage = ref('')
const messages = ref([
  { id: 1, sender: 'patient', text: 'Bonjour Docteur !' },
  { id: 2, sender: 'doctor', text: 'Bonjour, comment vous sentez-vous aujourd’hui ?' },
])

function sendMessage() {
  if (newMessage.value.trim() === '') return
  messages.value.push({ id: Date.now(), sender: 'doctor', text: newMessage.value })
  newMessage.value = ''
}
</script>

<style scoped>
.teleconsultation-page {
  padding: 32px;
}

.title {
  font-size: 24px;
  color: #002580;
  margin-bottom: 20px;
}

.section {
  margin-bottom: 28px;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
}

select, input {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccd;
  font-size: 14px;
}

.consult-area {
  display: flex;
  gap: 20px;
}

.video-section {
  flex: 1;
}

.video-box {
  background-color: #e6ebf5;
  height: 240px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #002580;
  font-size: 18px;
  border: 2px dashed #99a3c7;
}

.chat-section {
  width: 40%;
  display: flex;
  flex-direction: column;
}

.chat-box {
  flex: 1;
  background: #fff;
  border: 1px solid #ccc;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
  max-height: 240px;
  overflow-y: auto;
}

.msg {
  margin-bottom: 8px;
}
.msg.doctor {
  text-align: right;
  color: #002580;
}
.msg.patient {
  text-align: left;
  color: #555;
}

.chat-form {
  display: flex;
  gap: 8px;
}
.chat-form input {
  flex: 1;
}
.chat-form button {
  padding: 10px 16px;
  background: #002580;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
