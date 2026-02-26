<template>
  <AdminLayout>
    <div class="ajouter-infirmier-wrapper">
      <header class="form-header">
        <button @click="router.back()" class="btn-back" title="Retour">
          <span class="arrow">←</span>
        </button>
        <div class="header-text">
          <h2>{{ isEditing ? 'Modifier' : 'Ajouter' }} un Infirmier / Infirmière</h2>
          <p class="subtitle">
            {{ isEditing ? 'Mise à jour des accès et informations' : 'Enregistrement d\'un nouveau membre du personnel' }}
          </p>
        </div>
      </header>

      <form @submit.prevent="submitForm" class="infirmier-form">
        <fieldset class="form-section">
          <legend>Informations générales</legend>
          
          <div class="form-row">
            <div class="field">
              <label>Prénom</label>
              <input v-model="form.first_name" type="text" placeholder="Prénom" required />
            </div>
            <div class="field">
              <label>Nom</label>
              <input v-model="form.last_name" type="text" placeholder="Nom" required />
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Date de naissance</label>
              <input v-model="form.birth_date" type="date" />
            </div>
            <div class="field">
              <label>Téléphone</label>
              <input v-model="form.phone" type="text" placeholder="Téléphone" />
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Email</label>
              <input v-model="form.email" type="email" placeholder="Email" required />
            </div>
            <div class="field" v-if="!isEditing">
              <label>Mot de passe</label>
              <input v-model="form.password" type="password" placeholder="Mot de passe" required />
            </div>
            <div class="field" v-else>
              <label>Changer le mot de passe (optionnel)</label>
              <input v-model="form.password" type="password" placeholder="Laisser vide si inchangé" />
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Ville</label>
              <input v-model="form.city" type="text" placeholder="Ville" />
            </div>
            <div class="field">
              <label>Pays</label>
              <input v-model="form.country" type="text" placeholder="Pays" />
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Adresse complète</label>
              <input v-model="form.address" type="text" placeholder="Adresse complète" />
            </div>
            <div class="field">
              <label>Département</label>
              <select v-model="form.department_id" required>
                <option disabled value="">-- Sélectionner un département --</option>
                <option v-for="dep in departmentStore.allDepartments" :key="dep.id" :value="dep.id">
                  {{ dep.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="field photo-upload">
            <label>Photo de profil</label>
            <div class="photo-controls">
              <div v-if="imagePreview" class="preview-container">
                <img :src="imagePreview" alt="Aperçu" class="preview-img" />
              </div>
              <input type="file" @change="handleFileUpload" accept="image/*" />
            </div>
          </div>
        </fieldset>

        <div v-if="nurseStore.loading" class="state-msg info">
          {{ isEditing ? 'Mise à jour en cours...' : 'Création en cours...' }}
        </div>
        <div v-if="nurseStore.error" class="state-msg error">{{ nurseStore.error }}</div>

        <div class="form-actions">
          <button type="button" @click="router.back()" class="cancel-btn">Annuler</button>
          <button type="submit" class="submit-btn" :disabled="nurseStore.loading">
            {{ isEditing ? "Sauvegarder les modifications" : "Ajouter l'infirmier" }}
          </button>
        </div>
      </form>
    </div>
  </AdminLayout>
</template>
<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue';
import { reactive, onMounted, computed, watch, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNurseStore } from '@/stores/nurseStore';
import { useDepartmentStore } from '@/stores/departmentStore';

const nurseStore = useNurseStore();
const departmentStore = useDepartmentStore();
const route = useRoute();
const router = useRouter();

const imagePreview = ref(null); // Ref pour l'aperçu visuel
const nurseId = computed(() => route.params.id);
const isEditing = computed(() => !!nurseId.value);

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

const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    form.profile_photo = file;
    imagePreview.value = URL.createObjectURL(file); // Création de l'aperçu
  }
};

const submitForm = async () => {
  const formData = new FormData();
  for (const key in form) {
    // Si on modifie et que le mot de passe est vide, on ne l'envoie pas
    if (key === 'password' && isEditing.value && !form[key]) continue;
    
    if (form[key] !== null && form[key] !== '') {
      formData.append(key, form[key]);
    }
  }

  try {
    if (isEditing.value) {
      await nurseStore.updateNurse(nurseId.value, formData);
    } else {
      await nurseStore.createNurse(formData);
    }
    router.push({ name: 'Nurse' });
  } catch (error) {
    console.error('Erreur de soumission:', error);
  }
};

onMounted(() => {
  departmentStore.fetchDepartments();
  if (isEditing.value) {
    nurseStore.fetchOneNurse(nurseId.value);
  }
});

watch(() => nurseStore.currentNurse, (newNurse) => {
  if (newNurse && isEditing.value) {
    Object.assign(form, {
      first_name: newNurse.user?.first_name || '',
      last_name: newNurse.user?.last_name || '',
      birth_date: newNurse.user?.birth_date || '',
      phone: newNurse.user?.phone || '',
      country: newNurse.user?.country || '',
      city: newNurse.user?.city || '',
      address: newNurse.user?.address || '',
      email: newNurse.user?.email || '',
      department_id: newNurse.user?.department_id || '',
      password: '', 
    });
  }
}, { immediate: true });
</script>
<style scoped>
.ajouter-infirmier-wrapper {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

/* Header & Bouton Retour */
.form-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.btn-back {
  width: 45px;
  height: 45px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.btn-back:hover {
  background: #f1f5f9;
  transform: translateX(-4px);
}

.header-text h2 { margin: 0; color: #1e293b; font-size: 24px; font-weight: 800; }
.subtitle { color: #64748b; margin: 0; font-size: 14px; }

/* Sections du formulaire */
.form-section {
  border: 1px solid #f1f5f9;
  background: white;
  padding: 25px;
  border-radius: 16px;
  margin-bottom: 25px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

.form-section legend {
  font-weight: 700;
  color: #10b981; /* Vert pour les infirmiers */
  padding: 0 10px;
  font-size: 14px;
  text-transform: uppercase;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 15px;
}

.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 13px; font-weight: 600; color: #475569; }

input, select {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  transition: border-color 0.2s;
}

input:focus, select:focus {
  outline: none;
  border-color: #10b981;
}

/* Photo Preview */
.photo-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 10px;
  background: #f8fafc;
  padding: 10px;
  border-radius: 12px;
}

.preview-img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #10b981;
}

/* Boutons & Messages */
.form-actions { display: flex; justify-content: flex-end; gap: 15px; }

.submit-btn {
  background-color: #10b981;
  color: white;
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.3s;
}

.cancel-btn {
  background: #f1f5f9;
  color: #475569;
  padding: 14px 28px;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.state-msg { padding: 15px; border-radius: 10px; margin-bottom: 15px; font-weight: 600; }
.error { background: #fef2f2; color: #dc2626; }
.info { background: #ecfdf5; color: #065f46; font-style: italic; }

/* Responsive */
@media (max-width: 768px) {
  .form-row { grid-template-columns: 1fr; }
  .form-actions { flex-direction: column; }
  .submit-btn, .cancel-btn { width: 100%; }
}
</style>