// src/stores/consultationStore.js

import { defineStore } from 'pinia';
import apiConsultation from '@/services/apiConsultation';

export const useConsultationStore = defineStore('consultation', {
  state: () => ({
    currentConsultation: null, // La consultation active/en cours
    patientConsultations: [], // 🚨 NOUVEAU: Tableau pour l'historique des consultations du patient
    loading: false,
    error: null,
    success: null,
  }),

  getters: {
    getCurrentConsultation: (state) => state.currentConsultation,
    getPatientConsultations: (state) => state.patientConsultations, // 🚨 NOUVEAU GETTER
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    getSuccess: (state) => state.success,
  },

  actions: {
    clearMessages() {
      this.error = null;
      this.success = null;
    },
    setSuccess(message) {
      this.success = message;
      this.error = null;
    },
    setError(message) {
      this.error = message;
      this.success = null;
    },


    /**
     * Démarre une nouvelle consultation pour un patient.
     * POST /api/patients/{patientId}/consultations/start
     * @param {number} patientId
     * @param {object} startData
     * @returns {Promise<boolean>}
     */
    async startConsultation(patientId, startData) {
      this.clearMessages();
      this.loading = true;
      try {
        const result = await apiConsultation.startConsultation(patientId, startData);
        this.currentConsultation = result.consultation;
        this.setSuccess(result.message || 'Consultation démarrée avec succès.');
        return true;
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        this.setError('Échec du démarrage de la consultation: ' + errorMessage);
        return false;
      } finally {
        this.loading = false;
      }
    },
    // 🔥 LA SEULE MÉTHODE MANQUANTE - À AJOUTER dans consultationStore.js
// src/stores/consultationStore.js - GARDER UNE SEULE MÉTHODE

async prepareConsultationForPrescription(doctorId, patientId, consultationData = {}) {
  this.clearMessages();
  this.loading = true;
  
  try {
    console.log('🔄 Vérification consultation pour ordonnance...', { doctorId, patientId });
    
    // 1. Vérifier s'il existe déjà une consultation valide
    await this.fetchPatientConsultations(patientId);
    
    const existingConsultation = this.patientConsultations.find(consultation => 
      consultation.doctor_id === doctorId && 
      consultation.patient_id === patientId &&
      (consultation.status === 'completed' || consultation.status === 'in_progress')
    );
    
    if (existingConsultation) {
      console.log('✅ Consultation valide existante:', existingConsultation);
      this.currentConsultation = existingConsultation;
      return { success: true, consultation: existingConsultation, isNew: false };
    }
    
    // 2. Sinon, créer une nouvelle consultation automatiquement
    console.log('🔄 Création automatique consultation pour ordonnance...');
    
    const startData = {
      type: consultationData.type || 'consultation',
      motif: consultationData.motif || 'Consultation pour prescription médicale'
    };
    
    // 🔥 CORRECTION : Ajouter doctorId à l'appel
    const startResult = await apiConsultation.startConsultation(doctorId, patientId, startData);
    console.log('📝 Consultation démarrée:', startResult.consultation);
    
    const endData = {
      diagnostic: consultationData.diagnostic || 'Bilan médical effectué',
      traitement: consultationData.traitement || 'Médication prescrite',
      notes: consultationData.notes || 'Ordonnance à émettre',
      observations: consultationData.observations || 'État stable'
    };
    
    const endResult = await apiConsultation.endConsultation(startResult.consultation.id, endData);
    
    this.currentConsultation = endResult.consultation;
    this.setSuccess('Consultation préparée pour ordonnance');
    
    return { 
      success: true, 
      consultation: endResult.consultation, 
      isNew: true 
    };
    
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message;
    this.setError('Échec de la préparation de la consultation: ' + errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    this.loading = false;
  }
},

    /**
     * Termine une consultation.
     * PUT /api/consultations/{consultationId}/end
     * @param {number} consultationId
     * @param {object} endData
     * @returns {Promise<boolean>}
     */
    async endConsultation(consultationId, endData) {
      this.clearMessages();
      this.loading = true;
      try {
        const result = await apiConsultation.endConsultation(consultationId, endData);

        if (this.currentConsultation?.id === consultationId) {
          this.currentConsultation = result.consultation;
        }
        this.setSuccess(result.message || 'Consultation terminée avec succès.');
        return true;
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        this.setError('Échec de la finalisation de la consultation: ' + errorMessage);
        return false;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Met à jour l'historique (DME) pour la consultation en cours.
     * PUT /api/consultations/{consultationId}/dme
     * @param {number} consultationId
     * @param {object} dmeData - Données du formulaire pour ConsultationHistory
     * @returns {Promise<boolean>}
     */
    async updatePatientDme(consultationId, dmeData) {
      this.clearMessages();
      this.loading = true;

      try {
        const result = await apiConsultation.updatePatientDme(consultationId, dmeData);
        this.setSuccess(result.message || 'DME mis à jour avec succès.');
        return true;
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        this.setError('Échec de l\'enregistrement de l\'entrée DME: ' + errorMessage);
        return false;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 🚨 NOUVELLE ACTION : Récupère la liste des consultations pour un patient donné.
     * @param {number} patientId - L'ID du patient
     * @returns {Promise<boolean>} Indique si la récupération a réussi
     */
    async fetchPatientConsultations(patientId) {
      this.clearMessages();
      this.loading = true;
      try {
        const consultations = await apiConsultation.fetchPatientConsultations(patientId);
        this.patientConsultations = consultations; // Met à jour l'état avec les consultations
        return true;
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        this.setError('Échec de la récupération des consultations: ' + errorMessage);
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});
