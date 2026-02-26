<template>
  <MedecinLayout>
    <div class="ordonnances-page">
      <h1 class="title">Émission de Prescriptions</h1>

      <transition name="fade">
        <div v-if="prescriptionStore.getSuccess" class="message-success">
          ✅ {{ prescriptionStore.getSuccess }}
        </div>
      </transition>
      <transition name="fade">
        <div v-if="prescriptionStore.getError" class="message-error">
          ⚠️ {{ prescriptionStore.getError }}
        </div>
      </transition>
      
      <section class="section patient-selection-section">
        <div class="input-group">
          <label for="search-patient">🔍 Rechercher un patient :</label>
          <input
            id="search-patient"
            type="text"
            v-model="searchPatient"
            placeholder="Nom, ID ou Email du patient..."
            class="search-input"
          />
        </div>
        
        <div class="input-group">
          <label for="patient-select">👤 Patient sélectionné :</label>
          <select id="patient-select" v-model="selectedPatientId" @change="fetchPatientHistory" class="select-patient">
            <option :value="null" disabled>
              {{ patientStore.loading ? 'Chargement...' : '-- Sélectionnez un patient --' }}
            </option>
            <option
              v-for="patient in filteredPatients"
              :key="patient.id"
              :value="patient.id"
            >
              {{ patient.user?.first_name }} {{ patient.user?.last_name }} (ID: {{ patient.id }})
            </option>
          </select>
          <p v-if="patientStore.error" class="small-error">Erreur de chargement des patients.</p>
        </div>
      </section>

      <section v-if="selectedPatient" class="section prescription-form-container">
        <h2>Nouvelle ordonnance pour : <span class="patient-highlight">{{ selectedPatient.user?.first_name }} {{ selectedPatient.user?.last_name }}</span></h2>
        
        <div class="new-line-form">
          <h3>➕ Ajouter un médicament</h3>
          <form @submit.prevent="addLocalLine" class="grid-form"> 
            <div class="form-row full">
              <label>Nom du Médicament *</label>
              <input v-model="newLine.medicationName" type="text" required placeholder="ex: Paracétamol 500mg" />
            </div>
            
            <div class="form-row">
              <label>Posologie *</label>
              <input v-model="newLine.dosage" type="text" required placeholder="ex: 1 gélule" />
            </div>

            <div class="form-row">
              <label>Fréquence *</label>
              <input v-model="newLine.frequency" type="text" required placeholder="ex: 3x par jour" />
            </div>

            <div class="form-row">
              <label>Durée *</label>
              <input v-model="newLine.duration" type="text" required placeholder="ex: 7 jours" />
            </div>
            
            <div class="form-row">
              <label>Instructions</label>
              <input v-model="newLine.instructions" type="text" placeholder="ex: Après le repas" />
            </div>

            <button class="btn-add-line" type="submit">
              Ajouter au brouillon
            </button>
          </form>
        </div>
        
        <div class="current-lines">
          <h3>📦 Médicaments dans l'ordonnance ({{ prescriptionLines.length }})</h3>
          <ul class="lines-list">
            <li v-if="prescriptionLines.length === 0" class="empty-line">
              Aucun médicament ajouté pour le moment.
            </li>
            <li v-for="(line, index) in prescriptionLines" :key="index" class="line-item">
              <div class="line-info">
                <strong>{{ line.medicationName }}</strong> — {{ line.dosage }} ({{ line.frequency }}, {{ line.duration }})
                <div v-if="line.instructions" class="line-instructions">💡 {{ line.instructions }}</div>
              </div>
              <button @click="removeLocalLine(index)" class="btn-remove" title="Supprimer">✕</button>
            </li>
          </ul>
        </div>

        <div class="finalization-area">
          <label>📝 Notes du médecin (conseils, régime, etc.) :</label>
          <textarea v-model="finalNotes" rows="3" placeholder="Notes additionnelles pour le patient..."></textarea>
          
          <button
            @click="createOrdonnanceAndFinalize"
            :disabled="prescriptionLines.length === 0 || prescriptionStore.isLoading"
            class="btn-submit"
          >
            <span v-if="!prescriptionStore.isLoading">🚀 Finaliser et Enregistrer l'Ordonnance</span>
            <span v-else>Enregistrement en cours...</span>
          </button>
        </div>
      </section>

      <section v-if="selectedPatientId" class="section history-section">
        <h2>📜 Historique des prescriptions du patient</h2>
        <div v-if="prescriptionStore.isLoading" class="info-text">Chargement de l'historique...</div>
        
        <div v-else-if="patientPrescriptions.length" class="table-wrapper">
          <table class="ordonnances-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Docteur</th>
                <th>Contenu</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ord in patientPrescriptions" :key="ord.id">
                <td>{{ formatDate(ord.created_at) }}</td>
                <td>Dr. {{ ord.doctor?.user?.last_name || 'Non spécifié' }}</td>
                <td>
                  <span v-if="ord.lines?.length">
                    {{ ord.lines[0].medicament_name }} {{ ord.lines.length > 1 ? '(+' + (ord.lines.length - 1) + ')' : '' }}
                  </span>
                  <span v-else class="info-text">Vide</span>
                </td>
                <td><span :class="getStatusClass(ord.status)">{{ ord.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="info-text">Aucune prescription antérieure.</p>
      </section>
    </div>
  </MedecinLayout>
</template>

<script setup>
import MedecinLayout from '@/layouts/MedecinLayout.vue'
import { ref, computed, onMounted } from 'vue'
import { usePatientStore } from '@/stores/patientStore'
import { usePrescriptionStore } from '@/stores/prescriptionStore'
import { useRoute } from 'vue-router' 

// --- Initialisation ---
const patientStore = usePatientStore()
const prescriptionStore = usePrescriptionStore()
const route = useRoute()

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
const doctorIdFromRoute = computed(() => {
    const id = route.params.id || route.params.doctorId; 
    return id ? parseInt(id) : null;
});

const filteredPatients = computed(() => {
    let source = patientStore.patients?.data || patientStore.patients || [];
    if (!Array.isArray(source)) return [];
    
    const query = searchPatient.value.trim().toLowerCase();
    if (!query) return source.slice(0, 20);

    return source.filter(p => {
        const fullName = `${p.user?.first_name || ''} ${p.user?.last_name || ''}`.toLowerCase();
        return fullName.includes(query) || p.user?.email?.toLowerCase().includes(query) || String(p.id).includes(query);
    });
});

const selectedPatient = computed(() => {
    let source = patientStore.patients?.data || patientStore.patients || [];
    return source.find(p => p.id === selectedPatientId.value);
});

const patientPrescriptions = computed(() => prescriptionStore.prescriptions);

// --- Méthodes ---
function fetchPatientHistory() {
    prescriptionLines.value = [];
    finalNotes.value = '';
    prescriptionStore.clearMessages(); 
    if (selectedPatientId.value) {
        prescriptionStore.fetchPatientPrescriptions(selectedPatientId.value);
    }
}

function addLocalLine() {
    if (!newLine.value.medicationName || !newLine.value.dosage || !newLine.value.frequency || !newLine.value.duration) {
        alert('Veuillez remplir tous les champs obligatoires (*)');
        return;
    }

    prescriptionLines.value.push({ ...newLine.value });
    // Reset du formulaire de ligne
    newLine.value = { medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' };
}

function removeLocalLine(index) {
    prescriptionLines.value.splice(index, 1);
}

async function createOrdonnanceAndFinalize() {
    const currentDoctorId = doctorIdFromRoute.value;

    if (!currentDoctorId || !selectedPatientId.value) {
        prescriptionStore.setError("Données manquantes (Docteur ou Patient).");
        return;
    }

    // Mapping vers le format attendu par l'API (prescription_lines)
    const payload = {
        notes: finalNotes.value,
        prescription_lines: prescriptionLines.value.map(line => ({
            medicament_name: line.medicationName, // Attention : vérifier si l'API attend medicament_name ou medication_name
            dosage: line.dosage,
            frequency: line.frequency,
            duration: line.duration,
            instructions: line.instructions || null
        }))
    };

    const success = await prescriptionStore.createPrescription(currentDoctorId, selectedPatientId.value, payload);
    
    if (success) {
        prescriptionLines.value = [];
        finalNotes.value = '';
        fetchPatientHistory(); // Rafraîchir l'historique en bas
    }
}

const formatDate = (date) => date ? new Date(date).toLocaleDateString('fr-FR') : 'N/A';

const getStatusClass = (status) => {
    const s = status?.toLowerCase();
    if (s === 'active') return 'status-active';
    if (['draft', 'pending'].includes(s)) return 'status-draft';
    return 'status-inactive';
}

onMounted(() => {
    patientStore.allPatient();
})
</script>

<style scoped>
.ordonnances-page { max-width: 1000px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
.title { color: #1c325f; border-bottom: 3px solid #0040d0; padding-bottom: 10px; margin-bottom: 30px; }

.section { background: white; border-radius: 12px; padding: 25px; margin-bottom: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }

.patient-selection-section { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #eef2ff; }
.patient-highlight { color: #0040d0; text-decoration: underline; }

.new-line-form { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; }
.grid-form { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
.full { grid-column: span 2; }

label { font-weight: 600; color: #475569; font-size: 0.9rem; margin-bottom: 5px; display: block; }
input, select, textarea { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; transition: border 0.2s; }
input:focus { border-color: #0040d0; outline: none; }

.btn-add-line { grid-column: span 2; background: #059669; color: white; border: none; padding: 12px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.2s; }
.btn-add-line:hover { background: #047857; }

.line-item { display: flex; justify-content: space-between; align-items: center; background: #fff; border: 1px solid #e2e8f0; padding: 12px; margin-bottom: 10px; border-radius: 6px; border-left: 5px solid #0040d0; }
.line-instructions { font-size: 0.85rem; color: #64748b; margin-top: 4px; }
.btn-remove { background: #ef4444; color: white; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; }

.btn-submit { width: 100%; background: #1c325f; color: white; padding: 15px; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: bold; cursor: pointer; margin-top: 20px; transition: 0.3s; }
.btn-submit:hover:not(:disabled) { background: #0040d0; transform: translateY(-2px); }
.btn-submit:disabled { background: #94a3b8; cursor: not-allowed; }

.message-success { background: #dcfce7; color: #166534; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #bbf7d0; }
.message-error { background: #fee2e2; color: #991b1b; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #fecaca; }

.ordonnances-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
.ordonnances-table th { background: #f1f5f9; text-align: left; padding: 12px; font-size: 0.9rem; }
.ordonnances-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; }

.status-active { color: #059669; font-weight: bold; }
.status-draft { color: #d97706; }
.status-inactive { color: #94a3b8; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>