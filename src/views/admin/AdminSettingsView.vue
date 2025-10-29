<template>
  <AdminLayout>
    <div class="parametres-page">
      <h2 class="page-title">⚙️ Paramètres de l'hôpital principal</h2>

      <div v-if="hospitalStore.loading" class="loading-message">Chargement des paramètres de l'hôpital...</div>
      <div v-if="hospitalStore.error" class="error-message">{{ hospitalStore.error }}</div>
      <div v-if="hospitalStore.success" class="success-message">{{ hospitalStore.success }}</div>

      <form @submit.prevent="saveHospitalSettings" class="settings-form" v-if="!hospitalStore.loading">
        <div class="form-group">
          <label for="nom">Nom de l'hôpital</label>
          <input v-model="formHospital.nom" id="nom" type="text" class="input" />
        </div>

        <div class="form-group">
          <label for="adresse">Adresse</label>
          <input v-model="formHospital.adresse" id="adresse" type="text" class="input" />
        </div>

        <div class="form-group">
          <label for="ville">Ville</label>
          <input v-model="formHospital.ville" id="ville" type="text" class="input" />
        </div>

        <div class="form-group">
          <label for="phone">Numéro de téléphone</label>
          <input v-model="formHospital.phone" id="phone" type="tel" class="input" />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input v-model="formHospital.email" id="email" type="email" class="input" />
        </div>

        <div class="form-group">
          <label for="type">Type d'hôpital</label>
          <select v-model="formHospital.type" id="type" class="input">
            <option value="public">Public</option>
            <option value="private">Privé</option>
          </select>
        </div>

        <button type="submit" class="save-btn" :disabled="hospitalStore.loading">
          <span v-if="hospitalStore.loading">Enregistrement...</span>
          <span v-else>💾 Enregistrer les modifications</span>
        </button>
      </form>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { ref, onMounted } from 'vue'
import { useHospitalStore } from '@/stores/hospitalStore' // Assurez-vous que le chemin est correct

const hospitalStore = useHospitalStore()

const formHospital = ref({
  nom: '',
  adresse: '',
  ville: '',
  phone: '',
  email: '',
  type: 'public', // Valeur par défaut
})

// Chargement des données de l'hôpital au montage
onMounted(async () => {
  hospitalStore.resetFeedback(); // Réinitialiser les messages au chargement
  await hospitalStore.fetchAllHospitals(); // Récupère tous les hôpitaux

  // Puisqu'il s'agit des "Paramètres de l'hôpital principal", on prend le premier s'il existe
  if (hospitalStore.hospitals.length > 0) {
    const mainHospital = hospitalStore.hospitals[0];
    Object.assign(formHospital.value, mainHospital);
    hospitalStore.currentHospital = mainHospital; // Met à jour le currentHospital du store
  } else {
    // Si aucun hôpital n'existe, on initialise le formulaire avec des valeurs par défaut
    // (le `ref` initial gère déjà ça) et currentHospital reste null pour une création.
    hospitalStore.currentHospital = null;
  }
});

// Logique pour sauvegarder les paramètres de l'hôpital
const saveHospitalSettings = async () => {
  hospitalStore.resetFeedback(); // Réinitialiser les messages avant l'action
  try {
    if (hospitalStore.currentHospital && hospitalStore.currentHospital.id) {
      // Si un hôpital "principal" est déjà chargé, on le met à jour
      await hospitalStore.updateHospital(hospitalStore.currentHospital.id, formHospital.value);
    } else {
      // S'il n'y a pas d'hôpital principal (ou aucun hôpital du tout), on en crée un
      // Note: Votre application ne devrait normalement avoir qu'un seul hôpital principal
      // pour ce panneau de "paramètres". Une logique plus robuste pourrait vérifier
      // `hospitalStore.hospitals.length === 0` pour éviter de créer plusieurs hôpitaux.
      await hospitalStore.createHospital(formHospital.value);
    }
    // Le message de succès est déjà défini par `handleAction` dans le store.
  } catch (error) {
    // L'erreur est déjà gérée et stockée dans `hospitalStore.error` par `handleAction`.
    console.error('Erreur lors de la sauvegarde des paramètres de l\'hôpital depuis le composant:', error);
  }
}
</script>

<style scoped>
/* Votre style CSS existant */
.parametres-page {
  max-width: 900px;
  margin: 40px auto;
  padding: 30px 40px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  font-family: 'Inter', sans-serif;
}
.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  text-align: center;
  margin-bottom: 35px;
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
.settings-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
label {
  font-weight: 600;
  color: #4a5568;
  font-size: 15px;
  margin-bottom: 2px;
}
.input {
  padding: 12px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 15px;
  color: #2d3748;
  background-color: #f7fafc;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.input:focus {
  border-color: #0040d0;
  box-shadow: 0 0 0 3px rgba(0, 64, 208, 0.2);
  outline: none;
}
select.input {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%234A5568'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.7rem center;
  background-size: 1.2em;
  padding-right: 2.5rem;
}
.save-btn {
  grid-column: 1 / -1;
  padding: 15px 25px;
  background-color: #0040d0;
  color: white;
  font-weight: 700;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 25px;
  transition: background-color 0.3s ease, transform 0.2s ease;
}
.save-btn:hover {
  background-color: #0030a0;
  transform: translateY(-2px);
}
.save-btn:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
  transform: none;
}
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
  .parametres-page {
    margin: 20px auto;
    padding: 20px;
  }
  .settings-form {
    grid-template-columns: 1fr;
  }
  .page-title {
    font-size: 24px;
  }
}
</style>
