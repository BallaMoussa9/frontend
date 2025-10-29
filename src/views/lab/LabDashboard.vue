<template>
  <LabLayout>
    <div class="lab-dashboard">
      <div class="welcome-box">
        <h2>Bienvenue {{ lab.name }}</h2>
        <p>Poste : Technicien de laboratoire</p>
      </div>

      <!-- Statistiques principales -->
      <div class="stats">
        <div class="stat-card" v-for="stat in stats" :key="stat.label">
          <h3>{{ stat.value }}</h3>
          <p>{{ stat.label }}</p>
        </div>
      </div>

      <!-- Résumé Santé -->
      <div class="overview-section">
        <div class="vital-box" v-for="vital in vitals" :key="vital.label">
          <h4>{{ vital.label }}</h4>
          <p>{{ vital.value }}</p>
        </div>
      </div>

      <!-- Zone graphique -->
      <div class="chart-container">
        <h3>Analyse de la glycémie cette semaine</h3>
        <Line :data="glucoseChartData" :options="chartOptions" />
      </div>

      <!-- Examens et résultats -->
      <div class="section">
        <div class="card">
          <h3>Examens à effectuer</h3>
          <ul>
            <li v-for="exam in pendingExams" :key="exam.id">
              {{ exam.patient }} - {{ exam.test }}
            </li>
          </ul>
        </div>

        <div class="card">
          <h3>Résultats envoyés aujourd'hui</h3>
          <ul>
            <li v-for="result in sentResults" :key="result.id">
              {{ result.patient }} - {{ result.test }} à {{ result.time }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Historique -->
      <div class="history">
        <h3>Historique des analyses</h3>
        <ul>
          <li v-for="analysis in analysisHistory" :key="analysis.id">
            {{ analysis.date }} - {{ analysis.patient }} : {{ analysis.test }}
          </li>
        </ul>
      </div>
    </div>
  </LabLayout>
</template>

<script setup>
import LabLayout from '@/layouts/LabLayout.vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement)

const lab = { name: 'Drissa Camara' }

const stats = [
  { label: 'Analyses en attente', value: 12 },
  { label: 'Analyses traitées', value: 324 },
  { label: 'Résultats envoyés', value: 318 },
  { label: 'Urgences traitées', value: 6 },
]

const vitals = [
  { label: 'Rythme cardiaque', value: '83 bpm - Normal' },
  { label: 'Tension artérielle', value: '115 / 70' },
  { label: 'Glycémie', value: '230 mg/dL' },
  { label: 'Formule sanguine', value: '80 - 90' },
]

const pendingExams = [
  { id: 1, patient: 'Fatou T.', test: 'Hémogramme' },
  { id: 2, patient: 'Moussa K.', test: 'Glycémie' },
]

const sentResults = [
  { id: 1, patient: 'Aminata D.', test: 'Urée', time: '09:30' },
  { id: 2, patient: 'Seydou C.', test: 'Créatinine', time: '10:00' },
]

const analysisHistory = [
  { id: 1, date: '08/07/2025', patient: 'Bintou S.', test: 'Cholestérol' },
  { id: 2, date: '08/07/2025', patient: 'Idrissa D.', test: 'TSH' },
  { id: 3, date: '07/07/2025', patient: 'Fatou T.', test: 'Bilan hépatique' },
]

// 🧪 Données du graphique glycémie
const glucoseChartData = {
  labels: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  datasets: [
    {
      label: 'Glycémie (mg/dL)',
      backgroundColor: '#c6f1e7',
      borderColor: '#00a88f',
      data: [180, 190, 210, 200, 220, 230],
      fill: true,
      tension: 0.4,
    }
  ]
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true },
    title: { display: false }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}
</script>

<style scoped>
.lab-dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.welcome-box {
  background-color: #e7faff;
  padding: 16px;
  border-radius: 10px;
}

.stats {
  display: flex;
  gap: 16px;
}

.stat-card {
  background: white;
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  flex: 1;
  text-align: center;
}

.overview-section {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.vital-box {
  flex: 1;
  min-width: 220px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 0 6px rgba(0,0,0,0.04);
}

.chart-container {
  background: white;
  padding: 20px;
  border-radius: 12px;
  height: 300px;
  box-shadow: 0 0 6px rgba(0,0,0,0.04);
}

.section {
  display: flex;
  gap: 16px;
}

.card {
  flex: 1;
  background: white;
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.history {
  background: white;
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.history ul li {
  margin-bottom: 6px;
}
</style>
