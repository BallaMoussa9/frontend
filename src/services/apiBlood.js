// src/services/apiBlood.js
import API from './axios'; // Assurez-vous que './axios' est bien le chemin vers votre instance Axios configurée

const BLOOD_UNITS_URL = '/bloodunits';

/**
 * Gère les promesses d'appel API pour les unités de sang.
 * @param {Promise} promise - La promesse de l'appel Axios.
 * @returns {Promise<Object>} Les données de la réponse.
 * @throws {Error} Lève une erreur en cas d'échec de la requête.
 */
const handleBloodUnitRequest = async (promise) => {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    // Récupérer le message d'erreur le plus pertinent
    const errorMessage = error.response?.data?.message || 'Erreur de connexion à l\'API du sang.';

    // Pour les erreurs de validation (422), inclure les détails
    if (error.response?.status === 422) {
      const validationErrors = error.response.data.errors;
      // Permet au store d'afficher les erreurs de validation spécifiques
      const firstError = Object.values(validationErrors)[0][0];
      throw new Error(firstError);
    }

    console.error('Erreur API Unités de Sang:', error.response?.data || error.message);
    throw new Error(errorMessage);
  }
};

// ----------------------------------------------------
// Fonctions d'API exportées pour la gestion des unités de sang
// ----------------------------------------------------

/** Récupère toutes les unités de sang. */
export const apiGetBloodUnits = () => handleBloodUnitRequest(API.get(BLOOD_UNITS_URL));

/** Récupère une unité de sang spécifique. */
export const apiGetBloodUnit = (id) => handleBloodUnitRequest(API.get(`${BLOOD_UNITS_URL}/${id}`));

/** Crée une nouvelle unité de sang. */
export const apiCreateBloodUnit = (unitData) => handleBloodUnitRequest(API.post(BLOOD_UNITS_URL, unitData));

/** Met à jour une unité de sang. */
export const apiUpdateBloodUnit = (id, unitData) => handleBloodUnitRequest(API.put(`${BLOOD_UNITS_URL}/${id}`, unitData));

/** Met à jour le statut d'une unité (PATCH pour un seul champ). */
export const apiUpdateBloodUnitStatus = (id, status) => handleBloodUnitRequest(API.patch(`${BLOOD_UNITS_URL}/${id}`, { status: status }));

/** Supprime une unité de sang. */
export const apiDeleteBloodUnit = (id) => handleBloodUnitRequest(API.delete(`${BLOOD_UNITS_URL}/${id}`));
