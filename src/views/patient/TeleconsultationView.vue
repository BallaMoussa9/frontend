<template>
  <SidebarLayout>
    <section class="teleconsultation-section">
      <div class="dashboard-header">
        <div class="header-content">
          <h1 class="page-title">
            <Video :size="32" class="title-icon" />
            Consultation en Ligne
          </h1>
          <p class="page-subtitle">Connectez-vous avec votre médecin pour une consultation à distance</p>
        </div>
      </div>

      <!-- Informations du médecin -->
      <div class="doctor-info">
        <img :src="doctor.photo" alt="Médecin" class="doctor-avatar" />
        <div class="doctor-details">
          <div class="doctor-title">
            <div class="card-icon">
              <Stethoscope :size="20" />
            </div>
            <h2>{{ doctor.name }}</h2>
          </div>
          <p><User :size="16" /> {{ doctor.speciality }}</p>
          <p><Mail :size="16" /> {{ doctor.email }}</p>
        </div>
      </div>

      <!-- Zone de vidéoconférence (simulée) -->
      <div class="video-box">
        <div class="video-header">
          <div class="video-status">
            <Wifi :size="20" class="status-icon active" />
            <span>Appel vidéo actif...</span>
          </div>
          <div class="video-controls">
            <button class="control-btn" title="Muter le micro">
              <Mic :size="18" />
            </button>
            <button class="control-btn" title="Couper la vidéo">
              <Camera :size="18" />
            </button>
            <button class="control-btn end-call" @click="endCall" title="Terminer l'appel">
              <Phone :size="18" />
            </button>
          </div>
        </div>
        <div class="video-placeholder">
          <Monitor :size="48" />
          <p>Consultation en cours</p>
        </div>
      </div>

      <!-- Chat en direct -->
      <div class="chat-box">
        <div class="chat-header">
          <div class="card-icon">
            <MessageSquare :size="24" />
          </div>
          <h2 class="card-title">Discussion</h2>
        </div>
        <div class="messages">
          <div v-for="msg in messages" :key="msg.id" :class="['message-item', msg.sender.toLowerCase()]">
            <div class="message-avatar">
              <User :size="16" />
            </div>
            <div class="message-content">
              <div class="message-sender">{{ msg.sender }}</div>
              <div class="message-text">{{ msg.text }}</div>
            </div>
          </div>
        </div>

        <form @submit.prevent="sendMessage" class="message-form">
          <div class="input-group">
            <input v-model="messageInput" type="text" placeholder="Écrire un message..." required class="message-input" />
            <button type="submit" class="send-btn">
              <Send :size="18" />
            </button>
          </div>
        </form>
      </div>

      <!-- Documents partagés -->
      <div class="attachments-box">
        <div class="attachments-header">
          <div class="card-icon">
            <FileText :size="24" />
          </div>
          <h2 class="card-title">Documents médicaux</h2>
        </div>
        <div class="attachments-list">
          <div v-for="doc in attachments" :key="doc.id" class="attachment-item">
            <FileText :size="18" class="file-icon" />
            <a :href="doc.link" target="_blank" class="file-link">
              {{ doc.name }}
              <Download :size="16" class="download-icon" />
            </a>
          </div>
        </div>
      </div>
    </section>
  </SidebarLayout>
</template>

<script setup>
import SidebarLayout from '@/layouts/SidebarLayout.vue'
import { reactive, ref } from 'vue'
import {
  Video, VideoOff, Mic, MicOff, MessageSquare, Send, FileText,
  User, Stethoscope, Phone, Wifi, Clock, Calendar, Download,
  Activity, Heart, Shield, CheckCircle, AlertCircle,
  Camera, CameraOff, Monitor, Volume2, VolumeX
} from 'lucide-vue-next'

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
  --primary: #2563eb;
  --primary-dark: #1e40af;
  --primary-light: #3b82f6;
  --secondary: #10b981;
  --secondary-dark: #059669;
  --accent: #8b5cf6;
  --danger: #ef4444;
  --warning: #f59e0b;
  --success: #22c55e;
  --dark: #0f172a;
  --light: #ffffff;
  --gray: #94a3b8;
  --gray-light: #cbd5e1;
  --gray-dark: #64748b;
  --border: rgba(255, 255, 255, 0.1);
  --shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  --shadow-xl: 0 30px 60px -12px rgba(0, 0, 0, 0.5);
  --radius: 16px;
  
  padding: 2rem;
  margin: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  box-sizing: border-box;
  position: relative;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  gap: 1.5rem;
  animation: slideDown 0.6s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-title {
  font-size: 2.2rem;
  font-weight: 900;
  color: white;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.title-icon {
  color: white;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  padding: 12px;
  border-radius: 14px;
  box-shadow: var(--shadow-lg);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 15px 35px rgba(37, 99, 235, 0.5);
  }
}

.page-subtitle {
  color: white;
  font-size: 1.1rem;
  margin-top: 12px;
  opacity: 0.9;
}

.doctor-info {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-lg);
  margin-bottom: 2rem;
  margin-top: 2rem;
  max-width: 100%;
  box-sizing: border-box;
  animation: fadeInUp 0.8s ease-out 0.3s both;
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
}

.doctor-info::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.doctor-info:hover::before {
  transform: scaleX(1);
}

.doctor-info:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.doctor-info:hover {
  transform: translateY(-8px);
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.5);
  border-color: var(--primary);
}

.doctor-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--primary);
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
}

.doctor-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0 0 0.8rem 0;
}

.doctor-title .card-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
}

.doctor-info:hover .doctor-title .card-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.5);
}

.doctor-title h2 {
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.doctor-details p {
  margin: 0.4rem 0;
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.9;
}

.doctor-details p svg {
  color: var(--primary-light);
}

.video-box {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-lg);
  margin-bottom: 2rem;
  margin-top: 2rem;
  max-width: 100%;
  box-sizing: border-box;
  animation: fadeInUp 0.8s ease-out 0.6s both;
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
}

.video-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.video-box:hover::before {
  transform: scaleX(1);
}

.video-box:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
}

.video-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(34, 197, 94, 0.2);
}

.video-status {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #22c55e;
  font-weight: 700;
}

.status-icon.active {
  color: #22c55e;
  animation: pulse 2s infinite;
}

.video-controls {
  display: flex;
  gap: 0.8rem;
}

.control-btn {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  padding: 0.8rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.control-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.5);
  background: linear-gradient(135deg, var(--primary-dark), var(--secondary-dark));
}

.control-btn.end-call {
  background: linear-gradient(135deg, #dc2626, #ef4444);
  border-color: rgba(220, 38, 38, 0.3);
}

.control-btn.end-call:hover {
  background: linear-gradient(135deg, #ef4444, #f87171);
}

.video-placeholder {
  text-align: center;
  padding: 3rem;
  color: white;
  opacity: 0.8;
}

.video-placeholder svg {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.chat-box {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-lg);
  margin-bottom: 2rem;
  margin-top: 2rem;
  max-width: 100%;
  box-sizing: border-box;
  animation: fadeInUp 0.8s ease-out 0.9s both;
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
}

.chat-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.chat-box:hover::before {
  transform: scaleX(1);
}

.chat-box:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
}

.chat-header { 
  padding: 1.5rem; 
  border-bottom: 1px solid rgba(255, 255, 255, 0.1); 
  display: flex; 
  align-items: center; 
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
}

.card-icon { 
  width: 48px; 
  height: 48px; 
  background: linear-gradient(135deg, var(--primary), var(--secondary)); 
  color: white !important; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
  transition: all 0.3s ease;
}

.chat-box:hover .card-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.5);
}

.card-title { 
  font-size: 1.3rem; 
  font-weight: 800; 
  color: white; 
  margin: 0; 
  flex: 1;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.attachments-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  margin-bottom: 2rem;
}

.attachments-box:hover .card-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.5);
}

.messages {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-item {
  display: flex;
  gap: 1rem;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.message-avatar {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-avatar svg {
  color: var(--primary-light);
}

.message-content {
  flex: 1;
}

.message-sender {
  font-weight: 700;
  color: var(--gray-light);
  font-size: 0.8rem;
  margin-bottom: 0.3rem;
}

.message-text {
  color: white;
  font-weight: 600;
  line-height: 1.4;
}

.message-item.médecin .message-avatar {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
}

.message-item.médecin .message-avatar svg {
  color: white;
}

.message-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-group {
  display: flex;
  gap: 1rem;
}

.message-input {
  flex: 1;
  padding: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.message-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.message-input:focus {
  border-color: var(--primary);
  background: rgba(255, 255, 255, 0.08);
  outline: none;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
  transform: translateY(-2px);
}

.send-btn {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
}

.send-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.5);
  background: linear-gradient(135deg, var(--primary-dark), var(--secondary-dark));
}

.attachments-box {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  animation: fadeInUp 0.8s ease-out 1.2s both;
}

.attachments-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
}

.attachments-header svg {
  color: white;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  padding: 8px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.attachments-header h2 {
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.attachment-item:hover {
  background: rgba(0, 0, 0, 0.15);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.file-icon {
  color: var(--primary-light);
  flex-shrink: 0;
}

.file-link {
  color: white;
  text-decoration: none;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  transition: all 0.3s ease;
}

.file-link:hover {
  color: var(--primary-light);
}

.download-icon {
  color: var(--gray);
  transition: all 0.3s ease;
}

.file-link:hover .download-icon {
  color: var(--primary-light);
  transform: translateY(-2px);
}

/* Variables CSS */
:root {
  --primary: #2563eb;
  --primary-dark: #1e40af;
  --primary-light: #3b82f6;
  --secondary: #10b981;
  --secondary-dark: #059669;
  --gray: #94a3b8;
  --gray-light: #cbd5e1;
  --dark: #0f172a;
}

@media (max-width: 768px) {
  .teleconsultation-section {
    padding: 1rem;
    gap: 1.5rem;
  }

  h1 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
  }

  .doctor-info {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .video-header {
    flex-direction: column;
    gap: 1rem;
  }

  .video-controls {
    justify-content: center;
  }

  .messages {
    max-height: 200px;
  }

  .input-group {
    flex-direction: column;
  }

  .message-input {
    padding: 0.8rem;
  }

  .send-btn {
    padding: 0.8rem;
  }
}
</style>
