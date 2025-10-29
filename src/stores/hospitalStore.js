// resources/js/stores/hospitalStore.js

import { defineStore } from 'pinia';
import {
  apiGetAllHospitals,
  apiGetHospital,
  apiCreateHospital,
  apiUpdateHospital,
  apiDeleteHospital,
} from '@/services/apiHospital'; // Assurez-vous que le chemin est correct

export const useHospitalStore = defineStore('hospital', {
  state: () => ({
    hospitals: [],
    currentHospital: null,
    loading: false,
    error: null,
    success: null,
  }),

  actions: {
    // Une fonction utilitaire pour gérer les actions asynchrones, la gestion du loading/error/success
    async handleAction(actionFn, successMessage = '') {
      this.loading = true;
      this.error = null;
      this.success = null;
      try {
        const result = await actionFn();
        if (successMessage) {
          this.success = successMessage;
        }
        return result;
      } catch (error) {
        this.error = error.message;
        throw error; // Rejeter l'erreur pour permettre aux composants d'agir en conséquence
      } finally {
        this.loading = false;
      }
    },

    // Récupérer tous les hôpitaux
    async fetchAllHospitals() {
      await this.handleAction(async () => {
        this.hospitals = await apiGetAllHospitals();
      });
    },

    // Récupérer un hôpital par son ID
    async fetchHospital(id) {
      await this.handleAction(async () => {
        this.currentHospital = await apiGetHospital(id);
      });
    },

    // Créer un nouvel hôpital
    async createHospital(hospitalData) {
      const newHospital = await this.handleAction(async () => {
        return await apiCreateHospital(hospitalData);
      }, 'Hôpital créé avec succès.');
      this.hospitals.push(newHospital); // Ajouter le nouvel hôpital à la liste existante
      return newHospital;
    },

    // Mettre à jour un hôpital existant
    async updateHospital(id, hospitalData) {
      const updatedHospital = await this.handleAction(async () => {
        return await apiUpdateHospital(id, hospitalData);
      }, 'Hôpital mis à jour avec succès.');

      // Trouver l'index de l'hôpital mis à jour et le remplacer dans la liste
      const index = this.hospitals.findIndex(h => h.id === id);
      if (index !== -1) {
        this.hospitals[index] = updatedHospital;
      }
      // Mettre à jour l'hôpital actuellement sélectionné s'il s'agit de celui-ci
      if (this.currentHospital?.id === id) {
        this.currentHospital = updatedHospital;
      }
      return updatedHospital;
    },

    // Supprimer un hôpital
    async deleteHospital(id) {
      await this.handleAction(async () => {
        await apiDeleteHospital(id);
        // Retirer l'hôpital supprimé de la liste
        this.hospitals = this.hospitals.filter(h => h.id !== id);
        // Si l'hôpital supprimé était celui actuellement sélectionné, le vider
        if (this.currentHospital?.id === id) {
          this.currentHospital = null;
        }
      }, 'Hôpital supprimé avec succès.');
    },

    // Réinitialiser les messages de feedback (erreur/succès)
    resetFeedback() {
      this.error = null;
      this.success = null;
    },
  },
});
