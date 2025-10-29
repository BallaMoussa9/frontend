// src/services/apiHospital.js

import API from './axios'; // Assurez-vous que './axios' pointe vers votre instance Axios configurée

const handleRequest = async (promise) => {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Erreur de connexion';
    console.error('Erreur API Hôpitaux:', error.response?.data || error.message);
    throw new Error(errorMessage);
  }
};

export const apiGetAllHospitals = () => handleRequest(API.get('/hospitals'));
export const apiGetHospital = (id) => handleRequest(API.get(`/hospitals/${id}`));
export const apiCreateHospital = (hospitalData) => handleRequest(API.post('/hospitals', hospitalData));
export const apiUpdateHospital = (id, hospitalData) => handleRequest(API.put(`/hospitals/${id}`, hospitalData));
export const apiDeleteHospital = (id) => handleRequest(API.delete(`/hospitals/${id}`));
