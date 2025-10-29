// src/services/apiMedicalReports.js
import API from '@/services/axios';

// 🚨 NOUVELLE MÉTHODE : Récupérer les rapports pour un docteur et patient spécifiques
// Correspond à GET /api/doctors/{doctorId}/patients/{patientId}/medical-reports
export const fetchMedicalReportsByDoctorAndPatient = async (doctorId, patientId) => {
    try {
        const response = await API.get(`/doctors/${doctorId}/patients/${patientId}/medical-reports`);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des rapports médicaux pour docteur/patient:", error);
        throw error;
    }
};

// 🚨 NOUVELLE MÉTHODE : Créer un rapport médical pour un docteur et patient spécifiques
// Correspond à POST /api/doctors/{doctorId}/patients/{patientId}/medical-reports
export const createMedicalReportByDoctorAndPatient = async (doctorId, patientId, reportData) => {
    try {
        const response = await API.post(`/doctors/${doctorId}/patients/${patientId}/medical-reports`, reportData);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la création du rapport médical pour docteur/patient:", error);
        throw error;
    }
};

// --- Fonctions pour les routes /medicalreports existantes ---

// Correspond à POST /api/medicalreports/register/{patient}
export const createMedicalReportLegacy = async (patientId, reportData) => {
    try {
        const response = await API.post(`/medicalreports/register/${patientId}`, reportData);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la création du rapport médical via route legacy:", error);
        throw error;
    }
};

// Correspond à GET /api/medicalreports
export const getAllMedicalReports = async (params = {}) => {
    try {
        const response = await API.get(`/medicalreports`, { params });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération de tous les rapports médicaux:", error);
        throw error;
    }
};

// Correspond à GET /api/medicalreports/search
export const searchMedicalReports = async (params) => {
    try {
        const response = await API.get(`/medicalreports/search`, { params });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la recherche des rapports médicaux:", error);
        throw error;
    }
};

// Correspond à GET /api/medicalreports/{report}
export const getMedicalReportById = async (reportId) => {
    try {
        const response = await API.get(`/medicalreports/${reportId}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération du rapport médical ${reportId}:`, error);
        throw error;
    }
};

// Correspond à DELETE /api/medicalreports/{report}
export const deleteMedicalReport = async (reportId) => {
    try {
        const response = await API.delete(`/medicalreports/${reportId}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la suppression du rapport médical ${reportId}:`, error);
        throw error;
    }
};

// Correspond à PUT /api/medicalreports/{report}
export const updateMedicalReport = async (reportId, reportData) => {
    try {
        const response = await API.put(`/medicalreports/${reportId}`, reportData);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la mise à jour du rapport médical ${reportId}:`, error);
        throw error;
    }
};

// Correspond à GET /api/medicalreports/{report}/download
export const downloadMedicalReport = async (reportId) => {
    try {
        // Important: responseType 'blob' pour les téléchargements de fichiers
        const response = await API.get(`/medicalreports/${reportId}/download`, { responseType: 'blob' });
        return response.data;
    } catch (error) {
        console.error(`Erreur lors du téléchargement du rapport médical ${reportId}:`, error);
        throw error;
    }
};