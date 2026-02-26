<template>
  <SidebarLayout>
    <div v-if="loading || prescriptionStore.loading" class="state-container loading-state">
      <div class="spinner-container">
        <div class="spinner"></div>
      </div>
      <h3>Préparation de votre espace santé</h3>
      <p>Chargement de vos données médicales...</p>
    </div>

    <div v-else-if="patientStore.error || prescriptionStore.error" class="state-container error-state">
      <div class="icon-container">
        <i class="fas fa-exclamation-circle"></i>
      </div>
      <h3>Oups ! Une erreur est survenue</h3>
      <p>Nous rencontrons des difficultés techniques. Veuillez réessayer.</p>
      <button class="retry-btn" @click="retryLoading">Réessayer</button>
    </div>

    <div v-else-if="!currentPatient" class="state-container info-state">
      <div class="icon-container">
        <i class="fas fa-user-slash"></i>
      </div>
      <h3>Dossier patient introuvable</h3>
      <p>Nous n'avons pas trouvé votre dossier médical. Contactez le support.</p>
    </div>

    <div v-else class="dashboard-container">
      <div class="dashboard-header">
        <div class="header-content">
          <h1 class="page-title">
            <i class="fas fa-heartbeat title-icon"></i>
            Tableau de Bord Santé
          </h1>
          <p class="page-subtitle">Vue d'ensemble de votre santé et traitements</p>
        </div>
        <div class="header-actions">
          <button class="action-btn primary" @click="printDashboard">
            <i class="fas fa-file-pdf"></i>
            Exporter en PDF
          </button>
          <button class="action-btn secondary" @click="printDashboard">
            <i class="fas fa-print"></i>
            Imprimer
          </button>
        </div>
      </div>

      <div class="dashboard-grid">
        <section class="card profile-card">
          <div class="card-header">
            <div class="card-icon">
              <i class="fas fa-user-md"></i>
            </div>
            <h2 class="card-title">Profil Santé</h2>
          </div>
          <div class="card-content">
            <div class="profile-grid">
              <div class="profile-item">
                <div class="profile-label"><i class="fas fa-user"></i> Nom complet</div>
                <div class="profile-value">{{ user.first_name }} {{ user.last_name }}</div>
              </div>

              <div class="profile-item">
                <div class="profile-label"><i class="fas fa-birthday-cake"></i> Âge</div>
                <div class="profile-value">
                  <span class="value-badge">{{ patientProfile.age !== null ? patientProfile.age + ' ans' : 'N/R' }}</span>
                </div>
              </div>

              <div class="profile-item">
                <div class="profile-label"><i class="fas fa-venus-mars"></i> Sexe</div>
                <div class="profile-value">{{ currentPatient.genre || 'Non renseigné' }}</div>
              </div>

              <div class="profile-item">
                <div class="profile-label"><i class="fas fa-tint"></i> Groupe sanguin</div>
                <div class="profile-value">
                  <span :class="['blood-type', { 'positive': currentPatient.group_sanguine && currentPatient.group_sanguine.includes('+') }]">
                    {{ currentPatient.group_sanguine || 'N/R' }}
                  </span>
                </div>
              </div>

              <div class="profile-item full-width">
                <div class="profile-label"><i class="fas fa-allergies"></i> Allergies</div>
                <div class="profile-value">
                  <span class="allergy-tag">{{ currentPatient.allergies || 'Aucune allergie connue' }}</span>
                </div>
              </div>

              <div class="profile-item full-width">
                <div class="profile-label"><i class="fas fa-history"></i> Antécédents</div>
                <div class="profile-value medical-history">
                  {{ currentPatient.maladies_chroniques || 'Aucun antécédent majeur' }}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="card vitals-card">
          <div class="card-header">
            <div class="card-icon pulse">
              <i class="fas fa-heartbeat"></i>
            </div>
            <h2 class="card-title">Données Vitales</h2>
          </div>
          <div class="card-content">
            <div v-if="latestVitalSigns" class="vitals-grid">
              <div class="vital-item">
                <div class="vital-icon"><i class="fas fa-tint"></i></div>
                <div class="vital-info">
                  <div class="vital-label">Tension artérielle</div>
                  <div class="vital-value">{{ latestVitalSigns.blood_pressure || 'N/A' }}</div>
                </div>
              </div>

              <div class="vital-item">
                <div class="vital-icon heart"><i class="fas fa-heart"></i></div>
                <div class="vital-info">
                  <div class="vital-label">Fréquence cardiaque</div>
                  <div class="vital-value">{{ latestVitalSigns.heart_rate || 'N/A' }} <span class="unit">bpm</span></div>
                </div>
              </div>

              <div class="vital-item">
                <div class="vital-icon temp"><i class="fas fa-thermometer-half"></i></div>
                <div class="vital-info">
                  <div class="vital-label">Température</div>
                  <div class="vital-value">{{ latestVitalSigns.temperature || 'N/A' }} <span class="unit">°C</span></div>
                </div>
              </div>
            </div>

            <div v-else class="empty-state">
              <div class="empty-icon"><i class="fas fa-chart-line"></i></div>
              <h4>Aucune donnée récente</h4>
              <p>Vos mesures vitales apparaîtront ici</p>
            </div>

            <div v-if="latestVitalSigns" class="vitals-footer">
              <i class="fas fa-clock"></i> Dernière mise à jour: {{ formatDate(latestVitalSigns.created_at) }}
            </div>
          </div>
        </section>

        <section class="card meds-card">
          <div class="card-header">
            <div class="card-icon">
              <i class="fas fa-pills"></i>
            </div>
            <h2 class="card-title">Médicaments Actifs</h2>
            <span class="meds-count">{{ activeMedications.length }}</span>
          </div>
          <div class="card-content">
            <div v-if="activeMedications.length" class="meds-list">
              <div v-for="(med, index) in activeMedications.slice(0, 4)" :key="index" class="med-item">
                <div class="med-icon"><i class="fas fa-capsules"></i></div>
                <div class="med-details">
                  <div class="med-name">{{ med.medication_name }}</div>
                  <div class="med-specs">
                    <span class="dosage">{{ med.dosage || 'Dosage N/A' }}</span>
                    <span class="frequency">{{ med.frequency || 'Fréquence N/A' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="empty-state">
              <div class="empty-icon"><i class="fas fa-prescription-bottle-alt"></i></div>
              <h4>Aucun médicament actif</h4>
              <p>Vos prescriptions apparaîtront ici</p>
            </div>

            <div v-if="activeMedications.length > 4" class="meds-footer">
              <span class="more-meds">+{{ activeMedications.length - 4 }} autres médicaments</span>
              <button class="view-all-btn">Voir tout <i class="fas fa-chevron-right"></i></button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </SidebarLayout>
</template>

<script setup>
import { onMounted, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/authStores';
import { usePatientStore } from '@/stores/patientStore';
import { usePrescriptionStore } from '@/stores/prescriptionStore';
import SidebarLayout from '@/layouts/SidebarLayout.vue';
import { useRoute } from 'vue-router';

const authStore = useAuthStore();
const patientStore = usePatientStore();
const prescriptionStore = usePrescriptionStore();
const route = useRoute();

const user = computed(() => authStore.user || {});
const currentPatient = computed(() => patientStore.currentPatient);
const loading = computed(() => patientStore.loading);

// FONCTION IMPRIMER (Sert aussi pour l'export PDF via le navigateur)
const printDashboard = () => {
  window.print();
};

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDifference = today.getMonth() - dob.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

const patientProfile = computed(() => {
  const profile = currentPatient.value || {};
  const dob = authStore.user?.birth_date;
  return { ...profile, age: dob ? calculateAge(dob) : null };
});

const latestVitalSigns = computed(() => {
  const vitals = currentPatient.value?.vital_signs || [];
  if (vitals.length > 0) {
    return [...vitals].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
  }
  return null;
});

const activeMedications = computed(() => {
  const meds = [];
  if (prescriptionStore.prescriptions && Array.isArray(prescriptionStore.prescriptions)) {
    prescriptionStore.prescriptions.forEach(p => {
      if (p.status === 'active' && p.prescription_lines) {
        meds.push(...p.prescription_lines);
      }
    });
  }
  return meds;
});

const formatDate = (dateString) => {
  if (!dateString) return 'Inconnue';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR') + ' à ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const retryLoading = async () => {
  if (authStore.profileId) {
    await patientStore.fetchMyProfile();
    if (currentPatient.value?.id) await prescriptionStore.fetchPatientPrescriptions(currentPatient.value.id);
  }
};

onMounted(async () => {
  if (authStore.profileId) {
    await patientStore.fetchMyProfile();
    if (currentPatient.value?.id) await prescriptionStore.fetchPatientPrescriptions(currentPatient.value.id);
  }
});

watch(currentPatient, async (newP) => {
  if (newP?.id) await prescriptionStore.fetchPatientPrescriptions(newP.id);
}, { immediate: false });
</script>

<style scoped>
.dashboard-container {
  --primary: #2563eb;
  --primary-dark: #1d4ed8;
  --primary-light: #dbeafe;
  --secondary: #64748b;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --dark: #1e293b;
  --light: #f8fafc;
  --border: #e2e8f0;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --radius: 12px;
  
  font-family: 'Inter', sans-serif;
  padding: 1.5rem;
  margin: 0;
  width: 100%;
  background-color: var(--light);
  min-height: 100vh;
  box-sizing: border-box;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.page-title {
  font-size: 1.7rem;
  font-weight: 800;
  color: var(--dark);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.title-icon { color: var(--primary); background: white; padding: 8px; border-radius: 10px; box-shadow: var(--shadow); }
.page-subtitle { color: var(--secondary); font-size: 0.95rem; margin-top: 2px; }

.header-actions { display: flex; gap: 0.8rem; }
.action-btn {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: 0.2s;
}

.action-btn.primary { background: var(--primary); color: white; }
.action-btn.secondary { background: white; color: var(--dark); border: 1px solid var(--border); }
.action-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.card {
  background: white;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.card-header { padding: 1.2rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 0.8rem; }
.card-icon { width: 40px; height: 40px; background: var(--primary-light); color: var(--primary); display: flex; justify-content: center; align-items: center; border-radius: 8px; }
.card-title { font-size: 1.1rem; font-weight: 700; color: var(--dark); margin: 0; flex: 1; }
.card-content { padding: 1.2rem; }

.profile-item { display: flex; justify-content: space-between; padding: 0.7rem 0; border-bottom: 1px dashed var(--border); }
.profile-item.full-width { flex-direction: column; gap: 0.4rem; border-bottom: none; }
.profile-label { color: var(--secondary); font-size: 0.9rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; }
.profile-value { font-weight: 600; color: var(--dark); }

.vital-item { display: flex; align-items: center; gap: 1rem; background: var(--light); padding: 0.8rem; border-radius: 10px; margin-bottom: 0.6rem; }
.vital-value { font-size: 1.2rem; font-weight: 800; color: var(--dark); }

.med-item { display: flex; gap: 1rem; padding: 0.8rem; background: #fff; border: 1px solid var(--border); border-radius: 8px; margin-bottom: 0.6rem; }
.med-name { font-weight: 700; color: var(--dark); }

/* --- CSS OPTIMISÉ POUR LE PDF / IMPRESSION --- */
@media print {
  :deep(.sidebar), .header-actions, .view-all-btn, .retry-btn { display: none !important; }
  .dashboard-container { padding: 0; margin: 0; width: 100%; background: white !important; }
  .card { box-shadow: none !important; border: 1px solid #eee !important; break-inside: avoid; margin-bottom: 20px; }
  .dashboard-grid { display: block; }
  .title-icon { box-shadow: none !important; border: 1px solid #eee; }
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-header { flex-direction: column; align-items: flex-start; }
  .header-actions { width: 100%; }
  .action-btn { flex: 1; justify-content: center; }
}
</style>