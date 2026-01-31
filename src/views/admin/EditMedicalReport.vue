<template>
  <AdminLayout>
    <div class="form-container">
      <h2>Modifier le  Rapport Médical</h2>
      <form @submit.prevent="submit">
        <div class="row">
        <input type="text" v-model="filter" placeholder="🔍 Filtrer par nom, email ou rôle..." />
        </div>
        <select v-model="form.report_type">
          <option value="consultation">Consultation</option>
          <option value="hopitalisation">Hospitalisation</option>
          <option value="laboratoire">Laboratoire</option>
        </select>
        <input v-model="form.title" placeholder="Titre du rapport" />
        <textarea v-model="form.content" placeholder="Contenu détaillé"></textarea>
        <button class="submit">Modifier</button>
      </form>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMedicalReportStore } from '@/stores/medicalreportStore'

const route = useRoute()
const router = useRouter()
const store = useMedicalReportStore()

const form = reactive({
  report_type: 'consultation',
  title: '',
  content: ''
})

// Charger les données existantes si on est en mode "Modifier"
onMounted(async () => {
  const reportId = route.params.id // Assure-toi que ta route a un paramètre :id
  if (reportId) {
    await store.fetchMedicalReportById(reportId)
    if (store.currentReport) {
      form.report_type = store.currentReport.report_type
      form.title = store.currentReport.title
      form.content = store.currentReport.content
    }
  }
})

const submit = async () => {
  try {
    const reportId = route.params.id
    // On utilise l'action du STORE, pas axios direct !
    await store.updateMedicalReport(reportId, form)
    alert('Rapport médical modifié avec succès !')
    router.push('/admin/MedicalReport') // Redirection après succès
  } catch (err) {
    alert("Erreur lors de la modification : " + err.message)
  }
}
</script>

<style scoped>
@import './FormStyle.css';
</style>
