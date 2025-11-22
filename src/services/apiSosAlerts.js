// @/services/apiSosAlerts.js
import API from './axios' // Assurez-vous que cette instance Axios est configurée pour le token

/**
 * Récupère la liste de toutes les alertes SOS qui sont 'en attente'.
 * Endpoint: GET /urgentist/sos-alerts/active
 */
export const apiGetActiveSosAlerts = async () => {
  try {
    const response = await API.get(`/urgentist/sos-alerts/active`)
    return response.data
  } catch (error) {
    console.error('Erreur récupération des alertes SOS actives :', error)
    throw new Error(error.response?.data?.message || 'Erreur lors du chargement des alertes actives.')
  }
}

/**
 * Récupère les détails d'une alerte SOS spécifique.
 * Endpoint: GET /urgentist/sos-alerts/{id}
 */
export const apiGetSosAlertDetails = async (alertId) => {
  try {
    const response = await API.get(`/urgentist/sos-alerts/${alertId}`)
    return response.data
  } catch (error) {
    console.error(`Erreur récupération alerte SOS #${alertId} :`, error)
    // Le message du backend (ex: 'Alerte SOS non trouvée.') est propagé
    throw new Error(error.response?.data?.message || 'Alerte SOS non trouvée.')
  }
}

/**
 * Marque une alerte SOS comme "Prise en charge" (in_progress).
 * Endpoint: POST /urgentist/sos-alerts/{id}/take-charge
 */
export const apiTakeChargeAlert = async (alertId) => {
  try {
    const response = await API.post(`/urgentist/sos-alerts/${alertId}/take-charge`)
    return response.data
  } catch (error) {
    console.error(`Erreur prise en charge alerte SOS #${alertId} :`, error)
    throw new Error(error.response?.data?.message || 'Impossible de prendre en charge l\'alerte.')
  }
}

/**
 * Marque une alerte SOS comme "Résolue" (resolved ou traiteß).
 * Endpoint: POST /urgentist/sos-alerts/{id}/resolve
 */
export const apiResolveAlert = async (alertId) => {
  try {
    const response = await API.post(`/urgentist/sos-alerts/${alertId}/resolve`)
    return response.data
  } catch (error) {
    console.error(`Erreur résolution alerte SOS #${alertId} :`, error)
    throw new Error(error.response?.data?.message || 'Impossible de marquer l\'alerte comme résolue.')
  }
}

/**
 * Envoie un message au patient via l'API (pour le chat).
 * Endpoint: POST /urgentist/sos-alerts/{id}/send-message
 */
export const apiSendMessageToPatient = async (alertId, data) => {
  try {
    // Assurez-vous que cet endpoint est bien configuré dans Laravel
    const response = await API.post(`/urgentist/sos-alerts/${alertId}/send-message`, data)
    return response.data
  } catch (error) {
    console.error(`Erreur envoi message alerte SOS #${alertId} :`, error)
    throw new Error(error.response?.data?.message || 'Échec de l\'envoi du message au patient.')
  }
}
/**
 * Déclenche une nouvelle alerte SOS par l'utilisateur/patient.
 * Endpoint: POST /sos
 */
export const apiTriggerSOSAlert = async (data) => {
  try {
    // 🔑 Cible l'endpoint défini dans web/api.php : Route::post('/sos', [SosController::class, 'store']);
    const response = await API.post(`/sos`, data)
    return response.data
  } catch (error) {
    console.error('Erreur lors du déclenchement de l\'alerte SOS :', error)
    throw new Error(error.response?.data?.message || 'Erreur lors de l\'envoi de l\'alerte SOS.')
  }
}