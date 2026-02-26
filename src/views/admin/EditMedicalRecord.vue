<template>
  <AdminLayout>
    <div class="form-container">
      <header class="form-header">
        <button @click="router.back()" class="btn-back" title="Retour">
          <span class="arrow">←</span>
        </button>
        <div class="header-text">
          <h2>Ajouter un Dossier Médical</h2>
          <p class="subtitle">Initialisation d'un nouveau suivi patient</p>
        </div>
      </header>

      <form @submit.prevent="submit">
        <div class="field-group">
          <label for="patient">Patient concerné</label>
          <select id="patient" v-model="form.patient_id" required>
            <option disabled value="">-- Sélectionnez un patient --</option>
            <option v-for="patient in patients" :key="patient.id" :value="patient.id">
              {{ patient.name }}
            </option>
          </select>
        </div>

        <div class="row">
          <div class="field-group flex-1">
            <label>Groupe sanguin</label>
            <select v-model="form.blood_type">
              <option value="">Inconnu</option>
              <option v-for="type in bloodTypes" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>
          <div class="field-group flex-1">
            <label>Statut du dossier</label>
            <select v-model="form.status">
              <option value="complet">Complet</option>
              <option value="en-cours">En cours</option>
            </select>
          </div>
        </div>

        <div class="field-group">
          <label>Diagnostic</label>
          <input v-model="form.diagnosis" type="text" placeholder="Diagnostic principal..." required />
        </div>

        <div class="field-group">
          <label>Plan de traitement</label>
          <input v-model="form.treatment_plan" type="text" placeholder="Médicaments, doses, durée..." />
        </div>

        <div class="field-group">
          <label>Maladies chroniques</label>
          <textarea v-model="form.chronic_conditions" placeholder="Détaillez les antécédents médicaux..."></textarea>
        </div>

        <div class="form-actions">
          <button type="button" @click="router.back()" class="btn-cancel">Annuler</button>
          <button type="submit" class="submit">Créer le dossier</button>
        </div>
      </form>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// Données fictives pour l'exemple (à remplacer par un appel API vers ton PatientStore)
const patients = ref([
  { id: 1, name: 'Leslie Alexander' },
  { id: 2, name: 'Oumar Sidibé' },
])

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const form = reactive({
  patient_id: '',
  doctor_id: 1, // À récupérer dynamiquement via l'utilisateur connecté
  blood_type: '',
  treatment_plan: '',
  diagnosis: '',
  chronic_conditions: '',
  status: 'en-cours'
})

const submit = async () => {
  try {
    await axios.post('http://localhost/api/dossiers-medicaux', form)
    alert('Dossier médical ajouté avec succès !')
    router.push({ name: 'MedicalRecords' }) // Redirige vers la liste
  } catch (error) {
    console.error("Erreur lors de l'ajout:", error)
    alert("Une erreur est survenue lors de la création du dossier.")
  }
}
</script>

<style scoped>
@import './FormStyle.css';

/* Compléments de styles pour l'entête et le layout interne */
.form-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.btn-back {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #f8fafc;
  transform: translateX(-3px);
}

.header-text h2 { margin: 0; }
.subtitle { margin: 0; color: #64748b; font-size: 0.9em; }

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-group label {
  font-weight: 600;
  color: #334155;
  font-size: 14px;
}

.flex-1 { flex: 1; }

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
}

.btn-cancel {
  padding: 12px 24px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
  font-weight: 600;
  color: #64748b;
}
</style>