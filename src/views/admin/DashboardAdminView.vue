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
          <Line :data="statusChartData" :options="chartOptions" />
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
              {{ req.patient_name || 'Patient Inconnu' }} — 
              {{ req.phone || 'N/A' }} — 
              {{ formatDate(req.appointment_date) }}
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
              {{ pat.first_name }} {{ pat.last_name }} — 
              {{ pat.hospital_name || 'Hôpital Inconnu' }} — 
              {{ formatDate(pat.created_at) }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { computed, onMounted, ref } from 'vue'
import dayjs from 'dayjs' // Import pour la gestion des dates

// 🔑 IMPORTS DES STORES NÉCESSAIRES
import { useAuthStore } from '../../stores/authStores'
import { usePatientStore } from '@/stores/patientStore'
import { useUrgentistStore } from '@/stores/urgentistStore'
import { useNurseStore } from '@/stores/nurseStore'
import { useDoctorStore } from '@/stores/doctorStore'
// NOUVEL IMPORT
import { useAppointmentPatientStore } from '@/stores/appointmentPatientStore' 

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

// Initialisation des Stores
const auth = useAuthStore()
const patientStore = usePatientStore()
const urgentistStore = useUrgentistStore()
const nurseStore = useNurseStore()
const doctorStore = useDoctorStore()
const appointmentStore = useAppointmentPatientStore() // <-- Initialisation

// Variables et fonctions utilitaires
const MAX_RECENT_PATIENTS = 5; // Nombre maximum de patients récents à afficher

const formatDate = (dateString) => {
  return dayjs(dateString).format('DD/MM/YYYY');
}

// 🚀 DÉCLENCHEMENT DES ACTIONS AU MONTAGE
onMounted(() => {
  patientStore.allPatient()
  urgentistStore.fetchAllUrgentists()
  nurseStore.fetchAllNurses()
  doctorStore.fetchAllDoctors()
  
  // NOTE ADMIN: Puisque nous n'avons pas d'action fetchAllAppointments, 
  // nous faisons une supposition. Si l'Admin est un Docteur dans le système :
  // if (auth.user && auth.user.role === 'doctor') {
  //    appointmentStore.fetchDoctorAppointments(auth.user.id);
  // }
  
  // Dans le doute, nous ferons appel à une fonction de Mock ou laisserons vide
  // jusqu'à ce que l'API Admin soit prête. Pour l'exemple, utilisons un ID 1 de Docteur si Admin a ce rôle
  if (auth.user?.role === 'admin' && auth.user.doctor_id) {
    appointmentStore.fetchDoctorAppointments(auth.user.doctor_id);
  } else {
    // CAS MOCK OU ADMIN PUR: On ne charge rien ou on met un ID fictif pour l'exemple si vous n'avez pas de données globales.
    // Pour ne pas générer d'erreur, nous nous basons uniquement sur les données statiques/calculées.
  }
})

// --- Propriétés calculées pour les Statistiques ---

// Patients
const isPatientLoading = computed(() => !Array.isArray(patientStore.patients?.data))
const patientCount = computed(() =>
  Array.isArray(patientStore.patients?.data) ? patientStore.patients.data.length : '...'
)

// Médecins
const totalDoctorsCount = computed(() => {
  const doctors = doctorStore.doctors || []
  return doctorStore.loading ? 'Chargement...' : doctors.length
})

// Urgentistes Actifs
const urgentistesActifsCount = computed(() => {
  const urgentists = urgentistStore.allUrgentists || []
  const count = urgentists.filter(u => 
    u.status === 'available' || u.status === 'on_duty'
  ).length
  return urgentistStore.loading ? 'Chargement...' : count
})

// Infirmiers
const totalNursesCount = computed(() => {
  const nurses = nurseStore.nurses || []
  return nurseStore.loading ? 'Chargement...' : nurses.length
})


// 📊 MISE À JOUR DES STATS PRINCIPALES
const topStats = computed(() => [
  { icon: '🧑‍⚕️', label: 'Le nombre des patients', value: patientCount.value },
  { icon: '👨‍⚕️', label: 'Nos médecins', value: totalDoctorsCount.value },
  { icon: '🚑', label: 'Urgentistes Actifs', value: urgentistesActifsCount.value },
  { icon: '💉', label: 'Infirmiers', value: totalNursesCount.value },
])


// --- Propriétés calculées pour les Tableaux (Dynamisation) ---

// Demandes de rendez-vous (filtrage des rendez-vous en attente)
const pendingAppointments = computed(() => {
  if (!appointmentStore.getAppointments) return [];
  
  // Nous supposons que le statut 'pending' ou 'en_attente' est utilisé
  // J'ajoute un tri par date pour que les plus anciens (à traiter en premier) soient en haut
  return appointmentStore.getAppointments
    .filter(app => app.status === 'pending' || app.status === 'en_attente')
    .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));
});

// Patients récents (les 5 derniers)
const recentPatientsList = computed(() => {
    // Utilise les données du store patient, trie par date de création, et prend les X premiers
    const patients = patientStore.patients?.data || [];
    
    // Sortir du plus récent au plus ancien (si created_at est disponible)
    return patients
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, MAX_RECENT_PATIENTS);
});


// Données graphiques (inchangées)
const statusChartData = {
  labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
  datasets: [
    { label: 'Guéris', data: [120, 150, 170, 140, 190, 210], borderColor: '#00c897', tension: 0.4 },
    { label: 'En traitement', data: [60, 80, 75, 95, 110, 130], borderColor: '#0040d0', tension: 0.4 }
  ]
}
const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true }, title: { display: false } } }

// Les données statiques mock sont supprimées car elles sont dynamisées par les computed.

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
  flex: 1; 
  background: white;
  padding: 20px;
  border-radius: 12px;
  height: 320px;
  min-width: 320px;
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

.loading-message, .empty-message {
    font-style: italic;
    color: #6c757d;
    padding: 10px 0;
    text-align: center;
}
</style>