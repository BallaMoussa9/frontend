// stores/appointmentPatientStore.js

import { defineStore } from 'pinia';
import API from '@/services/axios';

export const useAppointmentPatientStore = defineStore('appointmentPatient', {
  state: () => ({
    appointments: [],
    loading: false,
    error: null,
    success: null,
    doctorsListForSelection: [],
  }),
  getters: {
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

    async fetchPatientAppointments(patientId) {
      this.clearMessages();
      this.setLoading(true);
      try {
        const response = await API.get(`/patient/${patientId}/appointments`);

        console.log('🔍 Structure complète de la réponse:', response);
        console.log('📦 response.data:', response.data);

        let data = [];

        if (response.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (Array.isArray(response.data)) {
          data = response.data;
        }

        console.log('✅ Données finales des rendez-vous:', data);
        this.appointments = data;

        this.setSuccess('Rendez-vous chargés avec succès.');
        return true;
      } catch (err) {
        console.error('❌ Erreur fetchPatientAppointments:', err);
        this.setError('Échec du chargement des rendez-vous: ' + (err.response?.data?.message || err.message));
        this.appointments = [];
        return false;
      } finally {
        this.setLoading(false);
      }
    },

    async createAppointment(patientId, appointmentData) {
      this.clearMessages();
      this.setLoading(true);
      try {
        console.log('🔄 Création rendez-vous:', { patientId, appointmentData });

        const response = await API.post(`/patient/${patientId}/appointments`, appointmentData);

        console.log('✅ Réponse création:', response.data);

        let newAppointment = null;

        if (response.data.appointment) {
          newAppointment = response.data.appointment;
        } else if (response.data.data) {
          newAppointment = response.data.data;
        } else {
          newAppointment = response.data;
        }

        if (newAppointment) {
          if (!Array.isArray(this.appointments)) {
            this.appointments = [];
          }
          this.appointments.unshift(newAppointment);
          this.setSuccess('Rendez-vous pris avec succès !');
        } else {
          throw new Error('Structure de réponse invalide depuis l\'API');
        }

        return true;
      } catch (err) {
        console.error('❌ Erreur création rendez-vous:', err);
        const errorMsg = err.response?.data?.message ||
                        err.response?.data?.error ||
                        err.message;
        this.setError('Échec de la prise de rendez-vous: ' + errorMsg);
        return false;
      } finally {
        this.setLoading(false);
      }
    },

    async fetchDoctorAppointments(doctorId) {
      this.clearMessages();
      this.setLoading(true);
      try {
        const response = await API.get(`/doctor/${doctorId}/appointments`);

        console.log('🔍 Réponse rendez-vous docteur:', response.data);

        let data = [];

        if (response.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data && Array.isArray(response.data.appointments)) {
          data = response.data.appointments;
        }

        this.appointments = data;
        this.setSuccess('Liste de vos rendez-vous chargée avec succès.');
        return true;
      } catch (err) {
        console.error('❌ Erreur fetchDoctorAppointments:', err);
        this.setError('Échec du chargement de vos rendez-vous: ' + (err.response?.data?.message || err.message));
        this.appointments = [];
        return false;
      } finally {
        this.setLoading(false);
      }
    },

    async updateAppointmentStatus(doctorId, appointmentId, status) {
      this.clearMessages();
      this.setLoading(true);
      try {
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
        console.log('🔄 Mise à jour rendez-vous:', { patientId, appointmentId, updateData });

        const response = await API.put(`/patient/${patientId}/appointments/${appointmentId}`, updateData);

        console.log('✅ Réponse mise à jour:', response.data);

        let updatedAppointment = null;

        if (response.data.appointment) {
          updatedAppointment = response.data.appointment;
        } else if (response.data.data) {
          updatedAppointment = response.data.data;
        } else {
          updatedAppointment = response.data;
        }

        if (!Array.isArray(this.appointments)) {
          this.appointments = [];
        }

        const index = this.appointments.findIndex(app => app.id === appointmentId);
        if (index !== -1 && updatedAppointment) {
          this.appointments[index] = updatedAppointment;
          this.setSuccess('Rendez-vous mis à jour avec succès.');
        } else {
          await this.fetchPatientAppointments(patientId);
          this.setSuccess('Rendez-vous mis à jour avec succès.');
        }

        return true;
      } catch (err) {
        console.error('❌ Erreur mise à jour rendez-vous:', err);
        const errorMsg = err.response?.data?.message || err.message;
        this.setError('Échec de la mise à jour du rendez-vous: ' + errorMsg);
        return false;
      } finally {
        this.setLoading(false);
      }
    }
  },
});
