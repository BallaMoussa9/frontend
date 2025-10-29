// src/services/apiStatistiqueRegionale.js

import API from './axios'; // Assurez-vous que './axios' pointe vers votre instance Axios configurée

const handleRequest = async (promise) => {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Erreur de connexion';
    console.error('Erreur API Statistiques Régionales:', error.response?.data || error.message);
    throw new Error(errorMessage); // Propage l'erreur pour que le store puisse la capturer
  }
};

export const apiGetAllStatistiquesRegionales = () => handleRequest(API.get('/statistiquesregionales'));
export const apiGetStatistiqueRegionale = (id) => handleRequest(API.get(`/statistiquesregionales/${id}`));
export const apiCreateStatistiqueRegionale = (statData) => handleRequest(API.post('/statistiquesregionales', statData));
export const apiUpdateStatistiqueRegionale = (id, statData) => handleRequest(API.put(`/statistiquesregionales/${id}`, statData));
export const apiDeleteStatistiqueRegionale = (id) => handleRequest(API.delete(`/statistiquesregionales/${id}`));
