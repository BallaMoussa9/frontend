import API from './axios'; // 🚨 Correct : l'instance Axios est nommée 'API'

export const apiGetpatientall = async () => {
  const { data } = await API.get('/patients');
  return data;
};

export const apiGetPatient = async (id) => {
  const { data } = await API.get(`/patients/${id}`);
  return data;
};

export const apiUpdatePatient = async (id, data) => {
  if (data instanceof FormData) {
    const { data: updated } = await API.post(`/patients/${id}`, data, { // Utilisez POST pour FormData avec _method=PUT/PATCH
      headers: {
        "Content-Type": "multipart/form-data",
        "Accept": "application/json",
      },
    });
    return updated;
  } else {
    const { data: updated } = await API.put(`/patients/${id}`, data); // Utilisez PUT pour JSON
    return updated;
  }
};

export const apiDeletePatient = async (id) => {
  await API.delete(`/patients/${id}`);
};

export const apiCreatePatient = async (data) => {
  await API.post(`/patients`, data);
};

export const apiSearchPatients = async (filters) => {
  const params = new URLSearchParams(filters).toString();
  const { data } = await API.get(`/patients/search?${params}`);
  return data;
};

export const apiGetMyPatientProfile = async () => {
    try {
        // 🚨 CORRECTION ICI: Utilisez 'API' (en majuscules)
        const response = await API.get('/patients/profile/patient');
        return response.data;
    } catch (error) {
        console.error("Erreur lors du chargement du profil patient:", error);
        throw error;
    }
};


// 🚨 Si vous avez une fonction apiGetPatientByUserId (pour la connexion), assurez-vous
// qu'elle utilise 'API' et non 'api' aussi.
// Exemple:
// export const apiGetPatientByUserId = async (userId) => {
//     try {
//         const response = await API.get(`/patients/by-user/${userId}`);
//         return response.data;
//     } catch (error) {
//         console.error("Erreur lors du chargement du patient par ID utilisateur (API):", error);
//         throw error;
//     }
// };
