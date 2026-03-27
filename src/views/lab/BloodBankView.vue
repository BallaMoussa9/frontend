<template>
  <LabLayout>
    <section class="action-card">
      <header class="section-header">
        <div class="header-with-icon">
          <Activity :size="20" />
          <h2>Enregistrer une nouvelle poche (Entrée Stock)</h2>
        </div>
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
        <div class="header-with-icon">
          <Package :size="20" />
          <h2>Inventaire de la Banque de Sang</h2>
        </div>
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
  </LabLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useLabStore } from '@/stores/labStore'
import { usePatientStore } from '@/stores/patientStore'
import { Activity, Package, Users } from 'lucide-vue-next'
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

.action-card, .inventory-card { 
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 16px; 
  border-radius: 12px; 
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  margin: 1.5rem;
}

.form-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); 
  gap: 2rem; 
  margin-bottom: 1.5rem; 
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.25rem;
}

.form-group label {
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  display: block;
  line-height: 1.2;
}

.input-field { 
  width: 100%; 
  padding: 0.5rem 0.75rem; 
  border: 1px solid rgba(255, 255, 255, 0.2); 
  border-radius: 8px; 
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  color: white;
  transition: all 0.3s ease;
  margin: 0;
  min-height: 36px;
}

/* Padding réduit pour les inputs spécifiés */
.search-container .input-field,
.form-group:nth-child(2) .input-field,
.form-group:nth-child(3) .input-field,
.form-group:nth-child(4) .input-field,
.form-group:nth-child(5) .input-field {
  padding: 0.5rem 0.75rem;
  min-height: 36px;
}

.section-header {
  margin-bottom: 2rem;
}

.header-with-icon {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
}

.header-with-icon h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.header-with-icon svg {
  color: white;
}

.input-field::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.input-field:focus {
  outline: none;
  border-color: #2563eb;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 15px rgba(37, 99, 235, 0.3);
}

/* Styles Recherche */
.search-container { position: relative; }

.search-input.input-field {
  margin-bottom: 0.5rem;
}

.search-results {
  position: absolute;
  top: 100%; left: 0; right: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  z-index: 50; 
  list-style: none; 
  padding: 0; 
  margin: 0.5rem 0 0 0;
  max-height: 200px; 
  overflow-y: auto;
}

.search-results li { 
  padding: 1rem; 
  cursor: pointer; 
  border-bottom: 1px solid rgba(255, 255, 255, 0.1); 
  transition: background 0.3s ease;
  color: white;
}

.search-results li:last-child {
  border-bottom: none;
}

.search-results li:hover { 
  background: rgba(255, 255, 255, 0.1);
  padding-left: 1.5rem;
}

.blood-type { 
  background: rgba(239, 68, 68, 0.2); 
  color: #ef4444; 
  padding: 0.25rem 0.75rem; 
  border-radius: 12px; 
  font-size: 0.875rem; 
  font-weight: 600; 
  margin-left: 10px; 
}

.btn-save { 
  background: linear-gradient(135deg, #2563eb, #1e40af);
  color: white; 
  padding: 0.625rem 1rem; 
  border: none; 
  border-radius: 8px; 
  font-weight: 600; 
  cursor: pointer; 
  width: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
  margin-top: 0.75rem;
  font-size: 0.875rem;
  min-height: 36px;
}

.btn-save:hover:not(:disabled) { 
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
}

.btn-save:disabled { 
  background: rgba(255, 255, 255, 0.2); 
  cursor: not-allowed;
  transform: none;
}

.stock-table { 
  width: 100%; 
  border-collapse: collapse; 
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  overflow: hidden;
}

.stock-table th { 
  text-align: left; 
  padding: 0.75rem; 
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stock-table td { 
  padding: 0.75rem; 
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
}

.blood-badge { 
  background: rgba(239, 68, 68, 0.2); 
  color: #ef4444; 
  padding: 0.5rem 1rem; 
  border-radius: 12px; 
  font-weight: 700;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-pill { 
  padding: 0.5rem 1rem; 
  border-radius: 20px; 
  font-size: 0.75rem; 
  font-weight: 600;
  display: inline-block;
}

.status-pill.available { 
  background: rgba(34, 197, 94, 0.2); 
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-pill.used { 
  background: rgba(148, 163, 184, 0.2); 
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.status-pill.expired { 
  background: rgba(239, 68, 68, 0.2); 
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-pill.quarantined { 
  background: rgba(245, 158, 11, 0.2); 
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.expired-text { 
  color: #ef4444; 
  font-weight: bold; 
}
</style>