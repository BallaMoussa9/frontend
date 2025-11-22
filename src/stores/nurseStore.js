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
  apiExportActivityReport,
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

    async recordVitalSigns(patientId, nurseId, data) {
      this.loading = true;
      this.clearFeedback();
      try {
        const response = await apiRecordVitalSigns(nurseId, patientId, data);
        this.setSuccess(response.message || "Signes vitaux enregistrés avec succès.");
      } catch (error) {
        if (error.response?.data?.message && error.response.status !== 422) {
          this.setError(error.response.data.message);
        } else {
          this.setError("Erreur de connexion ou API : " + error.message);
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createActivitiesReport(nurseId, formData) {
      this.loading = true;
      this.clearFeedback();
      try {
        const reportData = {
          patient_id: formData.patient_id,
          title: formData.title,
          content: formData.content,
          report_date: formData.report_date,
        };
        const response = await apiCreateActivitiesReport(nurseId, reportData);
        this.setSuccess(response.message || "Rapport d'activité créé avec succès !");
      } catch (error) {
        console.error("Erreur dans createActivitiesReport (Store):", error);
        if (error.response?.data?.errors) {
          this.setError("Erreur de validation. Veuillez vérifier vos entrées.");
        } else {
          this.setError(error.response?.data?.message || "Échec de l'enregistrement du rapport d'activité.");
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async exportActivityReport(nurseId, reportId) {
      this.loading = true;
      this.clearFeedback();
      try {
        const response = await apiExportActivityReport(nurseId, reportId);
        this.setSuccess(response.message);
      } catch (error) {
        console.error("Erreur exportActivityReport (Store) :", error);
        this.setError(error.message || "Impossible de télécharger le rapport.");
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
