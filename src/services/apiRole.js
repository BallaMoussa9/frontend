// resources/js/services/apiRole.js

import API from './axios'; // Assurez-vous que './axios' est le bon chemin

/**
 * Récupère tous les rôles disponibles.
 * @returns {Promise<Object[]>} Un tableau d'objets rôle.
 */
export const apiGetAllRoles = async () => {
    try {
        const response = await API.get('/role');
        return response.data; // Le contrôleur renvoie un tableau directement
    } catch (error) {
        console.error('Erreur lors de la récupération des rôles :', error);
        throw new Error(error.response?.data?.message || 'Erreur de connexion.');
    }
};

/**
 * Met à jour le rôle d'un utilisateur spécifique.
 * Le rôle existant de l'utilisateur sera remplacé.
 * @param {number} userId L'ID de l'utilisateur.
 * @param {number} roleId L'ID du nouveau rôle à assigner.
 * @param {number|null} departmentId L'ID du département (nécessaire si le rôle est 'admin').
 * @returns {Promise<Object>} La réponse de l'API (message, user_roles).
 */
export const apiUpdateUserRole = async (userId, roleId, departmentId = null) => {
    try {
        const response = await API.put(`/user/${userId}/role`, {
            role_id: roleId,
            department_id: departmentId,
        });
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la mise à jour du rôle de l'utilisateur ${userId} :`, error);
        throw new Error(error.response?.data?.message || `Erreur lors de la mise à jour du rôle de l'utilisateur ${userId}.`);
    }
};

/**
 * Assigne un rôle à un utilisateur. L'utilisateur peut avoir plusieurs rôles.
 * @param {number} userId L'ID de l'utilisateur.
 * @param {string} roleName Le nom du rôle à assigner.
 * @param {number|null} departmentId L'ID du département (nécessaire si le rôle est 'admin').
 * @returns {Promise<Object>} La réponse de l'API (message, user_roles).
 */
export const apiAddRoleToUser = async (userId, roleName, departmentId = null) => {
    try {
        // Le contrôleur s'attend à `roleName` et potentiellement `departmentId` via POST
        // Note: Le paramètre de route {roleName} dans /user/{user}/role/{roleName}/assign
        // et le paramètre {departmentId} dans la fonction du contrôleur ne correspondent pas directement.
        // Je vais envoyer departmentId dans le corps de la requête POST.
        // Si vous voulez le passer via l'URL, il faudrait modifier la route ou la signature de la fonction du contrôleur.
        const response = await API.post(`/user/${userId}/role/${roleName}/assign`, {
            department_id: departmentId // Envoyer department_id dans le corps de la requête
        });
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de l'assignation du rôle '${roleName}' à l'utilisateur ${userId} :`, error);
        throw new Error(error.response?.data?.message || `Erreur lors de l'assignation du rôle '${roleName}' à l'utilisateur ${userId}.`);
    }
};


/**
 * Retire un rôle spécifique d'un utilisateur.
 * @param {number} userId L'ID de l'utilisateur.
 * @param {string} roleName Le nom du rôle à retirer.
 * @returns {Promise<Object>} La réponse de l'API (message).
 */
export const apiRemoveRoleFromUser = async (userId, roleName) => {
    try {
        const response = await API.post(`/user/${userId}/role/${roleName}/remove`); // Pas de corps requis pour cette action
        return response.data;
    } catch (error) {
        console.error(`Erreur lors du retrait du rôle '${roleName}' de l'utilisateur ${userId} :`, error);
        throw new Error(error.response?.data?.message || `Erreur lors du retrait du rôle '${roleName}' de l'utilisateur ${userId}.`);
    }
};
