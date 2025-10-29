// src/stores/labStore.js

import { defineStore } from 'pinia';
import apiLab from '@/services/apiLab'; // Importez votre service API

export const useLabStore = defineStore('lab', {
  state: () => ({
    labRequests: [], // Liste de toutes les demandes d'analyses
    currentLabRequest: null, // Demande d'analyse actuellement sélectionnée
    loading: false,
    error: null,
    success: null,
  }),

  getters: {
    getLabRequests: (state) => state.labRequests,
    getCurrentLabRequest: (state) => state.currentLabRequest,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    getSuccess: (state) => state.success,
  },

  actions: {
    setLoading(value) {
      this.loading = value;
    },
    setError(message) {
      this.error = message;
      this.success = null;
    },
    setSuccess(message) {
      this.success = message;
      this.error = null;
    },
    clearMessages() {
      this.error = null;
      this.success = null;
    },

    /**
     * Crée une nouvelle demande d'analyse de laboratoire.
     * @param {object} analyseData - Données de la demande d'analyse
     * @returns {Promise<boolean>} Indique si la création a réussi
     */
    async createAnalyseRequest(analyseData) {
      this.clearMessages();
      this.setLoading(true);
      try {
        const result = await apiLab.createAnalyseRequest(analyseData);
        if (result.data) {
          if (!Array.isArray(this.labRequests)) {
            this.labRequests = [];
          }
          this.labRequests.unshift(result.data); // Ajoute la nouvelle demande au début de la liste
        }
        this.setSuccess('Demande d\'analyse créée avec succès.');
        return true;
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        this.setError('Échec de la création de la demande d\'analyse: ' + errorMessage);
        return false;
      } finally {
        this.setLoading(false);
      }
    },

    /**
     * Charge toutes les demandes d'analyses de laboratoire.
     * @param {object} [params={}] - Paramètres de filtrage (ex: { status: 'pending' })
     */
    async listLabRequests(params = {}) {
      this.clearMessages();
      this.setLoading(true);
      try {
        const data = await apiLab.listLabRequests(params);
        this.labRequests = Array.isArray(data) ? data : [];
        this.setSuccess('Demandes d\'analyses chargées avec succès.');
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        this.setError('Échec du chargement des demandes d\'analyses: ' + errorMessage);
        this.labRequests = [];
      } finally {
        this.setLoading(false);
      }
    },

    /**
     * Charge les détails d'une demande d'analyse spécifique.
     * @param {number} requestId - L'ID de la demande d'analyse
     * @returns {Promise<boolean>} Indique si le chargement a réussi
     */
    async getLabRequest(requestId) {
      this.clearMessages();
      this.setLoading(true);
      try {
        const data = await apiLab.getLabRequest(requestId);
        this.currentLabRequest = data;
        this.setSuccess('Détails de la demande d\'analyse chargés avec succès.');
        return true;
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        this.setError('Échec du chargement des détails de la demande d\'analyse: ' + errorMessage);
        this.currentLabRequest = null;
        return false;
      } finally {
        this.setLoading(false);
      }
    },

    /**
     * Met à jour le statut d'une demande d'analyse.
     * @param {number} requestId - L'ID de la demande d'analyse
     * @param {string} status - Le nouveau statut
     * @returns {Promise<boolean>} Indique si la mise à jour a réussi
     */
    async updateLabRequestStatus(requestId, status) {
      this.clearMessages();
      this.setLoading(true);
      try {
        const result = await apiLab.updateLabRequestStatus(requestId, status);
        if (result.lab_request) {
          // Met à jour la demande dans la liste
          const index = this.labRequests.findIndex(req => req.id === requestId);
          if (index !== -1) {
            this.labRequests[index] = result.lab_request;
          }
          // Si c'est la demande actuellement affichée, mettez-la à jour
          if (this.currentLabRequest && this.currentLabRequest.id === requestId) {
            this.currentLabRequest = result.lab_request;
          }
        }
        this.setSuccess('Statut de la demande d\'analyse mis à jour avec succès.');
        return true;
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        this.setError('Échec de la mise à jour du statut de la demande d\'analyse: ' + errorMessage);
        return false;
      } finally {
        this.setLoading(false);
      }
    },

    /**
     * Télécharge les résultats d'analyse pour une demande spécifique.
     * @param {number} requestId - L'ID de la demande d'analyse
     * @param {FormData} formData - Objet FormData contenant les données du formulaire, y compris le fichier.
     * @returns {Promise<boolean>} Indique si le téléchargement a réussi
     */
    async uploadLabResults(requestId, formData) {
      this.clearMessages();
      this.setLoading(true);
      try {
        const result = await apiLab.uploadLabResults(requestId, formData);
        if (result.lab_result) {
          // Optionnel: Mettre à jour la demande parente dans la liste pour refléter le nouveau statut 'completed'
          const index = this.labRequests.findIndex(req => req.id === requestId);
          if (index !== -1) {
            // Vous devrez probablement re-fetcher la demande ou mettre à jour manuellement son statut et ajouter le résultat
            // Pour l'instant, nous mettons à jour le statut si la demande actuelle est celle-ci.
            this.labRequests[index].status = 'completed';
          }
          if (this.currentLabRequest && this.currentLabRequest.id === requestId) {
              this.currentLabRequest.status = 'completed';
              // Optionnel: ajouter le nouveau résultat à la relation 'resultats' si elle existe dans currentLabRequest
              // this.currentLabRequest.resultats = result.lab_result; // Si Analyse a une relation hasOne ou hasMany vers AnalyseRequest
          }
        }
        this.setSuccess('Résultats d\'analyse téléchargés avec succès.');
        return true;
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        this.setError('Échec du téléchargement des résultats d\'analyse: ' + errorMessage);
        return false;
      } finally {
        this.setLoading(false);
      }
    },
  },
});
