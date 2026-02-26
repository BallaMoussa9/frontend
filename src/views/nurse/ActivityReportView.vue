<template>
  <NurseLayout>
    <div class="report-container">
      <h2 class="section-title">Rapports d'Activités</h2>

      <div class="card form-section">
        <div class="card-header-toggle" @click="isFormCollapsed = !isFormCollapsed">
          <h3>Enregistrer une nouvelle activité</h3>
          <i :class="['fas', isFormCollapsed ? 'fa-chevron-down' : 'fa-chevron-up', 'mobile-only']"></i>
        </div>

        <form v-show="!isFormCollapsed || !isMobile" @submit.prevent="submitReport" class="responsive-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="patient">Patient concerné :</label>
              <div v-if="patientStore.isLoading && !patientsListForForm.length" class="loading-inline">
                <i class="fas fa-spinner fa-spin"></i> Chargement...
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
                <option v-for="p in patientsListForForm" :key="p.id" :value="p.id">
                  {{ getPatientFullName(p) }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="report_date">Date et heure :</label>
              <input type="datetime-local" id="report_date" v-model="form.report_date" required :disabled="localFormLoading" />
            </div>
          </div>

          <div class="form-group">
            <label for="title">Titre du rapport :</label>
            <input type="text" id="title" v-model="form.title" required placeholder="Ex: Soins quotidiens" :disabled="localFormLoading" />
          </div>

          <div class="form-group">
            <label for="content">Description de l'acte :</label>
            <textarea id="content" v-model="form.content" rows="3" required placeholder="Détails de l'intervention..." :disabled="localFormLoading"></textarea>
          </div>

          <div class="form-actions">
            <div v-if="localFormError" class="alert alert-error">⚠️ {{ localFormError }}</div>
            <div v-if="localFormSuccess" class="alert alert-success">✅ {{ localFormSuccess }}</div>

            <button type="submit" class="submit-btn" :disabled="localFormLoading || !form.patient_id || !form.title || !form.content">
              <i :class="localFormLoading ? 'fas fa-spinner fa-spin' : 'fas fa-save'"></i>
              <span>{{ localFormLoading ? 'Envoi...' : 'Enregistrer le Rapport' }}</span>
            </button>
          </div>
        </form>
      </div>

      <div class="card table-section">
        <div class="table-controls">
          <div class="search-box">
            <i class="fas fa-search search-icon"></i>
            <input type="text" v-model="searchTerm" placeholder="Rechercher un patient..." :disabled="patientStore.isLoading" />
          </div>
          <button @click="loadAllPatientsAndReports()" class="refresh-btn" :disabled="patientStore.isLoading">
            <i :class="['fas fa-sync-alt', patientStore.isLoading ? 'fa-spin' : '']"></i>
          </button>
        </div>

        <div v-if="localExportError" class="alert alert-error">⚠️ {{ localExportError }}</div>
        <div v-if="localExportSuccess" class="alert alert-success">✅ {{ localExportSuccess }}</div>

        <div v-if="patientStore.isLoading && !filteredAndSortedReports.length" class="loading-state">
          <i class="fas fa-circle-notch fa-spin"></i>
          <p>Chargement des données...</p>
        </div>

        <div class="table-responsive-wrapper">
          <table class="report-table desktop-table">
            <thead>
              <tr>
                <th @click="handleSort('patient_name')">Patient <i :class="getSortIcon('patient_name')"></i></th>
                <th @click="handleSort('latest_report_date')">Dernière activité <i :class="getSortIcon('latest_report_date')"></i></th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="group in filteredAndSortedReports" :key="group.patient_id">
                <td class="font-bold">{{ group.patient_name }}</td>
                <td>{{ formatDate(group.latest_report_date) }}</td>
                <td><span class="count-badge">{{ group.total_reports }}</span></td>
                <td>
                  <button @click="exportPatientReport(group.latest_report_id, group.patient_name)" class="export-btn-mini" :disabled="localExportLoading">
                    <i :class="localExportLoading ? 'fas fa-spinner fa-spin' : 'fas fa-file-word'"></i> Word
                  </button>
                </td>
              </tr>
              <tr v-if="!filteredAndSortedReports.length && !patientStore.isLoading">
                <td colspan="4" class="no-data">Aucun rapport trouvé.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mobile-cards-container">
          <div v-for="group in filteredAndSortedReports" :key="'mob-' + group.patient_id" class="report-mobile-card">
            <div class="card-row main">
              <span class="p-name">{{ group.patient_name }}</span>
              <span class="count-badge">{{ group.total_reports }} rapports</span>
            </div>
            <div class="card-row">
              <span class="label">Dernier :</span>
              <span class="value">{{ formatDate(group.latest_report_date) }}</span>
            </div>
            <button @click="exportPatientReport(group.latest_report_id, group.patient_name)" class="export-btn-mobile" :disabled="localExportLoading">
              <i :class="localExportLoading ? 'fas fa-spinner fa-spin' : 'fas fa-file-word'"></i> Exporter Word
            </button>
          </div>
          <div v-if="!filteredAndSortedReports.length && !patientStore.isLoading" class="no-data">Aucun rapport trouvé.</div>
        </div>
      </div>
    </div>
  </NurseLayout>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { useNurseStore } from '@/stores/nurseStore';
import { usePatientStore } from '@/stores/patientStore';
import NurseLayout from '@/layouts/NurseLayout.vue';

// --- LOGIQUE CORE ---
const route = useRoute();
const nurseStore = useNurseStore();
const patientStore = usePatientStore();
const nurseId = ref(route.params.idNurse || route.params.id || null);

// --- ÉTATS UI ---
const isFormCollapsed = ref(true);
const isMobile = ref(false);
const searchTerm = ref('');
const sortBy = ref('latest_report_date');
const sortDirection = ref('desc');

const localFormLoading = ref(false);
const localFormError = ref(null);
const localFormSuccess = ref(null);
const localExportLoading = ref(false);
const localExportError = ref(null);
const localExportSuccess = ref(null);

// --- FORMULAIRE ---
const form = ref({
  patient_id: '',
  report_date: new Date().toISOString().substring(0, 16),
  title: '',
  content: '',
});

// --- HELPERS ---
const updateMobileStatus = () => {
  isMobile.value = window.innerWidth < 768;
};

const getPatientFullName = (p) => p.user ? `${p.user.first_name} ${p.user.last_name}` : `Patient #${p.id}`;

const formatDate = ts => ts ? new Date(ts).toLocaleDateString('fr-FR', {
  day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'
}) : 'N/A';

const clearFeedbacks = () => {
  localFormError.value = null; localFormSuccess.value = null;
  localExportError.value = null; localExportSuccess.value = null;
};

// --- COMPUTED ---
const patientsListForForm = computed(() => patientStore.patients?.data || patientStore.patients || []);

const groupedReports = computed(() => {
  const patients = patientsListForForm.value;
  return patients.reduce((acc, p) => {
    const reports = p.nurse_activity_reports || [];
    if (reports.length > 0) {
      const latest = reports.reduce((a, b) => new Date(b.report_date) > new Date(a.report_date) ? b : a);
      acc.push({
        patient_id: p.id,
        patient_name: getPatientFullName(p),
        total_reports: reports.length,
        latest_report_date: new Date(latest.report_date).getTime(),
        latest_report_id: latest.id,
      });
    }
    return acc;
  }, []);
});

const filteredAndSortedReports = computed(() => {
  let list = groupedReports.value;
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    list = list.filter(g => g.patient_name.toLowerCase().includes(term));
  }
  return [...list].sort((a, b) => {
    let A = sortBy.value === 'patient_name' ? a.patient_name : a.latest_report_date;
    let B = sortBy.value === 'patient_name' ? b.patient_name : b.latest_report_date;
    return sortDirection.value === 'asc' ? (A > B ? 1 : -1) : (A < B ? 1 : -1);
  });
});

// --- ACTIONS ---
const handleSort = (col) => {
  if (sortBy.value === col) sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  else { sortBy.value = col; sortDirection.value = 'desc'; }
};

const getSortIcon = col => {
  if (sortBy.value !== col) return 'fas fa-sort';
  return sortDirection.value === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
};

const loadAllPatientsAndReports = async () => {
  patientStore.isLoading = true;
  try { await patientStore.allPatient(); } 
  catch (e) { console.error("Erreur chargement:", e); }
  finally { patientStore.isLoading = false; }
};

const submitReport = async () => {
  clearFeedbacks();
  localFormLoading.value = true;
  try {
    await nurseStore.createActivitiesReport(nurseId.value, form.value);
    localFormSuccess.value = "Rapport enregistré avec succès !";
    form.value = { patient_id: '', title: '', content: '', report_date: new Date().toISOString().substring(0, 16) };
    await loadAllPatientsAndReports();
  } catch (e) {
    localFormError.value = "Erreur lors de l'enregistrement.";
  } finally {
    localFormLoading.value = false;
  }
};

const exportPatientReport = async (reportId, name) => {
  clearFeedbacks();
  localExportLoading.value = true;
  try {
    await nurseStore.exportActivityReport(nurseId.value, reportId);
    localExportSuccess.value = `Exportation Word lancée pour ${name}`;
  } catch (e) {
    localExportError.value = "L'exportation a échoué.";
  } finally {
    localExportLoading.value = false;
  }
};

// --- LIFECYCLE ---
onMounted(() => {
  updateMobileStatus();
  window.addEventListener('resize', updateMobileStatus);
  loadAllPatientsAndReports();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateMobileStatus);
});
</script>

<style scoped>
/* BASE */
.report-container { padding: 15px; background-color: #f8fafc; min-height: 100vh; }
.section-title { font-size: 20px; color: #1e293b; margin-bottom: 20px; font-weight: 700; text-align: center; }

/* CARDS */
.card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 20px; overflow: hidden; }
.card-header-toggle { padding: 15px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: #fff; border-bottom: 1px solid #f1f5f9; }
.card h3 { font-size: 16px; color: #334155; margin: 0; }

/* FORM */
.responsive-form { padding: 15px; }
.form-grid { display: grid; grid-template-columns: 1fr; gap: 15px; }
.form-group { margin-bottom: 12px; }
.form-group label { display: block; font-size: 13px; font-weight: 600; color: #64748b; margin-bottom: 5px; }
input, select, textarea { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; }

.submit-btn { width: 100%; background: #2563eb; color: white; padding: 12px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
.submit-btn:disabled { background: #94a3b8; }

/* CONTROLS */
.table-controls { padding: 15px; display: flex; gap: 10px; }
.search-box { position: relative; flex: 1; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-box input { padding-left: 30px; }
.refresh-btn { background: #f1f5f9; border: none; padding: 10px; border-radius: 8px; color: #475569; cursor: pointer; }

/* RESPONSIVE TABLE */
.table-responsive-wrapper { display: none; padding: 0 15px 15px; }
.desktop-table { width: 100%; border-collapse: collapse; }
.desktop-table th { background: #f8fafc; padding: 12px; text-align: left; font-size: 13px; cursor: pointer; }
.desktop-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }

/* MOBILE CARDS */
.mobile-cards-container { display: flex; flex-direction: column; gap: 12px; padding: 0 15px 15px; }
.report-mobile-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; }
.card-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
.p-name { font-weight: 700; color: #1e293b; }
.count-badge { background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 12px; font-size: 11px; }
.export-btn-mobile { width: 100%; background: #ef4444; color: white; border: none; padding: 10px; border-radius: 8px; font-weight: 600; margin-top: 10px; }

/* ALERTS */
.alert { padding: 10px; border-radius: 6px; margin: 10px 15px; font-size: 13px; }
.alert-error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
.alert-success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }

/* UTILS */
.mobile-only { display: block; }
@media (min-width: 768px) {
  .section-title { font-size: 24px; text-align: left; }
  .form-grid { grid-template-columns: 1fr 1fr; }
  .table-responsive-wrapper { display: block; }
  .mobile-cards-container { display: none; }
  .mobile-only { display: none; }
  .submit-btn { width: auto; min-width: 200px; }
  .export-btn-mini { background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; }
}
</style>