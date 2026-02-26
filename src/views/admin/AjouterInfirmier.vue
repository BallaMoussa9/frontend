<template>
  <AdminLayout>
    <div class="ajouter-infirmier-wrapper">
      <header class="form-header">
        <button @click="$router.back()" class="btn-back" title="Retour">
          <span class="arrow">←</span>
        </button>
        <div class="header-text">
          <h2>Ajouter un Infirmier / Infirmière</h2>
          <p class="subtitle">Créez un nouveau compte pour le personnel soignant</p>
        </div>
      </header>

      <form @submit.prevent="submitForm" class="infirmier-form">
        <fieldset class="form-section">
          <legend>Informations générales</legend>
          
          <div class="form-row">
            <div class="field">
              <label>Prénom</label>
              <input v-model="form.first_name" type="text" placeholder="Ex: Mariam" required />
            </div>
            <div class="field">
              <label>Nom</label>
              <input v-model="form.last_name" type="text" placeholder="Ex: Keïta" required />
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Date de naissance</label>
              <input v-model="form.birth_date" type="date" required />
            </div>
            <div class="field">
              <label>Téléphone</label>
              <input v-model="form.phone" type="text" placeholder="+223 ..." required />
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Email professionnel</label>
              <input v-model="form.email" type="email" placeholder="email@clinique.com" required />
            </div>
            <div class="field">
              <label>Mot de passe</label>
              <input v-model="form.password" type="password" placeholder="********" required />
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Confirmer le mot de passe</label>
              <input v-model="form.password_confirmation" type="password" placeholder="********" required />
            </div>
            <div class="field">
              <label>Ville</label>
              <input v-model="form.city" type="text" placeholder="Ex: Bamako" required />
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Adresse complète</label>
              <input v-model="form.address" type="text" placeholder="Quartier, Rue, Porte" required />
            </div>
            <div class="field">
              <label>Département d'affectation</label>
              <select v-model="form.department_id" required>
                <option disabled value="">-- Sélectionner --</option>
                <option v-for="dep in departmentStore.allDepartments" :key="dep.id" :value="dep.id">
                  {{ dep.name }}
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
              <input type="file" accept="image/*" @change="handleFileUpload" />
            </div>
          </div>
        </fieldset>

        <div v-if="nurseStore.loading" class="state-msg info">🔄 Création en cours...</div>
        <div v-if="nurseStore.error" class="state-msg error">⚠️ {{ nurseStore.error }}</div>
        <div v-if="nurseStore.success" class="state-msg success">✅ {{ nurseStore.success }}</div>

        <div class="form-actions">
          <button type="button" @click="$router.back()" class="cancel-btn">Annuler</button>
          <button type="submit" class="submit-btn" :disabled="nurseStore.loading">
            Enregistrer l'infirmier
          </button>
        </div>
      </form>
    </div>
  </AdminLayout>
</template><script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { reactive, onMounted, ref } from 'vue'
import { useNurseStore } from '@/stores/nurseStore'
import { useDepartmentStore } from '@/stores/departmentStore'

const nurseStore = useNurseStore()
const departmentStore = useDepartmentStore()
const imagePreview = ref(null)

const form = reactive({
  first_name: '',
  last_name: '',
  birth_date: '',
  phone: '',
  country: 'Mali', // Valeur par défaut possible
  city: '',
  profile_photo: null,
  address: '',
  email: '',
  password: '',
  password_confirmation: '',
  department_id: ''
})

const handleFileUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    form.profile_photo = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

const submitForm = async () => {
  const formData = new FormData()
  Object.entries(form).forEach(([key, value]) => {
    if (value !== null && value !== '') {
      formData.append(key, value)
    }
  })

  try {
    await nurseStore.createNurse(formData)
    // Redirection après succès (optionnel, sinon on réinitialise)
    // router.push({ name: 'Nurse' })
  } catch (error) {
    console.error('Erreur lors de la soumission:', error)
  }
}

onMounted(() => {
  departmentStore.fetchDepartments()
})
</script>
<style scoped>
.ajouter-infirmier-wrapper {
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

.header-text h2 { margin: 0; color: #1e293b; font-size: 24px; font-weight: 800; }
.subtitle { color: #64748b; margin: 0; font-size: 14px; }

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
  color: #10b981; /* Couleur verte pour différencier les infirmiers */
  padding: 0 10px;
  font-size: 14px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 15px;
}

.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 13px; font-weight: 600; color: #475569; }

input, select {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
}

input:focus { border-color: #10b981; outline: none; }

/* Photo Preview */
.photo-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 10px;
  background: #f8fafc;
  padding: 10px;
  border-radius: 12px;
}

.preview-img {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  object-fit: cover;
  border: 2px solid #10b981;
}

/* Actions et Messages */
.form-actions { display: flex; justify-content: flex-end; gap: 15px; }

.submit-btn {
  background-color: #10b981;
  color: white;
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.cancel-btn {
  background: #f1f5f9;
  color: #475569;
  padding: 14px 28px;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.state-msg { padding: 15px; border-radius: 10px; margin-bottom: 15px; font-weight: 600; }
.error { background: #fef2f2; color: #dc2626; }
.success { background: #f0fdf4; color: #16a34a; }
.info { background: #f0f9ff; color: #0369a1; }

/* Responsive Mobile */
@media (max-width: 768px) {
  .form-row { grid-template-columns: 1fr; }
  .form-actions { flex-direction: column; }
  .submit-btn, .cancel-btn { width: 100%; }
}
</style>