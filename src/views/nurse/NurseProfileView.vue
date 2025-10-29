<template>
  <NurseLayout>
    <div class="profile-container">
      <h2 class="section-title">Mon profil professionnel</h2>

      <div v-if="userStore.error || nurseStore.error" class="feedback-message error">
        ⚠️ {{ userStore.error || nurseStore.error }}
      </div>
      <div v-if="userStore.success || nurseStore.success" class="feedback-message success">
        ✅ {{ userStore.success || nurseStore.success }}
      </div>

      <div v-if="userStore.loading || nurseStore.loading" class="loading-state">
        Chargement des données du profil...
      </div>

      <form v-else @submit.prevent="saveProfile" class="profile-form">
        <div class="form-grid">

          <div class="form-group photo-group">
            <label>Photo de profil</label>
            <div class="profile-photo-area" @click="$refs.photoInput.click()">
              <img :src="profilePhotoUrl" alt="Photo de profil" class="current-photo" />
              <span>Cliquer pour changer</span>
            </div>
            <input type="file" ref="photoInput" @change="handlePhotoChange" style="display: none;" accept="image/*" />
            <button v-if="photoFile" @click.prevent="uploadPhoto" class="upload-btn small-btn" :disabled="userStore.loading">
              {{ userStore.loading ? 'Téléchargement...' : 'Télécharger Photo' }}
            </button>
          </div>

          <div class="form-group">
            <label for="first_name">Prénom</label>
            <input type="text" id="first_name" v-model="form.first_name" required />
          </div>

          <div class="form-group">
            <label for="last_name">Nom de famille</label>
            <input type="text" id="last_name" v-model="form.last_name" required />
          </div>

          <div class="form-group">
            <label for="email">Email (Identifiant)</label>
            <input type="email" id="email" :value="userStore.currentUser?.email" disabled class="disabled-input" />
          </div>

          <div class="form-group">
            <label for="birth_date">Date de naissance</label>
            <input type="date" id="birth_date" v-model="form.birth_date" />
          </div>

          <div class="form-group">
            <label for="phone">Téléphone</label>
            <input type="text" id="phone" v-model="form.phone" />
          </div>

          <div class="form-group">
            <label for="country">Pays</label>
            <input type="text" id="country" v-model="form.country" />
          </div>

          <div class="form-group">
            <label for="city">Ville</label>
            <input type="text" id="city" v-model="form.city" />
          </div>

          <div class="form-group full-width">
            <label for="address">Adresse de résidence</label>
            <input type="text" id="address" v-model="form.address" />
          </div>

          <div class="form-group">
            <label for="speciality">Spécialité (Nurse)</label>
            <input type="text" id="speciality" v-model="form.speciality" />
          </div>

          <div class="form-group">
            <label for="status">Statut (Disponible/En service...)</label>
            <select id="status" v-model="form.status">
              <option value="Disponible">Disponible</option>
              <option value="En service">En service</option>
              <option value="En congé">En congé</option>
            </select>
          </div>

          <div class="form-group">
            <label for="language_id">Langue d'affichage</label>
            <select id="language_id" v-model="form.language_id">
              <option :value="1">Français</option>
              <option :value="2">Anglais</option>
            </select>
          </div>

        </div>

        <div class="form-actions">
          <button type="submit" :disabled="userStore.loading || nurseStore.loading">
            💾 Enregistrer les informations de base
          </button>
        </div>
      </form>

      <section class="password-section">
        <h3>Modification du mot de passe</h3>
        <form @submit.prevent="updatePassword" class="password-form">
          <div class="form-row">
            <div class="form-group">
              <label for="current_password">Mot de passe actuel</label>
              <input type="password" id="current_password" v-model="passwordForm.current_password" required />
            </div>
            <div class="form-group">
              <label for="password">Nouveau mot de passe</label>
              <input type="password" id="password" v-model="passwordForm.password" required />
            </div>
            <div class="form-group">
              <label for="password_confirmation">Confirmer le nouveau mot de passe</label>
              <input type="password" id="password_confirmation" v-model="passwordForm.password_confirmation" required />
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" :disabled="userStore.loading">
              🔒 Mettre à jour le mot de passe
            </button>
          </div>
        </form>
      </section>

    </div>
  </NurseLayout>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import NurseLayout from '@/layouts/NurseLayout.vue';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStores'; // Corrigé pour s'assurer que le chemin est correct si ce n'était pas 'authStores'
import { useNurseStore } from '@/stores/nurseStore';

const userStore = useUserStore();
const authStore = useAuthStore();
const nurseStore = useNurseStore();
const route = useRoute();
const photoInput = ref(null);
const photoFile = ref(null);

const form = ref({
  first_name: '',
  last_name: '',
  email: '', // Sera peuplé par le watch et utilisé pour l'envoi
  birth_date: null,
  phone: '',
  country: '',
  city: '',
  address: '',
  language_id: 1,
  status: 'Disponible',
  speciality: '',
});

const passwordForm = ref({
  current_password: '',
  password: '',
  password_confirmation: '',
});

const profilePhotoUrl = computed(() => {
    if (photoFile.value) {
        return URL.createObjectURL(photoFile.value);
    }
    if (userStore.currentUser?.profile_photo_url) {
        return userStore.currentUser.profile_photo_url;
    }
    // CORRECTION: Utilisez une image locale ou vide pour éviter ERR_NAME_NOT_RESOLVED
    return '/images/default_profile.png'; // 👈 Assurez-vous que ce fichier existe dans public/images/
    // Ou si vous ne voulez pas d'image par défaut:
    // return '';
});


async function loadProfileData() {
    userStore.resetFeedback(); // Appel maintenu, supposé exister dans userStore
    nurseStore.clearFeedback(); // Appel maintenu, supposé exister dans nurseStore

    const userId = authStore.user?.id;

    if (!userId) {
        userStore.setError("Utilisateur non connecté. Impossible de charger le profil."); // Appel maintenu
        return;
    }

    await userStore.fetchCurrentUser();

    try {
      await userStore.fetchNurseByUserId(userId);
    } catch (e) {
        console.warn("Profil infirmier (table nurses) non trouvé ou erreur de chargement. Ceci est normal lors de la première connexion ou en cas d'erreur API.");
    }
}

watch([() => userStore.currentUser, () => userStore.currentNurseProfile], () => {
    const user = userStore.currentUser;
    const nurse = userStore.currentNurseProfile;

    if (user) {
        form.value.first_name = user.first_name || '';
        form.value.last_name = user.last_name || '';
        form.value.email = user.email || ''; // Peuplement de la valeur interne de l'email
        form.value.birth_date = user.birth_date ? user.birth_date.substring(0, 10) : null;
        form.value.phone = user.phone || '';
        form.value.country = user.country || '';
        form.value.city = user.city || '';
        form.value.address = user.address || '';
        form.value.language_id = user.language_id || 1;
        form.value.status = user.status || 'Disponible';
    }

    if (nurse) {
        form.value.speciality = nurse.speciality || '';
    }
}, { immediate: true });


async function saveProfile() {
    userStore.resetFeedback();
    nurseStore.clearFeedback();

    const nurseId = userStore.currentNurseProfile?.id;
    const userId = authStore.user?.id;

    if (!userId || !userStore.currentUser) {
        userStore.setError("Utilisateur non authentifié ou profil non chargé.");
        return;
    }

    // --- 1. Mise à jour de la table USERS (Informations générales) ---
    const userUpdateData = {
        first_name: form.value.first_name,
        last_name: form.value.last_name,
        // CORRECTION CLÉ: L'email DOIT ÊTRE ENVOYÉ pour l'API /api/user/profile-information
        email: userStore.currentUser.email,
        birth_date: form.value.birth_date,
        phone: form.value.phone,
        country: form.value.country,
        city: form.value.city,
        address: form.value.address,
        language_id: form.value.language_id,
        status: form.value.status,
    };

    try {
        await userStore.updateCurrentUserProfile(userUpdateData);
        // Le userStore gère son message de succès/erreur.

        // --- 2. Mise à jour de la table NURSES (Spécialité) ---
        if (nurseId) {
            // CORRECTION CLÉ: L'API /api/nurse/{id} requiert TOUS ces champs
            // Nous construisons un payload complet pour satisfaire cette validation backend.
            const nurseUpdateData = {
                speciality: form.value.speciality,
                // Inclusion des champs 'users' requis par la validation de 'nurses'
                first_name: form.value.first_name,
                last_name: form.value.last_name,
                email: userStore.currentUser.email, // L'email de l'utilisateur actuel
                phone: form.value.phone,
                country: form.value.country,
                city: form.value.city,
                address: form.value.address,
                birth_date: form.value.birth_date,
                // Si d'autres champs de 'users' sont requis par la validation de 'nurses', ajoutez-les ici.
            };

            await nurseStore.updateNurse(nurseId, nurseUpdateData);
            // Le nurseStore gère son message de succès/erreur.

        } else {
             console.warn("Profil Infirmier spécifique (table nurses) non trouvé pour la mise à jour de la spécialité.");
        }

        // Appel maintenu, en supposant que userStore.setSuccess existe et fonctionne comme attendu.
        // Ce message sera affiché si toutes les étapes précédentes réussissent.
        userStore.setSuccess("Profil complet mis à jour (Informations générales et Spécialité Infirmier) !");


    } catch (e) {
        // Les erreurs sont remontées et gérées par les stores (userStore.error ou nurseStore.error)
        console.error("Erreur de sauvegarde dans saveProfile:", e);
        // Si les stores n'ont pas géré le feedback, vous pourriez vouloir un feedback générique ici.
        // Exemple: userStore.setError("Une erreur est survenue lors de la sauvegarde du profil.");
    }
}


function handlePhotoChange(event) {
  photoFile.value = event.target.files[0];
}

async function uploadPhoto() {
  if (!photoFile.value) return;

  userStore.resetFeedback();
  try {
    await userStore.updateCurrentUserPhoto(photoFile.value);
    photoFile.value = null;
  } catch (e) {
    console.error("Erreur lors de l'upload de la photo:", e);
    // Le feedback d'erreur est géré par le store.
  }
}

async function updatePassword() {
    userStore.resetFeedback();

    if (passwordForm.value.password !== passwordForm.value.password_confirmation) {
        userStore.setError("Le nouveau mot de passe et sa confirmation ne correspondent pas.");
        return;
    }

    try {
        await userStore.updateCurrentUserPassword(passwordForm.value);
        userStore.setSuccess("Mot de passe mis à jour avec succès.");
        passwordForm.value = { current_password: '', password: '', password_confirmation: '' };
    } catch (e) {
        console.error("Erreur lors de la mise à jour du mot de passe:", e);
        // Le feedback d'erreur est géré par le store.
    }
}

onMounted(() => {
    loadProfileData();
});
</script>

<style scoped>
/* Styles de base */
.profile-container {
  padding: 30px;
  background-color: #f2f7fc;
}

.section-title {
  font-size: 22px;
  color: #002580;
  margin-bottom: 20px;
}

.profile-form, .password-section {
  background-color: white;
  padding: 25px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 20px;
}
.password-section h3 { margin-top: 0; color: #003366; border-bottom: 1px solid #eee; padding-bottom: 10px; }

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.full-width { grid-column: 1 / -1; }

label {
  font-weight: 600;
  margin-bottom: 6px;
  color: #003366;
}

input,
select {
  padding: 8px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.form-actions {
  margin-top: 25px;
  text-align: right;
}

button {
  background-color: #002580;
  color: white;
  padding: 10px 20px;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover:not(:disabled) { background-color: #0044aa; }
button:disabled { background-color: #ccc; cursor: not-allowed; }

/* Styles pour la photo */
.photo-group { grid-column: 1 / -1; display: flex; align-items: center; gap: 20px; }
.profile-photo-area {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
    position: relative;
    border: 3px solid #002580;
    flex-shrink: 0;
}
.profile-photo-area img { width: 100%; height: 100%; object-fit: cover; transition: opacity 0.3s; }
.profile-photo-area:hover img { opacity: 0.5; }
.profile-photo-area span {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-weight: bold;
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s;
}
.profile-photo-area:hover span { opacity: 1; }
.upload-btn { margin-top: 10px; align-self: flex-start; }

/* Styles Mot de Passe */
.password-form .form-row { display: flex; gap: 20px; }
.password-form .form-group { flex: 1; }

/* Feedback messages */
.feedback-message { padding: 10px; border-radius: 4px; margin-bottom: 15px; font-weight: 600; }
.feedback-message.error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
.feedback-message.success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
.loading-state { text-align: center; padding: 50px; font-size: 1.2em; color: #002580; }
</style>
