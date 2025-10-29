import { defineStore } from "pinia";
import {
  apiCreateNurse,
  apiDeleteNurse,
  apiGetNurse,
  apiGetNurseall,
  apiUpdateNurse,
  apiGetPatientDme,
  apiRecordVitalSigns,
  apiCreateActivitiesReport,
  apiGetBloodBankOverview,
} from "@/services/apiNurse";

export const useNurseStore = defineStore('nurse', {
    state: () => ({
        nurses: [],
        currentNurse: null,
        patientDme: null,
        bloodBankOverview: null,
        loading: false,
        error: null,
        success: null,
    }),

    actions: {

        // 🔑 NOUVELLES ACTIONS DE GESTION DE FEEDBACK
        setError(message) {
            this.error = message;
            this.success = null;
        },

        setSuccess(message) {
            this.success = message;
            this.error = null;
        },

        clearFeedback() {
            this.error = null;
            this.success = null;
        },
        // ------------------------------------------

        async fetchAllNurses() {
            this.loading = true;
            this.clearFeedback();
            try {
                const response = await apiGetNurseall();
                this.nurses = response.data;
                this.setSuccess("Liste des infirmiers récupérée.");
            } catch (error) {
                this.setError(error.message);
            } finally {
                this.loading = false;
            }
        },

        async fetchOneNurse(id) {
            this.loading = true;
            this.clearFeedback();
            try {
                const response = await apiGetNurse(id);
                this.currentNurse = response;
                this.setSuccess("Informations de l'infirmier récupérées.");
            } catch (error) {
                this.setError(error.message);
            } finally {
                this.loading = false;
            }
        },

        async updateNurse(id, data) {
            this.loading = true;
            this.clearFeedback();
            try {
                await apiUpdateNurse(id, data);
                await this.fetchOneNurse(id);
                this.setSuccess("Infirmier mis à jour avec succès.");
            } catch (error) {
                this.setError(error.message);
            } finally {
                this.loading = false;
            }
        },

        async deleteNurse(id) {
            this.loading = true;
            this.clearFeedback();
            try {
                await apiDeleteNurse(id);
                await this.fetchAllNurses();
                this.setSuccess("Infirmier supprimé avec succès.");
            } catch (error) {
                this.setError(error.message);
            } finally {
                this.loading = false;
            }
        },

        async createNurse(data) {
            this.loading = true;
            this.clearFeedback();
            try {
                await apiCreateNurse(data);
                await this.fetchAllNurses();
                this.setSuccess("Infirmier créé avec succès.");
            } catch (error) {
                this.setError(error.message);
            } finally {
                this.loading = false;
            }
        },

        // --- Nouvelles actions pour les fonctionnalités spécifiques à l'infirmier ---

        async fetchPatientDme(nurseId, patientId) {
            this.loading = true;
            this.clearFeedback();
            try {
                this.patientDme = await apiGetPatientDme(nurseId, patientId);
                this.setSuccess("Dossier médical récupéré.");
            } catch (error) {
                this.setError(error.message);
            } finally {
                this.loading = false;
            }
        },

        /**
         * Enregistre les signes vitaux.
         * Note : La logique de gestion des erreurs 422 est déplacée au niveau de la vue (VitalSignsFormView.vue)
         * pour afficher les messages de validation détaillés.
         */
        async recordVitalSigns(patientId, nurseId, data) {
            this.loading = true;
            this.clearFeedback();
            try {
                // L'API attend (nurseId, patientId, data)
                const response = await apiRecordVitalSigns(nurseId, patientId, data);
                this.setSuccess(response.message || "Signes vitaux enregistrés avec succès.");
            } catch (error) {
                // 🔑 Gestion plus fine de l'erreur dans le store:
                // Si l'erreur a un message de réponse (ex: 422), on l'utilise
                if (error.response && error.response.data && error.response.data.message) {
                    // On ne définit PAS d'erreur ici pour laisser la vue gérer les erreurs 422 détaillées.
                    // Si ce n'est pas une 422 (ex: 500), on définit une erreur générique.
                    if (error.response.status !== 422) {
                        this.setError(error.response.data.message);
                    }
                } else {
                    this.setError("Erreur de connexion ou API : " + error.message);
                }
                // Important : on relance l'erreur pour que le bloc catch de la vue soit exécuté.
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async createActivitiesReport(nurseId, data) {
            this.loading = true;
            this.clearFeedback();
            try {
                const response = await apiCreateActivitiesReport(nurseId, data);
                this.setSuccess(response.message);
            } catch (error) {
                this.setError(error.message);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchBloodBankOverview(nurseId) {
            this.loading = true;
            this.clearFeedback();
            try {
                this.bloodBankOverview = await apiGetBloodBankOverview(nurseId);
                this.setSuccess("Aperçu de la banque de sang récupéré.");
            } catch (error) {
                this.setError(error.message);
            } finally {
                this.loading = false;
            }
        },
    },

    getters: {
        activeNurses: (state) => state.nurses.filter(n => n.status === 'active')
    }
});
