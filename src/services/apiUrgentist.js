import API from './axios'

// Petit helper pour uniformiser les erreurs
const handleRequest = async (promise) => {
  try {
    const response = await promise
    return response
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Erreur de connexion';
    console.error('Erreur API Urgentist:', errorMessage);
    throw new Error(errorMessage); 
  }
}

// ----------------------------------------------------
// 🚨 Alertes SOS (Urgentiste)
// ----------------------------------------------------

// 📊 CORRECTION APPLIQUÉE : Appel de l'endpoint renommé '/alerts-stats'
export const apiGetAlertsStatsByStatus = () => handleRequest(API.get('/urgentist/alerts-stats'))
// Récupérer les alertes actives
export const apiGetActiveSosAlerts = () => handleRequest(API.get('/urgentist/alerts/active'))

// Récupérer l'historique des alertes résolues/annulées
export const apiGetHistorySosAlerts = () => handleRequest(API.get('/urgentist/alerts/history'))

// Récupérer les détails d'une alerte spécifique
export const apiGetSosAlertDetails = (alertId) => handleRequest(API.get(`/urgentist/alerts/${alertId}`))

export const apiTakeChargeOfAlert = (alertId) => handleRequest(API.put(`/urgentist/alerts/${alertId}/take-charge`))
export const apiResolveAlert = (alertId) => handleRequest(API.put(`/urgentist/alerts/${alertId}/resolve`))
export const apiSendMessageToPatient = (alertId, messageData) =>
  handleRequest(API.post(`/urgentist/alerts/${alertId}/message-patient`, messageData))

// ----------------------------------------------------
// 👨‍⚕️ CRUD et recherche des urgentistes
// ----------------------------------------------------

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
  handleRequest(API.put(`/urgentist/${id}`, physicianData, {
    headers: physicianData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
  }))