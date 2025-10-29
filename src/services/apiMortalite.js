// src/services/apiMortalite.js

import API from './axios'; // Assurez-vous que './axios' pointe vers votre instance Axios configurée

const handleRequest = async (promise) => {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Erreur de connexion';
    console.error('Erreur API Mortalités:', error.response?.data || error.message);
    throw new Error(errorMessage); // Propage l'erreur pour que le store puisse la capturer
  }
};

export const apiGetAllMortalites = () => handleRequest(API.get('/mortalites'));
export const apiGetMortalite = (id) => handleRequest(API.get(`/mortalites/${id}`));
export const apiCreateMortalite = (mortaliteData) => handleRequest(API.post('/mortalites', mortaliteData));
export const apiUpdateMortalite = (id, mortaliteData) => handleRequest(API.put(`/mortalites/${id}`, mortaliteData));
export const apiDeleteMortalite = (id) => handleRequest(API.delete(`/mortalites/${id}`));
