<template>
  <SidebarLayout>
    <section class="appointment-section">
      <div class="dashboard-header">
        <div class="header-content">
          <h1 class="page-title">
            <CalendarCheck :size="32" class="title-icon" />
            Gestion des Rendez-vous
          </h1>
          <p class="page-subtitle">Planifiez vos consultations en quelques clics</p>
        </div>
      </div>

      <transition name="fade">
        <div v-if="appointmentStore.error || userStore.error" class="message error">
          <AlertTriangle :size="20" />
          {{ appointmentStore.error || userStore.error }}
        </div>
      </transition>
      
      <transition name="fade">
        <div v-if="appointmentStore.success" class="message success">
          <CheckCircle :size="20" /> {{ appointmentStore.success }}
        </div>
      </transition>

      <div class="appointment-card form-card">
        <div class="card-header">
          <div class="card-icon">
            <PlusCircle :size="24" />
          </div>
          <h2 class="card-title">Nouveau Rendez-vous</h2>
        </div>

        <div v-if="!isAuthInitialized || authLoading || formLoading" class="loading-state">
          <div class="spinner-small"></div>
          <p>Préparation du formulaire...</p>
        </div>

        <div class="form-container" v-else>
          <form @submit.prevent="submitAppointment" :class="{ 'disabled-form': !patientIdComputed }">
          <div v-if="hasActiveAppointment" class="active-warning">
            <Info :size="20" />
            <span>Vous avez déjà <strong>{{ activeAppointmentsCount }}</strong> rendez-vous actif(s).</span>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>
                <div class="label-icon">
                  <UserCircle :size="16" />
                </div>
                Médecin *
              </label>
              <select v-model="form.doctor_id" required>
                <option disabled value="">Choisir un spécialiste</option>
                <option v-for="doctor in doctorsAvailable" :key="doctor.id" :value="doctor.id">
                  Dr. {{ doctor.user?.last_name }} ({{ doctor.speciality }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>
                <div class="label-icon">
                  <Stethoscope :size="16" />
                </div>
                Type *
              </label>
              <select v-model="form.type" required>
                <option disabled value="">Nature de la visite</option>
                <option value="consultation">Consultation Générale</option>
                <option value="suivi">Suivi Médical</option>
                <option value="teleconsultation">Téléconsultation (Visio)</option>
                <option value="examen">Examen Spécialisé</option>
              </select>
            </div>

            <div class="form-group">
              <label>
                <div class="label-icon">
                  <Calendar :size="16" />
                </div>
                Date souhaitée *
              </label>
              <input v-model="form.appointment_date" type="date" :min="minDate" required @change="updateMinTime" />
            </div>

            <div class="form-group">
              <label>
                <div class="label-icon">
                  <Clock3 :size="16" />
                </div>
                Heure *
              </label>
              <input v-model="form.appointment_time" type="time" :min="minTime" required />
              <small v-if="minTime && form.appointment_date === minDate" class="hint">Disponibilités dès {{ minTime }}</small>
            </div>

            <div class="form-group col-span-2">
              <label>
                <div class="label-icon">
                  <CommentMedical :size="16" />
                </div>
                Motif de la consultation *
              </label>
              <textarea v-model="form.motif" rows="2" required placeholder="Ex: Douleurs persistantes au dos, renouvellement ordonnance..."></textarea>
            </div>
          </div>

          <button type="submit" class="submit-btn" :disabled="appointmentStore.loading || isPastDateTime">
            <Loader2 :size="18" v-if="appointmentStore.loading" class="animate-spin" />
            <Send :size="18" v-else />
            {{ getSubmitButtonText }}
          </button>
        </form>
        </div>
      </div>

      <div class="list-section">
        <div class="card-header">
          <div class="card-icon">
            <List :size="24" />
          </div>
          <h2 class="card-title">Mes Rendez-vous à venir</h2>
        </div>

        <div v-if="appointmentStore.loading && !formLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Récupération de vos rendez-vous...</p>
        </div>

        <div v-else-if="futureAppointments.length === 0" class="empty-state">
          <CalendarX :size="32" />
          <p>Aucun rendez-vous prévu pour le moment.</p>
        </div>

        <div v-else class="appointments-grid">
          <div v-for="appointment in futureAppointments" :key="appointment.id" class="appointment-item-card">
            <div class="item-date">
              <span class="day">{{ new Date(appointment.appointment_date).getDate() }}</span>
              <span class="month">{{ new Date(appointment.appointment_date).toLocaleString('default', { month: 'short' }) }}</span>
            </div>
            
            <div class="item-details">
              <h3>Dr. {{ appointment.doctor?.user?.last_name }}</h3>
              <p class="speciality">{{ appointment.doctor?.speciality }}</p>
              <div class="time-info">
                <span class="time-item">
                  <div class="time-icon">
                    <Clock :size="16" />
                  </div>
                  {{ appointment.appointment_time }}
                </span>
                <span class="type-tag">{{ appointment.type }}</span>
              </div>
              <div :class="['status-pill', appointment.status]">
                {{ formatStatus(appointment.status) }}
              </div>
            </div>

            <div class="item-actions">
              <button v-if="['pending', 'confirmed'].includes(appointment.status)" 
                      @click="cancelAppointment(appointment.id)" class="btn-icon delete" title="Annuler">
                <X :size="16" />
              </button>
              <button v-if="['pending', 'confirmed', 'rescheduled'].includes(appointment.status)"
                      @click="rescheduleAppointment(appointment)" class="btn-icon edit" title="Reporter">
                <CalendarPlus :size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </SidebarLayout>
</template>

<script setup>
// ... (Garder la même logique script que tu as fournie, elle est très solide) ...
// Note : J'ai juste ajouté quelques classes dans le template ci-dessus
import { reactive, onMounted, computed, ref, watch } from 'vue';
import { useAppointmentPatientStore } from '@/stores/appointmentPatientStore';
import { useAuthStore } from '@/stores/authStores';
import { useDoctorStore } from '@/stores/doctorStore';
import { useUserStore } from '@/stores/userStore';
import SidebarLayout from '@/layouts/SidebarLayout.vue';
import {
  Calendar, Clock, User, Stethoscope, MessageSquare, AlertTriangle,
  CheckCircle, PlusCircle, CalendarCheck, CalendarX, List,
  Send, Loader2, X, CalendarPlus, Activity, Heart,
  UserCircle, Clock3, Info
} from 'lucide-vue-next';

const appointmentStore = useAppointmentPatientStore();
const authStore = useAuthStore();
const doctorStore = useDoctorStore();
const userStore = useUserStore();

const formLoading = ref(true);
const minTime = ref('');
const doctorsAvailable = computed(() => doctorStore.doctors);

const form = reactive({
  doctor_id: '',
  appointment_date: '',
  appointment_time: '',
  type: '',
  motif: '',
});

const isAuthInitialized = computed(() => authStore.initialized);
const authLoading = computed(() => authStore.loading);
const isLoggedIn = computed(() => authStore.isLoggedIn);
const isPatientRole = computed(() => authStore.role_name?.toLowerCase() === 'patient');
const patientIdComputed = computed(() => authStore.profileId);
const currentAuthUserId = computed(() => authStore.userId);

const minDate = computed(() => new Date().toISOString().split('T')[0]);

const isPastDateTime = computed(() => {
  if (!form.appointment_date || !form.appointment_time) return false;
  return new Date(`${form.appointment_date}T${form.appointment_time}`) < new Date();
});

const getSubmitButtonText = computed(() => {
  if (appointmentStore.loading) return 'Traitement...';
  if (isPastDateTime.value) return 'Horaire expiré';
  return 'Confirmer le rendez-vous';
});

const futureAppointments = computed(() => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0];
  
  return (appointmentStore.appointments || []).filter(app => {
    return app.appointment_date > today || (app.appointment_date === today && app.appointment_time >= time);
  });
});

const hasActiveAppointment = computed(() => activeAppointmentsCount.value > 0);
const activeAppointmentsCount = computed(() => {
  return futureAppointments.value.filter(a => ['pending', 'confirmed', 'scheduled'].includes(a.status)).length;
});

function updateMinTime() {
  const today = new Date().toISOString().split('T')[0];
  if (form.appointment_date === today) {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    minTime.value = now.toTimeString().slice(0, 5);
  } else {
    minTime.value = '08:00';
  }
}

async function submitAppointment() {
  const success = await appointmentStore.createAppointment(patientIdComputed.value, { ...form });
  if (success) {
    Object.keys(form).forEach(key => form[key] = '');
    await appointmentStore.fetchPatientAppointments(patientIdComputed.value);
  }
}

async function cancelAppointment(id) {
  if (confirm('Annuler ce rendez-vous ?')) {
    await appointmentStore.updateAppointment(patientIdComputed.value, id, { status: 'canceled' });
    await appointmentStore.fetchPatientAppointments(patientIdComputed.value);
  }
}

async function rescheduleAppointment(app) {
  const newDate = prompt('Nouvelle date (AAAA-MM-JJ):', app.appointment_date);
  if (newDate) {
    await appointmentStore.updateAppointment(patientIdComputed.value, app.id, { 
      status: 'rescheduled', 
      appointment_date: newDate 
    });
    await appointmentStore.fetchPatientAppointments(patientIdComputed.value);
  }
}

function formatStatus(status) {
  const map = { pending: 'En attente', confirmed: 'Confirmé', canceled: 'Annulé', rescheduled: 'Reporté' };
  return map[status] || status;
}

onMounted(async () => {
  await doctorStore.fetchAllDoctors();
  formLoading.value = false;
});

watch(patientIdComputed, (id) => { if (id) appointmentStore.fetchPatientAppointments(id); }, { immediate: true });
</script>

<style scoped>
.appointment-section {
  --primary: #2563eb;
  --primary-dark: #1e40af;
  --primary-light: #3b82f6;
  --secondary: #10b981;
  --secondary-dark: #059669;
  --accent: #8b5cf6;
  --danger: #ef4444;
  --warning: #f59e0b;
  --success: #22c55e;
  --dark: #0f172a;
  --light: #ffffff;
  --gray: #94a3b8;
  --gray-light: #cbd5e1;
  --gray-dark: #64748b;
  --border: rgba(255, 255, 255, 0.1);
  --shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  --shadow-xl: 0 30px 60px -12px rgba(0, 0, 0, 0.5);
  --radius: 16px;
  
  padding: 2rem;
  margin: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  box-sizing: border-box;
  position: relative;
}

.header-intro { 
  text-align: left; 
  margin-bottom: 2.5rem;
  animation: slideDown 0.6s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-title {
  font-size: 2.2rem;
  font-weight: 900;
  color: white;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.title-icon {
  color: white;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  padding: 12px;
  border-radius: 14px;
  box-shadow: var(--shadow-lg);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 15px 35px rgba(37, 99, 235, 0.5);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.appointment-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.appointment-card:hover::before {
  transform: scaleX(1);
}

.appointment-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.5);
  border-color: var(--primary);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
}

.card-header { 
  padding: 1.5rem; 
  border-bottom: 1px solid rgba(255, 255, 255, 0.1); 
  display: flex; 
  align-items: center; 
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
}

.card-icon { 
  width: 48px; 
  height: 48px; 
  background: linear-gradient(135deg, var(--primary), var(--secondary)); 
  color: white; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
}

.appointment-card:hover .card-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.5);
}

.card-title { 
  font-size: 1.3rem; 
  font-weight: 800; 
  color: white; 
  margin: 0; 
  flex: 1;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.5rem;
  margin-bottom: 2rem;
  margin-top: 1rem;
  width: 100%;
}

.col-span-2 { grid-column: span 2; }

.form-group { 
  display: flex; 
  flex-direction: column; 
  gap: 0.8rem; 
  animation: fadeIn 0.6s ease-out backwards;
  margin-bottom: 0;
  margin-top: 0.5rem;
  width: 100%;
}

.form-group:nth-child(1) { animation-delay: 0.1s; }
.form-group:nth-child(2) { animation-delay: 0.2s; }
.form-group:nth-child(3) { animation-delay: 0.3s; }
.form-group:nth-child(4) { animation-delay: 0.4s; }
.form-group:nth-child(5) { animation-delay: 0.5s; }
.form-group:nth-child(6) { animation-delay: 0.6s; }

.form-container {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-group label { 
  color: white; 
  font-size: 0.95rem; 
  font-weight: 700; 
  display: flex; 
  align-items: center; 
  gap: 0.8rem;
  opacity: 0.9;
}

.form-group label .label-icon {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, var(--primary), var(--secondary)) !important;
  color: white !important;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3) !important;
  margin-right: 0.8rem;
}

input, select, textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

input::placeholder, textarea::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--primary);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
  transform: translateY(-2px);
}

select {
  cursor: pointer;
}

select option {
  background: var(--dark);
  color: white;
}

.active-warning {
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.2), rgba(251, 146, 60, 0.1));
  border: 1px solid rgba(251, 146, 60, 0.3);
  color: #fb923c;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 1rem;
  backdrop-filter: blur(10px);
}

.time-info { 
  display: flex; 
  align-items: center; 
  gap: 1rem; 
  margin: 0.8rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.time-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  opacity: 0.9;
}

.time-icon {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  transition: all 0.3s ease;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
  margin-top: 2rem;
}

.submit-btn:hover:not(:disabled) { 
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.5);
  background: linear-gradient(135deg, var(--primary-dark), var(--secondary-dark));
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* List Design */
.section-title { 
  display: flex; 
  align-items: center; 
  gap: 1rem; 
  margin: 2.5rem 0 2rem;
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

.section-title svg {
  color: white;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  padding: 8px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.section-title h2 { 
  font-size: 1.5rem; 
  font-weight: 800;
  margin: 0;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.appointments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  animation: fadeInUp 0.8s ease-out 0.9s both;
  margin-bottom: 2rem;
  margin-top: 1rem;
}

.appointment-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  margin-bottom: 2rem;
  margin-top: 2rem;
  max-width: 100%;
  box-sizing: border-box;
}

.appointment-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary);
}

.item-date {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(16, 185, 129, 0.2));
  width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  border-right: 1px solid var(--border);
}

.item-date .day { 
  font-size: 1.8rem; 
  font-weight: 900;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.item-date .month { 
  font-size: 0.8rem; 
  text-transform: uppercase; 
  font-weight: 700;
  color: white;
  opacity: 0.8;
}

.item-details { 
  padding: 1.5rem; 
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.item-details h3 { 
  font-size: 1.2rem; 
  margin: 0; 
  color: white;
  font-weight: 800;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.speciality { 
  font-size: 0.9rem; 
  color: white; 
  margin: 0;
  font-weight: 600;
  opacity: 0.9;
}

.time-info { 
  display: flex; 
  align-items: center; 
  gap: 1rem; 
  font-size: 0.9rem; 
  color: white;
  font-weight: 600;
}

.type-tag { 
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1));
  color: white;
  padding: 4px 12px; 
  border-radius: 20px; 
  font-size: 0.8rem;
  font-weight: 700;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.status-pill {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 20px;
  align-self: flex-start;
}

.status-pill.pending { 
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.2), rgba(251, 146, 60, 0.1));
  color: #fb923c;
  border: 1px solid rgba(251, 146, 60, 0.3);
}

.status-pill.confirmed { 
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1));
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.item-actions { 
  display: flex; 
  flex-direction: column; 
  border-left: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.1);
}

.btn-icon {
  flex: 1; 
  padding: 1rem; 
  border: none; 
  background: transparent; 
  cursor: pointer; 
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray);
}

.btn-icon.delete:hover { 
  color: #ef4444; 
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1));
}

.btn-icon.edit:hover { 
  color: #3b82f6; 
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1));
}

.empty-state { 
  text-align: center; 
  padding: 4rem; 
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
  backdrop-filter: blur(20px);
  border-radius: 16px; 
  color: var(--gray);
  border: 1px solid var(--border);
  animation: fadeIn 0.6s ease-out;
  margin-bottom: 2rem;
  margin-top: 2rem;
}

.empty-state svg { 
  font-size: 3rem; 
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.1rem;
  font-weight: 600;
}

.message { 
  padding: 1rem 1.5rem; 
  border-radius: 12px; 
  margin-bottom: 2rem; 
  margin-top: 1rem;
  display: flex; 
  align-items: center; 
  gap: 1rem;
  font-weight: 600;
  animation: slideIn 0.4s ease-out;
  backdrop-filter: blur(10px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.message.error { 
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1)); 
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.message.success { 
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1)); 
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: white;
  min-height: 60vh;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
  box-shadow: 0 0 20px rgba(37, 99, 235, 0.3);
}

.spinner-small {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
  box-shadow: 0 0 15px rgba(37, 99, 235, 0.3);
}

@keyframes spin { 
  0% { transform: rotate(0deg); } 
  100% { transform: rotate(360deg); } 
}

.loading-state p {
  color: var(--gray);
  font-size: 1.1rem;
  font-weight: 600;
}

.page-subtitle { 
  color: white; 
  font-size: 1.1rem; 
  margin-top: 12px;
  opacity: 0.9;
}

.hint {
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 0.5rem;
  opacity: 0.7;
}

.disabled-form {
  opacity: 0.6;
  pointer-events: none;
}


@media (max-width: 768px) {
  .appointment-section {
    padding: 1rem;
  }
  
  .header-intro {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  h1 {
    font-size: 1.8rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .col-span-2 {
    grid-column: span 1;
  }
  
  .appointments-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .appointment-item-card {
    flex-direction: column;
  }
  
  .item-date {
    width: 100%;
    height: 60px;
    flex-direction: row;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    gap: 1rem;
  }
  
  .item-actions {
    flex-direction: row;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
}
</style>