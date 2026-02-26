<template>
  <NurseLayout>
    <div class="patient-list-container">
      <header class="section-header">
        <h2>Liste des Patients</h2>

        <div class="search-box">
          <input
            type="text"
            v-model="patientStore.searchTerm"
            @input="handleSearchInput"
            placeholder="Rechercher..."
            class="search-input"
          />
          <i class="search-icon fas fa-search"></i>
        </div>
      </header>

      <div v-if="patientStore.error" class="alert alert-error">{{ patientStore.error }}</div>
      <div v-if="patientStore.success" class="alert alert-success">{{ patientStore.success }}</div>

      <div v-if="patientStore.loading" class="loading-indicator">
        <p>Chargement des patients...</p>
      </div>

      <div v-else class="table-responsive">
        <table class="patient-table">
          <thead>
            <tr>
              <th class="col-avatar"></th>
              <th class="col-id" @click="handleSortClick('id')">ID</th>
              <th @click="handleSortClick('user.last_name')">Nom complet</th>
              <th class="col-hide-sm" @click="handleSortClick('genre')">Sexe</th>
              <th class="col-hide-md">Âge</th>
              <th class="col-hide-sm">Localisation</th>
              <th class="col-hide-lg">Département</th>
              <th>Statut</th>
              <th class="col-hide-md">Dernière Consult.</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!sortedPatients || sortedPatients.length === 0">
              <td colspan="10" class="no-data-message">Aucun patient trouvé.</td>
            </tr>

            <template v-for="(patient, index) in sortedPatients" :key="patient?.id || index">
              <tr v-if="patient && patient.id">
                <td class="col-avatar">
                  <img :src="patient.user?.profile_photo || 'https://via.placeholder.com/40?text=P'" class="patient-avatar" />
                </td>
                <td class="col-id">{{ patient.id }}</td>
                <td class="patient-name-cell">
                  {{ patient.user ? `${patient.user.first_name} ${patient.user.last_name}` : 'N/A' }}
                </td>
                <td class="col-hide-sm">{{ patient.genre ? formatGender(patient.genre) : 'N/A' }}</td>
                <td class="col-hide-md">{{ calculateAge(patient.user?.birth_date) }} ans</td>
                <td class="col-hide-sm">
                  <span v-if="patient.bed?.room">Ch. {{ patient.bed.room.room_number }}</span>
                  <span v-else>N/A</span>
                </td>
                <td class="col-hide-lg">{{ patient.bed?.room?.department?.name || 'N/A' }}</td>
                <td>
                  <span class="status" :class="patient.status">{{ formatPatientStatus(patient.status) }}</span>
                </td>
                <td class="col-hide-md">{{ formatDate(patient.last_consultation_date) }}</td>
                <td>
                  <RouterLink :to="`/nurse/${nurseId}/patient/${patient.id}`" class="details-btn">
                    <i class="fas fa-file-medical"></i> <span>Dossier</span>
                  </RouterLink>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div class="pagination-controls" v-if="patientStore.patients?.last_page > 1">
        <button @click="patientStore.allPatient(patientStore.patients.current_page - 1)" :disabled="patientStore.patients.current_page === 1" class="pagination-button">
          <i class="fas fa-chevron-left"></i>
        </button>
        <span class="pagination-info">Page {{ patientStore.patients.current_page }} / {{ patientStore.patients.last_page }}</span>
        <button @click="patientStore.allPatient(patientStore.patients.current_page + 1)" :disabled="patientStore.patients.current_page === patientStore.patients.last_page" class="pagination-button">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </NurseLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { usePatientStore } from '@/stores/patientStore';
import NurseLayout from '@/layouts/NurseLayout.vue';

const route = useRoute();
const patientStore = usePatientStore();

const nurseId = route.params.idNurse || route.params.id || 'inconnu';
let searchTimeout = null;

// util: normalise une chaîne (minuscules + suppression accents)
const normalize = (s) => {
  if (s === null || s === undefined) return '';
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

// computed : mets les correspondants en haut
const sortedPatients = computed(() => {
  const raw = patientStore.patients?.data ?? [];
  // clone pour ne pas modifier l'array d'origine
  const patients = Array.isArray(raw) ? [...raw] : [];

  const term = normalize(patientStore.searchTerm);
  if (!term) return patients;

  const matching = [];
  const others = [];

  for (const p of patients) {
    // concaténation des champs à tester
    const fields = [
      p.id,
      p.user?.first_name,
      p.user?.last_name,
      p.user?.email,
      p.status,
      p.bed?.room?.room_number,
      p.bed?.bed_number,
      p.user?.phone
    ];
    const combined = fields.map(f => normalize(f)).join(' ');
    if (combined.includes(term)) matching.push(p);
    else others.push(p);
  }

  return [...matching, ...others];
});

// --- Tri des colonnes ---
const handleSortClick = async (column) => {
  patientStore.setSort(column);
  await patientStore.allPatient(1);
};

// --- Recherche avec debounce ---
const handleSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    // relance la requête serveur (si ton API fait la recherche côté serveur)
    await patientStore.allPatient(1);
  }, 300);
};

// --- Chargement initial ---
onMounted(async () => {
  patientStore.searchTerm = patientStore.searchTerm ?? '';
  await patientStore.allPatient();
});

// --- Fonctions utilitaires (inchangées) ---
const calculateAge = (birthDateString) => {
  if (!birthDateString) return 'N/A';
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('fr-FR');
};

const formatGender = (genre) => {
  if (!genre) return 'N/A';
  switch (genre.toLowerCase()) {
    case 'homme': case 'm': case 'male': return 'Homme';
    case 'femme': case 'f': case 'female': return 'Femme';
    default: return genre.charAt(0).toUpperCase() + genre.slice(1);
  }
};

const formatPatientStatus = (status) => {
  if (!status) return 'N/A';
  const statusMap = {
    actif: 'Actif',
    en_traitement: 'En Traitement',
    stable: 'Stable',
    critique: 'Critique',
    sorti: 'Sorti',
    archive: 'Archivé',
  };
  return statusMap[status] || status.replace('_', ' ');
};
</script>
<style scoped>
/* STRUCTURE PRINCIPALE */
.patient-list-container {
  padding: 20px;
  background-color: #f2f7fc;
  min-height: 100vh;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  gap: 15px;
}

/* TABLEAU RESPONSIVE */
.table-responsive {
  width: 100%;
  overflow-x: auto; /* Scroll horizontal si la table déborde */
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  -webkit-overflow-scrolling: touch;
}

.patient-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px; /* Empêche l'écrasement des colonnes vitales */
}

.patient-table th, .patient-table td {
  padding: 15px;
  border-bottom: 1px solid #f0f4f8;
  font-size: 14px;
}

.patient-table th {
  background-color: #f8fafc;
  color: #475569;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.05em;
}

/* RECHERCHE */
.search-box { position: relative; width: 100%; max-width: 350px; }
.search-input {
  width: 100%;
  padding: 12px 15px 12px 45px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  outline: none;
  transition: all 0.2s;
}
.search-input:focus { border-color: #0055aa; box-shadow: 0 0 0 3px rgba(0, 85, 170, 0.1); }
.search-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: #94a3b8; }

/* BADGES ET AVATARS */
.patient-avatar { width: 38px; height: 38px; border-radius: 10px; object-fit: cover; }
.status {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
}
.status.actif { background-color: #10b981; }
.status.critique { background-color: #ef4444; }
.status.stable { background-color: #3b82f6; }

/* BOUTONS */
.details-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #eff6ff;
  color: #1e40af;
  padding: 8px 12px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  white-space: nowrap;
}

/* MEDIA QUERIES POUR LE RESPONSIVE */
@media (max-width: 1024px) {
  .col-hide-lg { display: none; } /* Cache le département sur tablette */
}

@media (max-width: 768px) {
  .section-header { flex-direction: column; align-items: flex-start; }
  .search-box { max-width: 100%; }
  .col-hide-md { display: none; } /* Cache âge et dernière consult */
  .patient-list-container { padding: 15px; }
}

@media (max-width: 480px) {
  .col-hide-sm { display: none; } /* Cache sexe et localisation sur petit mobile */
  .col-id { display: none; }
  .details-btn span { display: none; } /* Garde seulement l'icône sur mini mobile */
  .patient-table { min-width: 100%; }
}
</style>