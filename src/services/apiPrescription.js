// src/services/apiPrescription.js

// 🚨 Assurez-vous que ce chemin est correct pour votre instance Axios
import API from '@/services/axios';

const apiPrescription = {

  /**
   * Crée une nouvelle prescription avec ses lignes.
   * POST /api/doctors/{doctorId}/patients/{patientId}/prescriptions
   * @param {number} doctorId - L'ID du docteur authentifié (de l'URL)
   * @param {number} patientId - L'ID du patient cible (de l'URL)
   * @param {object} prescriptionData - Données de la prescription (inclut 'lines')
   * @returns {Promise<object>} La prescription créée
   */
  async createPrescription(doctorId, patientId, prescriptionData) {
    try {
      const response = await API.post(`/doctors/${doctorId}/patients/${patientId}/prescriptions`, prescriptionData);
      return response.data; // Retourne { message: ..., data: prescription }
    } catch (error) {
      console.error("Erreur lors de la création de la prescription:", error);
      throw error;
    }
  },
  /**
   * Récupère toutes les prescriptions pour un patient donné.
   * GET /api/patients/{patientId}/prescriptions
   * @param {number} patientId - L'ID du patient
   * @returns {Promise<Array>} Un tableau de prescriptions (peut être vide)
   */
  async fetchPatientPrescriptions(patientId) {
        try {
            const response = await API.get(`/patients/${patientId}/prescriptions`);
            // 🚨 CONSERVATION DE CETTE LIGNE, ELLE EST CORRECTE ET ESSENTIELLE
            console.log("Réponse de l'API pour les prescriptions du patient:", response.data);
            return response.data; // Retourne UNIQUEMENT le tableau de données (ou [] si vide)
        } catch (error) {
            // Propager l'erreur pour que le store puisse la gérer
            throw error;
        }
    },

  /**
   * Récupère une prescription spécifique pour un patient donné.
   * GET /api/patients/{patientId}/prescriptions/{prescriptionId}
   * @param {number} patientId - L'ID du patient
   * @param {number} prescriptionId - L'ID de la prescription
   * @returns {Promise<object>} La prescription
   */
  async fetchPrescriptionById(patientId, prescriptionId) {
    try {
      const response = await API.get(`/patients/${patientId}/prescriptions/${prescriptionId}`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de la prescription par ID:", error);
      throw error;
    }
  },

  /**
   * Met à jour une prescription existante.
   * PATCH /api/prescriptions/{prescriptionId}
   * @param {number} prescriptionId - L'ID de la prescription à mettre à jour
   * @param {object} updateData - Données de mise à jour (peut inclure 'lines')
   * @returns {Promise<object>} La prescription mise à jour
   */
  async updatePrescription(prescriptionId, updateData) {
    try {
      const response = await API.patch(`/prescriptions/${prescriptionId}`, updateData);
      return response.data; // Retourne { message: ..., data: prescription }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la prescription:", error);
      throw error;
    }
  },

  /**
   * Supprime une prescription.
   * DELETE /api/prescriptions/{prescriptionId}
   * @param {number} prescriptionId - L'ID de la prescription à supprimer
   * @returns {Promise<void>}
   */
  async deletePrescription(prescriptionId) {
    try {
      await API.delete(`/prescriptions/${prescriptionId}`);
      // Aucune donnée retournée pour un 204 No Content
    } catch (error) {
      console.error("Erreur lors de la suppression de la prescription:", error);
      throw error;
    }
  },
};

export default apiPrescription;
