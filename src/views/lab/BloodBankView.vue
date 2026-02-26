<template>
  <LabLayout>
    <div class="blood-bank-container">
      <section class="action-card">
        <header class="section-header">
          <h2>🩸 Enregistrer une nouvelle poche (Entrée Stock)</h2>
        </header>
        
        <form @submit.prevent="handleSaveBlood" class="blood-form">
          <div class="form-grid">
            
            <div class="form-group search-container">
              <label>Rechercher le Patient (Donneur)</label>
              <div class="search-wrapper">
                <input 
                  type="text" 
                  v-model="query" 
                  @input="onSearchInput"
                  placeholder="Nom ou Prénom..." 
                  class="input-field search-input"
                  :class="{ 'has-selection': selectedPatient }"
                />
                
                <ul v-if="showResults && patientStore.searchResults.length" class="search-results">
                  <li v-for="p in patientStore.searchResults" :key="p.id" @click="selectPatient(p)">
                    <div class="patient-info">
                      <strong>{{ p.user?.last_name }} {{ p.user?.first_name }}</strong>
                      <span class="blood-type-tag">{{ p.group_sanguine || 'N/A' }}</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div v-if="selectedPatient" class="patient-selection-info">
                <p>✅ <strong>Patient :</strong> {{ selectedPatient.user?.last_name }} {{ selectedPatient.user?.first_name }}</p>
                <p>🩸 <strong>Groupe Sanguin :</strong> <span class="highlight">{{ selectedPatient.group_sanguine }}</span> (sera enregistré automatiquement)</p>
              </div>
            </div>

            <div class="form-group">
              <label>Numéro de l'unité (Code barre)</label>
              <input type="text" v-model="form.unit_number" placeholder="Ex: BAG-2026-001" required class="input-field" />
            </div>

            <div class="form-group">
              <label>Date de prélèvement</label>
              <input type="date" v-model="form.collection_date" required class="input-field" />
            </div>

            <div class="form-group">
              <label>Date d'expiration</label>
              <input type="date" v-model="form.expiration_date" required class="input-field" />
            </div>

            <div class="form-group">
              <label>Emplacement (Frigo/Tiroir)</label>
              <input type="text" v-model="form.location" placeholder="Ex: Frigo A1" class="input-field" />
            </div>

            <div class="form-group">
              <label>Statut initial</label>
              <select v-model="form.status" class="input-field" required>
                <option value="available">Disponible (Available)</option>
                <option value="quarantined">En Quarantaine (Quarantined)</option>
                <option value="used">Déjà Utilisée (Used)</option>
                <option value="expired">Expirée (Expired)</option>
              </select>
            </div>
          </div>

          <button type="submit" class="btn-save" :disabled="labStore.loading || !form.patient_id">
            {{ labStore.loading ? 'Enregistrement...' : 'Enregistrer dans la Banque' }}
          </button>
        </form>
      </section>

      <section class="inventory-card">
        <header class="section-header">
          <h2>📦 Inventaire de la Banque de Sang</h2>
        </header>

        <div class="table-wrapper">
          <table class="stock-table">
            <thead>
              <tr>
                <th>Unité #</th>
                <th>Groupe / Rh</th>
                <th>Donneur</th>
                <th>Expiration</th>
                <th>Lieu</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="unit in labStore.bloodStock" :key="unit.id">
                <td class="unit-code">{{ unit.unit_number }}</td>
                <td>
                  <span class="blood-badge">
                    {{ unit.blood_group }} ({{ unit.rh_factor }})
                  </span>
                </td>
                <td>{{ unit.patient?.user?.last_name }} {{ unit.patient?.user?.first_name }}</td>
                <td :class="{ 'expired-text': isExpired(unit.expiration_date) }">
                  {{ formatDate(unit.expiration_date) }}
                </td>
                <td>{{ unit.location || '-' }}</td>
                <td>
                  <span :class="['status-pill', unit.status]">
                    {{ translateStatus(unit.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </LabLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useLabStore } from '@/stores/labStore'
import { usePatientStore } from '@/stores/patientStore'
import LabLayout from '@/layouts/LabLayout.vue'

const labStore = useLabStore()
const patientStore = usePatientStore()

const query = ref('')
const showResults = ref(false)
const selectedPatient = ref(null)

const form = ref({
  patient_id: '',
  unit_number: '',
  collection_date: new Date().toISOString().split('T')[0],
  expiration_date: '',
  location: '',
  status: 'available' // Valeur par défaut de ton SQL
})

onMounted(async () => {
  await labStore.fetchBloodStock()
})

const onSearchInput = async () => {
  if (query.value.length >= 3) {
    showResults.value = true
    await patientStore.searchPatients(query.value)
  } else {
    showResults.value = false
  }
}

const selectPatient = (patient) => {
  selectedPatient.value = patient
  form.value.patient_id = patient.id
  query.value = `${patient.user?.last_name} ${patient.user?.first_name}`
  showResults.value = false
}

const handleSaveBlood = async () => {
  const success = await labStore.addBloodUnit(form.value)
  if (success) {
    form.value.unit_number = ''
    form.value.patient_id = ''
    query.value = ''
    selectedPatient.value = null
    alert("Unité enregistrée avec succès.")
  }
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '-'
const isExpired = (d) => new Date(d) < new Date()

// TRADUCTION POUR L'AFFICHAGE (basée sur ton ENUM)
const translateStatus = (s) => {
  const map = {
    available: 'Disponible',
    used: 'Utilisée',
    expired: 'Expirée',
    quarantined: 'Quarantaine'
  }
  return map[s] || s
}
</script>

<style scoped>
/* Ajout de styles pour la clarté du groupe sanguin */
.patient-selection-info {
  margin-top: 10px;
  padding: 10px;
  background: #f0f7ff;
  border-left: 4px solid #0040d0;
  border-radius: 4px;
  font-size: 13px;
}
.highlight { color: #e53e3e; font-weight: bold; font-size: 15px; }

.status-pill.available { background: #c6f6d5; color: #22543d; }
.status-pill.used { background: #edf2f7; color: #4a5568; }
.status-pill.expired { background: #fed7d7; color: #822727; }
.status-pill.quarantined { background: #feebc8; color: #7b341e; }

/* ... (conserve tes autres styles) ... */

.blood-bank-container { display: flex; flex-direction: column; gap: 2rem; padding: 20px; }
.action-card, .inventory-card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }

.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem; }
.input-field { width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; }

/* Styles Recherche */
.search-container { position: relative; }
.search-results {
  position: absolute;
  top: 100%; left: 0; right: 0;
  background: white; border: 1px solid #e5e7eb; border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  z-index: 50; list-style: none; padding: 0; margin-top: 4px;
  max-height: 200px; overflow-y: auto;
}
.search-results li { padding: 12px; cursor: pointer; border-bottom: 1px solid #f3f4f6; transition: background 0.2s; }
.search-results li:hover { background: #f9fafb; }
.blood-type { background: #fee2e2; color: #b91c1c; padding: 2px 6px; border-radius: 4px; font-size: 12px; margin-left: 10px; }
.selected-badge { margin-top: 8px; color: #059669; font-size: 13px; }

.btn-save { background: #dc2626; color: white; padding: 12px 24px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; width: 100%; }
.btn-save:hover:not(:disabled) { background: #b91c1c; }
.btn-save:disabled { background: #fca5a5; cursor: not-allowed; }

.stock-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
.stock-table th { text-align: left; padding: 12px; background: #f9fafb; color: #4b5563; border-bottom: 2px solid #e5e7eb; }
.stock-table td { padding: 12px; border-bottom: 1px solid #f3f4f6; }
.blood-badge { background: #fef2f2; color: #991b1b; padding: 4px 10px; border-radius: 6px; font-weight: 800; border: 1px solid #fee2e2; }
.status-pill { padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 500; }
.status-pill.available { background: #d1fae5; color: #065f46; }
.status-pill.quarantined { background: #fef3c7; color: #92400e; }
.expired-text { color: #dc2626; font-weight: bold; }
</style>