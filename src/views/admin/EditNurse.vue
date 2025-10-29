<template>
  <AdminLayout>
    <div class="ajouter-infirmier-container">
      <h2>{{ isEditing ? 'Modifier' : 'Ajouter' }} un Infirmier / Infirmière</h2>
      <form @submit.prevent="submitForm" class="infirmier-form">

        <fieldset>
          <legend>Informations générales</legend>
          <div class="form-row">
            <input v-model="form.first_name" type="text" placeholder="Prénom" required />
            <input v-model="form.last_name" type="text" placeholder="Nom" required />
          </div>
          <div class="form-row">
            <input v-model="form.birth_date" type="date" placeholder="Date de naissance" />
            <input v-model="form.phone" type="text" placeholder="Téléphone" />
          </div>
          <div class="form-row">
            <input v-model="form.email" type="email" placeholder="Email" required />
            <input v-if="!isEditing" v-model="form.password" type="password" placeholder="Mot de passe" required />
          </div>
          <div class="form-row">
            <input v-model="form.city" type="text" placeholder="Ville" />
            <input v-model="form.country" type="text" placeholder="Pays" />
          </div>
          <div class="form-row">
            <input v-model="form.address" type="text" placeholder="Adresse complète" />
            <select v-model="form.department_id" required>
              <option disabled value="">-- Sélectionner un département --</option>
              <option v-if="departmentStore.loading">Chargement...</option>
              <option v-for="dep in departmentStore.allDepartments" :key="dep.id" :value="dep.id">
                {{ dep.name }}
              </option>
            </select>
          </div>
          <div class="form-row">
            <input type="file" @change="handleFileUpload" />
          </div>
        </fieldset>

        <div v-if="nurseStore.loading" class="loading-message">
          <p>{{ isEditing ? 'Mise à jour en cours...' : 'Création en cours...' }}</p>
        </div>
        <div v-if="nurseStore.error" class="error-message">{{ nurseStore.error }}</div>

        <button type="submit" class="submit-btn" :disabled="nurseStore.loading">
          {{ isEditing ? "Modifier l'infirmier" : "Ajouter l'infirmier" }}
        </button>
      </form>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue';
import { reactive, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNurseStore } from '@/stores/nurseStore';
import { useDepartmentStore } from '@/stores/departmentStore';

const nurseStore = useNurseStore();
const departmentStore = useDepartmentStore();
const route = useRoute();
const router = useRouter();

const nurseId = computed(() => route.params.id);
const isEditing = computed(() => !!nurseId.value);
console.log(nurseId)
const form = reactive({
  first_name: '',
  last_name: '',
  birth_date: '',
  phone: '',
  country: '',
  city: '',
  profile_photo: null,
  status: 'active',
  address: '',
  email: '',
  password: '',
  department_id: ''
});

const initialFormState = { ...form };

const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    form.profile_photo = file;
  }
};

const submitForm = async () => {
  const formData = new FormData();
  // On n'ajoute la photo de profil que si elle existe
  for (const key in form) {
    if (key === 'profile_photo' && !form[key]) {
      continue;
    }
    formData.append(key, form[key]);
  }

  try {
    if (isEditing.value) {
      await nurseStore.updateNurse(nurseId.value, formData);
      Object.assign(form, initialFormState);
    } else {
      await nurseStore.createNurse(formData);
      Object.assign(form, initialFormState); // Réinitialise le formulaire après création
    }
    router.push({ name: 'Nurse' }); // Redirige après succès
  } catch (error) {
    console.error('Erreur de soumission:', error);
  }
};

// Charge les départements au montage du composant
onMounted(() => {
  departmentStore.fetchDepartments();
});

// Surveille les changements de `currentNurse` dans le store
watch(() => nurseStore.currentNurse, (newNurse) => {
  if (newNurse) {
    // Popule le formulaire avec les données de l'infirmier pour l'édition
    Object.assign(form, {
      first_name: newNurse.user?.first_name,
      last_name: newNurse.user?.last_name,
      birth_date: newNurse.user?.birth_date,
      phone: newNurse.user?.phone,
      country: newNurse.user?.country,
      city: newNurse.user?.city,
      address: newNurse.user?.address,
      email: newNurse.user?.email,
      department_id: newNurse.user?.department_id,
      password: '', // Ne pas pré-remplir le mot de passe
    });
  }
}, { immediate: true });

// Charge les données de l'infirmier si l'ID existe dans la route
if (isEditing.value) {
  nurseStore.fetchOneNurse(nurseId.value);
}
</script>

<style scoped>
/* (Your existing styles) */
.ajouter-infirmier-container { max-width: 900px; margin: auto; padding: 30px; background: #ffffff; border-radius: 12px; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
h2 { margin-bottom: 20px; color: #0040d0; }
.infirmier-form { display: flex; flex-direction: column; gap: 24px; }
fieldset { border: 1px solid #ccc; border-radius: 10px; padding: 20px; }
legend { font-weight: bold; color: #002580; padding: 0 10px; }
.form-row { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 10px; }
input, select { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
.submit-btn { align-self: flex-end; background-color: #0040d0; color: white; padding: 12px 24px; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; }
.submit-btn:hover { background-color: #002fa1; }
.error-message { color: red; margin-top: 10px; }
.loading-message { color: #0040d0; margin-top: 10px; font-style: italic; }
</style>
