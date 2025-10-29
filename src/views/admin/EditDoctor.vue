<template>
  <AdminLayout>
    <div class="ajouter-medecin-container">
      <h2>Modifier un Médecin</h2>

      <div v-if="doctorStore.loading">Chargement des données du médecin...</div>
      <div v-if="doctorStore.error" class="error-message">{{ doctorStore.error }}</div>
      <div v-if="doctorStore.success" class="success-message">{{ doctorStore.success }}</div>

      <form 
        @submit.prevent="submitForm" 
        class="medecin-form" 
        v-if="!doctorStore.loading && doctorStore.currentDoctor"
      >
        <fieldset>
          <legend>Informations générales</legend>
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
            <select v-model="form.department_id">
              <option disabled value="">-- Département --</option>
              <option 
                v-for="dept in departmentStore.departments" 
                :key="dept.id" 
                :value="dept.id"
              > 
                {{ dept.name }}
              </option>
            </select>
          </div>
          <div class="form-row">
            <label for="profile_photo">Photo de profil actuelle:</label>
            <img 
              v-if="form.profile_photo_url" 
              :src="form.profile_photo_url" 
              alt="Photo de profil actuelle" 
              style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-right: 15px;" 
            />
            <input type="file" id="profile_photo" @change="handleFileUpload" />
          </div>
        </fieldset>

        <fieldset>
          <legend>Détails professionnels</legend>
          <div class="form-row">
            <input v-model="form.speciality" type="text" placeholder="Spécialité" />
            <input v-model="form.numero_ordre" type="text" placeholder="Numéro d’ordre" />
          </div>
          <div class="form-row">
            <input v-model="form.numero_professionel" type="text" placeholder="N° professionnel" />
            <input v-model="form.experience" type="number" placeholder="Expérience (années)" />
          </div>
          <textarea v-model="form.biography" placeholder="Biographie"></textarea>
        </fieldset>

        <button type="submit" class="submit-btn" :disabled="doctorStore.loading">
          Modifier le médecin
        </button>
      </form>

      <div v-else-if="!doctorStore.loading && !doctorStore.currentDoctor && !doctorStore.error">
        Médecin non trouvé ou données manquantes.
      </div>
    </div>
  </AdminLayout>
</template>


<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDoctorStore } from '@/stores/doctorStore'
import { useDepartmentStore } from '@/stores/departmentStore'

const route = useRoute()
const router = useRouter()
const doctorStore = useDoctorStore()
const departmentStore = useDepartmentStore()

// ✅ ici on récupère bien l’ID du DOCTOR (pas l'user)
const doctorId = route.params.id

const form = reactive({
  first_name: '',
  last_name: '',
  birth_date: '',
  phone: '',
  country: '',
  city: '',
  profile_photo: null,
  profile_photo_url: '',
  status: 'active',
  address: '',
  email: '',
  password: '',
  department_id: '',
  speciality: '',
  numero_ordre: '',
  biography: '',
  experience: '',
  numero_professionel: ''
})

const handleFileUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    form.profile_photo = file
    form.profile_photo_url = URL.createObjectURL(file)
  } else {
    form.profile_photo = null
  }
}

const fillFormWithDoctorData = (doctorData) => {
  if (doctorData) {
    // Champs USER
    form.first_name = doctorData.user?.first_name || ''
    form.last_name = doctorData.user?.last_name || ''
    form.birth_date = doctorData.user?.birth_date || ''
    form.phone = doctorData.user?.phone || ''
    form.country = doctorData.user?.country || ''
    form.city = doctorData.user?.city || ''
    form.address = doctorData.user?.address || ''
    form.email = doctorData.user?.email || ''
    form.profile_photo_url = doctorData.user?.profile_photo 
      ? `/storage/${doctorData.user.profile_photo}` 
      : null

    // Champs DOCTOR
    form.department_id = doctorData.department_id || ''
    form.speciality = doctorData.speciality || ''
    form.numero_ordre = doctorData.numero_ordre || ''
    form.biography = doctorData.biography || ''
    form.experience = doctorData.experience || ''
    form.numero_professionel = doctorData.numero_professionel || ''
    form.status = doctorData.status || 'active'

    // ⚡ très important → garde l’ID réel du docteur
    form.doctor_id = doctorData.id  

    form.password = '' // jamais pré-rempli
  }
}


const submitForm = async () => {
  const formData = new FormData();

  for (const key in form) {
    const value = form[key];
    if (key === 'profile_photo_url' || key === 'password_confirmation') continue;
    if (key === 'password' && !value) continue;
    if (key === 'profile_photo' && !(value instanceof File)) continue;
    if (value !== null && value !== '') {
      formData.append(key, value);
    }
  }

  formData.append('_method', 'PUT');

  for (let pair of formData.entries()) {
    console.log(pair[0]+ ': ' + pair[1]); 
  }
console.log("➡️ ID du docteur envoyé :", form.doctor_id)

  // ✅ Ici on envoie bien doctorId (ex: 26)
const success = await doctorStore.updateDoctor(form.doctor_id, formData);

  if (success) {
    setTimeout(() => {
      router.push({ name: 'Doctor' });
    }, 2000);
  }
};

watch(() => doctorStore.currentDoctor, (newDoctor) => {
  fillFormWithDoctorData(newDoctor)
}, { immediate: true })

onMounted(async () => {
  await doctorStore.fetchOneDoctor(doctorId)
  await departmentStore.fetchDepartments()
})
</script>



<style scoped>
/* styles intacts */
.ajouter-medecin-container {
  max-width: 900px;
  margin: auto;
  padding: 30px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
}

h2 {
  margin-bottom: 20px;
  color: #0040d0;
}

.medecin-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

fieldset {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 20px;
}

legend {
  font-weight: bold;
  color: #002580;
  padding: 0 10px;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 10px;
}

input,
select,
textarea {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

textarea {
  width: 100%;
  height: 100px;
  resize: vertical;
}

.submit-btn {
  align-self: flex-end;
  background-color: #0040d0;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
}

.submit-btn:hover {
  background-color: #002fa1;
}

.error-message {
  color: red;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #ffe0e0;
  border: 1px solid red;
  border-radius: 5px;
}

.success-message {
  color: green;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #e0ffe0;
  border: 1px solid green;
  border-radius: 5px;
}
</style>
