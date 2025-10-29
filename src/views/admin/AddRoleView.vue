<template>
  <AdminLayout>
    <div class="add-role-page">
      <h2>Modifier le rôle d’un utilisateur</h2>

      <div v-if="userStore.loading" class="loading-message">Chargement...</div>
      <div v-if="userStore.error" class="error-message">{{ userStore.error }}</div>
      <div v-if="userStore.success" class="success-message">{{ userStore.success }}</div>

      <input
        v-model="search"
        type="text"
        class="search-input"
        placeholder="Rechercher un utilisateur par nom ou email..."
        @input="debouncedSearch"
      />

      <div class="user-list">
        <div
          class="user-card"
          v-for="user in filteredUsers"
          :key="user.id"
        >
          <img :src="user.profile_photo_url || defaultAvatar" class="avatar" />
          <div class="info">
            <p><strong>{{ user.first_name }} {{ user.last_name }}</strong></p>
            <p>{{ user.email }}</p>
          </div>

          <select v-model="user.role" class="role-select" :disabled="userStore.loading">
            <option disabled value="">-- Sélectionnez un rôle --</option>
            <option v-for="r in userStore.getAvailableRoles" :key="r" :value="r">
              {{ formatRole(r) }}
            </option>
          </select>

          <button
            @click="updateRole(user)"
            class="btn-save"
            :disabled="userStore.loading || !user.role || user.role === user.originalRole"
          >
            💾 Enregistrer
          </button>
        </div>
        <div v-if="!userStore.loading && filteredUsers.length === 0" class="no-results">
            Aucun utilisateur trouvé.
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { debounce } from 'lodash'; // npm install lodash

const userStore = useUserStore();

const search = ref('');
// Les rôles seront récupérés du store
// const roles = [ ... ]; // Sera remplacé par userStore.getAvailableRoles

const defaultAvatar = 'https://ui-avatars.com/api/?name=User&color=7F9CF5&background=EBF4FF';

const filteredUsers = computed(() => {
  // Utilisez userStore.getAllUsers pour la liste complète des utilisateurs
  return userStore.getAllUsers.filter((u) =>
    (u.first_name && u.first_name.toLowerCase().includes(search.value.toLowerCase())) ||
    (u.last_name && u.last_name.toLowerCase().includes(search.value.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(search.value.toLowerCase()))
  );
});

// Une recherche délayée est utile si vous voulez que le champ de recherche
// filtre la liste localement, sans appeler une API à chaque frappe.
// Si vous voulez rechercher via l'API, vous devriez appeler `searchUsers` du store.
const debouncedSearch = debounce(() => {
  // Si vous vouliez une recherche côté API au lieu du filtre local:
  // userStore.searchUsers({ search: search.value });
  // Mais pour cette page, un filtre local est plus simple car on a déjà tous les users
}, 300);


const updateRole = async (user) => {
  userStore.resetFeedback();
  try {
    await userStore.updateUserRole(user.id, user.role);
    // Le message de succès est géré par le store
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rôle:", error);
    // L'erreur est gérée et affichée par le store
  }
};

const formatRole = (role) => {
  return {
    admin: 'Administrateur',
    super_admin: 'Super Admin',
    doctor: 'Médecin',
    nurse: 'nurse',
    pharmacist: 'Pharmacien',
    secretary: 'Secrétaire',
    accountant: 'Comptable',
    patient: 'Patient',
    lab_technician: 'Technicien de laboratoire',
    emergency_doctor: 'Médecin urgentiste',
  }[role] || role; // Fallback au nom du rôle brut si non trouvé
}

onMounted(async () => {
  // Charger tous les utilisateurs et les rôles disponibles au montage du composant
  await userStore.fetchAllUsers();
  await userStore.fetchAvailableRoles();
});
</script>

<style scoped>
/* Les styles restent les mêmes, mais j'ai ajouté quelques classes pour le feedback */
.add-role-page {
  max-width: 900px;
  margin: auto;
  padding: 32px;
  font-family: 'Inter', sans-serif;
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

h2 {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  text-align: center;
  margin-bottom: 35px;
  position: relative;
  padding-bottom: 10px;
}

h2::after {
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

.search-input {
  width: 100%;
  padding: 12px 15px;
  font-size: 16px;
  margin-bottom: 25px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-input:focus {
  border-color: #0040d0;
  box-shadow: 0 0 0 3px rgba(0, 64, 208, 0.15);
  outline: none;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.user-card {
  display: flex;
  align-items: center;
  background: #ffffff;
  padding: 18px 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  gap: 15px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%; /* Correction pour un cercle parfait */
  object-fit: cover;
  border: 2px solid #e2e8f0;
}

.info {
  flex: 1;
  color: #2d3748;
}

.info p {
  margin: 0;
  line-height: 1.4;
}

.info p strong {
  font-size: 16px;
  color: #1a202c;
}

.info p:last-child {
  font-size: 14px;
  color: #718096;
}


.role-select {
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 8px;
  border: 1px solid #cbd5e0;
  margin-right: 10px;
  background-color: #f7fafc;
  cursor: pointer;
  appearance: none; /* Cache la flèche par défaut pour customiser */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M7 7l3-3 3 3m0 6l-3 3-3-3' stroke='%234A5568' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.7em top 50%, 0 0;
  background-size: 0.65em auto, 100%;
}

.role-select:focus {
  border-color: #0040d0;
  box-shadow: 0 0 0 2px rgba(0, 64, 208, 0.1);
  outline: none;
}

.btn-save {
  background: #0040d0;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 9px 15px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.btn-save:hover:not(:disabled) {
  background: #0030a0;
  transform: translateY(-1px);
}

.btn-save:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  transform: none;
}

.no-results {
  text-align: center;
  color: #718096;
  padding: 30px;
  font-size: 18px;
  background-color: #ffffff;
  border-radius: 8px;
  margin-top: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

/* Messages de feedback (mêmes que pour Settings.vue) */
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
  .add-role-page {
    padding: 20px;
  }
  .user-card {
    flex-wrap: wrap; /* Permet aux éléments de passer à la ligne */
    justify-content: center;
    text-align: center;
  }
  .info {
    flex-basis: 100%; /* L'info prend toute la largeur sur mobile */
    margin-bottom: 10px;
  }
  .role-select {
    flex-grow: 1; /* Le select prend plus de place */
    margin-right: 0;
    margin-bottom: 10px;
  }
  .btn-save {
    flex-grow: 1; /* Le bouton prend plus de place */
  }
}
</style>
