<template>
  <AdminLayout>
    <div class="medical-records-page">
      <div class="header">
        <h2>Dossiers médicaux</h2>

      </div>
      <div v-if="loading" class="loading-message">
        Chargement des dossiers médicaux...
      </div>
      <div v-else-if="recordsWithNames.length === 0" class="info-message">
        Aucun dossier médical trouvé.
      </div>
      <div v-else class="table-container">
        <table class="records-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Patient</th>
              <th>Médecin référent</th>
              <th>Date de création</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(record, index) in recordsWithNames" :key="record.id">
              <td>{{ index + 1 }}</td>
              <td>{{ record.patient_name }}</td>
              <td>{{ record.doctor_name }}</td>
              <td>{{ record.created_at }}</td>
              <td>
                <span :class="record.status === 'complet' ? 'badge-success' : 'badge-warning'">
                  {{ record.status }}
                </span>
              </td>
              <td>
                <button class="btn-action" title="Voir le dossier">
                  <RouterLink :to="{ name: 'SeenDossiert', params: { id: record.id } }">📁</RouterLink>
                </button>
                <button class="btn-action" title="Modifier">
                  <RouterLink :to="{ name: 'EditMedicalRecord', params: { id: record.id } }"> ✏️</RouterLink>
                </button>
                <button class="btn-delete" title="Supprimer" @click="goDelet(record.id)">🗑</button>
              </td>
            </tr>
          </tbody>
        </table>
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

const recordsWithNames = computed(() => {
  // ✅ Vérification des données et accès au tableau via la propriété .data
  if (!medicalRecordStore.records || !patientStore.patients || !doctorStore.doctors) {
    return [];
  }

  // ✅ Accéder aux données paginées via .data pour les patients et les médecins
  // Cela garantit que vous travaillez avec un tableau
  const patientsData = patientStore.patients.data || [];
  const doctorsData = doctorStore.doctors.data || [];

  return medicalRecordStore.records.map(record => {
    // ✅ Utiliser le tableau `patientsData` pour la recherche
    const patient = patientsData.find(p => p.id === record.patient_id);
    // ✅ Utiliser le tableau `doctorsData` pour la recherche
    const doctor = doctorsData.find(d => d.id === record.doctor_id);

    return {
      ...record,
      // Utiliser l'opérateur de chaînage optionnel `?.` pour éviter les erreurs si les objets ne sont pas encore définis
      patient_name: patient ? `${patient.user?.first_name} ${patient.user?.last_name}` : 'Patient inconnu',
      doctor_name: doctor ? `${doctor.user?.first_name} ${doctor.user?.last_name}` : 'Médecin inconnu'
    };
  });
});

const loading = computed(() => {
  return medicalRecordStore.loading || patientStore.loading || doctorStore.loading;
});

onMounted(() => {
  medicalRecordStore.fetchAllMedicalRecords();
  patientStore.allPatient();
  doctorStore.fetchAllDoctors();
});

const ajouterDossier = () => {
  router.push({ name: 'AddUserDossier' });
};

const goDelet = async (id) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer le dossier médical ${id} ?`)) {
    try {
      await medicalRecordStore.deleteMedicalRecord(id);
      alert(medicalRecordStore.success);
    } catch (error) {
      alert(`Échec de la suppression: ${medicalRecordStore.error}`);
    }
  }
};
</script>

<style scoped>
/* Styles inchangés */
.medical-records-page {
  padding: 32px;
}
.medical-records-page {
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

.records-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.records-table th,
.records-table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.records-table th {
  background-color: #f5f7fa;
  color: #333;
}

.badge-success {
  color: green;
  font-weight: bold;
}

.badge-warning {
  color: orange;
  font-weight: bold;
}

.btn-action,
.btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  margin-right: 8px;
}

.loading-message, .error-message, .info-message {
  text-align: center;
  padding: 20px;
  font-size: 16px;
}

.loading-message {
  color: #0040d0;
}

.error-message {
  color: #d9534f;
}

.info-message {
  color: #555;
}
</style>
