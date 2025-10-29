// stores/appointmentPatientStore.js

import { defineStore } from 'pinia';
import API from '@/services/axios';

export const useAppointmentPatientStore = defineStore('appointmentPatient', {
  state: () => ({
    appointments: [], // ✅ Doit être initialisé comme un tableau vide
    loading: false,
    error: null,
    success: null,
    doctorsListForSelection: [],
  }),
  getters: {
    // ✅ Assurez-vous que le getter retourne toujours un tableau
    getAppointments: (state) => state.appointments || [],
    getDoctorsForSelection: (state) => state.doctorsListForSelection,
  },
  actions: {
    setLoading(value) {
      this.loading = value;
    },
    setError(message) {
      this.error = message;
      this.success = null;
    },
    setSuccess(message) {
      this.success = message;
      this.error = null;
    },
    clearMessages() {
      this.error = null;
      this.success = null;
    },

    setDoctorsForSelection(doctors) {
      this.doctorsListForSelection = doctors;
    },

    async createAppointment(patientId, appointmentData) {
      this.clearMessages();
      this.setLoading(true);
      try {
        const response = await API.post(`/patient/${patientId}/appointments`, appointmentData);

        if (!Array.isArray(this.appointments)) {
            this.appointments = [];
        }
        this.appointments.unshift(response.data.appointment);

        this.setSuccess('Rendez-vous pris avec succès !');
        return true;
      } catch (err) {
        this.setError('Échec de la prise de rendez-vous: ' + (err.response?.data?.message || err.message));
        return false;
      } finally {
        this.setLoading(false);
      }
    },

   // stores/appointmentPatientStore.js

async fetchPatientAppointments(patientId) {
    this.clearMessages();
    this.setLoading(true);
    try {
        const response = await API.get(`/patient/${patientId}/appointments`);

        // 🔑 CORRECTION CRITIQUE ICI : Accéder à response.data.data
        const data = Array.isArray(response.data.data) ? response.data.data : [];

        // Si response.data est un tableau, la correction ne fera pas de mal,
        // mais le JSON montre qu'il est encapsulé.

        this.appointments = data; // Mise à jour de l'état

        this.setSuccess('Rendez-vous chargés avec succès.');
        return true;
    } catch (err) {
        // ... (gestion des erreurs)
        this.appointments = [];
        return false;
    } finally {
        this.setLoading(false);
    }
},

    // ------------------------------------------------------------------
    // ACTIONS SPÉCIFIQUES AU DOCTEUR
    // ------------------------------------------------------------------
 /**
     * Récupère tous les rendez-vous pour le docteur connecté.
     * @param {number} doctorId - L'ID du profil Docteur passé par la vue.
     */
    async fetchDoctorAppointments(doctorId) { // 🔑 Assurez-vous que doctorId est en argument
      this.clearMessages();
      this.setLoading(true);
      try {
        // 🔑 Utilisation CORRECTE de doctorId dans la construction de la route
        const response = await API.get(`/doctor/${doctorId}/appointments`);

        const data = Array.isArray(response.data) ? response.data : response.data.data || [];

        this.appointments = data;
        this.setSuccess('Liste de vos rendez-vous chargée avec succès.');
        return true;
      } catch (err) {
        // ... (gestion des erreurs)
        this.setError('Échec du chargement de vos rendez-vous: ' + (err.response?.data?.message || err.message));
        this.appointments = [];
        return false;
      } finally {
        this.setLoading(false);
      }
    },

     /**
     * Met à jour le statut d'un rendez-vous par le Docteur.
     * @param {number} doctorId - L'ID du profil Docteur.
     * @param {number} appointmentId
     * @param {string} status - 'confirmed', 'canceled', ou 'completed'.
     */
    async updateAppointmentStatus(doctorId, appointmentId, status) { // 🔑 doctorId, appointmentId, status
        this.clearMessages();
        this.setLoading(true);
        try {
            // 🔑 Utilisation de doctorId et appointmentId dans la route
            const response = await API.put(`/doctor/${doctorId}/appointments/${appointmentId}/status`, { status: status });

            const updatedAppointment = response.data;
            const index = this.appointments.findIndex(app => app.id === appointmentId);

            if (index !== -1) {
                this.appointments[index] = updatedAppointment;
            }
            this.setSuccess(`Statut du rendez-vous mis à jour à "${status}".`);
            return true;
        } catch (err) {
            this.setError('Échec de la mise à jour du statut: ' + (err.response?.data?.message || err.message));
            return false;
        } finally {
            this.setLoading(false);
        }
    },

    async updateAppointment(patientId, appointmentId, updateData) {
        this.clearMessages();
        this.setLoading(true);
        try {
            const response = await API.put(`/patient/${patientId}/appointments/${appointmentId}`, updateData);

            if (!Array.isArray(this.appointments)) {
                this.appointments = [];
            }
            const index = this.appointments.findIndex(app => app.id === appointmentId);
            if (index !== -1) {
                this.appointments[index] = response.data.appointment;
            }
            this.setSuccess('Rendez-vous mis à jour avec succès.');
            return true;
        } catch (err) {
            this.setError('Échec de la mise à jour du rendez-vous: ' + (err.response?.data?.message || err.message));
            return false;
        } finally {
            this.setLoading(false);
        }
    }
  },
});
