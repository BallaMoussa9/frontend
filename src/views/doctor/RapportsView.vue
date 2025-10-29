<template>
  <MedecinLayout>
    <div class="rapports-page">
      <h1 class="title">Gestion des rapports médicaux</h1>

      <div v-if="reportStore.error" class="alert-error">{{ reportStore.error }}</div>
      <div v-if="reportStore.success" class="alert-success">{{ reportStore.success }}</div>
      <div v-if="patientStore.error" class="alert-error">{{ patientStore.error }}</div> 
      
      <section class="section">
        <h2>Créer un nouveau rapport</h2>
        <form @submit.prevent="ajouterRapport">
          <label for="report_type">Type de rapport *</label>
          <select id="report_type" v-model="nouveauRapport.report_type" required>
            <option disabled value="">-- Sélectionnez --</option>
            <option value="consultation">Consultation</option>
            <option value="hopitalisation">Hospitalisation</option>
            <option value="laboratoire">Laboratoire/Analyses</option>
          </select>

          <label for="title">Titre du rapport *</label>
          <input id="title" type="text" v-model="nouveauRapport.title" required />

          <label for="patientSearch">Rechercher/Sélectionner le Patient *</label>
          <div class="patient-search-container">
            <input
              id="patientSearch"
              type="text"
              placeholder="Nom, prénom ou email du patient..."
              v-model="searchPatientQuery"
              @focus="showSearchResults = true"
              @blur="handleBlur"
            />
            <div v-if="patientStore.loading" class="loading-indicator">Chargement des patients...</div> 
            <ul v-if="showSearchResults && filteredPatients.length" class="search-results-list"> 
              <li
                v-for="patient in filteredPatients"
                :key="patient.id"
                @mousedown.prevent="selectPatient(patient)"
              >
                {{ patient.user ? `${patient.user.first_name} ${patient.user.last_name}` : 'Nom inconnu' }}
              </li>
            </ul>
            <p v-if="!patientStore.loading && searchPatientQuery.length >=3 && !filteredPatients.length && showSearchResults">
                Aucun patient trouvé pour "{{ searchPatientQuery }}".
            </p>
          </div>

          <p v-if="selectedPatient.id">
            **Patient sélectionné:** {{ selectedPatient.name }}
          </p>

          <label for="content">Contenu du rapport *</label>
          <textarea id="content" v-model="nouveauRapport.content" rows="6" required></textarea>

          <button type="submit" class="btn-submit" :disabled="reportStore.isLoading || !selectedPatient.id || !currentDoctorId">
            {{ reportStore.isLoading ? 'Création...' : 'Créer le rapport' }}
          </button>
        </form>
      </section>

      <section class="section">
        <h2>Historique des rapports</h2>
        <div v-if="reportStore.isLoading && reportStore.getMedicalReports.length === 0" class="loading-indicator">
          Chargement des rapports...
        </div>
        <div v-else-if="reportStore.getMedicalReports.length === 0">
            Aucun rapport trouvé pour le moment.
        </div>
        <table v-else class="rapport-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>ID</th>
              <th>Type</th>
              <th>Titre</th>
              <th>Patient</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in reportStore.getMedicalReports" :key="r.id">
              <td>{{ new Date(r.created_at).toLocaleDateString() }}</td>
              <td>{{ r.id }}</td>
              <td>{{ r.report_type }}</td>
              <td>{{ r.title }}</td>
              <td>{{ r.patient?.user?.first_name }} {{ r.patient?.user?.last_name }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </MedecinLayout>
</template>

<script setup>
import MedecinLayout from '@/layouts/MedecinLayout.vue'
import { ref, onMounted, computed, watch } from 'vue'
import { usePatientStore } from '@/stores/patientStore'
import { useMedicalReportStore } from '@/stores/medicalreportStore'
import { useRoute } from 'vue-router'
// `debounce` n'est plus nécessaire pour le filtrage local, mais je le laisse si d'autres usages existent.
// import { debounce } from 'lodash'

const patientStore = usePatientStore()
const reportStore = useMedicalReportStore()
const route = useRoute()

// --- État Local ---
const currentDoctorId = ref(null)

const selectedPatient = ref({ id: null, name: '' })
const searchPatientQuery = ref('') // NOUVEAU: ref local pour la recherche
const showSearchResults = ref(false)
const blurTimeout = ref(null)

const nouveauRapport = ref({
  report_type: 'consultation',
  title: '',
  content: '',
})

// --- Computed & Watchers ---

const urlDoctorId = computed(() => {
    const id = route.params.doctorId || route.params.id;
    return id ? parseInt(id, 10) : null;
});

watch(() => [currentDoctorId.value, selectedPatient.value.id], ([newDoctorId, newPatientId]) => {
    if (newDoctorId && newPatientId) {
        console.log(`Watcher: Chargement des rapports pour Docteur ${newDoctorId} et Patient ${newPatientId}`);
        reportStore.fetchMedicalReportsForDoctorPatient(newDoctorId, newPatientId)
    } else if (newDoctorId && !newPatientId) {
        console.log(`Watcher: Docteur ${newDoctorId} est sélectionné, mais aucun patient. Vider les rapports.`);
        reportStore.medicalReports = [];
    } else {
        reportStore.medicalReports = [];
    }
}, { immediate: true });


// NOUVEAU: Logique pour la liste complète des patients (comme dans OrdonnancesView)
const rawPatients = computed(() => {
    let patientsSource = patientStore.patients;
    // Si patientStore.patients est un objet avec une propriété 'data' (API paginée)
    if (patientsSource && typeof patientsSource === 'object' && Array.isArray(patientsSource.data)) {
        return patientsSource.data;
    }
    // Sinon, on assume que c'est un tableau directement ou on retourne un tableau vide
    const result = Array.isArray(patientsSource) ? patientsSource : [];
    return result;
});

// NOUVEAU: Filtrage local des patients (comme dans OrdonnancesView)
const filteredPatients = computed(() => {
    const patients = rawPatients.value;
    const query = searchPatientQuery.value.trim().toLowerCase(); // Utilise le ref local

    if (!query) {
        // Optionnel: Limiter le nombre de patients affichés si la liste est très longue
        return patients.length > 50 ? patients.slice(0, 50) : patients;
    }
    
    return patients.filter(p => {
        if (!p || !p.user) return false;
        const fullName = `${p.user.first_name || ''} ${p.user.last_name || ''}`.toLowerCase();
        const email = (p.user.email || '').toLowerCase();
        const patientId = String(p.id);

        return (
            fullName.includes(query) ||
            email.includes(query) ||
            patientId.includes(query)
        );
    });
});


// --- Logique de recherche de Patient (Adaptée) ---

// handleSearchPatient n'a plus besoin d'appeler d'API, il met juste à jour searchPatientQuery
// L'input lui-même met à jour `searchPatientQuery` via v-model, et `filteredPatients` se met à jour automatiquement.
// Nous pouvons donc supprimer la fonction `handleSearchPatient` ou la laisser vide si elle est appelée par d'autres moyens.
// Pour coller à l'esprit "comme OrdonnancesView", nous n'avons plus de @input pour une recherche API.

// La fonction handleSearchPatient est maintenant inutile car le filtrage est réactif via `v-model`
// et `filteredPatients` computed.
// Je la commente ou la retire, car elle ne ferait rien ici.
/*
const handleSearchPatient = () => {
  // Cette fonction ne ferait rien ici car le filtrage est réactif via `filteredPatients` computed
  // et le v-model met à jour `searchPatientQuery`.
  // Si le but était juste de vider la liste si moins de 3 caractères,
  // ce n'est pas nécessaire car `filteredPatients` gérera ça, et l'affichage avec `v-if="filteredPatients.length"` aussi.
};
*/

function selectPatient(patient) {
  if (blurTimeout.value) {
    clearTimeout(blurTimeout.value);
    blurTimeout.value = null;
  }

  selectedPatient.value = {
    id: patient.id,
    name: `${patient.user?.first_name || ''} ${patient.user?.last_name || ''}`,
  }
  searchPatientQuery.value = selectedPatient.value.name // Met à jour le champ de recherche
  showSearchResults.value = false
  console.log("RapportsView: Patient sélectionné:", selectedPatient.value);
}

function handleBlur() {
  blurTimeout.value = setTimeout(() => {
    showSearchResults.value = false;
  }, 150);
}

// --- Logique de soumission de rapport ---

async function ajouterRapport() {
  if (!currentDoctorId.value || !selectedPatient.value.id) {
    reportStore.setError("Erreur : ID Docteur non trouvé ou Patient non sélectionné.")
    return
  }

  const payload = {
    report_type: nouveauRapport.value.report_type,
    title: nouveauRapport.value.title,
    content: nouveauRapport.value.content,
  }

  try {
    const newReport = await reportStore.createMedicalReportForDoctorPatient(
      currentDoctorId.value,
      selectedPatient.value.id,
      payload
    )

    nouveauRapport.value = { report_type: 'consultation', title: '', content: '' }
    
  } catch (error) {
    console.error("RapportsView: Échec de l'ajout du rapport:", error)
  }
}

// --- Initialisation ---

onMounted(() => {
    currentDoctorId.value = urlDoctorId.value;

    if (!currentDoctorId.value) {
        reportStore.setError("Erreur: L'ID du docteur n'a pas été trouvé dans l'URL. Veuillez vérifier la configuration de la route.");
        console.error("RapportsView: Erreur: L'ID du docteur est absent de la route.");
    } else {
        console.log("RapportsView: ID Docteur extrait de l'URL:", currentDoctorId.value);
    }
    
    // NOUVEAU: Charger tous les patients au montage, comme dans OrdonnancesView
    patientStore.allPatient();
});
</script>

<style scoped>
/* Styles inchangés */
.rapports-page {
  padding: 32px;
}

.title {
  font-size: 24px;
  color: #002580;
  margin-bottom: 24px;
}

.section {
  margin-top: 28px;
}

label {
  display: block;
  margin-top: 12px;
  font-weight: 600;
}

select, textarea, input[type="text"] {
  width: 100%;
  padding: 10px;
  margin-top: 6px;
  border-radius: 6px;
  border: 1px solid #ccd;
  font-size: 14px;
}

.patient-search-container {
    position: relative;
}

.search-results-list {
    position: absolute;
    z-index: 10;
    width: 100%;
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #ccd;
    background-color: white;
    list-style: none;
    padding: 0;
    margin-top: 0;
    border-radius: 0 0 6px 6px;
}

.search-results-list li {
    padding: 10px;
    cursor: pointer;
    border-bottom: 1px solid #eee;
}

.search-results-list li:hover {
    background-color: #f0f4ff;
}

.btn-submit {
  margin-top: 16px;
  padding: 10px 16px;
  background-color: #002580;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-submit:disabled {
    background-color: #a0a0a0;
    cursor: not-allowed;
}

.rapport-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}

.rapport-table th, .rapport-table td {
  border: 1px solid #ccc;
  padding: 8px;
}

.rapport-table th {
  background-color: #f0f4ff;
}

.alert-error {
    padding: 10px;
    margin-bottom: 10px;
    background-color: #ffdddd;
    color: #cc0000;
    border: 1px solid #cc0000;
    border-radius: 4px;
}

.alert-success {
    padding: 10px;
    margin-bottom: 10px;
    background-color: #ddffdd;
    color: #006600;
    border: 1px solid #006600;
    border-radius: 4px;
}

.loading-indicator {
    color: #002580;
    margin-top: 10px;
}
</style>