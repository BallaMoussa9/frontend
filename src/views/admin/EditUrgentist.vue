<template>
  <AdminLayout>
    <div class="form-container-wrapper">
      <header class="header-section">
        <button @click="router.back()" class="btn-back" title="Retour">
          <span class="arrow">←</span>
        </button>
        <div class="header-text">
          <h2>Modifier le Médecin Urgentiste</h2>
          <p class="subtitle" v-if="urgentistStore.currentUrgentist">
            Édition du profil de Dr. {{ urgentistStore.currentUrgentist.user?.first_name }} {{ urgentistStore.currentUrgentist.user?.last_name }}
          </p>
        </div>
      </header>

      <div class="feedback-area">
        <div v-if="urgentistStore.loading" class="state-msg loading">
          <div class="mini-spinner"></div> Chargement des données...
        </div>
        <div v-if="urgentistStore.error && typeof urgentistStore.error === 'string'" class="state-msg error">
          ⚠️ {{ urgentistStore.error }}
        </div>
        <div v-if="urgentistStore.success" class="state-msg success">
          ✅ {{ urgentistStore.success }}
        </div>
      </div>

      <form 
        @submit.prevent="submit" 
        v-if="!urgentistStore.loading && urgentistStore.currentUrgentist"
        class="edit-urgentist-form"
      >
        <div class="form-card">
          <fieldset class="form-section">
            <legend>Informations Personnelles</legend>
            <div class="form-grid">
              <div class="field-group">
                <label>Prénom</label>
                <input v-model="form.first_name" type="text" placeholder="Prénom" />
                <span v-if="errors.first_name" class="error-text">{{ errors.first_name[0] }}</span>
              </div>
              <div class="field-group">
                <label>Nom</label>
                <input v-model="form.last_name" type="text" placeholder="Nom" />
                <span v-if="errors.last_name" class="error-text">{{ errors.last_name[0] }}</span>
              </div>
              <div class="field-group">
                <label>Email professionnel</label>
                <input v-model="form.email" type="email" placeholder="email@exemple.com" />
                <span v-if="errors.email" class="error-text">{{ errors.email[0] }}</span>
              </div>
              <div class="field-group">
                <label>Téléphone</label>
                <input v-model="form.phone" type="text" placeholder="Numéro de téléphone" />
                <span v-if="errors.phone" class="error-text">{{ errors.phone[0] }}</span>
              </div>
              <div class="field-group">
                <label>Ville</label>
                <input v-model="form.city" type="text" placeholder="Ville" />
              </div>
              <div class="field-group">
                <label>Pays</label>
                <input v-model="form.country" type="text" placeholder="Pays" />
              </div>
            </div>
          </fieldset>

          <fieldset class="form-section spacing-top">
            <legend>Informations Professionnelles</legend>
            <div class="form-grid">
              <div class="field-group">
                <label>Spécialité</label>
                <input v-model="form.speciality" type="text" placeholder="Ex: Traumatologie" />
                <span v-if="errors.speciality" class="error-text">{{ errors.speciality[0] }}</span>
              </div>
              <div class="field-group">
                <label>Localisation (Service/Bloc)</label>
                <input v-model="form.location" type="text" placeholder="Ex: Aile Nord, Box 4" />
              </div>
              <div class="field-group">
                <label>Statut de disponibilité</label>
                <select v-model="form.status">
                  <option value="available">🟢 Disponible</option>
                  <option value="on_duty">🟡 En service</option>
                  <option value="off_duty">⚪ Hors service</option>
                  <option value="suspended">🔴 Suspendu</option>
                </select>
                <span v-if="errors.status" class="error-text">{{ errors.status[0] }}</span>
              </div>
              <div class="field-group">
                <label>Photo de profil (Optionnel)</label>
                <div class="file-upload">
                  <input type="file" @change="handlePhoto" id="photo-upload" accept="image/*" />
                  <label for="photo-upload" class="file-label">
                    {{ form.profile_photo ? 'Fichier sélectionné' : 'Changer la photo' }}
                  </label>
                </div>
              </div>
            </div>
          </fieldset>
        </div>

        <div class="form-actions">
          <button type="button" @click="router.back()" class="btn-cancel">Annuler</button>
          <button type="submit" class="submit" :disabled="urgentistStore.loading">
            <span v-if="urgentistStore.loading" class="mini-spinner-white"></span>
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { reactive, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUrgentistStore } from '@/stores/urgentistStore'

const route = useRoute()
const router = useRouter()
const urgentistStore = useUrgentistStore()

const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  city: '',
  country: '',
  profile_photo: null,
  speciality: '',
  location: '',
  status: 'available'
})

const errors = ref({})

const handlePhoto = (e) => {
  form.profile_photo = e.target.files[0]
}

const submit = async () => {
  errors.value = {}
  const data = new FormData()
  
  Object.keys(form).forEach(k => {
    if (form[k] !== null && form[k] !== '') {
      data.append(k, form[k])
    }
  })
  // Pour Laravel/Symfony, on simule un PUT via POST avec _method
  data.append('_method', 'PUT')

  try {
    await urgentistStore.updateUrgentist(route.params.id, data)

    if (urgentistStore.error && typeof urgentistStore.error === 'object') {
      errors.value = urgentistStore.error.errors || {}
    } else if (!urgentistStore.error) {
      alert('Profil mis à jour avec succès !')
      router.push({ name: 'Urgence' })
    }
  } catch (error) {
    if (error.errors) errors.value = error.errors;
  }
}

onMounted(() => {
  urgentistStore.fetchUrgentist(route.params.id) 
})

watch(() => urgentistStore.currentUrgentist, (newUrgentist) => {
  if (newUrgentist && newUrgentist.user) {
    Object.assign(form, {
      first_name: newUrgentist.user.first_name ?? '',
      last_name: newUrgentist.user.last_name ?? '',
      email: newUrgentist.user.email ?? '',
      phone: newUrgentist.user.phone ?? '',
      city: newUrgentist.user.city ?? '',
      country: newUrgentist.user.country ?? '',
      speciality: newUrgentist.speciality ?? '',
      location: newUrgentist.location ?? '',
      status: newUrgentist.status ?? 'available',
    })
  }
}, { immediate: true })
</script>

<style scoped>
@import './FormStyle.css';

.form-container-wrapper { max-width: 900px; margin: 0 auto; padding: 30px; }

/* Header & Retour */
.header-section { display: flex; align-items: center; gap: 20px; margin-bottom: 25px; }
.btn-back {
  width: 42px; height: 42px; border-radius: 12px; border: 1px solid #e2e8f0;
  background: white; cursor: pointer; transition: 0.2s; color: #64748b;
}
.btn-back:hover { background: #f1f5f9; transform: translateX(-3px); color: #0040d0; }
.header-text h2 { margin: 0; font-size: 24px; color: #1e293b; font-weight: 800; }
.subtitle { margin: 0; color: #64748b; font-size: 14px; }

/* Feedback Messages */
.state-msg { padding: 12px 20px; border-radius: 10px; margin-bottom: 20px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
.loading { background: #eff6ff; color: #2563eb; }
.error { background: #fef2f2; color: #dc2626; }
.success { background: #f0fdf4; color: #16a34a; }

/* Form Card */
.form-card {
  background: white; padding: 35px; border-radius: 20px;
  border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

.form-section { border: none; padding: 0; margin: 0; }
.form-section legend { font-weight: 800; color: #1e293b; font-size: 16px; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #f8fafc; width: 100%; }
.spacing-top { margin-top: 40px; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

.field-group { display: flex; flex-direction: column; gap: 8px; }
.field-group label { font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; }

input, select {
  padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px;
  background: #f8fafc; transition: 0.2s; font-size: 14px;
}
input:focus, select:focus { border-color: #0040d0; background: white; outline: none; box-shadow: 0 0 0 4px rgba(0,64,208,0.05); }

.error-text { color: #dc2626; font-size: 12px; font-weight: 600; margin-top: 4px; }

/* File Upload */
.file-upload { position: relative; }
#photo-upload { opacity: 0; position: absolute; z-index: -1; }
.file-label {
  display: block; padding: 12px; background: #f1f5f9; border: 1px dashed #cbd5e1;
  border-radius: 10px; text-align: center; cursor: pointer; color: #64748b; font-weight: 600;
}

/* Actions */
.form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; }
.submit {
  background: #0040d0; color: white; border: none; padding: 12px 25px;
  border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s;
  display: flex; align-items: center; gap: 10px;
}
.submit:hover { background: #0035b0; transform: translateY(-2px); }
.btn-cancel { background: white; color: #64748b; border: 1px solid #e2e8f0; padding: 12px 25px; border-radius: 10px; cursor: pointer; font-weight: 600; }

.mini-spinner { width: 16px; height: 16px; border: 2px solid #2563eb; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; }
.mini-spinner-white { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>