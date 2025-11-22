<template>
  <AdminLayout>
    <div class="form-container">
      <h2>Modifier le Médecin Urgentiste</h2>

      <div v-if="urgentistStore.loading" class="loading-message">Chargement...</div>
      <div v-if="urgentistStore.error && typeof urgentistStore.error === 'string'" class="error-message">
        {{ urgentistStore.error }}
      </div>
      <div v-if="urgentistStore.success" class="success-message">{{ urgentistStore.success }}</div>

      <form @submit.prevent="submit" v-if="!urgentistStore.loading && urgentistStore.currentUrgentist">
        <fieldset>
          <legend>Infos générales</legend>
          <div class="row">
            <div class="field">
              <input v-model="form.first_name" placeholder="Prénom" />
              <span v-if="errors.first_name" class="error-message">{{ errors.first_name[0] }}</span>
            </div>
            <div class="field">
              <input v-model="form.last_name" placeholder="Nom" />
              <span v-if="errors.last_name" class="error-message">{{ errors.last_name[0] }}</span>
            </div>
          </div>

          <div class="row">
            <div class="field">
              <input v-model="form.email" type="email" placeholder="Email" />
              <span v-if="errors.email" class="error-message">{{ errors.email[0] }}</span>
            </div>
            <div class="field">
              <input v-model="form.phone" placeholder="Téléphone" />
              <span v-if="errors.phone" class="error-message">{{ errors.phone[0] }}</span>
            </div>
          </div>

          <div class="row">
            <input v-model="form.city" placeholder="Ville" />
            <input v-model="form.country" placeholder="Pays" />
          </div>
        </fieldset>

        <fieldset>
          <legend>Infos médicales</legend>
          <div class="row">
            <div class="field">
              <input v-model="form.speciality" placeholder="Spécialité" />
              <span v-if="errors.speciality" class="error-message">{{ errors.speciality[0] }}</span>
            </div>
            <div class="field">
              <input v-model="form.location" placeholder="Localisation" />
            </div>
          </div>

          <div class="row">
            <label>Statut :</label>
            <select v-model="form.status">
              <option value="available">Disponible</option>
              <option value="on_duty">En service</option>
              <option value="off_duty">Hors service</option>
              <option value="suspended">Suspendu</option>
            </select>
            <span v-if="errors.status" class="error-message">{{ errors.status[0] }}</span>
          </div>

          <input type="file" @change="handlePhoto" />
        </fieldset>

        <button class="submit" :disabled="urgentistStore.loading">Modifier</button>
      </form>
    </div>
  </AdminLayout>
</template>
<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { reactive, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUrgentistStore } from '@/stores/urgentistStore'

const route = useRoute()
const router = useRouter()
const urgentistStore = useUrgentistStore()

// ✅ formulaire réactif
const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  city: '',
  country: '',
  profile_photo: null,
  speciality: '',
  location: '',
  status: 'available'
})

// ✅ erreurs backend
const errors = ref({})

// gestion du fichier
const handlePhoto = (e) => {
  form.profile_photo = e.target.files[0]
}

// soumission du formulaire
const submit = async () => {
  errors.value = {}

  const data = new FormData()
  Object.keys(form).forEach(k => {
    if (form[k] !== null && form[k] !== '') {
      data.append(k, form[k])
    }
  })
  data.append('_method', 'PUT')

  try {
    await urgentistStore.updateUrgentist(route.params.id, data)

    // Vérifier si l'erreur est un objet (erreurs de validation)
    if (urgentistStore.error && typeof urgentistStore.error === 'object') {
      errors.value = urgentistStore.error.errors || {}
    } else if (!urgentistStore.error) {
      // Rediriger vers la liste après succès
      router.push({ name: 'Urgence' })
    }
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error)
    // S'il y a une erreur jetée par handleAction, la gérer ici
    if (error.errors) {
        errors.value = error.errors;
    }
  }
}

// récupère l'urgentiste au montage
onMounted(() => {
  // 🔑 CORRECTION DE L'ERREUR : Utilisation de l'action correcte du store
  urgentistStore.fetchUrgentist(route.params.id) 
})

// met à jour le form quand l’urgentiste est chargé
watch(() => urgentistStore.currentUrgentist, (newUrgentist) => {
  if (newUrgentist && newUrgentist.user) {
    Object.assign(form, {
      first_name: newUrgentist.user.first_name ?? form.first_name,
      last_name: newUrgentist.user.last_name ?? form.last_name,
      email: newUrgentist.user.email ?? form.email,
      phone: newUrgentist.user.phone ?? form.phone,
      city: newUrgentist.user.city ?? form.city,
      country: newUrgentist.user.country ?? form.country,
      speciality: newUrgentist.speciality ?? form.speciality,
      location: newUrgentist.location ?? form.location,
      status: newUrgentist.status ?? form.status,
    })
  }
}, { immediate: true })
</script>


<style scoped>
@import './FormStyle.css';

.loading-message { color: #0040d0; margin-bottom: 10px; }
.error-message { color: #d9534f; margin-bottom: 6px; font-size: 14px; display: block; }
.success-message { color: #5cb85c; margin-bottom: 10px; }

.row { display: flex; gap: 16px; margin-bottom: 16px; }
.field { flex: 1; display: flex; flex-direction: column; }
input, select { padding: 10px; border-radius: 6px; border: 1px solid #ccc; }
.submit { background-color: #0040d0; color: white; padding: 10px 18px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
</style>