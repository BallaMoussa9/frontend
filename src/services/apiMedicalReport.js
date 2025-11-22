// src/services/apiMedicalReports.js
import API from '@/services/axios';

// Récupérer les rapports pour un docteur et patient spécifiques
export const fetchMedicalReportsByDoctorAndPatient = async (doctorId, patientId) => {
    try {
        console.log(`📡 API: Récupération rapports pour docteur ${doctorId} et patient ${patientId}`);
        const response = await API.get(`/doctors/${doctorId}/patients/${patientId}/medical-reports`);
        console.log(`✅ API: ${response.data?.length || 0} rapports récupérés`);
        return response.data;
    } catch (error) {
        console.error("❌ API: Erreur récupération rapports médicaux pour docteur/patient:", error);
        const errorMessage = error.response?.data?.message || error.message || 'Erreur de connexion';
        throw new Error(errorMessage);
    }
};

// Créer un rapport médical pour un docteur et patient spécifiques
export const createMedicalReportByDoctorAndPatient = async (doctorId, patientId, reportData) => {
    try {
        console.log(`📡 API: Création rapport pour docteur ${doctorId} et patient ${patientId}`, reportData);
        const response = await API.post(`/doctors/${doctorId}/patients/${patientId}/medical-reports`, reportData);
        console.log(`✅ API: Rapport créé avec ID: ${response.data.record?.id}`);
        return response.data;
    } catch (error) {
        console.error("❌ API: Erreur création rapport médical pour docteur/patient:", error);
        const errorMessage = error.response?.data?.message || error.message || 'Erreur de création';
        throw new Error(errorMessage);
    }
};

// Créer un rapport médical via route legacy
export const createMedicalReportLegacy = async (patientId, reportData) => {
    try {
        console.log(`📡 API: Création rapport legacy pour patient ${patientId}`);
        const response = await API.post(`/medicalreports/register/${patientId}`, reportData);
        console.log(`✅ API: Rapport legacy créé avec ID: ${response.data.record?.id}`);
        return response.data;
    } catch (error) {
        console.error("❌ API: Erreur création rapport médical via route legacy:", error);
        const errorMessage = error.response?.data?.message || error.message || 'Erreur de création';
        throw new Error(errorMessage);
    }
};

// Lister tous les rapports médicaux
export const getAllMedicalReports = async (params = {}) => {
    try {
        console.log(`📡 API: Récupération tous les rapports`, params);
        const response = await API.get(`/medicalreports`, { params });
        console.log(`✅ API: ${response.data?.data?.length || 0} rapports récupérés (pagination)`);
        return response.data;
    } catch (error) {
        console.error("❌ API: Erreur récupération tous les rapports médicaux:", error);
        const errorMessage = error.response?.data?.message || error.message || 'Erreur de connexion';
        throw new Error(errorMessage);
    }
};

// Rechercher des rapports médicaux
export const searchMedicalReports = async (params) => {
    try {
        console.log(`📡 API: Recherche rapports avec params:`, params);
        const response = await API.get(`/medicalreports/search`, { params });
        console.log(`✅ API: ${response.data?.data?.length || 0} rapports trouvés`);
        return response.data;
    } catch (error) {
        console.error("❌ API: Erreur recherche rapports médicaux:", error);
        const errorMessage = error.response?.data?.message || error.message || 'Erreur de recherche';
        throw new Error(errorMessage);
    }
};

// Récupérer un rapport médical spécifique
export const getMedicalReportById = async (reportId) => {
    try {
        console.log(`📡 API: Récupération rapport ${reportId}`);
        const response = await API.get(`/medicalreports/${reportId}`);
        console.log(`✅ API: Rapport ${reportId} récupéré:`, response.data?.title);
        return response.data;
    } catch (error) {
        console.error(`❌ API: Erreur récupération rapport médical ${reportId}:`, error);
        
        let errorMessage = 'Rapport non trouvé';
        if (error.response?.status === 404) {
            errorMessage = `Rapport #${reportId} non trouvé`;
        } else if (error.response?.status === 403) {
            errorMessage = `Accès non autorisé au rapport #${reportId}`;
        } else {
            errorMessage = error.response?.data?.message || error.message || 'Erreur de connexion';
        }
        
        throw new Error(errorMessage);
    }
};

// Supprimer un rapport médical
export const deleteMedicalReport = async (reportId) => {
    try {
        console.log(`📡 API: Suppression rapport ${reportId}`);
        const response = await API.delete(`/medicalreports/${reportId}`);
        console.log(`✅ API: Rapport ${reportId} supprimé`);
        return response.data;
    } catch (error) {
        console.error(`❌ API: Erreur suppression rapport médical ${reportId}:`, error);
        
        let errorMessage = 'Erreur lors de la suppression';
        if (error.response?.status === 404) {
            errorMessage = `Rapport #${reportId} non trouvé`;
        } else if (error.response?.status === 403) {
            errorMessage = `Non autorisé à supprimer le rapport #${reportId}`;
        } else {
            errorMessage = error.response?.data?.message || error.message || 'Erreur de connexion';
        }
        
        throw new Error(errorMessage);
    }
};

// Mettre à jour un rapport médical
export const updateMedicalReport = async (reportId, reportData) => {
    try {
        console.log(`📡 API: Mise à jour rapport ${reportId}`, reportData);
        const response = await API.put(`/medicalreports/${reportId}`, reportData);
        console.log(`✅ API: Rapport ${reportId} mis à jour`);
        return response.data;
    } catch (error) {
        console.error(`❌ API: Erreur mise à jour rapport médical ${reportId}:`, error);
        
        let errorMessage = 'Erreur lors de la mise à jour';
        if (error.response?.status === 404) {
            errorMessage = `Rapport #${reportId} non trouvé`;
        } else if (error.response?.status === 403) {
            errorMessage = `Non autorisé à modifier le rapport #${reportId}`;
        } else if (error.response?.status === 422) {
            errorMessage = 'Données de validation incorrectes';
        } else {
            errorMessage = error.response?.data?.message || error.message || 'Erreur de connexion';
        }
        
        throw new Error(errorMessage);
    }
};

// src/services/apiMedicalReport.js

export const downloadMedicalReport = async (reportId) => {
    try {
        console.log(`📡 API: Début téléchargement rapport ${reportId}`);
        
        const response = await API.get(`/medicalreports/${reportId}/download`, { 
            responseType: 'blob',
            timeout: 30000,
        });

        console.log(`📊 API: Réponse reçue - Status: ${response.status}, Type: ${response.data?.type}, Taille: ${response.data?.size}`);

        // 🔥 CORRECTION : Vérifier le statut HTTP d'abord
        if (response.status === 404) {
            console.log(`❌ API: Rapport ${reportId} non trouvé (404)`);
            
            // Essayer de lire le message d'erreur
            let errorMessage = `Rapport #${reportId} non trouvé`;
            if (response.data && response.data.size > 0) {
                try {
                    const errorText = await response.data.text();
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch (parseError) {
                    console.error('❌ API: Erreur parsing JSON erreur:', parseError);
                }
            }
            
            throw new Error(errorMessage);
        }

        if (response.status !== 200) {
            console.log(`❌ API: Statut d'erreur ${response.status} détecté`);
            throw new Error(`Erreur serveur (${response.status})`);
        }

        // Validation du blob pour les succès
        if (!response.data || response.data.size === 0) {
            throw new Error('Fichier vide reçu du serveur');
        }

        // Vérifier si c'est une erreur JSON déguisée
        if (response.data.size < 500 && response.data.type.includes('application/json')) {
            const errorText = await response.data.text();
            const errorData = JSON.parse(errorText);
            throw new Error(errorData.message || 'Erreur lors du téléchargement');
        }

        console.log(`✅ API: Téléchargement rapport ${reportId} réussi`);
        return response.data;

    } catch (error) {
        console.error(`❌ API: Erreur finale téléchargement rapport ${reportId}:`, {
            message: error.message,
            status: error.response?.status,
            stack: error.stack
        });
        
        // 🔥 CORRECTION : Propager l'erreur avec un message clair
        if (error.response?.status === 404) {
            throw new Error(`Rapport #${reportId} non trouvé. Il a peut-être été supprimé.`);
        } else if (error.response?.status === 403) {
            throw new Error(`Accès refusé au rapport #${reportId}`);
        } else if (error.code === 'ECONNABORTED') {
            throw new Error('Délai dépassé lors du téléchargement');
        } else if (error.message) {
            throw error;
        } else {
            throw new Error('Erreur lors du téléchargement du rapport');
        }
    }
};