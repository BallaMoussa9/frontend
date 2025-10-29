<template>
  <SidebarLayout>
    <section class="sos-section">
      <h1>Alerte d'Urgence SOS</h1>

      <div class="sos-card">
        <p>
          En cas de situation critique, cliquez sur le bouton ci-dessous pour alerter immédiatement les services d’urgence
          les plus proches. Votre position GPS sera transmise automatiquement si disponible.
        </p>

        <button
          @click="sendAlert"
          :disabled="isSending"
          class="sos-button"
        >
          <span v-if="isSending">Envoi en cours...</span>
          <span v-else>🆘 Déclencher l’alerte SOS</span>
        </button>
      </div>

      <div v-if="error" class="alert-error">{{ error }}</div>
      <div v-if="success" class="alert-success">{{ success }}</div>

      <div class="location-box" v-if="coords">
        <h2>📍 Position actuelle</h2>
        <p>Latitude : {{ coords.latitude }}</p>
        <p>Longitude : {{ coords.longitude }}</p>
        <p v-if="coords.accuracy">Précision : {{ coords.accuracy }} mètres</p>
      </div>
    </section>
  </SidebarLayout>
</template>

<script setup>
import SidebarLayout from '@/layouts/SidebarLayout.vue'
import { ref } from 'vue'
import { useUrgentistStore } from '@/stores/urgentistStore'

const urgentistStore = useUrgentistStore()
const coords = ref(null)
const error = ref(null)
const success = ref(null)
const isSending = ref(false)

// Fonction utilitaire pour récupérer la position avec retry
async function getPositionWithRetry(retries = 3, delay = 2000) {
  return new Promise((resolve, reject) => {
    function attempt(remaining) {
      if (!navigator.geolocation) {
        return reject(new Error('La géolocalisation n’est pas supportée sur cet appareil.'));
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        async (err) => {
          if (err.code === 2 && remaining > 0) {
            // kCLErrorLocationUnknown / position inconnue → retry
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

  if (isSending.value) return
  isSending.value = true

  try {
    let position = null
    try {
      position = await getPositionWithRetry()
    } catch (posErr) {
      console.warn('GPS indisponible :', posErr.message)
      error.value = 'Impossible de récupérer la position GPS. L’alerte sera envoyée sans localisation.'
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

    // Déclencher l’alerte SOS via le store
    await urgentistStore.triggerSOSAlert(latitude, longitude)
    success.value = 'Votre alerte SOS a été envoyée aux services d’urgence.'
  } catch (err) {
    console.error('Erreur lors de l’envoi de l’alerte SOS :', err)
    error.value = err.message || 'Une erreur est survenue lors de l’envoi de l’alerte SOS.'
  } finally {
    isSending.value = false
  }
}
</script>

<style scoped>
.sos-section {
  max-width: 600px;
  margin: auto;
  padding: 32px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

h1 {
  font-size: 26px;
  font-weight: bold;
  color: #c20000;
  margin-bottom: 20px;
}

.sos-card {
  background: #ffecec;
  border: 1px solid #ff9999;
  padding: 24px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.sos-button {
  background-color: #c20000;
  color: white;
  border: none;
  padding: 14px 20px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.sos-button:hover:not(:disabled) {
    background-color: #9e0000;
}

.sos-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.location-box {
  background-color: #f0f4ff;
  padding: 20px;
  border-radius: 6px;
  border: 1px solid #ccd8ff;
}

.location-box h2 {
  margin-bottom: 10px;
  color: #002580;
}

.alert-error {
    color: #c20000;
    background-color: #ffcccc;
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 15px;
}

.alert-success {
    color: #28a745;
    background-color: #d4edda;
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 15px;
}
</style>
