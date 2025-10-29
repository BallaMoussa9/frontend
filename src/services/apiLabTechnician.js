// resources/js/services/apiLabTechnician.js

import API from './axios';

/**
 * Récupère tous les techniciens de laboratoire.
 * @returns {Promise<Object>} La réponse de l'API.
 */
export const apiGetAllLabTechnicians = async () => {
    try {
        const response = await API.get('/labtechnicians');
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des techniciens de laboratoire :', error);
        throw new Error(error.response?.data?.message || 'Erreur de connexion.');
    }
};

/**
 * Récupère un technicien de laboratoire spécifique par son ID.
 * @param {number} id L'ID du technicien à récupérer.
 * @returns {Promise<Object>} La réponse de l'API.
 */
export const apiGetLabTechnician = async (id) => {
    try {
        const response = await API.get(`/labtechnicians/${id}`);
        return response;
    } catch (error) {
        console.error(`Erreur lors de la récupération du technicien ${id} :`, error);
        throw new Error(error.response?.data?.message || `Erreur lors de la récupération du technicien ${id}.`);
    }
};

/**
 * Crée un nouveau technicien de laboratoire.
 * @param {Object} labTechnicianData Les données du technicien à créer.
 * @returns {Promise<Object>} La réponse de l'API.
 */
export const apiCreateLabTechnician = async (labTechnicianData) => {
    try {
        // Envoie les données en tant que 'multipart/form-data' pour gérer le fichier (photo de profil)
        const response = await API.post('/labtechnicians', labTechnicianData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response;
    } catch (error) {
        console.error('Erreur lors de la création du technicien de laboratoire :', error);
        throw new Error(error.response?.data?.message || 'Erreur lors de la création.');
    }
};

/**
 * Met à jour un technicien de laboratoire existant.
 * @param {number} id L'ID du technicien à mettre à jour.
 * @param {Object} labTechnicianData Les nouvelles données du technicien.
 * @returns {Promise<Object>} La réponse de l'API.
 */
export const apiUpdateLabTechnician = async (id, labTechnicianData) => {
    try {
        // Envoie les données en tant que 'multipart/form-data' pour gérer le fichier,
        // mais utilise la méthode POST avec une surcharge HTTP pour PATCH/PUT
        const response = await API.post(`/labtechnicians/${id}`, labTechnicianData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            params: {
                _method: 'PUT' // Surcharge la méthode pour Laravel
            }
        });
        return response;
    } catch (error) {
        console.error('Erreur lors de la mise à jour du technicien de laboratoire :', error);
        throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour.');
    }
};

/**
 * Supprime un technicien de laboratoire.
 * @param {number} id L'ID du technicien à supprimer.
 * @returns {Promise<void>} La réponse de l'API.
 */
export const apiDeleteLabTechnician = async (id) => {
    try {
        const response = await API.delete(`/labtechnicians/${id}`);
        return response;
    } catch (error) {
        console.error('Erreur lors de la suppression du technicien de laboratoire :', error);
        throw new Error(error.response?.data?.message || 'Erreur lors de la suppression.');
    }
};
