// resources/js/stores/naissanceStore.js

import { defineStore } from 'pinia';
import {
  apiGetAllNaissances,
  apiGetNaissance,
  apiCreateNaissance,
  apiUpdateNaissance,
  apiDeleteNaissance,
} from '@/services/apiNaissance'; // Assurez-vous que le chemin est correct

export const useNaissanceStore = defineStore('naissance', {
  state: () => ({
    naissances: [],          // Tableau pour stocker toutes les naissances
    currentNaissance: null,  // Pour une naissance sélectionnée ou en cours de modification
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
        // L'erreur est déjà propagée par apiNaissance.js
        this.error = error.message;
        throw error; // Rejeter l'erreur pour permettre aux composants d'agir en conséquence si besoin
      } finally {
        this.loading = false;
      }
    },

    // Récupérer tous les enregistrements de naissances
    async fetchAllNaissances() {
      await this.handleAction(async () => {
        this.naissances = await apiGetAllNaissances();
      });
    },

    // Récupérer un enregistrement de naissance par son ID
    async fetchNaissance(id) {
      await this.handleAction(async () => {
        this.currentNaissance = await apiGetNaissance(id);
      });
    },

    // Créer un nouvel enregistrement de naissance
    async createNaissance(naissanceData) {
      const newNaissance = await this.handleAction(async () => {
        return await apiCreateNaissance(naissanceData);
      }, 'Enregistrement de naissance créé avec succès.');
      this.naissances.push(newNaissance); // Ajouter à la liste locale
      this.currentNaissance = newNaissance; // Mettre à jour la naissance courante
      return newNaissance;
    },

    // Mettre à jour un enregistrement de naissance existant
    async updateNaissance(id, naissanceData) {
      const updatedNaissance = await this.handleAction(async () => {
        return await apiUpdateNaissance(id, naissanceData);
      }, 'Enregistrement de naissance mis à jour avec succès.');

      // Mettre à jour l'élément dans le tableau local `naissances`
      const index = this.naissances.findIndex(n => n.id === id);
      if (index !== -1) {
        this.naissances[index] = updatedNaissance;
      }
      // Mettre à jour `currentNaissance` s'il s'agit de la même instance
      if (this.currentNaissance?.id === id) {
        this.currentNaissance = updatedNaissance;
      }
      return updatedNaissance;
    },

    // Supprimer un enregistrement de naissance
    async deleteNaissance(id) {
      await this.handleAction(async () => {
        await apiDeleteNaissance(id);
        // Retirer l'enregistrement supprimé du tableau local `naissances`
        this.naissances = this.naissances.filter(n => n.id !== id);
        // Si la naissance supprimée était la `currentNaissance`, la vider
        if (this.currentNaissance?.id === id) {
          this.currentNaissance = null;
        }
      }, 'Enregistrement de naissance supprimé avec succès.');
    },

    // Réinitialise les messages de feedback (erreur/succès)
    resetFeedback() {
      this.error = null;
      this.success = null;
    },
  },
});
