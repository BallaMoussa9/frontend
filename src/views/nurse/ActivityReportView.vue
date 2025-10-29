<template>
  <NurseLayout>
    <div class="report-container">
      <h2 class="section-title">Créer et Consulter les Rapports d'Activités</h2>

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
            <input type="datetime-local" id="report_date" v-model="form.report_date" required :disabled="localFormLoading"/>
          </div>

          <div class="form-group">
            <label for="title">Titre du rapport :</label>
            <input type="text" id="title" v-model="form.title" required placeholder="Ex: Soin post-opératoire, Saisie des signes vitaux" :disabled="localFormLoading"/>
          </div>

          <div class="form-group">
            <label for="content">Description de l'activité (Acte effectué) :</label>
            <textarea id="content" v-model="form.content" rows="4" required placeholder="Décrivez l'état du patient et l'acte effectué..." :disabled="localFormLoading"></textarea>
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
                :disabled="localFormLoading || !form.patient_id || !form.title || !form.content || !form.report_date"
                class="submit-btn"
            >
              <i v-if="localFormLoading" class="fas fa-spinner fa-spin"></i>
              {{ localFormLoading ? 'Envoi en cours...' : 'Enregistrer le Rapport' }}
            </button>
          </div>
        </form>
      </div>

      <div v-if="localExportError" class="card alert-error" style="padding: 15px; margin-bottom: 20px;">
          ⚠️ {{ localExportError }}
      </div>
      <div v-if="localExportSuccess" class="card alert-success" style="padding: 15px; margin-bottom: 20px;">
          ✅ {{ localExportSuccess }}
      </div>


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

            <button @click="loadAllPatientsAndReports()" class="refresh-btn" :disabled="patientStore.isLoading || localExportLoading">
              <i class="fas fa-sync-alt" :class="{'fa-spin': patientStore.isLoading}"></i>
              Actualiser
            </button>
        </div>

        <div v-if="patientStore.isLoading && !filteredAndSortedReports.length" class="loading-table-message">
            <i class="fas fa-circle-notch fa-spin"></i> Chargement des rapports...
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
              <td>
                <span class="patient-name-cell">{{ group.patient_name }}</span>
              </td>
              <td>
                {{ formatDate(group.latest_report_date) }}
              </td>
              <td>{{ group.total_reports }}</td>
              <td>
                <button
                    @click="exportPatientReport(group.latest_report_id, group.patient_name)"
                    class="export-line-btn"
                    :disabled="localExportLoading || !group.latest_report_id"
                >
                    <i v-if="localExportLoading" class="fas fa-spinner fa-spin"></i>
                    <i v-else class="fas fa-file-word"></i>
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
import { useUserStore } from '@/stores/userStore';
import NurseLayout from '@/layouts/NurseLayout.vue';

const route = useRoute();
const nurseStore = useNurseStore();
const patientStore = usePatientStore();
const userStore = useUserStore();

const nurseId = ref(route.params.idNurse || route.params.id || null);

// Variables d'état locales pour gérer le chargement et les feedbacks dans le composant
const localFormLoading = ref(false);
const localFormError = ref(null);
const localFormSuccess = ref(null);

const localExportLoading = ref(false);
const localExportError = ref(null);
const localExportSuccess = ref(null);

// Fonctions utilitaires pour gérer les feedbacks locaux
const setLocalFormError = (message) => { localFormError.value = message; localFormSuccess.value = null; };
const setLocalFormSuccess = (message) => { localFormSuccess.value = message; localFormError.value = null; };
const clearLocalFormFeedback = () => { localFormError.value = null; localFormSuccess.value = null; };

const setLocalExportError = (message) => { localExportError.value = message; localExportSuccess.value = null; };
const setLocalExportSuccess = (message) => { localExportSuccess.value = message; localExportError.value = null; };
const clearLocalExportFeedback = () => { localExportError.value = null; localExportSuccess.value = null; };


// ---------------------- 1. Formulaire de Création ----------------------
const form = ref({
    nurse_id: nurseId.value,
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
    clearLocalFormFeedback(); // Réinitialise le feedback du formulaire
    localFormLoading.value = true;

    if (!form.value.patient_id) {
        setLocalFormError("Veuillez sélectionner un patient.");
        localFormLoading.value = false;
        return;
    }
    if (!nurseId.value) {
        setLocalFormError("L'ID de l'infirmier est manquant. Impossible de créer le rapport.");
        localFormLoading.value = false;
        return;
    }

    try {
        // Supposons que nurseStore.createActivitiesReport gère son propre loading et feedback interne
        // ou qu'il ne lève pas d'erreur directement, mais retourne une réponse que nous devrions vérifier.
        // Pour être sûr, nous allons attendre la résolution.
        await nurseStore.createActivitiesReport(nurseId.value, form.value);

        // Si l'action du store gère le feedback, nous pouvons le récupérer ici
        // Cependant, puisque nous utilisons localFormFeedback, nous allons définir ici
        if (nurseStore.error) { // Si nurseStore.error est défini par l'action du store
            setLocalFormError(nurseStore.error);
        } else if (nurseStore.success) { // Si nurseStore.success est défini par l'action du store
            setLocalFormSuccess(nurseStore.success);
        } else {
            setLocalFormSuccess("Rapport d'activité enregistré avec succès !");
        }


        // Réinitialisation du formulaire après succès (ou même échec si partiel)
        form.value.patient_id = '';
        form.value.title = '';
        form.value.content = '';
        form.value.report_date = new Date().toISOString().substring(0, 16);

        // Actualise la liste des patients et leurs rapports après chaque soumission
        await loadAllPatientsAndReports();

    } catch (error) {
        console.error("Erreur lors de l'enregistrement du rapport:", error);
        setLocalFormError(error.response?.data?.message || "Échec de l'enregistrement du rapport.");
    } finally {
        localFormLoading.value = false;
    }
};

// ---------------------- 2. Tableau des Rapports ----------------------

const searchTerm = ref('');
const sortBy = ref('latest_report_date');
const sortDirection = ref('desc');

const groupedReports = computed(() => {
    const patientsWithReports = patientStore.patients?.data || patientStore.patients || [];
    const patientReportSummary = [];

    patientsWithReports.forEach(patient => {
        const reports = patient.nurse_activity_reports || [];

        if (reports.length > 0) {
            const latestReport = reports.reduce((latest, current) => {
                const latestDate = new Date(latest.report_date).getTime();
                const currentDate = new Date(current.report_date).getTime();
                return currentDate > latestDate ? current : latest;
            });

            patientReportSummary.push({
                patient_id: patient.id,
                patient_name: getPatientFullName(patient),
                total_reports: reports.length,
                latest_report_date: new Date(latestReport.report_date).getTime(),
                latest_report_id: latestReport.id,
            });
        }
    });

    return patientReportSummary;
});

const filteredAndSortedReports = computed(() => {
    let reports = groupedReports.value;
    const term = searchTerm.value.toLowerCase().trim();

    if (term) {
        reports = reports.filter(group =>
            group.patient_name.toLowerCase().includes(term) ||
            String(group.patient_id).includes(term)
        );
    }

    const sorted = [...reports];
    sorted.sort((a, b) => {
        let valA, valB;

        if (sortBy.value === 'patient_name') {
            valA = a.patient_name.toLowerCase();
            valB = b.patient_name.toLowerCase();
        } else if (sortBy.value === 'latest_report_date') {
            valA = a.latest_report_date;
            valB = b.latest_report_date;
        } else {
            return 0;
        }

        if (valA < valB) return sortDirection.value === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection.value === 'asc' ? 1 : -1;
        return 0;
    });

    return sorted;
});

// ---------------------- 3. Tri & Utilitaires ----------------------

const handleSort = (column) => {
    if (sortBy.value === column) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortBy.value = column;
        sortDirection.value = column === 'latest_report_date' ? 'desc' : 'asc';
    }
};

const getSortClass = (col) => ({
    'sortable': true,
    'active': sortBy.value === col,
    'asc': sortBy.value === col && sortDirection.value === 'asc',
    'desc': sortBy.value === col && sortDirection.value === 'desc',
});

const getSortIcon = (col) => {
    if (sortBy.value !== col) return 'fas fa-sort';
    return sortDirection.value === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
};

const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    // Utilisation de Date pour s'assurer que le timestamp est traité correctement
    return new Date(timestamp).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

// ---------------------- 4. Exportation DOCX ----------------------

const exportPatientReport = async (reportId, patientName) => {
    clearLocalExportFeedback(); // Réinitialise les feedbacks d'exportation
    localExportLoading.value = true;

    console.log(`➡️ Tentative d'exportation du Rapport ID: ${reportId} pour ${patientName}`);

    if (!reportId) {
        setLocalExportError(`ÉCHEC : ID du rapport manquant pour ${patientName}.`);
        console.error(`❌ ÉCHEC : ID du rapport manquant pour ${patientName}.`);
        localExportLoading.value = false;
        return;
    }

    try {
        console.log("Appel de userStore.exportNurseActivityReport...");
        // Ici, nous appelons l'action du userStore.
        // Si userStore.exportNurseActivityReport ne contient PAS de this.clearFeedback() ou this.setSuccess()/setError()
        // ALORS nous devons gérer le succès/erreur ICI dans la vue.
        // Si elle contient, elle devrait mettre à jour userStore.error/success ou userStore.feedback
        // Et nous pourrions ensuite lire userStore.error/success ici pour afficher le message.
        await userStore.exportNurseActivityReport(reportId);

        // Si l'action du store a mis à jour userStore.error ou userStore.success
        if (userStore.error) {
            setLocalExportError(userStore.error);
        } else if (userStore.success) {
            setLocalExportSuccess(userStore.success);
        } else {
            // Fallback au cas où le store n'a pas mis à jour son état de feedback
            setLocalExportSuccess("Le rapport a été généré et téléchargé avec succès !");
        }

        console.log("Appel API terminé.");
    } catch (error) {
        console.error(`❌ Erreur durant l'exportation du rapport (capturée dans la vue):`, error);
        setLocalExportError(error.response?.data?.message || "Échec de l'exportation du rapport.");
    } finally {
        localExportLoading.value = false;
    }
};

// Fonction pour charger tous les patients et leurs rapports (utilisée au montage et après soumission)
const loadAllPatientsAndReports = async () => {
    patientStore.isLoading = true; // Activer le chargement du patient store
    try {
        await patientStore.allPatient();
        // Optionnel: Si patientStore a son propre feedback, le gérer ici.
    } catch (error) {
        console.error("Erreur lors du chargement des patients et rapports:", error);
        // Gérer l'erreur, par exemple, en affichant un message global si patientStore.error est disponible
        // Ou en utilisant une variable locale si nous ne voulons pas modifier patientStore.
    } finally {
        patientStore.isLoading = false; // Désactiver le chargement
    }
}

// ---------------------- 5. Montage ----------------------

onMounted(() => {
    // Réinitialisation de TOUS les feedbacks lors du montage pour un état propre
    clearLocalFormFeedback();
    clearLocalExportFeedback();

    // Assurez-vous que les stores réinitialisent aussi leurs feedbacks si vous voulez le faire globalement.
    // userStore.resetFeedback(); // Si cette méthode existe et fonctionne comme prévu
    // nurseStore.resetFeedback(); // Si cette méthode existe et fonctionne comme prévu

    loadAllPatientsAndReports(); // Lance le chargement initial des données
});
</script>

<style scoped>
/* AJOUT DE STYLE POUR LE TYPE 'info' (bien que non utilisé dans ce template) */
.alert-info { background-color: #d1ecf1; color: #0c5460; border-color: #bee5eb; }

/* Styles généraux du conteneur de rapport */
.report-container { padding: 30px; background-color: #f2f7fc; }
.section-title { font-size: 24px; color: #002580; margin-bottom: 25px; border-bottom: 2px solid #eef4f9; padding-bottom: 10px; }
.card { background-color: white; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); padding: 25px; margin-bottom: 30px; }
.card h3 { color: #0055aa; margin-top: 0; margin-bottom: 20px; font-size: 18px; border-bottom: 1px dashed #eee; padding-bottom: 10px; }

/* Styles du Formulaire de création de rapport */
.form-group { margin-bottom: 15px; }
.form-group label { display: block; font-weight: 600; color: #333; margin-bottom: 5px; }
.form-group input[type="text"],
.form-group input[type="datetime-local"],
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    box-sizing: border-box;
}
.loading-inline { font-style: italic; color: #0055aa; margin-top: 5px; }
.form-actions { margin-top: 25px; }
.submit-btn {
    background-color: #28a745;
    color: white;
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: bold;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s;
}
.submit-btn:hover:not(:disabled) { background-color: #218838; }
.submit-btn:disabled { background-color: #90ee90; cursor: not-allowed; }

/* Styles pour les messages d'alerte (feedback) */
.alert { padding: 10px; border-radius: 6px; margin-bottom: 15px; font-weight: 500; }
.alert-error { background-color: #fcebeb; color: #cc0000; border: 1px solid #f5c6cb; } /* Ajout de bordure */
.alert-success { background-color: #e9f7ef; color: #008000; border: 1px solid #c3e6cb; } /* Ajout de bordure */

/* Styles du Tableau d'historique des rapports */
.table-header-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    flex-wrap: wrap; /* Permet le retour à la ligne sur petits écrans */
    gap: 10px; /* Espace entre les éléments */
}
.search-box { position: relative; flex-grow: 1; max-width: 300px; } /* Adapte la taille */
.search-input {
    width: 100%;
    padding: 8px 15px 8px 35px;
    border: 1px solid #ccc;
    border-radius: 20px;
    font-size: 14px;
}
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #888; }
.refresh-btn {
    background-color: #0055aa;
    color: white;
    padding: 8px 15px;
    border-radius: 6px;
    border: none;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s;
}
.refresh-btn:hover:not(:disabled) { background-color: #0044aa; }
.refresh-btn:disabled { background-color: #ccc; cursor: not-allowed; }

.report-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
.report-table th, .report-table td { padding: 12px 15px; border-bottom: 1px solid #eee; font-size: 14px; text-align: left; }
.report-table th { background-color: #eef4f9; color: #002580; font-weight: 600; text-transform: uppercase; cursor: pointer; position: relative; }
.report-table th.sortable i { margin-left: 5px; color: #999; font-size: 12px; } /* Ajustement icône de tri */
.report-table th.sortable.active i { color: #002580; }
.report-table th:hover { background-color: #e0eaf4; }
.loading-table-message, .no-data-message { text-align: center; padding: 20px; font-style: italic; color: #666; background-color: #f9f9f9; border-radius: 8px; margin-top: 15px; }
.loading-table-message { color: #0055aa; font-weight: 500; }
.patient-name-cell { font-weight: 600; color: #333; }
.export-line-btn {
    background-color: #dc3545;
    color: white;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 13px;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s;
}
.export-line-btn:hover:not(:disabled) { background-color: #c82333; }
.export-line-btn:disabled { background-color: #ef9a9a; cursor: not-allowed; }
</style>
