<template>
  <MedecinLayout>
    <div class="rendezvous-container">
      <h1>Rendez-vous du jour</h1>
      <p class="date-header">Aujourd'hui, {{ todayDisplay }}</p>

      <div v-if="appointmentStore.error" class="message-box error">
        {{ appointmentStore.error }}
      </div>
      <div v-if="appointmentStore.success" class="message-box success">
        {{ appointmentStore.success }}
      </div>

      <div v-if="appointmentStore.loading" class="loading-state">
        <p>Chargement des rendez-vous...</p>
      </div>

      <div v-else-if="filteredAppointments.length > 0" class="appointments-list">
        <div v-for="appointment in filteredAppointments" :key="appointment.id" class="appointment-card">
          <div class="card-header">
            <h3>Rendez-vous avec
              {{ appointment.patient?.user?.first_name || 'Patient' }}
              {{ appointment.patient?.user?.last_name || 'Inconnu' }}
            </h3>
            <span :class="['status-tag', appointment.status]">
              {{ formatStatus(appointment.status) }}
            </span>
          </div>

          <div class="card-body">
            <p><strong>Heure :</strong> {{ appointment.appointment_time }}</p>
            <p><strong>Motif :</strong> {{ appointment.motif }}</p>
            <p><strong>Contact :</strong> {{ appointment.patient?.user?.phone || 'N/A' }}</p>
          </div>

          <div class="card-actions">
            <button
              @click="updateStatus(appointment.id, 'confirmed')"
              :disabled="appointment.status === 'confirmed' || appointment.status === 'completed' || appointmentStore.loading"
              class="action-btn confirm">
              Confirmer
            </button>
            <button
              @click="updateStatus(appointment.id, 'completed')"
              :disabled="appointment.status === 'completed' || appointmentStore.loading"
              class="action-btn complete">
              Terminer
            </button>
            <button
              @click="updateStatus(appointment.id, 'canceled')"
              :disabled="appointment.status === 'canceled' || appointment.status === 'completed' || appointmentStore.loading"
              class="action-btn cancel">
              Annuler
            </button>
            <button
              @click="startChat(appointment.patient?.user?.id)"
              class="action-btn chat"
              :disabled="!appointment.patient?.user?.id">
              Démarrer Chat
            </button>
          </div>
        </div>
      </div>

      <div v-else class="no-appointments">
        <p>Vous n'avez aucun rendez-vous planifié pour aujourd'hui.</p>
        <router-link :to="{ name: 'DoctorDashboard', params: { id: currentDoctorId } }" class="back-link">
          Retour au tableau de bord
        </router-link>
      </div>
    </div>
  </MedecinLayout>
</template>

<script setup>
import MedecinLayout from '@/layouts/MedecinLayout.vue'
import { onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppointmentPatientStore } from '@/stores/appointmentPatientStore'
import { useChatStore } from '@/stores/chatStore'

const router = useRouter();
const route = useRoute();
const appointmentStore = useAppointmentPatientStore();
const chatStore = useChatStore();

// 🔑 POINT CLÉ 1 : Récupération de l'ID du docteur depuis la route
const currentDoctorId = computed(() => route.params.id);

// --- FONCTIONS DE GESTION DES DATES ET DU FILTRAGE ---

/**
 * Normalise la date du jour au format YYYY-MM-DD (format de BDD).
 */
function getTodayDateFormat() {
    const d = new Date();
    // toISOString() + split('T') est la méthode la plus fiable
    return d.toISOString().split('T')[0];
}

// Format pour l'affichage français
const todayDisplay = new Date().toLocaleDateString('fr-FR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

/**
 * 🔑 POINT CLÉ 2 : Logique de filtrage robuste.
 */
const filteredAppointments = computed(() => {
    const todayDate = getTodayDateFormat();

    if (!Array.isArray(appointmentStore.appointments)) return [];

    return appointmentStore.appointments
        .filter(rdv => {
            if (!rdv.appointment_date) return false;

            // Extrait la partie YYYY-MM-DD, gérant les formats 'YYYY-MM-DDT...' ou 'YYYY-MM-DD 00:00:00'
            const appointmentDatePart = rdv.appointment_date.split(' ')[0].split('T')[0];

            return appointmentDatePart === todayDate;
        })
        .sort((a, b) => (a.appointment_time > b.appointment_time ? 1 : -1));
});

// --- ACTIONS ET MONTAGE ---

onMounted(async () => {
    if (currentDoctorId.value) {
        // 🔑 Appel de l'action du store avec l'ID du docteur
        await appointmentStore.fetchDoctorAppointments(currentDoctorId.value);
    } else {
        appointmentStore.setError("ID du docteur manquant. Impossible de charger les rendez-vous.");
    }
});

async function updateStatus(appointmentId, status) {
    if (currentDoctorId.value) {
        // 🔑 Appel de l'action du store avec l'ID du docteur, l'ID du rdv et le nouveau statut
        await appointmentStore.updateAppointmentStatus(currentDoctorId.value, appointmentId, status);
    }
}

function formatStatus(status) {
    const statuses = {
        'pending': 'En attente',
        'confirmed': 'Confirmé',
        'canceled': 'Annulé',
        'rescheduled': 'Reprogrammé',
        'completed': 'Terminé',
        'scheduled': 'Planifié',
    };
    return statuses[status] || status;
}

async function startChat(patientUserId) {
    if (!patientUserId) {
        appointmentStore.setError("ID Utilisateur du patient non disponible.");
        return;
    }
    // Gérer l'ouverture du chat (assurez-vous que l'action est définie dans votre chatStore)
    await chatStore.startChatWithUserId(patientUserId);
    // Redirection vers la messagerie, en conservant l'ID du docteur
    router.push({ name: 'Messagerie', params: { id: currentDoctorId.value } });
}
</script>

<style scoped>
/* Conteneur principal */
.rendezvous-container {
  padding: 30px;
  background-color: #f8fafc;
  min-height: 100%;
}

h1 {
  color: #002580;
  margin-bottom: 5px;
  font-size: 2em;
}

.date-header {
  color: #6c757d;
  font-size: 1.1em;
  margin-bottom: 25px;
}

/* Messages de feedback */
.message-box {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 600;
  border: 1px solid transparent;
}
.message-box.error {
  background-color: #ffebee;
  color: #d32f2f;
  border-color: #ef9a9a;
}
.message-box.success {
  background-color: #e8f5e9;
  color: #388e3c;
  border-color: #a5d6a7;
}

/* Carte de rendez-vous */
.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.appointment-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border-left: 5px solid #0040d0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.card-header h3 {
  margin: 0;
  font-size: 1.25em;
  color: #333;
}

/* Tags de statut */
.status-tag {
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.85em;
  font-weight: 700;
  color: white;
}
.status-tag.pending { background-color: #ffc107; color: #333; }
.status-tag.confirmed { background-color: #28a745; }
.status-tag.canceled { background-color: #dc3545; }
.status-tag.completed { background-color: #6c757d; }
.status-tag.rescheduled { background-color: #17a2b8; }

.card-body p {
  margin: 5px 0;
  color: #555;
}

/* Actions des cartes */
.card-actions {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 600;
  transition: opacity 0.2s;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn.confirm {
  background-color: #007bff;
  color: white;
}
.action-btn.complete {
  background-color: #28a745;
  color: white;
}
.action-btn.cancel {
  background-color: #dc3545;
  color: white;
}
.action-btn.chat {
  background-color: #6f42c1;
  color: white;
}

.action-btn:hover:not(:disabled) {
  opacity: 0.9;
}

/* État de non-rendez-vous */
.no-appointments {
  text-align: center;
  padding: 50px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.no-appointments p {
  font-size: 1.2em;
  color: #777;
  margin-bottom: 20px;
}

.back-link {
  color: #0040d0;
  text-decoration: none;
  font-weight: 600;
}
.back-link:hover {
  text-decoration: underline;
}

.loading-state {
    text-align: center;
    padding: 20px;
    font-size: 1.1em;
    color: #0040d0;
}
</style>
