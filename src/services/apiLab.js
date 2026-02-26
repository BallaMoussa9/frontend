// src/services/apiLab.js

import API from '@/services/axios'; // Assurez-vous que ce chemin est correct

const apiLab = {

  /**
   * Crée une nouvelle demande d'analyse de laboratoire.
   * POST /api/lab/analyses
   * @param {object} analyseData - Données de la demande d'analyse
   * @returns {Promise<object>} La demande d'analyse créée
   */
  async createAnalyseRequest(analyseData) {
    try { 
      const response = await API.post(`/lab/analyses`, analyseData);
      return response.data; // Retourne { message: ..., data: analyse }
    } catch (error) {
      console.error("Erreur lors de la création de la demande d'analyse:", error);
      throw error;
    }
  },

  /**
   * Récupère la liste de toutes les demandes d'analyses de laboratoire.
   * GET /api/lab/requests
   * @param {object} [params] - Paramètres de requête (ex: { status: 'pending' })
   * @returns {Promise<Array<object>>} Tableau des demandes d'analyses
   */
  async listLabRequests(params = {}) {
    try {
      const response = await API.get(`/lab/requests`, { params });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des demandes d'analyses:", error);
      throw error;
    }
  },

  /**
   * Récupère les détails d'une demande d'analyse spécifique.
   * GET /api/lab/requests/{requestId}
   * @param {number} requestId - L'ID de la demande d'analyse (Analyse)
   * @returns {Promise<object>} La demande d'analyse détaillée
   */
  async getLabRequest(requestId) {
    try {
      const response = await API.get(`/lab/requests/${requestId}`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de la demande d'analyse:", error);
      throw error;
    }
  },

  /**
   * Met à jour le statut d'une demande d'analyse.
   * PUT /api/lab/requests/{requestId}/status
   * @param {number} requestId - L'ID de la demande d'analyse (Analyse)
   * @param {string} status - Le nouveau statut
   * @returns {Promise<object>} La demande d'analyse mise à jour
   */
  async updateLabRequestStatus(requestId, status) {
    try {
      const response = await API.put(`/lab/requests/${requestId}/status`, { status });
      return response.data; // Retourne { message: ..., lab_request: analyse }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut de la demande d'analyse:", error);
      throw error;
    }
  },

  /**
   * Télécharge les résultats d'analyse pour une demande spécifique.
   * POST /api/lab/requests/{requestId}/results
   * @param {number} requestId - L'ID de la demande d'analyse (Analyse)
   * @param {object} formData - Un objet FormData contenant les résultats (y compris 'result_file')
   * @returns {Promise<object>} Les résultats d'analyse enregistrés
   */
  async uploadLabResults(requestId, formData) {
    try {
      const response = await API.post(`/lab/requests/${requestId}/results`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important pour l'upload de fichiers
        },
      });
      return response.data; // Retourne { message: ..., lab_result: resultat }
    } catch (error) {
      console.error("Erreur lors du téléchargement des résultats d'analyse:", error);
      throw error;
    }
  },
  async getCompletedAnalyses() {
    try {
      const response = await API.get(`/lab/ready-analyses`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des analyses terminées:", error);
      throw error;
    }
  },
  /**
   * Récupère tout le stock de sang disponible.
   * GET /api/lab/blood-stock
   */
  async getBloodStock() {
    try {
      const response = await API.get(`/lab/blood-stock`);
      return response.data;
    } catch (error) {
      console.error("Erreur récupération stock de sang:", error);
      throw error;
    }
  },
  /**
   * Enregistre un prélèvement de sang lié à un patient.
   * POST /api/lab/blood-store
   * @param {object} bloodData - { patient_id, unit_number, collection_date, expiration_date, location, status }
   */
  async storeBloodUnit(bloodData) {
    try {
      const response = await API.post(`/lab/blood-store`, bloodData);
      return response.data;
    } catch (error) {
      console.error("Erreur enregistrement sang:", error);
      throw error;
    }
  }
};


export default apiLab;
