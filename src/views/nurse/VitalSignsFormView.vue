<template>
  <NurseLayout>
    <div class="vital-form-container">
      <h2 class="section-title">Enregistrement des Signes Vitaux</h2>
      <p class="section-subtitle">Sélectionnez un patient et saisissez ses paramètres essentiels.</p>

      <div class="search-patient-section">
        <label for="patientSearch" class="input-label">Rechercher un Patient :</label>
        <div class="search-input-wrapper">
          <input
            type="text"
            id="patientSearch"
            v-model="searchQuery"
            placeholder="🔍 Nom, prénom ou ID du patient..."
            class="search-input styled-search-input"
            @input="handleSearchInput"
            :disabled="selectedPatient !== null"
          />
          <span v-if="patientStore.loading" class="loading-spinner"></span>
        </div>
        <p v-if="searchQuery.length > 0 && patientStore.getSearchResults.length === 0 && selectedPatient === null && !patientStore.loading"
           class="message info">Aucun patient trouvé correspondant à votre recherche.</p>


        <ul v-if="searchQuery.length > 0 && patientStore.getSearchResults.length > 0 && selectedPatient === null" class="search-results-list">
          <li
            v-for="patient in patientStore.getSearchResults"
            :key="patient.id ?? patient._id"
            @click="selectPatient(patient)"
            class="search-result-item"
          >
            <span class="patient-icon">👤</span>
            <div class="patient-info">
              <strong>{{ patient.user?.first_name }} {{ patient.user?.last_name }}</strong>
              <small>ID: {{ patient.id ?? patient._id }} | Email: {{ patient.user?.email }}</small>
            </div>
          </li>
        </ul>
      </div>

      <div v-if="selectedPatient" class="selected-patient-card">
        <h3>Patient sélectionné :</h3>
        <div class="patient-details">
          <span class="patient-icon-large">🩺</span>
          <p>
            <strong>{{ selectedPatient.user?.first_name }} {{ selectedPatient.user?.last_name }}</strong><br />
            <small>ID: {{ selectedPatient.id ?? selectedPatient._id }} | Email: {{ selectedPatient.user?.email }}</small>
          </p>
        </div>
        <button @click="resetSelection" class="btn-reset">
          <span class="icon">🔄</span> Changer de patient
        </button>
      </div>

      <hr v-if="selectedPatient" class="divider">

      <form v-if="selectedPatient" @submit.prevent="submitVitals" class="vitals-form">
        <div class="form-grid">
          <div class="form-group">
            <label for="temperature" class="input-label">Température (°C) <span class="required">*</span></label>
            <input id="temperature" type="number" step="0.1" v-model="form.temperature" class="form-input" placeholder="ex: 37.2" required />
          </div>

          <div class="form-group">
            <label for="systolic" class="input-label">Pression Systolique (mmHg) <span class="required">*</span></label>
            <input type="number" id="systolic" v-model="form.blood_pressure_systolic" class="form-input" placeholder="ex: 120" required />
          </div>
          <div class="form-group">
            <label for="diastolic" class="input-label">Pression Diastolique (mmHg) <span class="required">*</span></label>
            <input type="number" id="diastolic" v-model="form.blood_pressure_diastolic" class="form-input" placeholder="ex: 80" required />
          </div>

          <div class="form-group">
            <label for="heart_rate" class="input-label">Fréquence Cardiaque (bpm) <span class="required">*</span></label>
            <input id="heart_rate" type="number" v-model="form.heart_rate" class="form-input" placeholder="ex: 75" required />
          </div>

          <div class="form-group">
            <label for="respiratory_rate" class="input-label">Fréquence Respiratoire (rpm)</label>
            <input id="respiratory_rate" type="number" v-model="form.respiratory_rate" class="form-input" placeholder="ex: 16" />
          </div>

          <div class="form-group">
            <label for="oxygen_saturation" class="input-label">Saturation O₂ (%)</label>
            <input id="oxygen_saturation" type="number" step="0.1" v-model="form.oxygen_saturation" class="form-input" placeholder="ex: 98" />
          </div>

          <div class="form-group">
            <label for="weight" class="input-label">Poids (kg)</label>
            <input id="weight" type="number" step="0.1" v-model="form.weight" class="form-input" placeholder="ex: 70.5" />
          </div>

          <div class="form-group">
            <label for="height" class="input-label">Taille (m)</label>
            <input id="height" type="number" step="0.01" v-model="form.height" class="form-input" placeholder="ex: 1.75" />
          </div>

          <div class="form-group full-width">
            <label for="notes" class="input-label">Notes de l'infirmier(e)</label>
            <textarea id="notes" v-model="form.notes" rows="4" class="form-input" placeholder="Observations supplémentaires..."></textarea>
          </div>
        </div>

        <button type="submit" :disabled="nurseStore.loading" class="submit-btn">
          <span v-if="nurseStore.loading" class="loading-dots">Enregistrement en cours...</span>
          <span v-else><span class="icon">✅</span> Enregistrer les Signes Vitaux</span>
        </button>

        <p v-if="nurseStore.error" class="message error" v-html="nurseStore.error"></p>

        <p v-if="nurseStore.success" class="message success">{{ nurseStore.success }}</p>

      </form>

      <div v-else class="info-message-box">
        <p><span class="icon">👆</span> Veuillez rechercher et sélectionner un patient ci-dessus pour accéder au formulaire.</p>
      </div>

    </div>
  </NurseLayout>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import { usePatientStore } from "@/stores/patientStore";
import { useNurseStore } from "@/stores/nurseStore";
import { useAuthStore } from "@/stores/authStores";
import NurseLayout from "@/layouts/NurseLayout.vue";

const patientStore = usePatientStore();
const nurseStore = useNurseStore();
const authStore = useAuthStore();

const searchQuery = ref("");
const selectedPatient = ref(null);

// NOTE: Ne pas utiliser v-model.number dans le template si vous ne voulez pas de chaînes vides,
// car cela peut entraîner des bugs de conversion. Nous allons forcer le type dans submitVitals.
const form = ref({
  temperature: null,
  blood_pressure_systolic: null,
  blood_pressure_diastolic: null,
  heart_rate: null,
  respiratory_rate: null,
  oxygen_saturation: null,
  weight: null,
  height: null,
  notes: "",
});

let searchTimeout = null;

onMounted(() => {
  patientStore.clearFeedback();
  nurseStore.clearFeedback();
});


// --------------------------------------------------
// Logique de la recherche de patients
// --------------------------------------------------

const handleSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  const query = searchQuery.value.trim();

  if (selectedPatient.value !== null) {
      selectedPatient.value = null;
      nurseStore.clearFeedback();
  }

  if (query.length >= 2) {
    searchTimeout = setTimeout(async () => {
      if (searchQuery.value.trim().length >= 2) {
        await patientStore.searchPatients(query);
      }
    }, 400);
  } else {
    patientStore.searchResults = [];
  }
};

const selectPatient = (patient) => {
  selectedPatient.value = patient;

  const firstName = patient.user?.first_name || '';
  const lastName = patient.user?.last_name || '';

  searchQuery.value = `${firstName} ${lastName}`.trim();

  patientStore.searchResults = [];
};

const resetSelection = () => {
  selectedPatient.value = null;
  searchQuery.value = "";
  patientStore.searchResults = [];
  nurseStore.clearFeedback();
  // Réinitialiser le formulaire
  Object.keys(form.value).forEach(key => form.value[key] = null);
  form.value.notes = "";
};


// --------------------------------------------------
// Logique de soumission du formulaire
// --------------------------------------------------

const submitVitals = async () => {
  if (!selectedPatient.value) {
    nurseStore.setError("Veuillez sélectionner un patient avant d'enregistrer les signes vitaux.");
    return;
  }

  const nurseId = String(authStore.getProfileId);
  const patientId = String(selectedPatient.value.id || selectedPatient.value._id);

  if (!nurseId) {
    nurseStore.setError("Erreur : ID de l'infirmier(e) non trouvé. Veuillez vous reconnecter.");
    return;
  }

  nurseStore.clearFeedback();

  // --- DÉBUT : Préparation des données pour l'API (Assure le type de données correct) ---
  const dataToSend = {};

  for (const key in form.value) {
    let value = form.value[key];

    // Convertir les chaînes vides en null pour le traitement
    if (typeof value === 'string' && value.trim() === '') {
        value = null;
    }

    if (value !== null && value !== undefined && value !== "") {
        if (key === 'notes') {
             // Laisser les notes comme chaînes
             dataToSend[key] = value;
        } else if (['temperature', 'oxygen_saturation', 'weight', 'height'].includes(key)) {
            // Assurer que les décimaux sont bien parsés (nombre à virgule flottante)
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
                dataToSend[key] = numValue;
            }
        } else {
            // Assurer que les entiers sont bien parsés (nombre entier)
            const intValue = parseInt(value);
            if (!isNaN(intValue)) {
                dataToSend[key] = intValue;
            }
        }
    }
  }

  // Vérification des champs OBLIGATOIRES (Température, Pression, Rythme cardiaque)
  const requiredFields = [
    'temperature', 'blood_pressure_systolic', 'blood_pressure_diastolic', 'heart_rate'
  ];
  const missingRequired = requiredFields.filter(field => !(field in dataToSend));

  if (missingRequired.length > 0) {
     nurseStore.setError("Erreur : Les champs marqués d'une étoile (*) sont obligatoires. Veuillez saisir une valeur numérique.");
     return;
  }

  // Validation client pour la limite de température (pour mieux anticiper le 422 du serveur)
  if (dataToSend.temperature < 30 || dataToSend.temperature > 45) {
     nurseStore.setError("Erreur : La température doit être comprise entre 30 °C et 45 °C.");
     return;
  }

  dataToSend.patient_id = patientId;
  dataToSend.nurse_id = nurseId;
  dataToSend.recorded_at = new Date().toISOString();
  // --- FIN : Préparation des données pour l'API ---

  try {
    await nurseStore.recordVitalSigns(patientId, nurseId, dataToSend);
    resetSelection();
    nurseStore.setSuccess("Signes vitaux enregistrés avec succès !");
  } catch (error) {
    // Gestion des erreurs de validation spécifiques de Laravel (422)
    if (error.response && error.response.data && error.response.data.errors) {
      const laravelErrors = error.response.data.errors;
      let errorMessages = "Veuillez corriger les valeurs suivantes :<br>";

      // Construire une liste des erreurs de validation
      for (const field in laravelErrors) {
        // Amélioration de l'affichage du nom du champ
        const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        errorMessages += `• **${fieldName}**: ${laravelErrors[field].join(', ')}<br>`;
      }
      nurseStore.setError(errorMessages);
    } else {
      // Message générique si le serveur ne renvoie pas de message structuré (ex: 500 ou autre)
      nurseStore.setError("Une erreur inattendue est survenue lors de l'enregistrement. Veuillez réessayer.");
    }
  }
};
</script>

<style scoped>
/* ---------------------------------
   Base du conteneur et Titres
--------------------------------- */
.vital-form-container {
  max-width: 750px;
  margin: 30px auto;
  background: #ffffff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  font-family: 'Inter', sans-serif;
}

.section-title {
  font-size: 2rem;
  font-weight: 800;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 10px;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  text-align: center;
  margin-bottom: 30px;
}

/* ---------------------------------
   Labels et Inputs de Formulaire
--------------------------------- */
.input-label {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  color: #34495e;
  margin-bottom: 8px;
}

.required {
    color: #e74c3c;
    font-weight: 700;
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  font-size: 1rem;
  color: #333;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-input::placeholder {
  color: #b0b8c4;
}

.form-input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  outline: none;
}

textarea.form-input {
  resize: vertical;
  min-height: 100px;
}

/* ---------------------------------
   Section de Recherche Patient
--------------------------------- */
.search-patient-section {
  margin-bottom: 25px;
  position: relative;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

/* 🔑 MISE À JOUR DU STYLE DE L'INPUT DE RECHERCHE */
.styled-search-input {
    /* Retrait du padding-right pour la loupe si elle est déjà dans le placeholder */
    padding-left: 15px;
    transition: all 0.3s ease;
}

.styled-search-input:focus {
    border-color: #004080;
    box-shadow: 0 0 0 4px rgba(0, 64, 128, 0.15); /* Ombre plus visible */
}

.loading-spinner {
  position: absolute;
  right: 15px;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.search-results-list {
  list-style: none;
  padding: 0;
  margin-top: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fdfdfd;
  max-height: 250px;
  overflow-y: auto;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  position: absolute;
  width: 100%;
  z-index: 1000;
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f4f4f4;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background-color: #e6f7ff;
}

.patient-icon {
  font-size: 1.2rem;
  color: #007bff;
  margin-right: 10px;
}

.patient-info {
  flex-grow: 1;
}

.patient-info strong {
  display: block;
  color: #34495e;
  font-size: 1.05rem;
}

.patient-info small {
  color: #888;
  font-size: 0.85rem;
}

/* ---------------------------------
   Patient Sélectionné
--------------------------------- */
.selected-patient-card {
  background-color: #e9f5ff;
  border: 1px solid #b3e0ff;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.selected-patient-card h3 {
  font-size: 1.3rem;
  color: #0056b3;
  margin-bottom: 15px;
}

.patient-details {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.patient-icon-large {
  font-size: 2.5rem;
  color: #007bff;
  margin-right: 15px;
}

.patient-details p {
  margin: 0;
  line-height: 1.4;
}

.patient-details strong {
  font-size: 1.2rem;
  color: #2c3e50;
}

.patient-details small {
  font-size: 0.9rem;
  color: #666;
}

.btn-reset {
  background-color: #6c757d;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-reset:hover {
  background-color: #5a6268;
}

/* ---------------------------------
   Formulaire des Signes Vitaux
--------------------------------- */
.vitals-form {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 25px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.submit-btn {
  width: 100%;
  padding: 15px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 700;
  transition: background-color 0.3s ease, opacity 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.submit-btn:hover:not(:disabled) {
  background-color: #218838;
}

.submit-btn:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
  opacity: 0.7;
}

.loading-dots::after {
  content: ' .';
  animation: dots 1s steps(5, end) infinite;
}

@keyframes dots {
  0%, 20% {
    color: rgba(0,0,0,0);
    text-shadow:
      .25em 0 0 rgba(0,0,0,0),
      .5em 0 0 rgba(0,0,0,0);
  }
  40% {
    color: white;
    text-shadow:
      .25em 0 0 rgba(0,0,0,0),
      .5em 0 0 rgba(0,0,0,0);
  }
  60% {
    text-shadow:
      .25em 0 0 white,
      .5em 0 0 rgba(0,0,0,0);
  }
  80%, 100% {
    text-shadow:
      .25em 0 0 white,
      .5em 0 0 white;
  }
}

/* ---------------------------------
   Messages de Feedback & Infos
--------------------------------- */
.message {
  padding: 10px 15px;
  border-radius: 6px;
  margin-top: 15px;
  font-size: 0.95rem;
  line-height: 1.4;
}

.message.error {
  background-color: #fcebeb;
  color: #dc3545;
  border: 1px solid #f5c6cb;
}

.message.success {
  background-color: #e6f7ed;
  color: #28a745;
  border: 1px solid #c3e6cb;
}

.message.info {
  background-color: #e0f2f7;
  color: #007bff;
  border: 1px solid #a7d9f0;
}

.info-message-box {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
  padding: 15px;
  border-radius: 10px;
  text-align: center;
  font-size: 1.1rem;
  margin-top: 25px;
}
.info-message-box .icon {
  font-size: 1.4em;
  vertical-align: middle;
  margin-right: 8px;
}

.icon {
  vertical-align: middle;
}

.divider {
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 35px 0;
}
</style>
