<template>
  <SidebarLayout>
    <section class="appointment-section">
      <div class="header-intro">
        <h1><i class="fas fa-calendar-check"></i> Gestion des Rendez-vous</h1>
        <p class="subtitle">Planifiez vos consultations en quelques clics</p>
      </div>

      <transition name="fade">
        <div v-if="appointmentStore.error || userStore.error" class="message error">
          <i class="fas fa-exclamation-triangle"></i>
          {{ appointmentStore.error || userStore.error }}
        </div>
      </transition>
      
      <transition name="fade">
        <div v-if="appointmentStore.success" class="message success">
          <i class="fas fa-check-circle"></i> {{ appointmentStore.success }}
        </div>
      </transition>

      <div class="appointment-card form-card">
        <div class="card-header">
          <i class="fas fa-plus-circle"></i>
          <h2>Nouveau Rendez-vous</h2>
        </div>

        <div v-if="!isAuthInitialized || authLoading || formLoading" class="loading-state">
          <div class="spinner-small"></div>
          <p>Préparation du formulaire...</p>
        </div>

        <form @submit.prevent="submitAppointment" v-else :class="{ 'disabled-form': !patientIdComputed }">
          <div v-if="hasActiveAppointment" class="active-warning">
            <i class="fas fa-info-circle"></i>
            <span>Vous avez déjà <strong>{{ activeAppointmentsCount }}</strong> rendez-vous actif(s).</span>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label><i class="fas fa-user-md"></i> Médecin *</label>
              <select v-model="form.doctor_id" required>
                <option disabled value="">Choisir un spécialiste</option>
                <option v-for="doctor in doctorsAvailable" :key="doctor.id" :value="doctor.id">
                  Dr. {{ doctor.user?.last_name }} ({{ doctor.speciality }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label><i class="fas fa-stethoscope"></i> Type *</label>
              <select v-model="form.type" required>
                <option disabled value="">Nature de la visite</option>
                <option value="consultation">Consultation Générale</option>
                <option value="suivi">Suivi Médical</option>
                <option value="teleconsultation">Téléconsultation (Visio)</option>
                <option value="examen">Examen Spécialisé</option>
              </select>
            </div>

            <div class="form-group">
              <label><i class="fas fa-calendar-day"></i> Date souhaitée *</label>
              <input v-model="form.appointment_date" type="date" :min="minDate" required @change="updateMinTime" />
            </div>

            <div class="form-group">
              <label><i class="fas fa-clock"></i> Heure *</label>
              <input v-model="form.appointment_time" type="time" :min="minTime" required />
              <small v-if="minTime && form.appointment_date === minDate" class="hint">Disponibilités dès {{ minTime }}</small>
            </div>

            <div class="form-group col-span-2">
              <label><i class="fas fa-comment-medical"></i> Motif de la consultation *</label>
              <textarea v-model="form.motif" rows="2" required placeholder="Ex: Douleurs persistantes au dos, renouvellement ordonnance..."></textarea>
            </div>
          </div>

          <button type="submit" class="submit-btn" :disabled="appointmentStore.loading || isPastDateTime">
            <i :class="appointmentStore.loading ? 'fas fa-spinner fa-spin' : 'fas fa-paper-plane'"></i>
            {{ getSubmitButtonText }}
          </button>
        </form>
      </div>

      <div class="list-section">
        <div class="section-title">
          <i class="fas fa-list-ul"></i>
          <h2>Mes Rendez-vous à venir</h2>
        </div>

        <div v-if="appointmentStore.loading && !formLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Récupération de vos rendez-vous...</p>
        </div>

        <div v-else-if="futureAppointments.length === 0" class="empty-state">
          <i class="fas fa-calendar-times"></i>
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
                <span><i class="far fa-clock"></i> {{ appointment.appointment_time }}</span>
                <span class="type-tag">{{ appointment.type }}</span>
              </div>
              <div :class="['status-pill', appointment.status]">
                {{ formatStatus(appointment.status) }}
              </div>
            </div>

            <div class="item-actions">
              <button v-if="['pending', 'confirmed'].includes(appointment.status)" 
                      @click="cancelAppointment(appointment.id)" class="btn-icon delete" title="Annuler">
                <i class="fas fa-times"></i>
              </button>
              <button v-if="['pending', 'confirmed', 'rescheduled'].includes(appointment.status)"
                      @click="rescheduleAppointment(appointment)" class="btn-icon edit" title="Reporter">
                <i class="fas fa-calendar-alt"></i>
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
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.header-intro { text-align: left; margin-bottom: 2rem; }
h1 { color: #002580; font-size: 1.8rem; display: flex; align-items: center; gap: 12px; margin: 0; }
.subtitle { color: #64748b; margin: 5px 0 0 0; }

/* Cards */
.appointment-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
}

.card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 1.5rem; color: #10b981; }
.card-header h2 { font-size: 1.2rem; margin: 0; color: #1e293b; }

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.2rem;
}

.col-span-2 { grid-column: span 2; }

.form-group label { display: block; font-weight: 600; font-size: 0.85rem; color: #475569; margin-bottom: 6px; }

input, select, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  transition: 0.2s;
}

input:focus { border-color: #3b82f6; background: white; outline: none; }

.active-warning {
  background: #fffbeb;
  border: 1px solid #fef3c7;
  color: #92400e;
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 1.2rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.submit-btn {
  width: 100%;
  margin-top: 1.5rem;
  padding: 0.9rem;
  background: #002580;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: 0.3s;
}

.submit-btn:hover:not(:disabled) { background: #001a60; transform: translateY(-2px); }

/* List Design */
.section-title { display: flex; align-items: center; gap: 10px; margin: 2.5rem 0 1.5rem; color: #002580; }
.section-title h2 { font-size: 1.3rem; margin: 0; }

.appointments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.appointment-item-card {
  background: white;
  border-radius: 15px;
  display: flex;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  border: 1px solid #f1f5f9;
}

.item-date {
  background: #f1f5f9;
  width: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #002580;
}

.item-date .day { font-size: 1.5rem; font-weight: 800; }
.item-date .month { font-size: 0.8rem; text-transform: uppercase; font-weight: 600; }

.item-details { padding: 1rem; flex: 1; }
.item-details h3 { font-size: 1rem; margin: 0; color: #1e293b; }
.speciality { font-size: 0.8rem; color: #64748b; margin: 2px 0 8px; }

.time-info { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; margin-bottom: 10px; }
.type-tag { background: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 5px; font-size: 0.75rem; }

.status-pill {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
}
.status-pill.pending { background: #fef3c7; color: #92400e; }
.status-pill.confirmed { background: #dcfce7; color: #15803d; }

.item-actions { display: flex; flex-direction: column; border-left: 1px solid #f1f5f9; }
.btn-icon {
  flex: 1; padding: 0 15px; border: none; background: transparent; cursor: pointer; transition: 0.2s;
}
.btn-icon.delete:hover { color: #ef4444; background: #fef2f2; }
.btn-icon.edit:hover { color: #3b82f6; background: #eff6ff; }

.empty-state { text-align: center; padding: 3rem; background: #f8fafc; border-radius: 16px; color: #94a3b8; }
.empty-state i { font-size: 3rem; margin-bottom: 1rem; }

.message { padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 12px; }
.message.error { background: #fef2f2; color: #b91c1c; border: 1px solid #fee2e2; }
.message.success { background: #f0fdf4; color: #15803d; border: 1px solid #dcfce7; }
</style>