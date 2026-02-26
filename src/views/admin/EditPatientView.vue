<template>
  <AdminLayout>
    <div class="edit-patient-container">
      <div class="header-section">
        <button @click="router.push({ name: 'Patient' })" class="back-circle-btn" title="Retour à la liste">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h2>Modifier le Dossier Patient</h2>
      </div>

      <div v-if="patientStore.isLoading" class="state-loader">Chargement...</div>
      <div v-if="patientStore.error" class="message error-message">{{ patientStore.error }}</div>
      <div v-if="patientStore.success" class="message success-message">{{ patientStore.success }}</div>

      <form
        @submit.prevent="submitForm"
        class="patient-form"
        v-if="!patientStore.isLoading && patientStore.currentPatient"
      >
        <fieldset>
          <legend>Informations personnelles</legend>
          <div class="form-row">
            <div class="input-group">
              <label>Prénom</label>
              <input v-model="form.first_name" type="text" required />
            </div>
            <div class="input-group">
              <label>Nom</label>
              <input v-model="form.last_name" type="text" required />
            </div>
          </div>
          <div class="form-row">
            <div class="input-group">
              <label>Date de naissance</label>
              <input v-model="form.birth_date" type="date" />
            </div>
            <div class="input-group">
              <label>Téléphone</label>
              <input v-model="form.phone" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="input-group">
              <label>Email</label>
              <input v-model="form.email" type="email" required />
            </div>
            <div class="input-group">
              <label>Nouveau mot de passe</label>
              <input v-model="form.password" type="password" placeholder="Laisser vide pour garder l'ancien" />
            </div>
          </div>
          <div class="form-row">
            <div class="input-group">
              <label>Ville</label>
              <input v-model="form.city" type="text" />
            </div>
            <div class="input-group">
              <label>Pays</label>
              <input v-model="form.country" type="text" />
            </div>
          </div>
          <div class="form-row full-width">
            <label>Adresse</label>
            <input v-model="form.address" type="text" />
          </div>
          <div class="form-row full-width">
            <label>Photo de profil</label>
            <input type="file" @change="handleFileUpload" accept="image/*" />
          </div>
        </fieldset>

        <fieldset>
          <legend>Informations médicales</legend>
          <div class="form-row">
            <div class="input-group">
              <label>Statut</label>
              <select v-model="form.status" required>
                <option value="actif">Actif</option>
                <option value="en_traitement">En Traitement</option>
                <option value="stable">Stable</option>
                <option value="critique">Critique</option>
                <option value="sorti">Sorti</option>
                <option value="archive">Archivé</option>
              </select>
            </div>
            <div class="input-group">
              <label>Dernière consultation</label>
              <input type="date" v-model="form.last_consultation_date" />
            </div>
          </div>

          <div class="form-row">
            <div class="input-group">
              <label>Hôpital</label>
              <select v-model="form.hospital_id" :disabled="hospitalStore.loading">
                <option :value="null">Sélectionner un hôpital</option>
                <option v-for="h in hospitalStore.hospitals" :key="h.id" :value="h.id">{{ h.nom }}</option>
              </select>
            </div>
            <div class="input-group">
              <label>Médecin référent</label>
              <select v-model="form.doctor_id" :disabled="doctorStore.loading">
                <option :value="null">Sélectionner un médecin</option>
                <option v-for="d in doctorStore.doctors" :key="d.id" :value="d.id">
                  {{ d.user?.last_name }} ({{ d.speciality || 'Généraliste' }})
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="input-group">
              <label>Poids (kg)</label>
              <input v-model="form.poids" type="number" />
            </div>
            <div class="input-group">
              <label>Taille (m)</label>
              <input v-model="form.taille" type="number" step="0.01" />
            </div>
          </div>
        </fieldset>

        <div class="form-actions">
          <button type="button" @click="router.push({ name: 'Patient' })" class="cancel-btn">
            Annuler
          </button>
          <button type="submit" class="submit-btn" :disabled="patientStore.isLoading">
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  </AdminLayout>
</template>

<script setup>
/* Logique JS identique à ton code précédent (pas de changement nécessaire ici) */
import AdminLayout from '@/layouts/AdminLayout.vue'
import { reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePatientStore } from '@/stores/patientStore'
import { useDoctorStore } from '@/stores/doctorStore'
import { useHospitalStore } from '@/stores/hospitalStore'

const route = useRoute()
const router = useRouter()
const patientStore = usePatientStore()
const doctorStore = useDoctorStore()
const hospitalStore = useHospitalStore()

const patientId = route.params.id

const form = reactive({
  first_name: '', last_name: '', birth_date: '', phone: '', country: '',
  city: '', profile_photo: null, address: '', email: '', password: '',
  genre: '', group_sanguine: '', telephone_urgence: '', maladies_chroniques: '',
  assurance_maladie: '', numero_urgence: '', poids: '', taille: '',
  doctor_id: null, hospital_id: null, status: '', last_consultation_date: '',
  patient_id_ref: null
})

const handleFileUpload = (e) => {
  const file = e.target.files[0]
  form.profile_photo = file || null
}

const fillFormWithPatientData = (patientData) => {
  if (!patientData) return
  form.first_name = patientData.user?.first_name || ''
  form.last_name = patientData.user?.last_name || ''
  form.birth_date = patientData.user?.birth_date || ''
  form.phone = patientData.user?.phone || ''
  form.country = patientData.user?.country || ''
  form.city = patientData.user?.city || ''
  form.address = patientData.user?.address || ''
  form.email = patientData.user?.email || ''
  form.genre = patientData.genre || ''
  form.group_sanguine = patientData.group_sanguine || ''
  form.telephone_urgence = patientData.telephone_urgence || ''
  form.maladies_chroniques = patientData.maladies_chroniques || ''
  form.assurance_maladie = patientData.assurance_maladie || ''
  form.numero_urgence = patientData.numero_urgence || ''
  form.poids = patientData.poids || ''
  form.taille = patientData.taille || ''
  form.status = patientData.status || ''
  form.last_consultation_date = patientData.last_consultation_date || ''
  form.doctor_id = patientData.medicalRecord?.doctor_id ? Number(patientData.medicalRecord.doctor_id) : (patientData.doctor_id ? Number(patientData.doctor_id) : null);
  form.hospital_id = patientData.medicalRecord?.hospital_id ? Number(patientData.medicalRecord.hospital_id) : (patientData.hospital_id ? Number(patientData.hospital_id) : null);
  form.patient_id_ref = patientData.id
  form.password = ''
}

const submitForm = async () => {
  const formData = new FormData()
  if (!form.status) { alert("Sélectionner le statut."); return; }
  for (const key in form) {
    if (key === 'patient_id_ref' || (key === 'password' && !form[key])) continue
    if (key === 'profile_photo') { if (form[key] instanceof File) formData.append(key, form[key]); continue; }
    if (form[key] !== null && form[key] !== '') formData.append(key, form[key])
  }
  formData.append('_method', 'PUT')
  const success = await patientStore.updatePatient(patientId, formData)
  if (success) { setTimeout(() => { router.push({ name: 'Patient' }) }, 2000) }
}

watch(() => patientStore.currentPatient, (newPatient) => { fillFormWithPatientData(newPatient) }, { immediate: true })

onMounted(async () => {
  await patientStore.onePatient(patientId)
  await doctorStore.fetchAllDoctors()
  await hospitalStore.fetchAllHospitals()
})
</script>

<style scoped>
.edit-patient-container { max-width: 900px; margin: 2rem auto; padding: 2rem; background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }

/* Header & Back Button */
.header-section { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid #eee; padding-bottom: 1rem; }
.back-circle-btn { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; border: 1px solid #ddd; background: white; cursor: pointer; transition: 0.2s; color: #555; }
.back-circle-btn:hover { background: #f5f5f5; color: #0040d0; border-color: #0040d0; }
h2 { color: #0040d0; margin: 0; font-size: 1.5rem; }

/* Form Layout */
.patient-form { display: flex; flex-direction: column; gap: 2rem; }
fieldset { border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.5rem; background: #fcfcfc; }
legend { font-weight: bold; color: #333; padding: 0 10px; }
.form-row { display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
.input-group { flex: 1; min-width: 250px; display: flex; flex-direction: column; gap: 0.4rem; }
.full-width { flex-direction: column; width: 100%; }

label { font-size: 0.85rem; font-weight: 600; color: #666; }
input, select { padding: 10px; border: 1px solid #cbd5e0; border-radius: 6px; font-size: 0.9rem; width: 100%; }
input:focus { border-color: #0040d0; outline: none; box-shadow: 0 0 0 2px rgba(0,64,208,0.1); }

/* Actions */
.form-actions { display: flex; justify-content: flex-end; gap: 1rem; border-top: 1px solid #eee; padding-top: 1.5rem; }
.submit-btn { background: #0040d0; color: white; padding: 12px 25px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; }
.submit-btn:hover { background: #002fa1; }
.cancel-btn { background: #edf2f7; color: #4a5568; padding: 12px 25px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; }
.cancel-btn:hover { background: #e2e8f0; }

.message { padding: 10px; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem; }
.error-message { background: #fff5f5; color: #c53030; border: 1px solid #feb2b2; }
.success-message { background: #f0fff4; color: #2f855a; border: 1px solid #9ae6b4; }
</style>