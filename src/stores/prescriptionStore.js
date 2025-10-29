// src/stores/prescriptionStore.js

import { defineStore } from 'pinia';
import apiPrescription from '@/services/apiPrescription'; // Assurez-vous d'avoir ce service bien défini
import { useAuthStore } from './authStores'; // Assurez-vous d'avoir un authStore pour le user/doctor ID

export const usePrescriptionStore = defineStore('prescription', {
  state: () => ({
    prescriptions: [], // Liste des prescriptions chargées
    currentPrescription: null, // Prescription actuellement affichée/éditée
    loading: false,
    error: null, // Erreur générique
    authError: null, // 🚨 NOUVEAU: Erreur spécifique pour l'autorisation (par exemple 403)
    success: null,
  }),

  getters: {
    getPrescriptions: (state) => state.prescriptions,
    getCurrentPrescription: (state) => state.currentPrescription,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    getAuthError: (state) => state.authError, // 🚨 NOUVEAU GETTER
    getSuccess: (state) => state.success,
  },

  actions: {
    setLoading(value) {
      this.loading = value;
    },
    setError(message) {
      this.error = message;
      this.authError = null; // S'assurer que les autres erreurs réinitialisent l'erreur d'auth
      this.success = null;
    },
    setSuccess(message) {
      this.success = message;
      this.error = null;
      this.authError = null; // Réinitialiser l'erreur d'auth en cas de succès
    },
    clearMessages() {
      this.error = null;
      this.authError = null; // 🚨 NOUVEAU: Réinitialise aussi l'erreur d'autorisation
      this.success = null;
    },

    /**
     * Crée une nouvelle prescription.
     * @param {number} patientId - L'ID du patient cible
     * @param {object} prescriptionData - Données de la prescription (inclut 'lines')
     * @returns {Promise<boolean>} Indique si la création a réussi
     */
    // Dans src/stores/prescriptionStore.js, à l'intérieur de 'actions: {'

    async createPrescription(doctorId, patientId, prescriptionData) { // 🚨 doctorId est maintenant un argument
      this.clearMessages();
      this.setLoading(true);
      // const authStore = useAuthStore(); // 🚨 PLUS BESOIN d'importer useAuthStore ici pour doctorId
      // const doctorId = authStore.user?.doctor?.id; // 🚨 PLUS BESOIN de cette ligne

      // Validation de sécurité : s'assurer que doctorId est bien pass

      try {
        // 🚨 L'appel API utilise maintenant le doctorId passé en argument
        const result = await apiPrescription.createPrescription(doctorId, patientId, prescriptionData);
        if (result.data) {
            // Dans un contexte où on affiche les ordonnances d'UN patient spécifique,
            // il est préférable de rafraîchir la liste ou d'ajouter si le patient ID correspond.
            // Pour l'instant, on se contente de l'ajouter si la liste existe.
            if (!Array.isArray(this.prescriptions)) {
                this.prescriptions = [];
            }
            this.prescriptions.unshift(result.data); // Ajouter au début
        }
        this.setSuccess('Ordonnance émise avec succès !');
        return { success: true, data: result.data }; // Retourne un objet pour une gestion plus flexible
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        this.setError('Échec de l\'émission de l\'ordonnance: ' + errorMessage);
        return { success: false, error: errorMessage }; // Retourne un objet pour une gestion plus flexible
      } finally {
        this.setLoading(false);
      }
    },

    /**
     * Charge toutes les prescriptions pour un patient donné.
     * @param {number} patientId - L'ID du patient
     */
    /**
     * Charge toutes les prescriptions pour un patient donné.
     * @param {number} patientId - L'ID du patient
     */
  /**
     * Charge toutes les prescriptions pour un patient donné.
     * @param {number} patientId - L'ID du patient
     */
   async fetchPatientPrescriptions(patientId) {
      this.clearMessages();
      this.setLoading(true);
      try {
        // 🚨 CORRECTION : On nomme la variable 'data' car le service ne retourne que les données.
        const data = await apiPrescription.fetchPatientPrescriptions(patientId);

        // 🚨 CORRECTION : On log 'data' directement, sans accéder à '.data'
        console.log("API a renvoyé les ordonnances brutes :", data);

        // 🚨 CORRECTION : On utilise 'data' pour mettre à jour l'état.
        this.prescriptions = Array.isArray(data) ? data : [];
        this.setSuccess('Ordonnances du patient chargées avec succès.');
      } catch (err) {
        // ... (gestion des erreurs inchangée) ...
      } finally {
        this.setLoading(false);
      }
    },
    /**
     * Charge une prescription spécifique par son ID.
     * @param {number} patientId - L'ID du patient auquel appartient la prescription (peut être omis si l'API ne l'exige pas)
     * @param {number} prescriptionId - L'ID de la prescription
     * @returns {Promise<boolean>} Indique si le chargement a réussi
     */
    async fetchPrescriptionById(patientId, prescriptionId) { // patientId peut être optionnel selon l'API
      this.clearMessages();
      this.setLoading(true);
      try {
        const data = await apiPrescription.fetchPrescriptionById(patientId, prescriptionId); // Assurez-vous que apiPrescription.fetchPrescriptionById gère patientId
        this.currentPrescription = data;
        this.setSuccess('Ordonnance chargée avec succès.');
        return true;
      } catch (err) {
        if (err.response && err.response.status === 403) {
            this.authError = err.response.data.message || "Vous n'êtes pas autorisé à consulter cette ordonnance.";
        } else {
            const errorMessage = err.response?.data?.message || err.message;
            this.setError('Échec du chargement de l\'ordonnance: ' + errorMessage);
        }
        this.currentPrescription = null;
        console.error("❌ Erreur lors du chargement de l'ordonnance:", err);
        return false;
      } finally {
        this.setLoading(false);
      }
    },

    /**
     * Met à jour une prescription existante.
     * @param {number} prescriptionId - L'ID de la prescription à mettre à jour
     * @param {object} updateData - Données de mise à jour (inclut potentiellement 'lines')
     * @returns {Promise<boolean>} Indique si la mise à jour a réussi
     */
    async updatePrescription(prescriptionId, updateData) {
      this.clearMessages();
      this.setLoading(true);
      try {
        const result = await apiPrescription.updatePrescription(prescriptionId, updateData);
        if (result.data) {
          const index = this.prescriptions.findIndex(p => p.id === prescriptionId);
          if (index !== -1) {
            this.prescriptions[index] = result.data;
          }
          if (this.currentPrescription && this.currentPrescription.id === prescriptionId) {
            this.currentPrescription = result.data;
          }
        }
        this.setSuccess('Ordonnance mise à jour avec succès !');
        return true;
      } catch (err) {
        if (err.response && err.response.status === 403) {
            this.authError = err.response.data.message || "Vous n'êtes pas autorisé à modifier cette ordonnance.";
        } else {
            const errorMessage = err.response?.data?.message || err.message;
            this.setError('Échec de la mise à jour de l\'ordonnance: ' + errorMessage);
        }
        console.error("❌ Erreur lors de la mise à jour de l'ordonnance:", err);
        return false;
      } finally {
        this.setLoading(false);
      }
    },

    /**
     * Supprime une prescription.
     * @param {number} prescriptionId - L'ID de la prescription à supprimer
     * @returns {Promise<boolean>} Indique si la suppression a réussi
     */
    async deletePrescription(prescriptionId) {
      this.clearMessages();
      this.setLoading(true);
      try {
        await apiPrescription.deletePrescription(prescriptionId);
        this.prescriptions = this.prescriptions.filter(p => p.id !== prescriptionId);
        if (this.currentPrescription && this.currentPrescription.id === prescriptionId) {
          this.currentPrescription = null;
        }
        this.setSuccess('Ordonnance supprimée avec succès.');
        return true;
      } catch (err) {
        if (err.response && err.response.status === 403) {
            this.authError = err.response.data.message || "Vous n'êtes pas autorisé à supprimer cette ordonnance.";
        } else {
            const errorMessage = err.response?.data?.message || err.message;
            this.setError('Échec de la suppression de l\'ordonnance: ' + errorMessage);
        }
        console.error("❌ Erreur lors de la suppression de l'ordonnance:", err);
        return false;
      } finally {
        this.setLoading(false);
      }
    },
  },
});
