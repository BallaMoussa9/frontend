<template>
  <AdminLayout>
    <div class="form-container-wrapper">
      <header class="header-section">
        <button @click="router.back()" class="btn-back" title="Retour">
          <span class="arrow">←</span>
        </button>
        <div class="header-text">
          <h2>Ajouter un Médecin Urgentiste</h2>
          <p class="subtitle">Créez un compte utilisateur et un profil médical pour un nouveau praticien.</p>
        </div>
      </header>

      <div class="feedback-area">
        <div v-if="urgentistStore.loading" class="state-msg loading">
          <div class="mini-spinner"></div> Création du profil en cours...
        </div>
        <div v-if="urgentistStore.success" class="state-msg success">
          ✅ {{ urgentistStore.success }}
        </div>
        <div v-if="urgentistStore.error && !urgentistStore.errorDetails" class="state-msg error">
          ⚠️ {{ urgentistStore.error }}
        </div>
      </div>

      <form @submit.prevent="submit" class="add-urgentist-form">
        <div class="form-card">
          <fieldset class="form-section">
            <legend>Compte & Informations Personnelles</legend>
            <div class="form-grid">
              <div class="field-group">
                <label>Prénom</label>
                <input v-model="form.first_name" type="text" placeholder="Prénom" :class="{ 'input-error': urgentistStore.errorDetails?.first_name }" />
                <span v-if="urgentistStore.errorDetails?.first_name" class="error-text">{{ urgentistStore.errorDetails.first_name[0] }}</span>
              </div>
              <div class="field-group">
                <label>Nom</label>
                <input v-model="form.last_name" type="text" placeholder="Nom" :class="{ 'input-error': urgentistStore.errorDetails?.last_name }" />
                <span v-if="urgentistStore.errorDetails?.last_name" class="error-text">{{ urgentistStore.errorDetails.last_name[0] }}</span>
              </div>
              <div class="field-group">
                <label>Email</label>
                <input v-model="form.email" type="email" placeholder="email@exemple.com" :class="{ 'input-error': urgentistStore.errorDetails?.email }" />
                <span v-if="urgentistStore.errorDetails?.email" class="error-text">{{ urgentistStore.errorDetails.email[0] }}</span>
              </div>
              <div class="field-group">
                <label>Téléphone</label>
                <input v-model="form.phone" type="text" placeholder="Ex: +223..." :class="{ 'input-error': urgentistStore.errorDetails?.phone }" />
                <span v-if="urgentistStore.errorDetails?.phone" class="error-text">{{ urgentistStore.errorDetails.phone[0] }}</span>
              </div>
              <div class="field-group">
                <label>Mot de passe</label>
                <input v-model="form.password" type="password" placeholder="••••••••" :class="{ 'input-error': urgentistStore.errorDetails?.password }" />
                <span v-if="urgentistStore.errorDetails?.password" class="error-text">{{ urgentistStore.errorDetails.password[0] }}</span>
              </div>
              <div class="field-group">
                <label>Confirmer le mot de passe</label>
                <input v-model="form.password_confirmation" type="password" placeholder="••••••••" />
              </div>
            </div>

            <div class="form-grid spacing-top-sm">
               <div class="field-group">
                <label>Date de naissance</label>
                <input v-model="form.birth_date" type="date" />
              </div>
              <div class="field-group">
                <label>Ville</label>
                <input v-model="form.city" type="text" placeholder="Ville" />
              </div>
              <div class="field-group full-width">
                <label>Adresse complète</label>
                <input v-model="form.address" type="text" placeholder="Rue, Quartier, Porte..." />
              </div>
            </div>
          </fieldset>

          <fieldset class="form-section spacing-top">
            <legend>Profil Médical & Disponibilité</legend>
            <div class="form-grid">
              <div class="field-group">
                <label>Spécialité</label>
                <input v-model="form.speciality" type="text" placeholder="Ex: Réanimation, Traumatologie" />
                <span v-if="urgentistStore.errorDetails?.speciality" class="error-text">{{ urgentistStore.errorDetails.speciality[0] }}</span>
              </div>
              <div class="field-group">
                <label>Localisation</label>
                <input v-model="form.location" type="text" placeholder="Ex: Pavillon A, Urgences" />
              </div>
              <div class="field-group">
                <label>Statut initial</label>
                <select v-model="form.status">
                  <option value="available">🟢 Disponible</option>
                  <option value="on_duty">🟡 En service</option>
                  <option value="off_duty">⚪ Hors service</option>
                </select>
              </div>
              <div class="field-group">
                <label>Photo de profil</label>
                <div class="file-upload">
                  <input type="file" @change="handlePhoto" id="photo-add" accept="image/*" />
                  <label for="photo-add" class="file-label">
                    {{ form.profile_photo ? 'Photo sélectionnée' : 'Choisir une image' }}
                  </label>
                </div>
                <span v-if="urgentistStore.errorDetails?.profile_photo" class="error-text">{{ urgentistStore.errorDetails.profile_photo[0] }}</span>
              </div>
            </div>
          </fieldset>
        </div>

        <div class="form-actions">
          <button type="button" @click="router.back()" class="btn-cancel">Annuler</button>
          <button type="submit" class="submit" :disabled="urgentistStore.loading">
            <span v-if="urgentistStore.loading" class="mini-spinner-white"></span>
            {{ urgentistStore.loading ? 'Création...' : 'Créer le profil' }}
          </button>
        </div>
      </form>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue';
import { reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUrgentistStore } from '@/stores/urgentistStore';

const router = useRouter();
const urgentistStore = useUrgentistStore();

const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirmation: '',
  phone: '',
  city: '',
  country: 'Mali', // Valeur par défaut
  birth_date: '',
  address: '',
  status: 'available',
  profile_photo: null,
  speciality: '',
  location: '',
});

const handlePhoto = (e) => {
  const file = e.target.files[0];
  if (file) form.profile_photo = file;
};

const submit = async () => {
  const data = new FormData();
  for (const key in form) {
    if (form[key] !== null && form[key] !== '') {
      data.append(key, form[key]);
    }
  }

  try {
    await urgentistStore.createUrgentist(data);
    if (!urgentistStore.error) {
      alert('Médecin urgentiste créé avec succès !');
      router.push({ name: 'Urgence' });
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
};

onMounted(() => {
    urgentistStore.resetFeedback();
});
</script>

<style scoped>
@import './FormStyle.css';

.form-container-wrapper { max-width: 900px; margin: 0 auto; padding: 30px; }

/* Header */
.header-section { display: flex; align-items: center; gap: 20px; margin-bottom: 25px; }
.btn-back {
  width: 42px; height: 42px; border-radius: 12px; border: 1px solid #e2e8f0;
  background: white; cursor: pointer; transition: 0.2s; color: #64748b;
}
.btn-back:hover { background: #f1f5f9; transform: translateX(-3px); color: #0040d0; }
.header-text h2 { margin: 0; font-size: 24px; color: #1e293b; font-weight: 800; }
.subtitle { margin: 0; color: #64748b; font-size: 14px; }

/* Feedback */
.state-msg { padding: 12px 20px; border-radius: 10px; margin-bottom: 20px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
.loading { background: #eff6ff; color: #2563eb; }
.success { background: #f0fdf4; color: #16a34a; }
.error { background: #fef2f2; color: #dc2626; }

/* Form Card */
.form-card {
  background: white; padding: 35px; border-radius: 20px;
  border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

.form-section { border: none; padding: 0; margin: 0; }
.form-section legend { 
  font-weight: 800; color: #1e293b; font-size: 16px; margin-bottom: 20px; 
  padding-bottom: 10px; border-bottom: 2px solid #f8fafc; width: 100%; 
}
.spacing-top { margin-top: 40px; }
.spacing-top-sm { margin-top: 20px; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.full-width { grid-column: span 2; }

.field-group { display: flex; flex-direction: column; gap: 8px; }
.field-group label { font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; }

input, select {
  padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px;
  background: #f8fafc; transition: 0.2s; font-size: 14px;
}
input:focus, select:focus { border-color: #0040d0; background: white; outline: none; box-shadow: 0 0 0 4px rgba(0,64,208,0.05); }

.input-error { border-color: #dc2626 !important; background: #fff1f2 !important; }
.error-text { color: #dc2626; font-size: 12px; font-weight: 600; }

/* File Upload */
.file-label {
  display: block; padding: 12px; background: #f1f5f9; border: 1px dashed #cbd5e1;
  border-radius: 10px; text-align: center; cursor: pointer; color: #64748b; font-weight: 600;
}
#photo-add { display: none; }

/* Actions */
.form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; }
.submit {
  background: #0040d0; color: white; border: none; padding: 12px 25px;
  border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s;
  display: flex; align-items: center; gap: 10px;
}
.submit:hover:not(:disabled) { background: #0035b0; transform: translateY(-2px); }
.submit:disabled { background: #94a3b8; cursor: not-allowed; }
.btn-cancel { background: white; color: #64748b; border: 1px solid #e2e8f0; padding: 12px 25px; border-radius: 10px; cursor: pointer; font-weight: 600; }

.mini-spinner { width: 16px; height: 16px; border: 2px solid #2563eb; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; }
.mini-spinner-white { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>