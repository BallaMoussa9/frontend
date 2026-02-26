<template>
  <AdminLayout>
    <div class="form-container">
      <header class="form-header">
        <button @click="router.back()" class="btn-back" title="Retour">
          <span class="arrow">←</span>
        </button>
        <div class="header-text">
          <h2>Modifier le Rapport Médical</h2>
          <p class="subtitle" v-if="store.currentReport">
            Édition du rapport #RP-{{ store.currentReport.id }}
          </p>
        </div>
      </header>

      <div v-if="store.isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Récupération des données...</p>
      </div>

      <form v-else @submit.prevent="submit" class="edit-form">
        <div class="form-section">
          <legend>Informations Générales</legend>
          
          <div class="row">
            <div class="field-group flex-1">
              <label>Type de rapport</label>
              <select v-model="form.report_type">
                <option value="consultation">Consultation</option>
                <option value="hopitalisation">Hospitalisation</option>
                <option value="laboratoire">Laboratoire</option>
              </select>
            </div>

            <div class="field-group flex-2">
              <label>Titre du rapport</label>
              <input 
                type="text" 
                v-model="form.title" 
                placeholder="Ex: Bilan sanguin complet" 
                required 
              />
            </div>
          </div>
        </div>

        <div class="form-section">
          <legend>Détails Médicaux</legend>
          <div class="field-group">
            <label>Contenu détaillé</label>
            <textarea 
              v-model="form.content" 
              placeholder="Saisissez ici les observations médicales..."
              required
            ></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="router.back()" class="btn-cancel">Annuler</button>
          <button type="submit" class="submit" :disabled="store.isLoading">
            {{ store.isLoading ? 'Enregistrement...' : 'Enregistrer les modifications' }}
          </button>
        </div>
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

onMounted(async () => {
  const reportId = route.params.id 
  if (reportId) {
    await store.fetchMedicalReportById(reportId)
    if (store.currentReport) {
      // On remplit le formulaire avec les données reçues
      form.report_type = store.currentReport.report_type
      form.title = store.currentReport.title
      form.content = store.currentReport.content
    }
  }
})

const submit = async () => {
  try {
    const reportId = route.params.id
    await store.updateMedicalReport(reportId, form)
    alert('Rapport médical modifié avec succès !')
    router.push('/admin/medicalreports') 
  } catch (err) {
    alert("Erreur lors de la modification : " + err.message)
  }
}
</script>

<style scoped>
@import './FormStyle.css';

/* Adaptations spécifiques pour le bouton retour et le header */
.form-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 20px;
}

.btn-back {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #f8fafc;
  transform: translateX(-3px);
  color: #0040d0;
}

.header-text h2 { margin: 0; font-size: 22px; }
.subtitle { margin: 0; color: #64748b; font-size: 14px; }

.field-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px; }
.field-group label { font-weight: 600; color: #475569; font-size: 14px; }

.flex-1 { flex: 1; }
.flex-2 { flex: 2; }

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.btn-cancel {
  padding: 12px 24px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
}

/* Spinner */
.loading-state { text-align: center; padding: 40px; }
.spinner {
  width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #0040d0;
  border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 10px;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>