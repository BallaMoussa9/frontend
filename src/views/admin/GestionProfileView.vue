<template>
  <AdminLayout>
    <div class="user-profile-page">
      <h2 class="page-title">Mon Profil</h2>

      <div v-if="userStore.loading" class="loading-message">Opération en cours...</div>
      <div v-if="userStore.error" class="error-message">{{ userStore.error }}</div>
      <div v-if="userStore.success" class="success-message">{{ userStore.success }}</div>

      <div class="profile-section" v-if="userStore.getCurrentUser">
        <h3>Informations personnelles</h3>
        <form @submit.prevent="handleUpdateProfile" class="profile-form">
          <div class="form-group">
            <label for="first_name">Prénom</label>
            <input v-model="profileForm.first_name" id="first_name" type="text" class="input" required />
          </div>
          <div class="form-group">
            <label for="last_name">Nom</label>
            <input v-model="profileForm.last_name" id="last_name" type="text" class="input" required />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input v-model="profileForm.email" id="email" type="email" class="input" required />
          </div>
          <div class="form-group">
            <label for="phone">Téléphone</label>
            <input v-model="profileForm.phone" id="phone" type="tel" class="input" />
          </div>
          <div class="form-group">
            <label for="country">Pays</label>
            <input v-model="profileForm.country" id="country" type="text" class="input" />
          </div>
          <div class="form-group">
            <label for="city">Ville</label>
            <input v-model="profileForm.city" id="city" type="text" class="input" />
          </div>
          <div class="form-group">
            <label for="address">Adresse</label>
            <input v-model="profileForm.address" id="address" type="text" class="input" />
          </div>
          <button type="submit" class="save-btn" :disabled="userStore.loading">
            Enregistrer les informations
          </button>
        </form>
      </div>

      <div class="profile-section">
        <h3>Mettre à jour le mot de passe</h3>
        <form @submit.prevent="handleUpdatePassword" class="profile-form">
          <div class="form-group">
            <label for="current_password">Mot de passe actuel</label>
            <input v-model="passwordForm.current_password" id="current_password" type="password" class="input" required />
          </div>
          <div class="form-group">
            <label for="password">Nouveau mot de passe</label>
            <input v-model="passwordForm.password" id="password" type="password" class="input" required />
          </div>
          <div class="form-group">
            <label for="password_confirmation">Confirmer le nouveau mot de passe</label>
            <input v-model="passwordForm.password_confirmation" id="password_confirmation" type="password" class="input" required />
          </div>
          <button type="submit" class="save-btn" :disabled="userStore.loading">
            Changer le mot de passe
          </button>
        </form>
      </div>

      <div class="profile-section">
        <h3>Photo de profil</h3>
        <div class="profile-photo-area">
          <img :src="userStore.getCurrentUser?.profile_photo_url || defaultAvatar" alt="Photo de profil" class="current-profile-photo" />
          <input type="file" @change="handlePhotoUpload" ref="photoInput" accept="image/*" class="file-input" />
          <button @click="triggerFileInput" class="action-btn upload-btn">
            {{ photoFile ? photoFile.name : 'Choisir une photo' }}
          </button>
          <button v-if="photoFile" @click="handleUpdateProfilePhoto" class="save-btn" :disabled="userStore.loading">
            Télécharger la photo
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue';
import { ref, onMounted, watch } from 'vue';
import { useUserStore } from '@/stores/userStore'; // Utilisation de userStore

const userStore = useUserStore();

// Formulaire pour les informations de profil
const profileForm = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  country: '',
  city: '',
  address: '',
});

// Formulaire pour le mot de passe
const passwordForm = ref({
  current_password: '',
  password: '',
  password_confirmation: '',
});

// Pour la photo de profil
const photoInput = ref(null);
const photoFile = ref(null);
const defaultAvatar = 'https://ui-avatars.com/api/?name=User&color=7F9CF5&background=EBF4FF';

// Hydrater le formulaire de profil avec les données de l'utilisateur au chargement ou si l'utilisateur change
watch(() => userStore.getCurrentUser, (newUser) => {
  if (newUser) {
    profileForm.value.first_name = newUser.first_name || '';
    profileForm.value.last_name = newUser.last_name || '';
    profileForm.value.email = newUser.email || '';
    profileForm.value.phone = newUser.phone || '';
    profileForm.value.country = newUser.country || '';
    profileForm.value.city = newUser.city || '';
    profileForm.value.address = newUser.address || '';
  }
}, { immediate: true });

onMounted(async () => {
  // S'assurer que les informations de l'utilisateur sont chargées dans le store
  if (!userStore.getCurrentUser) {
    await userStore.fetchCurrentUser(); // Utilisation de la nouvelle action fetchCurrentUser
  }
});

const handleUpdateProfile = async () => {
  userStore.resetFeedback();
  try {
    await userStore.updateCurrentUserProfile(profileForm.value); // Utilisation de la nouvelle action
  } catch (error) {
    console.error('Erreur de mise à jour du profil:', error);
  }
};

const handleUpdatePassword = async () => {
  userStore.resetFeedback();
  try {
    await userStore.updateCurrentUserPassword(passwordForm.value); // Utilisation de la nouvelle action
    passwordForm.value = { current_password: '', password: '', password_confirmation: '' };
  } catch (error) {
    console.error('Erreur de mise à jour du mot de passe:', error);
  }
};

const handlePhotoUpload = (event) => {
  photoFile.value = event.target.files[0];
};

const triggerFileInput = () => {
  photoInput.value.click();
};

const handleUpdateProfilePhoto = async () => {
  if (!photoFile.value) {
    userStore.error = 'Veuillez sélectionner un fichier photo.';
    return;
  }
  userStore.resetFeedback();
  try {
    await userStore.updateCurrentUserPhoto(photoFile.value); // Utilisation de la nouvelle action
    photoFile.value = null;
    if (photoInput.value) photoInput.value.value = '';
  } catch (error) {
    console.error('Erreur de mise à jour de la photo:', error);
  }
};
</script>

<style scoped>
.user-profile-page {
  max-width: 900px;
  margin: 40px auto;
  padding: 30px 40px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  text-align: center;
  margin-bottom: 5px; /* Ajusté car les sections gèrent leur propre marge */
  position: relative;
  padding-bottom: 10px;
}

.page-title::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background-color: #0040d0;
  border-radius: 2px;
}

.profile-section {
  background-color: #f7fafc;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.profile-section h3 {
  font-size: 20px;
  color: #2d3748;
  margin-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 10px;
}

.profile-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: 600;
  color: #4a5568;
  font-size: 14px;
}

.input {
  padding: 10px 14px;
  border: 1px solid #cbd5e0;
  border-radius: 7px;
  font-size: 14px;
  color: #2d3748;
  background-color: #ffffff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input:focus {
  border-color: #0040d0;
  box-shadow: 0 0 0 3px rgba(0, 64, 208, 0.15);
  outline: none;
}

.save-btn {
  grid-column: 1 / -1; /* Le bouton prend toute la largeur */
  padding: 12px 20px;
  background-color: #0040d0;
  color: white;
  font-weight: 600;
  font-size: 15px;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  margin-top: 15px;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.save-btn:hover {
  background-color: #0030a0;
  transform: translateY(-1px);
}

.save-btn:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
  transform: none;
}

/* Photo de profil */
.profile-photo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-top: 15px;
}

.current-profile-photo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #e2e8f0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.file-input {
  display: none; /* Cache l'input de fichier par défaut */
}

.action-btn.upload-btn {
  padding: 10px 20px;
  background-color: #4a5568;
  color: white;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 14px;
  font-weight: 600;
}

.action-btn.upload-btn:hover {
  background-color: #2d3748;
}

/* Messages de feedback */
.loading-message,
.error-message,
.success-message {
  padding: 12px 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  font-weight: 600;
  text-align: center;
}

.loading-message {
  background-color: #e0f2fe;
  color: #0040d0;
}

.error-message {
  background-color: #fee2e2;
  color: #e53e3e;
  border: 1px solid #fc8181;
}

.success-message {
  background-color: #ebfef5;
  color: #38a169;
  border: 1px solid #68d391;
}

@media (max-width: 768px) {
  .user-profile-page {
    margin: 20px auto;
    padding: 20px;
  }
  .profile-form {
    grid-template-columns: 1fr;
  }
  .profile-section h3 {
    font-size: 18px;
  }
}
</style>
