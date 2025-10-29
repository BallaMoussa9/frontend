import API from './axios' // Utilise ton instance configurée

/**
 * Récupère tous les docteurs.
 * @returns {Promise<Array>} Tableau de docteurs.
 * Correction : La route pour obtenir tous les docteurs est une requête GET, pas POST.
 * La route est '/doctors'.
 */
export const apiGetAllDoctors = async () => {
  try {
    // Changement de la méthode de .post() à .get()
    const response = await API.get('/doctors')
    const user1=response.data.data;
     console.log(user1);
    //
    console.log(response.data.data)
   //console.log(response.data.data[0].user);
    return response.data
  } catch (error) {
    console.error('Erreur récupération des docteurs :', error)
    throw new Error(error.response?.data?.message || 'Erreur de connexion')
  }
}

/**
 * Récupère un docteur par son ID.
 * @param {string|number} id L'ID du docteur.
 * Correction : Le nom de la fonction était 'apiGetDoctor', il est déjà correct.
 */
export const apiGetDoctor = async (id) => {
  try {
    const response = await API.get(`/doctors/${id}`)
    return response.data
    //console.log(response.data);

  } catch (error) {
    console.error('Erreur récupération du docteur :', error)
    throw new Error(error.response?.data?.message || 'Erreur de connexion')
  }
}

/**
 * Met à jour un docteur.
 * @param {string|number} id L'ID du docteur.
 * @param {Object} data Les données à mettre à jour.
 * Correction : L'URL a été corrigée, le chemin est '/doctors/{id}'. La double barre oblique a été retirée.
 */
// export const apiUpdateDoctor = async (id, data) => {
//   try {
//     // Changement de l'URL de '/doctor/doctors/${id}' à '/doctors/${id}'
//     await API.put(`/doctors/${id}`, data)
//   } catch (error) {
//     console.error('Erreur mise à jour du docteur :', error)
//     throw new Error(error.response?.data?.message || 'Erreur de connexion')
//   }
// }
export const apiUpdateDoctor = async (doctorId, data) => {
  try {
    // ⚡️ On force POST + override Laravel
    if (data instanceof FormData && !data.has('_method')) {
      data.append('_method', 'PUT')
    }

    const response = await API.post(`/doctors/${doctorId}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  } catch (error) {
    console.error('Erreur mise à jour du docteur :', error)
    if (error.response && error.response.status === 422) {
      console.error('Erreurs de validation :', error.response.data.errors)
      throw new Error(Object.values(error.response.data.errors).flat().join(' '))
    }
    throw new Error(error.response?.data?.message || 'Erreur de connexion')
  }
}

/**
 * Supprime un docteur.
 * @param {string|number} id L'ID du docteur.
 * Le code est déjà correct.
 */
export const apiDeleteDoctor = async (id) => {
  try {
    await API.delete(`/doctors/${id}`)
  } catch (error) {
    console.error('Erreur suppression du docteur :', error)
    throw new Error(error.response?.data?.message || 'Erreur de connexion')
  }
}

/**
 * Crée un nouveau docteur.
 * @param {Object} data Les données du nouveau docteur.
 * Correction : La route est '/doctors/register'.
 * Le nom de la fonction est déjà correct.
 */
export const apiCreateDoctor = async (data) => {
  try {
    await API.post('/doctors/register', data)
  } catch (error) {
    console.error('Erreur création du docteur :', error)
    throw new Error(error.response?.data?.message || 'Erreur de connexion')
  }
} // <-- FERMEZ CORRECTEMENT apiCreateDoctor ICI !

//id doctor
export const apiListPatient = async (id) =>{
  try{
    // Correction: 'patints' -> 'patients'
  await API.get(`doctor/${id}/patients`) // <-- CORRECTION ICI
  }catch(error){
    console.error('Erreur de recuperation des patients du docteur')
    throw new Error(error.response?.data?.message || 'Erreur de connexion') // Ajoutez un message par défaut
  }
}

// id doctor et id patient
export const getPatientDme = async (d_id,p_id) => { // <-- Ajoutez les parenthèses manquantes
  try {
    // Correction: Manque un '/' entre d_id et patients
    await API.get(`doctor/${d_id}/patients/${p_id}/dme`) // <-- CORRECTION ICI
  } catch (error) {
    console.error('Erreur de recuperation des dossier patient')
    // Correction: 'message' doit être une chaîne de caractères
    throw new  Error(error.response?.data?.message || 'Erreur de connexion') // <-- CORRECTION ICI
  }
}

//id doctor et id patient
export const startConsultation = async (d_id, p_id) => { // Correction: p_id au lieu de par_id
  try {
      // Correction: La fonction doit retourner quelque chose si vous voulez l'utiliser, par exemple la réponse.
      // Et vous avez oublié 'await'
      const response = await API.post(`doctor/${d_id}/patients/${p_id}/consultations/start`) // <-- CORRECTION ICI
      return response.data; // Retourne la réponse si nécessaire
  } catch (error) {
    console.error('Erreur de demarage de la consultation ')
    // Correction: 'message' doit être une chaîne de caractères
    throw new Error(error.response?.data?.message || 'Erreur de connexion') // <-- CORRECTION ICI
  }
}

//id doctor et id consultation
export const endConsultation = async(d_id,c_id) => { // <-- Ajoutez les parenthèses manquantes
  try {
      // Correction: Oubli de 'await'
      const response = await API.post(`doctor/${d_id}/consultations/${c_id}/end`) // <-- CORRECTION ICI
      return response.data; // Retourne la réponse si nécessaire
  } catch (error) {
    console.error('Erreur de cloture de consultation ')
    throw new Error(error.response?.data?.message || 'Erreur de connexion') // <-- CORRECTION ICI
  }
}

// id consultation
// Correction: La fonction `updatePatientDme` attend `data` pour la requête PUT.
export const updatePatientDme = async (d_id, c_id, data) => { // <-- Correction des paramètres
  try {
      // Correction: Oubli de 'await' et passage des 'data'
      const response = await API.put(`doctor/${d_id}/consultations/${c_id}/dme`, data) // <-- CORRECTION ICI
      return response.data; // Retourne la réponse si nécessaire
  } catch (error) {
    console.error('Erreur d\'edition de dossier medical')
    throw new Error(error.response?.data?.message || 'Erreur de connexion') // <-- CORRECTION ICI
  }
}

// id docteur et id patient
export const issuePrescription = async(d_id,p_id, data) => { // <-- Correction des paramètres
  try {
      // Correction: Oubli de 'await' et passage des 'data'
      const response = await API.post(`doctor/${d_id}/patients/${p_id}/prescriptions`, data) // <-- CORRECTION ICI
      return response.data; // Retourne la réponse si nécessaire
  } catch (error) {
   console.error('Erreur d\'emission de prescription ')
   throw new Error(error.response?.data?.message || 'Erreur de connexion') // <-- CORRECTION ICI
  }
}

//doctor id
export const getAppointments = async(id) => { // <-- Ajoutez les parenthèses manquantes
  try {
    // Correction: Oubli de 'await'
    const response = await API.get(`doctor/${id}/appointments`) // <-- CORRECTION ICI
    return response.data; // Retourne la réponse si nécessaire
  } catch (error) {
    console.error('Erreur de recuperation de rendez-vous d\'un medecin')
    throw new Error(error.response?.data?.message || 'Erreur de connexion') // <-- CORRECTION ICI
  }
}
