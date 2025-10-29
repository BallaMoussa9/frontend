<template>
  <MedecinLayout>
    <div class="ordonnances-page">
      <h1 class="title">Émission de Prescriptions</h1>

      <p v-if="prescriptionStore.getSuccess" class="message-success">{{ prescriptionStore.getSuccess }}</p>
      <p v-if="prescriptionStore.getError" class="message-error">{{ prescriptionStore.getError }}</p>
      
      <section class="section patient-selection-section">
        <div>
            <label for="search-patient">Rechercher un patient :</label>
            <input
              id="search-patient"
              type="text"
              v-model="searchPatient"
              placeholder="Nom, ID ou Email du patient..."
              class="search-input"
            />
        </div>
        
        <div>
            <label for="patient-select">Patient sélectionné :</label>
            <select id="patient-select" v-model="selectedPatientId" @change="fetchPatientHistory" class="select-patient">
              <option :value="null" disabled>
                <span v-if="patientStore.loading">Chargement des patients...</span>
                <span v-else>-- Sélectionnez un patient --</span>
              </option>
              <option
                v-for="patient in filteredPatients"
                :key="patient.id"
                :value="patient.id"
              >
                {{ patient.user?.first_name }} {{ patient.user?.last_name }} (ID: {{ patient.id }})
              </option>
            </select>
            <p v-if="patientStore.error" class="info-text message-error small-error">Erreur de chargement des patients.</p>
        </div>
      </section>

      <section v-if="selectedPatient" class="section prescription-form-container">
        <h2>Créer une nouvelle ordonnance pour: {{ selectedPatient.user?.first_name }} {{ selectedPatient.user?.last_name }}</h2>
        
        <div class="new-line-form">
            <h3>Ajouter un médicament</h3>
            <form @submit.prevent="addLocalLine" novalidate> 
                
                <label for="medication-name">Nom du Médicament:</label>
                <input
                    id="medication-name"
                    type="text"
                    v-model="newLine.medicationName"
                    required
                    placeholder="ex: Paracétamol 500mg"
                    class="search-input"
                />
                
                <label>Posologie (Dosage):</label>
                <input type="text" v-model="newLine.dosage" required placeholder="ex: 500mg" />

                <label>Fréquence (requis par DB):</label>
                <input type="text" v-model="newLine.frequency" required placeholder="ex: 3x par jour" />

                <label>Durée du traitement (requis par DB):</label>
                <input type="text" v-model="newLine.duration" required placeholder="ex: 7 jours" />
                
                <label>Instructions (Optionnel par DB):</label>
                <input type="text" v-model="newLine.instructions" placeholder="ex: À prendre avec de la nourriture" />


                <button class="btn-add-line" type="submit">
                    ➕ Ajouter cette ligne à l'ordonnance (Brouillon)
                </button>
            </form>
        </div>
        
        <div class="current-lines">
          <h3>Lignes de médicaments à envoyer ({{ prescriptionLines.length }})</h3>
          <ul class="lines-list">
            <li v-if="prescriptionLines.length === 0" class="empty-line">
                Veuillez ajouter au moins une ligne de prescription ci-dessus.
            </li>
            <li v-for="(line, index) in prescriptionLines" :key="index" class="line-item">
                <span class="line-text">
                    <strong>{{ line.medicationName }}</strong> : {{ line.dosage }} ({{ line.frequency }}, Durée: {{ line.duration }})
                </span>
                <button @click="removeLocalLine(index)" class="btn-remove">X</button>
            </li>
          </ul>
        </div>

        <div class="finalization-area">
            <label>Notes (optionnel):</label>
            <textarea v-model="finalNotes" rows="2" placeholder="Instructions spéciales, conseils..."></textarea>
            
            <button
                @click="createOrdonnanceAndFinalize"
                :disabled="prescriptionLines.length === 0 || prescriptionStore.isLoading"
                class="btn-submit btn-final"
            >
                📝 Finaliser et Enregistrer l'Ordonnance Complète
            </button>
        </div>

      </section>

      <hr />

      <section v-if="selectedPatientId" class="section">
        <h2>Historique des prescriptions</h2>
        <div v-if="prescriptionStore.isLoading" class="info-text">Chargement de l'historique...</div>
        <div v-else-if="prescriptionStore.getError" class="message-error">{{ prescriptionStore.getError }}</div>

        <table v-else-if="patientPrescriptions.length" class="ordonnances-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Docteur</th>
              <th>Détails</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ord in patientPrescriptions" :key="ord.id">
              <td>{{ formatDate(ord.created_at) }}</td>
              <td>Dr. {{ ord.doctor?.user?.last_name || 'Inconnu' }}</td>
              <td>
                <span v-if="ord.lines && ord.lines.length > 0">
                    {{ ord.lines.length }} ligne(s) : {{ ord.lines[0].medicament_name || ord.lines[0].name }}...
                </span>
                <span v-else class="info-text">
                    Aucune ligne de médicament enregistrée.
                </span>
              </td>
              <td>
                <span :class="getStatusClass(ord.status)">{{ ord.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="info-text">Aucune ordonnance trouvée pour ce patient.</p>
      </section>
    </div>
  </MedecinLayout>
</template>

<script setup>
import MedecinLayout from '@/layouts/MedecinLayout.vue'
import { ref, computed, onMounted } from 'vue'
import { usePatientStore } from '@/stores/patientStore'
import { usePrescriptionStore } from '@/stores/prescriptionStore'
import { useAuthStore } from '@/stores/authStores' 
import { useUserStore } from '@/stores/userStore' 
// 🚨 Import de useRoute pour lire l'ID du docteur depuis l'URL
import { useRoute } from 'vue-router' 

// --- Stores ---
const patientStore = usePatientStore()
const prescriptionStore = usePrescriptionStore()
// Les stores Auth et User ne sont pas directement utilisés pour l'ID du docteur dans ce flux
const authStore = useAuthStore() 
const userStore = useUserStore() 
const route = useRoute() // Initialiser le routeur

// --- État Local ---
const searchPatient = ref('')
const selectedPatientId = ref(null) 
const finalNotes = ref('')
const prescriptionLines = ref([]) 
const newLine = ref({
    medicationName: '', 
    dosage: '',
    frequency: '', 
    duration: '',
    instructions: '', 
})

// --- Computed ---

// 🚨 NOUVEAU: Récupérer l'ID du docteur directement depuis les paramètres de l'URL
const doctorIdFromRoute = computed(() => {
    // La route est /doctor/prescriptions/26. Le paramètre est généralement nommé 'id' ou 'doctorId'.
    // Je suppose 'id' pour la route '/doctor/prescriptions/:id'
    const id = route.params.id || route.params.doctorId; 
    
    // Vérification et conversion en nombre
    const doctorId = id ? parseInt(id) : null;
    
    // Log pour vérification dans la console du navigateur
    console.log(`[ROUTE LOG] Doctor ID lu depuis l'URL: ${doctorId}`);
    return doctorId;
});


const rawPatients = computed(() => {
    let patientsSource = patientStore.patients;
    if (patientsSource && typeof patientsSource === 'object' && Array.isArray(patientsSource.data)) {
        return patientsSource.data;
    }
    const result = Array.isArray(patientsSource) ? patientsSource : [];
    return result;
});

const filteredPatients = computed(() => {
    const patients = rawPatients.value;
    const query = searchPatient.value.trim().toLowerCase();
    
    if (!query) {
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

const selectedPatient = computed(() => {
    return rawPatients.value.find(p => p.id === selectedPatientId.value)
})

const patientPrescriptions = computed(() => prescriptionStore.prescriptions)


// --- Méthodes de Gestion de Lignes Locales ---

function fetchPatientHistory() {
    prescriptionLines.value = [];
    finalNotes.value = '';
    prescriptionStore.clearMessages(); 

    if (selectedPatientId.value) {
        prescriptionStore.fetchPatientPrescriptions(selectedPatientId.value)
    }
}


function addLocalLine() {
    const isMedicationValid = !!newLine.value.medicationName && newLine.value.medicationName.trim() !== '';
    const isDosageValid = !!newLine.value.dosage && newLine.value.dosage.trim() !== '';
    const isFrequencyValid = !!newLine.value.frequency && newLine.value.frequency.trim() !== '';
    const isDurationValid = !!newLine.value.duration && newLine.value.duration.trim() !== '';

    if (!isMedicationValid || !isDosageValid || !isFrequencyValid || !isDurationValid) {
        alert('ATTENTION : Veuillez remplir le nom du médicament, la posologie, la fréquence et la durée.');
        return
    }

    const lineToAdd = { 
        medicationName: newLine.value.medicationName.trim(), 
        dosage: newLine.value.dosage.trim(),
        frequency: newLine.value.frequency.trim(),
        duration: newLine.value.duration.trim(),
        instructions: newLine.value.instructions ? newLine.value.instructions.trim() : '', 
    };
    
    prescriptionLines.value.push(lineToAdd);

    newLine.value = { medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' }
}

function removeLocalLine(index) {
    prescriptionLines.value.splice(index, 1);
}

// --- Méthode Principale : Création et Envoi Final ---

async function createOrdonnanceAndFinalize() {
    // 1. Validation de base
    if (!selectedPatientId.value) {
        prescriptionStore.setError("Veuillez d'abord sélectionner un patient.")
        return
    }
    if (prescriptionLines.value.length === 0) {
        prescriptionStore.setError('Veuillez ajouter au moins une ligne de médicament avant de finaliser.')
        return
    }
    
    // 🚨 UTILISATION DIRECTE DE L'ID DU DOCTEUR DEPUIS L'URL
    const currentDoctorId = doctorIdFromRoute.value;

    if (!currentDoctorId) {
        prescriptionStore.setError("Impossible de finaliser : L'ID du Docteur est introuvable dans l'URL. Veuillez vérifier la configuration de votre route et recharger la page.");
        console.error("Erreur de Finalisation: doctor_id est manquant dans l'URL.");
        return; 
    }
    
    // 🚨 LOG AFFICHANT L'ID ENVOYÉ - POUR CONFIRMATION
    console.log(`📋 Envoi de la prescription: doctor_id (depuis l'URL) utilisé est -> ${currentDoctorId}`);


    // 2. Construction du Payload
    const payloadLines = prescriptionLines.value.map(line => ({
        medication_name: line.medicationName, 
        dosage: line.dosage,
        frequency: line.frequency,
        duration: line.duration,
        instructions: line.instructions || null,
    }));

    const prescriptionData = { 
        lines: payloadLines, 
        notes: finalNotes.value,
        // doctor_id N'EST PAS inclus ici, car il est passé comme argument séparé au store.
    }
    
    // 3. Appel au Store (API POST) :
    // 🚨 MODIFICATION ICI : Passez currentDoctorId comme premier argument à createPrescription
    const responseData = await prescriptionStore.createPrescription(currentDoctorId, selectedPatientId.value, prescriptionData)
    
    // 4. Traitement après succès/échec
    if (responseData && responseData.success) { // Vérifier responseData.success
        prescriptionLines.value = []
        finalNotes.value = ''
        prescriptionStore.setSuccess("L'ordonnance a été enregistrée avec succès. Le brouillon est réinitialisé.");
        fetchPatientHistory() 
    }
}


// --- Utilitaires ---

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const getStatusClass = (status) => {
    if (status === 'active') return 'status-active';
    if (status === 'draft' || status === 'pending') return 'status-draft';
    if (status === 'expired' || status === 'inactive') return 'status-inactive';
    return 'status-default';
}

// initializeAndLogUser n'est plus appelée au montage, car l'ID du docteur vient de l'URL.
// Je la laisse commentée ici au cas où tu voudrais la réactiver pour d'autres besoins de log/debug.
/*
async function initializeAndLogUser() {
    const user = authStore.user;
    console.log("-----------------------------------------");
    console.log("1. 🔑 Données de l'utilisateur connecté (AuthStore) : 🔑");
    if (user) {
        console.log(user);
        try {
            console.log(`\n2. 🧑‍⚕️ Tentative de récupération du profil Médecin pour user_id: ${user.id}...`);
            const doctorId = await userStore.fetchDoctorByUserId(user.id); 
            const doctorProfile = userStore.getCurrentDoctorProfile;
            console.log("3. ✅ Profil Médecin Récupéré (UserStore):");
            console.log(doctorProfile); 
            console.log(`   --> doctor_id (clé métier) : ${doctorId}`);
            console.log("-----------------------------------------");
        } catch (error) {
            console.error("3. ❌ ERREUR: Échec de la récupération du profil Médecin.");
            console.error("Détail de l'erreur (UserStore):", userStore.error || error.message);
            console.log("-----------------------------------------");
        }
        
    } else {
        console.log("Utilisateur non connecté ou données non chargées dans authStore.");
        console.log("-----------------------------------------");
    }
}
*/

onMounted(() => {
    // initializeAndLogUser(); // Désactivé par défaut. Activez si vous avez besoin des logs du userStore au montage.
    patientStore.allPatient();
})
</script>

<style scoped>
/* (Styles inchangés) */
.ordonnances-page { padding: 32px; background-color: #f8f9fa; }
.title { font-size: 28px; color: #002580; margin-bottom: 24px; }
.section { margin-top: 28px; padding: 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
.patient-selection-section { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: end; }
label { display: block; margin-top: 12px; font-weight: 600; color: #333; }
.search-input, .select-patient, textarea, input { width: 100%; padding: 10px; margin-top: 6px; border-radius: 6px; border: 1px solid #ccc; font-size: 14px; box-sizing: border-box; }
.prescription-form-container { padding: 30px; }
.new-line-form { border: 1px dashed #0040d0; padding: 20px; margin-top: 20px; border-radius: 6px; background-color: #f7fbff; }
.new-line-form h3 { margin-top: 0; color: #0040d0; }
.current-lines { margin-top: 20px; padding: 20px 0; border-top: 1px solid #ddd;}
.current-lines h3 { color: #002580; border-bottom: 1px solid #eee; padding-bottom: 5px; }
.lines-list { list-style: none; padding: 0; margin-bottom: 20px; }
.line-item { display: flex; justify-content: space-between; align-items: center; background-color: #eaf0ff; border-left: 5px solid #0040d0; padding: 10px; margin-bottom: 8px; border-radius: 4px; }
.line-text strong { color: #002580; }
.empty-line { font-style: italic; color: #888; }
.btn-remove { background: #ff4d4f; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 0.8em; }
.btn-add-line { margin-top: 16px; padding: 10px 16px; background-color: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; width: 100%; }
.finalization-area { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
.btn-submit { padding: 12px 16px; background-color: #002580; color: white; border: none; border-radius: 6px; cursor: pointer; width: 100%; font-size: 16px; transition: background-color 0.2s; }
.btn-submit:disabled { background-color: #a0a0a0; cursor: not-allowed; }
.ordonnances-table { width: 100%; margin-top: 12px; border-collapse: collapse; }
.ordonnances-table th, .ordonnances-table td { border: 1px solid #e1e7f3; padding: 10px; text-align: left; }
.ordonnances-table th { background-color: #002580; color: white; }
.message-success { color: #155724; background-color: #d4edda; border: 1px solid #c3e6cb; padding: 10px; margin-top: 10px; border-radius: 4px; }
.message-error, .small-error { color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 10px; margin-top: 10px; border-radius: 4px; }
.small-error { font-size: 0.85em; padding: 5px 10px; margin-top: 5px; }
.info-text { font-style: italic; color: #6c757d; }
.status-active { color: green; font-weight: bold; }
.status-draft { color: orange; font-weight: bold; }
.status-inactive, .status-expired { color: red; font-weight: bold; }
.status-default { color: #444; }
</style>