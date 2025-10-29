// resources/js/services/apiSystemSetting.js

import API from './axios'; // Assurez-vous que './axios' est le bon chemin

/**
 * Récupère tous les paramètres système (accessible uniquement aux administrateurs).
 * @returns {Promise<Object>} La réponse de l'API.
 */
export const apiGetSystemSettings = async () => {
    try {
        const response = await API.get('/system-settings');
        return response; // Le contrôleur renvoie un tableau directement
    } catch (error) {
        console.error('Erreur lors de la récupération des paramètres système :', error);
        throw new Error(error.response?.data?.message || 'Erreur de connexion.');
    }
};

/**
 * Récupère un paramètre système spécifique par son ID (avec vérification des droits).
 * @param {number} id L'ID du paramètre à récupérer.
 * @returns {Promise<Object>} La réponse de l'API.
 */
export const apiGetSystemSettingById = async (id) => {
    try {
        const response = await API.get(`/system-settings/${id}`);
        return response; // Le contrôleur renvoie l'objet paramètre directement
    } catch (error) {
        console.error(`Erreur lors de la récupération du paramètre ${id} :`, error);
        throw new Error(error.response?.data?.message || `Erreur lors de la récupération du paramètre ${id}.`);
    }
};

/**
 * Crée un nouveau paramètre système (accessible uniquement aux administrateurs).
 * @param {Object} settingData Les données du paramètre à créer (key, value, is_public).
 * @returns {Promise<Object>} La réponse de l'API.
 */
export const apiStoreSystemSetting = async (settingData) => {
    try {
        const response = await API.post('/system-settings', settingData);
        return response; // Le contrôleur renvoie l'objet paramètre créé
    } catch (error) {
        console.error('Erreur lors de la création du paramètre système :', error);
        throw new Error(error.response?.data?.message || 'Erreur lors de la création.');
    }
};

/**
 * Met à jour un paramètre système existant (accessible uniquement aux administrateurs).
 * @param {number} id L'ID du paramètre à mettre à jour.
 * @param {Object} settingData Les nouvelles données du paramètre.
 * @returns {Promise<Object>} La réponse de l'API.
 */
export const apiUpdateSystemSetting = async (id, settingData) => {
    try {
        const response = await API.put(`/system-settings/${id}`, settingData);
        return response; // Le contrôleur renvoie l'objet paramètre mis à jour
    } catch (error) {
        console.error('Erreur lors de la mise à jour du paramètre système :', error);
        throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour.');
    }
};

/**
 * Supprime un paramètre système (accessible uniquement aux administrateurs).
 * @param {number} id L'ID du paramètre à supprimer.
 * @returns {Promise<Object>} La réponse de l'API. (204 No Content pour la suppression)
 */
export const apiDeleteSystemSetting = async (id) => {
    try {
        const response = await API.delete(`/system-settings/${id}`);
        return response;
    } catch (error) {
        console.error('Erreur lors de la suppression du paramètre système :', error);
        throw new Error(error.response?.data?.message || 'Erreur lors de la suppression.');
    }
};

/**
 * Récupère les paramètres système marqués comme publics (accessible sans authentification).
 * Note : Vous devrez ajouter une route spécifique pour cela dans Laravel si ce n'est pas déjà fait.
 * Dans routes/api.php: Route::get('/public-settings', [SystemSettingController::class, 'publicSettings']);
 * @returns {Promise<Object>} La réponse de l'API.
 */
export const apiGetPublicSystemSettings = async () => {
    try {
        const response = await API.get('/public-settings'); // <-- Assurez-vous que cette route existe
        return response;
    } catch (error) {
        console.error('Erreur lors de la récupération des paramètres publics :', error);
        throw new Error(error.response?.data?.message || 'Erreur de connexion.');
    }
};
