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
      <!-- Header avec titre et actions -->
      <div class="dashboard-header">
        <div class="header-content">
          <h1 class="page-title">
            <i class="fas fa-heartbeat title-icon"></i>
            Tableau de Bord Santé
          </h1>
          <p class="page-subtitle">Vue d'ensemble de votre santé et traitements</p>
        </div>
        <div class="header-actions">
          <button class="action-btn primary">
            <i class="fas fa-download"></i>
            Exporter
          </button>
          <button class="action-btn secondary">
            <i class="fas fa-print"></i>
            Imprimer
          </button>
        </div>
      </div>

      <!-- Grid principale -->
      <div class="dashboard-grid">

        <!-- Carte Profil Santé -->
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
                <div class="profile-label">
                  <i class="fas fa-user"></i>
                  Nom complet
                </div>
                <div class="profile-value">{{ user.first_name }} {{ user.last_name }}</div>
              </div>

              <div class="profile-item">
                <div class="profile-label">
                  <i class="fas fa-birthday-cake"></i>
                  Âge
                </div>
                <div class="profile-value">
                  <span class="value-badge">{{ patientProfile.age !== null ? patientProfile.age + ' ans' : 'N/R' }}</span>
                </div>
              </div>

              <div class="profile-item">
                <div class="profile-label">
                  <i class="fas fa-venus-mars"></i>
                  Sexe
                </div>
                <div class="profile-value">{{ currentPatient.genre || 'Non renseigné' }}</div>
              </div>

              <div class="profile-item">
                <div class="profile-label">
                  <i class="fas fa-tint"></i>
                  Groupe sanguin
                </div>
                <div class="profile-value">
                  <span :class="['blood-type', { 'positive': currentPatient.group_sanguine && currentPatient.group_sanguine.includes('+') }]">
                    {{ currentPatient.group_sanguine || 'N/R' }}
                  </span>
                </div>
              </div>

              <div class="profile-item full-width">
                <div class="profile-label">
                  <i class="fas fa-allergies"></i>
                  Allergies
                </div>
                <div class="profile-value">
                  <span class="allergy-tag">
                    {{ currentPatient.allergies || 'Aucune allergie connue' }}
                  </span>
                </div>
              </div>

              <div class="profile-item full-width">
                <div class="profile-label">
                  <i class="fas fa-history"></i>
                  Antécédents
                </div>
                <div class="profile-value medical-history">
                  {{ currentPatient.maladies_chroniques || 'Aucun antécédent majeur' }}
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Carte Données Vitales -->
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
                <div class="vital-icon">
                  <i class="fas fa-tint"></i>
                </div>
                <div class="vital-info">
                  <div class="vital-label">Tension artérielle</div>
                  <div class="vital-value">{{ latestVitalSigns.blood_pressure || 'N/A' }}</div>
                </div>
              </div>

              <div class="vital-item">
                <div class="vital-icon heart">
                  <i class="fas fa-heart"></i>
                </div>
                <div class="vital-info">
                  <div class="vital-label">Fréquence cardiaque</div>
                  <div class="vital-value">{{ latestVitalSigns.heart_rate || 'N/A' }} <span class="unit">bpm</span></div>
                </div>
              </div>

              <div class="vital-item">
                <div class="vital-icon temp">
                  <i class="fas fa-thermometer-half"></i>
                </div>
                <div class="vital-info">
                  <div class="vital-label">Température</div>
                  <div class="vital-value">{{ latestVitalSigns.temperature || 'N/A' }} <span class="unit">°C</span></div>
                </div>
              </div>
            </div>

            <div v-else class="empty-state">
              <div class="empty-icon">
                <i class="fas fa-chart-line"></i>
              </div>
              <h4>Aucune donnée récente</h4>
              <p>Vos mesures vitales apparaîtront ici</p>
            </div>

            <div v-if="latestVitalSigns" class="vitals-footer">
              <i class="fas fa-clock"></i>
              Dernière mise à jour: {{ formatDate(latestVitalSigns.created_at) }}
            </div>
          </div>
        </section>

        <!-- Carte Médicaments -->
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
                <div class="med-icon">
                  <i class="fas fa-capsules"></i>
                </div>
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
              <div class="empty-icon">
                <i class="fas fa-prescription-bottle-alt"></i>
              </div>
              <h4>Aucun médicament actif</h4>
              <p>Vos prescriptions apparaîtront ici</p>
            </div>

            <div v-if="activeMedications.length > 4" class="meds-footer">
              <span class="more-meds">+{{ activeMedications.length - 4 }} autres médicaments</span>
              <button class="view-all-btn">
                Voir tout <i class="fas fa-chevron-right"></i>
              </button>
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

// Stores
const authStore = useAuthStore();
const patientStore = usePatientStore();
const prescriptionStore = usePrescriptionStore();
const route = useRoute();

// Données de l'utilisateur connecté
const user = computed(() => authStore.user || {});
const currentPatient = computed(() => patientStore.currentPatient);
const loading = computed(() => patientStore.loading);

// Calcul de l'âge
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

// Données calculées
const patientProfile = computed(() => {
  const profile = currentPatient.value || {};
  const dob = authStore.user?.birth_date;

  return {
    ...profile,
    age: dob ? calculateAge(dob) : null,
  };
});

const latestVitalSigns = computed(() => {
  const vitals = currentPatient.value?.vital_signs || [];
  if (vitals.length > 0) {
    const sortedVitals = [...vitals].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return sortedVitals[0];
  }
  return null;
});

const activeMedications = computed(() => {
  const meds = [];
  if (prescriptionStore.prescriptions && Array.isArray(prescriptionStore.prescriptions)) {
    prescriptionStore.prescriptions.forEach(prescription => {
      if (prescription.status === 'active' && prescription.prescription_lines) {
        meds.push(...prescription.prescription_lines);
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
    if (currentPatient.value?.id) {
      await prescriptionStore.fetchPatientPrescriptions(currentPatient.value.id);
    }
  }
};

// Cycle de vie
onMounted(async () => {
  if (authStore.profileId) {
    await patientStore.fetchMyProfile();
    if (currentPatient.value?.id) {
      await prescriptionStore.fetchPatientPrescriptions(currentPatient.value.id);
    }
  } else {
    const patientIdFromRoute = route.params.id;
    if (patientIdFromRoute) {
      await patientStore.onePatient(patientIdFromRoute);
      if (currentPatient.value?.id) {
        await prescriptionStore.fetchPatientPrescriptions(currentPatient.value.id);
      }
    }
  }
});

watch(currentPatient, async (newPatient) => {
  if (newPatient && newPatient.id) {
    await prescriptionStore.fetchPatientPrescriptions(newPatient.id);
  } else {
    prescriptionStore.prescriptions = [];
  }
}, { immediate: false });
</script>

<style scoped>
/* ========================================= */
/* VARIABLES & FONTS                         */
/* ========================================= */
:root {
  --primary: #2563eb;
  --primary-dark: #1d4ed8;
  --primary-light: #dbeafe;
  --secondary: #64748b;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --info: #06b6d4;
  --dark: #1e293b;
  --light: #f8fafc;
  --border: #e2e8f0;
  --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --radius: 12px;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

* {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ========================================= */
/* LAYOUT PRINCIPAL                          */
/* ========================================= */
.dashboard-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--dark);
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-icon {
  color: var(--primary);
  font-size: 1.8rem;
}

.page-subtitle {
  color: var(--secondary);
  font-size: 1.1rem;
  margin: 0;
  font-weight: 400;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.action-btn.primary {
  background: var(--primary);
  color: white;
}

.action-btn.primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.action-btn.secondary {
  background: var(--light);
  color: var(--dark);
  border: 1px solid var(--border);
}

.action-btn.secondary:hover {
  background: white;
  border-color: var(--primary);
}

/* ========================================= */
/* GRID & CARDS                              */
/* ========================================= */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  padding: 0 1rem;
}

.card {
  background: white;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  transition: var(--transition);
  border: 1px solid var(--border);
  overflow: hidden;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card-header {
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--light);
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
  color: var(--primary);
  font-size: 1.1rem;
}

.card-icon.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--dark);
  margin: 0;
  flex: 1;
}

.card-content {
  padding: 1.5rem;
}

/* ========================================= */
/* PROFIL SANTÉ                              */
/* ========================================= */
.profile-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.profile-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border);
}

.profile-item:last-child {
  border-bottom: none;
}

.profile-item.full-width {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.profile-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--secondary);
  font-weight: 500;
  font-size: 0.9rem;
}

.profile-label i {
  width: 16px;
  text-align: center;
}

.profile-value {
  font-weight: 600;
  color: var(--dark);
}

.value-badge {
  background: var(--primary-light);
  color: var(--primary);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.blood-type {
  background: var(--danger);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.9rem;
}

.blood-type.positive {
  background: var(--success);
}

.allergy-tag {
  background: var(--warning);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
}

.medical-history {
  line-height: 1.5;
  font-size: 0.9rem;
}

/* ========================================= */
/* DONNÉES VITALES                           */
/* ========================================= */
.vitals-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.vital-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--light);
  border-radius: 8px;
  transition: var(--transition);
}

.vital-item:hover {
  background: var(--primary-light);
}

.vital-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  color: var(--primary);
  font-size: 1.2rem;
  box-shadow: var(--shadow);
}

.vital-icon.heart {
  color: var(--danger);
  animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes heartbeat {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.vital-icon.temp {
  color: var(--warning);
}

.vital-info {
  flex: 1;
}

.vital-label {
  font-size: 0.9rem;
  color: var(--secondary);
  margin-bottom: 0.25rem;
}

.vital-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--dark);
}

.unit {
  font-size: 1rem;
  color: var(--secondary);
  font-weight: 400;
}

.vitals-footer {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  font-size: 0.85rem;
  color: var(--secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* ========================================= */
/* MÉDICAMENTS                               */
/* ========================================= */
.meds-count {
  background: var(--primary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.meds-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.med-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: var(--light);
  border-radius: 8px;
  transition: var(--transition);
}

.med-item:hover {
  background: var(--primary-light);
}

.med-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--warning);
  color: white;
  font-size: 1.1rem;
}

.med-details {
  flex: 1;
}

.med-name {
  font-weight: 600;
  color: var(--dark);
  margin-bottom: 0.25rem;
}

.med-specs {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--secondary);
}

.dosage, .frequency {
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--border);
}

.meds-footer {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.more-meds {
  font-size: 0.9rem;
  color: var(--secondary);
}

.view-all-btn {
  background: none;
  border: none;
  color: var(--primary);
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
  transition: var(--transition);
}

.view-all-btn:hover {
  color: var(--primary-dark);
  gap: 0.5rem;
}

/* ========================================= */
/* ÉTATS (LOADING, ERROR, EMPTY)             */
/* ========================================= */
.state-container {
  text-align: center;
  padding: 4rem 2rem;
  max-width: 500px;
  margin: 2rem auto;
  background: white;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.spinner-container {
  margin-bottom: 1.5rem;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid var(--primary-light);
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

.icon-container {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2rem;
}

.loading-state .icon-container {
  background: var(--primary-light);
  color: var(--primary);
}

.error-state .icon-container {
  background: #fee2e2;
  color: var(--danger);
}

.info-state .icon-container {
  background: var(--primary-light);
  color: var(--primary);
}

.state-container h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--dark);
}

.state-container p {
  color: var(--secondary);
  margin-bottom: 1.5rem;
}

.retry-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.retry-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 3rem;
  color: var(--border);
  margin-bottom: 1rem;
}

.empty-state h4 {
  font-size: 1.2rem;
  color: var(--secondary);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--secondary);
  font-size: 0.9rem;
}

/* ========================================= */
/* RESPONSIVE                                */
/* ========================================= */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    padding: 0;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .card-content {
    padding: 1rem;
  }

  .profile-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .vital-item {
    padding: 0.75rem;
  }

  .med-item {
    padding: 0.75rem;
  }
}

@media (max-width: 480px) {
  .med-specs {
    flex-direction: column;
    gap: 0.5rem;
  }

  .action-btn {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
}
</style>
