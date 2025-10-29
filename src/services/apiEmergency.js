import API from './axios' // Ton instance Axios qui injecte le token automatiquement

export const apiGetEmergencyall = async () => {
  try {
    const response = await API.post('/emergency-physician/emergency-physicians')
    return response.data
  } catch (error) {
    console.error('Erreur récupération médecins urgentistes :', error)
    throw new Error(error.response?.data?.message || 'Erreur de connexion')
  }
}

export const apiGetEmergency = async (id) => {
  try {
    const response = await API.get(`/emergency-physician/emergency-physicians/${id}`)
    return response.data
  } catch (error) {
    console.error('Erreur récupération médecin urgentiste :', error)
    throw new Error(error.response?.data?.message || 'Erreur de connexion')
  }
}

export const apiUpdateEmergency = async (id, data) => {
  try {
    await API.put(`/emergency-physician/emergency-physicians/${id}`, data)
  } catch (error) {
    console.error('Erreur mise à jour urgentiste :', error)
    throw new Error(error.response?.data?.message || 'Erreur de connexion')
  }
}

export const apiDeleteEmergency = async (id) => {
  try {
    await API.delete(`/emergency-physician/emergency-physicians/${id}`)
  } catch (error) {
    console.error('Erreur suppression urgentiste :', error)
    throw new Error(error.response?.data?.message || 'Erreur de connexion')
  }
}

export const apiCreateEmergency = async (data) => {
  try {
    await API.post('/emergency-physician/register', data)
  } catch (error) {
    console.error('Erreur création urgentiste :', error)
    throw new Error(error.response?.data?.message || 'Erreur de connexion')
  }
}

