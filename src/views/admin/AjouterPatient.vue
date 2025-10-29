<template>
  <AdminLayout>
    <div class="form-container">
      <h2>Ajouter un Patient</h2>

      <form @submit.prevent="submit">
        <fieldset>
          <legend>Informations personnelles</legend>
          <div class="row">
            <input v-model="form.first_name" placeholder="Prénom" required />
            <input v-model="form.last_name" placeholder="Nom" required />
          </div>
          <div class="row">
            <input type="email" v-model="form.email" placeholder="Email" required />
            <input type="password" v-model="form.password" placeholder="Mot de passe" required />
            <input type="password" v-model="form.password_confirmation" placeholder="Confirmer le mot de passe" required />
          </div>
          <div class="row">
            <input v-model="form.country" placeholder="Pays" />
            <input v-model="form.city" placeholder="Ville" />
          </div>
          <div class="row">
            <input v-model="form.phone" placeholder="Téléphone" />
            <div class="file-input-wrapper">
              <label for="profile_photo" class="file-label">
                {{ form.profile_photo ? form.profile_photo.name : 'Choisir une photo de profil' }}
              </label>
              <input id="profile_photo" type="file" @change="handlePhoto" accept="image/*" class="hidden-file-input" />
            </div>
          </div>
          <div class="row">
            <input type="date" v-model="form.birth_date" placeholder="Date de naissance" />
            <input v-model="form.address" placeholder="Adresse" />
          </div>

          <div class="row form-group-select">
            <label for="hospital-select">Hôpital :</label>
            <select id="hospital-select" v-model="form.hospital_id" :disabled="hospitalStore.loading || hospitalStore.error">
              <option :value="null" disabled>
                {{ hospitalStore.loading ? 'Chargement des hôpitaux...' : hospitalStore.error ? 'Erreur chargement hôpitaux' : 'Sélectionner un hôpital' }}
              </option>
              <option v-for="hospital in hospitals" :key="hospital.id" :value="hospital.id">
                {{ hospital.nom }}
              </option>
            </select>
          </div>

          <div class="row form-group-select">
            <label for="doctor-select">Médecin :</label>
            <select id="doctor-select" v-model="form.doctor_id" :disabled="doctorStore.loading || doctorStore.error">
              <option :value="null" disabled>
                {{ doctorStore.loading ? 'Chargement des médecins...' : doctorStore.error ? 'Erreur chargement médecins' : 'Sélectionner un médecin' }}
              </option>
              <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
                {{ doctor.user?.first_name }} {{ doctor.user?.last_name }} ({{ doctor.speciality || 'Non spécifiée' }})
              </option>
            </select>
          </div>
        </fieldset>

        <fieldset>
          <legend>Infos médicales</legend>

          <div class="row">
              <div class="form-group-select">
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

              <div class="form-group-select">
                  <label for="last_consultation_date">Date de dernière consultation :</label>
                  <input type="date" id="last_consultation_date" v-model="form.last_consultation_date" />
              </div>
          </div>
          <div class="row">
            <input v-model="form.genre" placeholder="Genre" />
            <input v-model="form.group_sanguine" placeholder="Groupe sanguin" />
          </div>
          <div class="row">
            <input v-model="form.telephone_urgence" placeholder="Téléphone d'urgence" />
            <input v-model="form.numero_urgence" placeholder="N° urgence" />
          </div>
          <div class="row">
            <input v-model="form.poids" placeholder="Poids" />
            <input v-model="form.taille" placeholder="Taille" />
          </div>
          <div class="row">
            <input v-model="form.maladies_chroniques" placeholder="Maladies chroniques" />
            <input v-model="form.assurance_maladie" placeholder="Assurance maladie" />
          </div>
        </fieldset>

        <button class="submit-button" type="submit" :disabled="patientStore.loading">
          {{ patientStore.loading ? 'Ajout en cours...' : 'Ajouter le patient' }}
        </button>
      </form>

      <div v-if="patientStore.error" class="error-message">
        Erreur lors de l'ajout du patient : {{ patientStore.error }}
      </div>
      <div v-if="hospitalStore.error" class="error-message">
        Erreur lors du chargement des hôpitaux : {{ hospitalStore.error }}
      </div>
      <div v-if="doctorStore.error" class="error-message">
        Erreur lors du chargement des médecins : {{ doctorStore.error }}
      </div>
      <div v-if="patientStore.success" class="success-message">
        {{ patientStore.success }}
      </div>
    </div>
  </AdminLayout>
</template>
<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { reactive, ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePatientStore } from '@/stores/patientStore'
import { useHospitalStore } from '@/stores/hospitalStore'
import { useDoctorStore } from '@/stores/doctorStore'

const router = useRouter()
const patientStore = usePatientStore()
const hospitalStore = useHospitalStore()
const doctorStore = useDoctorStore()

// Formulaire réactif pour collecter toutes les données
const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirmation: '',
  phone: '',
  birth_date: '',
  city: '',
  address: '',
  country: '',
  profile_photo: null,

  // NOUVEAUX CHAMPS D'INFOS PATIENT
  status: 'actif',
  last_consultation_date: '',

  // Champs existants
  genre: '',
  group_sanguine: '',
  telephone_urgence: '',
  numero_urgence: '',
  poids: '',
  taille: '',
  maladies_chroniques: '',
  assurance_maladie: '',
  hospital_id: null,
  doctor_id: null,
})

const filter = ref('')

const hospitals = computed(() => hospitalStore.hospitals)
const doctors = computed(() => doctorStore.doctors)

// Gestion de l'upload de photo
const handlePhoto = (e) => {
  form.profile_photo = e.target.files[0]
}

// Soumission du formulaire d'ajout de patient
const submit = async () => {
  if (form.password !== form.password_confirmation) {
    alert("Les mots de passe ne correspondent pas.")
    return
  }
  if (!form.hospital_id) {
    alert("Veuillez sélectionner un hôpital.")
    return
  }
  if (!form.doctor_id) {
    alert("Veuillez sélectionner un médecin.")
    return
  }
  if (!form.status) { // Validation pour le champ ENUM requis
    alert("Veuillez sélectionner le statut du patient.")
    return
  }

  // Utilisation de FormData pour l'upload de fichier et les autres données
  const formData = new FormData()
  for (const key in form) {
    if (form[key] !== null && form[key] !== '') {
      if (key === 'profile_photo' && form[key] instanceof File) {
        formData.append(key, form[key])
      } else if (key !== 'profile_photo') {
        formData.append(key, form[key])
      }
    }
  }

  try {
    await patientStore.createPatient(formData)
    if (patientStore.success) {
      alert(patientStore.success)
      // Réinitialisation complète du formulaire après succès
      Object.assign(form, {
        first_name: '', last_name: '', email: '', password: '', password_confirmation: '',
        phone: '', birth_date: '', city: '', address: '', country: '',
        profile_photo: null,
        // Réinitialisation des nouveaux champs
        status: 'actif',
        last_consultation_date: '',
        // Champs existants
        genre: '', group_sanguine: '', telephone_urgence: '',
        numero_urgence: '', poids: '', taille: '', maladies_chroniques: '', assurance_maladie: '',
        hospital_id: null, doctor_id: null,
      })
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ''
    }
  } catch (error) {
    console.error("Erreur lors de la création du patient (via la vue):", error);
  }
}

// Au montage du composant : charge la liste des hôpitaux et médecins
onMounted(() => {
  hospitalStore.fetchAllHospitals()
  doctorStore.fetchAllDoctors()
})
</script>

<style scoped>
/* Le style CSS est nécessaire au bon affichage */
.form-container {
  max-width: 900px;
  margin: 30px auto;
  padding: 40px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  font-family: 'Arial', sans-serif;
}

h2 {
  font-size: 2em;
  color: #002580;
  margin-bottom: 30px;
  text-align: center;
  font-weight: bold;
}

fieldset {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 30px;
  background-color: #fcfcfc;
}

legend {
  font-size: 1.3em;
  font-weight: bold;
  color: #333;
  padding: 0 10px;
  background-color: #ffffff;
  margin-left: 20px;
}

.row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.row > * {
  flex: 1;
  min-width: 200px;
}

input[type="text"],
input[type="email"],
input[type="password"],
input[type="date"],
input[type="number"],
select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1em;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

input:focus,
select:focus {
  border-color: #004080;
  box-shadow: 0 0 0 3px rgba(0, 64, 128, 0.2);
  outline: none;
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666' width='18px' height='18px'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 18px;
  cursor: pointer;
}

select:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
  opacity: 0.7;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #444;
}

.form-group-select {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.submit-button {
  display: block;
  width: 100%;
  padding: 15px 25px;
  margin-top: 30px;
  background-color: #002580;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.submit-button:hover:not(:disabled) {
  background-color: #004080;
  transform: translateY(-2px);
}

.submit-button:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
  opacity: 0.8;
}

.error-message {
  color: #d32f2f;
  background-color: #ffebee;
  border: 1px solid #ef9a9a;
  padding: 12px 20px;
  border-radius: 6px;
  margin-top: 25px;
  font-weight: 500;
}

.success-message {
  color: #388e3c;
  background-color: #e8f5e9;
  border: 1px solid #a5d6a7;
  padding: 12px 20px;
  border-radius: 6px;
  margin-top: 25px;
  font-weight: 500;
}

.file-input-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.file-label {
  display: block;
  width: 100%;
  padding: 12px 15px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  color: #555;
  transition: background-color 0.3s ease;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.file-label:hover {
  background-color: #e0e0e0;
}

.hidden-file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.search-input-wrapper {
  margin-bottom: 30px;
}

.search-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1em;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);
}
</style>
