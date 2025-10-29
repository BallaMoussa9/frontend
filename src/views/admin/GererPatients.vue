<template>
  <AdminLayout>
    <div class="patient-management">
      <div class="header">
        <h2>Gestion des patients</h2>
        <button class="btn-add" @click="openAddPatient">➕ Ajouter un patient</button>
      </div>

      <div class="search-bar-container">
        <input
          type="text"
          v-model="patientStore.searchTerm"
          @input="handleSearchInput"
          placeholder="Rechercher par nom, email ou statut..."
          class="search-input"
        />
      </div>
      <div class="table-container">
        <div v-if="patientStore.isLoading" class="loading-message">
          ⏳ Chargement des patients en cours...
        </div>
        <div v-else-if="patientStore.error" class="error-message">
          ❌ Erreur lors du chargement des patients : {{ patientStore.error }}
        </div>
        <table v-else class="patient-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nom complet</th>
              <th>Date de naissance</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filteredPatients || filteredPatients.length === 0">
              <td colspan="7" class="no-data-message">
                Aucun patient trouvé.
                <span v-if="patientStore.searchTerm"> (Recherche: "{{ patientStore.searchTerm }}")</span>
              </td>
            </tr>
            <tr v-else v-for="(patient, index) in filteredPatients" :key="patient.id">
              <td>{{ index + 1 }}</td>
              <td>{{ patient.user?.first_name }} {{ patient.user?.last_name }}</td>
              <td>{{ patient.user?.birth_date }}</td>
              <td>{{ patient.user?.email }}</td>
              <td>{{ patient.user?.phone }}</td>
              <td>
                <span :class="patient.status === 'actif' ? 'badge-success' : 'badge-inactif'">
                  {{ patient.status }}
                </span>
              </td>
              <td>
                <button class="btn-action" title="Voir le dossier">
                  <RouterLink :to="{ name: 'SeenDossiert', params: { id: patient.id } }">📁</RouterLink>
                </button>
                <button class="btn-action" title="Modifier">
                  <RouterLink :to="{ name: 'EditPatient', params: { id: patient.id } }">✏️</RouterLink>
                </button>
                <button class="btn-delete" title="Supprimer">🗑</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { onMounted, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { usePatientStore } from '../../stores/patientStore'

const patientStore = usePatientStore()
const router = useRouter()

let searchTimeout = null;

// Fonction de tri alphabétique
const alphabeticalSort = (a, b) => {
    // Comparaison basée sur le nom complet (Prénom + Nom)
    const nameA = `${a.user?.first_name || ''} ${a.user?.last_name || ''}`.toLowerCase();
    const nameB = `${b.user?.first_name || ''} ${b.user?.last_name || ''}`.toLowerCase();

    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
};

const handleSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(async () => {
    const term = patientStore.searchTerm ? patientStore.searchTerm.trim() : '';

    if (term.length >= 3) {
      console.log(`Lancement de la recherche pour: ${term}`);
      await patientStore.searchPatients(term);
    } else if (term === '') {
      console.log("Terme de recherche effacé. Rechargement de tous les patients.");
      patientStore.searchTerm = '';
      await patientStore.allPatient();
    }
  }, 300);
};

// Propriété computed pour les patients filtrés et triés
const filteredPatients = computed(() => {
  const patientsData = patientStore.patients?.data || [];
  const term = patientStore.searchTerm ? patientStore.searchTerm.trim().toLowerCase() : '';

  if (!term || term.length < 3) {
    // 🔑 Modification 1: Si pas de recherche active, trier alphabétiquement.
    return [...patientsData].sort(alphabeticalSort);
  }

  // --- Logique de tri par pertinence (pour la recherche) ---
  const getScore = (patient) => {
    let score = 999;
    const patientFirstName = patient.user?.first_name?.toLowerCase() || '';
    const patientLastName = patient.user?.last_name?.toLowerCase() || '';
    const patientEmail = patient.user?.email?.toLowerCase() || '';
    const patientStatus = patient.status?.toLowerCase() || '';

    // Priorité 1: Correspondance exacte au début (score 0-3)
    if (patientFirstName.startsWith(term)) return 0;
    if (patientLastName.startsWith(term)) return 1;
    if (patientEmail.startsWith(term)) return 2;
    if (patientStatus.startsWith(term)) return 3;

    // Priorité 2: Correspondance partielle (contient) (score 4-7)
    if (patientFirstName.includes(term)) return 4;
    if (patientLastName.includes(term)) return 5;
    if (patientEmail.includes(term)) return 6;
    if (patientStatus.includes(term)) return 7;

    return score;
  };

  return [...patientsData].sort((a, b) => {
    const scoreA = getScore(a);
    const scoreB = getScore(b);

    if (scoreA !== scoreB) {
      return scoreA - scoreB; // Tri par pertinence principale
    }

    // 🔑 Modification 2: Si les scores de pertinence sont égaux, trier alphabétiquement
    return alphabeticalSort(a, b);
  });
});


onMounted(async () => {
  if (patientStore.searchTerm && patientStore.searchTerm.length >= 3) {
    await patientStore.searchPatients(patientStore.searchTerm);
  } else {
    await patientStore.allPatient();
  }
})

const openAddPatient = () => {
  router.push({ name: 'AddUserPatient' })
}
</script>

<style scoped>
/* Styles de la barre de recherche */
.search-bar-container {
    position: relative;
    width: 300px;
    margin-bottom: 24px;
}

.search-input {
    width: 100%;
    padding: 10px 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 15px;
    outline: none;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.search-input:focus {
    border-color: #0040d0;
    box-shadow: 0 1px 6px rgba(0, 64, 208, 0.2);
}

/* Styles existants pour la gestion des patients */
.patient-management {
  padding: 32px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h2 {
  font-size: 22px;
  color: #002580;
}

.btn-add {
  background-color: #0040d0;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.table-container {
  overflow-x: auto;
}

.patient-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.patient-table th,
.patient-table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.patient-table th {
  background-color: #f5f7fa;
  color: #333;
}

.badge-success {
  color: green;
  font-weight: bold;
}

.badge-inactif {
  color: #999;
  font-style: italic;
}

.btn-action,
.btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  margin-right: 8px;
}

.loading-message, .error-message, .no-data-message {
  text-align: center;
  padding: 20px;
  font-size: 1.1em;
  color: #555;
}
.error-message {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 5px;
  margin-bottom: 15px;
}
.no-data-message {
    color: #888;
    font-style: italic;
}
</style>
