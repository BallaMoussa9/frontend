<template>
  <AdminLayout>
    <div class="ajouter-lab-technician-container">
      <h2>Ajouter un Technicien de Laboratoire</h2>

      <div v-if="labTechnicianStore.error || departmentStore.error || laboratoryStore.error" class="alert alert-danger">
        <p v-if="labTechnicianStore.error">Erreur du technicien: {{ labTechnicianStore.error }}</p>
        <p v-if="departmentStore.error">Erreur des départements: {{ departmentStore.error }}</p>
        <p v-if="laboratoryStore.error">Erreur des laboratoires: {{ laboratoryStore.error }}</p>
      </div>

      <div v-if="formErrors.length" class="alert alert-danger">
        <ul>
          <li v-for="error in formErrors" :key="error">{{ error }}</li>
        </ul>
      </div>

      <form @submit.prevent="submitForm" class="lab-technician-form">

        <fieldset>
          <legend>Informations générales de l'utilisateur</legend>
          <div class="form-row">
            <input v-model="form.first_name" type="text" placeholder="Prénom" required />
            <input v-model="form.last_name" type="text" placeholder="Nom" required />
          </div>
          <div class="form-row">
            <input v-model="form.birth_date" type="date" placeholder="Date de naissance" />
            <input v-model="form.phone" type="text" placeholder="Téléphone" />
          </div>
          <div class="form-row">
            <input v-model="form.email" type="email" placeholder="Adresse email" required />
            <input v-model="form.password" type="password" placeholder="Mot de passe" required />
          </div>
          <div class="form-row">
            <input v-model="form.password_confirmation" type="password" placeholder="Confirmer le mot de passe" required />
          </div>
          <div class="form-row">
            <input v-model="form.city" type="text" placeholder="Ville" />
            <input v-model="form.country" type="text" placeholder="Pays" />
          </div>
          <div class="form-row">
            <input v-model="form.address" type="text" placeholder="Adresse" />
            <select v-model="form.department_id">
              <option :value="null">-- Sélectionner un Département --</option>
              <option v-for="dept in departmentStore.departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>
          <div class="form-row">
            <label for="profile_photo">Photo de profil:</label>
            <input type="file" @change="handleFileUpload" id="profile_photo" />
          </div>
          <div class="form-row">
            <select v-model="form.status">
                <option value="active">Actif</option>
                <option value="on_leave">En congé</option>
                <option value="resigned">Démissionnaire</option>
                <option value="suspended">Suspendu</option>
            </select>
          </div>
        </fieldset>

        <fieldset>
          <legend>Détails du Technicien de Laboratoire</legend>
          <div class="form-row">
            <select v-model="form.laboratory_id" required>
              <option :value="null">-- Sélectionner un Laboratoire --</option>
              <option v-for="lab in laboratoryStore.laboratories" :key="lab.id" :value="lab.id">
                {{ lab.name }}
              </option>
            </select>
            <input v-model="form.speciality" type="text" placeholder="Spécialité (ex: Microbiologie)" />
          </div>
          <div class="form-row">
            <input v-model="form.qualification" type="text" placeholder="Qualification (ex: Licence en analyses biomédicales)" />
          </div>
        </fieldset>

        <button type="submit" class="submit-btn" :disabled="labTechnicianStore.loading">
          {{ labTechnicianStore.loading ? 'Ajout en cours...' : 'Ajouter le technicien lab' }}
        </button>
      </form>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue';
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useLabTechnicianStore } from '@/stores/labTechnicianStore';
import { useDepartmentStore } from '@/stores/departmentStore';
import { useLaboratoryStore } from '@/stores/laboratoryStore'; // Importation du nouveau store

const router = useRouter();

// Initialiser les stores nécessaires
const labTechnicianStore = useLabTechnicianStore();
const departmentStore = useDepartmentStore();
const laboratoryStore = useLaboratoryStore(); // Utilisation du store des laboratoires

const form = reactive({
  first_name: '',
  last_name: '',
  birth_date: null,
  phone: '',
  country: '',
  city: '',
  profile_photo: null,
  status: 'active',
  address: '',
  email: '',
  password: '',
  password_confirmation: '',
  department_id: null,

  // Champs spécifiques au LabTechnician
  laboratory_id: null, // Initialisé à null pour la sélection
  speciality: '',
  qualification: '',
});

const formErrors = ref([]);

const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    form.profile_photo = file;
  }
};

const submitForm = async () => {
  formErrors.value = [];
  labTechnicianStore.resetFeedback();

  const formData = new FormData();
  for (const key in form) {
    if (form[key] !== null && form[key] !== '') {
        formData.append(key, form[key]);
    }
  }

  // Le rôle_id est requis par votre backend, mais n'est pas dans le formulaire.
  // Ajoutez-le manuellement avec une valeur par défaut ou un champ caché.
  // Par exemple, si l'ID pour un technicien est '3'.
  formData.append('role_id', 3);

  try {
    await labTechnicianStore.createLabTechnician(formData);
    alert(labTechnicianStore.success);
    router.push({ name: 'Laboratoire' });
  } catch (error) {
    console.error('Erreur lors de la création du technicien:', error);
    if (error.response && error.response.data && error.response.data.errors) {
      for (const key in error.response.data.errors) {
        formErrors.value.push(error.response.data.errors[key][0]);
      }
    } else {
      formErrors.value.push(labTechnicianStore.error || 'Une erreur inattendue est survenue.');
    }
  }
};

// Charger les données nécessaires au montage du composant
onMounted(() => {
  departmentStore.fetchDepartments();
  laboratoryStore.fetchAllLaboratories(); // Appel à la méthode du store des laboratoires
});
</script>

<style scoped>
/* Le style reste inchangé comme demandé */
.ajouter-lab-technician-container {
  max-width: 900px;
  margin: auto;
  padding: 30px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
}

h2 {
  margin-bottom: 20px;
  color: #0040d0;
  text-align: center;
}

.lab-technician-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

fieldset {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
}

legend {
  font-weight: bold;
  color: #002580;
  padding: 0 10px;
  margin-left: -10px;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 10px;
  align-items: center;
}

input[type="text"],
input[type="email"],
input[type="password"],
input[type="date"],
select,
textarea {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  min-width: 200px;
}

input[type="file"] {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

textarea {
  width: 100%;
  height: 100px;
  resize: vertical;
}

label {
  min-width: 120px;
  font-weight: bold;
  color: #333;
}

.submit-btn {
  align-self: flex-end;
  background-color: #0040d0;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: #002fa1;
}

.submit-btn:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}

.alert {
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid transparent;
  border-radius: 8px;
}

.alert-danger {
  color: #721c24;
  background-color: #f8d7da;
  border-color: #f5c6cb;
}
.alert-danger ul {
  margin: 0;
  padding-left: 20px;
}
</style>
