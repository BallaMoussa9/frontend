import { defineStore } from "pinia"

// Import des fonctions API
import {
  apiCreateDoctor,
  apiDeleteDoctor,
  apiGetDoctor,
  apiGetAllDoctors,
  apiUpdateDoctor,
  apiListPatient,
  getPatientDme,
  startConsultation,
  endConsultation,
  updatePatientDme,
  issuePrescription,
  getAppointments,
} from "@/services/apiDoctor"

export const useDoctorStore = defineStore('doctor', {
  state: () => ({
    doctors: [],
    currentDoctor: null,
    departements: [],
    patients: [],
    patientDme: null,
    consultations: [],
    prescriptions: [],
    appointments: [],
    loading: false,
    error: null,
    success: null,
  }),

  actions: {
    // --- DOCTORS CRUD ---
   async fetchAllDoctors() {
    this.loading = true
    this.error = null
    try {
      const response = await apiGetAllDoctors()
      // ✅ LA CORRECTION PRINCIPALE EST ICI :
      // D'après vos logs, 'response' est déjà l'objet de pagination.
      // Le tableau des docteurs est dans la propriété 'data' de cet objet.
      this.doctors = response.data || [] // <-- C'est LA bonne ligne
      console.log("📋 Docteurs nettoyés dans store (CORRIGÉ) :", this.doctors)
    } catch (err) {
      this.error = err.response?.data?.message || err.message
      console.error("❌ Erreur API doctors :", this.error)
    } finally {
      this.loading = false
    }
  },
    async fetchOneDoctor(id) {
      this.loading = true
      try {
        const res = await apiGetDoctor(id)
        let doc = res ?? null

        if (doc && doc.data) {
          doc = doc.data
        }
        if (doc && doc.data) {
          doc = doc.data
        }

        if (doc) {
          if (!doc.user) {
            doc.user = {
              first_name: doc.first_name ?? '',
              last_name: doc.last_name ?? '',
              email: doc.email ?? '',
              phone: doc.phone ?? '',
              city: doc.city ?? '',
              country: doc.country ?? '',
              address: doc.address ?? '',
              profile_photo: doc.profile_photo ?? null,
              birth_date: doc.birth_date ?? null,
            }
          } else {
            doc.user.first_name = doc.user.first_name ?? doc.first_name ?? ''
            doc.user.last_name  = doc.user.last_name  ?? doc.last_name ?? ''
            doc.user.email      = doc.user.email      ?? doc.email ?? ''
            doc.user.phone      = doc.user.phone      ?? doc.phone ?? ''
            doc.user.city       = doc.user.city       ?? doc.city ?? ''
            doc.user.country    = doc.user.country    ?? doc.country ?? ''
            doc.user.address    = doc.user.address    ?? doc.address ?? ''
            doc.user.profile_photo = doc.user.profile_photo ?? doc.profile_photo ?? null
            doc.user.birth_date = doc.user.birth_date ?? doc.birth_date ?? null
          }
        }

        this.currentDoctor = doc
        this.error = null
      } catch (error) {
        this.error = error.message
        this.currentDoctor = null
      } finally {
        this.loading = false
      }
    },

    async updateDoctor(id, data) {
      this.loading = true
      try {
        // ⚡ On s’assure d’envoyer le bon id du docteur
        const doctorId = this.currentDoctor?.id ?? id

        await apiUpdateDoctor(doctorId, data)
        await this.fetchOneDoctor(doctorId)
        await this.fetchAllDoctors()

        this.success = "Médecin mis à jour avec succès"
        this.error = null
        return true
      } catch (error) {
        this.error = error.message
        return false
      } finally {
        this.loading = false
      }
    },

    async deleteDoctor(id) {
      this.loading = true
      try {
        await apiDeleteDoctor(id)
        await this.fetchAllDoctors()
        this.success = "Médecin supprimé avec succès"
        this.error = null
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async createDoctor(data) {
      this.loading = true
      try {
        await apiCreateDoctor(data)
        await this.fetchAllDoctors()
        this.success = "Médecin créé avec succès"
        this.error = null
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    // --- MÉDECIN -> PATIENTS ---
    async fetchDoctorPatients(doctorId) {
      this.loading = true
      try {
        const res = await apiListPatient(doctorId)
        this.patients = res?.data ?? res ?? []
        this.error = null
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async fetchPatientDme(doctorId, patientId) {
      this.loading = true
      try {
        const res = await getPatientDme(doctorId, patientId)
        this.patientDme = res?.data ?? res ?? null
        this.error = null
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    // --- CONSULTATIONS ---
    async startConsultation(doctorId, patientId) {
      this.loading = true
      try {
        const res = await startConsultation(doctorId, patientId)
        this.consultations.push(res)
        this.error = null
        return res
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async endConsultation(doctorId, consultationId) {
      this.loading = true
      try {
        const res = await endConsultation(doctorId, consultationId)
        this.error = null
        return res
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async updatePatientDme(doctorId, consultationId, data) {
      this.loading = true
      try {
        const res = await updatePatientDme(doctorId, consultationId, data)
        this.patientDme = res
        this.error = null
        return res
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    // --- PRESCRIPTIONS ---
    async issuePrescription(doctorId, patientId, data) {
      this.loading = true
      try {
        const res = await issuePrescription(doctorId, patientId, data)
        this.prescriptions.push(res)
        this.error = null
        return res
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    // --- APPOINTMENTS ---
    async fetchAppointments(doctorId) {
      this.loading = true
      try {
        const res = await getAppointments(doctorId)
        this.appointments = res
        this.error = null
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    }
  }
})
