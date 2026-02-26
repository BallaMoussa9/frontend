<template>
  <SidebarLayout>
    <section class="profile-section">
      <div class="profile-header">
        <div>
          <h1><i class="fas fa-id-card"></i> Mon Profil Médical</h1>
          <p class="subtitle">Gérez vos informations personnelles et antécédents</p>
        </div>
        <button class="print-btn" @click="window.print()">
          <i class="fas fa-print"></i> Imprimer la fiche
        </button>
      </div>

      <transition name="fade">
        <p v-if="patientStore.error" class="message error">
          <i class="fas fa-exclamation-circle"></i> {{ patientStore.error }}
        </p>
      </transition>
      <transition name="fade">
        <p v-if="patientStore.success" class="message success">
          <i class="fas fa-check-circle"></i> {{ patientStore.success }}
        </p>
      </transition>

      <div v-if="patientStore.isLoading && !currentPatientData" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement de votre dossier...</p>
      </div>

      <div v-else-if="currentPatientData" class="profile-content">
        <div class="profile-card">
          <div class="card-title-container">
            <i class="fas fa-user-circle"></i>
            <h2>Informations personnelles</h2>
          </div>
          
          <form @submit.prevent="updatePersonalInfo" class="profile-form">
            <div class="form-grid">
              <div class="form-group">
                <label><i class="fas fa-signature"></i> Prénom</label>
                <input v-model="form.first_name" type="text" required placeholder="Prénom" />
              </div>
              <div class="form-group">
                <label>Nom</label>
                <input v-model="form.last_name" type="text" required placeholder="Nom" />
              </div>
              <div class="form-group">
                <label><i class="fas fa-envelope"></i> Email</label>
                <input v-model="form.email" type="email" required placeholder="email@exemple.com" />
              </div>
              <div class="form-group">
                <label><i class="fas fa-phone"></i> Téléphone</label>
                <input v-model="form.phone" type="text" required placeholder="+223..." />
              </div>
              <div class="form-group">
                <label><i class="fas fa-calendar-alt"></i> Date de naissance</label>
                <input v-model="form.birth_date" type="date" required />
              </div>
              <div class="form-group">
                <label><i class="fas fa-venus-mars"></i> Sexe</label>
                <select v-model="form.genre">
                  <option value="">Sélectionner</option>
                  <option value="Masculin">Masculin</option>
                  <option value="Féminin">Féminin</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div class="form-group full-width">
                <label><i class="fas fa-map-marker-alt"></i> Adresse complète</label>
                <div class="address-inputs">
                  <input v-model="form.address" type="text" placeholder="Rue, Porte..." class="flex-2" />
                  <input v-model="form.city" type="text" placeholder="Ville" class="flex-1" />
                  <input v-model="form.country" type="text" placeholder="Pays" class="flex-1" />
                </div>
              </div>
            </div>

            <div class="form-grid secondary-info">
              <div class="form-group">
                <label><i class="fas fa-weight"></i> Poids (kg)</label>
                <input v-model="form.poids" type="number" min="1" step="0.1" />
              </div>
              <div class="form-group">
                <label><i class="fas fa-ruler-vertical"></i> Taille (cm)</label>
                <input v-model="form.taille" type="number" min="1" />
              </div>
              <div class="form-group">
                <label><i class="fas fa-tint"></i> Groupe sanguin</label>
                <input v-model="form.group_sanguine" type="text" placeholder="Ex: O+" />
              </div>
              <div class="form-group">
                <label><i class="fas fa-phone-alt"></i> Urgence</label>
                <input v-model="form.telephone_urgence" type="text" placeholder="Contact d'urgence" />
              </div>
            </div>

            <button type="submit" class="submit-btn" :disabled="patientStore.isLoading">
              <i class="fas fa-save"></i>
              {{ patientStore.isLoading ? 'Mise à jour...' : 'Mettre à jour les infos' }}
            </button>
          </form>
        </div>

        <div class="profile-card medical-card">
          <div class="card-title-container">
            <i class="fas fa-notes-medical"></i>
            <h2>Détails Médicaux & Assurance</h2>
          </div>
          
          <form @submit.prevent="updateMedicalInfo" class="profile-form">
            <div class="form-group">
              <label><i class="fas fa-stethosocpe"></i> Maladies chroniques</label>
              <textarea v-model="form.maladies_chroniques" rows="3" placeholder="Ex: Diabète, Hypertension..." />
            </div>

            <div class="form-group">
              <label><i class="fas fa-allergies"></i> Allergies connues</label>
              <textarea v-model="form.allergies" rows="3" placeholder="Ex: Pénicilline, Pollen..." />
            </div>

            <div class="form-group">
              <label><i class="fas fa-shield-alt"></i> Assurance Maladie / Mutuelle</label>
              <input v-model="form.assurance_maladie" type="text" placeholder="Numéro ou Nom de l'assurance" />
            </div>

            <button type="submit" class="submit-btn secondary" :disabled="patientStore.isLoading">
              <i class="fas fa-file-medical"></i>
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
  padding: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h1 { font-size: 2rem; color: #1e293b; margin: 0; display: flex; align-items: center; gap: 12px; }
.subtitle { color: #64748b; margin-top: 4px; }

.print-btn {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
}
.print-btn:hover { background: #f8fafc; }

.profile-content { display: flex; flex-direction: column; gap: 2rem; }

.profile-card {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.card-title-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1.5rem;
  color: #2563eb;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 1rem;
}

.card-title-container h2 { font-size: 1.25rem; color: #1e293b; margin: 0; }

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.2rem;
  margin-bottom: 1.5rem;
}

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full-width { grid-column: span 2; }

label { font-size: 0.9rem; font-weight: 600; color: #475569; }

input, select, textarea {
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.address-inputs { display: flex; gap: 10px; }
.flex-2 { flex: 2; }
.flex-1 { flex: 1; }

.submit-btn {
  width: 100%;
  padding: 0.8rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: 0.3s;
}

.submit-btn:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); }
.submit-btn.secondary { background: #0f172a; }

.message {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 10px;
}
.message.error { background: #fef2f2; color: #b91c1c; border: 1px solid #fee2e2; }
.message.success { background: #f0fdf4; color: #15803d; border: 1px solid #dcfce7; }

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem;
  color: #2563eb;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

@media print {
  .sidebar, .submit-btn, .print-btn, .message { display: none !important; }
  .profile-section { padding: 0; }
  .profile-card { box-shadow: none; border: 1px solid #eee; }
}

@media (max-width: 768px) {
  .form-grid { grid-template-columns: 1fr; }
  .form-group.full-width { grid-column: span 1; }
  .address-inputs { flex-direction: column; }
}
</style>