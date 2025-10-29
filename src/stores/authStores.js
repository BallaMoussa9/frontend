import axios from 'axios'
import { defineStore } from 'pinia'
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '@/services/auth'
import { useUserStore } from './userStore'
import router from '../../router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    role_name: null,
    role_id: null,
    loading: false,
    authError: null,
    initialized: false,
    // 🔑 Ajout de profileId dans l'état pour un accès direct et réactif
    profileId: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token && !!state.user,
    userId: (state) => state.user?.id || null,
    // 🔑 Getter principal, utilise le state.profileId si disponible
    getProfileId: (state) => state.profileId || state.user?.profileId || state.user?.id || null,
  },

  actions: {
    /**
     * 🧠 Initialise le store à partir du localStorage (utile après F5)
     */
    async initializeAuth() {
      if (this.initialized) return
      this.loading = true

      try {
        const token = localStorage.getItem('token')
        const user = localStorage.getItem('user')
        const role_name = localStorage.getItem('role_name')
        const role_id = localStorage.getItem('role_id')
        const profileId = localStorage.getItem('profileId'); // Peut être utile pour la réinitialisation

        if (token && user && role_name && role_id) {
          this.token = token
          this.user = JSON.parse(user)
          this.role_name = role_name
          this.role_id = parseInt(role_id)
          this.profileId = profileId ? parseInt(profileId) : null;
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

          // 🔑 Mise à jour de l'ID de profil (vérifie si l'ID est toujours valide)
          await this.updateProfileId()
        }
      } catch (e) {
        console.error('Erreur initializeAuth :', e)
      } finally {
        this.loading = false
        this.initialized = true
      }
    },

    /**
     * 🔄 Met à jour l’ID du profil selon le rôle (gestion des infirmiers incluse)
     */
    async updateProfileId() {
      if (!this.user) return
      const userStore = useUserStore()

      try {
        let finalProfileId = this.user.id

        if (this.role_name === 'doctor') {
          finalProfileId = await userStore.fetchDoctorByUserId(this.user.id) || this.user.id
        } else if (this.role_name === 'patient') {
          finalProfileId = await userStore.fetchPatientByUserId(this.user.id) || this.user.id
        } else if (this.role_name === 'nurse') {
          finalProfileId = await userStore.fetchNurseByUserId(this.user.id) || this.user.id
        }

        // 🔑 Utilise l'action sécurisée pour mettre à jour l'état et le localStorage
        this.setProfileId(finalProfileId)

      } catch (err) {
        // Souvent une erreur 401 ou 404 lors du chargement initial/update
        console.error('Erreur updateProfileId (Probable 401/404) :', err)
        // En cas d'échec de l'API, on utilise l'ID utilisateur comme fallback
        this.setProfileId(this.user.id)
      }
    },

    /**
     * 🔑 Connexion (Logique optimisée pour éviter le 401 lors de l'appel profil)
     */
    async login(credentials) {
      this.loading = true
      this.authError = null

      try {
        const response = await apiLogin(credentials)

        // 1. Définir les données de session de base
        this.user = response.user
        this.token = response.token
        this.role_name = response.role_name
        this.role_id = response.role_id

        // 2. Mettre à jour l'en-tête AXIOS et sauvegarder la base de la session
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        localStorage.setItem('token', this.token)
        localStorage.setItem('role_name', this.role_name)
        localStorage.setItem('role_id', this.role_id)
        localStorage.setItem('user', JSON.stringify(this.user))

        this.initialized = true

        // 3. 🔑 APPEL SÉCURISÉ : On met à jour l'ID de profil (NurseId, PatientId...)
        // L'appel se fait après la mise à jour des headers et du local storage.
        await this.updateProfileId()

        // 4. Redirection
        this.redirectAfterLogin()

        return response
      } catch (error) {
        this.authError = error.message || 'Échec de la connexion'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 🚪 Déconnexion
     */
    async logout(shouldCallApiLogout = true) {
      try {
        if (shouldCallApiLogout) {
          // Utilise .catch() pour ne pas bloquer si l'API est déjà expirée/inaccessible
          await apiLogout().catch(() => {})
        }
      } catch (err) {
        console.warn('Erreur logout API :', err)
      }

      this.user = null
      this.token = null
      this.role_name = null
      this.role_id = null
      this.authError = null
      this.initialized = false
      this.profileId = null // 🔑 Réinitialisation du profileId

      localStorage.clear() // Nettoie toutes les clés
      delete axios.defaults.headers.common['Authorization']

      router.push({ name: 'Login' })
    },

    /**
     * 🧭 Redirection intelligente selon le rôle
     */
    redirectAfterLogin() {
      // 🔑 Utilisation du getter pour l'ID de profil
      const id = this.getProfileId

      switch (this.role_name) {
        case 'doctor':
          router.push({ name: 'DoctorDashboard', params: { id } })
          break
        case 'patient':
          router.push({ name: 'PatientDashboard', params: { id } })
          break
        case 'nurse':
          router.push({ name: 'NurseDashboard', params: { id } })
          break
        case 'admin':
          router.push({ name: 'AdminDashboard' })
          break
        default:
          router.push('/')
      }
    },

    /**
     * 🔒 MUTATION SÉCURISÉE: Définit l'ID de profil.
     * 🔑 Résout le "TypeError: 'set' on proxy"
     * @param {number} id L'ID spécifique au rôle (ex: Nurse ID)
     */
    setProfileId(id) {
        this.profileId = id;
        // Met également à jour l'objet 'user' pour la compatibilité avec les anciens getters
        if (this.user) {
            this.user.profileId = id;
        }
        // Stockage du profileId dans le localStorage pour l'initialization
        localStorage.setItem('profileId', id);
    },

    /**
     * 📝 Inscription
     */
    async register(userData) {
      this.loading = true
      this.authError = null
      try {
        await apiRegister(userData)
        return true
      } catch (error) {
        this.authError = error.message || "Échec de l'inscription"
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
