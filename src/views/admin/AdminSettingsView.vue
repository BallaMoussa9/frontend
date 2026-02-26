<template>
  <AdminLayout>
    <div class="parametres-page">
      <h2 class="page-title">⚙️ Paramètres de l'hôpital principal</h2>

      <div v-if="hospitalStore.loading && hospitalStore.hospitals.length === 0" class="status-message loading-message">
        Chargement des paramètres de l'hôpital...
      </div>
      <div v-if="hospitalStore.error" class="status-message error-message">
        {{ hospitalStore.error }}
      </div>
      <div v-if="hospitalStore.success" class="status-message success-message">
        {{ hospitalStore.success }}
      </div>

      <form 
        @submit.prevent="saveHospitalSettings" 
        class="settings-form" 
        v-if="!hospitalStore.loading || hospitalStore.hospitals.length > 0"
      >
        <div class="form-group">
          <label for="nom">Nom de l'hôpital</label>
          <input v-model="formHospital.nom" id="nom" type="text" class="input" placeholder="Ex: Hôpital Central" required />
        </div>

        <div class="form-group">
          <label for="adresse">Adresse</label>
          <input v-model="formHospital.adresse" id="adresse" type="text" class="input" placeholder="Rue, Quartier..." />
        </div>

        <div class="form-group">
          <label for="ville">Ville</label>
          <input v-model="formHospital.ville" id="ville" type="text" class="input" placeholder="Ex: Bamako" />
        </div>

        <div class="form-group">
          <label for="phone">Numéro de téléphone</label>
          <input v-model="formHospital.phone" id="phone" type="tel" class="input" placeholder="+223..." />
        </div>

        <div class="form-group">
          <label for="email">Email de contact</label>
          <input v-model="formHospital.email" id="email" type="email" class="input" placeholder="contact@hopital.com" />
        </div>

        <div class="form-group">
          <label for="type">Type d'établissement</label>
          <select v-model="formHospital.type" id="type" class="input">
            <option value="public">Public</option>
            <option value="private">Privé</option>
          </select>
        </div>

        <button type="submit" class="save-btn" :disabled="hospitalStore.loading">
          <span v-if="hospitalStore.loading">Enregistrement en cours...</span>
          <span v-else>💾 Enregistrer les modifications</span>
        </button>
      </form>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { ref, onMounted } from 'vue'
import { useHospitalStore } from '@/stores/hospitalStore'

const hospitalStore = useHospitalStore()

const formHospital = ref({
  nom: '',
  adresse: '',
  ville: '',
  phone: '',
  email: '',
  type: 'public',
})

// Chargement des données au montage
onMounted(async () => {
  hospitalStore.resetFeedback()
  await hospitalStore.fetchAllHospitals()

  // On pré-remplit le formulaire avec le premier hôpital trouvé (l'hôpital principal)
  if (hospitalStore.hospitals.length > 0) {
    const mainHospital = hospitalStore.hospitals[0]
    // Utilisation du spread pour éviter les références directes
    formHospital.value = { ...mainHospital }
    hospitalStore.currentHospital = mainHospital
  }
})

const saveHospitalSettings = async () => {
  hospitalStore.resetFeedback()
  
  try {
    if (hospitalStore.currentHospital?.id) {
      // Mise à jour de l'existant
      await hospitalStore.updateHospital(hospitalStore.currentHospital.id, formHospital.value)
    } else {
      // Création si aucun hôpital n'existe
      await hospitalStore.createHospital(formHospital.value)
      // On rafraîchit pour récupérer l'ID nouvellement créé
      await hospitalStore.fetchAllHospitals()
      if (hospitalStore.hospitals.length > 0) {
        hospitalStore.currentHospital = hospitalStore.hospitals[0]
      }
    }
    
    // Auto-suppression du message de succès après 3 secondes
    setTimeout(() => hospitalStore.resetFeedback(), 3000)
    
  } catch (error) {
    console.error('Erreur sauvegarde:', error)
  }
}
</script>

<style scoped>
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
  font-size: 14px;
}

.input {
  padding: 12px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 15px;
  color: #2d3748;
  background-color: #f7fafc;
  transition: all 0.2s ease;
}

.input:focus {
  border-color: #0040d0;
  box-shadow: 0 0 0 3px rgba(0, 64, 208, 0.15);
  outline: none;
  background-color: #fff;
}

.save-btn {
  grid-column: 1 / -1;
  padding: 16px;
  background-color: #0040d0;
  color: white;
  font-weight: 700;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.3s ease;
}

.save-btn:hover:not(:disabled) {
  background-color: #0030a0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 64, 208, 0.2);
}

.save-btn:disabled {
  background-color: #cbd5e0;
  cursor: not-allowed;
}

.status-message {
  padding: 14px;
  margin-bottom: 25px;
  border-radius: 8px;
  font-weight: 600;
  text-align: center;
  font-size: 14px;
}

.loading-message { background-color: #ebf8ff; color: #2b6cb0; }
.error-message { background-color: #fff5f5; color: #c53030; border: 1px solid #feb2b2; }
.success-message { background-color: #f0fff4; color: #2f855a; border: 1px solid #9ae6b4; }

@media (max-width: 768px) {
  .parametres-page {
    margin: 10px;
    padding: 20px;
  }
  .page-title { font-size: 22px; }
  .save-btn { margin-top: 10px; }
}
</style>