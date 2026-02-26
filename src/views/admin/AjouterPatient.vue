<template>
  <AdminLayout>
    <div class="form-container-wrapper">
      <header class="header-section">
        <button @click="router.back()" class="btn-back" title="Retour">
          <span class="arrow">←</span>
        </button>
        <div class="header-text">
          <h2>Ajouter un Nouveau Patient</h2>
          <p class="subtitle">Créez un profil complet avec dossier médical associé.</p>
        </div>
      </header>

      <div class="feedback-area">
        <div v-if="patientStore.loading" class="state-msg loading">
          <div class="mini-spinner"></div> Création du compte en cours...
        </div>
        <div v-if="patientStore.error" class="state-msg error">
          ⚠️ {{ patientStore.error }}
        </div>
        <div v-if="patientStore.success" class="state-msg success">
          ✅ {{ patientStore.success }}
        </div>
      </div>

      <form @submit.prevent="submit" class="add-patient-form">
        <div class="form-card">
          
          <fieldset class="form-section">
            <legend>Informations de Compte</legend>
            <div class="form-grid">
              <div class="field-group">
                <label>Prénom</label>
                <input v-model="form.first_name" placeholder="Ex: Jean" required />
              </div>
              <div class="field-group">
                <label>Nom</label>
                <input v-model="form.last_name" placeholder="Ex: Dupont" required />
              </div>
              <div class="field-group full-width">
                <label>Adresse Email</label>
                <input type="email" v-model="form.email" placeholder="patient@exemple.com" required />
              </div>
              <div class="field-group">
                <label>Mot de passe</label>
                <input type="password" v-model="form.password" placeholder="••••••••" required />
              </div>
              <div class="field-group">
                <label>Confirmation</label>
                <input type="password" v-model="form.password_confirmation" placeholder="••••••••" required />
              </div>
            </div>
          </fieldset>

          <fieldset class="form-section spacing-top">
            <legend>Coordonnées & État Civil</legend>
            <div class="form-grid">
              <div class="field-group">
                <label>Téléphone</label>
                <input v-model="form.phone" placeholder="+223..." />
              </div>
              <div class="field-group">
                <label>Date de naissance</label>
                <input type="date" v-model="form.birth_date" />
              </div>
              <div class="field-group">
                <label>Pays</label>
                <input v-model="form.country" placeholder="Mali" />
              </div>
              <div class="field-group">
                <label>Ville</label>
                <input v-model="form.city" placeholder="Bamako" />
              </div>
              <div class="field-group full-width">
                <label>Adresse</label>
                <input v-model="form.address" placeholder="Rue, Quartier, Porte..." />
              </div>
              <div class="field-group full-width">
                <label>Photo de profil</label>
                <div class="file-upload">
                  <input id="profile_photo" type="file" @change="handlePhoto" accept="image/*" class="hidden-input" />
                  <label for="profile_photo" class="file-label">
                    {{ form.profile_photo ? '📄 ' + form.profile_photo.name : '📸 Choisir une photo de profil' }}
                  </label>
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset class="form-section spacing-top">
            <legend>Dossier Médical Initial</legend>
            <div class="form-grid">
              <div class="field-group">
                <label>Hôpital</label>
                <select v-model="form.hospital_id" required>
                  <option :value="null" disabled>Sélectionner un établissement</option>
                  <option v-for="h in hospitals" :key="h.id" :value="h.id">{{ h.nom }}</option>
                </select>
              </div>
              <div class="field-group">
                <label>Médecin Référent</label>
                <select v-model="form.doctor_id" required>
                  <option :value="null" disabled>Sélectionner un médecin</option>
                  <option v-for="d in doctors" :key="d.id" :value="d.id">
                    Dr. {{ d.user?.last_name }} ({{ d.speciality || 'Généraliste' }})
                  </option>
                </select>
              </div>
              <div class="field-group">
                <label>Statut Santé</label>
                <select v-model="form.status" required>
                  <option value="actif">🟢 Actif</option>
                  <option value="en_traitement">🟡 En Traitement</option>
                  <option value="stable">🔵 Stable</option>
                  <option value="critique">🔴 Critique</option>
                </select>
              </div>
              <div class="field-group">
                <label>Groupe Sanguin</label>
                <input v-model="form.group_sanguine" placeholder="Ex: A+" />
              </div>
              <div class="field-group">
                <label>Poids (kg)</label>
                <input v-model="form.poids" type="number" step="0.1" />
              </div>
              <div class="field-group">
                <label>Taille (m)</label>
                <input v-model="form.taille" type="number" step="0.01" />
              </div>
              <div class="field-group full-width">
                <label>Antécédents / Maladies chroniques</label>
                <input v-model="form.maladies_chroniques" placeholder="Diabète, Hypertension..." />
              </div>
            </div>
          </fieldset>
        </div>

        <div class="form-actions">
          <button type="button" @click="router.back()" class="btn-cancel">Annuler</button>
          <button class="submit-button" type="submit" :disabled="patientStore.loading">
            <span v-if="patientStore.loading" class="mini-spinner-white"></span>
            {{ patientStore.loading ? 'Création...' : 'Créer le dossier patient' }}
          </button>
        </div>
      </form>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePatientStore } from '@/stores/patientStore'
import { useHospitalStore } from '@/stores/hospitalStore'
import { useDoctorStore } from '@/stores/doctorStore'

const router = useRouter()
const patientStore = usePatientStore()
const hospitalStore = useHospitalStore()
const doctorStore = useDoctorStore()

const form = reactive({
  first_name: '', last_name: '', email: '', password: '', password_confirmation: '',
  phone: '', birth_date: '', city: '', address: '', country: '', profile_photo: null,
  status: 'actif', last_consultation_date: '', genre: '', group_sanguine: '',
  telephone_urgence: '', numero_urgence: '', poids: '', taille: '',
  maladies_chroniques: '', assurance_maladie: '', hospital_id: null, doctor_id: null,
})

const hospitals = computed(() => hospitalStore.hospitals)
const doctors = computed(() => doctorStore.doctors)

const handlePhoto = (e) => { form.profile_photo = e.target.files[0] }

const submit = async () => {
  if (form.password !== form.password_confirmation) {
    alert("Les mots de passe ne correspondent pas.")
    return
  }
  
  const formData = new FormData()
  for (const key in form) {
    if (form[key] !== null && form[key] !== '') {
      formData.append(key, form[key])
    }
  }

  try {
    await patientStore.createPatient(formData)
    if (patientStore.success) {
      setTimeout(() => { router.push({ name: 'Patient' }) }, 1500)
    }
  } catch (error) {
    console.error("Erreur creation patient:", error);
  }
}

onMounted(() => {
  hospitalStore.fetchAllHospitals()
  doctorStore.fetchAllDoctors()
})
</script>

<style scoped>
.form-container-wrapper { max-width: 1000px; margin: 0 auto; padding: 30px; }

/* Header */
.header-section { display: flex; align-items: center; gap: 20px; margin-bottom: 25px; }
.btn-back { width: 42px; height: 42px; border-radius: 12px; border: 1px solid #e2e8f0; background: white; cursor: pointer; transition: 0.2s; color: #64748b; }
.btn-back:hover { background: #f1f5f9; transform: translateX(-3px); color: #0040d0; }
.header-text h2 { margin: 0; font-size: 24px; color: #1e293b; font-weight: 800; }
.subtitle { margin: 0; color: #64748b; font-size: 14px; }

/* Card Design */
.form-card { background: white; padding: 35px; border-radius: 20px; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.form-section { border: none; padding: 0; margin: 0; }
.form-section legend { font-weight: 800; color: #1e293b; font-size: 16px; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #f8fafc; width: 100%; }
.spacing-top { margin-top: 40px; }

.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.full-width { grid-column: span 2; }

.field-group { display: flex; flex-direction: column; gap: 8px; }
.field-group label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }

input, select { padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; background: #f8fafc; transition: 0.2s; font-size: 14px; }
input:focus, select:focus { border-color: #0040d0; background: white; outline: none; box-shadow: 0 0 0 4px rgba(0,64,208,0.05); }

/* File Upload custom */
.file-label { display: block; padding: 15px; background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; text-align: center; cursor: pointer; color: #475569; font-weight: 600; transition: 0.3s; }
.file-label:hover { background: #e2e8f0; border-color: #0040d0; color: #0040d0; }
.hidden-input { display: none; }

/* Actions */
.form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; }
.submit-button { background: #0040d0; color: white; border: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 10px; }
.submit-button:hover:not(:disabled) { background: #0035b0; transform: translateY(-2px); }
.btn-cancel { background: white; color: #64748b; border: 1px solid #e2e8f0; padding: 14px 28px; border-radius: 12px; cursor: pointer; font-weight: 600; }

/* Status messages */
.state-msg { padding: 12px 20px; border-radius: 10px; margin-bottom: 20px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
.loading { background: #eff6ff; color: #2563eb; }
.error { background: #fef2f2; color: #dc2626; }
.success { background: #f0fdf4; color: #16a34a; }

.mini-spinner-white { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } .full-width { grid-column: span 1; } }
</style>