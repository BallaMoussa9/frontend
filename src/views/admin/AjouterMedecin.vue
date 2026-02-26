<template>
  <AdminLayout>
    <div class="ajouter-medecin-wrapper">
      <header class="form-header">
        <button @click="$router.back()" class="btn-back" title="Retour">
          <span class="arrow">←</span>
        </button>
        <div class="header-text">
          <h2>Ajouter un Médecin</h2>
          <p class="subtitle">Enregistrez un nouveau praticien dans la plateforme</p>
        </div>
      </header>

      <form @submit.prevent="submitForm" class="medecin-form">
        <fieldset class="form-section">
          <legend>Informations générales</legend>
          
          <div class="form-row">
            <div class="field">
              <label>Prénom</label>
              <input v-model="form.first_name" type="text" placeholder="Prénom" required />
            </div>
            <div class="field">
              <label>Nom</label>
              <input v-model="form.last_name" type="text" placeholder="Nom" required />
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Date de naissance</label>
              <input v-model="form.birth_date" type="date" />
            </div>
            <div class="field">
              <label>Téléphone</label>
              <input v-model="form.phone" type="text" placeholder="Téléphone" />
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Email</label>
              <input v-model="form.email" type="email" placeholder="Adresse email" required />
            </div>
            <div class="field">
              <label>Mot de passe</label>
              <input v-model="form.password" type="password" placeholder="Mot de passe" required />
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Ville</label>
              <input v-model="form.city" type="text" placeholder="Ville" />
            </div>
            <div class="field">
              <label>Pays</label>
              <input v-model="form.country" type="text" placeholder="Pays" />
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Adresse</label>
              <input v-model="form.address" type="text" placeholder="Adresse complète" />
            </div>
            <div class="field">
              <label>Département</label>
              <select v-model="form.department_id">
                <option disabled value="">-- Choisir un département --</option>
                <option v-for="dept in departements" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="field photo-upload">
            <label>Photo de profil</label>
            <div class="photo-controls">
              <div v-if="imagePreview" class="preview-container">
                <img :src="imagePreview" alt="Aperçu" class="preview-img" />
              </div>
              <input type="file" @change="handleFileUpload" accept="image/*" />
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
              <input v-model="form.numero_ordre" type="text" placeholder="N° d'ordre" />
            </div>
          </div>
          <div class="form-row">
            <div class="field">
              <label>N° professionnel</label>
              <input v-model="form.numero_professionel" type="text" placeholder="N° professionnel" />
            </div>
            <div class="field">
              <label>Expérience (années)</label>
              <input v-model="form.experience" type="number" placeholder="0" />
            </div>
          </div>
          <div class="field">
            <label>Biographie</label>
            <textarea v-model="form.biography" placeholder="Courte biographie du médecin..."></textarea>
          </div>
        </fieldset>

        <div v-if="doctorStore.loading" class="state-msg info">Création en cours...</div>
        <div v-if="doctorStore.error" class="state-msg error">{{ doctorStore.error }}</div>
        <div v-if="doctorStore.success" class="state-msg success">{{ doctorStore.success }}</div>

        <div class="form-actions">
          <button type="submit" class="submit-btn" :disabled="doctorStore.loading">
            Ajouter le médecin
          </button>
        </div>
      </form>
    </div>
  </AdminLayout>
</template><script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { reactive, onMounted, computed, ref } from 'vue'
import { useDoctorStore } from '@/stores/doctorStore'
import { useDepartmentStore } from '@/stores/departmentStore'

const doctorStore = useDoctorStore()
const departmentStore = useDepartmentStore()
const imagePreview = ref(null) // Pour l'aperçu de l'image

const form = reactive({
  first_name: '',
  last_name: '',
  birth_date: '',
  phone: '',
  country: '',
  city: '',
  profile_photo: null,
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

const departements = computed(() => departmentStore.departments);

const handleFileUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    form.profile_photo = file
    imagePreview.value = URL.createObjectURL(file) // Crée un lien temporaire pour l'image
  }
}

const submitForm = async () => {
  const formData = new FormData()
  for (const key in form) {
    if (form[key] !== null && form[key] !== '') {
      formData.append(key, form[key])
    }
  }
  await doctorStore.createDoctor(formData)
}

onMounted(() => {
  departmentStore.fetchDepartments();
});
</script><style scoped>
.ajouter-medecin-wrapper {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

/* Header & Retour */
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
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #f1f5f9;
  transform: translateX(-4px);
}

.header-text h2 {
  margin: 0;
  color: #1e293b;
  font-size: 24px;
}

.subtitle { color: #64748b; font-size: 14px; margin: 0; }

/* Design des Sections */
.form-section {
  border: 1px solid #f1f5f9;
  background: white;
  padding: 25px;
  border-radius: 16px;
  margin-bottom: 25px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

.form-section legend {
  font-weight: 700;
  color: #3b82f6;
  padding: 0 10px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 2 colonnes par défaut */
  gap: 20px;
  margin-bottom: 15px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
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
}

/* Photo Preview */
.photo-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 10px;
}

.preview-img {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  object-fit: cover;
  border: 2px solid #3b82f6;
}

/* Boutons & Messages */
.form-actions {
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  background-color: #3b82f6;
  color: white;
  padding: 14px 30px;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.3s;
}

.submit-btn:hover { background-color: #2563eb; }

.state-msg { padding: 15px; border-radius: 10px; margin-bottom: 15px; }
.error { background: #fef2f2; color: #dc2626; }
.success { background: #f0fdf4; color: #16a34a; }

/* Responsive Mobile */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr; /* 1 seule colonne sur mobile */
  }
  
  .form-actions .submit-btn {
    width: 100%;
  }

  .form-header {
    flex-direction: row;
    align-items: center;
  }
}
</style>