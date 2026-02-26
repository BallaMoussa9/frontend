<template>
  <AppLayout>
    <div class="login-page-wrapper">
      <div class="illustration-section">
        <img src="/santeko.png" alt="Illustration Santeko" class="login-illustration" />
        <p class="illustration-text">
          Votre santé, notre priorité. <br />
          <span class="highlight">SanTeKo</span>, le futur de la santé connectée.
        </p>
      </div>

      <div class="login-container">
        <div class="login-card">
          <div class="header">
            <h2 class="title">Connexion</h2>
            <p class="subtitle">Accédez à votre espace sécurisé SanTeKo.</p>
          </div>

          <form @submit.prevent="seConnecter" class="login-form">
            <div class="input-group">
              <label for="email">Adresse E-mail</label>
              <div class="input-wrapper">
                <i class="fas fa-envelope"></i>
                <input id="email" v-model="email" type="email" placeholder="nom@exemple.com" required />
              </div>
            </div>

            <div class="input-group">
              <label for="password">Mot de passe</label>
              <div class="input-wrapper">
                <i class="fas fa-lock"></i>
                <input id="password" v-model="password" type="password" placeholder="********" required />
              </div>
            </div>

            <div class="roles-selection">
              <label class="roles-label">Choisissez votre profil :</label>
              <div class="roles-grid">
                <label :class="['role-option', { 'active': role === 'patient' }]">
                  <input type="radio" v-model="role" value="patient" required />
                  <span class="role-icon">👤</span> <span>Patient</span>
                </label>
                <label :class="['role-option', { 'active': role === 'doctor' }]">
                  <input type="radio" v-model="role" value="doctor" required />
                  <span class="role-icon">🩺</span> <span>Médecin</span>
                </label>
                <label :class="['role-option', { 'active': role === 'nurse' }]">
                  <input type="radio" v-model="role" value="nurse" required />
                  <span class="role-icon">💉</span> <span>Infirmier</span>
                </label>
                <label :class="['role-option', { 'active': role === 'urgentist' }]">
                  <input type="radio" v-model="role" value="urgentist" required />
                  <span class="role-icon">🚑</span> <span>Urgentiste</span>
                </label>
                <label :class="['role-option', { 'active': role === 'lab_technician' }]">
                  <input type="radio" v-model="role" value="lab_technician" required />
                  <span class="role-icon">🧪</span> <span>Labo</span>
                </label>
                <label :class="['role-option', { 'active': role === 'accountant' }]">
                  <input type="radio" v-model="role" value="accountant" required />
                  <span class="role-icon">💰</span> <span>Comptable</span>
                </label>
                <label :class="['role-option', { 'active': role === 'admin' }]">
                  <input type="radio" v-model="role" value="admin" required />
                  <span class="role-icon">⚙️</span> <span>Admin</span>
                </label>
              </div>
            </div>

            <button type="submit" :disabled="authStore.loading || isFetchingProfileId" class="btn-primary">
              <span v-if="authStore.loading || isFetchingProfileId" class="loader"></span>
              {{ authStore.loading ? 'Authentification...' : isFetchingProfileId ? 'Chargement profil...' : 'Se connecter' }}
            </button>
          </form>

          <p v-if="authStore.authError" class="error-message">
            <i class="fas fa-exclamation-circle"></i> {{ authStore.authError }}
          </p>

          <div class="options-footer">
            <a href="#" class="link-secondary">Mot de passe oublié ?</a>
            <span class="separator">|</span>
            <a href="#" class="link-secondary">Besoin d'aide ?</a>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
/* Votre script reste strictement identique */
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/authStores'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const authStore = useAuthStore()
const userStore = useUserStore()
const email = ref('')
const password = ref('')
const role = ref('patient') 
const router = useRouter()
const isFetchingProfileId = ref(false)

async function seConnecter() {
  authStore.authError = null;
  if (!role.value) {
    authStore.authError = "Veuillez sélectionner un rôle.";
    return;
  }
  try {
    const response = await authStore.login({
      email: email.value,
      password: password.value,
      role: role.value
    });
    const userId = response.user.id;
    const roleName = response.role_name; 
    let finalProfileId = userId;
    isFetchingProfileId.value = true;

    try {
      let profileIdFound = null;
      if (roleName === 'patient') profileIdFound = await userStore.fetchPatientByUserId(userId);
      else if (roleName === 'doctor') profileIdFound = await userStore.fetchDoctorByUserId(userId);
      else if (roleName === 'nurse') profileIdFound = await userStore.fetchNurseByUserId(userId);
      else if (roleName === 'urgentist') profileIdFound = await userStore.fetchUrgentistByUserId(userId); 
      else if (roleName === 'lab_technician') profileIdFound = await userStore.fetchLabTechnicianByUserId(userId);
      else if (roleName === 'accountant') profileIdFound = await userStore.fetchAccountantByUserId(userId);

      if (profileIdFound) finalProfileId = profileIdFound;
    } catch (e) { console.error(e); } 
    finally { isFetchingProfileId.value = false; }

    if (finalProfileId) authStore.setProfileId(finalProfileId);

    let redirectionRouteName;
    let needsProfileId = false; 
    let redirectionId = finalProfileId; 

    switch (roleName) {
      case 'patient': redirectionRouteName = 'PatientDashboard'; needsProfileId = true; break;
      case 'doctor': redirectionRouteName = 'DoctorDashboard'; needsProfileId = true; break;
      case 'nurse': redirectionRouteName = 'NurseDashboard'; needsProfileId = true; break;
      case 'urgentist': redirectionRouteName = 'UrgentisteDashboard'; needsProfileId = true; redirectionId = userId; break;
      case 'lab_technician': redirectionRouteName = 'LaborantinDashboard'; needsProfileId = true; break;
      case 'accountant': redirectionRouteName = 'AccountantDashboard'; needsProfileId = true; break;
      case 'admin': redirectionRouteName = 'AdminDashboard'; break;
      default: redirectionRouteName = 'Home';
    }

    if (needsProfileId) await router.push({ name: redirectionRouteName, params: { id: redirectionId } });
    else await router.push({ name: redirectionRouteName });

  } catch (error) {
    authStore.authError = error.response?.data?.message || error.message;
    isFetchingProfileId.value = false;
  }
}
</script>

<style scoped>
/* ---------------------------------
    DESIGN & LAYOUT
--------------------------------- */
.login-page-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 64px);
  background-color: #f4f7fc;
  padding: 40px 20px;
  gap: 60px;
}

.illustration-section {
  flex: 1;
  max-width: 450px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-illustration {
  width: 100%;
  max-width: 350px;
  filter: drop-shadow(0 10px 20px rgba(0,0,0,0.1));
  margin-bottom: 20px;
}

.illustration-text {
  font-size: 1.3rem;
  color: #1a365d;
  font-weight: 500;
}

.highlight { color: #0056b3; font-weight: 700; }

.login-card {
  background: white;
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 51, 102, 0.08);
  width: 100%;
  max-width: 450px;
}

.title {
  color: #002580;
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 8px;
}

.subtitle { color: #718096; margin-bottom: 30px; }

/* ---------------------------------
    FORMS
--------------------------------- */
.input-group { margin-bottom: 20px; text-align: left; }

.input-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #2d3748;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper i {
  position: absolute;
  left: 15px;
  color: #a0aec0;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 15px 12px 45px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s;
}

.input-wrapper input:focus {
  border-color: #0056b3;
  box-shadow: 0 0 0 4px rgba(0, 86, 179, 0.1);
  outline: none;
}

/* ---------------------------------
    ROLES GRID (The main change)
--------------------------------- */
.roles-label {
  display: block;
  font-weight: 600;
  margin-bottom: 15px;
  color: #2d3748;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.role-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85rem;
  font-weight: 600;
}

.role-option input { display: none; }

.role-icon { font-size: 1.4rem; margin-bottom: 4px; }

/* Style quand sélectionné */
.role-option.active {
  background: #ebf4ff;
  border-color: #0056b3;
  color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 86, 179, 0.1);
}

.btn-primary {
  width: 100%;
  background: #002580;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  margin-top: 20px;
  transition: 0.3s;
}

.btn-primary:hover { background: #00194d; transform: translateY(-2px); }

.error-message {
  margin-top: 20px;
  background: #fff5f5;
  color: #c53030;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #c53030;
  font-size: 0.9rem;
}

.options-footer { margin-top: 25px; color: #a0aec0; }
.link-secondary { color: #0056b3; text-decoration: none; font-weight: 600; }

/* ---------------------------------
    RESPONSIVE
--------------------------------- */
@media (max-width: 992px) {
  .login-page-wrapper { flex-direction: column; gap: 30px; }
  .illustration-section { display: none; } /* On cache l'illustration sur tablette/mobile pour gagner de la place */
}

@media (max-width: 480px) {
  .roles-grid { grid-template-columns: repeat(2, 1fr); }
  .login-card { padding: 25px; }
}
</style>