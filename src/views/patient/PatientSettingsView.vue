<template>
  <SidebarLayout>
    <section class="settings-section">
      <div class="dashboard-header">
        <div class="header-content">
          <h1 class="page-title">
            <Settings :size="32" class="title-icon" />
            Paramètres utilisateur
          </h1>
          <p class="page-subtitle">Personnalisez votre expérience et préférences</p>
        </div>
      </div>

      <!-- Préférences de langue -->
      <div class="settings-card">
        <div class="card-header">
          <div class="card-icon">
            <Globe :size="24" />
          </div>
          <h2 class="card-title">Langue de l'interface</h2>
        </div>
        <select v-model="preferences.language" class="settings-select">
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="bm">Bambara</option>
        </select>
      </div>

      <!-- Notifications -->
      <div class="settings-card">
        <div class="card-header">
          <div class="card-icon">
            <Bell :size="24" />
          </div>
          <h2 class="card-title">Notifications</h2>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="preferences.smsAlert" class="settings-checkbox" />
            <Smartphone :size="18" class="label-icon" />
            <span>Alerte SMS en cas d'urgence</span>
          </label>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="preferences.emailReminder" class="settings-checkbox" />
            <Mail :size="18" class="label-icon" />
            <span>Rappel par email pour les rendez-vous</span>
          </label>
        </div>
      </div>

      <!-- Accessibilité -->
      <div class="settings-card">
        <div class="card-header">
          <div class="card-icon">
            <Eye :size="24" />
          </div>
          <h2 class="card-title">Accessibilité</h2>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="preferences.highContrast" class="settings-checkbox" />
            <Sun :size="18" class="label-icon" />
            <span>Mode contraste élevé</span>
          </label>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="preferences.largeText" class="settings-checkbox" />
            <Type :size="18" class="label-icon" />
            <span>Texte agrandi</span>
          </label>
        </div>
      </div>

      <!-- Enregistrement -->
      <button @click="savePreferences" class="save-btn">
        <Save :size="20" />
        <span>Enregistrer les paramètres</span>
      </button>
    </section>
  </SidebarLayout>
</template>

<script setup>
import SidebarLayout from '@/layouts/SidebarLayout.vue'
import { reactive } from 'vue'
import {
  Settings, Globe, Bell, Smartphone, Mail, Eye, Type,
  Save, CheckCircle, AlertCircle, Shield, Lock, User,
  Moon, Sun, Volume2, Wifi, Database, RefreshCw
} from 'lucide-vue-next'

const preferences = reactive({
  language: 'fr',
  smsAlert: true,
  emailReminder: true,
  highContrast: false,
  largeText: false,
})

function savePreferences() {
  alert('Paramètres sauvegardés ✅')
  // Envoyer vers ton backend Laravel si besoin
}
</script>

<style scoped>
.settings-section {
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
  
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  background: transparent;
  position: relative;
  width: 100%;
  box-sizing: border-box;
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

.settings-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-lg);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  margin-bottom: 2rem;
  margin-top: 2rem;
  max-width: 100%;
  box-sizing: border-box;
  animation: fadeInUp 0.8s ease-out backwards;
}

.settings-card:nth-child(1) { 
  animation-delay: 0s;
  margin-top: 2rem;
}
.settings-card:nth-child(2) { animation-delay: 0.1s; }
.settings-card:nth-child(3) { animation-delay: 0.2s; }
.settings-card:nth-child(4) { animation-delay: 0.3s; }

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

.settings-card::before {
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

.settings-card:hover::before {
  transform: scaleX(1);
}

.settings-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
}

.card-header { 
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
  color: white; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
}

.settings-card:hover .card-icon {
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

.form-group {
  margin-bottom: 2rem;
  margin-top: 1rem;
}

.checkbox-label {
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.8rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.checkbox-label:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

.label-icon {
  color: var(--primary-light);
  flex-shrink: 0;
}

.settings-checkbox {
  width: 20px;
  height: 20px;
  accent-color: var(--primary);
  cursor: pointer;
  flex-shrink: 0;
}

.settings-select {
  padding: 1rem;
  border-radius: 12px;
  font-size: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  width: 100%;
}

.settings-select:focus {
  border-color: var(--primary);
  background: rgba(255, 255, 255, 0.08);
  outline: none;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
  transform: translateY(-2px);
}

.settings-select option {
  background: var(--dark);
  color: white;
}

.save-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  transition: all 0.3s ease;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
  margin-top: 2rem;
}

.save-btn:hover:not(:disabled) { 
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.5);
  background: linear-gradient(135deg, var(--primary-dark), var(--secondary-dark));
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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
  .settings-section {
    padding: 1rem;
    gap: 1.5rem;
  }

  h1 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
  }

  .settings-card {
    padding: 1.5rem;
  }

  .card-header {
    margin-bottom: 1.5rem;
  }

  h2 {
    font-size: 1.2rem;
  }

  .checkbox-label {
    padding: 0.6rem;
    font-size: 0.9rem;
  }

  .settings-select {
    padding: 0.8rem;
  }

  }
</style>
