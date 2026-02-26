<template>
  <AdminLayout>
    <div class="regional-stats-container">
      
      <header class="stats-header">
        <div class="header-left">
          <button @click="$router.back()" class="btn-back" title="Retour">
            <span class="arrow">←</span>
          </button>
          <div class="header-text">
            <h2 class="page-title">Tableau de Bord : District de Bamako</h2>
            <p class="subtitle">Vue d'ensemble du personnel et de la patientèle.</p>
          </div>
        </div>
        <button class="btn-refresh" @click="refreshAllData" :disabled="isLoading">
          {{ isLoading ? 'Synchronisation...' : 'Actualiser les données' }}
        </button>
      </header>

      <div class="stats-grid">
        <div class="stat-card patients">
          <div class="icon-box">👥</div>
          <div class="data-box">
            <h3>{{ totalPatients }}</h3>
            <p>Patients</p>
          </div>
        </div>

        <div class="stat-card doctors">
          <div class="icon-box">🩺</div>
          <div class="data-box">
            <h3>{{ totalDoctors }}</h3>
            <p>Médecins</p>
          </div>
        </div>

        <div class="stat-card nurses">
          <div class="icon-box">💊</div>
          <div class="data-box">
            <h3>{{ totalNurses }}</h3>
            <p>Infirmiers</p>
          </div>
        </div>

        <div class="stat-card technicians">
          <div class="icon-box">🧪</div>
          <div class="data-box">
            <h3>{{ totalTechnicians }}</h3>
            <p>Techniciens</p>
          </div>
        </div>

        <div class="stat-card urgentists">
          <div class="icon-box">🚑</div>
          <div class="data-box">
            <h3>{{ totalUrgentists }}</h3>
            <p>Urgentistes</p>
          </div>
        </div>
      </div>

      <div class="chart-section">
        <div class="chart-header">
          <h4>Analyse Comparative du Personnel</h4>
          <span class="badge">Live Data</span>
        </div>
        <div class="chart-wrapper">
          <Bar v-if="!isLoading" :data="chartData" :options="chartOptions" />
          <div v-else class="chart-skeleton">Chargement de l'analyse...</div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { ref, computed, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale
} from 'chart.js'

// Stores
import { usePatientStore } from '@/stores/patientStore'
import { useDoctorStore } from '@/stores/doctorStore'
import { useNurseStore } from '@/stores/nurseStore'
import { useLabTechnicianStore } from '@/stores/labTechnicianStore'
import { useUrgentistStore } from '@/stores/urgentistStore'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const patientStore = usePatientStore()
const doctorStore = useDoctorStore()
const nurseStore = useNurseStore()
const labTechnicianStore = useLabTechnicianStore()
const urgentistStore = useUrgentistStore()

const isLoading = ref(false)

const refreshAllData = async () => {
  isLoading.value = true
  try {
    await Promise.all([
      patientStore.allPatient(),
      doctorStore.fetchAllDoctors(),
      nurseStore.fetchAllNurses(),
      labTechnicianStore.fetchAllLabTechnicians(),
      urgentistStore.fetchAllUrgentists()
    ])
  } finally {
    isLoading.value = false
  }
}

onMounted(refreshAllData)

// Computeds
const totalPatients = computed(() => patientStore.patients?.data?.length || 0)
const totalDoctors = computed(() => doctorStore.doctors?.length || 0)
const totalNurses = computed(() => nurseStore.nurses?.length || 0)
const totalTechnicians = computed(() => labTechnicianStore.labTechnicians?.length || 0)
const totalUrgentists = computed(() => urgentistStore.allUrgentists?.length || 0)

const chartData = computed(() => ({
  labels: ['Patients', 'Médecins', 'Infirmiers', 'Techniciens', 'Urgentistes'],
  datasets: [
    {
      label: 'Effectifs',
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ef4444'],
      borderRadius: 8,
      data: [
        totalPatients.value,
        totalDoctors.value,
        totalNurses.value,
        totalTechnicians.value,
        totalUrgentists.value
      ]
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: { grid: { display: false }, beginAtZero: true },
    x: { grid: { display: false } }
  }
}
</script>
<style scoped>
/* Conteneur principal flexible */
.regional-stats-container { 
  padding: 15px; /* Réduit pour mobile */
  max-width: 1200px; 
  margin: 0 auto; 
}

/* Header Adaptatif */
.stats-header { 
  display: flex; 
  flex-direction: row; /* Par défaut en ligne */
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 25px; 
  gap: 15px;
}

.header-left { display: flex; align-items: center; gap: 12px; }

/* Grille de cartes intelligente */
.stats-grid { 
  display: grid; 
  /* Utilisation de auto-fill pour s'adapter à la largeur disponible */
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); 
  gap: 15px; 
  margin-bottom: 30px; 
}

/* Stat Card optimisée pour le mobile */
.stat-card {
  background: white; 
  padding: 15px; 
  border-radius: 16px;
  display: flex; 
  align-items: center; 
  gap: 12px;
  border: 1px solid #f1f5f9;
}

.icon-box {
  width: 44px; height: 44px; /* Plus petit sur mobile */
  flex-shrink: 0; /* Empêche l'icône de s'écraser */
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center; font-size: 20px;
}

.data-box h3 { margin: 0; font-size: 20px; color: #1e293b; line-height: 1; }
.data-box p { margin: 0; font-size: 11px; color: #64748b; font-weight: 700; }

/* Graphique avec scroll horizontal si nécessaire */
.chart-section {
  background: white; 
  padding: 20px; 
  border-radius: 20px;
  border: 1px solid #f1f5f9;
  overflow: hidden; /* Important pour Chart.js */
}

.chart-wrapper { 
  height: 300px; 
  position: relative; 
  width: 100%;
}

/* Media Queries pour ajustements fins */

/* Tablettes et mobiles larges */
@media (max-width: 768px) {
  .stats-header {
    flex-direction: column; /* Empile le titre et le bouton refresh */
    align-items: flex-start;
  }
  
  .btn-refresh {
    width: 100%; /* Bouton prend toute la largeur sur mobile */
    text-align: center;
  }

  .page-title { font-size: 20px; }
  
  .stats-grid {
    grid-template-columns: 1fr 1fr; /* 2 colonnes sur tablette */
  }
}

/* Petits Mobiles (Smartphones) */
@media (max-width: 480px) {
  .regional-stats-container { padding: 10px; }
  
  .stats-grid {
    grid-template-columns: 1fr; /* 1 seule colonne sur petit mobile */
  }
  
  .stat-card {
    padding: 20px; /* On redonne un peu d'espace quand c'est en plein écran */
  }

  .chart-section { padding: 15px; }
  
  .chart-wrapper { height: 250px; } /* Graphique plus court pour ne pas manger tout l'écran */
}
</style>