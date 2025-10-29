<template>
  <AdminLayout>
    <div class="form-container">
      <h2>Ajouter un Médecin Urgentiste</h2>

      <div v-if="urgentistStore.loading" class="loading-message">Création en cours...</div>
      <div v-if="urgentistStore.success" class="success-message">{{ urgentistStore.success }}</div>

      <div v-if="urgentistStore.error" class="error-message">
        {{ urgentistStore.error }}
        <ul v-if="urgentistStore.errorDetails">
          <li v-for="(errors, field) in urgentistStore.errorDetails" :key="field">
            <strong>{{ field }}:</strong>
            <ul>
              <li v-for="(error, i) in errors" :key="i">{{ error }}</li>
            </ul>
          </li>
        </ul>
      </div>

      <form @submit.prevent="submit">
        <fieldset>
          <legend>Infos générales</legend>
          <div class="row">
            <input v-model="form.first_name" placeholder="Prénom" />
            <div v-if="urgentistStore.errorDetails?.first_name" class="validation-error">
                <span v-for="err in urgentistStore.errorDetails.first_name" :key="err">{{ err }}</span>
            </div>
          </div>
          <div class="row">
            <input v-model="form.last_name" placeholder="Nom" />
            <div v-if="urgentistStore.errorDetails?.last_name" class="validation-error">
                <span v-for="err in urgentistStore.errorDetails.last_name" :key="err">{{ err }}</span>
            </div>
          </div>
          <div class="row">
            <input v-model="form.email" type="email" placeholder="Email" />
            <div v-if="urgentistStore.errorDetails?.email" class="validation-error">
                <span v-for="err in urgentistStore.errorDetails.email" :key="err">{{ err }}</span>
            </div>
          </div>
          <div class="row">
            <input v-model="form.password" type="password" placeholder="Mot de passe" />
            <div v-if="urgentistStore.errorDetails?.password" class="validation-error">
                <span v-for="err in urgentistStore.errorDetails.password" :key="err">{{ err }}</span>
            </div>
          </div>
          <div class="row">
            <input v-model="form.password_confirmation" type="password" placeholder="Confirmer le mot de passe" />
          </div>
          <div class="row">
            <input v-model="form.phone" placeholder="Téléphone" />
            <div v-if="urgentistStore.errorDetails?.phone" class="validation-error">
                <span v-for="err in urgentistStore.errorDetails.phone" :key="err">{{ err }}</span>
            </div>
          </div>
          <div class="row">
            <input v-model="form.city" placeholder="Ville" />
            <div v-if="urgentistStore.errorDetails?.city" class="validation-error">
                <span v-for="err in urgentistStore.errorDetails.city" :key="err">{{ err }}</span>
            </div>
          </div>
          <div class="row">
            <input v-model="form.country" placeholder="Pays" />
            <div v-if="urgentistStore.errorDetails?.country" class="validation-error">
                <span v-for="err in urgentistStore.errorDetails.country" :key="err">{{ err }}</span>
            </div>
          </div>
          <div class="row">
            <input v-model="form.birth_date" type="date" placeholder="Date de naissance" />
            <div v-if="urgentistStore.errorDetails?.birth_date" class="validation-error">
                <span v-for="err in urgentistStore.errorDetails.birth_date" :key="err">{{ err }}</span>
            </div>
          </div>
          <div class="row">
            <input v-model="form.address" placeholder="Adresse complète" />
            <div v-if="urgentistStore.errorDetails?.address" class="validation-error">
                <span v-for="err in urgentistStore.errorDetails.address" :key="err">{{ err }}</span>
            </div>
          </div>
          <div class="row">
            <select v-model="form.status">
              <option disabled value="">-- Sélectionner un statut --</option>
              <option value="available">Disponible</option>
              <option value="on_duty">En service</option>
              <option value="off_duty">Hors service</option>
              <option value="suspended">Suspendu</option>
            </select>
             <div v-if="urgentistStore.errorDetails?.status" class="validation-error">
                <span v-for="err in urgentistStore.errorDetails.status" :key="err">{{ err }}</span>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Infos médicales</legend>
          <div class="row">
            <input v-model="form.speciality" placeholder="Spécialité" />
            <div v-if="urgentistStore.errorDetails?.speciality" class="validation-error">
                <span v-for="err in urgentistStore.errorDetails.speciality" :key="err">{{ err }}</span>
            </div>
          </div>
          <div class="row">
            <input v-model="form.location" placeholder="Localisation" />
            <div v-if="urgentistStore.errorDetails?.location" class="validation-error">
                <span v-for="err in urgentistStore.errorDetails.location" :key="err">{{ err }}</span>
            </div>
          </div>
          <input type="file" @change="handlePhoto" />
          <div v-if="urgentistStore.errorDetails?.profile_photo" class="validation-error">
                <span v-for="err in urgentistStore.errorDetails.profile_photo" :key="err">{{ err }}</span>
            </div>
        </fieldset>

        <button class="submit" :disabled="urgentistStore.loading">Ajouter</button>
      </form>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue';
import { reactive, onMounted } from 'vue';
import { useUrgentistStore } from '@/stores/urgentistStore';

const urgentistStore = useUrgentistStore();

const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirmation: '',
  phone: '',
  city: '',
  country: '',
  birth_date: '',
  address: '',
  status: 'available', // Valeur par défaut
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
    // On peut ajouter une redirection après le succès si nécessaire
    // router.push({ name: 'NomDeLaRouteDeListe' });
  } catch (error) {
    console.error('Erreur création urgentiste:', error);
  }
};

onMounted(() => {
    // Nettoyer les messages d'erreur et de succès au montage du composant
    urgentistStore.resetFeedback();
});
</script>

<style scoped>
@import './FormStyle.css';

.error-message {
  color: #d9534f;
  margin-bottom: 12px;
}

.success-message {
  color: #5cb85c;
  margin-top: 10px;
}

.loading-message {
  color: #0040d0;
  font-style: italic;
  margin-top: 10px;
}

.row {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap; /* Permet le passage à la ligne sur les petits écrans */
}

input, select {
  flex: 1;
  min-width: 150px; /* Pour éviter que les champs ne soient trop petits */
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.validation-error {
  color: red;
  font-size: 0.8em;
  width: 100%;
  margin-top: -8px;
  margin-bottom: 8px;
}
</style>
