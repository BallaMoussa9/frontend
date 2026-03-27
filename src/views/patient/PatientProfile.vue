<template>
  <SidebarLayout>
    <section class="profile-section">
      <div class="profile-header">
        <div>
          <h1><IdCard :size="32" class="title-icon" /> Mon Profil Médical</h1>
          <p class="subtitle">Gérez vos informations personnelles et antécédents</p>
        </div>
        <button class="print-btn" @click="window.print()">
          <Printer :size="18" /> Imprimer la fiche
        </button>
      </div>

      <transition name="fade">
        <p v-if="patientStore.error" class="message error">
          <AlertCircle :size="20" /> {{ patientStore.error }}
        </p>
      </transition>
      <transition name="fade">
        <p v-if="patientStore.success" class="message success">
          <CheckCircle :size="20" /> {{ patientStore.success }}
        </p>
      </transition>

      <div v-if="patientStore.isLoading && !currentPatientData" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement de votre dossier...</p>
      </div>

      <div v-else-if="currentPatientData" class="profile-content">
        <div class="profile-card">
          <div class="card-title-container">
            <User :size="24" />
            <h2>Informations personnelles</h2>
          </div>
          
          <form @submit.prevent="updatePersonalInfo" class="profile-form">
            <div class="form-grid">
              <div class="form-group">
                <label><Signature :size="16" /> Prénom</label>
                <input v-model="form.first_name" type="text" required placeholder="Prénom" />
              </div>
              <div class="form-group">
                <label><User :size="16" /> Nom</label>
                <input v-model="form.last_name" type="text" required placeholder="Nom" />
              </div>
              <div class="form-group">
                <label><Mail :size="16" /> Email</label>
                <input v-model="form.email" type="email" required placeholder="email@exemple.com" />
              </div>
              <div class="form-group">
                <label><Phone :size="16" /> Téléphone</label>
                <input v-model="form.phone" type="text" required placeholder="+223..." />
              </div>
              <div class="form-group">
                <label><Calendar :size="16" /> Date de naissance</label>
                <input v-model="form.birth_date" type="date" required />
              </div>
              <div class="form-group">
                <label><Users :size="16" /> Sexe</label>
                <select v-model="form.genre">
                  <option value="">Sélectionner</option>
                  <option value="Masculin">Masculin</option>
                  <option value="Féminin">Féminin</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div class="form-group full-width">
                <label><MapPin :size="16" /> Adresse complète</label>
                <div class="address-inputs">
                  <input v-model="form.address" type="text" placeholder="Rue, Porte..." class="flex-2" />
                  <input v-model="form.city" type="text" placeholder="Ville" class="flex-1" />
                  <input v-model="form.country" type="text" placeholder="Pays" class="flex-1" />
                </div>
              </div>
            </div>

            <div class="form-grid secondary-info">
              <div class="form-group">
                <label><Weight :size="16" /> Poids (kg)</label>
                <input v-model="form.poids" type="number" min="1" step="0.1" />
              </div>
              <div class="form-group">
                <label><Ruler :size="16" /> Taille (cm)</label>
                <input v-model="form.taille" type="number" min="1" />
              </div>
              <div class="form-group">
                <label><Droplets :size="16" /> Groupe sanguin</label>
                <input v-model="form.group_sanguine" type="text" placeholder="Ex: O+" />
              </div>
              <div class="form-group">
                <label><Phone :size="16" /> Urgence</label>
                <input v-model="form.telephone_urgence" type="text" placeholder="Contact d'urgence" />
              </div>
            </div>

            <button type="submit" class="submit-btn" :disabled="patientStore.isLoading">
              <Save :size="18" />
              {{ patientStore.isLoading ? 'Mise à jour...' : 'Mettre à jour les infos' }}
            </button>
          </form>
        </div>

        <div class="profile-card medical-card">
          <div class="card-title-container">
            <Stethoscope :size="24" />
            <h2>Détails Médicaux & Assurance</h2>
          </div>
          
          <form @submit.prevent="updateMedicalInfo" class="profile-form">
            <div class="form-group">
              <label><Heart :size="16" /> Maladies chroniques</label>
              <textarea v-model="form.maladies_chroniques" rows="3" placeholder="Ex: Diabète, Hypertension..." />
            </div>

            <div class="form-group">
              <label><Shield :size="16" /> Allergies connues</label>
              <textarea v-model="form.allergies" rows="3" placeholder="Ex: Pénicilline, Pollen..." />
            </div>

            <div class="form-group">
              <label><Shield :size="16" /> Assurance Maladie / Mutuelle</label>
              <input v-model="form.assurance_maladie" type="text" placeholder="Numéro ou Nom de l'assurance" />
            </div>

            <button type="submit" class="submit-btn secondary" :disabled="patientStore.isLoading">
              <FileText :size="18" />
              {{ patientStore.isLoading ? 'Sauvegarde...' : 'Sauvegarder les détails médicaux' }}
            </button>
          </form>
        </div>
      </div>
    </section>
  </SidebarLayout>
</template>

<script setup>
import { reactive, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { usePatientStore } from '@/stores/patientStore';
import SidebarLayout from '@/layouts/SidebarLayout.vue';
import {
  User, Calendar, Mail, Phone, MapPin, Weight, Ruler, Droplets, Shield,
  FileText, AlertCircle, CheckCircle, Printer, Save, Stethoscope, Heart,
  Activity, Home, IdCard, Users, Signature, Building, Globe
} from 'lucide-vue-next';

const route = useRoute();
const patientStore = usePatientStore();

const form = reactive({
  first_name: '', last_name: '', email: '', phone: '',
  birth_date: '', city: '', address: '', country: '',
  genre: '', group_sanguine: '', telephone_urgence: '',
  maladies_chroniques: '', assurance_maladie: '',
  poids: '', taille: '', allergies: '',
});

const currentPatientData = computed(() => patientStore.currentPatient);

const initializeForm = (data) => {
  if (!data) return;
  const user = data.user || {};
  form.first_name = user.first_name || data.first_name || '';
  form.last_name = user.last_name || data.last_name || '';
  form.email = user.email || data.email || '';
  form.phone = user.phone || data.phone || '';
  form.birth_date = user.birth_date || data.birth_date || '';
  form.city = user.city || data.city || '';
  form.address = user.address || data.address || '';
  form.country = user.country || data.country || '';
  form.genre = data.genre || '';
  form.group_sanguine = data.group_sanguine || '';
  form.telephone_urgence = data.telephone_urgence || '';
  form.maladies_chroniques = data.maladies_chroniques || '';
  form.assurance_maladie = data.assurance_maladie || '';
  form.poids = data.poids || '';
  form.taille = data.taille || '';
  form.allergies = data.allergies || '';
};

onMounted(() => {
  const patientId = route.params.id;
  if (patientId) patientStore.onePatient(patientId);
});

watch(currentPatientData, (newData) => {
  if (newData) initializeForm(newData);
}, { immediate: true });

// Gestion automatique de la disparition des messages
watch(() => patientStore.success, (val) => {
  if (val) setTimeout(() => { patientStore.success = null }, 3000);
});

async function updatePersonalInfo() {
  const patientId = route.params.id;
  if (!patientId) return;
  await patientStore.updatePatient(patientId, { ...form });
}

async function updateMedicalInfo() {
  const patientId = route.params.id;
  if (!patientId) return;
  await patientStore.updatePatient(patientId, {
    maladies_chroniques: form.maladies_chroniques,
    allergies: form.allergies,
    assurance_maladie: form.assurance_maladie,
  });
}
</script>

<style scoped>
.profile-section {
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
  max-width: 900px;
  margin: 0 auto;
}

.profile-header {
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

h1 { 
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

.subtitle { 
  color: var(--gray); 
  font-size: 1.1rem; 
  margin-top: 8px;
  opacity: 0.9;
}

.print-btn {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border: none;
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
}

.print-btn:hover { 
  background: linear-gradient(135deg, var(--primary-dark), var(--secondary-dark));
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.5);
}

.profile-content { 
  display: flex; 
  flex-direction: column; 
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

.profile-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}

.profile-card::before {
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

.profile-card:hover::before {
  transform: scaleX(1);
}

.profile-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.5);
  border-color: var(--primary);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
}

.medical-card {
  margin-top: 2rem;
}

.card-title-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
}

.card-title-container svg {
  color: white;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  padding: 8px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.card-title-container h2 { 
  font-size: 1.4rem; 
  font-weight: 800;
  color: white; 
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

/* Variables CSS */
:root {
  --primary: #2563eb;
  --secondary: #10b981;
  --gray: #ffffff;
  --gray-light: #ffffff;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group { 
  display: flex; 
  flex-direction: column; 
  gap: 1.2rem; 
  animation: fadeIn 0.6s ease-out backwards;
}

.form-group:nth-child(1) { animation-delay: 0.1s; }
.form-group:nth-child(2) { animation-delay: 0.2s; }
.form-group:nth-child(3) { animation-delay: 0.3s; }
.form-group:nth-child(4) { animation-delay: 0.4s; }
.form-group:nth-child(5) { animation-delay: 0.5s; }
.form-group:nth-child(6) { animation-delay: 0.6s; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-group.full-width { grid-column: span 2; }

label { 
  font-size: 0.95rem; 
  font-weight: 700; 
  color: white; 
  display: flex;
  align-items: center;
  gap: 0.8rem;
  opacity: 0.9;
  margin-top: 0.5rem;
}

label svg {
  color: var(--primary-light);
}

input, select, textarea {
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

.address-inputs { 
  display: flex; 
  gap: 1rem; 
}

.flex-2 { flex: 2; }
.flex-1 { flex: 1; }

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

.submit-btn.secondary { 
  background: linear-gradient(135deg, var(--secondary), var(--secondary-dark));
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
  margin-top: 2rem;
}

.submit-btn.secondary:hover:not(:disabled) { 
  box-shadow: 0 15px 35px rgba(16, 185, 129, 0.5);
}

.message {
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
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

@keyframes spin { 
  0% { transform: rotate(0deg); } 
  100% { transform: rotate(360deg); } 
}

.loading-state p {
  color: var(--gray);
  font-size: 1.1rem;
  font-weight: 600;
}

/* Variables CSS supplémentaires */
:root {
  --primary: #2563eb;
  --primary-dark: #1e40af;
  --primary-light: #3b82f6;
  --secondary: #10b981;
  --secondary-dark: #059669;
  --gray: #94a3b8;
  --gray-light: #cbd5e1;
  --dark: #0f172a;
}

@media print {
  .sidebar, .submit-btn, .print-btn, .message { display: none !important; }
  .profile-section { padding: 0; }
  .profile-card { 
    box-shadow: none; 
    border: 1px solid #eee; 
    background: white !important;
    color: black !important;
  }
  .profile-card * { color: black !important; }
  input, select, textarea {
    background: white !important;
    color: black !important;
    border: 1px solid #ccc !important;
  }
}

@media (max-width: 768px) {
  .profile-header {
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
  
  .form-group.full-width { grid-column: span 1; }
  
  .address-inputs { 
    flex-direction: column; 
    gap: 1rem;
  }
  
  .profile-section {
    padding: 1rem;
  }
  
  .profile-card {
    padding: 1.5rem;
  }
}
</style>