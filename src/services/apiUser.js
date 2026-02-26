// resources/js/services/apiUser.js

import API from './axios'; // Assurez-vous que './axios' est le bon chemin

// ----------------------------------------------------
// Fonctions pour la GESTION DES UTILISATEURS (Admin)
// ----------------------------------------------------

/**
 * Recherche des utilisateurs avec des filtres et pagination.
 * Accessible uniquement aux administrateurs.
 *
 * @param {Object} params - Les paramètres de recherche et de pagination.
 * @returns {Promise<Object>} La réponse de l'API avec les données paginées.
 */
export const apiSearchUsers = async (params = {}) => {
    try {
        const response = await API.get('/admin/users/search', { params });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la recherche des utilisateurs :', error);
        throw new Error(error.response?.data?.message || 'Erreur lors de la recherche des utilisateurs.');
    }
};

/**
 * Récupère tous les utilisateurs sans filtres ni pagination.
 *
 * @returns {Promise<Object[]>} Un tableau de tous les objets utilisateur.
 */
export const apiGetAllUsers = async () => {
    try {
        // Le chemin a été mis à jour pour correspondre à la route du contrôleur.
        const response = await API.get('/users/all');
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération de tous les utilisateurs :', error);
        throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de tous les utilisateurs.');
    }
};

/**
 * Supprime un utilisateur par son ID.
 * Accessible uniquement aux administrateurs.
 *
 * @param {number} userId - L'ID de l'utilisateur à supprimer.
 * @returns {Promise<Object>} La réponse de l'API.
 */
export const apiDeleteUser = async (userId) => {
    try {
        const response = await API.delete(`/admin/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la suppression de l'utilisateur ${userId} :`, error);
        throw new Error(error.response?.data?.message || `Erreur lors de la suppression de l'utilisateur ${userId}.`);
    }
};

/**
 * Met à jour le rôle d'un utilisateur spécifique.
 * Accessible uniquement aux administrateurs.
 *
 * @param {number} userId - L'ID de l'utilisateur à modifier.
 * @param {string} newRole - Le nouveau rôle à assigner (ex: 'doctor', 'admin').
 * @returns {Promise<Object>} La réponse de l'API.
 */
export const apiUpdateUserRole = async (userId, newRole) => {
    try {
        const response = await API.put(`/admin/users/${userId}/role`, { role: newRole });
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la mise à jour du rôle de l'utilisateur ${userId} :`, error);
        throw new Error(error.response?.data?.message || `Erreur lors de la mise à jour du rôle de l'utilisateur ${userId}.`);
    }
};

/**
 * Récupère la liste de tous les rôles disponibles dans le système.
 * Accessible uniquement aux administrateurs.
 *
 * @returns {Promise<string[]>} Un tableau de noms de rôles (ex: ['admin', 'doctor', 'patient']).
 */
export const apiGetAvailableRoles = async () => {
    try {
        const response = await API.get('/admin/roles');
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des rôles disponibles :', error);
        throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des rôles disponibles.');
    }
};

/**
 * Récupère la liste de tous les départements.
 * Accessible uniquement aux administrateurs.
 *
 * @returns {Promise<Object[]>} Un tableau d'objets département (ex: [{ id: 1, name: 'Médecine Générale' }]).
 */
export const apiGetDepartments = async () => {
    try {
        const response = await API.get('/admin/departments');
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des départements :', error);
        throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des départements.');
    }
};


// ----------------------------------------------------
// Fonctions pour la GESTION DU PROFIL DE L'UTILISATEUR CONNECTÉ
// ----------------------------------------------------

/**
 * Met à jour les informations de profil de l'utilisateur AUTHENTIFIÉ.
 *
 * @param {Object} userData - Données du profil (first_name, last_name, email, phone, etc.).
 * @returns {Promise<Object>} La réponse de l'API.
 */
export const apiUpdateProfileInformation = async (userData) => {
    try {
        const response = await API.put('/user/profile-information', userData);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la mise à jour des informations de profil :', error);
        throw new Error(error.response?.data?.message || 'Échec de la mise à jour des informations de profil.');
    }
};

/**
 * Met à jour le mot de passe de l'utilisateur AUTHENTIFIÉ.
 *
 * @param {Object} passwordData - Données du mot de passe (current_password, password, password_confirmation).
 * @returns {Promise<Object>} La réponse de l'API.
 */
export const apiUpdatePassword = async (passwordData) => {
    try {
        const response = await API.put('/user/password', passwordData);
        return response.data;
    } catch (error) {
        // Loggez l'erreur complète pour le débogage
        console.error('Erreur lors de la mise à jour du mot de passe :', error);

        // --- GESTION SPÉCIFIQUE DES ERREURS DE VALIDATION (STATUT 422) ---
        if (error.response && error.response.status === 422) {
            const validationErrors = error.response.data.errors;

            // Cherchez le message d'erreur pour 'current_password'
            if (validationErrors && validationErrors.current_password) {
                // Renvoie le message d'erreur spécifique du backend
                throw new Error(validationErrors.current_password[0]);
            }

            // Si d'autres erreurs de validation sont présentes (ex: 'password' trop court)
            // Vous pouvez itérer sur toutes les erreurs si nécessaire
            if (validationErrors) {
                const firstErrorKey = Object.keys(validationErrors)[0];
                if (firstErrorKey) {
                    throw new Error(validationErrors[firstErrorKey][0]);
                }
            }

            // Fallback pour les erreurs 422 sans messages spécifiques formatés comme attendu
            throw new Error(error.response.data.message || 'Données de mot de passe invalides.');
        }
        // --- FIN GESTION SPÉCIFIQUE DES ERREURS DE VALIDATION ---

        // Gérer les erreurs réseau
        if (error.code === 'ERR_NETWORK') {
            throw new Error('Erreur réseau : Impossible de joindre le serveur.');
        }

        // Gérer les autres types d'erreurs (401 Unauthorized, 500 Internal Server Error, etc.)
        throw new Error(error.response?.data?.message || 'Une erreur inattendue est survenue lors de la mise à jour du mot de passe.');
    }
};
/**
 * Met à jour la photo de profil de l'utilisateur AUTHENTIFIÉ.
 *
 * @param {File} photoFile - Le fichier image de la nouvelle photo de profil.
 * @returns {Promise<Object>} La réponse de l'API.
 */
export const apiUpdateProfilePhoto = async (photoFile) => {
    try {
        const formData = new FormData();
        formData.append('profile_photo', photoFile);

        const response = await API.post('/profile/photo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Important pour l'envoi de fichiers
            },
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la photo de profil :', error);
        throw new Error(error.response?.data?.message || 'Échec de la mise à jour de la photo de profil.');
    }
};
export const apiGetPatientByUserId = async (userId) => {
    try {
        // 🚨 CORRECTION : Utiliser API (en majuscules)
        const response = await API.get(`patients/by-user/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Erreur lors du chargement du patient par ID utilisateur (API):", error);
        throw error;
    }
};
/**
 * Récupère le profil docteur complet associé à un ID utilisateur.
 * @param {number} userId L'ID de l'utilisateur.
 * @returns {Promise<object>} L'objet docteur.
 */
export const apiGetDoctorByUserId = async (userId) => {
    console.log(`Calling API to get doctor by user ID: ${userId}`);
    const response = await API.get(`/doctors/by-user/${userId}`);
    return response.data; // Le backend renvoie { doctor: {...} }
};
/**
 * Récupère le profil infirmier complet associé à un ID utilisateur.
 * @param {number} userId L'ID de l'utilisateur.
 * @returns {Promise<object>} L'objet infirmier { id: nurseId, user_id: userId, ...}.
 */
export const apiGetNurseByUserId = async (userId) => {
    try {
        console.log(`Calling API to get nurse by user ID: ${userId}`);

        // 🔑 Utilisation de la route /nurses/user/{userId} définie précédemment
        const response = await API.get(`/nurse/user/${userId}`);

        // On suppose que le backend Laravel renvoie directement l'objet { id: nurseId, user_id: userId, ...}
        return response.data;

    } catch (error) {
        console.error(`Erreur lors du chargement de l'infirmier par ID utilisateur ${userId} (API):`, error);
        // Lance l'erreur pour que le store puisse la gérer
        throw new Error(error.response?.data?.message || `Échec de la récupération de l'infirmier pour l'utilisateur ${userId}.`);
    }
};
export const apiExportReport = async (data) => {
    try {
        const response = await API.post('/report/export', data, {
            responseType: 'blob',
            withCredentials: true, // ✅ indispensable avec Sanctum
        });

        const contentDisposition = response.headers['content-disposition'];
        let filename = 'rapport_sante_ko.docx';
        if (contentDisposition) {
            const matches = /filename="([^"]*)"/.exec(contentDisposition);
            if (matches != null && matches[1]) {
                filename = matches[1];
            }
        }

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return { success: true, message: 'Rapport Word téléchargé.' };

    } catch (error) {
        console.error('Erreur lors de l\'exportation du rapport :', error);
        throw new Error(error.response?.data?.message || 'Échec de la génération et du téléchargement du rapport.');
    }
};
/**
 * 🚨 NOUVELLE FONCTION API : Récupère le profil Urgentiste (FirstResponder) par ID utilisateur.
 * @param {number} userId L'ID de l'utilisateur.
 * @returns {Promise<object>} L'objet FirstResponder { id: firts_responder_id, user_id: userId, ...}.
 */
export const apiGetFirstResponderByUserId = async (userId) => {
    try {
        console.log(`Calling API to get First Responder by user ID: ${userId}`);

        // 🔑 NOUVELLE ROUTE : Nous allons définir ceci dans Laravel.
        // Utilisation du même schéma que l'infirmier : /first-responder/user/{userId}
        const response = await API.get(`/urgentist/user/${userId}`);

        // On suppose que le backend Laravel renvoie directement l'objet { id: firts_responder_id, user_id: userId, ...}
        return response.data;

    } catch (error) {
        console.error(`Erreur lors du chargement de l'Urgentiste par ID utilisateur ${userId} (API):`, error);
        throw new Error(error.response?.data?.message || `Échec de la récupération de l'Urgentiste pour l'utilisateur ${userId}.`);
    }
};
/**
 * Récupère le profil Technicien de Laboratoire complet associé à un ID utilisateur.
 * @param {number} userId L'ID de l'utilisateur.
 * @returns {Promise<object>} L'objet Technicien { id: lab_technician_id, user_id: userId, ...}.
 */
export const apiGetLabTechnicianByUserId = async (userId) => {
    try {
        console.log(`Calling API to get Lab Technician by user ID: ${userId}`);

        // 🔑 Utilisation de la route /lab/by-user/{userId} que nous avons définie pour Laravel
        const response = await API.get(`/lab/by-user/${userId}`);

        // Le backend renvoie { lab_technician: {...} } d'après la méthode showByUser du contrôleur
        return response.data.lab_technician;

    } catch (error) {
        console.error(`Erreur lors du chargement du technicien par ID utilisateur ${userId} (API):`, error);
        throw new Error(error.response?.data?.message || `Échec de la récupération du technicien pour l'utilisateur ${userId}.`);
    }
};