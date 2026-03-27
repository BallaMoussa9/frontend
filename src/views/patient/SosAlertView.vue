<template>
  <SidebarLayout>
    <section class="sos-section">
      <div class="dashboard-header">
        <div class="header-content">
          <h1 class="page-title">
            <AlertTriangle :size="32" class="title-icon pulse" />
            Alerte d'Urgence SOS
          </h1>
          <p class="page-subtitle">Alertez immédiatement les services d'urgence et vos contacts de confiance.</p>
        </div>
      </div>

      <div class="sos-main-container">
        <div class="sos-card">
          <div class="alert-info">
            <div class="info-icon">
              <Info :size="24" />
            </div>
            <p>
              En cliquant sur le bouton ci-dessous, votre <strong>position GPS exacte</strong> sera transmise aux secours les plus proches ainsi qu'à l'administration de la plateforme.
            </p>
          </div>

          <div class="action-area">
            <button
              @click="sendAlert"
              :disabled="isSending"
              :class="['sos-button', { 'pulsing': !isSending }]"
            >
              <div class="btn-content">
                <Pointer :size="24" v-if="!isSending" />
                <Loader2 :size="24" v-else class="animate-spin" />
                <span>{{ isSending ? 'Signal en cours...' : 'DÉCLENCHER L’ALERTE' }}</span>
              </div>
            </button>
          </div>
        </div>

        <transition name="fade">
          <div v-if="error || sosAlertsStore.error" class="custom-alert error">
            <XCircle :size="20" />
            <span>{{ error || sosAlertsStore.error }}</span>
          </div>
        </transition>

        <transition name="fade">
          <div v-if="success || sosAlertsStore.success" class="custom-alert success">
            <CheckCircle :size="20" />
            <span>{{ success || sosAlertsStore.success }}</span>
          </div>
        </transition>

        <div class="location-box" v-if="coords">
          <div class="location-header">
            <div class="location-title">
              <div class="card-icon">
                <MapPin :size="20" />
              </div>
              <h3>Votre position actuelle</h3>
            </div>
            <span class="gps-status">GPS Actif</span>
          </div>
          <div class="coords-grid">
            <div class="coord-item">
              <label>Latitude</label>
              <span>{{ coords.latitude }}</span>
            </div>
            <div class="coord-item">
              <label>Longitude</label>
              <span>{{ coords.longitude }}</span>
            </div>
            <div class="coord-item full" v-if="coords.accuracy">
              <label>Précision estimée</label>
              <span>± {{ coords.accuracy }} mètres</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </SidebarLayout>
</template>

<script setup>
import SidebarLayout from '@/layouts/SidebarLayout.vue'
import { ref } from 'vue'
import { useSosAlertsStore } from '@/stores/SosAlertsStore'
import {
  AlertTriangle, Info, MapPin, Pointer, Loader2, XCircle,
  CheckCircle, Activity, Shield, Phone, Clock, Users,
  Zap, Heart, AlertCircle, Navigation, Satellite
} from 'lucide-vue-next' 

const sosAlertsStore = useSosAlertsStore()
const coords = ref(null)
const error = ref(null)
const success = ref(null)
const isSending = ref(false)

async function getPositionWithRetry(retries = 3, delay = 2000) {
  return new Promise((resolve, reject) => {
    function attempt(remaining) {
      if (!navigator.geolocation) {
        return reject(new Error('La géolocalisation n’est pas supportée.'));
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        async (err) => {
          if (err.code === 2 && remaining > 0) {
            await new Promise(r => setTimeout(r, delay))
            attempt(remaining - 1)
          } else {
            reject(err)
          }
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      )
    }
    attempt(retries)
  })
}

async function sendAlert() {
  error.value = null
  success.value = null
  sosAlertsStore.resetFeedback()

  if (isSending.value) return
  isSending.value = true

  try {
    let position = null
    try {
      position = await getPositionWithRetry()
    } catch (posErr) {
      console.warn('GPS indisponible :', posErr.message)
      error.value = 'Position GPS indisponible. Envoi de l\'alerte simple...'
    }

    const latitude = position?.coords.latitude?.toFixed(6) || null
    const longitude = position?.coords.longitude?.toFixed(6) || null

    if (latitude && longitude) {
      coords.value = {
        latitude,
        longitude,
        accuracy: position.coords.accuracy?.toFixed(1)
      }
    }

    await sosAlertsStore.triggerSOSAlert(latitude, longitude)
    
  } catch (err) {
    console.error('Erreur SOS :', err)
    if (!sosAlertsStore.error) {
        error.value = 'Échec de la connexion aux services d\'urgence.'
    }
  } finally {
    isSending.value = false
  }
}
</script>

<style scoped>
.sos-section {
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
  height: 100%;
  background: transparent;
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
}

.title-icon.pulse {
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
  color: var(--gray);
  font-size: 1.1rem;
  margin-top: 8px;
  opacity: 0.9;
}

.sos-main-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  animation: fadeInUp 0.8s ease-out 0.3s both;
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

.sos-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border-radius: var(--radius);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-lg);
  padding: 2.5rem;
  text-align: center;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}

.sos-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #dc2626, #ef4444);
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.sos-card:hover::before {
  transform: scaleX(1);
}

.sos-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: #dc2626;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
}

.alert-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(239, 68, 68, 0.1));
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border-left: 4px solid #dc2626;
  backdrop-filter: blur(10px);
  animation: slideIn 0.6s ease-out 0.6s both;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.info-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #dc2626, #ef4444);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(220, 38, 38, 0.3);
  flex-shrink: 0;
}

.alert-info p {
  margin: 0;
  font-size: 1rem;
  color: white;
  line-height: 1.6;
  font-weight: 600;
}

.alert-info strong {
  color: #ef4444;
  font-weight: 800;
}

.action-area {
  margin-top: 2rem;
}

.sos-button {
  background: linear-gradient(135deg, #dc2626, #ef4444);
  color: white;
  border: none;
  width: 100%;
  max-width: 450px;
  padding: 1.5rem;
  font-size: 1.3rem;
  font-weight: 900;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 0 #991b1b;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
}

.sos-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.sos-button:hover::before {
  left: 100%;
}

.sos-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #ef4444, #f87171);
  transform: translateY(-4px);
  box-shadow: 0 15px 0 #991b1b;
}

.sos-button:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow: 0 4px 0 #991b1b;
}

.sos-button:disabled {
  background: linear-gradient(135deg, var(--gray), var(--gray-light));
  box-shadow: 0 4px 0 var(--gray-dark);
  cursor: not-allowed;
  transform: none;
}

.sos-button.pulsing {
  animation: pulse-red 2s infinite;
}

@keyframes pulse-red {
  0% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4), 0 10px 0 #991b1b;
  }
  70% {
    box-shadow: 0 0 0 20px rgba(220, 38, 38, 0), 0 10px 0 #991b1b;
  }
  100% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0), 0 10px 0 #991b1b;
  }
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

/* Alerts */
.custom-alert {
  padding: 1rem 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 700;
  backdrop-filter: blur(10px);
  animation: slideIn 0.4s ease-out;
}

.custom-alert.error {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(239, 68, 68, 0.1));
  color: #ef4444;
  border: 1px solid rgba(220, 38, 38, 0.3);
}

.custom-alert.success {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1));
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

/* Location Box */
.location-box {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  animation: fadeIn 0.6s ease-out 0.9s both;
}

.location-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.location-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.location-title .card-icon {
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

.location-box:hover .location-title .card-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.5);
}

.location-title h3 {
  font-size: 1.2rem;
  color: white;
  margin: 0;
  font-weight: 800;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.gps-status {
  font-size: 0.8rem;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1));
  color: #22c55e;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 700;
  border: 1px solid rgba(34, 197, 94, 0.3);
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.gps-status::before {
  content: '';
  width: 6px;
  height: 6px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.coords-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.coord-item {
  background: rgba(0, 0, 0, 0.1);
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.coord-item:hover {
  background: rgba(0, 0, 0, 0.15);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.coord-item label {
  font-size: 0.8rem;
  text-transform: uppercase;
  color: var(--gray);
  font-weight: 700;
  margin-bottom: 0.5rem;
  letter-spacing: 0.5px;
}

.coord-item span {
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
  color: white;
  font-weight: 600;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.coord-item.full {
  grid-column: span 2;
}

/* Animations */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
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
  --gray-dark: #64748b;
  --danger: #dc2626;
  --danger-dark: #991b1b;
  --danger-light: #ef4444;
}

@media (max-width: 768px) {
  .sos-section {
    padding: 1rem;
  }

  h1 {
    font-size: 1.8rem;
  }

  .sos-card {
    padding: 1.5rem;
  }

  .sos-button {
    font-size: 1.1rem;
    padding: 1.2rem;
  }

  .alert-info {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .info-icon {
    align-self: center;
  }

  .coords-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .coord-item.full {
    grid-column: span 1;
  }

  .location-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>