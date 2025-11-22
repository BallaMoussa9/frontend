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
            placeholder="Rechercher par nom, ID, statut..."
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

      <table v-else class="patient-table">
        <thead>
          <tr>
            <th style="width: 40px;"></th>
            <th style="width: 80px;" @click="handleSortClick('id')" :class="{ 'sortable': true, 'active': patientStore.sortBy === 'id', 'asc': patientStore.sortDirection === 'asc', 'desc': patientStore.sortDirection === 'desc' }">
                ID <i v-if="patientStore.sortBy === 'id'" :class="{'fas': true, 'fa-sort-up': patientStore.sortDirection === 'asc', 'fa-sort-down': patientStore.sortDirection === 'desc'}"></i>
                <i v-else class="fas fa-sort"></i>
            </th>
            <th @click="handleSortClick('user.last_name')" :class="{ 'sortable': true, 'active': patientStore.sortBy === 'user.last_name', 'asc': patientStore.sortDirection === 'asc', 'desc': patientStore.sortDirection === 'desc' }">
                Nom complet <i v-if="patientStore.sortBy === 'user.last_name'" :class="{'fas': true, 'fa-sort-up': patientStore.sortDirection === 'asc', 'fa-sort-down': patientStore.sortDirection === 'desc'}"></i>
                <i v-else class="fas fa-sort"></i>
            </th>
            <th @click="handleSortClick('genre')" :class="{ 'sortable': true, 'active': patientStore.sortBy === 'genre', 'asc': patientStore.sortDirection === 'asc', 'desc': patientStore.sortDirection === 'desc' }">
                Sexe <i v-if="patientStore.sortBy === 'genre'" :class="{'fas': true, 'fa-sort-up': patientStore.sortDirection === 'asc', 'fa-sort-down': patientStore.sortDirection === 'desc'}"></i>
                <i v-else class="fas fa-sort"></i>
            </th>
            <th @click="handleSortClick('user.birth_date')" :class="{ 'sortable': true, 'active': patientStore.sortBy === 'user.birth_date', 'asc': patientStore.sortDirection === 'asc', 'desc': patientStore.sortDirection === 'desc' }">
                Âge <i v-if="patientStore.sortBy === 'user.birth_date'" :class="{'fas': true, 'fa-sort-up': patientStore.sortDirection === 'asc', 'fa-sort-down': patientStore.sortDirection === 'desc'}"></i>
                <i v-else class="fas fa-sort"></i>
            </th>
            <th @click="handleSortClick('bed.room.room_number')" :class="{ 'sortable': true, 'active': patientStore.sortBy === 'bed.room.room_number', 'asc': patientStore.sortDirection === 'asc', 'desc': patientStore.sortDirection === 'desc' }">
                Localisation (Ch./Lit) <i v-if="patientStore.sortBy === 'bed.room.room_number'" :class="{'fas': true, 'fa-sort-up': patientStore.sortDirection === 'asc', 'fa-sort-down': patientStore.sortDirection === 'desc'}"></i>
                <i v-else class="fas fa-sort"></i>
            </th>
            <th @click="handleSortClick('bed.room.department.name')" :class="{ 'sortable': true, 'active': patientStore.sortBy === 'bed.room.department.name', 'asc': patientStore.sortDirection === 'asc', 'desc': patientStore.sortDirection === 'desc' }">
                Département <i v-if="patientStore.sortBy === 'bed.room.department.name'" :class="{'fas': true, 'fa-sort-up': patientStore.sortDirection === 'asc', 'fa-sort-down': patientStore.sortDirection === 'desc'}"></i>
                <i v-else class="fas fa-sort"></i>
            </th>
            <th @click="handleSortClick('status')" :class="{ 'sortable': true, 'active': patientStore.sortBy === 'status', 'asc': patientStore.sortDirection === 'asc', 'desc': patientStore.sortDirection === 'desc' }">
                Statut <i v-if="patientStore.sortBy === 'status'" :class="{'fas': true, 'fa-sort-up': patientStore.sortDirection === 'asc', 'fa-sort-down': patientStore.sortDirection === 'desc'}"></i>
                <i v-else class="fas fa-sort"></i>
            </th>
            <th @click="handleSortClick('last_consultation_date')" :class="{ 'sortable': true, 'active': patientStore.sortBy === 'last_consultation_date', 'asc': patientStore.sortDirection === 'asc', 'desc': patientStore.sortDirection === 'desc' }">
                Dernière Consultation <i v-if="patientStore.sortBy === 'last_consultation_date'" :class="{'fas': true, 'fa-sort-up': patientStore.sortDirection === 'asc', 'fa-sort-down': patientStore.sortDirection === 'desc'}"></i>
                <i v-else class="fas fa-sort"></i>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!sortedPatients || sortedPatients.length === 0">
            <td colspan="10" class="no-data-message">
              Aucun patient trouvé.
              <span v-if="patientStore.searchTerm"> (Recherche: "{{ patientStore.searchTerm }}")</span>
            </td>
          </tr>

          <!-- Patients (les correspondants à la recherche apparaissent en premier) -->
          <template v-for="(patient, index) in sortedPatients" :key="patient?.id || index">
            <tr v-if="patient && patient.id">
              <td class="avatar-cell">
                <img
                  :src="patient.user?.profile_photo ? patient.user.profile_photo : 'https://via.placeholder.com/40?text=P'"
                  alt="Avatar"
                  class="patient-avatar"
                />
              </td>
              <td>{{ patient.id }}</td>
              <td class="patient-name-cell">
                {{ patient.user ? `${patient.user.first_name} ${patient.user.last_name}` : 'N/A' }}
              </td>

              <td>{{ patient.genre ? formatGender(patient.genre) : 'N/A' }}</td>

              <td>{{ calculateAge(patient.user?.birth_date) }} ans</td>
              <td>
                <span v-if="patient.bed?.room?.room_number && patient.bed?.bed_number">
                  Ch. {{ patient.bed.room.room_number }} / Lit {{ patient.bed.bed_number }}
                </span>
                <span v-else>
                  Non assigné
                </span>
              </td>
              <td>
                {{ patient.bed?.room?.department?.name || 'N/A' }}
              </td>
              <td>
                <span class="status" :class="patient.status">{{ formatPatientStatus(patient.status) }}</span>
              </td>
              <td>
                {{ patient.last_consultation_date ? formatDate(patient.last_consultation_date) : 'N/A' }}
              </td>
              <td>
                <RouterLink :to="`/nurse/${nurseId}/patient/${patient.id}`" class="details-btn">Voir dossier</RouterLink>
              </td>
            </tr>
          </template>
        </tbody>
      </table>

      <div class="pagination-controls" v-if="patientStore.patients?.last_page > 1">
        <button
          @click="patientStore.allPatient(patientStore.patients.current_page - 1)"
          :disabled="patientStore.patients.current_page === 1"
          class="pagination-button"
        >
          Précédent
        </button>
        <span class="pagination-info">
          Page {{ patientStore.patients.current_page }} sur {{ patientStore.patients.last_page }}
        </span>
        <button
          @click="patientStore.allPatient(patientStore.patients.current_page + 1)"
          :disabled="patientStore.patients.current_page === patientStore.patients.last_page"
          class="pagination-button"
        >
          Suivant
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
/* Styles identiques à ta version, inchangés */
.patient-list-container { padding: 30px; background-color: #f2f7fc; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.section-header h2 { font-size: 22px; color: #002580; }
.search-box { position: relative; width: 300px; }
.search-input { width: 100%; padding: 10px 15px 10px 40px; border: 1px solid #ccc; border-radius: 25px; font-size: 15px; outline: none; transition: all 0.3s ease; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); }
.search-input:focus { border-color: #0055aa; box-shadow: 0 2px 8px rgba(0, 85, 170, 0.2); }
.search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #888; font-size: 16px; }
.alert { padding: 10px 20px; border-radius: 8px; margin-bottom: 20px; font-weight: 500; border: 1px solid transparent; }
.alert-error { background-color: #fcebeb; color: #cc0000; border-color: #cc0000; }
.alert-success { background-color: #e9f7ef; color: #008000; border-color: #008000; }
.loading-indicator { text-align: center; padding: 20px; font-size: 16px; color: #0055aa; }
.no-data-message { text-align: center; padding: 20px; color: #666; font-style: italic; }
.patient-table { width: 100%; border-collapse: collapse; background-color: white; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05); border-radius: 8px; overflow: hidden; }
.patient-table th, .patient-table td { padding: 12px 15px; border-bottom: 1px solid #eee; text-align: left; font-size: 14px; }
.patient-table th { background-color: #eef4f9; color: #002580; font-weight: 600; text-transform: uppercase; font-size: 13px; }
.patient-table tbody tr:hover { background-color: #f9fcff; }
.patient-table tbody tr:last-child td { border-bottom: none; }
.patient-avatar { width: 35px; height: 35px; border-radius: 50%; object-fit: cover; vertical-align: middle; margin-right: 5px; border: 1px solid #eee; }
.patient-name-cell { font-weight: 500; color: #333; }
.status { padding: 5px 10px; border-radius: 4px; font-weight: 600; font-size: 13px; color: white; display: inline-block; }
.status.actif { background-color: #28a745; }
.status.en_traitement { background-color: #007bff; }
.status.stable { background-color: #6c757d; }
.status.critique { background-color: #dc3545; }
.status.sorti { background-color: #17a2b8; }
.status.archive { background-color: #343a40; }
.details-btn { text-decoration: none; color: #0055aa; font-weight: bold; font-size: 14px; padding: 6px 10px; border-radius: 4px; background-color: #e0f2ff; transition: background-color 0.2s ease; }
.details-btn:hover { background-color: #cce9ff; }
.patient-table th.sortable { cursor: pointer; position: relative; padding-right: 30px; }
.patient-table th.sortable i { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: #999; font-size: 12px; }
.patient-table th.sortable.active i { color: #002580; }
.patient-table th.sortable:hover { background-color: #e0eaf4; }
.pagination-controls { display: flex; justify-content: center; align-items: center; margin-top: 25px; gap: 15px; }
.pagination-button { padding: 8px 15px; border: 1px solid #0055aa; border-radius: 5px; background-color: #0055aa; color: white; font-weight: 500; cursor: pointer; transition: background-color 0.3s ease, border-color 0.3s ease; }
.pagination-button:hover:not(:disabled) { background-color: #004488; border-color: #004488; }
.pagination-button:disabled { background-color: #cccccc; border-color: #cccccc; cursor: not-allowed; color: #666666; }
.pagination-info { font-size: 15px; color: #333; }
</style>