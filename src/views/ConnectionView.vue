<template>
  <AppLayout>
    <div class="page-container">
      <div class="login-page-wrapper">
        <div class="illustration-section">
          <div class="illustration-content">
            <img src="/santeko.png" alt="Illustration Santeko" class="login-illustration" />
            <h2>Bienvenue sur SanTeKo</h2>
            <p class="illustration-text">
              Votre santé, notre priorité.<br />
              La plateforme de santé connectée du Mali.
            </p>
            <div class="features-list">
              <div class="feature-item">
                <Shield :size="20" />
                <span>Données sécurisées</span>
              </div>
              <div class="feature-item">
                <Clock :size="20" />
                <span>Disponible 24/7</span>
              </div>
              <div class="feature-item">
                <Users :size="20" />
                <span>+10K utilisateurs</span>
              </div>
            </div>
          </div>
        </div>

        <div class="login-container">
          <div class="login-card">
            <div class="header">
              <div class="logo-mini">
                <img src="/santeko.png" alt="SanTeKo" />
              </div>
              <h2 class="title">Connexion</h2>
              <p class="subtitle">Accédez à votre espace sécurisé SanTeKo.</p>
            </div>

            <form @submit.prevent="seConnecter" class="login-form">
              <div class="input-group">
                <label for="email">Adresse E-mail</label>
                <div class="input-wrapper">
                  <Mail :size="18" class="input-icon" />
                  <input id="email" v-model="email" type="email" placeholder="nom@exemple.com" required />
                </div>
              </div>

              <div class="input-group">
                <label for="password">Mot de passe</label>
                <div class="input-wrapper">
                  <Lock :size="18" class="input-icon" />
                  <input 
                    id="password" 
                    v-model="password" 
                    :type="showPassword ? 'text' : 'password'" 
                    placeholder="********" 
                    required 
                  />
                  <button 
                    type="button" 
                    @click="showPassword = !showPassword" 
                    class="password-toggle"
                  >
                    <Eye :size="18" v-if="!showPassword" />
                    <EyeOff :size="18" v-else />
                  </button>
                </div>
              </div>

              <div class="roles-selection">
                <label class="roles-label">Choisissez votre profil :</label>
                <div class="roles-grid">
                  <label :class="['role-option', { 'active': role === 'patient' }]">
                    <input type="radio" v-model="role" value="patient" required />
                    <User :size="20" class="role-lucide-icon" />
                    <span>Patient</span>
                  </label>
                  <label :class="['role-option', { 'active': role === 'doctor' }]">
                    <input type="radio" v-model="role" value="doctor" required />
                    <Stethoscope :size="20" class="role-lucide-icon" />
                    <span>Médecin</span>
                  </label>
                  <label :class="['role-option', { 'active': role === 'nurse' }]">
                    <input type="radio" v-model="role" value="nurse" required />
                    <Heart :size="20" class="role-lucide-icon" />
                    <span>Infirmier</span>
                  </label>
                  <label :class="['role-option', { 'active': role === 'urgentist' }]">
                    <input type="radio" v-model="role" value="urgentist" required />
                    <Ambulance :size="20" class="role-lucide-icon" />
                    <span>Urgentiste</span>
                  </label>
                  <label :class="['role-option', { 'active': role === 'lab_technician' }]">
                    <input type="radio" v-model="role" value="lab_technician" required />
                    <FlaskConical :size="20" class="role-lucide-icon" />
                    <span>Labo</span>
                  </label>
                  <label :class="['role-option', { 'active': role === 'accountant' }]">
                    <input type="radio" v-model="role" value="accountant" required />
                    <Calculator :size="20" class="role-lucide-icon" />
                    <span>Comptable</span>
                  </label>
                  <label :class="['role-option', { 'active': role === 'admin' }]">
                    <input type="radio" v-model="role" value="admin" required />
                    <Settings :size="20" class="role-lucide-icon" />
                    <span>Admin</span>
                  </label>
                </div>
              </div>

              <button type="submit" :disabled="authStore.loading || isFetchingProfileId" class="btn-primary">
                <span v-if="authStore.loading || isFetchingProfileId" class="loader"></span>
                <LogIn v-else :size="20" />
                {{ authStore.loading ? 'Authentification...' : isFetchingProfileId ? 'Chargement profil...' : 'Se connecter' }}
              </button>
            </form>

            <p v-if="authStore.authError" class="error-message">
              <AlertCircle :size="18" />
              {{ authStore.authError }}
            </p>

            <div class="options-footer">
              <router-link to="/aide" class="link-secondary">Mot de passe oublié ?</router-link>
              <span class="separator">•</span>
              <router-link to="/inscription" class="link-secondary">Créer un compte</router-link>
            </div>
          </div>
        </div>
      </div>

      <AppFooter />
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useAuthStore } from '@/stores/authStores'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { 
  Mail, Lock, User, Stethoscope, Heart, Ambulance, FlaskConical, 
  Calculator, Settings, LogIn, AlertCircle, Shield, Clock, Users, Eye, EyeOff
} from 'lucide-vue-next'

const authStore = useAuthStore()
const userStore = useUserStore()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
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

    if (needsProfileId) {
      if (redirectionId) {
        await router.push({ name: redirectionRouteName, params: { id: redirectionId } });
      } else {
        // Si aucun profil n'est trouvé, rediriger vers une page de création de profil
        console.warn(`Aucun profil trouvé pour ${roleName}, redirection vers la page de création`);
        // Pour le technicien, on pourrait rediriger vers une page de création ou vers le dashboard avec l'ID utilisateur
        await router.push({ name: redirectionRouteName, params: { id: userId } });
      }
    } else {
      await router.push({ name: redirectionRouteName });
    }

  } catch (error) {
    authStore.authError = error.response?.data?.message || error.message;
    isFetchingProfileId.value = false;
  }
}
</script>

<style scoped>
.page-container {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  min-height: 100vh;
  color: white;
}

.login-page-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 100px);
  padding: 60px 5%;
  gap: 80px;
}

.illustration-section {
  flex: 1;
  max-width: 500px;
}

.illustration-content {
  text-align: center;
}

.login-illustration {
  width: 200px;
  height: 200px;
  filter: drop-shadow(0 20px 40px rgba(37, 99, 235, 0.3));
  margin-bottom: 30px;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.illustration-content h2 {
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #3b82f6, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.illustration-text {
  font-size: 1.2rem;
  color: #94a3b8;
  line-height: 1.7;
  margin-bottom: 40px;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  font-weight: 600;
}

.feature-item svg {
  color: #10b981;
}

.login-container {
  flex: 1;
  max-width: 480px;
}

.login-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  padding: 40px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.logo-mini {
  width: 60px;
  height: 60px;
  margin: 0 auto 20px;
}

.logo-mini img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.title {
  color: white;
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 8px;
}

.subtitle {
  color: #94a3b8;
  font-size: 15px;
}

.input-group {
  margin-bottom: 20px;
  text-align: left;
}

.input-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #cbd5e1;
  font-size: 14px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: #64748b;
}

.input-wrapper input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  font-size: 15px;
  color: white;
  transition: all 0.3s;
}

.input-wrapper input::placeholder {
  color: #64748b;
}

.input-wrapper input:focus {
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.roles-selection {
  margin-bottom: 24px;
}

.roles-label {
  display: block;
  font-weight: 600;
  margin-bottom: 16px;
  color: #cbd5e1;
  font-size: 14px;
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
  gap: 6px;
  padding: 14px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
}

.role-option input {
  display: none;
}

.role-lucide-icon {
  color: #64748b;
  transition: color 0.3s;
}

.role-option:hover {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(255, 255, 255, 0.08);
}

.role-option.active {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(16, 185, 129, 0.1));
  border-color: #3b82f6;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.2);
}

.role-option.active .role-lucide-icon {
  color: #3b82f6;
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.password-toggle:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.1);
}

.btn-primary {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(135deg, #2563eb, #10b981);
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid rgba(239, 68, 68, 0.2);
  font-size: 14px;
}

.options-footer {
  margin-top: 24px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
}

.separator {
  margin: 0 12px;
  color: #475569;
}

.link-secondary {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}

.link-secondary:hover {
  color: #60a5fa;
}

.loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 992px) {
  .login-page-wrapper {
    flex-direction: column;
    gap: 40px;
  }
  
  .illustration-section {
    display: none;
  }
}

@media (max-width: 480px) {
  .roles-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .login-card {
    padding: 25px;
  }
  
  .title {
    font-size: 1.6rem;
  }
}
</style>