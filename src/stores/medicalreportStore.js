// src/stores/medicalReportStore.js
import { defineStore } from 'pinia';
import {
  fetchMedicalReportsByDoctorAndPatient,
  createMedicalReportByDoctorAndPatient,
  createMedicalReportLegacy,
  getAllMedicalReports,
  searchMedicalReports,
  getMedicalReportById,
  updateMedicalReport,
  deleteMedicalReport,
  downloadMedicalReport as apiDownloadMedicalReport,
} from '@/services/apiMedicalReport';

export const useMedicalReportStore = defineStore('medicalReport', {
  state: () => ({
    medicalReports: [],
    currentReport: null,
    isLoading: false,
    error: null,
    success: null,
    pagination: {
      current_page: 1,
      last_page: 1,
      per_page: 30,
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
    
    // 🔥 NOUVEAU : Getter pour vérifier si un rapport a un fichier
    hasFile: (state) => (reportId) => {
      const report = state.medicalReports.find(r => r.id === reportId);
      return report?.file_path ? true : false;
    },
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
     * Récupérer les rapports pour un docteur et un patient spécifiques
     */
    async fetchMedicalReportsForDoctorPatient(doctorId, patientId) {
      this.clearMessages();
      this.setLoading(true);
      try {
        const reports = await fetchMedicalReportsByDoctorAndPatient(doctorId, patientId);
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
     * Créer un rapport médical pour un docteur et un patient spécifiques
     */
    async createMedicalReportForDoctorPatient(doctorId, patientId, reportData) {
      this.clearMessages();
      this.setLoading(true);
      try {
        const response = await createMedicalReportByDoctorAndPatient(doctorId, patientId, reportData);
        this.medicalReports.push(response.record);
        this.setSuccess(response.message || 'Rapport médical créé avec succès.');
        return response.record;
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        this.setError('Échec de la création du rapport: ' + errorMessage);
        throw err;
      } finally {
        this.setLoading(false);
      }
    },

    /**
     * Créer un rapport médical via la route legacy
     */
    async createMedicalReportLegacy(patientId, reportData) {
      this.clearMessages();
      this.setLoading(true);
      try {
        const response = await createMedicalReportLegacy(patientId, reportData);
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
     * Lister tous les rapports médicaux
     */
    async fetchAllMedicalReports(params = {}) {
      this.clearMessages();
      this.setLoading(true);
      try {
        const response = await getAllMedicalReports(params);
        this.medicalReports = response.data;
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
     * Rechercher des rapports médicaux
     */
    async searchMedicalReports(searchParams) {
      this.clearMessages();
      this.setLoading(true);
      try {
        const response = await searchMedicalReports(searchParams);
        this.medicalReports = response.data;
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
     * Afficher un rapport médical spécifique
     */
    async fetchMedicalReportById(reportId) {
      this.clearMessages();
      this.setLoading(true);
      try {
        const report = await getMedicalReportById(reportId);
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
     * Mettre à jour un rapport médical
     */
    async updateMedicalReport(reportId, reportData) {
      this.clearMessages();
      this.setLoading(true);
      try {
        const response = await updateMedicalReport(reportId, reportData);
        this.currentReport = response.record;
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
     * Supprimer un rapport médical
     */
    async deleteMedicalReport(reportId) {
      this.clearMessages();
      this.setLoading(true);
      try {
        const response = await deleteMedicalReport(reportId);
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

   // src/stores/medicalReportStore.js

/**
 * 🔥 CORRECTION DÉFINITIVE : Télécharger un rapport médical
 */
async downloadMedicalReport(reportId) {
  this.clearMessages();
  this.setLoading(true);
  
  try {
    console.log("🔄 Store: Début téléchargement rapport ID:", reportId);
    
    const blob = await apiDownloadMedicalReport(reportId);
    
    console.log("✅ Store: Blob valide reçu", {
      size: blob.size,
      type: blob.type,
      reportId: reportId
    });
    
    // 🔥 CORRECTION : Validation robuste du blob
    if (!blob || blob.size === 0) {
      throw new Error("Fichier vide reçu du serveur");
    }
    
    // Vérifier si c'est une erreur JSON déguisée en blob
    if (blob.size < 500 && blob.type.includes('application/json')) {
      const errorText = await blob.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.message || "Erreur serveur lors du téléchargement");
      } catch {
        throw new Error("Le serveur a retourné une erreur au lieu du fichier");
      }
    }
    
    // Créer un lien temporaire pour le téléchargement
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // 🔥 CORRECTION : Nom de fichier significatif
    const report = this.medicalReports.find(r => r.id === reportId) || this.currentReport;
    const safeTitle = report?.title 
      ? report.title.replace(/[^a-zA-Z0-9\s_-]/g, '').replace(/\s+/g, '_')
      : 'rapport';
    
    // Déterminer l'extension en fonction du type MIME
    let extension = '.pdf';
    if (blob.type.includes('word') || blob.type.includes('document')) {
      extension = '.docx';
    } else if (blob.type.includes('plain')) {
      extension = '.txt';
    }
    
    const fileName = `rapport_${safeTitle}_${reportId}${extension}`;
    
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    console.log("✅ Store: Téléchargement terminé pour rapport ID:", reportId);
    this.setSuccess('Rapport médical téléchargé avec succès.');
    
  } catch (err) {
    console.error("❌ Store: Erreur téléchargement rapport ID:", reportId, err);
    
    // 🔥 CORRECTION : Gestion spécifique des erreurs 404
    if (err.message.includes('404') || err.message.includes('non trouvé') || err.message.includes('Not Found')) {
      this.setError(`Le rapport #${reportId} n'existe pas ou a été supprimé.`);
    } else if (err.message.includes('403') || err.message.includes('autorisé')) {
      this.setError(`Vous n'êtes pas autorisé à télécharger ce rapport.`);
    } else {
      this.setError(err.message || 'Échec du téléchargement du rapport.');
    }
    
    throw err;
  } finally {
    this.setLoading(false);
  }
},
  },
});