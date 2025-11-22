// resources/js/services/apiDepartment.js

import API from './axios';

export const apiGetDepartments = async () => {
    try {
        const response = await API.get('public/departments');
        return response;
    } catch (error) {
        console.error('Erreur lors de la récupération des départements :', error);
        throw new Error(error.response?.data?.message || 'Erreur de connexion.');
    }
};

export const apiStoreDepartment = async (departmentData) => {
    try {
        const response = await API.post('/departments', departmentData);
        return response;
    } catch (error) {
        console.error('Erreur lors de la création du département :', error);
        throw new Error(error.response?.data?.message || 'Erreur lors de la création.');
    }
};

export const apiUpdateDepartment = async (id, departmentData) => {
    try {
        const response = await API.put(`/departments/${id}`, departmentData);
        return response;
    } catch (error) {
        console.error('Erreur lors de la mise à jour du département :', error);
        throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour.');
    }
};

export const apiDeleteDepartment = async (id) => {
    try {
        await API.delete(`/departments/${id}`);
    } catch (error) {
        console.error('Erreur lors de la suppression du département :', error);
        throw new Error(error.response?.data?.message || 'Erreur lors de la suppression.');
    }
};
/**
 * Récupère un département spécifique par son ID.
 * @param {number} id L'ID du département à récupérer.
 * @returns {Promise<Object>} La réponse de l'API avec les données du département.
 */
export const apiGetDepartmentById = async (id) => {
    try {
        // ✅ Endpoint correct pour la route Laravel GET /departments/{id}
        const response = await API.get(`/departments/${id}`);
        return response;
    } catch (error) {
        console.error(`Erreur lors de la récupération du département ${id} :`, error);
        throw new Error(error.response?.data?.message || `Erreur lors de la récupération du département ${id}.`);
    }
};