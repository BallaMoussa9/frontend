<template>
  <AdminLayout>
    <div class="statistique-page">
      <header class="page-header">
        <div class="header-left">
          <button @click="$router.back()" class="btn-back" title="Retour">
            <span class="arrow">←</span>
          </button>
          <div class="header-text">
            <h2 class="page-title">Statistiques Générales</h2>
            <p class="subtitle">Vue d'ensemble des indicateurs de performance de l'hôpital.</p>
          </div>
        </div>
        <button class="btn-refresh" @click="refreshData" :disabled="isLoading">
          {{ isLoading ? 'Actualisation...' : '🔄 Actualiser' }}
        </button>
      </header>

      <div class="stats-grid">
        <div class="stat-card patients">
          <div class="icon-box">👥</div>
          <div class="data-box">
            <h3>{{ totalPatients }}</h3>
            <p>Total Patients</p>
            <span class="trend positive">+12%</span>
          </div>
        </div>

        <div class="stat-card appointments">
          <div class="icon-box">📅</div>
          <div class="data-box">
            <h3>{{ totalAppointments }}</h3>
            <p>Rendez-vous</p>
            <span class="trend positive">+8%</span>
          </div>
        </div>

        <div class="stat-card doctors">
          <div class="icon-box">👨‍⚕️</div>
          <div class="data-box">
            <h3>{{ totalDoctors }}</h3>
            <p>Médecins Actifs</p>
            <span class="trend neutral">0%</span>
          </div>
        </div>

        <div class="stat-card revenue">
          <div class="icon-box">💰</div>
          <div class="data-box">
            <h3>{{ formatCurrency(totalRevenue) }}</h3>
            <p>Revenus Mensuels</p>
            <span class="trend positive">+15%</span>
          </div>
        </div>
      </div>

      <div class="charts-section">
        <div class="chart-container">
          <div class="chart-header">
            <h4>Évolution des Patients</h4>
            <select v-model="selectedPeriod" class="period-select">
              <option value="week">Dernière semaine</option>
              <option value="month">Dernier mois</option>
              <option value="year">Dernière année</option>
            </select>
          </div>
          <div class="chart-wrapper">
            <canvas ref="patientChart"></canvas>
          </div>
        </div>

        <div class="chart-container">
          <div class="chart-header">
            <h4>Répartition par Département</h4>
          </div>
          <div class="chart-wrapper">
            <canvas ref="departmentChart"></canvas>
          </div>
        </div>
      </div>

      <div class="table-section">
        <div class="section-header">
          <h4>Activités Récentes</h4>
          <button class="btn-export">📊 Exporter</button>
        </div>
        <div class="table-container">
          <table class="activity-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Utilisateur</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="activity in recentActivities" :key="activity.id">
                <td>{{ formatDate(activity.date) }}</td>
                <td>
                  <span :class="getActivityTypeClass(activity.type)">
                    {{ activity.type }}
                  </span>
                </td>
                <td>{{ activity.description }}</td>
                <td>{{ activity.user }}</td>
                <td>
                  <span :class="getStatusClass(activity.status)">
                    {{ activity.status }}
                  </span>
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
import { ref, onMounted, computed } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const isLoading = ref(false)
const selectedPeriod = ref('month')
const patientChart = ref(null)
const departmentChart = ref(null)

// Données simulées
const totalPatients = ref(1247)
const totalAppointments = ref(384)
const totalDoctors = ref(42)
const totalRevenue = ref(284750)

const recentActivities = ref([
  {
    id: 1,
    date: '2025-03-24T10:30:00',
    type: 'Consultation',
    description: 'Patient admis en cardiologie',
    user: 'Dr. Konaté',
    status: 'Terminé'
  },
  {
    id: 2,
    date: '2025-03-24T09:15:00',
    type: 'Laboratoire',
    description: 'Analyse sanguine complète',
    user: 'Labo Tech',
    status: 'En cours'
  },
  {
    id: 3,
    date: '2025-03-24T08:45:00',
    type: 'Urgence',
    description: 'Traumatologie - Urgence',
    user: 'Dr. Traoré',
    status: 'Terminé'
  }
])

const refreshData = async () => {
  isLoading.value = true
  // Simuler un chargement
  setTimeout(() => {
    isLoading.value = false
  }, 1500)
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF'
  }).format(amount)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getActivityTypeClass = (type) => {
  const classes = {
    'Consultation': 'type-consultation',
    'Laboratoire': 'type-laboratoire',
    'Urgence': 'type-urgence'
  }
  return classes[type] || 'type-default'
}

const getStatusClass = (status) => {
  const classes = {
    'Terminé': 'status-success',
    'En cours': 'status-warning',
    'En attente': 'status-info'
  }
  return classes[status] || 'status-default'
}

// Initialisation des graphiques
onMounted(() => {
  // Graphique d'évolution des patients
  if (patientChart.value) {
    new Chart(patientChart.value, {
      type: 'line',
      data: {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        datasets: [{
          label: 'Patients',
          data: [65, 78, 90, 81, 96, 85, 92],
          borderColor: '#0040d0',
          backgroundColor: 'rgba(0, 64, 208, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    })
  }

  // Graphique de répartition par département
  if (departmentChart.value) {
    new Chart(departmentChart.value, {
      type: 'doughnut',
      data: {
        labels: ['Cardiologie', 'Urgences', 'Pédiatrie', 'Laboratoire', 'Radiologie'],
        datasets: [{
          data: [30, 25, 20, 15, 10],
          backgroundColor: [
            '#0040d0',
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#8b5cf6'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    })
  }
})
</script>

<style scoped>
.statistique-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
  background-color: #f8fafc;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.btn-back {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.btn-back:hover {
  background: #f1f5f9;
  transform: translateX(-3px);
  color: #0040d0;
}

.page-title {
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.subtitle {
  color: #64748b;
  font-size: 14px;
  margin: 4px 0 0 0;
}

.btn-refresh {
  background: #0040d0;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-refresh:hover:not(:disabled) {
  background: #0035b0;
  transform: translateY(-1px);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 12px -2px rgba(0, 0, 0, 0.1);
}

.icon-box {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.patients .icon-box { background: #eff6ff; }
.appointments .icon-box { background: #f0fdf4; }
.doctors .icon-box { background: #fef3c7; }
.revenue .icon-box { background: #f3e8ff; }

.data-box {
  flex: 1;
}

.data-box h3 {
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.data-box p {
  color: #64748b;
  font-size: 14px;
  margin: 4px 0 8px 0;
}

.trend {
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
}

.trend.positive {
  background: #dcfce7;
  color: #15803d;
}

.trend.negative {
  background: #fef2f2;
  color: #b91c1c;
}

.trend.neutral {
  background: #f1f5f9;
  color: #64748b;
}

/* Charts Section */
.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 25px;
  margin-bottom: 30px;
}

.chart-container {
  background: white;
  border-radius: 16px;
  padding: 25px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h4 {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.period-select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #1e293b;
  font-size: 14px;
}

.chart-wrapper {
  height: 300px;
  position: relative;
}

/* Table Section */
.table-section {
  background: white;
  border-radius: 16px;
  padding: 25px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h4 {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.btn-export {
  background: #10b981;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn-export:hover {
  background: #059669;
  transform: translateY(-1px);
}

.activity-table {
  width: 100%;
  border-collapse: collapse;
}

.activity-table th {
  background: #f8fafc;
  color: #64748b;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.activity-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
  color: #1e293b;
}

.activity-table tbody tr:hover {
  background: #f8fafc;
}

/* Type badges */
.type-consultation { background: #eff6ff; color: #0040d0; }
.type-laboratoire { background: #f0fdf4; color: #10b981; }
.type-urgence { background: #fef2f2; color: #ef4444; }
.type-default { background: #f1f5f9; color: #64748b; }

/* Status badges */
.status-success { background: #dcfce7; color: #15803d; }
.status-warning { background: #fef3c7; color: #92400e; }
.status-info { background: #eff6ff; color: #0040d0; }
.status-default { background: #f1f5f9; color: #64748b; }

.type-consultation, .type-laboratoire, .type-urgence, .type-default,
.status-success, .status-warning, .status-info, .status-default {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  display: inline-block;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .statistique-page {
    padding: 20px 15px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .btn-refresh {
    width: 100%;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .chart-container {
    padding: 20px;
  }
  
  .chart-wrapper {
    height: 250px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .btn-export {
    width: 100%;
  }
  
  .activity-table {
    font-size: 13px;
  }
  
  .activity-table th,
  .activity-table td {
    padding: 8px;
  }
}
</style>