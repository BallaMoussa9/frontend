<template>
  <AdminLayout>
    <div class="medical-records-wrapper">
      <header class="page-header">
        <div class="title-section">
          <button @click="router.back()" class="btn-back" title="Retour">
            <span class="arrow">←</span>
          </button>
          
          <div class="header-text">
            <h2>Dossiers médicaux</h2>
            <span class="count-badge" v-if="recordsWithNames.length">
              {{ recordsWithNames.length }} dossiers au total
            </span>
          </div>
        </div>

        <button class="btn-add" @click="ajouterDossier">
          <span class="plus">＋</span> 
          <span class="btn-label">Créer un dossier</span>
        </button>
      </header>

      <div v-if="loading" class="state-container">
        <div class="spinner"></div>
        <p>Récupération des dossiers patient...</p>
      </div>

      <div v-else-if="recordsWithNames.length === 0" class="state-container empty">
        <div class="empty-icon">📁</div>
        <p>Aucun dossier médical n'a été trouvé dans la base.</p>
      </div>

      <div v-else class="table-card">
        <div class="table-responsive">
          <table class="records-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Patient</th>
                <th>Médecin référent</th>
                <th>Date création</th>
                <th>Statut</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(record, index) in recordsWithNames" :key="record.id">
                <td class="col-id">{{ index + 1 }}</td>
                <td>
                  <div class="patient-cell">
                    <span class="name">{{ record.patient_name }}</span>
                    <span class="ref">REF: #{{ record.id }}</span>
                  </div>
                </td>
                <td>
                  <div class="doctor-cell">
                    <span class="doctor-tag">Dr.</span> {{ record.doctor_name }}
                  </div>
                </td>
                <td class="date-cell">{{ formatDate(record.created_at) }}</td>
                <td>
                  <span :class="['status-pill', record.status === 'complet' ? 'complet' : 'en-cours']">
                    {{ record.status }}
                  </span>
                </td>
                <td class="text-right">
                  <div class="action-group">
                    <RouterLink :to="{ name: 'SeenDossiert', params: { id: record.id } }" class="btn-view" title="Consulter">
                      👁️
                    </RouterLink>
                    <RouterLink :to="{ name: 'EditMedicalRecord', params: { id: record.id } }" class="btn-edit" title="Modifier">
                      ✏️
                    </RouterLink>
                    <button class="btn-delete" title="Supprimer" @click="goDelet(record.id)">
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
import AdminLayout from '@/layouts/AdminLayout.vue';
import { useRouter, RouterLink } from 'vue-router';
import { useMedicalRecordStore } from '@/stores/medicalrecordStore';
import { usePatientStore } from '@/stores/patientStore';
import { useDoctorStore } from '@/stores/doctorStore';
import { onMounted, computed } from 'vue';

const router = useRouter();
const medicalRecordStore = useMedicalRecordStore();
const patientStore = usePatientStore();
const doctorStore = useDoctorStore();

/**
 * Fusionne les dossiers avec les noms des patients et médecins
 */
const recordsWithNames = computed(() => {
  if (!medicalRecordStore.records || !patientStore.patients || !doctorStore.doctors) {
    return [];
  }

  const patientsData = Array.isArray(patientStore.patients) 
    ? patientStore.patients 
    : (patientStore.patients.data || []);
    
  const doctorsData = Array.isArray(doctorStore.doctors) 
    ? doctorStore.doctors 
    : (doctorStore.doctors.data || []);

  return medicalRecordStore.records.map(record => {
    const patient = patientsData.find(p => p.id === record.patient_id);
    const doctor = doctorsData.find(d => d.id === record.doctor_id);

    return {
      ...record,
      patient_name: patient 
        ? `${patient.user?.first_name} ${patient.user?.last_name}` 
        : 'Patient inconnu',
      doctor_name: doctor 
        ? `${doctor.user?.first_name} ${doctor.user?.last_name}` 
        : 'Médecin inconnu'
    };
  });
});

const loading = computed(() => {
  return medicalRecordStore.loading || patientStore.loading || doctorStore.loading;
});

const formatDate = (dateString) => {
  if (!dateString) return '---';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const ajouterDossier = () => {
  router.push({ name: 'AddUserDossier' });
};

const goDelet = async (id) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement le dossier médical #${id} ?`)) {
    try {
      await medicalRecordStore.deleteMedicalRecord(id);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  }
};

onMounted(async () => {
  await Promise.all([
    medicalRecordStore.fetchAllMedicalRecords(),
    patientStore.allPatient(),
    doctorStore.fetchAllDoctors()
  ]);
});
</script>

<style scoped>
.medical-records-wrapper {
  padding: 30px;
  background-color: #f8fafc;
  min-height: 100vh;
}

/* Header & Retour */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-back {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #f1f5f9;
  transform: translateX(-3px);
}

.header-text h2 {
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.count-badge {
  font-size: 11px;
  background: #e2e8f0;
  color: #475569;
  padding: 2px 10px;
  border-radius: 20px;
  font-weight: 600;
}

.btn-add {
  background: #0040d0;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Table Styling */
.table-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.records-table {
  width: 100%;
  border-collapse: collapse;
}

.records-table th {
  background: #f8fafc;
  padding: 16px 20px;
  font-size: 12px;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 700;
  text-align: left;
}

.records-table td {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}

/* Cells */
.patient-cell .name { font-weight: 700; color: #1e293b; display: block; }
.patient-cell .ref { font-size: 11px; color: #94a3b8; }
.doctor-tag { color: #3b82f6; font-weight: 800; font-size: 11px; }

/* Status Pills */
.status-pill {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}
.status-pill.complet { background: #dcfce7; color: #16a34a; }
.status-pill.en-cours { background: #fef3c7; color: #d97706; }

/* Actions */
.text-right { text-align: right; }
.action-group { display: flex; gap: 8px; justify-content: flex-end; }
.action-group a, .btn-delete {
  width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
  border-radius: 8px; background: #f1f5f9; border: none; cursor: pointer; text-decoration: none;
}

/* Loading Spinner */
.state-container { text-align: center; padding: 50px; color: #64748b; }
.spinner {
  width: 24px; height: 24px; border: 3px solid #f3f3f3; border-top: 3px solid #0040d0;
  border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 10px;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .btn-label { display: none; }
  .records-table thead { display: none; }
  .records-table tr { display: block; padding: 15px; border-bottom: 5px solid #f1f5f9; }
  .records-table td { display: flex; justify-content: space-between; padding: 8px 0; border: none; }
}
</style>