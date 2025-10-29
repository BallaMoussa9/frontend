<template>
  <AppLayout>
    <div class="login-container">
      <div class="login-card">
        <div class="header">
          <h2 class="title">Connexion à SanKo</h2>
          <p class="subtitle">Sélectionnez votre rôle pour accéder à votre espace.</p>
        </div>

        <form @submit.prevent="seConnecter" class="login-form">
          <div class="input-group">
            <label for="email">Adresse E-mail</label>
            <input id="email" v-model="email" type="email" placeholder="votre.nom@sanko.com" required />
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
const role = ref('patient')
const router = useRouter()
const isFetchingProfileId = ref(false)


async function seConnecter() {
  authStore.authError = null;
  console.log("--- Début de la connexion ---");

  try {
    // 1. Étape d'authentification standard
    const response = await authStore.login({
      email: email.value,
      password: password.value,
      role: role.value
    })

    const userId = response.user.id;
    const roleName = response.role_name;
    const roleId = response.role_id;
    console.log(`Authentification réussie. Utilisateur ID: ${userId}, Rôle: ${roleName}`);

    // Initialisation/Fallback
    let finalProfileId = userId;

    // 2. LOGIQUE CRITIQUE : RÉCUPÉRATION DE L'ID DE PROFIL SPÉCIFIQUE
    isFetchingProfileId.value = true;

    try {
        let profileIdFound = null;

        // Récupération de l'ID spécifique (PatientId, DoctorId, NurseId)
        if (roleName === 'patient') {
            profileIdFound = await userStore.fetchPatientByUserId(userId);
        } else if (roleName === 'doctor') {
            profileIdFound = await userStore.fetchDoctorByUserId(userId);
        } else if (roleName === 'nurse') {
            profileIdFound = await userStore.fetchNurseByUserId(userId);
        }

        // Si un ID de profil spécifique a été trouvé, on l'utilise
        if (profileIdFound) {
            finalProfileId = profileIdFound;
        }

    } catch (fetchError) {
        console.error("❌ Échec de la récupération du profil spécifique. Utilisation de l'ID Utilisateur comme fallback.", fetchError);
    } finally {
        isFetchingProfileId.value = false;
    }

    // 3. LOGIQUE DE CORRECTION : Stockage de l'ID de profil de manière sécurisée
    // 🔑 Utilisation de l'action setProfileId pour éviter le "TypeError: 'set' on proxy"
    if (finalProfileId) {
        authStore.setProfileId(finalProfileId);
        console.log(`✅ ID de profil (${roleName}) stocké: ${finalProfileId}`);
    }

    // Le store gère maintenant la redirection via son action 'login'
    // La redirection est gérée dans authStore.login -> authStore.redirectAfterLogin()

  } catch (error) {
    console.error('❌ Erreur de connexion (front-end) :', error.message);
    authStore.authError = error.message || "Une erreur est survenue lors de la connexion.";
    isFetchingProfileId.value = false;
  }
  console.log("--- Fin de la connexion ---");
}

</script>

<style scoped>
/* ---------------------------------
   BASE & LAYOUT
--------------------------------- */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  /* Assurez-vous que le conteneur prend toute la hauteur visible */
  min-height: 100vh;
  padding: 50px 20px;
  background-color: #f0f4f8; /* Fond légèrement bleuté */
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 16px; /* Bords plus arrondis */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); /* Ombre plus douce et profonde */
  width: 100%;
  max-width: 420px;
  transition: transform 0.3s ease;
}

/* ---------------------------------
   TYPOGRAPHIE & HEADER
--------------------------------- */
.header {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 5px;
  color: #003366; /* Bleu institutionnel foncé */
}

.subtitle {
  font-size: 1rem;
  color: #6c757d;
}

/* ---------------------------------
   CHAMPS DE FORMULAIRE
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
   SÉLECTION DES RÔLES (CLÉ ESTHÉTIQUE)
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

/* Cacher la radio box native */
.role-option input[type="radio"] {
  display: none;
}

/* Style de sélection (quand la radio est cochée) */
.role-option input[type="radio"]:checked + .role-icon,
.role-option input[type="radio"]:checked ~ span {
    color: #007bff; /* Assure que le texte/icône change de couleur */
}

.role-option input[type="radio"]:checked ~ span:not(.role-icon) {
  font-weight: 700;
}

.role-option input[type="radio"]:checked {
  border-color: #007bff;
  background-color: #e6f7ff; /* Légère couleur de fond */
  box-shadow: 0 0 0 1px #007bff;
}

.role-icon {
    font-size: 1.2em;
    margin-right: 5px;
}

/* ---------------------------------
   BOUTON PRINCIPAL
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
   MESSAGES & FOOTER
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
</style>
