<template>
  <AdminLayout>
    <div class="dashboard-admin">
      <!-- Statistiques principales -->
      <div class="top-stats">
        <div class="stat-box" v-for="card in topStats" :key="card.label">
          <div class="icon">{{ card.icon }}</div>
          <div class="details">
            <h3>{{ card.value }}</h3>
            <p>{{ card.label }}</p>
          </div>
        </div>
      </div>

      <!-- Graphe + meilleur médecin -->
      <div class="middle-section">
        <div class="chart-card">
          <h4>Status des patients</h4>
          <Line :data="statusChartData" :options="chartOptions" />
        </div>
        <div class="best-doctor">
          <h4>Médecin de l'année</h4>
          <div class="doctor-card">
            <img :src="`http://localhost/storage/${auth.user?.profile_photo}`" class="doctor-img" />
            <div class="info">
              <p class="name">{{ bestDoctor.name }}</p>
              <p class="title">{{ bestDoctor.speciality }}</p>
              <div class="stats">
                <span>Exp: {{ bestDoctor.years }} ans</span>
                <span>Patients: {{ bestDoctor.patients }}</span>
                <span>Scores: {{ bestDoctor.reviews }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Requêtes & patients récents -->
      <div class="bottom-section">
        <div class="table-section">
          <h4>Demandes de rendez-vous</h4>
          <ul class="appointment-list">
            <li v-for="req in appointmentRequests" :key="req.id">
              {{ req.name }} — {{ req.phone }} — {{ req.date }}
            </li>
          </ul>
        </div>
        <div class="table-section">
          <h4>Patients récents</h4>
          <ul class="recent-patients">
            <li v-for="pat in recentPatients" :key="pat.id">
              {{ pat.name }} — {{ pat.hospital }} — {{ pat.date }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { computed,onMounted,watch ,watchEffect} from 'vue'
import { useAuthStore } from '../../stores/authStores'
import { usePatientStore } from '@/stores/patientStore'

import { ref } from 'vue'
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
const auth=useAuthStore()
const Patient = usePatientStore()

onMounted(() => {
  Patient.allPatient()
})
const isPatientLoading = computed(() => !Array.isArray(Patient.patients?.data))

const patientCount = computed(() =>
  Array.isArray(Patient.patients?.data) ? Patient.patients.data.length : null
)
/*
watch(patientList, (newList) => {
  for (const patient of newList) {
    console.log('Patient:', patient.email)
  }
  console.log('Nombre de patients:', newList.length)
})*/
ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement)
const topStats = computed(() => [
  {
    icon: '🧑‍⚕️',
    label: 'Le nombre des patient',
    value: isPatientLoading.value ? 'Chargement...' : patientCount.value
  },
  { icon: '👨‍⚕️', label: 'Nos médecins', value: 23 },
  { icon: '🏥', label: 'Opérations', value: 14 },
  { icon: '💸', label: 'Revenus', value: '5728€' },
])

const bestDoctor = ref({
  name: 'Dr. James Smith',
  speciality: 'Cardiologue - CHU Bamako',
  photo: 'https://via.placeholder.com/100',
  years: 8,
  patients: 2598,
  reviews: 1537,
})

const statusChartData = {
  labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
  datasets: [
    {
      label: 'Guéris',
      data: [120, 150, 170, 140, 190, 210],
      borderColor: '#00c897',
      tension: 0.4
    },
    {
      label: 'En traitement',
      data: [60, 80, 75, 95, 110, 130],
      borderColor: '#0040d0',
      tension: 0.4
    }
  ]
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true },
    title: { display: false },
  }
}

const appointmentRequests = ref([
  { id: 1, name: 'Aminata Touré', phone: '700-200-909', date: '10/07/2025' },
  { id: 2, name: 'Mohamed Keita', phone: '600-300-404', date: '11/07/2025' },
])

const recentPatients = ref([
  { id: 1, name: 'Fatoumata Diallo', hospital: 'CHU Point G', date: '09/07/2025' },
  { id: 2, name: 'Ismael Coulibaly', hospital: 'CHU Kati', date: '08/07/2025' },
])

const profilePhoto = computed(() => auth.profilePhotoUrl)
</script>

<style scoped>
.dashboard-admin {
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding-bottom: 40px;
}

.top-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 20px;
}

.stat-box {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-box .icon {
  font-size: 24px;
}
.stat-box h3 {
  transition: all 0.3s ease;
  min-height: 1.4em;
}

.middle-section {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.chart-card {
  flex: 2;
  background: white;
  padding: 20px;
  border-radius: 12px;
  height: 320px;
  min-width: 320px;
}

.best-doctor {
  flex: 1;
  background: #f0f8ff;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 280px;
}

.doctor-card {
  display: flex;
  gap: 16px;
  align-items: center;
}

.doctor-img {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}

.info .name {
  font-weight: bold;
}

.info .stats {
  font-size: 14px;
  display: flex;
  flex-direction: column;
}

.bottom-section {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.table-section {
  flex: 1;
  background: white;
  padding: 20px;
  border-radius: 12px;
  min-width: 320px;
}

.appointment-list,
.recent-patients {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 14px;
}

.appointment-list li,
.recent-patients li {
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}
</style>
