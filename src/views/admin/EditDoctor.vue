<template>
  <AdminLayout>
    <div class="modifier-medecin-wrapper">
      <header class="form-header">
        <button @click="router.back()" class="btn-back" title="Retour">
          <span class="arrow">←</span>
        </button>
        <div class="header-text">
          <h2>Modifier un Médecin</h2>
          <p class="subtitle">Mettez à jour les informations du praticien</p>
        </div>
      </header>

      <div v-if="doctorStore.loading" class="state-msg info">
        <div class="spinner"></div> Chargement des données...
      </div>
      <div v-if="doctorStore.error" class="state-msg error">{{ doctorStore.error }}</div>
      <div v-if="doctorStore.success" class="state-msg success">{{ doctorStore.success }}</div>

      <form @submit.prevent="submitForm" class="medecin-form" v-if="!doctorStore.loading && doctorStore.currentDoctor">
        <fieldset class="form-section">
          <legend>Informations générales</legend>
          
          <div class="form-row">
            <div class="field">
              <label>Prénom</label>
              <input v-model="form.first_name" type="text" required />
            </div>
            <div class="field">
              <label>Nom</label>
              <input v-model="form.last_name" type="text" required />
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Date de naissance</label>
              <input v-model="form.birth_date" type="date" required />
            </div>
            <div class="field">
              <label>Téléphone</label>
              <input v-model="form.phone" type="text" />
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Pays</label>
              <select v-model="form.country" required>
                <option value="" disabled>-- Sélectionner --</option>
                <option v-for="c in countries" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div class="field">
              <label>Ville</label>
              <input v-model="form.city" type="text" required />
            </div>
          </div>

          <div class="field">
            <label>Adresse</label>
            <input v-model="form.address" type="text" required placeholder="Adresse complète" />
          </div>

          <div class="form-row">
            <div class="field">
              <label>Email</label>
              <input v-model="form.email" type="email" required />
            </div>
            <div class="field">
              <label>Nouveau mot de passe</label>
              <input v-model="form.password" type="password" placeholder="Laisser vide si inchangé" />
            </div>
          </div>
        </fieldset>

        <fieldset class="form-section">
          <legend>Détails professionnels</legend>
          <div class="form-row">
            <div class="field">
              <label>Spécialité</label>
              <input v-model="form.speciality" type="text" />
            </div>
            <div class="field">
              <label>Département / Hôpital</label>
              <select v-model="form.department_id" required>
                <option value="" disabled>-- Sélectionner un département --</option>
                <option v-for="dept in departmentStore.departments" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="field">
              <label>Statut</label>
              <select v-model="form.status" required>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="suspended">Suspendu</option>
              </select>
            </div>
            <div class="field">
              <label>N° Professionnel</label>
              <input v-model="form.numero_professionel" type="text" required />
            </div>
          </div>
          <div class="form-row">
            <div class="field">
              <label>Numéro d’ordre</label>
              <input v-model="form.numero_ordre" type="text" />
            </div>
            <div class="field">
              <label>Expérience (années)</label>
              <input v-model="form.experience" type="number" />
            </div>
          </div>
          <div class="field">
            <label>Biographie</label>
            <textarea v-model="form.biography"></textarea>
          </div>
        </fieldset>

        <div class="form-actions">
          <button type="button" @click="router.back()" class="cancel-btn">Annuler</button>
          <button type="submit" class="submit-btn" :disabled="doctorStore.loading">
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDoctorStore } from '@/stores/doctorStore'
import { useDepartmentStore } from '@/stores/departmentStore'

const route = useRoute();
const router = useRouter();
const doctorStore = useDoctorStore();
const departmentStore = useDepartmentStore();
const countries = ['Mali', 'France', 'Sénégal', 'Côte d\'Ivoire', 'Belgique'];

const form = reactive({
  first_name: '', last_name: '', birth_date: '', phone: '',
  country: '', city: '', address: '', email: '', password: '',
  department_id: '', status: 'active', speciality: '', numero_ordre: '',
  biography: '', experience: '', numero_professionel: '', doctor_id: null,
  profile_photo: null
});

const fillFormWithDoctorData = (doc) => {
  if (!doc || !doc.user) return;
  Object.assign(form, {
    first_name: doc.user.first_name, 
    last_name: doc.user.last_name,
    birth_date: doc.user.birth_date,
    email: doc.user.email, 
    phone: doc.user.phone,
    country: doc.user.country, 
    city: doc.user.city,
    address: doc.user.address, 
    doctor_id: doc.id,
    department_id: doc.department_id || '',
    status: doc.status || 'active',
    speciality: doc.speciality, 
    numero_ordre: doc.numero_ordre,
    biography: doc.biography, 
    experience: doc.experience,
    numero_professionel: doc.numero_professionel
  });
};

const submitForm = async () => {
  const formData = new FormData();
  for (const key in form) {
    if (form[key] !== null && form[key] !== '') {
      formData.append(key, form[key]);
    }
  }
  formData.append('_method', 'PUT');
  
  if (await doctorStore.updateDoctor(form.doctor_id, formData)) {
    router.push({ name: 'Doctor' });
  }
};

onMounted(async () => {
  await doctorStore.fetchOneDoctor(route.params.id);
  await departmentStore.fetchDepartments();
});

watch(() => doctorStore.currentDoctor, fillFormWithDoctorData, { deep: true });
</script>

<style scoped>
/* Conserve ton style existant */


/* Conserve ton CSS existant, il est très bien ! */
.modifier-medecin-wrapper { max-width: 1000px; margin: 0 auto; padding: 20px; }
.form-header { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; }
.btn-back { width: 45px; height: 45px; border-radius: 12px; border: 1px solid #e2e8f0; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.header-text h2 { margin: 0; font-size: 24px; font-weight: 800; }
.medecin-form { display: grid; gap: 25px; }
.form-section { border: 1px solid #f1f5f9; background: white; padding: 25px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.field { display: flex; flex-direction: column; gap: 8px; }
.field label { font-size: 13px; font-weight: 600; color: #475569; }
input, select, textarea { padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; }
.submit-btn { background: #3b82f6; color: white; padding: 14px 28px; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; }
.state-msg { padding: 15px; border-radius: 10px; margin-bottom: 20px; font-weight: 600; }
.error { background: #fef2f2; color: #dc2626; }
.success { background: #f0fdf4; color: #16a34a; }
</style>