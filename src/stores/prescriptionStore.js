// src/stores/prescriptionStore.js - VERSION CORRIGÉE

import { defineStore } from 'pinia';
import apiPrescription from '@/services/apiPrescription';
import { useConsultationStore } from './consultationStore'; // 🔥 IMPORT AJOUTÉ

export const usePrescriptionStore = defineStore('prescription', {
  state: () => ({
    prescriptions: [],
    currentPrescription: null,
    loading: false,
    error: null,
    authError: null,
    success: null,
    // 🔥 AJOUT: Stocker les IDs pour faciliter les appels
    currentDoctorId: null,
    currentPatientId: null,
  }),

  getters: {
    getPrescriptions: (state) => state.prescriptions,
    getCurrentPrescription: (state) => state.currentPrescription,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    getAuthError: (state) => state.authError,
    getSuccess: (state) => state.success,
  },

  actions: {
    setLoading(value) {
      this.loading = value;
    },
    
    setError(message) {
      this.error = message;
      this.authError = null;
      this.success = null;
    },
    
    setSuccess(message) {
      this.success = message;
      this.error = null;
      this.authError = null;
    },
    
    clearMessages() {
      this.error = null;
      this.authError = null;
      this.success = null;
    },

    // 🔥 NOUVELLE ACTION: Définir les IDs courants
    setCurrentIds(doctorId, patientId) {
      this.currentDoctorId = doctorId;
      this.currentPatientId = patientId;
    },

    /**
     * Crée une nouvelle prescription avec gestion automatique de la consultation
     * @param {number} doctorId - L'ID du docteur
     * @param {number} patientId - L'ID du patient  
     * @param {object} prescriptionData - Données de la prescription (inclut 'lines')
     * @returns {Promise<object>} Résultat de la création
     */
    async createPrescription(doctorId, patientId, prescriptionData) {
  this.clearMessages();
  this.setLoading(true);
  
  try {
    console.log('🔄 Début création prescription...', { 
      doctorId, 
      patientId, 
      prescriptionData 
    });

    // 🔥 ÉTAPE 1: Préparer une consultation d'abord
    const consultationStore = useConsultationStore();
    const consultationResult = await consultationStore.prepareConsultationForPrescription(
      doctorId, 
      patientId,
      {
        motif: prescriptionData.motif || 'Consultation pour ordonnance',
        diagnostic: prescriptionData.diagnostic,
        notes: prescriptionData.notes
      }
    );
    
    if (!consultationResult.success) {
      throw new Error(consultationResult.error || 'Impossible de préparer la consultation');
    }
    
    console.log('✅ Consultation préparée, création ordonnance...');
    
    // 🔥 ÉTAPE 2: Créer la prescription
    const result = await apiPrescription.createPrescription(doctorId, patientId, prescriptionData);
    
    if (result.data) {
      if (!Array.isArray(this.prescriptions)) {
        this.prescriptions = [];
      }
      this.prescriptions.unshift(result.data);
    }
    
    this.setSuccess('Ordonnance émise avec succès !');
    console.log('✅ Ordonnance créée avec succès:', result.data);
    
    return { success: true, data: result.data };
    
  } catch (err) {
    // 🔥 AFFICHER LES ERREURS DE VALIDATION DÉTAILLÉES
    console.error('❌ Erreur détaillée création prescription:', err.response?.data);
    
    const errorMessage = err.response?.data?.message || err.message;
    const validationErrors = err.response?.data?.errors;
    
    if (validationErrors) {
      console.log('🔍 Erreurs de validation:', validationErrors);
      // Afficher les erreurs spécifiques
      Object.keys(validationErrors).forEach(field => {
        console.log(`- ${field}:`, validationErrors[field]);
      });
    }
    
    this.setError('Échec de l\'émission de l\'ordonnance: ' + errorMessage);
    return { 
      success: false, 
      error: errorMessage,
      validationErrors: validationErrors 
    };
  } finally {
    this.setLoading(false);
  }
},

    /**
     * Version simplifiée utilisant les IDs stockés
     * @param {object} prescriptionData - Données de la prescription
     */
    async createPrescriptionSimple(prescriptionData) {
      if (!this.currentDoctorId || !this.currentPatientId) {
        throw new Error('DoctorId ou PatientId non défini');
      }
      return await this.createPrescription(this.currentDoctorId, this.currentPatientId, prescriptionData);
    },

    /**
     * Charge toutes les prescriptions pour un patient donné.
     * @param {number} patientId - L'ID du patient
     */
    async fetchPatientPrescriptions(patientId) {
  this.clearMessages();
  this.setLoading(true);
  try {
    console.log('🔄 Store: Chargement prescriptions patient ID:', patientId);
    const data = await apiPrescription.fetchPatientPrescriptions(patientId);
    
    console.log('✅ Store: Données reçues de l\'API:', {
      type: typeof data,
      isArray: Array.isArray(data),
      count: Array.isArray(data) ? data.length : 'non-array',
      sample: Array.isArray(data) && data.length > 0 ? data[0] : 'vide'
    });
    
    this.prescriptions = Array.isArray(data) ? data : [];
    this.setSuccess('Ordonnances chargées avec succès.');
    
  } catch (err) {
    console.error('❌ Store: Erreur chargement prescriptions:', err);
    const errorMessage = err.response?.data?.message || err.message;
    this.setError('Échec du chargement: ' + errorMessage);
    this.prescriptions = [];
  } finally {
    this.setLoading(false);
  }
},

    /**
     * Charge une prescription spécifique par son ID.
     * @param {number} patientId - L'ID du patient
     * @param {number} prescriptionId - L'ID de la prescription
     * @returns {Promise<boolean>} Indique si le chargement a réussi
     */
    async fetchPrescriptionById(patientId, prescriptionId) {
      this.clearMessages();
      this.setLoading(true);
      try {
        const data = await apiPrescription.fetchPrescriptionById(patientId, prescriptionId);
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
     * @param {object} updateData - Données de mise à jour
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