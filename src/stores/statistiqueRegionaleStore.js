// resources/js/stores/statistiqueRegionaleStore.js

import { defineStore } from 'pinia';
import {
  apiGetAllStatistiquesRegionales,
  apiGetStatistiqueRegionale,
  apiCreateStatistiqueRegionale,
  apiUpdateStatistiqueRegionale,
  apiDeleteStatistiqueRegionale,
} from '@/services/apiStatistiqueRegionale'; // Assurez-vous que le chemin est correct

export const useStatistiqueRegionaleStore = defineStore('statistiqueRegionale', {
  state: () => ({
    statistiquesRegionales: [],          // Tableau pour stocker toutes les statistiques régionales
    currentStatistiqueRegionale: null,   // Pour une statistique sélectionnée ou en cours de modification
    loading: false,                      // Indique si une opération est en cours
    error: null,                         // Message d'erreur si une opération échoue
    success: null,                       // Message de succès si une opération réussit
  }),

  actions: {
    // Fonction utilitaire pour centraliser la gestion du loading/error/success pour les actions asynchrones
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
        // L'erreur est déjà propagée par apiStatistiqueRegionale.js
        this.error = error.message;
        throw error; // Rejeter l'erreur pour permettre aux composants d'agir en conséquence si besoin
      } finally {
        this.loading = false;
      }
    },

    // Récupérer toutes les statistiques régionales
    async fetchAllStatistiquesRegionales() {
      await this.handleAction(async () => {
        this.statistiquesRegionales = await apiGetAllStatistiquesRegionales();
      });
    },

    // Récupérer une statistique régionale par son ID
    async fetchStatistiqueRegionale(id) {
      await this.handleAction(async () => {
        this.currentStatistiqueRegionale = await apiGetStatistiqueRegionale(id);
      });
    },

    // Créer une nouvelle statistique régionale
    async createStatistiqueRegionale(statData) {
      const newStat = await this.handleAction(async () => {
        return await apiCreateStatistiqueRegionale(statData);
      }, 'Statistique régionale créée avec succès.');
      this.statistiquesRegionales.push(newStat); // Ajouter à la liste locale
      this.currentStatistiqueRegionale = newStat; // Mettre à jour la statistique courante
      return newStat;
    },

    // Mettre à jour une statistique régionale existante
    async updateStatistiqueRegionale(id, statData) {
      const updatedStat = await this.handleAction(async () => {
        return await apiUpdateStatistiqueRegionale(id, statData);
      }, 'Statistique régionale mise à jour avec succès.');

      // Mettre à jour l'élément dans le tableau local `statistiquesRegionales`
      const index = this.statistiquesRegionales.findIndex(s => s.id === id);
      if (index !== -1) {
        this.statistiquesRegionales[index] = updatedStat;
      }
      // Mettre à jour `currentStatistiqueRegionale` s'il s'agit de la même instance
      if (this.currentStatistiqueRegionale?.id === id) {
        this.currentStatistiqueRegionale = updatedStat;
      }
      return updatedStat;
    },

    // Supprimer une statistique régionale
    async deleteStatistiqueRegionale(id) {
      await this.handleAction(async () => {
        await apiDeleteStatistiqueRegionale(id);
        // Retirer l'enregistrement supprimé du tableau local `statistiquesRegionales`
        this.statistiquesRegionales = this.statistiquesRegionales.filter(s => s.id !== id);
        // Si la statistique supprimée était la `currentStatistiqueRegionale`, la vider
        if (this.currentStatistiqueRegionale?.id === id) {
          this.currentStatistiqueRegionale = null;
        }
      }, 'Statistique régionale supprimée avec succès.');
    },

    // Réinitialise les messages de feedback (erreur/succès)
    resetFeedback() {
      this.error = null;
      this.success = null;
    },
  },
});
