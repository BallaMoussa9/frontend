// src/services/apiConsultation.js

import API from '@/services/axios';

const apiConsultation = {

  /**
   * Démarre une nouvelle consultation.
   * POST /api/patients/{patientId}/consultations/start
   * @param {number} patientId - L'ID du patient (de la route)
   * @param {object} startData - Données initiales (type, motif)
   * @returns {Promise<object>} La consultation démarrée
   */
  async startConsultation(patientId, startData) {
    try {
      const response = await API.post(`/patients/${patientId}/consultations/start`, startData);
      return response.data; // { message: ..., consultation: {} }
    } catch (error) {
      console.error("Erreur lors du démarrage de la consultation:", error);
      throw error;
    }
  },

  /**
   * Termine une consultation.
   * PUT /api/consultations/{consultationId}/end
   * @param {number} consultationId - L'ID de la consultation
   * @param {object} endData - Diagnostic, traitement, notes, observations
   * @returns {Promise<object>} La consultation terminée
   */
  async endConsultation(consultationId, endData) {
    try {
      const response = await API.put(`/consultations/${consultationId}/end`, endData);
      return response.data; // { message: ..., consultation: {} }
    } catch (error) {
      console.error("Erreur lors de la fin de la consultation:", error);
      throw error;
    }
  },

  /**
   * Ajoute une entrée dans l'historique de consultation (Mise à jour du DME).
   * PUT /api/consultations/{consultationId}/dme
   * * @param {number} consultationId - L'ID de la consultation en cours
   * @param {object} dmeData - Les données de l'historique (diagnostic, traitement, etc.)
   * @returns {Promise<object>} L'entrée ConsultationHistory créée
   */
  async updatePatientDme(consultationId, dmeData) {
    try {
      const response = await API.put(`/consultations/${consultationId}/dme`, dmeData);
      return response.data; // { message: ..., data: historicalEntry }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du DME/Historique de consultation:", error);
      throw error;
    }
  },

  /**
   * 🚨 NOUVELLE MÉTHODE : Récupère l'historique des consultations pour un patient.
   * GET /api/patients/{patientId}/consultations
   * @param {number} patientId - L'ID du patient.
   * @returns {Promise<Array<object>>} Tableau des consultations du patient.
   */
  async fetchPatientConsultations(patientId) {
    try {
      const response = await API.get(`/patients/${patientId}/consultations`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des consultations du patient:", error);
      throw error;
    }
  },
};

export default apiConsultation;
