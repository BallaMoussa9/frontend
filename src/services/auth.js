// src/services/auth.js
import API from './axios' // ⬅️ On utilise notre Axios centralisé

export const login = async ({ email, password, role }) => {
  try {
    const { data } = await API.post('/login', { email, password, role })
    // NOUVEAU LOG : Montre la réponse API
    console.log('✅ Réponse complète du service login :', data);
    // On ne stocke RIEN ici, on retourne les données brutes
    return data
  } catch (error) {
    console.error('❌ Erreur lors de la connexion (service auth.js) :', error)
    // Propager l'erreur pour qu'elle soit gérée par le store/composant
    throw new Error(error.response?.data?.message || 'Erreur de connexion inconnue');
  }
}

export const register = async (userData) => {
  try {
    const formData = new FormData()
    formData.append('first_name', userData.first_name)
    formData.append('last_name', userData.last_name)
    formData.append('birth_date', new Date(userData.birth_date).toISOString().split('T')[0])
    formData.append('phone', userData.phone)
    formData.append('country', userData.country)
    formData.append('city', userData.city)
    formData.append('address', userData.address)
    formData.append('email', userData.email)
    formData.append('password', userData.password)
    formData.append('password_confirmation', userData.password_confirmation)

    if (userData.profile_photo) {
      formData.append('profile_photo', userData.profile_photo)
    } 

    const { data } = await API.post('/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
 
    return data
  } catch (error) {
    const errors = error.response?.data?.errors
    if (errors) {
      const messages = Object.values(errors).flat().join('\n')
      console.error('Erreur Laravel :', messages)
      throw new Error(messages)
    }
    throw new Error(error.response?.data?.message || 'Erreur d’inscription')
  }
}

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('role')
  // Pas besoin de toucher à axios.defaults maintenant, car l'interceptor se charge du token
}
