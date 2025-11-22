<template>
  <NurseLayout>
    <div class="report-container">

      <h2 class="section-title">Créer et Consulter les Rapports d'Activités</h2>

      <!-- FORMULAIRE -->
      <div class="card form-section">
        <h3>Enregistrer une nouvelle activité</h3>

        <form @submit.prevent="submitReport">

          <div class="form-group">
            <label for="patient">Patient concerné :</label>

            <div v-if="patientStore.isLoading && !patientsListForForm.length" class="loading-inline">
              Chargement des patients...
            </div>

            <select
              v-else
              id="patient"
              v-model="form.patient_id"
              required
              :disabled="localFormLoading || !patientsListForForm.length"
            >
              <option value="" disabled>
                {{ patientsListForForm.length > 0 ? 'Sélectionner un patient' : 'Aucun patient disponible' }}
              </option>

              <option
                v-for="p in patientsListForForm"
                :key="p.id"
                :value="p.id"
              >
                {{ getPatientFullName(p) }} (ID: {{ p.id }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="report_date">Date et heure de l'activité :</label>
            <input
              type="datetime-local"
              id="report_date"
              v-model="form.report_date"
              required
              :disabled="localFormLoading"
            />
          </div>

          <div class="form-group">
            <label for="title">Titre du rapport :</label>
            <input
              type="text"
              id="title"
              v-model="form.title"
              required
              placeholder="Ex: Soin post-opératoire, Saisie des signes vitaux"
              :disabled="localFormLoading"
            />
          </div>

          <div class="form-group">
            <label for="content">Description de l'activité (Acte effectué) :</label>
            <textarea
              id="content"
              v-model="form.content"
              rows="4"
              required
              placeholder="Décrivez l'état du patient et l'acte effectué..."
              :disabled="localFormLoading"
            ></textarea>
          </div>

          <div class="form-actions">

            <div v-if="localFormError" class="alert alert-error">
              ⚠️ {{ localFormError }}
            </div>

            <div v-if="localFormSuccess" class="alert alert-success">
              ✅ {{ localFormSuccess }}
            </div>

            <button
              type="submit"
              class="submit-btn"
              :disabled="localFormLoading || !form.patient_id || !form.title || !form.content || !form.report_date"
            >
              <i :class="localFormLoading ? 'fas fa-spinner fa-spin' : ''"></i>
              {{ localFormLoading ? 'Envoi en cours...' : 'Enregistrer le Rapport' }}
            </button>
          </div>

        </form>
      </div>

      <!-- FEEDBACK EXPORT -->
      <div v-if="localExportError" class="card alert-error" style="padding: 15px; margin-bottom: 20px;">
        ⚠️ {{ localExportError }}
      </div>

      <div v-if="localExportSuccess" class="card alert-success" style="padding: 15px; margin-bottom: 20px;">
        ✅ {{ localExportSuccess }}
      </div>

      <!-- TABLEAU -->
      <div class="card table-section">
        <h3>Historique des rapports (Par Patient)</h3>

        <div class="table-header-controls">

          <div class="search-box">
            <input
              type="text"
              v-model="searchTerm"
              placeholder="Rechercher un patient ou un titre..."
              class="search-input"
              :disabled="patientStore.isLoading || localExportLoading"
            />
            <i class="search-icon fas fa-search"></i>
          </div>

          <button
            @click="loadAllPatientsAndReports()"
            class="refresh-btn"
            :disabled="patientStore.isLoading || localExportLoading"
          >
            <i :class="patientStore.isLoading ? 'fas fa-sync-alt fa-spin' : 'fas fa-sync-alt'"></i>
            Actualiser
          </button>

        </div>

        <div v-if="patientStore.isLoading && !filteredAndSortedReports.length" class="loading-table-message">
          <i class="fas fa-circle-notch fa-spin"></i>
          Chargement des rapports...
        </div>

        <table v-else class="report-table">

          <thead>
            <tr>
              <th @click="handleSort('patient_name')" :class="getSortClass('patient_name')">
                Patient <i :class="getSortIcon('patient_name')"></i>
              </th>

              <th @click="handleSort('latest_report_date')" :class="getSortClass('latest_report_date')">
                Dernière activité <i :class="getSortIcon('latest_report_date')"></i>
              </th>

              <th>Total Rapports</th>

              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            <tr v-if="!filteredAndSortedReports.length">
              <td colspan="4" class="no-data-message">
                Aucun rapport trouvé.
                <span v-if="searchTerm"> (Recherche: "{{ searchTerm }}")</span>
              </td>
            </tr>

            <tr v-for="group in filteredAndSortedReports" :key="group.patient_id">

              <td><span class="patient-name-cell">{{ group.patient_name }}</span></td>

              <td>{{ formatDate(group.latest_report_date) }}</td>

              <td>{{ group.total_reports }}</td>

              <td>
                <button
                  @click="exportPatientReport(group.latest_report_id, group.patient_name)"
                  class="export-line-btn"
                  :disabled="localExportLoading || !group.latest_report_id"
                >
                  <i :class="[localExportLoading ? 'fas fa-spinner fa-spin' : 'fas fa-file-word']"></i>
                  {{ localExportLoading ? 'Génération...' : 'Exporter Word' }}
                </button>
              </td>

            </tr>
          </tbody>
        </table>

      </div>

    </div>
  </NurseLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useNurseStore } from '@/stores/nurseStore';
import { usePatientStore } from '@/stores/patientStore';
import NurseLayout from '@/layouts/NurseLayout.vue';

const route = useRoute();
const nurseStore = useNurseStore();
const patientStore = usePatientStore();
const nurseId = ref(route.params.idNurse || route.params.id || null);

const localFormLoading = ref(false);
const localFormError = ref(null);
const localFormSuccess = ref(null);

const localExportLoading = ref(false);
const localExportError = ref(null);
const localExportSuccess = ref(null);

const setLocalFormError = (msg) => { localFormError.value = msg; localFormSuccess.value = null; };
const setLocalFormSuccess = (msg) => { localFormSuccess.value = msg; localFormError.value = null; };
const clearLocalFormFeedback = () => { localFormError.value = null; localFormSuccess.value = null; };

const setLocalExportError = (msg) => { localExportError.value = msg; localExportSuccess.value = null; };
const setLocalExportSuccess = (msg) => { localExportSuccess.value = msg; localExportError.value = null; };
const clearLocalExportFeedback = () => { localExportError.value = null; localExportSuccess.value = null; };

const form = ref({
  patient_id: '',
  report_date: new Date().toISOString().substring(0, 16),
  title: '',
  content: '',
});

const patientsListForForm = computed(() => {
  return patientStore.patients?.data || patientStore.patients || [];
});

const getPatientFullName = (patient) => {
  return patient.user ? `${patient.user.first_name} ${patient.user.last_name}` : `Patient ID: ${patient.id}`;
};

const submitReport = async () => {
  clearLocalFormFeedback();
  localFormLoading.value = true;

  if (!form.value.patient_id) {
    setLocalFormError("Veuillez sélectionner un patient.");
    localFormLoading.value = false;
    return;
  }
  if (!nurseId.value) {
    setLocalFormError("Impossible de déterminer l'infirmier connecté.");
    localFormLoading.value = false;
    return;
  }

  try {
    await nurseStore.createActivitiesReport(nurseId.value, form.value);
    if (nurseStore.error) setLocalFormError(nurseStore.error);
    else setLocalFormSuccess(nurseStore.success || "Rapport enregistré avec succès !");

    form.value = {
      patient_id: '',
      title: '',
      content: '',
      report_date: new Date().toISOString().substring(0, 16),
    };

    await loadAllPatientsAndReports();
  }
  catch (e) {
    setLocalFormError(e.message || "Échec de l'enregistrement du rapport (Erreur réseau/API).");
  }
  finally {
    localFormLoading.value = false;
  }
};

const searchTerm = ref('');
const sortBy = ref('latest_report_date');
const sortDirection = ref('desc');

const groupedReports = computed(() => {
  const patients = patientStore.patients?.data || patientStore.patients || [];
  const groups = [];

  patients.forEach(p => {
    const reports = p.nurse_activity_reports || [];
    if (!reports.length) return;

    const latest = reports.reduce((a, b) =>
      new Date(b.report_date).getTime() > new Date(a.report_date).getTime() ? b : a
    );

    groups.push({
      patient_id: p.id,
      patient_name: getPatientFullName(p),
      total_reports: reports.length,
      latest_report_date: new Date(latest.report_date).getTime(),
      latest_report_id: latest.id,
    });
  });

  return groups;
});

const filteredAndSortedReports = computed(() => {
  let list = groupedReports.value;
  const term = searchTerm.value.toLowerCase();

  if (term) {
    list = list.filter(g =>
      g.patient_name.toLowerCase().includes(term) ||
      String(g.patient_id).includes(term)
    );
  }

  return [...list].sort((a, b) => {
    let A = sortBy.value === 'patient_name' ? a.patient_name.toLowerCase() : a.latest_report_date;
    let B = sortBy.value === 'patient_name' ? b.patient_name.toLowerCase() : b.latest_report_date;

    if (A < B) return sortDirection.value === 'asc' ? -1 : 1;
    if (A > B) return sortDirection.value === 'asc' ? 1 : -1;
    return 0;
  });
});

const handleSort = (col) => {
  if (sortBy.value === col) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = col;
    sortDirection.value = col === 'latest_report_date' ? 'desc' : 'asc';
  }
};

const getSortClass = col => ({
  sortable: true,
  active: sortBy.value === col,
  asc: sortBy.value === col && sortDirection.value === 'asc',
  desc: sortBy.value === col && sortDirection.value === 'desc',
});

const getSortIcon = col => {
  if (sortBy.value !== col) return 'fas fa-sort';
  return sortDirection.value === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
};

const formatDate = timestamp => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const exportPatientReport = async (reportId, patientName) => {
  clearLocalExportFeedback();
  localExportLoading.value = true;

  if (!reportId) {
    setLocalExportError("ID du rapport introuvable pour l'export.");
    localExportLoading.value = false;
    return;
  }

  if (!nurseId.value) {
    setLocalExportError("ID de l'infirmier non trouvé pour l'export.");
    localExportLoading.value = false;
    return;
  }

  try {
    await nurseStore.exportActivityReport(nurseId.value, reportId);
    setLocalExportSuccess(`Le rapport pour ${patientName} est en cours de téléchargement.`);
  }
  catch (e) {
    setLocalExportError(e.message || "Erreur inconnue lors du téléchargement. Veuillez vérifier la console.");
  }
  finally {
    localExportLoading.value = false;
  }
};

const loadAllPatientsAndReports = async () => {
  patientStore.isLoading = true;
  try {
    await patientStore.allPatient();
  } finally {
    patientStore.isLoading = false;
  }
};

onMounted(() => {
  clearLocalFormFeedback();
  clearLocalExportFeedback();
  loadAllPatientsAndReports();
});
</script>

<style scoped>
.report-container { padding: 30px; background-color: #f2f7fc; }
.section-title { font-size: 24px; color: #002580; margin-bottom: 25px; border-bottom: 2px solid #eef4f9; padding-bottom: 10px; }
.card { background-color: white; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); padding: 25px; margin-bottom: 30px; }
.card h3 { color: #0055aa; margin-top: 0; margin-bottom: 20px; font-size: 18px; border-bottom: 1px dashed #eee; padding-bottom: 10px; }

.form-group { margin-bottom: 15px; }
.form-group label { display: block; font-weight: 600; color: #333; margin-bottom: 5px; }
.form-group input,
.form-group select,
.form-group textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
.loading-inline { font-style: italic; color: #0055aa; margin-top: 5px; }
.form-actions { margin-top: 25px; }
.submit-btn { background-color: #28a745; color: white; padding: 10px 20px; border-radius: 6px; border: none; cursor: pointer; }
.submit-btn:hover:not(:disabled) { background-color: #218838; }
.submit-btn:disabled { background-color: #90ee90; cursor: not-allowed; }

.alert { padding: 10px; border-radius: 6px; margin-bottom: 15px; font-weight: 500; }
.alert-error { background-color: #fcebeb; color: #cc0000; border: 1px solid #f5c6cb; }
.alert-success { background-color: #e9f7ef; color: #008000; border: 1px solid #c3e6cb; }

.table-header-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px; }
.search-box { position: relative; flex-grow: 1; max-width: 300px; }
.search-input { width: 100%; padding: 8px 35px; border-radius: 20px; border: 1px solid #ccc; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #888; }

.refresh-btn { background-color: #0055aa; color: white; padding: 8px 15px; border-radius: 6px; border: none; cursor: pointer; }
.refresh-btn:hover:not(:disabled) { background-color: #0044aa; }

.report-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
.report-table th, .report-table td { padding: 12px 15px; border-bottom: 1px solid #eee; }
.report-table th { background-color: #eef4f9; color: #002580; font-weight: 600; cursor: pointer; }
.no-data-message { text-align: center; padding: 20px; }

.export-line-btn { background-color: #dc3545; color: white; padding: 6px 10px; border-radius: 4px; border: none; cursor: pointer; }
.export-line-btn:hover:not(:disabled) { background-color: #c82333; }
</style>
