<template>
  <AdminLayout>
    <div class="patient-management">
      <header class="header">
        <div class="header-left">
          <button @click="router.back()" class="btn-back" title="Retour">
            <span class="arrow">←</span>
          </button>
          <div class="title-group">
            <h2>Gestion des patients</h2>
            <span class="count-badge" v-if="filteredPatients.length > 0">
              {{ filteredPatients.length }} patients répertoriés
            </span>
          </div>
        </div>
        <button class="btn-add" @click="openAddPatient">
          <span>➕</span> Ajouter un patient
        </button>
      </header>

      <div class="search-section">
        <div class="search-bar-wrapper">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            v-model="patientStore.searchTerm"
            @input="handleSearchInput"
            placeholder="Rechercher par nom, email ou statut (min. 3 car.)..."
            class="search-input"
          />
          <button v-if="patientStore.searchTerm" @click="clearSearch" class="btn-clear-search">✕</button>
        </div>
      </div>

      <div class="feedback-area">
        <div v-if="patientStore.isLoading" class="state-msg loading">
          <div class="mini-spinner"></div> Chargement des dossiers patients...
        </div>
        <div v-if="patientStore.error" class="state-msg error">
          ⚠️ {{ patientStore.error }}
        </div>
      </div>

      <div class="table-card" v-if="!patientStore.isLoading">
        <div class="table-responsive">
          <table class="patient-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Patient</th>
                <th>Date de Naissance</th>
                <th>Coordonnées</th>
                <th>Statut</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!filteredPatients || filteredPatients.length === 0">
                <td colspan="6" class="no-data">
                  <div class="empty-ui">
                    <span class="empty-icon">📁</span>
                    <p>Aucun patient trouvé.</p>
                    <small v-if="patientStore.searchTerm">Aucun résultat pour "{{ patientStore.searchTerm }}"</small>
                  </div>
                </td>
              </tr>

              <tr v-else v-for="(patient, index) in filteredPatients" :key="patient.id">
                <td class="col-id">{{ index + 1 }}</td>
                <td>
                  <div class="user-info">
                    <div class="avatar-sm">{{ patient.user?.first_name?.charAt(0) }}{{ patient.user?.last_name?.charAt(0) }}</div>
                    <div>
                      <div class="name">{{ patient.user?.first_name }} {{ patient.user?.last_name }}</div>
                      <div class="sub-text">Patient ID: #{{ patient.id }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="date-text">📅 {{ patient.user?.birth_date || 'N/A' }}</div>
                </td>
                <td>
                  <div class="contact-info">
                    <span class="email">📧 {{ patient.user?.email }}</span>
                    <span class="phone">📞 {{ patient.user?.phone || 'Non renseigné' }}</span>
                  </div>
                </td>
                <td>
                  <span :class="patient.status === 'actif' ? 'badge-success' : 'badge-inactif'">
                    {{ patient.status === 'actif' ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td class="text-right">
                  <div class="action-buttons">
                    <RouterLink :to="{ name: 'SeenDossiert', params: { id: patient.id } }" class="btn-action view" title="Voir le dossier">
                      📁
                    </RouterLink>
                    <RouterLink :to="{ name: 'EditPatient', params: { id: patient.id } }" class="btn-action edit" title="Modifier">
                      ✏️
                    </RouterLink>
                    <button class="btn-action delete" @click="confirmDelete(patient.id)" title="Supprimer">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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

const alphabeticalSort = (a, b) => {
    const nameA = `${a.user?.first_name || ''} ${a.user?.last_name || ''}`.toLowerCase();
    const nameB = `${b.user?.first_name || ''} ${b.user?.last_name || ''}`.toLowerCase();
    return nameA.localeCompare(nameB);
};

const handleSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    const term = patientStore.searchTerm?.trim() || '';
    if (term.length >= 3) {
      await patientStore.searchPatients(term);
    } else if (term === '') {
      await patientStore.allPatient();
    }
  }, 400);
};

const clearSearch = async () => {
  patientStore.searchTerm = '';
  await patientStore.allPatient();
};

const filteredPatients = computed(() => {
  const patientsData = patientStore.patients?.data || [];
  const term = patientStore.searchTerm?.trim().toLowerCase() || '';

  if (!term || term.length < 3) {
    return [...patientsData].sort(alphabeticalSort);
  }

  const getScore = (patient) => {
    const fn = patient.user?.first_name?.toLowerCase() || '';
    const ln = patient.user?.last_name?.toLowerCase() || '';
    if (fn.startsWith(term) || ln.startsWith(term)) return 0;
    if (fn.includes(term) || ln.includes(term)) return 1;
    return 2;
  };

  return [...patientsData].sort((a, b) => {
    const scoreA = getScore(a);
    const scoreB = getScore(b);
    return scoreA !== scoreB ? scoreA - scoreB : alphabeticalSort(a, b);
  });
});

const confirmDelete = (id) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce dossier patient ? Cette action est irréversible.')) {
    // Appel à ta méthode de suppression dans le store
    console.log('Suppression du patient:', id);
  }
};

onMounted(async () => {
  if (patientStore.searchTerm && patientStore.searchTerm.length >= 3) {
    await patientStore.searchPatients(patientStore.searchTerm);
  } else {
    await patientStore.allPatient();
  }
});

const openAddPatient = () => {
  router.push({ name: 'AddUserPatient' })
}
</script>

<style scoped>
.patient-management { padding: 30px; background: #f8fafc; min-height: 100vh; }

/* Header & Nav */
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.header-left { display: flex; align-items: center; gap: 20px; }

.btn-back {
  width: 40px; height: 40px; border-radius: 10px; border: 1px solid #e2e8f0;
  background: white; cursor: pointer; transition: 0.2s; color: #64748b;
}
.btn-back:hover { background: #f1f5f9; transform: translateX(-3px); color: #0040d0; }

.title-group h2 { font-size: 24px; color: #1e293b; margin: 0; font-weight: 800; }
.count-badge { font-size: 12px; background: #e0e7ff; color: #4338ca; padding: 4px 12px; border-radius: 20px; font-weight: 600; margin-top: 4px; display: inline-block; }

.btn-add { background: #0040d0; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 700; transition: 0.2s; }
.btn-add:hover { background: #0035b0; transform: translateY(-2px); }

/* Recherche */
.search-section { margin-bottom: 25px; }
.search-bar-wrapper { position: relative; max-width: 500px; display: flex; align-items: center; }
.search-icon { position: absolute; left: 15px; color: #94a3b8; }
.search-input {
  width: 100%; padding: 12px 15px 12px 45px; border: 1px solid #e2e8f0; border-radius: 12px;
  background: white; font-size: 14px; transition: 0.3s;
}
.search-input:focus { border-color: #0040d0; outline: none; box-shadow: 0 0 0 4px rgba(0, 64, 208, 0.05); }
.btn-clear-search { position: absolute; right: 10px; background: none; border: none; color: #94a3b8; cursor: pointer; padding: 5px; }

/* Table Card */
.table-card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; }
.patient-table { width: 100%; border-collapse: collapse; }
.patient-table th { background: #f8fafc; color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; padding: 16px; text-align: left; }
.patient-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }

.user-info { display: flex; align-items: center; gap: 12px; }
.avatar-sm { width: 38px; height: 38px; background: #f1f5f9; color: #475569; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; border: 1px solid #e2e8f0; }
.name { font-weight: 700; color: #1e293b; }
.sub-text { font-size: 11px; color: #94a3b8; }

.contact-info { display: flex; flex-direction: column; gap: 2px; font-size: 13px; }
.contact-info .email { color: #64748b; }
.contact-info .phone { color: #1e293b; font-weight: 500; }
.date-text { color: #64748b; font-weight: 500; }

/* Badges */
.badge-success { background: #dcfce7; color: #15803d; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
.badge-inactif { background: #f1f5f9; color: #64748b; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; font-style: italic; }

/* Actions */
.text-right { text-align: right !important; }
.action-buttons { display: flex; gap: 8px; justify-content: flex-end; }
.btn-action { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: none; cursor: pointer; transition: 0.2s; background: #f8fafc; text-decoration: none; font-size: 14px; }
.btn-action:hover { transform: scale(1.1); }
.btn-action.view { color: #0040d0; }
.btn-action.edit { color: #f59e0b; }
.btn-action.delete { color: #ef4444; }

/* Feedback & Empty State */
.state-msg { padding: 12px 20px; border-radius: 10px; margin-bottom: 20px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
.loading { background: #eff6ff; color: #2563eb; }
.error { background: #fef2f2; color: #dc2626; }

.no-data { padding: 60px !important; text-align: center; }
.empty-ui { display: flex; flex-direction: column; align-items: center; gap: 10px; color: #94a3b8; }
.empty-icon { font-size: 40px; }

.mini-spinner { width: 16px; height: 16px; border: 2px solid #2563eb; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>