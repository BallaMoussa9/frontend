import { defineStore } from 'pinia';
import {
  apiGetpatientall,
  apiGetPatient,
  apiUpdatePatient,
  apiDeletePatient,
  apiCreatePatient,
  apiSearchPatients,
  apiGetMyPatientProfile,
} from '@/services/apiPatient';

export const usePatientStore = defineStore('patient', {
  state: () => ({
    patients: [],
    patient: null,
    currentPatient: null,
    searchTerm: '',

    // 🔎 Pour la recherche ciblée (formulaire Signes Vitaux)
    searchResults: [],

    loading: false,
    error: null,
    success: null,
  }),

  actions: {
    // ----------------------------------------------------------------------
    // CRUD DE BASE
    // ----------------------------------------------------------------------
    async allPatient() {
      this.loading = true;
      this.error = null;
      try {
        const data = await apiGetpatientall();
        this.patients = data;
      } catch (error) {
        console.error('Erreur allPatient :', error.message);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async onePatient(id) {
      this.loading = true;
      this.error = null;
      this.success = null;
      this.currentPatient = null;

      try {
        const response = await apiGetPatient(id);
        const patientData = response.patient || response;

        if (patientData) {
          this.currentPatient = patientData;
          console.log('✅ Patient chargé dans le store (onePatient) :', this.currentPatient);
        } else {
          this.error = "Aucune donnée patient n'a été retournée par l'API.";
          console.warn('⚠️ API GetPatient : Aucune donnée patient trouvée pour ID', id, response);
        }
      } catch (error) {
        console.error('Erreur onePatient :', error);
        this.error = error.response?.data?.message || error.message;
        this.currentPatient = null;
      } finally {
        this.loading = false;
      }
    },

    async updatePatient(id, data) {
      this.loading = true;
      this.error = null;
      this.success = null;
      try {
        const response = await apiUpdatePatient(id, data);
        const updatedPatientData = response.patient || response;

        if (updatedPatientData) {
          this.currentPatient = updatedPatientData;
          if (this.currentPatient.user && updatedPatientData.user) {
            Object.assign(this.currentPatient.user, updatedPatientData.user);
          }
          this.success = 'Patient mis à jour avec succès !';
          console.log('✅ Patient mis à jour avec succès :', this.currentPatient);
          return true;
        } else {
          this.error = 'Aucune donnée de retour après la mise à jour.';
          return false;
        }
      } catch (err) {
        this.error =
          'Erreur lors de la mise à jour : ' +
          (err.response?.data?.message || err.message || err.toString());
        if (err.response && err.response.status === 422) {
          const validationErrors = Object.values(err.response.data.errors)
            .flat()
            .join(' ; ');
          this.error = 'Validation échouée : ' + validationErrors;
        }
        console.error('❌ Erreur updatePatient :', err);
        return false;
      } finally {
        this.loading = false;
      }
    },

    async deletePatient(id) {
      this.loading = true;
      this.error = null;
      try {
        await apiDeletePatient(id);
        await this.allPatient();
        this.success = 'Patient supprimé avec succès !';
        this.patient = null;
      } catch (error) {
        console.error('Erreur deletePatient :', error.message);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async createPatient(data) {
      this.loading = true;
      this.error = null;
      try {
        await apiCreatePatient(data);
        await this.allPatient();
        this.success = 'Patient ajouté avec succès';
      } catch (error) {
        console.error('Erreur createPatient :', error.message);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    // ----------------------------------------------------------------------
    // 🔍 ACTION DE RECHERCHE (corrigée et robuste)
    // ----------------------------------------------------------------------
    async searchPatients(query = null) {
      this.loading = true;
      this.error = null;

      const isTargetedSearch = query !== null;
      const searchKey = isTargetedSearch ? query : this.searchTerm;

      if (isTargetedSearch) {
        this.searchResults = [];
      }

      // Si la recherche est trop courte
      if (!searchKey || searchKey.length < 3) {
        this.loading = false;
        return;
      }

      try {
        const filters = { search: searchKey };
        const response = await apiSearchPatients(filters);

        console.log('[patientStore] Réponse API (brute) :', response);

        // 👇 Normalisation universelle de la réponse
        const maybeData = response?.data ?? response;
        const patientsCandidate =
          maybeData?.patients ??
          maybeData?.results ??
          maybeData?.items ??
          maybeData;

        const normalized = Array.isArray(patientsCandidate)
          ? patientsCandidate
          : patientsCandidate?.data ?? patientsCandidate?.patients ?? [];

        if (isTargetedSearch) {
          this.searchResults = normalized || [];
        } else {
          this.patients = normalized || [];
        }
      } catch (error) {
        console.error('❌ Erreur recherche :', error);
        this.error =
          error.response?.data?.message ||
          error.message ||
          'Erreur lors de la recherche du patient.';
        if (isTargetedSearch) this.searchResults = [];
        else this.patients = [];
      } finally {
        this.loading = false;
      }
    },

    // ----------------------------------------------------------------------
    // PROFIL PATIENT
    // ----------------------------------------------------------------------
    async fetchMyProfile() {
      this.loading = true;
      this.error = null;
      this.currentPatient = null;
      try {
        const response = await apiGetMyPatientProfile();
        this.currentPatient = response.patient;
        this.success = response.message || 'Mon profil patient chargé.';
        console.log('✅ Mon Profil Patient chargé (Store) :', this.currentPatient);
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.message ||
          'Erreur lors du chargement du profil patient.';
        this.currentPatient = null;
        console.error('❌ Erreur fetchMyProfile :', this.error);
      } finally {
        this.loading = false;
      }
    },

    // ----------------------------------------------------------------------
    // GESTION DES ERREURS / SUCCÈS
    // ----------------------------------------------------------------------
    setError(message) {
      this.error = message;
    },
    clearFeedback() {
      this.error = null;
      this.success = null;
    },
  },

  getters: {
    getPatientData: (state) => state.currentPatient,
    getSearchResults: (state) => state.searchResults,
  },
});
