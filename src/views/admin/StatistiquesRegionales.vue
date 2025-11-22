<template>
  <AdminLayout>
    <div class="regional-stats">
      <h2 class="page-title">Statistiques de Bamako</h2>

      <div class="stats-cards">
        <div class="card">
          <h3>{{ totalPatients }}</h3>
          <p>Patients enregistrés</p>
        </div>
        <div class="card">
          <h3>{{ totalDoctors }}</h3>
          <p>Médecins</p>
        </div>
        <div class="card">
          <h3>{{ totalNurses }}</h3>
          <p>Infirmiers</p>
        </div>
        <div class="card">
          <h3>{{ totalTechnicians }}</h3>
          <p>Techniciens de laboratoire</p>
        </div>
        <div class="card">
          <h3>{{ totalUrgentists }}</h3>
          <p>Urgentistes</p>
        </div>
      </div>

      <div class="chart-container">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { ref, computed, onMounted, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

// Importez les stores Pinia
import { usePatientStore } from '@/stores/patientStore'
import { useDoctorStore } from '@/stores/doctorStore'
import { useNurseStore } from '@/stores/nurseStore'
import { useLabTechnicianStore } from '@/stores/labTechnicianStore'
import { useUrgentistStore } from '@/stores/urgentistStore'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

// Initialisation des stores
const patientStore = usePatientStore()
const doctorStore = useDoctorStore()
const nurseStore = useNurseStore()
const labTechnicianStore = useLabTechnicianStore()
const urgentistStore = useUrgentistStore()

// Déclenchement des actions pour charger les données au montage du composant
onMounted(() => {
  patientStore.allPatient();
  doctorStore.fetchAllDoctors();
  nurseStore.fetchAllNurses();
  labTechnicianStore.fetchAllLabTechnicians();
  urgentistStore.fetchAllUrgentists();
});

// Propriétés calculées pour les nombres totaux
const totalPatients = computed(() => {
  // Accès aux patients : Suppose que patientStore.patients est un objet paginé { data: [...] }
  const count = patientStore.patients && patientStore.patients.data && Array.isArray(patientStore.patients.data)
                ? patientStore.patients.data.length
                : 0;
  return count;
});

// Les watchers et logs de débogage sont maintenus pour une meilleure traçabilité
watch(() => patientStore.patients, (newValue, oldValue) => {
  console.log("Statistiques de Bamako: patientStore.patients a changé !", { oldValue, newValue });
  if (newValue && newValue.data && Array.isArray(newValue.data)) {
    console.log(`Statistiques de Bamako: patientStore.patients.data est maintenant un tableau de ${newValue.data.length} éléments.`);
  } else {
    console.log("Statistiques de Bamako: patientStore.patients n'est pas un objet de pagination avec une propriété 'data' ou est null/undefined.");
  }
}, { immediate: true });


const totalDoctors = computed(() => doctorStore.doctors ? doctorStore.doctors.length : 0);
const totalNurses = computed(() => nurseStore.nurses ? nurseStore.nurses.length : 0);
const totalTechnicians = computed(() => labTechnicianStore.labTechnicians ? labTechnicianStore.labTechnicians.length : 0);

// ✅ CORRECTION CRITIQUE : Utilisation de l'état "allUrgentists" qui est le nom réel dans le store.
const totalUrgentists = computed(() => urgentistStore.allUrgentists ? urgentistStore.allUrgentists.length : 0);


// Données pour le graphique basées sur les statistiques globales
const chartData = computed(() => {
  const globalStatsForChart = [
    { label: 'Patients', value: totalPatients.value },
    { label: 'Médecins', value: totalDoctors.value },
    { label: 'Infirmiers', value: totalNurses.value },
    { label: 'Techniciens', value: totalTechnicians.value },
    { label: 'Urgentistes', value: totalUrgentists.value },
  ];

  return {
    labels: globalStatsForChart.map(s => s.label),
    datasets: [
      {
        label: `Statistiques de Bamako`,
        backgroundColor: '#0040d0',
        data: globalStatsForChart.map(s => s.value),
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: true, text: 'Répartition du Personnel et des Patients à Bamako' }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
};
</script>

<style scoped>
.regional-stats {
  padding: 32px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #002580;
  margin-bottom: 20px;
  text-align: center;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.04);
  text-align: center;
}

.card h3 {
  font-size: 28px;
  color: #0040d0;
  margin: 0;
}
.card p {
  font-size: 14px;
  color: #4a5568;
}

.chart-container {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 0 8px rgba(0,0,0,0.05);
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 30px;
}
</style>