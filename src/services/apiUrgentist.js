// src/services/apiUrgentist.js
import API from './axios'

// Petit helper pour uniformiser les erreurs
const handleRequest = async (promise) => {
  try {
    const response = await promise
    return response
  } catch (error) {
    console.error('Erreur API Urgentist:', error.response?.data || error.message)
    throw new Error(error.response?.data?.message || 'Erreur de connexion')
  }
}

// 🚨 Gestion des alertes SOS
export const apiGetActiveSosAlerts = () => handleRequest(API.get('/urgentist/alerts/active'))
export const apiGetSosAlertDetails = (alertId) => handleRequest(API.get(`/urgentist/alerts/${alertId}`))
export const apiTakeChargeOfAlert = (alertId) => handleRequest(API.put(`/urgentist/alerts/${alertId}/take-charge`))
export const apiResolveAlert = (alertId) => handleRequest(API.put(`/urgentist/alerts/${alertId}/resolve`))
export const apiSendMessageToPatient = (alertId, messageData) =>
  handleRequest(API.post(`/urgentist/alerts/${alertId}/message-patient`, messageData))

// 👨‍⚕️ CRUD et recherche des urgentistes
export const apiCreateEmergencyPhysician = (physicianData) =>
  handleRequest(API.post('/urgentist/register', physicianData, {
    headers: physicianData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
  }))

export const apiSearchEmergencyPhysicians = (query) =>
  handleRequest(API.get(`/urgentist/search?q=${encodeURIComponent(query)}`))

export const apiGetAllEmergencyPhysicians = () => handleRequest(API.get('/urgentist'))
export const apiGetEmergencyPhysician = (id) => handleRequest(API.get(`/urgentist/${id}`))
export const apiDeleteEmergencyPhysician = (id) => handleRequest(API.delete(`/urgentist/${id}`))
export const apiUpdateEmergencyPhysician = (id, physicianData) =>
  // ⚠️ Modifier `API.put` par `API.post`
  handleRequest(API.post(`/urgentist/${id}`, physicianData, {
    headers: physicianData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
  }))
  async function sendAlert() {
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    const res = await API.post('/sos', { latitude, longitude, message: 'Urgence SOS' });
    const alertId = res.data.alert_id;

    // Ensuite, commencer à suivre la position en continu
    watchPosition(alertId);
  });
}

