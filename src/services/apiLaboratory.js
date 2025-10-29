// resources/js/services/apiLaboratory.js

import API from './axios'; // Assurez-vous que './axios' est le bon chemin vers votre instance axios

/**
 * Récupère tous les laboratoires.
 * @returns {Promise<Object>} La réponse de l'API.
 */
export const apiGetLaboratories = async () => {
    try {
        const response = await API.get('/laboratories');
        return response; // Le contrôleur renvoie un tableau directement
    } catch (error) {
        console.error('Erreur lors de la récupération des laboratoires :', error);
        throw new Error(error.response?.data?.message || 'Erreur de connexion.');
    }
};

/**
 * Récupère un laboratoire spécifique par son ID.
 * @param {number} id L'ID du laboratoire à récupérer.
 * @returns {Promise<Object>} La réponse de l'API.
 */
export const apiGetLaboratoryById = async (id) => {
    try {
        const response = await API.get(`/laboratories/${id}`);
        return response; // Le contrôleur renvoie l'objet laboratoire directement
    } catch (error) {
        console.error(`Erreur lors de la récupération du laboratoire ${id} :`, error);
        throw new Error(error.response?.data?.message || `Erreur lors de la récupération du laboratoire ${id}.`);
    }
};

/**
 * Crée un nouveau laboratoire.
 * @param {Object} laboratoryData Les données du laboratoire à créer.
 * @returns {Promise<Object>} La réponse de l'API.
 */
export const apiStoreLaboratory = async (laboratoryData) => {
    try {
        const response = await API.post('/laboratories', laboratoryData);
        return response; // Le contrôleur renvoie l'objet laboratoire créé
    } catch (error) {
        console.error('Erreur lors de la création du laboratoire :', error);
        throw new Error(error.response?.data?.message || 'Erreur lors de la création.');
    }
};

/**
 * Met à jour un laboratoire existant.
 * @param {number} id L'ID du laboratoire à mettre à jour.
 * @param {Object} laboratoryData Les nouvelles données du laboratoire.
 * @returns {Promise<Object>} La réponse de l'API.
 */
export const apiUpdateLaboratory = async (id, laboratoryData) => {
    try {
        const response = await API.put(`/laboratories/${id}`, laboratoryData);
        return response; // Le contrôleur renvoie l'objet laboratoire mis à jour
    } catch (error) {
        console.error('Erreur lors de la mise à jour du laboratoire :', error);
        throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour.');
    }
};

/**
 * Supprime un laboratoire.
 * @param {number} id L'ID du laboratoire à supprimer.
 * @returns {Promise<Object>} La réponse de l'API. (204 No Content pour la suppression)
 */
export const apiDeleteLaboratory = async (id) => {
    try {
        const response = await API.delete(`/laboratories/${id}`);
        return response;
    } catch (error) {
        console.error('Erreur lors de la suppression du laboratoire :', error);
        throw new Error(error.response?.data?.message || 'Erreur lors de la suppression.');
    }
};
