import API from './axios' // Utilise ton instance axios configurée

export const apiGetNurseall = async () => {
  try {
    const response = await API.get('/nurse/')
    console.log('Récupération infirmiers :', response.data)
    return response.data
  } catch (error) {
    console.error('Erreur récupération des infirmiers :', error)
    throw new Error(error.response?.data?.message || 'Erreur de connexion')
  }
}

export const apiGetNurse = async (id) => {
  try {
    const response = await API.get(`/nurse/${id}`)
    console.log('Détails de l\'infirmier récupérés avec succès :', response.data)
    return response.data
  } catch (error) {
    console.error('Erreur récupération infirmier :', error)
    throw new Error(error.response?.data?.message || 'Erreur de connexion')
  }
}

export const apiUpdateNurse = async (id, data) => {
  try {
    // Note: Utilisation de _method=PUT pour simuler une requête PUT avec le Content-Type: multipart/form-data
    await API.post(`/nurse/${id}?_method=PUT`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (error) {
    console.error('Erreur mise à jour infirmier :', error);
    throw new Error(error.response?.data?.message || 'Erreur de connexion');
  }
};


export const apiDeleteNurse = async (id) => {
  try {
    await API.delete(`/nurse/${id}`)
  } catch (error) {
    console.error('Erreur suppression infirmier :', error)
    throw new Error(error.response?.data?.message || 'Erreur de connexion')
  }
}

// Création d'un infirmier
export const apiCreateNurse = async (formData) => {
  try {
    await API.post('/nurse/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  } catch (error) {
    console.error('Erreur création infirmier :', error)
    throw new Error(error.response?.data?.message || 'Erreur de connexion')
  }
}
/**
 * Récupère le dossier médical électronique (DME) d'un patient.
 * @param {string|number} nurseId
 * @param {string|number} patientId
 */
export const apiGetPatientDme = async (nurseId, patientId) => {
  try {
    const response = await API.get(`/nurse/${nurseId}/patients/${patientId}/dme`);
    return response.data;
  } catch (error) {
    console.error('Erreur de récupération du DME :', error);
    throw new Error(error.response?.data?.message || 'Erreur de connexion');
  }
};

/**
 * Enregistre les signes vitaux d'un patient.
 * 🔑 CORRECTION: S'assure de l'inclusion de /dme/ dans l'URL.
 * @param {string|number} nurseId - L'ID de l'infirmier (doit être un string/number).
 * @param {string|number} patientId - L'ID du patient (doit être un string/number).
 * @param {object} data - Les données des signes vitaux.
 */
export const apiRecordVitalSigns = async (nurseId, patientId, data) => {
  try {
    // ✅ Le chemin d'accès est maintenant correct, incluant /dme/
    const response = await API.post(`/nurse/${nurseId}/patients/${patientId}/dme/vitalsigns`, data);
    return response.data;
  } catch (error) {
    console.error('Erreur d\'enregistrement des signes vitaux :', error);
    // Assurez-vous que l'erreur contient l'URL pour faciliter le débogage (optionnel mais utile)
    throw new Error(error.response?.data?.message || `Erreur de connexion lors de l'appel POST à /nurse/${nurseId}/patients/${patientId}/dme/vitalsigns`);
  }
};

/**
 * Crée un rapport d'activité d'infirmière.
 * @param {string|number} nurseId
 * @param {object} data
 */
export const apiCreateActivitiesReport = async (nurseId, data) => {
  try {
    const response = await API.post(`/nurse/${nurseId}/activities-report`, data);
    return response.data;
  } catch (error) {
    console.error('Erreur de création du rapport :', error);
    throw new Error(error.response?.data?.message || 'Erreur de connexion');
  }
};

/**
 * Récupère l'aperçu de la banque de sang.
 * @param {string|number} nurseId
 */
export const apiGetBloodBankOverview = async (nurseId) => {
  try {
    // Utilise '/blood-bank' pour correspondre à la route de votre fichier de routes
    const response = await API.get(`/nurse/${nurseId}/blood-bank`);
    return response.data;
  } catch (error) {
    console.error('Erreur de récupération de l\'aperçu de la banque de sang :', error);
    throw new Error(error.response?.data?.message || 'Erreur de connexion');
  }
};
