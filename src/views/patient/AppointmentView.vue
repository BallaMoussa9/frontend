<template>
  <SidebarLayout>
    <section class="appointment-section">
      <h1>Prendre et Gérer mon Rendez-vous</h1>

      <p v-if="appointmentStore.error" class="error-message">
        Erreur : {{ appointmentStore.error }}
      </p>
      <p v-if="appointmentStore.success" class="success-message">
        {{ appointmentStore.success }}
      </p>
      <p v-if="userStore.error && !appointmentStore.error" class="error-message">
        Erreur chargement profil patient: {{ userStore.error }}
      </p>
      <p v-if="doctorStore.error && formLoading" class="error-message">
        Erreur chargement médecins: {{ doctorStore.error }}
      </p>

      <div class="appointment-card form-card">
        <h2>Nouveau Rendez-vous</h2>

        <div v-if="!isAuthInitialized || authLoading || formLoading" class="loading-state">
          Chargement des données... Veuillez patienter.
        </div>

        <div v-else-if="!isPatientRole">
            <p class="error-message">Accès refusé. Cette section est réservée aux patients.</p>
        </div>

        <div v-else-if="!patientIdComputed">
            <p class="info-message">Impossible de trouver votre ID patient. Vérifiez votre connexion.</p>
        </div>

        <form @submit.prevent="submitAppointment"
              v-else
              :class="{ 'disabled-form': !patientIdComputed }"
              :disabled="!patientIdComputed"
        >
          <p v-if="hasActiveAppointment" class="warning-message">
            ⚠️ Attention : Vous avez déjà un rendez-vous actif ({{ activeAppointmentsCount }} en cours).
          </p>

          <div class="form-grid">

            <div class="form-group">
              <label for="doctor">Médecin *</label>
              <select id="doctor" v-model="form.doctor_id" required>
                <option disabled value="">Sélectionner un médecin</option>
                <option v-for="doctor in doctorsAvailable" :key="doctor.id" :value="doctor.id">
                  {{ doctor.user?.first_name || 'Dr.' }} {{ doctor.user?.last_name || 'Inconnu' }} – {{ doctor.speciality }}
                </option>
              </select>
              <p v-if="doctorsAvailable.length === 0 && !doctorStore.loading" class="info-message">Aucun médecin disponible pour le moment.</p>
            </div>

            <div class="form-group">
              <label for="type">Type de Rendez-vous *</label>
              <select id="type" v-model="form.type" required>
                <option disabled value="">Sélectionner le type</option>
                <option value="consultation">Consultation Générale</option>
                <option value="suivi">Suivi Médical</option>
                <option value="urgence">Urgence (Non Vital)</option>
                <option value="vaccination">Vaccination</option>
                <option value="examen">Examen Spécialisé</option>
                <option value="teleconsultation">Téléconsultation</option>
              </select>
            </div>

            <div class="form-group col-span-2">
              <label for="motif">Motif de consultation *</label>
              <textarea id="motif" v-model="form.motif" rows="3" required
                        placeholder="Décrivez brièvement le motif de votre consultation (ex: Douleur au ventre, Bilan annuel, Suivi post-opératoire...)"></textarea>
            </div>

            <div class="form-group">
              <label for="appointment_date">Date du Rendez-vous *</label>
              <input id="appointment_date" v-model="form.appointment_date" type="date" :min="minDate" required />
            </div>

            <div class="form-group">
              <label for="appointment_time">Heure du Rendez-vous *</label>
              <input id="appointment_time" v-model="form.appointment_time" type="time" required />
            </div>
          </div>

          <button type="submit" :disabled="appointmentStore.loading || doctorStore.loading || !patientIdComputed">
            {{ (appointmentStore.loading || doctorStore.loading) ? 'Envoi...' : 'Confirmer le rendez-vous' }}
          </button>
        </form>
      </div>

      <h2 class="mt-8 mb-4">Mes Rendez-vous</h2>
      <div v-if="appointmentStore.loading && !formLoading" class="loading-state">
        Chargement de vos rendez-vous...
      </div>
      <div v-else-if="!isPatientRole">
        <p class="error-message">Accès refusé. Cette section est réservée aux patients.</p>
      </div>
      <div v-else-if="!patientIdComputed">
        <p class="info-message">Impossible de trouver votre ID patient. Vérifiez votre connexion.</p>
      </div>
      <div v-else-if="patientAppointments.length === 0">
        <p class="info-message">Vous n'avez aucun rendez-vous planifié. Prenez-en un ci-dessus !</p>
      </div>
      <div v-else class="appointments-list">
        <div v-for="appointment in patientAppointments" :key="appointment.id" class="appointment-card appointment-item">
          <p>
            <strong>Médecin:</strong>
            {{ appointment.doctor?.user?.first_name }}
            {{ appointment.doctor?.user?.last_name }}
            ({{ appointment.doctor?.speciality }})
          </p>
          <p><strong>Date:</strong> {{ new Date(appointment.appointment_date).toLocaleDateString() }}</p>
          <p><strong>Heure:</strong> {{ appointment.appointment_time }}</p>
          <p><strong>Type:</strong> {{ appointment.type }}</p>
          <p><strong>Motif:</strong> {{ appointment.motif }}</p>
          <p><strong>Statut:</strong> <span :class="['status-badge', appointment.status]">{{ formatStatus(appointment.status) }}</span></p>

          <div class="action-buttons" v-if="['pending', 'confirmed', 'rescheduled'].includes(appointment.status)">
            <button v-if="appointment.status === 'pending' || appointment.status === 'confirmed'"
                    @click="cancelAppointment(appointment.id)" class="cancel-button">Annuler</button>
            <button v-if="appointment.status === 'pending' || appointment.status === 'confirmed' || appointment.status === 'rescheduled'"
                    @click="rescheduleAppointment(appointment)" class="reschedule-button">Reporter</button>
            <button v-if="appointment.status === 'rescheduled'"
                    @click="confirmRescheduled(appointment.id)" class="confirm-rescheduled-button">Confirmer Reprogrammation</button>
          </div>
        </div>
      </div>

    </section>
  </SidebarLayout>
</template>

<script setup>
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

// --- PROPRIÉTÉS CALCULÉES BASÉES SUR L'AUTHSTORE ---
const currentAuthUserId = computed(() => authStore.userId);
const patientIdComputed = computed(() => authStore.profileId); // 🔑 L'ID du patient est le profileId du store Auth
const isLoggedIn = computed(() => authStore.isLoggedIn);
const isAuthInitialized = computed(() => authStore.initialized);
const authLoading = computed(() => authStore.loading);
// 🔑 Vérification du rôle, insensible à la casse
const isPatientRole = computed(() =>
    authStore.role_name && authStore.role_name.toLowerCase() === 'patient'
);


// --- ÉTATS LOCAUX ---
const formLoading = ref(true);
const doctorsAvailable = computed(() => doctorStore.doctors);
const form = reactive({
  doctor_id: '',
  appointment_date: '',
  appointment_time: '',
  type: '',
  motif: '',
});

const minDate = computed(() => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});

const patientAppointments = computed(() => Array.isArray(appointmentStore.appointments) ? appointmentStore.appointments : []);

const activeAppointments = computed(() => {
    return patientAppointments.value.filter(appointment =>
        ['pending', 'confirmed', 'rescheduled', 'scheduled'].includes(appointment.status)
    );
});

const hasActiveAppointment = computed(() => activeAppointments.value.length > 0);
const activeAppointmentsCount = computed(() => activeAppointments.value.length);


// --- ACTIONS ASYNCHRONES ET LOGIQUE DE CHARGEMENT ---

// 🔑 Simplifié : Cette fonction n'est plus critique pour l'affichage, elle sert juste à s'assurer que le userStore a le patientID.
async function loadPatientProfile() {
  appointmentStore.clearMessages();

  if (isLoggedIn.value && isPatientRole.value && currentAuthUserId.value) {
    try {
      // ⚠️ Important : On ne réassigne PLUS patientIdForAppointments. On utilise patientIdComputed.
      // Cet appel API est maintenant juste une vérification pour s'assurer que l'enregistrement existe.
      await userStore.fetchPatientByUserId(currentAuthUserId.value);
      console.log('Appointment: Profil patient vérifié par userStore.');
    } catch (err) {
      console.error('Appointment: Erreur lors de la vérification de l\'ID patient:', err);
      // Ceci va maintenant déclencher le message d'erreur du userStore sur le template
    }
  } else {
    console.log('Appointment: Pas de profil patient à charger (non connecté ou pas patient).');
  }
}

async function loadDoctors() {
  formLoading.value = true;
  await doctorStore.fetchAllDoctors();
  formLoading.value = false;
}

async function loadPatientAppointments(patientId) {
    if (patientId) {
        await appointmentStore.fetchPatientAppointments(patientId);
    } else {
        appointmentStore.appointments = [];
        appointmentStore.clearMessages();
    }
}

// --- CYCLE DE VIE ET WATCHERS ---

onMounted(async () => {
  // L'initialisation est gérée dans main.js, on lance juste le chargement des médecins
  await loadDoctors();
});

// 🔑 Watcher Unique sur l'état d'authentification final
// Se déclenche UNIQUEMENT quand l'état est stable (initialized)
watch(isAuthInitialized, async (initialized) => {
  if (initialized) {
    console.log("Appointment.vue: AuthStore initialisé. Vérification du profil et chargement des RVs.");
    await loadPatientProfile(); // Vérifie que le profil est bien là
  }
}, { immediate: true });

// 🔑 Watcher pour charger les RVs dès que l'ID du patient est connu et valide
watch(patientIdComputed, async (newPatientId) => {
    if (newPatientId && isPatientRole.value) {
        console.log(`Appointment.vue: ID patient valide (${newPatientId}). Chargement des rendez-vous.`);
        await loadPatientAppointments(newPatientId);
    }
}, { immediate: true });


// --- MÉTHODES DE GESTION DES RENDEZ-VOUS ---

function formatStatus(status) {
    const statuses = {
        'pending': 'En attente',
        'confirmed': 'Confirmé',
        'canceled': 'Annulé',
        'rescheduled': 'Reporté',
        'completed': 'Terminé',
        'scheduled': 'Planifié',
    };
    return statuses[status] || status;
}


async function submitAppointment() {
  if (!patientIdComputed.value) {
    appointmentStore.setError("Impossible de soumettre le rendez-vous: ID patient manquant.");
    return;
  }

  const success = await appointmentStore.createAppointment(patientIdComputed.value, {
    doctor_id: form.doctor_id,
    appointment_date: form.appointment_date,
    appointment_time: form.appointment_time,
    type: form.type,
    motif: form.motif,
  });

  if (success) {
    // Réinitialisation du formulaire
    form.doctor_id = '';
    form.appointment_date = '';
    form.appointment_time = '';
    form.type = '';
    form.motif = '';
    // Recharger la liste pour afficher le nouveau RV
    await loadPatientAppointments(patientIdComputed.value);
  }
}

async function cancelAppointment(appointmentIdToCancel) {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) return;
    if (!patientIdComputed.value) {
        appointmentStore.setError("Impossible d'annuler le rendez-vous: ID patient manquant.");
        return;
    }
    const cancellationReason = prompt('Veuillez indiquer le motif de l\'annulation (optionnel):');
    const success = await appointmentStore.updateAppointment(patientIdComputed.value, appointmentIdToCancel, {
        status: 'canceled',
        cancellation_reason: cancellationReason,
    });
    if (success) {
        await loadPatientAppointments(patientIdComputed.value);
    }
}

async function rescheduleAppointment(appointment) {
    if (!confirm('Voulez-vous reporter ce rendez-vous ?')) return;
    if (!patientIdComputed.value) {
        appointmentStore.setError("Impossible de reporter le rendez-vous: ID patient manquant.");
        return;
    }
    const newDate = prompt('Nouvelle date (AAAA-MM-JJ):', appointment.appointment_date);
    const newTime = prompt('Nouvelle heure (HH:MM):', appointment.appointment_time);
    if (!newDate || !newTime) {
        alert('La date et l\'heure sont requises pour reporter un rendez-vous.');
        return;
    }
    const success = await appointmentStore.updateAppointment(patientIdComputed.value, appointment.id, {
        status: 'rescheduled',
        appointment_date: newDate,
        appointment_time: newTime,
        doctor_id: appointment.doctor_id,
        type: appointment.type,
        motif: appointment.motif,
    });
    if (success) {
        await loadPatientAppointments(patientIdComputed.value);
    }
}

async function confirmRescheduled(appointmentIdToConfirm) {
    if (!confirm('Confirmer cette reprogrammation ? Le statut passera à "confirmé".')) return;
    if (!patientIdComputed.value) {
        appointmentStore.setError("Impossible de confirmer la reprogrammation: ID patient manquant.");
        return;
    }
    const success = await appointmentStore.updateAppointment(patientIdComputed.value, appointmentIdToConfirm, {
        status: 'confirmed',
    });
    if (success) {
        await loadPatientAppointments(patientIdComputed.value);
    }
}
</script>

<style scoped>
/* Conteneur principal */
.appointment-section {
  max-width: 900px;
  margin: 32px auto;
  padding: 24px;
  background-color: #f8f8f8;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

h1, h2 {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #002580;
  text-align: center;
}

h2 {
    font-size: 24px;
    margin-top: 40px;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 15px;
    color: #333;
}

/* Carte de RDV */
.appointment-card {
  background: #fff;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 20px;
  border-left: 6px solid #002580;
  transition: transform 0.2s ease-in-out;
}

.appointment-card:hover {
    transform: translateY(-3px);
}

.form-card {
    border-left: 6px solid #4CAF50;
}

/* Grille et Formulaires */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.col-span-2 {
    grid-column: 1 / -1;
}

label {
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
  font-size: 15px;
}

input[type="date"], input[type="time"], select, textarea {
  padding: 12px;
  font-size: 16px;
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

button[type="submit"] {
  display: block;
  width: 100%;
  padding: 15px 20px;
  margin-top: 25px;
  background-color: #002580;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button[type="submit"]:hover:not(:disabled) {
  background-color: #001a60;
}

button:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}

/* Messages */
.error-message {
  color: #d32f2f; background-color: #ffebee; border: 1px solid #ef9a9a;
  padding: 12px; border-radius: 8px; margin-bottom: 20px; text-align: center;
}
.success-message {
  color: #388e3c; background-color: #e8f5e9; border: 1px solid #a5d6a7;
  padding: 12px; border-radius: 8px; margin-bottom: 20px; text-align: center;
}
.info-message {
    color: #2196f3; background-color: #e3f2fd; border: 1px solid #90caf9;
    padding: 10px; border-radius: 5px; text-align: center; margin-top: 15px;
}
.warning-message {
    color: #ff9800;
    background-color: #fff3e0;
    border: 1px solid #ffb74d;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 20px;
    text-align: center;
    font-weight: 500;
}


/* Liste des RDV */
.appointments-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
  margin-top: 30px;
}

.appointment-item p {
  margin-bottom: 8px;
  line-height: 1.6;
  color: #555;
}

.appointment-item strong {
  color: #333;
}

.status-badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 0.85em;
    color: white;
    text-transform: capitalize;
    margin-top: 10px;
}

/* Couleurs des badges de statut */
.status-badge.pending { background-color: #ff9800; }
.status-badge.confirmed { background-color: #4caf50; }
.status-badge.canceled { background-color: #f44336; }
.status-badge.rescheduled { background-color: #2196f3; }
.status-badge.completed { background-color: #795548; }
.status-badge.scheduled { background-color: #607d8b; }

.action-buttons {
    margin-top: 20px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}
.action-buttons button {
    padding: 8px 15px;
    border-radius: 5px;
    font-size: 0.9em;
    cursor: pointer;
    transition: background-color 0.2s ease;
    flex-grow: 1;
    min-width: 120px;
    border: none;
    color: white;
}
.cancel-button { background-color: #f44336; }
.cancel-button:hover { background-color: #d32f2f; }
.reschedule-button { background-color: #2196f3; }
.reschedule-button:hover { background-color: #1976d2; }
.confirm-rescheduled-button { background-color: #4caf50; }
.confirm-rescheduled-button:hover { background-color: #388e3c; }

.disabled-form {
  opacity: 0.6;
  pointer-events: none;
}
</style>
