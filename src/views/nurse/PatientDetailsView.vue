<template>
  <NurseLayout>
    <div class="patient-details-container">
      <div v-if="patientStore.loading || globalLoading" class="loading-overlay">
        <p>Chargement des détails du patient {{ idPatient }}...</p>
      </div>

      <div v-else-if="patientStore.error" class="alert alert-error">
        {{ patientStore.error }}
      </div>

      <template v-else-if="patient && patient.id">
        <header class="patient-header">
          <div class="header-content">
            <h2>
              Fiche du patient :
              {{ patient.user?.first_name }} {{ patient.user?.last_name }} (#{{ patient.id }})
            </h2>
            <p class="patient-meta">
              **Sexe** : {{ patient.genre ? formatGender(patient.genre) : 'N/A' }}
              | **Âge** : {{ calculateAge(patient.user?.birth_date) }} ans
              | **Groupe Sanguin** : {{ patient.group_sanguine || 'N/A' }}
            </p>
          </div>
          <button @click="handleUpdate" class="update-btn" :disabled="isUpdating">
            <i class="fas fa-save"></i>
            {{ isUpdating ? 'Mise à jour...' : 'Mettre à jour les infos' }}
          </button>
        </header>

        <div v-if="patientStore.success" class="alert alert-success">{{ patientStore.success }}</div>

        <section class="patient-info-grid">
          <div class="info-box">
            <h4>Détails de Contact / Urgence</h4>
            <ul class="detail-list">
              <li><strong>Tél. Urgence (Contact) :</strong> {{ patient.telephone_urgence || 'N/A' }}</li>
              <li><strong>Numéro d'Urgence (Patient) :</strong> {{ patient.numero_urgence || 'N/A' }}</li>
              <li><strong>Assurance Maladie :</strong> {{ patient.assurance_maladie || 'N/A' }}</li>
              <li><strong>Dernière Consultation :</strong> {{ formatDate(patient.last_consultation_date) }}</li>
            </ul>
          </div>

          <div class="info-box">
            <h4>Localisation & Statut du Patient</h4>
            <div class="input-group">
              <label>Département / Service :</label>
              <p class="current-value">{{ patient.bed?.room?.department?.name || "Non assigné" }}</p>
            </div>
            <div class="input-group">
              <label>Chambre / Lit actuel :</label>
              <p class="current-value">
                Ch. {{ patient.bed?.room?.room_number || 'N/A' }} / Lit {{ patient.bed?.bed_number || 'N/A' }}
              </p>
            </div>

            <div class="input-group">
              <label for="status">Statut actuel :</label>
              <select id="status" v-model="patientData.status">
                <option value="actif">Actif</option>
                <option value="en_traitement">En Traitement</option>
                <option value="stable">Stable</option>
                <option value="critique">Critique</option>
                <option value="sorti">Sorti</option>
                <option value="archive">Archivé</option>
              </select>
            </div>

            <div class="input-group">
              <label for="bed_id">Assigner un Lit :</label>
              <select id="bed_id" v-model.number="patientData.bed_id" :disabled="bedStore.loading">
                  <option :value="null">-- Pas de lit assigné (Libérer) --</option>

                  <template v-if="bedStore.loading">
                      <option disabled>Chargement des lits...</option>
                  </template>

                  <template v-else-if="groupedAvailableBeds.length === 0 && !patient.bed_id">
                      <option disabled>Aucun lit disponible.</option>
                  </template>

                  <optgroup v-for="group in groupedAvailableBeds" :key="group.departmentId" :label="group.departmentName">
                      <option v-for="bed in group.beds" :key="bed.id" :value="bed.id">
                          Ch. {{ bed.room?.room_number || 'N/A' }} / Lit {{ bed.bed_number }}
                      </option>
                  </optgroup>
              </select>
            </div>
            </div>
        </section>

        <section class="medical-info-grid">
          <div class="info-box">
            <h4>Antécédents Médicaux / Maladies Chroniques</h4>
            <p>{{ patient.maladies_chroniques || "Aucune maladie chronique enregistrée." }}</p>
            <p>{{ patient.medical_history || "Aucun antécédent enregistré." }}</p>
          </div>

          <div class="info-box">
            <h4>Allergies</h4>
            <p>{{ patient.allergies || "Aucune allergie connue." }}</p>
          </div>

          <div class="info-box">
            <h4>Traitements en cours</h4>
            <p>{{ patient.current_treatments || "Aucun traitement en cours." }}</p>
          </div>
        </section>


        <section class="vitals-and-measures-grid">
          <div class="info-box vital-box">
            <h4>Derniers Paramètres Vitaux (Lecture)</h4>
            <template v-if="patient.latest_vitals">
                <ul class="vitals-list">
                    <li><strong>Enregistré le :</strong> {{ formatDateHeure(patient.latest_vitals.recorded_at) }}</li>
                    <li><strong>Tension :</strong> {{ patient.latest_vitals.blood_pressure_systolic }}/{{ patient.latest_vitals.blood_pressure_diastolic }} mmHg</li>
                    <li><strong>Rythme cardiaque :</strong> {{ patient.latest_vitals.heart_rate }} bpm</li>
                    <li><strong>Température :</strong> {{ patient.latest_vitals.temperature }} °C</li>
                    <li><strong>Respiration :</strong> {{ patient.latest_vitals.respiratory_rate }} rpm</li>
                    <li><strong>SpO₂ :</strong> {{ patient.latest_vitals.oxygen_saturation }} %</li>
                    <li><strong>Notes :</strong> {{ patient.latest_vitals.notes || 'Aucune' }}</li>
                </ul>
            </template>
            <p v-else>Aucun signe vital enregistré.</p>
          </div>

          <div class="info-box measure-box">
            <h4>Mesures Physiques (Modifiables)</h4>

            <div class="input-group">
              <label for="poids">Poids actuel (kg) :</label>
              <input type="number" step="0.1" id="poids" v-model.number="patientData.poids" placeholder="Poids" />
            </div>

            <div class="input-group">
              <label for="taille">Taille actuelle (cm) :</label>
              <input type="number" step="0.1" id="taille" v-model.number="patientData.taille" placeholder="Taille" />
            </div>

            <p class="current-value small-text">
                **Dernières valeurs connues :** Poids: {{ patient.poids || 'N/A' }}kg, Taille: {{ patient.taille || 'N/A' }}cm
            </p>
          </div>
        </section>


        <section class="documents-section">
          <h3>Documents médicaux</h3>
          <ul v-if="patient.documents && patient.documents.length">
            <li v-for="(doc, index) in patient.documents" :key="index">
              <a :href="doc.url" target="_blank">{{ doc.name }}</a>
            </li>
          </ul>
          <p v-else>Aucun document médical enregistré.</p>
        </section>
      </template>

      <div v-else>
        <p class="error-message">ID patient {{ idPatient }} introuvable.</p>
      </div>
    </div>
  </NurseLayout>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRoute } from "vue-router";
import { usePatientStore } from "@/stores/patientStore";
import { useBedStore } from "@/stores/bedStore"; // Import du store de lits

import NurseLayout from "@/layouts/NurseLayout.vue";

const route = useRoute();
const patientStore = usePatientStore();
const bedStore = useBedStore(); // Initialisation du store de lits

// 🔑 SUPPRESSION: Il n'est plus nécessaire d'importer ni d'initialiser bedApiStore ici.
// car les actions de lit sont maintenant appelées via bedStore.
// import { bedApiStore } from "@/stores/api/bedApiStore"; // <-- Supprimez cette ligne
// const bedApiService = bedApiStore(); // <-- Supprimez cette ligne

const idNurse = route.params.idNurse;
const idPatient = ref(route.params.idPatient);

const patient = ref({});
const isUpdating = ref(false);
const globalLoading = ref(false);

const previousBedId = ref(null);

const patientData = ref({
  status: '',
  poids: null,
  taille: null,
  bed_id: null,
});

// Computed pour les lits disponibles regroupés par département
const groupedAvailableBeds = computed(() => {
    let bedsToDisplay = [...(bedStore.getAvailableBeds || [])];

    if (patient.value.bed_id && patient.value.bed && !bedsToDisplay.some(b => b.id === patient.value.bed_id)) {
        bedsToDisplay.push(patient.value.bed);
    }

    const departmentsMap = bedsToDisplay.reduce((acc, bed) => {
        const department = bed.room?.department;
        if (!department) {
            // Log pour le debug: si un lit n'a pas de département, il ne peut pas être groupé.
            console.warn("Lit sans département trouvé:", bed);
            return acc;
        }

        const key = department.id;
        if (!acc[key]) {
            acc[key] = {
                departmentId: key,
                departmentName: department.name,
                beds: [],
            };
        }
        acc[key].beds.push(bed);
        return acc;
    }, {});

    return Object.values(departmentsMap).sort((a, b) => a.departmentName.localeCompare(b.departmentName));
});


// --- Fonctions utilitaires ---
const calculateAge = (birthDateString) => {
  if (!birthDateString) return "N/A";
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('fr-FR');
};

const formatDateHeure = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('fr-FR');
};

const formatGender = (genre) => {
  if (!genre) return 'N/A';
  switch (genre.toLowerCase()) {
    case 'homme':
    case 'm':
    case 'male':
      return 'Homme';
    case 'femme':
    case 'f':
    case 'female':
      return 'Femme';
    default:
      return genre.charAt(0).toUpperCase() + genre.slice(1);
  }
};


// --- Logique de chargement des données ---
const loadPatientData = async (patientId) => {
  if (!patientId) {
    patientStore.error = "ID du patient manquant dans l'URL.";
    patient.value = {};
    return;
  }

  globalLoading.value = true;
  try {
    await patientStore.onePatient(patientId);

    if (patientStore.currentPatient && patientStore.currentPatient.id == patientId) {
      patient.value = patientStore.currentPatient;
      patientStore.error = null;

      patientData.value.status = patient.value.status || 'actif';
      patientData.value.poids = patient.value.poids ? parseFloat(patient.value.poids) : null;
      patientData.value.taille = patient.value.taille ? parseFloat(patient.value.taille) : null;

      const currentBedId = patient.value.bed_id ? Number(patient.value.bed_id) : null;
      patientData.value.bed_id = currentBedId;
      previousBedId.value = currentBedId;

      await bedStore.fetchBeds();
    } else {
      patientStore.error = `Aucun patient trouvé avec l'ID ${patientId}.`;
      patient.value = {};
    }
  } catch (error) {
    console.error("Erreur lors du chargement du patient ou des lits :", error);
    patientStore.error = `Erreur de récupération du patient ${patientId} ou de ses informations de lit.`;
    patient.value = {};
  } finally {
    globalLoading.value = false;
  }
};

// --- Logique de mise à jour des données ---
const handleUpdate = async () => {
  isUpdating.value = true;
  patientStore.error = null;
  patientStore.success = null;

  const currentBedId = patientData.value.bed_id;
  const oldBedId = previousBedId.value;
  const dataToUpdate = {};

  if (patientData.value.status && patientData.value.status !== patient.value.status) {
      dataToUpdate.status = patientData.value.status;
  }
  if (patientData.value.poids !== null && patientData.value.poids !== parseFloat(patient.value.poids)) {
      dataToUpdate.poids = patientData.value.poids;
  }
  if (patientData.value.taille !== null && patientData.value.taille !== parseFloat(patient.value.taille)) {
      dataToUpdate.taille = patientData.value.taille;
  }

  if (currentBedId !== oldBedId) {
       dataToUpdate.bed_id = currentBedId;
  }

  if (Object.keys(dataToUpdate).length === 0) {
      patientStore.error = "Aucune information à mettre à jour.";
      isUpdating.value = false;
      return;
  }

  try {
    if (currentBedId !== oldBedId) {
        if (oldBedId) {
            console.log(`Libération de l'ancien lit ID: ${oldBedId}`);
            await bedStore.updateBed(oldBedId, { status: 'available' }); // 🔑 Appel via bedStore
        }

        if (currentBedId) {
            console.log(`Occupation du nouveau lit ID: ${currentBedId}`);
            await bedStore.updateBed(currentBedId, { status: 'occupied' }); // 🔑 Appel via bedStore
        }
    }

    const success = await patientStore.updatePatient(idPatient.value, dataToUpdate);

    if (success) {
      await loadPatientData(idPatient.value);
      patientStore.success = 'Informations du patient et statut du lit mis à jour avec succès !';
    } else {
      if (!patientStore.error) {
        patientStore.error = "Échec de la mise à jour (erreur inconnue).";
      }
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    patientStore.error = error.response?.data?.message || "Erreur critique lors de la mise à jour des données ou des lits.";
  } finally {
    isUpdating.value = false;
  }
};

onMounted(() => {
  loadPatientData(idPatient.value);
});

watch(() => route.params.idPatient, (newIdPatient) => {
  if (newIdPatient) {
    idPatient.value = newIdPatient;
    loadPatientData(newIdPatient);
  }
});
</script>

<style scoped>
/* ---------------------------------------------------- */
/* AJUSTEMENTS CRITIQUES POUR LE SELECTEUR DE LIT */
/* Ces règles forcent le navigateur à afficher l'élément <select> comme une liste déroulante normale, */
/* neutralisant les styles globaux qui pourraient le déformer. */
.input-group select {
    -webkit-appearance: menulist !important; /* Pour Chrome, Safari, Edge, Opera */
    -moz-appearance: menulist !important;   /* Pour Firefox */
    appearance: menulist !important;        /* Standard CSS */

    /* Empêche les flèches de type "number input" d'apparaître sur les <select> */
    /* Utilisez !important si nécessaire pour écraser d'autres styles */
    -moz-appearance: initial !important; /* Réinitialise spécifiquement pour Firefox */
    /* Pour WebKit (Chrome, Safari), `-webkit-appearance: menulist` gère déjà cela */
}

/* S'assurer que les inputs de type 'number' (poids/taille) conservent leurs flèches */
/* Ces règles sont moins critiques, mais assurent que les autres champs numériques fonctionnent correctement */
.input-group input[type="number"] {
    -webkit-appearance: textfield; /* Assure que les flèches restent pour Chrome/Safari */
    -moz-appearance: textfield;    /* Pour Firefox, c'est le comportement par défaut */
    appearance: textfield;
}
/* ---------------------------------------------------- */


/* Styles globaux au composant (non liés au problème de select) */
.patient-details-container { padding: 30px; background-color: #f7fafd; }

.patient-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding: 15px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.patient-header h2 {
  color: #002580;
  font-size: 24px;
  margin-bottom: 3px;
}

.patient-meta {
    font-size: 14px;
    color: #555;
}

.update-btn {
  padding: 10px 20px;
  background-color: #0055aa;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.update-btn:hover:not(:disabled) {
  background-color: #004080;
}

.update-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Grilles d'informations */
.patient-info-grid, .medical-info-grid, .vitals-and-measures-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.info-box {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.info-box h4 {
  color: #003366;
  font-size: 18px;
  margin-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 5px;
}

/* Styles pour les champs modifiables */
.input-group {
    margin-bottom: 15px;
}

.input-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 5px;
    color: #333;
    font-size: 14px;
}

.input-group input[type="number"],
.input-group select {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 15px;
    background-color: #fafafa;
}

.current-value {
    padding: 8px 10px;
    background-color: #e9eff4;
    border-radius: 4px;
    font-weight: 500;
    color: #002580;
    margin-top: 0;
}

.detail-list, .vitals-list {
  list-style: none;
  padding-left: 0;
  font-size: 15px;
}

.detail-list strong, .vitals-list strong {
    color: #003366;
    font-weight: 600;
    display: inline-block;
    width: 140px; /* Alignement */
}

.small-text {
    font-size: 13px;
    color: #666;
    margin-top: 15px;
    padding-top: 10px;
    border-top: 1px dashed #eee;
}

.documents-section {
  margin-top: 30px;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.documents-section h3 {
  font-size: 18px;
  color: #003366;
  margin-bottom: 15px;
}

.documents-section ul {
  list-style: none;
  padding: 0;
}

.documents-section li {
    padding: 5px 0;
}

.documents-section a {
  color: #0055aa;
  text-decoration: none;
  font-weight: 500;
}

.documents-section a:hover {
    text-decoration: underline;
}

.error-message, .alert-error, .alert-success {
    padding: 15px;
    border-radius: 4px;
    margin-bottom: 20px;
    font-weight: 500;
}

.alert-error {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}

.alert-success {
  color: #008000;
  background-color: #e9f7ef;
  border: 1px solid #008000;
}
</style>