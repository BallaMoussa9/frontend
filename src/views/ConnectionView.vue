<template>
  <AppLayout>
    <div class="login-page-wrapper">
      <div class="illustration-section">
        <img src="/santeko.png" alt="Illustration Santeko" class="login-illustration" />
        <p class="illustration-text">
          Votre santé, notre priorité. <br />
          SanTeKo, le futur de la santé connectée.
        </p>
      </div>

      <div class="login-container">
        <div class="login-card">
          <div class="header">
            <h2 class="title">Connexion à SanTeKo</h2>
            <p class="subtitle">Sélectionnez votre rôle pour accéder à votre espace.</p>
          </div>

          <form @submit.prevent="seConnecter" class="login-form">
            <div class="input-group">
              <label for="email">Adresse E-mail</label>
              <input id="email" v-model="email" type="email" placeholder="votre.nom@santeko.com" required />
            </div>

            <div class="input-group">
              <label for="password">Mot de passe</label>
              <input id="password" v-model="password" type="password" placeholder="********" required />
            </div>

            <div class="roles-selection">
              <label class="roles-label">Je me connecte en tant que :</label>
              <div class="roles-grid">
                <label class="role-option">
                  <input type="radio" v-model="role" value="patient" required />
                  <span class="role-icon">👤</span> Patient
                </label>
                <label class="role-option">
                  <input type="radio" v-model="role" value="doctor" required />
                  <span class="role-icon">🩺</span> Médecin
                </label>
                <label class="role-option">
                  <input type="radio" v-model="role" value="nurse" required />
                  <span class="role-icon">💉</span> Infirmier
                </label>
                <label class="role-option">
                  <input type="radio" v-model="role" value="urgentist" required />
                  <span class="role-icon">🚑</span> Urgentiste
                </label>
                <label class="role-option">
                  <input type="radio" v-model="role" value="lab_technician" required />
                  <span class="role-icon">🧪</span> Laboratoire
                </label>
                <label class="role-option">
                  <input type="radio" v-model="role" value="accountant" required />
                  <span class="role-icon">💰</span> Comptable
                </label>
                <label class="role-option">
                  <input type="radio" v-model="role" value="admin" required />
                  <span class="role-icon">⚙️</span> Admin
                </label>
              </div>
            </div>

            <button type="submit" :disabled="authStore.loading || isFetchingProfileId" class="btn-primary">
              {{ authStore.loading ? 'Authentification...' : isFetchingProfileId ? 'Chargement profil...' : 'Se connecter' }}
            </button>
          </form>

          <p v-if="authStore.authError" class="error-message">
            {{ authStore.authError }}
          </p>

          <div class="options-footer">
            <a href="#" class="link-secondary">Mot de passe oublié ?</a>
            <span class="separator">|</span>
            <a href="#" class="link-secondary">Connexion OTP</a>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/authStores'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const authStore = useAuthStore()
const userStore = useUserStore()
const email = ref('')
const password = ref('')
const role = ref('patient') // Rôle par défaut
const router = useRouter()
const isFetchingProfileId = ref(false)


async function seConnecter() {
  authStore.authError = null;
  console.log("--- Début de la connexion ---");

  // Vérifie si un rôle a été sélectionné (même si 'required' est dans le template)
  if (!role.value) {
    authStore.authError = "Veuillez sélectionner un rôle pour vous connecter.";
    return;
  }

  try {
    // 1. Tente l'authentification
    const response = await authStore.login({
      email: email.value,
      password: password.value,
      role: role.value
    });

    const userId = response.user.id;
    const roleName = response.role_name; // Rôle confirmé par le backend
    
    console.log(`Authentification réussie. Utilisateur ID: ${userId}, Rôle: ${roleName}`);

    let finalProfileId = userId;
    isFetchingProfileId.value = true;

    // 2. Récupération de l'ID de profil spécifique au rôle
    try {
      let profileIdFound = null;

      if (roleName === 'patient') {
        profileIdFound = await userStore.fetchPatientByUserId(userId);
      } else if (roleName === 'doctor') {
        profileIdFound = await userStore.fetchDoctorByUserId(userId);
      } else if (roleName === 'nurse') {
        profileIdFound = await userStore.fetchNurseByUserId(userId);
      } else if (roleName === 'urgentist') {
        profileIdFound = await userStore.fetchUrgentistByUserId(userId);
      } else if (roleName === 'lab_technician') {
        profileIdFound = await userStore.fetchLabTechnicianByUserId(userId);
      } else if (roleName === 'accountant') {
        profileIdFound = await userStore.fetchAccountantByUserId(userId);
      } 
      // Admin utilise généralement l'ID utilisateur comme ID de profil

      if (profileIdFound) {
        finalProfileId = profileIdFound;
      }
    } catch (fetchError) {
      console.error(`❌ Échec de la récupération du profil spécifique (${roleName}).`, fetchError);
    } finally {
      isFetchingProfileId.value = false;
    }

    if (finalProfileId) {
      authStore.setProfileId(finalProfileId);
      console.log(`✅ ID de profil (${roleName}) stocké: ${finalProfileId}`);
    }

    // 3. LOGIQUE DE REDIRECTION CONDITIONNELLE
    let redirectionRouteName;

    switch (roleName) {
      case 'patient':
        redirectionRouteName = 'PatientDashboard';
        break;
      case 'doctor':
        redirectionRouteName = 'DoctorDashboard';
        break;
      case 'nurse':
        redirectionRouteName = 'NurseDashboard';
        break;
      case 'urgentist':
        redirectionRouteName = 'UrgentisteDashboard'; // Route Urgentiste (comme demandé)
        break;
      case 'lab_technician':
        redirectionRouteName = 'LabDashboard';
        break;
      case 'accountant':
        redirectionRouteName = 'AccountantDashboard';
        break;
      case 'admin':
        redirectionRouteName = 'AdminDashboard';
        break;
      default:
        redirectionRouteName = 'Home'; 
        console.warn(`Rôle non géré pour la redirection : ${roleName}. Redirection vers la page d'accueil.`);
        break;
    }

    await router.push({ name: redirectionRouteName });
    console.log(`✅ Redirection vers : ${redirectionRouteName}`);

  } catch (error) {
    // Gestion des erreurs spécifiques (comme le 422)
    let errorMessage = "Identifiants invalides ou une erreur inconnue est survenue.";

    if (error.response && error.response.data) {
        const data = error.response.data;
        
        // Cas 1: Identifiants invalides (le message général)
        if (data.message && data.message.includes("Identifiants invalides")) {
            errorMessage = "Email ou mot de passe incorrect. Veuillez vérifier vos informations.";
        } 
        // Cas 2: Rôle invalide (erreur spécifique 422)
        else if (data.message && data.message.includes("rôle sélectionné est invalide")) {
            errorMessage = "Le rôle sélectionné n'est pas associé à cet utilisateur ou est invalide.";
        }
        // Cas 3: Autres erreurs de validation
        else if (data.message) {
            errorMessage = data.message;
        }
    } else {
        // Erreur réseau ou autre
        errorMessage = error.message;
    }

    console.error('❌ Erreur de connexion (front-end) :', error);
    authStore.authError = errorMessage;
    isFetchingProfileId.value = false;
  }
  console.log("--- Fin de la connexion ---");
}
</script>

<style scoped>
/* (Le CSS reste inchangé et est inclus ci-dessous pour le composant complet) */

/* ---------------------------------
    GLOBAL LAYOUT (NOUVEAU)
--------------------------------- */
.login-page-wrapper {
  display: flex;
  justify-content: center;
  align-items: stretch;
  min-height: 100vh;
  background-color: #f0f4f8;
  padding: 50px 20px;
  gap: 40px;
}

/* Section illustration */
.illustration-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-width: 500px;
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #e6f7ff, #cceeff);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.login-illustration {
  max-width: 80%;
  height: auto;
  margin-bottom: 30px;
}

.illustration-text {
  font-size: 1.2rem;
  color: #003366;
  font-weight: 600;
  line-height: 1.5;
}

/* Conteneur du formulaire */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  transition: transform 0.3s ease;
}

/* ---------------------------------
    TYPOGRAPHIE & HEADER (FORMULAIRE)
--------------------------------- */
.header {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 5px;
  color: #003366;
}

.subtitle {
  font-size: 1rem;
  color: #6c757d;
}

/* ---------------------------------
    CHAMPS DE FORMULAIRE (EXISTANT)
--------------------------------- */
.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-size: 0.9em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 6px;
}

input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 12px 15px;
  border-radius: 8px;
  border: 1px solid #ced4da;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
  outline: none;
}

/* ---------------------------------
    SÉLECTION DES RÔLES (EXISTANT)
--------------------------------- */
.roles-selection {
  margin: 25px 0;
}

.roles-label {
  display: block;
  font-size: 0.95em;
  font-weight: 600;
  color: #003366;
  margin-bottom: 12px;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 10px;
}

.role-option {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 5px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 500;
  color: #495057;
  transition: all 0.2s ease;
}

.role-option:hover {
  border-color: #adb5bd;
}

.role-option input[type="radio"] {
  display: none;
}

.role-option input[type="radio"]:checked {
  border-color: #007bff;
  background-color: #e6f7ff;
  box-shadow: 0 0 0 1px #007bff;
}

.role-option input[type="radio"]:checked + .role-icon,
.role-option input[type="radio"]:checked ~ span {
  color: #007bff;
}

.role-option input[type="radio"]:checked ~ span:not(.role-icon) {
  font-weight: 700;
  color: #007bff;
}

.role-icon {
  font-size: 1.2em;
  margin-right: 5px;
}

/* ---------------------------------
    BOUTON PRINCIPAL (EXISTANT)
--------------------------------- */
.btn-primary {
  width: 100%;
  padding: 14px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, opacity 0.3s;
  font-weight: 700;
  margin-top: 25px;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-primary:disabled {
  background-color: #adb5bd;
  cursor: not-allowed;
  opacity: 0.7;
}

/* ---------------------------------
    MESSAGES & FOOTER (EXISTANT)
--------------------------------- */
.error-message {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 10px 15px;
  border-radius: 6px;
  margin-top: 20px;
  text-align: center;
  font-size: 0.9em;
}

.options-footer {
  text-align: center;
  margin-top: 25px;
  font-size: 0.9em;
  color: #6c757d;
}

.link-secondary {
  color: #007bff;
  text-decoration: none;
  transition: color 0.2s;
}

.link-secondary:hover {
  color: #0056b3;
  text-decoration: underline;
}

.separator {
  margin: 0 10px;
  color: #ced4da;
}

/* ---------------------------------
    RESPONSIVE (AJUSTEMENTS)
--------------------------------- */
@media (max-width: 992px) {
  .login-page-wrapper {
    flex-direction: column;
    align-items: center;
    padding: 30px 15px;
    gap: 30px;
  }
  .illustration-section {
    max-width: 100%;
    order: -1;
    padding: 30px;
  }
  .login-illustration {
    max-width: 60%;
  }
  .login-card {
    max-width: 100%;
  }
}

@media (max-width: 576px) {
  .roles-grid {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  }
  .login-illustration {
    max-width: 80%;
  }
  .illustration-text {
    font-size: 1rem;
  }
}
</style>