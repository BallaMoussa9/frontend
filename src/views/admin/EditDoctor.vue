<template>
  <AdminLayout>
    <div class="modifier-medecin-wrapper">
      <header class="form-header">
        <button @click="router.back()" class="btn-back" title="Retour">
          <span class="arrow">←</span>
        </button>
        <div class="header-text">
          <h2>Modifier un Médecin</h2>
          <p class="subtitle">Mettez à jour les informations du praticien</p>
        </div>
      </header>

      <div v-if="doctorStore.loading" class="state-msg info">
        <div class="spinner"></div> Chargement des données...
      </div>
      <div v-if="doctorStore.error" class="state-msg error">{{ doctorStore.error }}</div>
      <div v-if="doctorStore.success" class="state-msg success">{{ doctorStore.success }}</div>

      <form
        @submit.prevent="submitForm"
        class="medecin-form"
        v-if="!doctorStore.loading && doctorStore.currentDoctor"
      >
        <fieldset class="form-section">
          <legend>Informations générales</legend>
          
          <div class="form-row">
            <div class="field">
              <label>Prénom</label>
              <input v-model="form.first_name" type="text" placeholder="Ex: Jean" required />
            </div>
            <div class="field">
              <label>Nom</label>
              <input v-model="form.last_name" type="text" placeholder="Ex: Dupont" required />
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Date de naissance</label>
              <input v-model="form.birth_date" type="date" />
            </div>
            <div class="field">
              <label>Téléphone</label>
              <input v-model="form.phone" type="text" placeholder="+223 ..." />
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Email</label>
              <input v-model="form.email" type="email" placeholder="email@exemple.com" required />
            </div>
            <div class="field">
              <label>Nouveau mot de passe</label>
              <input v-model="form.password" type="password" placeholder="Laisser vide si inchangé" />
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Ville</label>
              <input v-model="form.city" type="text" />
            </div>
            <div class="field">
              <label>Département / Hôpital</label>
              <select v-model="form.department_id">
                <option disabled value="">-- Sélectionner --</option>
                <option v-for="dept in departmentStore.departments" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="field photo-upload">
            <label>Photo de profil</label>
            <div class="photo-controls">
              <img
                v-if="form.profile_photo_url"
                :src="form.profile_photo_url"
                alt="Profil"
                class="preview-img"
              />
              <input type="file" id="profile_photo" @change="handleFileUpload" accept="image/*" />
            </div>
          </div>
        </fieldset>

        <fieldset class="form-section">
          <legend>Détails professionnels</legend>
          <div class="form-row">
            <div class="field">
              <label>Spécialité</label>
              <input v-model="form.speciality" type="text" placeholder="Ex: Cardiologue" />
            </div>
            <div class="field">
              <label>Numéro d’ordre</label>
              <input v-model="form.numero_ordre" type="text" />
            </div>
          </div>
          <div class="form-row">
            <div class="field">
              <label>Expérience (années)</label>
              <input v-model="form.experience" type="number" />
            </div>
            <div class="field">
              <label>N° professionnel</label>
              <input v-model="form.numero_professionel" type="text" />
            </div>
          </div>
          <div class="field">
            <label>Biographie</label>
            <textarea v-model="form.biography" placeholder="Décrivez le parcours du médecin..."></textarea>
          </div>
        </fieldset>

        <div class="form-actions">
          <button type="button" @click="router.back()" class="cancel-btn">Annuler</button>
          <button type="submit" class="submit-btn" :disabled="doctorStore.loading">
            {{ doctorStore.loading ? 'Enregistrement...' : 'Enregistrer les modifications' }}
          </button>
        </div>
      </form>
    </div>
  </AdminLayout>
</template>


<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDoctorStore } from '@/stores/doctorStore'
import { useDepartmentStore } from '@/stores/departmentStore'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const route = useRoute()
const router = useRouter()
const doctorStore = useDoctorStore()
const departmentStore = useDepartmentStore()

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
  numero_professionel: '',
  doctor_id: null,
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

// 🔑 CORRECTION CRITIQUE : Utilise doctorData.user, garanti par le store
const fillFormWithDoctorData = (doctorData) => {
  if (!doctorData || !doctorData.user) return; // ⚡ On s'assure que doctorData.user existe

  // 🎯 SOURCE : On utilise uniquement l'objet 'user' garanti par le store Pinia.
  const sourceData = doctorData.user;

  // Remplissage des champs USER (via sourceData.user)
  form.first_name = sourceData.first_name || ''
  form.last_name = sourceData.last_name || ''
  form.birth_date = sourceData.birth_date || ''
  form.phone = sourceData.phone || ''
  form.country = sourceData.country || ''
  form.city = sourceData.city || ''
  form.address = sourceData.address || ''
  form.email = sourceData.email || ''

  // Pour la photo
  const photoPath = sourceData.profile_photo;

  form.profile_photo_url = photoPath
    ? `${BASE_URL}/storage/${photoPath}`
    : null

  // Remplissage des champs DOCTOR (directement sur doctorData)
  form.department_id = doctorData.department_id || ''
  form.speciality = doctorData.speciality || ''
  form.numero_ordre = doctorData.numero_ordre || ''
  form.biography = doctorData.biography || ''
  form.experience = doctorData.experience || ''
  form.numero_professionel = doctorData.numero_professionel || ''
  form.status = doctorData.status || 'active'

  form.doctor_id = doctorData.id

  form.password = ''
}


const submitForm = async () => {
  const formData = new FormData();

  for (const key in form) {
    const value = form[key];
    if (key === 'profile_photo_url' || key === 'password_confirmation') continue;

    if (key === 'password') {
      if (value) {
        formData.append(key, value);
      }
      continue;
    }

    if (key === 'profile_photo') {
        if (value instanceof File) {
             formData.append(key, value);
        }
        continue;
    }

    if (value !== null && value !== '') {
      formData.append(key, value);
    }
  }

  formData.append('_method', 'PUT');

  if (!form.doctor_id) {
    console.error("Erreur: ID du docteur manquant pour la mise à jour.");
    doctorStore.error = "Erreur interne: ID du docteur non défini pour la mise à jour.";
    return;
  }

  const success = await doctorStore.updateDoctor(form.doctor_id, formData);

  if (success) {
    setTimeout(() => {
      router.push({ name: 'Doctor' });
    }, 2000);
  }
};

// =================================================================================
// GARANTIE DE CHARGEMENT : Appel direct + Watch Forcé (inchangé)
// =================================================================================

onMounted(async () => {
  await doctorStore.fetchOneDoctor(doctorId)

  if (doctorStore.currentDoctor) {
      fillFormWithDoctorData(doctorStore.currentDoctor);
  }

  await departmentStore.fetchDepartments()
})

// Surveillance Forcée : Regarde l'objet complet en profondeur.
watch(() => doctorStore.currentDoctor, (newDoctor) => {
    if (newDoctor) {
        fillFormWithDoctorData(newDoctor)
    }
}, { immediate: true, deep: true })
</script>
<style scoped>
.modifier-medecin-wrapper {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

/* Header & Bouton Retour */
.form-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.btn-back {
  width: 45px;
  height: 45px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.btn-back:hover {
  background: #f1f5f9;
  transform: translateX(-4px);
}

.header-text h2 {
  margin: 0;
  color: #1e293b;
  font-size: 24px;
  font-weight: 800;
}

.subtitle { color: #64748b; margin: 0; font-size: 14px; }

/* Formulaire Design */
.medecin-form {
  display: grid;
  gap: 25px;
}

.form-section {
  border: 1px solid #f1f5f9;
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

.form-section legend {
  font-weight: 700;
  color: #3b82f6;
  padding: 0 15px;
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

input, select, textarea {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  transition: border-color 0.2s;
}

input:focus, select:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: #f8fafc;
}

/* Photo */
.photo-controls {
  display: flex;
  align-items: center;
  gap: 20px;
  background: #f8fafc;
  padding: 15px;
  border-radius: 12px;
}

.preview-img {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

/* Boutons */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 10px;
}

.submit-btn {
  background: #3b82f6;
  color: white;
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.3s;
}

.submit-btn:hover { background: #2563eb; transform: translateY(-2px); }

.cancel-btn {
  background: #f1f5f9;
  color: #475569;
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

/* Messages d'état */
.state-msg {
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-weight: 600;
}
.error { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }
.success { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }

/* =========================================
   RESPONSIVE
   ========================================= */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr; /* Une seule colonne sur mobile */
    gap: 15px;
  }

  .modifier-medecin-wrapper {
    padding: 10px;
  }

  .form-section {
    padding: 15px;
  }

  .form-actions {
    flex-direction: column; /* Boutons l'un sur l'autre */
  }

  .submit-btn, .cancel-btn {
    width: 100%;
  }

  .photo-controls {
    flex-direction: column;
    text-align: center;
  }
}
</style>