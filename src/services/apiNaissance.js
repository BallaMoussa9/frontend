// src/services/apiNaissance.js

import API from './axios'; // Assurez-vous que './axios' pointe vers votre instance Axios configurée (par ex. avec un base_url et des intercepteurs)

const handleRequest = async (promise) => {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Erreur de connexion';
    console.error('Erreur API Naissances:', error.response?.data || error.message);
    throw new Error(errorMessage); // Propage l'erreur pour que le store puisse la capturer
  }
};

export const apiGetAllNaissances = () => handleRequest(API.get('/naissances'));
export const apiGetNaissance = (id) => handleRequest(API.get(`/naissances/${id}`));
export const apiCreateNaissance = (naissanceData) => handleRequest(API.post('/naissances', naissanceData));
export const apiUpdateNaissance = (id, naissanceData) => handleRequest(API.put(`/naissances/${id}`, naissanceData));
export const apiDeleteNaissance = (id) => handleRequest(API.delete(`/naissances/${id}`));
