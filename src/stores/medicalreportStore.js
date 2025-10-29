// src/stores/medicalReportStore.js
import { defineStore } from 'pinia';
// Correction ici : Assurez-vous d'importer les noms corrects des fonctions d'API
import {
  fetchMedicalReportsByDoctorAndPatient, // Utilisé pour GET /doctors/{doctorId}/patients/{patientId}/medical-reports
  createMedicalReportByDoctorAndPatient, // Utilisé pour POST /doctors/{doctorId}/patients/{patientId}/medical-reports
  createMedicalReportLegacy,             // Utilisé pour POST /medicalreports/register/{patient}
  getAllMedicalReports,                  // Utilisé pour GET /medicalreports
  searchMedicalReports,                  // Utilisé pour GET /medicalreports/search
  getMedicalReportById,                  // Utilisé pour GET /medicalreports/{report}
  updateMedicalReport,                   // Utilisé pour PUT /medicalreports/{report}
  deleteMedicalReport,                   // Utilisé pour DELETE /medicalreports/{report}
  downloadMedicalReport,                 // Utilisé pour GET /medicalreports/{report}/download
} from '@/services/apiMedicalReport'; // Import du service API pour les rapports médicaux

export const useMedicalReportStore = defineStore('medicalReport', {
  state: () => ({
    medicalReports: [], // Pour stocker les listes de rapports
    currentReport: null, // Pour stocker un rapport unique (pour show/update)
    isLoading: false,
    error: null,
    success: null,
    pagination: {
      current_page: 1,
      last_page: 1,
      per_page: 30, // Par défaut selon votre contrôleur
      total: 0,
    },
  }),

  getters: {
    getMedicalReports: (state) => state.medicalReports,
    getCurrentReport: (state) => state.currentReport,
    getIsLoading: (state) => state.isLoading,
    getError: (state) => state.error,
    getSuccess: (state) => state.success,
    getPagination: (state) => state.pagination,
  },

  actions: {
    setLoading(status) {
      this.isLoading = status;
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
     * Action pour récupérer les rapports médicaux pour un docteur et un patient spécifiques.
     * Correspond à GET /api/doctors/{doctorId}/patients/{patientId}/medical-reports
     * Utilise apiMedicalReports.fetchMedicalReportsByDoctorAndPatient
     */
    async fetchMedicalReportsForDoctorPatient(doctorId, patientId) {
      this.clearMessages();
      this.setLoading(true);
      try {
        const reports = await fetchMedicalReportsByDoctorAndPatient(doctorId, patientId); // Appel corrigé
        this.medicalReports = reports;
        this.setSuccess('Rapports médicaux récupérés avec succès.');
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        this.setError('Échec de la récupération des rapports: ' + errorMessage);
        this.medicalReports = [];
      } finally {
        this.setLoading(false);
      }
    },

    /**
     * Action pour créer un rapport médical pour un docteur et un patient spécifiques.
     * Correspond à POST /api/doctors/{doctorId}/patients/{patientId}/medical-reports
     * Utilise apiMedicalReports.createMedicalReportByDoctorAndPatient
     * @param {number} doctorId L'ID du docteur
     * @param {number} patientId L'ID du patient
     * @param {object} reportData Les données du rapport (report_type, title, content)
     */
    async createMedicalReportForDoctorPatient(doctorId, patientId, reportData) {
      this.clearMessages();
      this.setLoading(true);
      try {
        const response = await createMedicalReportByDoctorAndPatient(doctorId, patientId, reportData); // Appel corrigé
        // Ajoutez le nouveau rapport à la liste si applicable ou rafraîchissez
        this.medicalReports.push(response.record); // Supposant que 'record' est renvoyé
        this.setSuccess(response.message || 'Rapport médical créé avec succès.');
        return response.record;
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        this.setError('Échec de la création du rapport: ' + errorMessage);
        throw err; // Propage l'erreur pour la gestion du formulaire
      } finally {
        this.setLoading(false);
      }
    },

    /**
     * Action pour créer un rapport médical via la route /medicalreports/register/{patient}
     * Correspond à POST /api/medicalreports/register/{patient}
     * Utilise apiMedicalReports.createMedicalReportLegacy (nommé différemment pour éviter confusion)
     * @param {number} patientId L'ID du patient
     * @param {object} reportData Les données du rapport
     */
    async createMedicalReportLegacy(patientId, reportData) {
      this.clearMessages();
      this.setLoading(true);
      try {
        const response = await createMedicalReportLegacy(patientId, reportData); // Appel corrigé
        // Vous pourriez vouloir recharger les rapports ou ajouter celui-ci à la liste pertinente
        this.setSuccess(response.message || 'Rapport médical créé avec succès via la route legacy.');
        return response.record;
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        this.setError('Échec de la création du rapport via la route legacy: ' + errorMessage);
        throw err;
      } finally {
        this.setLoading(false);
      }
    },

    /**
     * Action pour lister tous les rapports médicaux (souvent pour un admin ou une vue d'ensemble).
     * Correspond à GET /api/medicalreports
     * @param {object} params Paramètres de requête pour filtrage/pagination
     */
    async fetchAllMedicalReports(params = {}) {
      this.clearMessages();
      this.setLoading(true);
      try {
        const response = await getAllMedicalReports(params); // Appel corrigé
        this.medicalReports = response.data; // Si l'API retourne {data: [...], ...pagination}
        this.pagination = {
          current_page: response.current_page,
          last_page: response.last_page,
          per_page: response.per_page,
          total: response.total,
        };
        this.setSuccess('Tous les rapports médicaux chargés.');
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        this.setError('Échec du chargement de tous les rapports: ' + errorMessage);
        this.medicalReports = [];
      } finally {
        this.setLoading(false);
      }
    },

    /**
     * Action pour rechercher des rapports médicaux.
     * Correspond à GET /api/medicalreports/search
     * @param {object} searchParams Paramètres de recherche
     */
    async searchMedicalReports(searchParams) {
      this.clearMessages();
      this.setLoading(true);
      try {
        const response = await searchMedicalReports(searchParams); // Appel corrigé
        this.medicalReports = response.data; // Si l'API retourne {data: [...], ...pagination}
        this.pagination = {
          current_page: response.current_page,
          last_page: response.last_page,
          per_page: response.per_page,
          total: response.total,
        };
        this.setSuccess('Recherche de rapports médicaux effectuée.');
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        this.setError('Échec de la recherche de rapports: ' + errorMessage);
        this.medicalReports = [];
      } finally {
        this.setLoading(false);
      }
    },

    /**
     * Action pour afficher un rapport médical spécifique.
     * Correspond à GET /api/medicalreports/{report}
     * @param {number} reportId L'ID du rapport
     */
    async fetchMedicalReportById(reportId) {
      this.clearMessages();
      this.setLoading(true);
      try {
        const report = await getMedicalReportById(reportId); // Appel corrigé
        this.currentReport = report;
        this.setSuccess('Rapport médical chargé avec succès.');
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        this.setError('Échec du chargement du rapport: ' + errorMessage);
        this.currentReport = null;
      } finally {
        this.setLoading(false);
      }
    },

    /**
     * Action pour mettre à jour un rapport médical.
     * Correspond à PUT /api/medicalreports/{report}
     * @param {number} reportId L'ID du rapport
     * @param {object} reportData Les données à mettre à jour
     */
    async updateMedicalReport(reportId, reportData) {
      this.clearMessages();
      this.setLoading(true);
      try {
        const response = await updateMedicalReport(reportId, reportData); // Appel corrigé
        this.currentReport = response.record; // Mettre à jour le rapport actuel si c'est celui qui a été modifié
        // Mise à jour de la liste si le rapport est dedans
        const index = this.medicalReports.findIndex(r => r.id === reportId);
        if (index !== -1) {
          this.medicalReports[index] = response.record;
        }
        this.setSuccess(response.message || 'Rapport médical mis à jour avec succès.');
        return response.record;
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        this.setError('Échec de la mise à jour du rapport: ' + errorMessage);
        throw err;
      } finally {
        this.setLoading(false);
      }
    },

    /**
     * Action pour supprimer un rapport médical.
     * Correspond à DELETE /api/medicalreports/{report}
     * @param {number} reportId L'ID du rapport
     */
    async deleteMedicalReport(reportId) {
      this.clearMessages();
      this.setLoading(true);
      try {
        const response = await deleteMedicalReport(reportId); // Appel corrigé
        // Supprimer le rapport de la liste
        this.medicalReports = this.medicalReports.filter(report => report.id !== reportId);
        this.setSuccess(response.message || 'Rapport médical supprimé avec succès.');
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        this.setError('Échec de la suppression du rapport: ' + errorMessage);
        throw err;
      } finally {
        this.setLoading(false);
      }
    },

    /**
     * Action pour télécharger un rapport médical.
     * Correspond à GET /api/medicalreports/{report}/download
     * @param {number} reportId L'ID du rapport
     */
    async downloadMedicalReport(reportId) {
      this.clearMessages();
      this.setLoading(true);
      try {
        const blob = await downloadMedicalReport(reportId); // Appel corrigé
        // Créer un lien temporaire pour le téléchargement
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `rapport_medical_${reportId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        this.setSuccess('Rapport médical téléchargé avec succès.');
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        this.setError('Échec du téléchargement du rapport: ' + errorMessage);
        throw err;
      } finally {
        this.setLoading(false);
      }
    },
  },
});