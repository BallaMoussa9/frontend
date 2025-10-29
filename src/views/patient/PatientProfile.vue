<template>
  <SidebarLayout>
    <section class="profile-section">
      <h1>Mon Profil Médical</h1>

      <p v-if="patientStore.error" class="error-message">
        Erreur : {{ patientStore.error }}
      </p>
      <p v-if="patientStore.success" class="success-message">
        {{ patientStore.success }}
      </p>

      <div v-if="patientStore.isLoading" class="loading-state">
        Chargement des données du profil...
      </div>

      <div v-else-if="currentPatientData">

        <div class="profile-card">
          <h2>Informations personnelles</h2>
          <form @submit.prevent="updatePersonalInfo">

            <div class="form-group">
              <label for="first_name">Prénom</label>
              <input id="first_name" v-model="form.first_name" type="text" required />
            </div>
            <div class="form-group">
              <label for="last_name">Nom</label>
              <input id="last_name" v-model="form.last_name" type="text" required />
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input id="email" v-model="form.email" type="email" required />
            </div>
            <div class="form-group">
              <label for="phone">Téléphone</label>
              <input id="phone" v-model="form.phone" type="text" required />
            </div>

            <div class="form-group">
              <label for="birth_date">Date de naissance</label>
              <input id="birth_date" v-model="form.birth_date" type="date" required />
            </div>
            <div class="form-group">
              <label for="city">Ville</label>
              <input id="city" v-model="form.city" type="text" required />
            </div>
            <div class="form-group">
              <label for="address">Adresse</label>
              <input id="address" v-model="form.address" type="text" required />
            </div>
            <div class="form-group">
              <label for="country">Pays</label>
              <input id="country" v-model="form.country" type="text" required />
            </div>

            <div class="form-group">
              <label for="genre">Sexe</label>
              <select id="genre" v-model="form.genre">
                <option value="">Sélectionner</option>
                <option value="Masculin">Masculin</option>
                <option value="Féminin">Féminin</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div class="form-group">
              <label for="poids">Poids (kg)</label>
              <input id="poids" v-model="form.poids" type="number" min="1" />
            </div>
            <div class="form-group">
              <label for="taille">Taille (cm)</label>
              <input id="taille" v-model="form.taille" type="number" min="1" />
            </div>
            <div class="form-group">
              <label for="group_sanguine">Groupe sanguin</label>
              <input id="group_sanguine" v-model="form.group_sanguine" type="text" />
            </div>
            <div class="form-group">
              <label for="telephone_urgence">Téléphone d'urgence</label>
              <input id="telephone_urgence" v-model="form.telephone_urgence" type="text" />
            </div>

            <button type="submit" :disabled="patientStore.isLoading">
              {{ patientStore.isLoading ? 'Mise à jour...' : 'Mettre à jour les infos' }}
            </button>
          </form>
        </div>

        <div class="profile-card">
          <h2>Détails Médicaux & Assurance</h2>
          <form @submit.prevent="updateMedicalInfo">

            <div class="form-group">
              <label for="maladies_chroniques">Maladies chroniques</label>
              <textarea id="maladies_chroniques" v-model="form.maladies_chroniques" rows="3" />
            </div>

            <div class="form-group">
              <label for="allergies">Allergies</label>
              <textarea id="allergies" v-model="form.allergies" rows="3" />
            </div>

            <div class="form-group">
              <label for="assurance_maladie">Assurance Maladie</label>
              <input id="assurance_maladie" v-model="form.assurance_maladie" type="text" />
            </div>

            <button type="submit" :disabled="patientStore.isLoading">
              {{ patientStore.isLoading ? 'Sauvegarde...' : 'Sauvegarder les détails médicaux' }}
            </button>
          </form>
        </div>
      </div>

      <p v-else-if="!patientStore.isLoading && patientStore.error">
        Impossible de charger le profil du patient. Veuillez réessayer.
      </p>
      <p v-else-if="!patientStore.isLoading && !currentPatientData">
        Aucune donnée de patient disponible.
      </p>

    </section>
  </SidebarLayout>
</template>

<script setup>
import { reactive, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { usePatientStore } from '@/stores/patientStore';
import SidebarLayout from '@/layouts/SidebarLayout.vue';

const route = useRoute();
const patientStore = usePatientStore();

const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  birth_date: '',
  city: '',
  address: '',
  country: '',

  genre: '',
  group_sanguine: '',
  telephone_urgence: '',
  maladies_chroniques: '',
  assurance_maladie: '',
  poids: '',
  taille: '',
  allergies: '',
});

const currentPatientData = computed(() => patientStore.currentPatient);

const initializeForm = (data) => {
  if (!data) return;

  const user = data.user || {};

  form.first_name = user.first_name || data.first_name || '';
  form.last_name = user.last_name || data.last_name || '';
  form.email = user.email || data.email || '';
  form.phone = user.phone || data.phone || '';
  form.birth_date = user.birth_date || data.birth_date || '';
  form.city = user.city || data.city || '';
  form.address = user.address || data.address || '';
  form.country = user.country || data.country || '';

  form.genre = data.genre || '';
  form.group_sanguine = data.group_sanguine || '';
  form.telephone_urgence = data.telephone_urgence || '';
  form.maladies_chroniques = data.maladies_chroniques || '';
  form.assurance_maladie = data.assurance_maladie || '';
  form.poids = data.poids || '';
  form.taille = data.taille || '';
  form.allergies = data.allergies || '';
};

onMounted(() => {
  const patientId = route.params.id;
  if (patientId) {
    patientStore.onePatient(patientId);
  }
});

watch(currentPatientData, (newData) => {
  if (newData) {
    initializeForm(newData);
  }
}, { immediate: true });

async function updatePersonalInfo() {
  const patientId = route.params.id;
  if (!patientId) {
    patientStore.setError("ID Patient manquant.");
    return;
  }

  const dataToUpdate = {
    first_name: form.first_name,
    last_name: form.last_name,
    email: form.email,
    phone: form.phone,
    birth_date: form.birth_date,
    city: form.city,
    address: form.address,
    country: form.country,

    genre: form.genre,
    poids: form.poids,
    taille: form.taille,
    group_sanguine: form.group_sanguine,
    telephone_urgence: form.telephone_urgence,
  };

  await patientStore.updatePatient(patientId, dataToUpdate);
}

async function updateMedicalInfo() {
  const patientId = route.params.id;
  if (!patientId) {
    patientStore.setError("ID Patient manquant.");
    return;
  }

  const dataToUpdate = {
    maladies_chroniques: form.maladies_chroniques,
    allergies: form.allergies,
    assurance_maladie: form.assurance_maladie,
  };

  await patientStore.updatePatient(patientId, dataToUpdate);
}
</script>

<style scoped>
.profile-section {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

h1 {
  font-size: 28px;
  font-weight: bold;
  color: #002580;
}

.profile-card {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

h2 {
  margin-bottom: 16px;
  font-size: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

label {
  font-weight: bold;
  margin-bottom: 4px;
}

input,
select,
textarea {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  margin-top: 12px;
  padding: 10px 16px;
  background-color: #002580;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}

.error-message {
  color: #d32f2f;
  background-color: #ffebee;
  border: 1px solid #ef9a9a;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.success-message {
  color: #388e3c;
  background-color: #e8f5e9;
  border: 1px solid #a5d6a7;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.loading-state {
  text-align: center;
  padding: 20px;
  font-style: italic;
  color: #002580;
}
</style>
