<template>
  <AdminLayout>
    <div class="edit-patient-container">
      <h2>Modifier un Patient</h2>

      <div v-if="patientStore.isLoading">Chargement des données du patient...</div>
      <div v-if="patientStore.error" class="error-message">{{ patientStore.error }}</div>
      <div v-if="patientStore.success" class="success-message">{{ patientStore.success }}</div>

      <form
        @submit.prevent="submitForm"
        class="patient-form"
        v-if="!patientStore.isLoading && patientStore.currentPatient"
      >
        <fieldset>
          <legend>Informations personnelles</legend>
          <div class="form-row">
            <input v-model="form.first_name" type="text" placeholder="Prénom" required />
            <input v-model="form.last_name" type="text" placeholder="Nom" required />
          </div>
          <div class="form-row">
            <input v-model="form.birth_date" type="date" placeholder="Date de naissance" />
            <input v-model="form.phone" type="text" placeholder="Téléphone" />
          </div>
          <div class="form-row">
            <input v-model="form.email" type="email" placeholder="Adresse email" required />
            <input v-model="form.password" type="password" placeholder="Nouveau mot de passe (laisser vide pour ne pas changer)" />
          </div>
          <div class="form-row">
            <input v-model="form.city" type="text" placeholder="Ville" />
            <input v-model="form.country" type="text" placeholder="Pays" />
          </div>
          <div class="form-row">
            <input v-model="form.address" type="text" placeholder="Adresse" />
          </div>
          <div class="form-row">
            <label for="profile_photo">Mettre à jour la photo de profil:</label>
            <input type="file" id="profile_photo" @change="handleFileUpload" />
          </div>
        </fieldset>

        <fieldset>
          <legend>Informations médicales</legend>

          <div class="form-row">
              <label for="patient-status">Statut du patient :</label>
              <select id="patient-status" v-model="form.status" required>
                  <option value="" disabled>Sélectionner le statut</option>
                  <option value="actif">Actif</option>
                  <option value="en_traitement">En Traitement</option>
                  <option value="stable">Stable</option>
                  <option value="critique">Critique</option>
                  <option value="sorti">Sorti</option>
                  <option value="archive">Archivé</option>
              </select>
          </div>

          <div class="form-row">
              <label for="last_consultation_date">Date de dernière consultation :</label>
              <input type="date" id="last_consultation_date" v-model="form.last_consultation_date" />
          </div>

          <div class="form-row">
            <input v-model="form.genre" type="text" placeholder="Genre" />
            <input v-model="form.group_sanguine" type="text" placeholder="Groupe sanguin" />
          </div>
          <div class="form-row">
            <input v-model="form.telephone_urgence" type="text" placeholder="Téléphone d'urgence" />
            <input v-model="form.numero_urgence" type="text" placeholder="Numéro d'urgence" />
          </div>
          <div class="form-row">
            <input v-model="form.poids" type="number" placeholder="Poids (kg)" />
            <input v-model="form.taille" type="number" placeholder="Taille (m)" step="0.01" />
          </div>
          <div class="form-row">
            <input v-model="form.maladies_chroniques" type="text" placeholder="Maladies chroniques" />
            <input v-model="form.assurance_maladie" type="text" placeholder="Assurance maladie" />
          </div>

          <div class="form-row">
            <label for="hospital-select">Hôpital :</label>
            <select id="hospital-select" v-model="form.hospital_id" :disabled="hospitalStore.loading">
              <option :value="null" disabled>Sélectionner un hôpital</option>
              <option v-if="hospitalStore.loading" disabled>Chargement des hôpitaux...</option>
              <option v-else-if="hospitalStore.error" disabled>Erreur de chargement</option>
              <option
                v-else
                v-for="hospital in hospitalStore.hospitals" :key="hospital.id"
                :value="hospital.id"
              >
                {{ hospital.nom }}
              </option>
            </select>
          </div>

          <div class="form-row">
            <label for="doctor-select">Médecin référent :</label>
            <select id="doctor-select" v-model="form.doctor_id" :disabled="doctorStore.loading">
              <option :value="null" disabled>Sélectionner un médecin</option>
              <option v-if="doctorStore.loading" disabled>Chargement des médecins...</option>
              <option v-else-if="doctorStore.error" disabled>Erreur de chargement</option>
              <option
                v-else
                v-for="doctor in doctorStore.doctors"  :key="doctor.id"
                :value="doctor.id"
              >
                {{ doctor.user?.first_name }} {{ doctor.user?.last_name }} ({{ doctor.speciality || 'N/A' }})
              </option>
            </select>
          </div>
        </fieldset>

        <button type="submit" class="submit-btn" :disabled="patientStore.isLoading">
          Modifier le patient
        </button>
      </form>

      <div v-else-if="!patientStore.isLoading && !patientStore.currentPatient && !patientStore.error">
        Patient non trouvé ou données manquantes.
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
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
  doctor_id: null,
  hospital_id: null,

  // AJOUT DES NOUVEAUX ATTRIBUTS
  status: '',
  last_consultation_date: '',

  patient_id_ref: null
})

const handleFileUpload = (e) => {
  const file = e.target.files[0]
  form.profile_photo = file || null
}

const fillFormWithPatientData = (patientData) => {
  if (!patientData) return

  console.log("📦 Données patient reçues (pour remplissage) :", JSON.parse(JSON.stringify(patientData)))


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

  // 🔑 LIGNE CORRIGÉE/AJOUTÉE : Remplissage de la date de dernière consultation
  form.status = patientData.status || ''
  form.last_consultation_date = patientData.last_consultation_date || ''


  // Remplissage des IDs (si elles proviennent de medicalRecord ou directement du patient)
  form.doctor_id = patientData.medicalRecord?.doctor_id
    ? Number(patientData.medicalRecord.doctor_id)
    : patientData.doctor_id // Fallback au cas où l'ID est directement sur l'objet patient
    ? Number(patientData.doctor_id)
    : null;

  form.hospital_id = patientData.medicalRecord?.hospital_id
    ? Number(patientData.medicalRecord.hospital_id)
    : patientData.hospital_id // Fallback
    ? Number(patientData.hospital_id)
    : null;

  form.patient_id_ref = patientData.id
  form.password = ''
}

const submitForm = async () => {
  const formData = new FormData()

  // 1. Validation de base pour l'ENUM
  if (!form.status) {
    alert("Veuillez sélectionner le statut du patient.")
    return
  }

  // 2. Construction du FormData
  for (const key in form) {
    const value = form[key]
    if (key === 'patient_id_ref') continue
    if (key === 'password' && !value) continue

    // Gestion du fichier de profil
    if (key === 'profile_photo') {
        if (value instanceof File) {
            formData.append(key, value)
        }
        // Pour la mise à jour, on n'envoie 'profile_photo' que si c'est un nouveau fichier.
        // Sinon, le backend conservera l'ancienne.
        continue;
    }

    // Ajout de tous les autres champs qui ne sont pas null ou vides
    if (value !== null && value !== '') {
      formData.append(key, value)
    }
  }

  // 3. Spécifier la méthode PUT pour la mise à jour
  formData.append('_method', 'PUT')

  console.log("🚀 Données du formulaire avant envoi:", JSON.parse(JSON.stringify(form)))

  const success = await patientStore.updatePatient(patientId, formData)
  if (success) {
    setTimeout(() => { router.push({ name: 'Patient' }) }, 2000)
  }
}

watch(() => patientStore.currentPatient, (newPatient) => {
  fillFormWithPatientData(newPatient)
}, { immediate: true })

onMounted(async () => {
  await patientStore.onePatient(patientId)
  await doctorStore.fetchAllDoctors()
  await hospitalStore.fetchAllHospitals()
})
</script>


<style scoped>
/* Vos styles ici, pas de changements majeurs */
.edit-patient-container { max-width: 900px; margin: auto; padding: 30px; background: #ffffff; border-radius: 12px; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
h2 { margin-bottom: 20px; color: #0040d0; }
.patient-form { display: flex; flex-direction: column; gap: 24px; }
fieldset { border: 1px solid #ccc; border-radius: 10px; padding: 20px; }
legend { font-weight: bold; color: #002580; padding: 0 10px; }
.form-row { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 10px; }
input, select, textarea { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
textarea { width: 100%; height: 100px; resize: vertical; }
.submit-btn { align-self: flex-end; background-color: #0040d0; color: white; padding: 12px 24px; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; }
.submit-btn:hover { background-color: #002fa1; }
.error-message { color: red; margin-bottom: 15px; padding: 10px; background-color: #ffe0e0; border: 1px solid red; border-radius: 5px; }
.success-message { color: green; margin-bottom: 15px; padding: 10px; background-color: #e0ffe0; border: 1px solid green; border-radius: 5px; }
</style>
