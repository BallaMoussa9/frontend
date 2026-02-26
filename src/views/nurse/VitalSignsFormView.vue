<template>
  <NurseLayout>
    <div class="vital-form-container">
      <header class="form-header">
        <h2 class="section-title">Enregistrement des Signes Vitaux</h2>
        <p class="section-subtitle">Sélectionnez un patient et saisissez ses paramètres essentiels.</p>
      </header>

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
        <div class="patient-details">
          <div class="patient-icon-large">🩺</div>
          <div class="patient-meta">
            <h3>{{ selectedPatient.user?.first_name }} {{ selectedPatient.user?.last_name }}</h3>
            <p>ID: {{ selectedPatient.id ?? selectedPatient._id }} • {{ selectedPatient.user?.email }}</p>
          </div>
        </div>
        <button @click="resetSelection" class="btn-reset">
          <span class="icon">🔄</span> Changer
        </button>
      </div>

      <div v-if="selectedPatient" class="form-wrapper">
        <form @submit.prevent="submitVitals" class="vitals-form">
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
              <textarea id="notes" v-model="form.notes" rows="3" class="form-input" placeholder="Observations cliniques..."></textarea>
            </div>
          </div>

          <button type="submit" :disabled="nurseStore.loading" class="submit-btn">
            <span v-if="nurseStore.loading" class="loading-dots">Enregistrement...</span>
            <span v-else>✅ Enregistrer les Signes Vitaux</span>
          </button>

          <div v-if="nurseStore.error" class="message error" v-html="nurseStore.error"></div>
          <div v-if="nurseStore.success" class="message success">{{ nurseStore.success }}</div>
        </form>
      </div>

      <div v-else class="info-message-box">
        <p><span class="icon">👆</span> Veuillez sélectionner un patient pour commencer la saisie.</p>
      </div>
    </div>
  </NurseLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { usePatientStore } from "@/stores/patientStore";
import { useNurseStore } from "@/stores/nurseStore";
import { useAuthStore } from "@/stores/authStores";
import NurseLayout from "@/layouts/NurseLayout.vue";

const patientStore = usePatientStore();
const nurseStore = useNurseStore();
const authStore = useAuthStore();

const searchQuery = ref("");
const selectedPatient = ref(null);

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

// --- RECHERCHE PATIENT ---
const handleSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  const query = searchQuery.value.trim();

  if (selectedPatient.value !== null) {
    selectedPatient.value = null;
    nurseStore.clearFeedback();
  }

  if (query.length >= 2) {
    searchTimeout = setTimeout(async () => {
      await patientStore.searchPatients(query);
    }, 400);
  } else {
    patientStore.searchResults = [];
  }
};

const selectPatient = (patient) => {
  selectedPatient.value = patient;
  searchQuery.value = `${patient.user?.first_name} ${patient.user?.last_name}`;
  patientStore.searchResults = [];
};

const resetSelection = () => {
  selectedPatient.value = null;
  searchQuery.value = "";
  Object.keys(form.value).forEach(key => form.value[key] = (key === 'notes' ? "" : null));
  nurseStore.clearFeedback();
};

// --- SOUMISSION & VALIDATION ---
const submitVitals = async () => {
  if (!selectedPatient.value) return;

  const nurseId = String(authStore.getProfileId);
  const patientId = String(selectedPatient.value.id || selectedPatient.value._id);
  
  nurseStore.clearFeedback();

  // Préparation des données avec validation des types et limites
  const dataToSend = {
    patient_id: patientId,
    nurse_id: nurseId,
    recorded_at: new Date().toISOString(),
    notes: form.value.notes?.trim() || null
  };

  const numericFields = [
    { key: 'temperature', type: 'float', label: 'Température', min: 30, max: 45 },
    { key: 'blood_pressure_systolic', type: 'int', label: 'Pression Systolique', min: 40, max: 250 },
    { key: 'blood_pressure_diastolic', type: 'int', label: 'Pression Diastolique', min: 30, max: 150 },
    { key: 'heart_rate', type: 'int', label: 'Fréquence Cardiaque', min: 30, max: 220 },
    { key: 'respiratory_rate', type: 'int', label: 'Fréquence Respiratoire', min: 5, max: 60 },
    { key: 'oxygen_saturation', type: 'float', label: 'Saturation O₂', min: 50, max: 100 },
    { key: 'weight', type: 'float', label: 'Poids', min: 1, max: 500 },
    { key: 'height', type: 'float', label: 'Taille', min: 0.4, max: 2.5 }
  ];

  for (const field of numericFields) {
    const val = form.value[field.key];
    if (val !== null && val !== "") {
      const parsedVal = field.type === 'float' ? parseFloat(val) : parseInt(val);
      if (isNaN(parsedVal)) {
        nurseStore.setError(`Le champ ${field.label} doit être un nombre.`);
        return;
      }
      if (parsedVal < field.min || parsedVal > field.max) {
        nurseStore.setError(`${field.label} hors limites (${field.min}-${field.max}).`);
        return;
      }
      dataToSend[field.key] = parsedVal;
    }
  }

  // Vérification champs obligatoires
  const required = ['temperature', 'blood_pressure_systolic', 'blood_pressure_diastolic', 'heart_rate'];
  for (const key of required) {
    if (dataToSend[key] === undefined || dataToSend[key] === null) {
      nurseStore.setError(`Les champs avec * sont obligatoires.`);
      return;
    }
  }

  try {
    await nurseStore.recordVitalSigns(patientId, nurseId, dataToSend);
    resetSelection();
    nurseStore.setSuccess("Signes vitaux enregistrés !");
  } catch (error) {
    if (error.response?.status === 422) {
      const errs = error.response.data.errors;
      nurseStore.setError("Données invalides : " + Object.values(errs).flat().join(', '));
    } else {
      nurseStore.setError("Erreur serveur lors de l'enregistrement.");
    }
  }
};
</script>

<style scoped>
.vital-form-container {
  max-width: 800px;
  margin: 2rem auto;
  background: #ffffff;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1e293b;
  text-align: center;
  margin-bottom: 8px;
}

.section-subtitle {
  color: #64748b;
  text-align: center;
  margin-bottom: 30px;
}

/* Recherche */
.styled-search-input {
  width: 100%;
  height: 52px;
  padding: 0 20px;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.styled-search-input:focus {
  border-color: #3b82f6;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  outline: none;
}

.search-results-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  margin-top: 10px;
  list-style: none;
  padding: 0;
  overflow: hidden;
}

.search-result-item {
  padding: 15px 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
}

.search-result-item:hover { background: #eff6ff; }

/* Carte Patient */
.selected-patient-card {
  background: linear-gradient(135deg, #f0f7ff 0%, #e0efff 100%);
  border: 1px solid #bae6fd;
  border-radius: 16px;
  padding: 20px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 25px 0;
}

.patient-details { display: flex; align-items: center; }

.patient-icon-large {
  font-size: 2rem;
  background: white;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  margin-right: 15px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.patient-meta h3 { margin: 0; font-size: 1.2rem; color: #0c4a6e; }
.patient-meta p { margin: 0; font-size: 0.9rem; color: #38a169; }

.btn-reset {
  background: white;
  border: 1px solid #cbd5e1;
  padding: 8px 15px;
  border-radius: 10px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
}

/* Formulaire */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group.full-width { grid-column: 1 / -1; }

.input-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 6px;
  display: block;
}

.required { color: #ef4444; }

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  font-size: 1rem;
}

.form-input:focus {
  border-color: #3b82f6;
  outline: none;
}

.submit-btn {
  width: 100%;
  height: 54px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  margin-top: 30px;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
}

.submit-btn:hover { background: #1d4ed8; transform: translateY(-1px); }
.submit-btn:disabled { background: #94a3b8; cursor: not-allowed; }

/* Messages */
.message { padding: 15px; border-radius: 10px; margin-top: 20px; font-weight: 500; }
.message.error { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }
.message.success { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }

.info-message-box {
  background: #fffbeb;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  color: #b45309;
  border: 1px solid #fef3c7;
}

@media (max-width: 640px) {
  .form-grid { grid-template-columns: 1fr; }
  .selected-patient-card { flex-direction: column; text-align: center; gap: 15px; }
  .patient-details { flex-direction: column; }
  .patient-icon-large { margin: 0 0 10px 0; }
}
</style>