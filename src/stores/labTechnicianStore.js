import { defineStore } from 'pinia'
import {
  apiGetAllLabTechnicians,
  apiCreateLabTechnician,
  apiGetLabTechnician,
  apiUpdateLabTechnician,
  apiDeleteLabTechnician
} from '@/services/apiLabTechnician'

export const useLabTechnicianStore = defineStore('labTechnician', {
  state: () => ({
    labTechnicians: [],
    currentTechnician: null,
    loading: false,
    error: null,
    success: null,
  }),

  actions: {
    async handleAction(actionFn, successMessage = '') {
      this.loading = true
      this.error = null
      this.success = null
      try {
        await actionFn()
        if (successMessage) this.success = successMessage
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchAllLabTechnicians() {
      await this.handleAction(async () => {
        this.labTechnicians = await apiGetAllLabTechnicians()
      })
    },

    async fetchLabTechnician(id) {
    this.loading = true;
    this.error = null;
    this.success = null;
    try {
      // 1. Appelle l'API et obtient l'objet de réponse Axios
      const response = await apiGetLabTechnician(id);
      // 2. Extrait l'objet de données (le technicien) de la réponse
      this.currentTechnician = response.data; // ✅ CORRECTION ICI
    } catch (error) {
      this.error = error.message;
      throw error;
    } finally {
      this.loading = false;
    }
  },

    async createLabTechnician(technicianData) {
      await this.handleAction(async () => {
        const newTechnician = await apiCreateLabTechnician(technicianData)
        this.labTechnicians.push(newTechnician)
      }, 'Technicien de laboratoire créé avec succès.')
    },

    async updateLabTechnician(id, technicianData) {
    this.loading = true;
    this.error = null;
    this.success = null;
    try {
      const response = await apiUpdateLabTechnician(id, technicianData);
      const updatedTechnician = response.data; // ✅ CORRECTION ICI
      const index = this.labTechnicians.findIndex(t => t.id === id);
      if (index !== -1) {
        this.labTechnicians[index] = updatedTechnician;
      }
      this.currentTechnician = updatedTechnician;
      this.success = 'Technicien de laboratoire mis à jour avec succès.';
    } catch (error) {
      this.error = error.message;
      throw error;
    } finally {
      this.loading = false;
    }
  },

    async deleteLabTechnician(id) {
      await this.handleAction(async () => {
        await apiDeleteLabTechnician(id)
        this.labTechnicians = this.labTechnicians.filter(t => t.id !== id)
      }, 'Technicien de laboratoire supprimé avec succès.')
    },

    resetFeedback() {
      this.error = null
      this.success = null
    }
  },
})
