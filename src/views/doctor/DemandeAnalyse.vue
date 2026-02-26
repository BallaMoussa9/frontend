<template>
  <MedecinLayout>
    <div class="analysis-wrapper">
      <div class="stats-bar">
        <div class="stat-card">
          <i class="fas fa-microscope text-blue"></i>
          <div>
            <span class="stat-value">{{ labStore.labRequests.length }}</span>
            <span class="stat-label">Total Demandes</span>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-clock text-orange"></i>
          <div>
            <span class="stat-value">{{ pendingCount }}</span>
            <span class="stat-label">En attente</span>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-spinner fa-spin text-cyan"></i>
          <div>
            <span class="stat-value">{{ inProgressCount }}</span>
            <span class="stat-label">En cours</span>
          </div>
        </div>
        <button class="btn-primary-lg" @click="openModal">
          <i class="fas fa-plus-circle"></i> Nouvelle Prescription
        </button>
      </div>

      <div class="filter-section">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input v-model="searchQuery" placeholder="Rechercher un patient ou une analyse..." />
        </div>
      </div>

      <div class="main-card">
        <div v-if="labStore.loading && !showModal" class="loading-state">Chargement...</div>
        <div class="table-responsive">
          <table class="modern-table">
            <thead>
              <tr>
                <th>Réf.</th>
                <th>Patient</th>
                <th>Analyses prescrites</th>
                <th>Prescrit le</th>
                <th>Statut</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="req in filteredRequests" :key="req.id">
                <td class="ref-cell">#{{ req.id }}</td>
                <td>
                  <div class="patient-info">
                    <div class="avatar-sm">{{ getPatientFullName(req.patient)?.charAt(0) }}</div>
                    <span>{{ getPatientFullName(req.patient) }}</span>
                  </div>
                </td>
                <td>
                  <div class="tags-container">
                    <span class="analysis-tag">{{ req.name }}</span>
                  </div>
                </td>
                <td>{{ formatDate(req.created_at) }}</td>
                <td>
                  <span :class="['status-pill', req.status]">
                    <template v-if="req.status === 'pending'">⏳ En attente</template>
                    <template v-else-if="req.status === 'in_progress'">⚙️ En cours</template>
                    <template v-else-if="req.status === 'completed'">✅ Terminé</template>
                    <template v-else>{{ req.status }}</template>
                  </span>
                </td>
                <td class="text-right">
                  <button class="btn-icon view" title="Détails"><i class="fas fa-file-alt"></i></button>
                  <button class="btn-icon print" title="Imprimer"><i class="fas fa-print"></i></button>
                </td>
              </tr>
              <tr v-if="filteredRequests.length === 0 && !labStore.loading">
                <td colspan="6" style="text-align: center; padding: 20px; color: #64748b;">Aucune demande trouvée.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="showModal" class="modal-backdrop">
        <div class="modal-window large">
          <div class="modal-header-gradient">
            <div class="title-group">
              <i class="fas fa-notes-medical"></i>
              <h3>Prescription Médicale d'Analyse</h3>
            </div>
            <button @click="showModal = false" class="close-modal">&times;</button>
          </div>

          <div class="modal-body-scroll">
            <div class="form-section">
              <label><i class="fas fa-user-check"></i> Patient concerné</label>
              <div class="custom-select-wrapper" style="position: relative;">
                <input 
                  v-model="patientSearch" 
                  placeholder="Tapez le nom du patient (min. 3 lettres)..." 
                  class="styled-input"
                  @input="handlePatientSearch"
                  @focus="showPatientList = true"
                />
                <div v-if="showPatientList && patientStore.searchResults.length" class="dropdown-list">
                  <div 
                    v-for="p in patientStore.searchResults" 
                    :key="p.id" 
                    @click="selectPatient(p)"
                    class="dropdown-item"
                  >
                    <strong>{{ p.user?.first_name }} {{ p.user?.last_name }}</strong> 
                    <small>(ID: {{ p.id }})</small>
                  </div>
                </div>
              </div>
              <div v-if="selectedPatient" class="selected-badge">
                Patient sélectionné : <strong>{{ selectedPatient.user?.first_name }} {{ selectedPatient.user?.last_name }}</strong>
                <i class="fas fa-check-circle"></i>
              </div>
            </div>

            <div class="form-section">
              <div class="section-header">
                <label><i class="fas fa-list-ul"></i> Examens demandés</label>
                <div class="quick-suggestions">
                  <span>Suggestions :</span>
                  <button @click="addSuggested('NFS', 'Sang')" class="btn-suggest">NFS</button>
                  <button @click="addSuggested('Glycémie', 'Sang')" class="btn-suggest">Glycémie</button>
                  <button @click="addSuggested('ECBU', 'Urine')" class="btn-suggest">ECBU</button>
                </div>
              </div>

              <div class="analysis-items-list">
                <div v-for="(item, index) in newPrescription.items" :key="index" class="analysis-row">
                  <div class="row-num">{{ index + 1 }}</div>
                  <input v-model="item.name" placeholder="Nom de l'examen" class="flex-2" />
                  <select v-model="item.type" class="flex-1">
                    <option value="Sang">Sang</option>
                    <option value="Urine">Urine</option>
                    <option value="Selles">Selles</option>
                    <option value="Autre">Autre</option>
                  </select>
                  <button @click="removeItem(index)" class="btn-del" :disabled="newPrescription.items.length === 1">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <button @click="addItem" class="btn-add-dashed">
                <i class="fas fa-plus"></i> Ajouter un examen supplémentaire
              </button>
            </div>
          </div>

          <div class="modal-footer-styled">
            <button @click="showModal = false" class="btn-link">Annuler</button>
            <button @click="submitPrescription" class="btn-confirm" :disabled="labStore.loading || !selectedPatient">
              <span v-if="!labStore.loading"><i class="fas fa-paper-plane"></i> Envoyer au Laboratoire</span>
              <span v-else><i class="fas fa-spinner fa-spin"></i> Transmission...</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </MedecinLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import MedecinLayout from '@/layouts/MedecinLayout.vue'
import { useLabStore } from '@/stores/labStore'
import { usePatientStore } from '@/stores/patientStore'

const labStore = useLabStore()
const patientStore = usePatientStore()

// --- DATA ---
const showModal = ref(false)
const searchQuery = ref('')
const patientSearch = ref('')
const showPatientList = ref(false)
const selectedPatient = ref(null)

const newPrescription = reactive({
  items: [{ name: '', type: 'Sang' }]
})

// --- INITIALISATION ---
onMounted(() => {
  labStore.listLabRequests()
})

// --- COMPUTED ---
const filteredRequests = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return labStore.labRequests.filter(r => {
    const pName = getPatientFullName(r.patient).toLowerCase()
    return pName.includes(query) || r.name?.toLowerCase().includes(query)
  })
})

const pendingCount = computed(() => 
  labStore.labRequests.filter(r => r.status === 'pending').length
)

// NOUVEAU : Compteur pour le statut 'in_progress'
const inProgressCount = computed(() => 
  labStore.labRequests.filter(r => r.status === 'in_progress').length
)

// --- METHODS ---
const openModal = () => {
  showModal.value = true
  selectedPatient.value = null
  patientSearch.value = ''
  newPrescription.items = [{ name: '', type: 'Sang' }]
}

let searchTimeout = null
const handlePatientSearch = () => {
  clearTimeout(searchTimeout)
  if (patientSearch.value.length >= 3) {
    searchTimeout = setTimeout(() => {
      patientStore.searchPatients(patientSearch.value)
      showPatientList.value = true
    }, 500)
  }
}

const selectPatient = (p) => {
  selectedPatient.value = p
  patientSearch.value = `${p.user?.first_name} ${p.user?.last_name}`
  showPatientList.value = false
}

const addItem = () => newPrescription.items.push({ name: '', type: 'Sang' })
const removeItem = (idx) => newPrescription.items.splice(idx, 1)

const addSuggested = (name, type) => {
  if (newPrescription.items.length === 1 && !newPrescription.items[0].name) {
    newPrescription.items[0] = { name, type }
  } else {
    newPrescription.items.push({ name, type })
  }
}

const submitPrescription = async () => {
  if (!selectedPatient.value) return alert("Veuillez sélectionner un patient.");
  const validItems = newPrescription.items.filter(i => i.name.trim() !== '');
  if (validItems.length === 0) return alert("Saisissez au moins un examen.");

  const payload = {
    patient_id: selectedPatient.value.id,
    laboratory_id: 1, 
    status: 'pending',
    items: validItems.map(item => ({ name: item.name, type: item.type }))
  };

  const success = await labStore.createAnalyseRequest(payload);
  if (success) {
    showModal.value = false;
    alert("Prescription transmise avec succès au laboratoire.");
    await labStore.listLabRequests(); 
  } else {
    alert("Erreur : " + (labStore.error || "Problème de validation backend"));
  }
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '-'
const getPatientFullName = (p) => p?.user ? `${p.user.first_name} ${p.user.last_name}` : 'Inconnu'
</script>

<style scoped>
.analysis-wrapper { padding: 10px; }
.loading-state { text-align: center; padding: 10px; color: #3b82f6; font-weight: bold; }

/* Dashboard Cards */
.stats-bar { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 25px; }
.stat-card { background: white; padding: 18px; border-radius: 15px; display: flex; align-items: center; gap: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.stat-card i { font-size: 1.8rem; }
.text-blue { color: #3b82f6; }
.text-orange { color: #f97316; }
.text-cyan { color: #0891b2; } /* Pour In Progress */

.stat-value { display: block; font-size: 1.4rem; font-weight: 800; color: #1e293b; }
.stat-label { color: #64748b; font-size: 0.8rem; }

.btn-primary-lg { background: linear-gradient(135deg, #3b82f6, #1e3a8a); color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; padding: 12px; }

/* Table & Status Pills */
.main-card { background: white; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); overflow: hidden; }
.modern-table { width: 100%; border-collapse: collapse; }
.modern-table th { background: #f8fafc; padding: 15px; text-align: left; color: #475569; font-size: 0.75rem; text-transform: uppercase; }
.modern-table td { padding: 15px; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }

/* RECTIFICATION DES STATUS PILLS */
.status-pill { padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; display: inline-block; }

.status-pill.pending { 
  background: #fff7ed; 
  color: #c2410c; 
  border: 1px solid #ffedd5;
}
.status-pill.in_progress { 
  background: #f0f9ff; 
  color: #0369a1; 
  border: 1px solid #e0f2fe;
}
.status-pill.completed { 
  background: #f0fdf4; 
  color: #15803d; 
  border: 1px solid #dcfce7;
}

/* Modal UI */
.modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 3000; }
.modal-window.large { width: 95%; max-width: 800px; background: #f8fafc; border-radius: 20px; overflow: hidden; }
.modal-header-gradient { background: linear-gradient(90deg, #0f172a, #1e293b); color: white; padding: 20px; display: flex; justify-content: space-between; }
.modal-body-scroll { padding: 25px; max-height: 70vh; overflow-y: auto; }
.form-section { margin-bottom: 25px; }
.styled-input { width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; }
.dropdown-list { background: white; border: 1px solid #e2e8f0; border-radius: 10px; position: absolute; width: 100%; z-index: 10; box-shadow: 0 10px 15px rgba(0,0,0,0.1); }
.dropdown-item { padding: 10px; cursor: pointer; border-bottom: 1px solid #f1f5f9; }
.dropdown-item:hover { background: #f8fafc; }
.analysis-row { display: flex; gap: 10px; margin-bottom: 10px; align-items: center; }
.flex-2 { flex: 2; } .flex-1 { flex: 1; }
.btn-add-dashed { width: 100%; padding: 12px; border: 2px dashed #cbd5e1; background: transparent; border-radius: 10px; cursor: pointer; }
.modal-footer-styled { padding: 20px; background: white; display: flex; justify-content: flex-end; gap: 15px; border-top: 1px solid #e2e8f0; }
.btn-confirm { background: #3b82f6; color: white; border: none; padding: 12px 25px; border-radius: 10px; font-weight: 700; cursor: pointer; }
</style>