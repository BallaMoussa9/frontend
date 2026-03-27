<template>
  <SidebarLayout>
    <div v-if="loading || prescriptionStore.loading" class="state-container loading-state">
      <div class="spinner-container">
        <div class="spinner"></div>
      </div>
      <h3>Préparation de votre espace santé</h3>
      <p style="color: white;">Chargement de vos données médicales...</p>
    </div>

    <div v-else-if="patientStore.error || prescriptionStore.error" class="state-container error-state">
      <div class="icon-container">
        <AlertCircle :size="48" />
      </div>
      <h3>Oups ! Une erreur est survenue</h3>
      <p>Nous rencontrons des difficultés techniques. Veuillez réessayer.</p>
      <button class="retry-btn" @click="retryLoading">Réessayer</button>
    </div>

    <div v-else-if="!currentPatient" class="state-container info-state">
      <div class="icon-container">
        <UserX :size="48" />
      </div>
      <h3>Dossier patient introuvable</h3>
      <p>Nous n'avons pas trouvé votre dossier médical. Contactez le support.</p>
    </div>

    <div v-else class="dashboard-container">
      <div class="dashboard-header">
        <div class="header-content">
          <h1 class="page-title">
            <Activity :size="32" class="title-icon" />
            Tableau de Bord Santé
          </h1>
          <p class="page-subtitle">Vue d'ensemble de votre santé et traitements</p>
        </div>
        <div class="header-actions">
          <button class="action-btn primary" @click="printDashboard">
            <Download :size="18" />
            Exporter en PDF
          </button>
          <button class="action-btn secondary" @click="printDashboard">
            <Printer :size="18" />
            Imprimer
          </button>
        </div>
      </div>

      <div class="dashboard-grid">
        <section class="card profile-card">
          <div class="card-header">
            <div class="card-icon">
              <Stethoscope :size="24" />
            </div>
            <h2 class="card-title">Profil Santé</h2>
          </div>
          <div class="card-content">
            <div class="profile-grid">
              <div class="profile-item">
                <div class="profile-label"><User :size="16" /> Nom complet</div>
                <div class="profile-value">{{ user.first_name }} {{ user.last_name }}</div>
              </div>

              <div class="profile-item">
                <div class="profile-label"><Calendar :size="16" /> Âge</div>
                <div class="profile-value">
                  <span class="value-badge">{{ patientProfile.age !== null ? patientProfile.age + ' ans' : 'N/R' }}</span>
                </div>
              </div>

              <div class="profile-item">
                <div class="profile-label"><Users :size="16" /> Sexe</div>
                <div class="profile-value">{{ currentPatient.genre || 'Non renseigné' }}</div>
              </div>

              <div class="profile-item">
                <div class="profile-label"><Droplets :size="16" /> Groupe sanguin</div>
                <div class="profile-value">
                  <span :class="['blood-type', { 'positive': currentPatient.group_sanguine && currentPatient.group_sanguine.includes('+') }]">
                    {{ currentPatient.group_sanguine || 'N/R' }}
                  </span>
                </div>
              </div>

              <div class="profile-item full-width">
                <div class="profile-label"><Shield :size="16" /> Allergies</div>
                <div class="profile-value">
                  <span class="allergy-tag">{{ currentPatient.allergies || 'Aucune allergie connue' }}</span>
                </div>
              </div>

              <div class="profile-item full-width">
                <div class="profile-label"><FileText :size="16" /> Antécédents</div>
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
              <Activity :size="24" />
            </div>
            <h2 class="card-title">Données Vitales</h2>
          </div>
          <div class="card-content">
            <div v-if="latestVitalSigns" class="vitals-grid">
              <div class="vital-item">
                <div class="vital-icon"><Droplets :size="20" /></div>
                <div class="vital-info">
                  <div class="vital-label">Tension artérielle</div>
                  <div class="vital-value">{{ latestVitalSigns.blood_pressure || 'N/A' }}</div>
                </div>
              </div>

              <div class="vital-item">
                <div class="vital-icon heart"><Heart :size="20" /></div>
                <div class="vital-info">
                  <div class="vital-label">Fréquence cardiaque</div>
                  <div class="vital-value">{{ latestVitalSigns.heart_rate || 'N/A' }} <span class="unit">bpm</span></div>
                </div>
              </div>

              <div class="vital-item">
                <div class="vital-icon temp"><Thermometer :size="20" /></div>
                <div class="vital-info">
                  <div class="vital-label">Température</div>
                  <div class="vital-value">{{ latestVitalSigns.temperature || 'N/A' }} <span class="unit">°C</span></div>
                </div>
              </div>
            </div>

            <div v-else class="empty-state">
              <div class="empty-icon"><Activity :size="32" /></div>
              <h4>Aucune donnée récente</h4>
              <p>Vos mesures vitales apparaîtront ici</p>
            </div>

            <div v-if="latestVitalSigns" class="vitals-footer">
              <Clock :size="16" /> Dernière mise à jour: {{ formatDate(latestVitalSigns.created_at) }}
            </div>
          </div>
        </section>

        <section class="card meds-card">
          <div class="card-header">
            <div class="card-icon">
              <Pill :size="24" />
            </div>
            <h2 class="card-title">Médicaments Actifs</h2>
            <span class="meds-count">{{ activeMedications.length }}</span>
          </div>
          <div class="card-content">
            <div v-if="activeMedications.length" class="meds-list">
              <div v-for="(med, index) in activeMedications.slice(0, 4)" :key="index" class="med-item">
                <div class="med-icon"><Pill :size="20" /></div>
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
              <div class="empty-icon"><FileText :size="32" /></div>
              <h4>Aucun médicament actif</h4>
              <p>Vos prescriptions apparaîtront ici</p>
            </div>

            <div v-if="activeMedications.length > 4" class="meds-footer">
              <span class="more-meds">+{{ activeMedications.length - 4 }} autres médicaments</span>
              <button class="view-all-btn">Voir tout <ChevronRight :size="16" /></button>
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
import {
  Activity, User, Calendar, Users, FileText, Heart,
  Thermometer, Droplets, Pill, Clock, AlertCircle, UserX,
  Printer, Download, ChevronRight, Shield, Stethoscope
} from 'lucide-vue-next';

const authStore = useAuthStore();
const patientStore = usePatientStore();
const prescriptionStore = usePrescriptionStore();
const route = useRoute();

const user = computed(() => authStore.user || {});
const currentPatient = computed(() => patientStore.currentPatient);
const loading = computed(() => patientStore.loading);

// FONCTION IMPRIMER (Sert aussi pour l'export PDF via le navigateur)
const printDashboard = () => {
  // Ajouter les attributs de date et heure pour le footer d'impression
  const dashboardContainer = document.querySelector('.dashboard-container');
  if (dashboardContainer) {
    const now = new Date();
    dashboardContainer.setAttribute('data-date', now.toLocaleDateString('fr-FR'));
    dashboardContainer.setAttribute('data-time', now.toLocaleTimeString('fr-FR'));
  }
  
  // Attendre un peu que les attributs soient appliqués puis imprimer
  setTimeout(() => {
    window.print();
  }, 100);
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
  --shadow-lg: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 30px 60px -12px rgba(0, 0, 0, 0.5);
  --radius: 16px;
  
  font-family: 'Inter', sans-serif;
  padding: 2rem;
  margin: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  color: white;
  box-sizing: border-box;
  position: relative;
  overflow-x: hidden;
}

/* Animation de fond */
.dashboard-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at top, rgba(37, 99, 235, 0.15) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.dashboard-container > * {
  position: relative;
  z-index: 1;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  gap: 1.5rem;
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

.page-subtitle { 
  color: var(--light); 
  font-size: 1.1rem; 
  margin-top: 8px;
  opacity: 0.9;
}

.header-actions { display: flex; gap: 1rem; }
.action-btn {
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  transition: all 0.3s ease;
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.action-btn.primary { 
  background: linear-gradient(135deg, var(--primary), var(--secondary)); 
  color: white; 
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.5);
}

.action-btn.secondary { 
  background: rgba(255, 255, 255, 0.08); 
  color: white; 
  border: 2px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(255, 255, 255, 0.1);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  animation: fadeInUp 0.8s ease-out 0.3s both;
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

.card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border-radius: var(--radius);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  transition: all 0.4s ease;
  position: relative;
}

.card::before {
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

.card:hover::before {
  transform: scaleX(1);
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
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
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
  transition: all 0.3s ease;
}

.card:hover .card-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.5);
}

.card-icon.pulse {
  animation: iconPulse 2s infinite;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.card-title { 
  font-size: 1.3rem; 
  font-weight: 800; 
  color: white; 
  margin: 0; 
  flex: 1;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.card-content { 
  padding: 1.5rem; 
  position: relative;
}

.profile-item { 
  display: flex; 
  justify-content: space-between; 
  padding: 1rem 0; 
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.profile-item:hover {
  padding-left: 0.5rem;
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.profile-item.full-width { 
  flex-direction: column; 
  gap: 0.8rem; 
  border-bottom: none; 
  padding: 1rem 0;
}

.profile-label { 
  color: var(--light); 
  font-size: 0.95rem; 
  font-weight: 600; 
  display: flex; 
  align-items: center; 
  gap: 0.8rem;
  opacity: 0.9;
}

.profile-label svg {
  color: var(--primary-light);
}

.profile-value { 
  font-weight: 700; 
  color: white;
  font-size: 1rem;
}

.value-badge {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.blood-type {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 700;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.blood-type.positive {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
}

.allergy-tag {
  background: rgba(251, 146, 60, 0.2);
  color: #fb923c;
  padding: 8px 16px;
  border-radius: 12px;
  font-weight: 600;
  border: 1px solid rgba(251, 146, 60, 0.3);
  display: inline-block;
}

.medical-history {
  color: var(--light);
  line-height: 1.6;
  font-size: 0.95rem;
}

.vital-item { 
  display: flex; 
  align-items: center; 
  gap: 1.2rem; 
  background: rgba(255, 255, 255, 0.05); 
  padding: 1rem; 
  border-radius: 12px; 
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.vital-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(5px);
  border-color: rgba(255, 255, 255, 0.2);
}

.vital-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(16, 185, 129, 0.2));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-light);
  flex-shrink: 0;
}

.vital-icon.heart {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1));
  color: #ef4444;
}

.vital-icon.temp {
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.2), rgba(251, 146, 60, 0.1));
  color: #fb923c;
}

.vital-label {
  color: var(--light);
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.vital-value { 
  font-size: 1.3rem; 
  font-weight: 800; 
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.unit {
  font-size: 0.9rem;
  color: var(--light);
  font-weight: 600;
  margin-left: 4px;
}

.med-item { 
  display: flex; 
  gap: 1rem; 
  padding: 1rem; 
  background: rgba(255, 255, 255, 0.05); 
  border: 1px solid rgba(255, 255, 255, 0.1); 
  border-radius: 12px; 
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.med-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(5px);
  border-color: rgba(255, 255, 255, 0.2);
}

.med-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary);
  flex-shrink: 0;
}

.med-name { 
  font-weight: 700; 
  color: white; 
  font-size: 1.1rem;
  margin-bottom: 4px;
}

.med-specs {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.dosage, .frequency {
  background: rgba(255, 255, 255, 0.1);
  color: var(--light);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Empty states */
.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--light);
}

.empty-icon {
  color: var(--light);
  opacity: 0.5;
  margin-bottom: 1rem;
}

.empty-state h4 {
  color: var(--light);
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--light);
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Footer elements */
.vitals-footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--light);
  font-size: 0.85rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  margin-top: 1rem;
}

.vitals-footer svg {
  color: var(--primary-light);
}

.meds-count {
  background: linear-gradient(135deg, var(--secondary), var(--secondary-dark));
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.meds-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  margin-top: 1rem;
}

.more-meds {
  color: var(--light);
  font-size: 0.9rem;
  font-weight: 600;
}

.view-all-btn {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.view-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
}

/* State containers */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.loading-state .spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.state-container h3 {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.state-container p {
  color: var(--light);
  font-size: 1rem;
  opacity: 0.8;
}

.error-state .icon-container {
  color: var(--danger);
  margin-bottom: 1rem;
}

.info-state .icon-container {
  color: var(--warning);
  margin-bottom: 1rem;
}

.retry-btn {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
}

/* --- CSS PROFESSIONNEL POUR L'IMPRESSION --- */
@media print {
  /* Cacher les éléments non imprimables */
  :deep(.sidebar), .header-actions, .view-all-btn, .retry-btn, .action-btn, .spinner-container { 
    display: none !important; 
  }
  
  /* Conteneur principal */
  .dashboard-container { 
    padding: 20px !important; 
    margin: 0 !important; 
    width: 100% !important; 
    background: white !important; 
    color: black !important;
    font-family: 'Arial', sans-serif !important;
  }
  
  /* Header d'impression */
  .dashboard-header {
    border-bottom: 3px solid #2563eb !important;
    padding-bottom: 20px !important;
    margin-bottom: 30px !important;
    background: linear-gradient(135deg, #f8fafc, #e2e8f0) !important;
    border-radius: 8px !important;
    padding: 20px !important;
  }
  
  .page-title {
    color: #1e293b !important;
    font-size: 28px !important;
    font-weight: 700 !important;
    margin-bottom: 5px !important;
    text-align: center !important;
  }
  
  .page-subtitle {
    color: #64748b !important;
    font-size: 14px !important;
    text-align: center !important;
    margin-bottom: 0 !important;
  }
  
  /* Cards d'impression */
  .card { 
    box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important; 
    border: 1px solid #e2e8f0 !important; 
    break-inside: avoid; 
    margin-bottom: 25px !important;
    border-radius: 8px !important;
    background: white !important;
    padding: 20px !important;
  }
  
  .card-header {
    background: linear-gradient(135deg, #2563eb, #10b981) !important;
    color: white !important;
    padding: 15px 20px !important;
    margin: -20px -20px 15px -20px !important;
    border-radius: 8px 8px 0 0 !important;
  }
  
  .card-title {
    color: white !important;
    font-size: 18px !important;
    font-weight: 600 !important;
    margin: 0 !important;
  }
  
  .card-icon {
    background: rgba(255,255,255,0.2) !important;
    color: white !important;
    box-shadow: none !important;
    border: 1px solid rgba(255,255,255,0.3) !important;
  }
  
  /* Grid layout pour impression */
  .dashboard-grid { 
    display: grid !important;
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 25px !important;
    margin-bottom: 30px !important;
  }
  
  /* Informations patient */
  .profile-item, .vital-item {
    padding: 12px !important;
    border-left: 4px solid #2563eb !important;
    background: #f8fafc !important;
    margin-bottom: 10px !important;
    border-radius: 0 4px 4px 0 !important;
  }
  
  .profile-label, .vital-label { 
    color: #475569 !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
    margin-bottom: 4px !important;
  }
  
  .profile-value, .vital-value { 
    color: #1e293b !important;
    font-size: 16px !important;
    font-weight: 600 !important;
  }
  
  /* Médicaments et prescriptions */
  .med-item {
    padding: 12px !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 6px !important;
    background: #fafbfc !important;
    margin-bottom: 10px !important;
  }
  
  .med-name {
    color: #1e293b !important;
    font-weight: 600 !important;
    font-size: 14px !important;
  }
  
  .med-dosage {
    color: #64748b !important;
    font-size: 12px !important;
    margin-top: 4px !important;
  }
  
  /* Footer d'impression */
  .dashboard-container::after {
    content: "Document généré le " attr(data-date) " à " attr(data-time) !important;
    display: block !important;
    text-align: center !important;
    color: #94a3b8 !important;
    font-size: 10px !important;
    margin-top: 30px !important;
    padding-top: 20px !important;
    border-top: 1px solid #e2e8f0 !important;
  }
  
  /* Pagination */
  .card {
    page-break-inside: avoid !important;
  }
  
  /* Optimisations pour l'impression */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-header { 
    flex-direction: column; 
    align-items: flex-start; 
    gap: 1rem;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
  
  .header-actions { 
    width: 100%; 
    flex-direction: column;
  }
  
  .action-btn { 
    flex: 1; 
    justify-content: center;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .profile-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .vital-item {
    padding: 0.8rem;
  }
  
  .med-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>