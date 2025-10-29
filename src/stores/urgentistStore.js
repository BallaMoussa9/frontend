// src/stores/urgentistStore.js
import { defineStore } from 'pinia'
import {
  apiGetActiveSosAlerts,
  apiGetSosAlertDetails,
  apiTakeChargeOfAlert,
  apiResolveAlert,
  apiSendMessageToPatient,
  apiCreateEmergencyPhysician,
  apiSearchEmergencyPhysicians,
  apiGetAllEmergencyPhysicians,
  apiGetEmergencyPhysician,
  apiDeleteEmergencyPhysician,
  apiUpdateEmergencyPhysician
} from '@/services/apiUrgentist'
import API from '@/services/axios' // ✅ ton instance Axios

export const useUrgentistStore = defineStore('urgentist', {
  state: () => ({
    // 👨‍⚕️ Urgentistes
    urgentists: [],
    currentUrgentist: null,

    // 🚨 Alertes SOS
    activeAlerts: [],
    alertDetails: null,
    currentAlertId: null, // ✅ ID de l’alerte en cours

    // ⚙️ États
    loading: false,
    error: null,
    success: null,
  }),

  actions: {
    // 📍 Patient déclenche une alerte SOS
    async triggerSOSAlert(latitude, longitude, message = 'Urgence SOS') {
      this.loading = true
      this.error = null
      this.success = null
      try {
        const res = await API.post('/sos', {
          latitude,
          longitude,
          message,
        })
        this.currentAlertId = res.data.alert_id
        this.success = '🚨 Alerte SOS envoyée avec succès !'
        return this.currentAlertId
      } catch (err) {
        this.error = err.response?.data?.message || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    // 🔄 Mise à jour GPS du patient
    async updateLocation(coords) {
      if (!this.currentAlertId) return
      try {
        await API.put(`/sos/${this.currentAlertId}/update-location`, {
          latitude: coords.latitude,
          longitude: coords.longitude,
        })
      } catch (err) {
        this.error = 'Erreur lors de la mise à jour de la localisation'
      }
    },

    // ⚠️ Permet d’afficher un message d’erreur depuis le composant
    setError(message) {
      this.error = message
    },

    // 🔄 Utilitaire générique
    async handleAction(actionFn, onSuccess = null) {
      this.loading = true
      this.error = null
      this.success = null
      try {
        const response = await actionFn()
        if (onSuccess) onSuccess(response)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // 🚨 Alertes SOS (côté urgentiste)
    fetchActiveAlerts() {
      return this.handleAction(async () => {
        const res = await apiGetActiveSosAlerts()
        this.activeAlerts = res.data
      })
    },

    fetchAlertDetails(alertId) {
      return this.handleAction(async () => {
        const res = await apiGetSosAlertDetails(alertId)
        this.alertDetails = res.data
      })
    },

    takeChargeOfAlert(alertId) {
      return this.handleAction(async () => {
        const res = await apiTakeChargeOfAlert(alertId)
        this.success = res.data.message
        this.alertDetails = res.data.alert
      })
    },

    resolveAlert(alertId) {
      return this.handleAction(async () => {
        const res = await apiResolveAlert(alertId)
        this.success = res.data.message
        this.alertDetails = res.data.alert
      })
    },

    sendMessageToPatient(alertId, messageData) {
      return this.handleAction(async () => {
        const res = await apiSendMessageToPatient(alertId, messageData)
        this.success = res.data.message
      })
    },

    // 👨‍⚕️ Urgentistes
    createUrgentist(physicianData) {
      return this.handleAction(async () => {
        const res = await apiCreateEmergencyPhysician(physicianData)
        this.success = res.data.message
      })
    },

    fetchAllUrgentists() {
      return this.handleAction(async () => {
        const res = await apiGetAllEmergencyPhysicians()
        this.urgentists = res.data.data || res.data
        console.log('Fetched urgentists:', this.urgentists)
      })
    },

    fetchOneUrgentist(id) {
      return this.handleAction(async () => {
        const res = await apiGetEmergencyPhysician(id)
        this.currentUrgentist = res.data
      })
    },

    updateUrgentist(id, physicianData) {
      return this.handleAction(async () => {
        const res = await apiUpdateEmergencyPhysician(id, physicianData)
        this.success = res.data.message
        this.currentUrgentist = res.data.urgentist
      })
    },

    deleteUrgentist(id) {
      return this.handleAction(async () => {
        const res = await apiDeleteEmergencyPhysician(id)
        this.success = res.data.message
        this.urgentists = this.urgentists.filter(u => u.id !== id)
      })
    },

    // 🧹 Réinitialiser feedback
    resetFeedback() {
      this.error = null
      this.success = null
    }
  },

  getters: {
    allUrgentists: (state) => state.urgentists,
    currentAlert: (state) => state.alertDetails,
  },
})
