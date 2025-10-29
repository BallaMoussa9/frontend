<template>
  <AdminLayout>
    <div class="ajouter-lab-tech-container">
      <h2>Modifier le Technicien de Laboratoire</h2>

      <div v-if="labTechnicianStore.loading || departmentStore.loading || laboratoryStore.loading" class="loading-message">Chargement...</div>

      <div v-if="labTechnicianStore.error" class="error-message">
        <p v-if="typeof labTechnicianStore.error === 'string'">{{ labTechnicianStore.error }}</p>
        <ul v-else-if="labTechnicianStore.error.message">
          <li>{{ labTechnicianStore.error.message }}</li>
        </ul>
        <ul v-else-if="labTechnicianStore.error.lab_technician_id">
            <li>Erreur Tech Lab ID: {{ labTechnicianStore.error.lab_technician_id }}</li>
            <li>Erreur User ID: {{ labTechnicianStore.error.provided_user_id }}</li>
            <li>Message: {{ labTechnicianStore.error.message }}</li>
        </ul>
      </div>
      <div v-if="departmentStore.error" class="error-message">
        {{ departmentStore.error }}
      </div>
       <div v-if="laboratoryStore.error" class="error-message">
        {{ laboratoryStore.error }}
      </div>


      <div v-if="labTechnicianStore.success" class="success-message">
        {{ labTechnicianStore.success }}
      </div>

      <form @submit.prevent="submitForm" enctype="multipart/form-data"
            v-if="!labTechnicianStore.loading && labTechnicianStore.currentTechnician"
            class="lab-tech-form">

        <fieldset>
          <legend>Informations générales de l'utilisateur</legend>
          <div class="form-row">
            <div class="field">
              <input v-model="form.first_name" type="text" placeholder="Prénom" />
              <span v-if="validationErrors.first_name" class="error-message">{{ validationErrors.first_name[0] }}</span>
            </div>
            <div class="field">
              <input v-model="form.last_name" type="text" placeholder="Nom" />
              <span v-if="validationErrors.last_name" class="error-message">{{ validationErrors.last_name[0] }}</span>
            </div>
          </div>
          <div class="form-row">
            <div class="field">
              <input v-model="form.birth_date" type="date" placeholder="Date de naissance" />
              <span v-if="validationErrors.birth_date" class="error-message">{{ validationErrors.birth_date[0] }}</span>
            </div>
            <div class="field">
              <input v-model="form.phone" type="text" placeholder="Téléphone" />
              <span v-if="validationErrors.phone" class="error-message">{{ validationErrors.phone[0] }}</span>
            </div>
          </div>
          <div class="form-row">
            <div class="field">
              <input v-model="form.email" type="email" placeholder="Adresse email" required />
              <span v-if="validationErrors.email" class="error-message">{{ validationErrors.email[0] }}</span>
            </div>
            <div class="field">
              <input v-model="form.password" type="password" placeholder="Nouveau mot de passe (optionnel)" />
              <span v-if="validationErrors.password" class="error-message">{{ validationErrors.password[0] }}</span>
            </div>
          </div>
          <div class="form-row">
            <div class="field">
              <input v-model="form.city" type="text" placeholder="Ville" />
              <span v-if="validationErrors.city" class="error-message">{{ validationErrors.city[0] }}</span>
            </div>
            <div class="field">
              <input v-model="form.address" type="text" placeholder="Adresse" />
              <span v-if="validationErrors.address" class="error-message">{{ validationErrors.address[0] }}</span>
            </div>
          </div>
          <div class="form-row">
             <div class="field">
              <label for="profile_photo">Photo de profil:</label>
              <input type="file" @change="handleFileUpload" id="profile_photo" />
              <span v-if="validationErrors.profile_photo" class="error-message">{{ validationErrors.profile_photo[0] }}</span>
            </div>
            <div class="field">
              <select v-model="form.department_id">
                <option disabled value="">-- Département --</option>
                <option v-for="dept in departmentStore.departments" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </option>
              </select>
              <span v-if="validationErrors.department_id" class="error-message">{{ validationErrors.department_id[0] }}</span>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Détails spécifiques du technicien</legend>
          <div class="form-row">
            <div class="field">
              <input v-model="form.speciality" type="text" placeholder="Spécialité" />
              <span v-if="validationErrors.speciality" class="error-message">{{ validationErrors.speciality[0] }}</span>
            </div>
            <div class="field">
              <input v-model="form.qualification" type="text" placeholder="Qualification" />
              <span v-if="validationErrors.qualification" class="error-message">{{ validationErrors.qualification[0] }}</span>
            </div>
          </div>
          <div class="form-row">
            <div class="field">
              <select v-model="form.laboratory_id">
                <option disabled value="">-- Laboratoire --</option>
                <option v-for="lab in laboratoryStore.laboratories" :key="lab.id" :value="lab.id">
                  {{ lab.name }}
                </option>
              </select>
              <span v-if="validationErrors.laboratory_id" class="error-message">{{ validationErrors.laboratory_id[0] }}</span>
            </div>
            <div class="field">
              <label>Statut :</label>
              <select v-model="form.status">
                <option value="active">Actif</option>
                <option value="on_leave">En congé</option>
                <option value="resigned">Démissionnaire</option>
                <option value="suspended">Suspendu</option>
              </select>
              <span v-if="validationErrors.status" class="error-message">{{ validationErrors.status[0] }}</span>
            </div>
          </div>
        </fieldset>

        <button type="submit" class="submit-btn" :disabled="labTechnicianStore.loading">Mettre à jour le technicien lab</button>
      </form>
      <div v-else-if="!labTechnicianStore.loading && !labTechnicianStore.currentTechnician && !labTechnicianStore.error">
          <p class="info-message">Technicien non trouvé ou données non disponibles.</p>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { reactive, onMounted, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLabTechnicianStore } from '@/stores/labTechnicianStore'
import { useDepartmentStore } from '@/stores/departmentStore'
import { useLaboratoryStore } from '@/stores/laboratoryStore' // Import du store des laboratoires

const route = useRoute()
const router = useRouter()
const labTechnicianStore = useLabTechnicianStore()
const departmentStore = useDepartmentStore()
const laboratoryStore = useLaboratoryStore() // Initialisation du store des laboratoires

const form = reactive({
  first_name: '',
  last_name: '',
  birth_date: '',
  phone: '',
  country: '',
  city: '',
  address: '',
  email: '',
  password: '', // Optionnel pour la mise à jour
  profile_photo: null, // Pour le fichier
  speciality: '',
  qualification: '',
  laboratory_id: null, // Doit être null ou un ID valide
  department_id: null, // Doit être null ou un ID valide
  status: 'active',
});

const validationErrors = ref({}); // Pour les erreurs de validation du backend

const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    form.profile_photo = file;
  }
};

const submitForm = async () => {
  validationErrors.value = {}; // Réinitialiser les erreurs de validation
  labTechnicianStore.resetFeedback(); // Réinitialiser les messages de succès/erreur du store

  const formData = new FormData();

  // Ajouter la méthode _method pour simuler PUT avec FormData
  formData.append('_method', 'PUT');

  // Parcourir l'objet `form` et ajouter les données à `formData`
  for (const key in form) {
    const value = form[key];

    // Gérer les cas spécifiques
    if (key === 'password') {
      // Si le mot de passe est vide, ne pas l'envoyer
      if (value) {
        formData.append(key, value);
        // Si un nouveau mot de passe est fourni, la confirmation est généralement requise par le backend
        formData.append('password_confirmation', value);
      }
    } else if (key === 'profile_photo') {
      // Si une nouvelle photo est sélectionnée
      if (value instanceof File) {
        formData.append(key, value);
      }
      // Si aucune nouvelle photo n'est sélectionnée et qu'il y en avait une avant,
      // on ne fait rien ou on envoie `null` si on veut explicitement la supprimer (non géré ici pour l'instant)
    } else if (value !== null && value !== undefined && value !== '') {
      // Ajouter les autres champs non vides et non spécifiques
      formData.append(key, value);
    }
  }

  // Log du FormData pour le débogage (dans la console du navigateur)
  console.log('--- FormData avant envoi ---');
  for (let [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }

  try {
    const technicianId = route.params.id;
    await labTechnicianStore.updateLabTechnician(technicianId, formData);

    if (!labTechnicianStore.error) {
      alert('Technicien de laboratoire mis à jour avec succès!');
      router.push({ name: 'Laboratoire' }); // Rediriger vers la liste
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    if (error.response && error.response.data) {
        // Gérer les erreurs de validation (422) ou d'autres erreurs du backend
        if (error.response.data.errors) {
            validationErrors.value = error.response.data.errors;
        } else if (error.response.data.message) {
            // Si c'est un message d'erreur général du backend
            labTechnicianStore.error = error.response.data.message;
            // Afficher les détails si présents (comme lab_technician_id, provided_user_id)
            if (error.response.data.lab_technician_id !== undefined) {
                labTechnicianStore.error = {
                    message: error.response.data.message,
                    lab_technician_id: error.response.data.lab_technician_id,
                    provided_user_id: error.response.data.provided_user_id
                };
            }
        } else {
            labTechnicianStore.error = 'Une erreur inattendue est survenue du serveur.';
        }
    } else {
      labTechnicianStore.error = error.message || 'Une erreur réseau est survenue.';
    }
  }
};

// Au montage du composant, charger le technicien et les données de sélection
onMounted(() => {
  labTechnicianStore.fetchLabTechnician(route.params.id);
  departmentStore.fetchDepartments();
  laboratoryStore.fetchAllLaboratories(); // Charger tous les laboratoires
});

// Surveiller les changements de `currentTechnician` pour populer le formulaire
watch(() => labTechnicianStore.currentTechnician, (newTechnician) => {
  if (newTechnician) {
    // Populer les champs utilisateur
    if (newTechnician.user) {
      Object.assign(form, {
        first_name: newTechnician.user.first_name || '',
        last_name: newTechnician.user.last_name || '',
        birth_date: newTechnician.user.birth_date ? new Date(newTechnician.user.birth_date).toISOString().split('T')[0] : '',
        phone: newTechnician.user.phone || '',
        country: newTechnician.user.country || '',
        city: newTechnician.user.city || '',
        address: newTechnician.user.address || '',
        email: newTechnician.user.email || '',
        department_id: newTechnician.user.department_id || null, // Assurez-vous que c'est null si vide pour le select
      });
    }

    // Populer les champs spécifiques au LabTechnician
    Object.assign(form, {
      speciality: newTechnician.speciality || '',
      qualification: newTechnician.qualification || '',
      laboratory_id: newTechnician.laboratory_id || null, // Assurez-vous que c'est null si vide pour le select
      status: newTechnician.status || 'active',
    });
    // Ne pas définir `form.password` pour éviter de le pré-remplir
    form.password = '';
  }
}, { immediate: true }); // Exécuter la fonction du watcher immédiatement au montage

</script>

<style scoped>
/* Le style reste inchangé comme demandé */
.ajouter-lab-tech-container {
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
}

.lab-tech-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

fieldset {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 20px;
}

legend {
  font-weight: bold;
  color: #002580;
  padding: 0 10px;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 10px;
}

.field {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 200px; /* Pour éviter que les champs ne soient trop petits */
}

input,
select,
textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  width: 100%; /* Assure que l'input prend toute la largeur du 'field' */
}

textarea {
  height: 100px;
  resize: vertical;
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
  margin-top: 20px;
}

.submit-btn:hover {
  background-color: #002fa1;
}

.loading-message { color: #0040d0; margin-bottom: 10px; }
.error-message { color: #d9534f; margin-bottom: 6px; font-size: 13px; display: block; } /* Ajusté */
.success-message { color: #5cb85c; margin-bottom: 10px; }
.info-message { color: #333; margin-top: 20px; text-align: center; }

/* Style pour le bloc de débogage */
.debug-data {
  background-color: #f8f8f8;
  border: 1px solid #e0e0e0;
  padding: 15px;
  margin-bottom: 25px;
  border-radius: 8px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 13px;
  color: #333;
}

.debug-data h3 {
  color: #002580;
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 15px;
}

.debug-data pre {
  white-space: pre-wrap; /* Permet le retour à la ligne pour les longues chaînes */
  word-wrap: break-word;
}
</style>
