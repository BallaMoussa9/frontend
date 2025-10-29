// resources/js/stores/mortaliteStore.js

import { defineStore } from 'pinia';
import {
  apiGetAllMortalites,
  apiGetMortalite,
  apiCreateMortalite,
  apiUpdateMortalite,
  apiDeleteMortalite,
} from '@/services/apiMortalite'; // Assurez-vous que le chemin est correct

export const useMortaliteStore = defineStore('mortalite', {
  state: () => ({
    mortalites: [],          // Tableau pour stocker tous les enregistrements de décès
    currentMortalite: null,  // Pour un enregistrement de décès sélectionné ou en cours de modification
    loading: false,          // Indique si une opération est en cours
    error: null,             // Message d'erreur si une opération échoue
    success: null,           // Message de succès si une opération réussit
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
        // L'erreur est déjà propagée par apiMortalite.js
        this.error = error.message;
        throw error; // Rejeter l'erreur pour permettre aux composants d'agir en conséquence si besoin
      } finally {
        this.loading = false;
      }
    },

    // Récupérer tous les enregistrements de décès
    async fetchAllMortalites() {
      await this.handleAction(async () => {
        this.mortalites = await apiGetAllMortalites();
      });
    },

    // Récupérer un enregistrement de décès par son ID
    async fetchMortalite(id) {
      await this.handleAction(async () => {
        this.currentMortalite = await apiGetMortalite(id);
      });
    },

    // Créer un nouvel enregistrement de décès
    async createMortalite(mortaliteData) {
      const newMortalite = await this.handleAction(async () => {
        return await apiCreateMortalite(mortaliteData);
      }, 'Enregistrement de décès créé avec succès.');
      this.mortalites.push(newMortalite); // Ajouter à la liste locale
      this.currentMortalite = newMortalite; // Mettre à jour l'enregistrement courant
      return newMortalite;
    },

    // Mettre à jour un enregistrement de décès existant
    async updateMortalite(id, mortaliteData) {
      const updatedMortalite = await this.handleAction(async () => {
        return await apiUpdateMortalite(id, mortaliteData);
      }, 'Enregistrement de décès mis à jour avec succès.');

      // Mettre à jour l'élément dans le tableau local `mortalites`
      const index = this.mortalites.findIndex(m => m.id === id);
      if (index !== -1) {
        this.mortalites[index] = updatedMortalite;
      }
      // Mettre à jour `currentMortalite` s'il s'agit de la même instance
      if (this.currentMortalite?.id === id) {
        this.currentMortalite = updatedMortalite;
      }
      return updatedMortalite;
    },

    // Supprimer un enregistrement de décès
    async deleteMortalite(id) {
      await this.handleAction(async () => {
        await apiDeleteMortalite(id);
        // Retirer l'enregistrement supprimé du tableau local `mortalites`
        this.mortalites = this.mortalites.filter(m => m.id !== id);
        // Si l'enregistrement supprimé était le `currentMortalite`, le vider
        if (this.currentMortalite?.id === id) {
          this.currentMortalite = null;
        }
      }, 'Enregistrement de décès supprimé avec succès.');
    },

    // Réinitialise les messages de feedback (erreur/succès)
    resetFeedback() {
      this.error = null;
      this.success = null;
    },
  },
});
