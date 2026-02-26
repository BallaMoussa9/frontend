<template>
  <SidebarLayout>
    <section class="sos-section">
      <div class="header-banner">
        <h1><i class="fas fa-exclamation-triangle"></i> Alerte d'Urgence SOS</h1>
        <p>Alertez immédiatement les services d’urgence et vos contacts de confiance.</p>
      </div>

      <div class="sos-main-container">
        <div class="sos-card">
          <div class="alert-info">
            <div class="info-icon">
              <i class="fas fa-info-circle"></i>
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
                <i v-if="!isSending" class="fas fa-hand-pointer"></i>
                <span v-if="isSending" class="loader-mini"></span>
                <span>{{ isSending ? 'Signal en cours...' : 'DÉCLENCHER L’ALERTE' }}</span>
              </div>
            </button>
          </div>
        </div>

        <transition name="fade">
          <div v-if="error || sosAlertsStore.error" class="custom-alert error">
            <i class="fas fa-times-circle"></i>
            <span>{{ error || sosAlertsStore.error }}</span>
          </div>
        </transition>

        <transition name="fade">
          <div v-if="success || sosAlertsStore.success" class="custom-alert success">
            <i class="fas fa-check-circle"></i>
            <span>{{ success || sosAlertsStore.success }}</span>
          </div>
        </transition>

        <div class="location-box" v-if="coords">
          <div class="location-header">
            <h3><i class="fas fa-map-marker-alt"></i> Votre position actuelle</h3>
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
.sos-section { padding: 30px; max-width: 800px; margin: 0 auto; }

.header-banner { margin-bottom: 30px; }
.header-banner h1 { color: #c20000; font-size: 1.8rem; display: flex; align-items: center; gap: 12px; margin-bottom: 5px; }
.header-banner p { color: #64748b; }

.sos-main-container { display: flex; flex-direction: column; gap: 20px; }

.sos-card {
  background: white;
  border-radius: 15px;
  padding: 30px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.alert-info {
  display: flex;
  background: #fef2f2;
  padding: 15px;
  border-radius: 10px;
  gap: 15px;
  text-align: left;
  margin-bottom: 30px;
  border-left: 4px solid #c20000;
}
.info-icon { color: #c20000; font-size: 1.2rem; }
.alert-info p { margin: 0; font-size: 0.95rem; color: #7f1d1d; line-height: 1.5; }

.sos-button {
  background: #c20000;
  color: white;
  border: none;
  width: 100%;
  max-width: 400px;
  padding: 20px;
  font-size: 1.2rem;
  font-weight: 800;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 0 #8a0000;
  margin-bottom: 8px;
}

.sos-button:hover:not(:disabled) { background: #d90000; transform: translateY(-2px); }
.sos-button:active:not(:disabled) { transform: translateY(4px); box-shadow: 0 2px 0 #8a0000; }
.sos-button:disabled { background: #cbd5e1; box-shadow: 0 4px 0 #94a3b8; cursor: not-allowed; }

.btn-content { display: flex; align-items: center; justify-content: center; gap: 12px; }

/* Animation de pulsation */
.pulsing { animation: pulse-red 2s infinite; }
@keyframes pulse-red {
  0% { box-shadow: 0 0 0 0 rgba(194, 0, 0, 0.4); }
  70% { box-shadow: 0 0 0 20px rgba(194, 0, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(194, 0, 0, 0); }
}

/* Alerts */
.custom-alert {
  padding: 15px 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
}
.custom-alert.error { background: #fef2f2; color: #c20000; border: 1px solid #fecaca; }
.custom-alert.success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }

/* Location Box */
.location-box {
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}
.location-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.location-header h3 { font-size: 1rem; color: #002580; margin: 0; }
.gps-status { font-size: 0.75rem; background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 20px; font-weight: bold; }

.coords-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.coord-item { background: #f8fafc; padding: 12px; border-radius: 8px; display: flex; flex-direction: column; }
.coord-item label { font-size: 0.7rem; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 4px; }
.coord-item span { font-family: monospace; font-size: 1rem; color: #1e293b; }
.coord-item.full { grid-column: span 2; }

/* Loader */
.loader-mini {
  width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-radius: 50%;
  border-top-color: #fff; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>