// src/services/axios.js
import axios from 'axios'

const API = axios.create({
  baseURL: 'https://santeko-api.onrender.com/api',
})

// Injecter automatiquement le token à chaque requête
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// (Optionnel) Intercepter les erreurs globales
API.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.warn('🔒 Token expiré ou non valide')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('role')
      // Redirection possible ici
    }
    return Promise.reject(error)
  }
)

export default API
