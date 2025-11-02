<template>
  <AppLayout>
    <div class="login-page-wrapper"> <div class="illustration-section">
        <img src="/santeko.png" alt="Illustration Santeko" class="login-illustration" />
        <p class="illustration-text">
          Votre santé, notre priorité. <br/>
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
const role = ref('patient')
const router = useRouter()
const isFetchingProfileId = ref(false)


async function seConnecter() {
  authStore.authError = null;
  console.log("--- Début de la connexion ---");

  try {
    const response = await authStore.login({
      email: email.value,
      password: password.value,
      role: role.value
    })

    const userId = response.user.id;
    const roleName = response.role_name;
    const roleId = response.role_id;
    console.log(`Authentification réussie. Utilisateur ID: ${userId}, Rôle: ${roleName}`);

    let finalProfileId = userId;

    isFetchingProfileId.value = true;

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
            // TODO: Assurez-vous d'avoir cette méthode dans userStore
            profileIdFound = await userStore.fetchLabTechnicianByUserId(userId);
        } else if (roleName === 'accountant') {
            // TODO: Assurez-vous d'avoir cette méthode dans userStore
            profileIdFound = await userStore.fetchAccountantByUserId(userId);
        }
        // Pour Admin, l'ID utilisateur est souvent suffisant ou géré différemment.
        // Si vous avez un AdminId spécifique, ajoutez la logique ici :
        // else if (roleName === 'admin') {
        //     profileIdFound = await userStore.fetchAdminByUserId(userId);
        // }


        if (profileIdFound) {
            finalProfileId = profileIdFound;
        }

    } catch (fetchError) {
        console.error(`❌ Échec de la récupération du profil spécifique (${roleName}). Utilisation de l'ID Utilisateur comme fallback.`, fetchError);
    } finally {
        isFetchingProfileId.value = false;
    }

    if (finalProfileId) {
        authStore.setProfileId(finalProfileId);
        console.log(`✅ ID de profil (${roleName}) stocké: ${finalProfileId}`);
    }


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
   GLOBAL LAYOUT (NOUVEAU)
--------------------------------- */
.login-page-wrapper {
  display: flex; /* Utilisation de flexbox pour aligner côte à côte */
  justify-content: center;
  align-items: stretch; /* Les éléments s'étirent sur la hauteur */
  min-height: 100vh;
  background-color: #f0f4f8;
  padding: 50px 20px; /* Ajout de padding global */
  gap: 40px; /* Espace entre l'image et le formulaire */
}

/* Section illustration */
.illustration-section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    max-width: 500px; /* Taille max pour l'illustration */
    text-align: center;
    padding: 20px;
    background: linear-gradient(135deg, #e6f7ff, #cceeff); /* Fond dégradé doux */
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.login-illustration {
    max-width: 80%; /* Ajuste la taille de l'image dans sa section */
    height: auto;
    margin-bottom: 30px;
}

.illustration-text {
    font-size: 1.2rem;
    color: #003366;
    font-weight: 600;
    line-height: 1.5;
}

/* Conteneur du formulaire (Styles existants, mais dans le nouveau flux) */
.login-container {
  display: flex; /* Maintient le centrage du formulaire dans sa colonne */
  justify-content: center;
  align-items: center;
  flex-grow: 1; /* Permet au conteneur du formulaire de prendre l'espace restant */
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px; /* Garde la largeur du formulaire */
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

/* Le .santeko-logo n'est plus dans le .header du formulaire */
/* Supprimer les styles .santeko-logo si vous ne l'utilisez plus */
.santeko-logo {
    display: none; /* Cache l'ancien logo si besoin */
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
.role-option input[type="radio"]:checked ~ span { /* Cible à la fois l'icône et le texte */
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
    flex-direction: column; /* Les éléments s'empilent sur les petits écrans */
    align-items: center;
    padding: 30px 15px;
    gap: 30px;
  }
  .illustration-section {
    max-width: 100%;
    order: -1; /* Place l'illustration au-dessus du formulaire sur mobile */
    padding: 30px;
  }
  .login-illustration {
      max-width: 60%; /* Ajustement pour mobile */
  }
  .login-card {
    max-width: 100%;
  }
}

@media (max-width: 576px) {
    .roles-grid {
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); /* Plus compact sur très petits écrans */
    }
    .login-illustration {
        max-width: 80%;
    }
    .illustration-text {
        font-size: 1rem;
    }
}
</style>
