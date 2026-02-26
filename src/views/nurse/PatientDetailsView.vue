<template>
  <NurseLayout>
    <div class="patient-details-container">
      
      <div v-if="patientStore.loading || globalLoading" class="loading-overlay">
        <div class="spinner"></div>
        <p>Récupération du dossier médical...</p>
      </div>

      <div v-else-if="patientStore.error" class="alert alert-error">
        <i class="fas fa-exclamation-triangle"></i> {{ patientStore.error }}
      </div>

      <template v-else-if="patient && patient.id">
        <header class="patient-profile-header">
          <div class="profile-main">
            <div class="avatar-circle">
              {{ patient.user?.first_name?.charAt(0) }}{{ patient.user?.last_name?.charAt(0) }}
            </div>
            <div class="profile-info">
              <h2>{{ patient.user?.first_name }} {{ patient.user?.last_name }}</h2>
              <div class="badges">
                <span class="badge id">#{{ patient.id }}</span>
                <span class="badge gender" :class="patient.genre">{{ formatGender(patient.genre) }}</span>
                <span class="badge age">{{ calculateAge(patient.user?.birth_date) }} ans</span>
                <span class="badge blood">{{ patient.group_sanguine || 'N/A' }}</span>
              </div>
            </div>
          </div>
          <button @click="handleUpdate" class="save-btn" :disabled="isUpdating">
            <i class="fas" :class="isUpdating ? 'fa-spinner fa-spin' : 'fa-check-circle'"></i>
            <span>{{ isUpdating ? 'Mise à jour...' : 'Enregistrer' }}</span>
          </button>
        </header>

        <div v-if="patientStore.success" class="alert alert-success">
          <i class="fas fa-check"></i> {{ patientStore.success }}
        </div>

        <div class="dashboard-grid">
          
          <div class="main-column">
            <section class="card">
              <div class="card-header"><i class="fas fa-heartbeat"></i> Dernières Constantes</div>
              <div class="card-body">
                <div v-if="patient.latest_vitals" class="vitals-summary-grid">
                  <div class="vital-item">
                    <span class="v-label">Tension</span>
                    <span class="v-value">{{ patient.latest_vitals.blood_pressure_systolic }}/{{ patient.latest_vitals.blood_pressure_diastolic }}</span>
                    <span class="v-unit">mmHg</span>
                  </div>
                  <div class="vital-item">
                    <span class="v-label">Pouls</span>
                    <span class="v-value">{{ patient.latest_vitals.heart_rate }}</span>
                    <span class="v-unit">bpm</span>
                  </div>
                  <div class="vital-item">
                    <span class="v-label">Temp.</span>
                    <span class="v-value">{{ patient.latest_vitals.temperature }}</span>
                    <span class="v-unit">°C</span>
                  </div>
                  <div class="vital-item">
                    <span class="v-label">SpO₂</span>
                    <span class="v-value">{{ patient.latest_vitals.oxygen_saturation }}</span>
                    <span class="v-unit">%</span>
                  </div>
                </div>
                <p v-else class="empty-state">Aucune constante récente.</p>
              </div>
            </section>

            <section class="card">
              <div class="card-header"><i class="fas fa-notes-medical"></i> Alertes & Infos</div>
              <div class="card-body">
                <div v-if="patient.allergies" class="medical-warning">
                  <strong>Allergies :</strong> {{ patient.allergies }}
                </div>
                <div class="medical-info">
                  <p><strong>Antécédents :</strong> {{ patient.medical_history || 'Aucun.' }}</p>
                  <p><strong>Pathologies :</strong> {{ patient.maladies_chroniques || 'Aucune.' }}</p>
                </div>
              </div>
            </section>
          </div>

          <div class="side-column">
            <section class="card">
              <div class="card-header"><i class="fas fa-hospital-user"></i> Hospitalisation</div>
              <div class="card-body">
                <div class="input-group">
                  <label>Statut clinique</label>
                  <select v-model="patientData.status">
                    <option value="actif">Actif</option>
                    <option value="en_traitement">En Traitement</option>
                    <option value="stable">Stable</option>
                    <option value="critique">Critique</option>
                    <option value="sorti">Sorti</option>
                  </select>
                </div>

                <div class="input-group">
                  <label>Lit assigné</label>
                  <select v-model.number="patientData.bed_id">
                    <option :value="null">-- Libérer le lit --</option>
                    <optgroup v-for="group in groupedAvailableBeds" :key="group.departmentId" :label="group.departmentName">
                      <option v-for="bed in group.beds" :key="bed.id" :value="bed.id">
                        Ch. {{ bed.room?.room_number }} - Lit {{ bed.bed_number }}
                      </option>
                    </optgroup>
                  </select>
                </div>
              </div>
            </section>

            <section class="card">
              <div class="card-header"><i class="fas fa-weight"></i> Mesures</div>
              <div class="card-body dual-input">
                <div class="input-group">
                  <label>Poids (kg)</label>
                  <input type="number" step="0.1" v-model.number="patientData.poids" />
                </div>
                <div class="input-group">
                  <label>Taille (cm)</label>
                  <input type="number" step="0.1" v-model.number="patientData.taille" />
                </div>
              </div>
            </section>
          </div>
        </div>

        <section class="documents-section card">
          <div class="card-header"><i class="fas fa-file-medical"></i> Documents</div>
          <div class="card-body">
            <div v-if="patient.documents?.length" class="doc-list">
              <a v-for="(doc, index) in patient.documents" :key="index" :href="doc.url" target="_blank" class="doc-item">
                <i class="far fa-file-pdf"></i> {{ doc.name }}
              </a>
            </div>
            <p v-else class="empty-state">Aucun document.</p>
          </div>
        </section>
      </template>

      <div v-else class="empty-state-container">
        <p>Patient introuvable.</p>
      </div>
    </div>
  </NurseLayout>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRoute } from "vue-router";
import { usePatientStore } from "@/stores/patientStore";
import { useBedStore } from "@/stores/bedStore";
import NurseLayout from "@/layouts/NurseLayout.vue"; // VÉRIFIE CE CHEMIN !

const route = useRoute();
const patientStore = usePatientStore();
const bedStore = useBedStore();

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

// LOGIQUE DES LITS
const groupedAvailableBeds = computed(() => {
    let bedsToDisplay = [...(bedStore.getAvailableBeds || [])];
    if (patient.value.bed_id && patient.value.bed && !bedsToDisplay.some(b => b.id === patient.value.bed_id)) {
        bedsToDisplay.push(patient.value.bed);
    }
    const departmentsMap = bedsToDisplay.reduce((acc, bed) => {
        const department = bed.room?.department;
        if (!department) return acc;
        const key = department.id;
        if (!acc[key]) {
            acc[key] = { departmentId: key, departmentName: department.name, beds: [] };
        }
        acc[key].beds.push(bed);
        return acc;
    }, {});
    return Object.values(departmentsMap).sort((a, b) => a.departmentName.localeCompare(b.departmentName));
});

// HELPERS
const calculateAge = (birthDateString) => {
  if (!birthDateString) return "N/A";
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

const formatGender = (genre) => {
  if (!genre) return 'N/A';
  const g = genre.toLowerCase();
  if (['homme', 'm', 'male'].includes(g)) return 'Homme';
  if (['femme', 'f', 'female'].includes(g)) return 'Femme';
  return genre;
};

// ACTIONS
const loadPatientData = async (patientId) => {
  if (!patientId) return;
  globalLoading.value = true;
  try {
    await patientStore.onePatient(patientId);
    if (patientStore.currentPatient) {
      patient.value = patientStore.currentPatient;
      patientData.value.status = patient.value.status || 'actif';
      patientData.value.poids = patient.value.poids ? parseFloat(patient.value.poids) : null;
      patientData.value.taille = patient.value.taille ? parseFloat(patient.value.taille) : null;
      const currentBedId = patient.value.bed_id ? Number(patient.value.bed_id) : null;
      patientData.value.bed_id = currentBedId;
      previousBedId.value = currentBedId;
      await bedStore.fetchBeds();
    }
  } finally {
    globalLoading.value = false;
  }
};

const handleUpdate = async () => {
  isUpdating.value = true;
  const currentBedId = patientData.value.bed_id;
  const oldBedId = previousBedId.value;
  const dataToUpdate = {};

  if (patientData.value.status !== patient.value.status) dataToUpdate.status = patientData.value.status;
  if (patientData.value.poids !== parseFloat(patient.value.poids)) dataToUpdate.poids = patientData.value.poids;
  if (patientData.value.taille !== parseFloat(patient.value.taille)) dataToUpdate.taille = patientData.value.taille;
  if (currentBedId !== oldBedId) dataToUpdate.bed_id = currentBedId;

  try {
    if (currentBedId !== oldBedId) {
        if (oldBedId) await bedStore.updateBed(oldBedId, { status: 'available' });
        if (currentBedId) await bedStore.updateBed(currentBedId, { status: 'occupied' });
    }
    const success = await patientStore.updatePatient(idPatient.value, dataToUpdate);
    if (success) await loadPatientData(idPatient.value);
  } finally {
    isUpdating.value = false;
  }
};

onMounted(() => loadPatientData(idPatient.value));
watch(() => route.params.idPatient, (newId) => { if (newId) loadPatientData(newId); });
</script>

<style scoped>
/* CSS RESPONSIVE DESIGN */
.patient-details-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  background-color: #f4f7fa;
  min-height: 100vh;
}

/* HEADER RESPONSIVE */
.patient-profile-header {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  margin-bottom: 1.5rem;
}

.profile-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
}

.avatar-circle {
  width: 72px;
  height: 72px;
  background: #e0e7ff;
  color: #4f46e5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.badge {
  padding: 4px 12px;
  background: #f1f5f9;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.save-btn {
  width: 100%;
  background: #4f46e5;
  color: white;
  padding: 1rem;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
}

/* GRILLE PRINCIPALE */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.card {
  background: white;
  border-radius: 12px;
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
}

.card-header {
  padding: 1rem;
  font-weight: bold;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-body { padding: 1rem; }

/* VITALS GRID */
.vitals-summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.vital-item {
  padding: 0.75rem;
  background: #fcfdfe;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  text-align: center;
}

.v-value { font-size: 1.1rem; font-weight: 800; display: block; }
.v-label { font-size: 0.7rem; color: #64748b; text-transform: uppercase; }

.input-group { margin-bottom: 1rem; }
.input-group label { display: block; font-size: 0.85rem; margin-bottom: 0.3rem; font-weight: 600; }

input, select {
  width: 100%;
  padding: 0.7rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
}

.dual-input {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* --- MEDIA QUERIES (TABLETTES & PC) --- */
@media (min-width: 768px) {
  .patient-profile-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .profile-main {
    flex-direction: row;
    text-align: left;
  }

  .save-btn { width: auto; padding: 0.7rem 1.5rem; }

  .dashboard-grid {
    grid-template-columns: 1.5fr 1fr;
  }

  .vitals-summary-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .dual-input { flex-direction: row; }
}

/* ALERTS */
.alert { padding: 1rem; border-radius: 8px; margin-bottom: 1rem; }
.alert-error { background: #fee2e2; color: #b91c1c; }
.alert-success { background: #dcfce7; color: #15803d; }

.medical-warning {
  background: #fff1f2;
  color: #be123c;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}
</style>