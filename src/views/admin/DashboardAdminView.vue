<template>
  <AdminLayout>
    <div class="dashboard-admin">
      <div class="top-stats">
        <div class="stat-box" v-for="card in topStats" :key="card.label">
          <div class="icon">{{ card.icon }}</div>
          <div class="details">
            <h3>{{ card.value }}</h3>
            <p>{{ card.label }}</p>
          </div>
        </div>
      </div>

      <div class="middle-section">
        <div class="chart-card large-chart">
          <h4>Status des patients</h4>
          <div class="chart-container">
            <Line :data="statusChartData" :options="chartOptions" />
          </div>
        </div>
      </div>

      <div class="bottom-section">
        <div class="table-section">
          <h4>Demandes de rendez-vous (En attente) 📝</h4>
          <div v-if="appointmentStore.loading" class="loading-message">Chargement des demandes...</div>
          <div v-else-if="pendingAppointments.length === 0" class="empty-message">
            Aucune demande de rendez-vous en attente.
          </div>
          <ul v-else class="appointment-list">
            <li v-for="req in pendingAppointments" :key="req.id">
              <div class="list-item-content">
                <span class="main-info">{{ req.patient_name || 'Patient Inconnu' }}</span>
                <span class="sub-info">{{ req.phone || 'N/A' }} — {{ formatDate(req.appointment_date) }}</span>
              </div>
            </li>
          </ul>
        </div>
        
        <div class="table-section">
          <h4>Patients récents 👤</h4>
          <div v-if="patientStore.loading" class="loading-message">Chargement des patients...</div>
          <div v-else-if="recentPatientsList.length === 0" class="empty-message">
            Aucun patient récent trouvé.
          </div>
          <ul v-else class="recent-patients">
            <li v-for="pat in recentPatientsList" :key="pat.id">
              <div class="list-item-content">
                <span class="main-info">{{ pat.first_name }} {{ pat.last_name }}</span>
                <span class="sub-info">{{ pat.hospital_name || 'Hôpital Inconnu' }} — {{ formatDate(pat.created_at) }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
/* --- TON SCRIPT (INCHANGÉ) --- */
import AdminLayout from '@/layouts/AdminLayout.vue'
import { computed, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import { useAuthStore } from '../../stores/authStores'
import { usePatientStore } from '@/stores/patientStore'
import { useUrgentistStore } from '@/stores/urgentistStore'
import { useNurseStore } from '@/stores/nurseStore'
import { useDoctorStore } from '@/stores/doctorStore'
import { useAppointmentPatientStore } from '@/stores/appointmentPatientStore' 

import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement)

const auth = useAuthStore()
const patientStore = usePatientStore()
const urgentistStore = useUrgentistStore()
const nurseStore = useNurseStore()
const doctorStore = useDoctorStore()
const appointmentStore = useAppointmentPatientStore()

const MAX_RECENT_PATIENTS = 5;
const formatDate = (dateString) => dayjs(dateString).format('DD/MM/YYYY');

onMounted(() => {
  patientStore.allPatient()
  urgentistStore.fetchAllUrgentists()
  nurseStore.fetchAllNurses()
  doctorStore.fetchAllDoctors()
  
  if (auth.user?.role === 'admin' && auth.user.doctor_id) {
    appointmentStore.fetchDoctorAppointments(auth.user.doctor_id);
  }
})

const patientCount = computed(() => 
  Array.isArray(patientStore.patients?.data) ? patientStore.patients.data.length : '...'
)

const totalDoctorsCount = computed(() => {
  const doctors = doctorStore.doctors || []
  return doctorStore.loading ? '...' : doctors.length
})

const urgentistesActifsCount = computed(() => {
  const urgentists = urgentistStore.allUrgentists || []
  const count = urgentists.filter(u => u.status === 'available' || u.status === 'on_duty').length
  return urgentistStore.loading ? '...' : count
})

const totalNursesCount = computed(() => {
  const nurses = nurseStore.nurses || []
  return nurseStore.loading ? '...' : nurses.length
})

const topStats = computed(() => [
  { icon: '🧑‍⚕️', label: 'Nombre de patients', value: patientCount.value },
  { icon: '👨‍⚕️', label: 'Nos médecins', value: totalDoctorsCount.value },
  { icon: '🚑', label: 'Urgentistes Actifs', value: urgentistesActifsCount.value },
  { icon: '💉', label: 'Infirmiers', value: totalNursesCount.value },
])

const pendingAppointments = computed(() => {
  if (!appointmentStore.getAppointments) return [];
  return appointmentStore.getAppointments
    .filter(app => app.status === 'pending' || app.status === 'en_attente')
    .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));
});

const recentPatientsList = computed(() => {
    const patients = patientStore.patients?.data || [];
    return [...patients].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, MAX_RECENT_PATIENTS);
});

const statusChartData = {
  labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
  datasets: [
    { label: 'Guéris', data: [120, 150, 170, 140, 190, 210], borderColor: '#00c897', tension: 0.4 },
    { label: 'En traitement', data: [60, 80, 75, 95, 110, 130], borderColor: '#0040d0', tension: 0.4 }
  ]
}
const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true } } }
</script>

<style scoped>
.dashboard-admin {
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 20px;
  background-color: #f8fafc;
}

/* === Stats Boxes === */
.top-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-box {
  background: white;
  border-radius: 16px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.stat-box .icon {
  font-size: 32px;
  background: #f1f5f9;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.stat-box h3 {
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.stat-box p {
  font-size: 14px;
  color: #64748b;
  margin: 4px 0 0 0;
  font-weight: 500;
}

/* === Chart === */
.chart-card {
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.chart-card h4 {
  margin-bottom: 20px;
  color: #334155;
}

.chart-container {
  height: 300px;
}

/* === Tables === */
.bottom-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
}

.table-section {
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.appointment-list, .recent-patients {
  list-style: none;
  padding: 0;
  margin-top: 15px;
}

.appointment-list li, .recent-patients li {
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.list-item-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.main-info {
  font-weight: 700;
  color: #1e293b;
  font-size: 14px;
}

.sub-info {
  font-size: 12px;
  color: #64748b;
}

.loading-message, .empty-message {
  padding: 30px;
  text-align: center;
  color: #94a3b8;
  font-style: italic;
}
</style>