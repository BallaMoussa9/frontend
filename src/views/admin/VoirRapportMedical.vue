<template>
  <AdminLayout>
    <div class="view-report-page">
      <div v-if="store.isLoading" class="loading">Chargement du rapport...</div>

      <div v-else-if="store.currentReport">
        <div class="header-actions">
           <h2>Rapport médical du {{ formatDate(store.currentReport.created_at) }}</h2>
           <button @click="handleDownload" class="btn-download" v-if="store.currentReport.file_path">
             📥 Télécharger PDF
           </button>
        </div>

        <div class="meta">
          <p><strong>Titre :</strong> {{ store.currentReport.title }}</p>
          <p><strong>Type :</strong> <span class="badge">{{ store.currentReport.report_type }}</span></p>
          <p>
            <strong>Patient :</strong> 
            {{ store.currentReport.patient?.user?.first_name }} {{ store.currentReport.patient?.user?.last_name }}
          </p>
          <p>
            <strong>Médecin :</strong> 
            Dr. {{ store.currentReport.doctor?.user?.first_name }} {{ store.currentReport.doctor?.user?.last_name }}
          </p>
        </div>

        <div class="content-box">
          <p>{{ store.currentReport.content }}</p>
        </div>

        <div v-if="store.currentReport.file_path" class="attachment">
          📎 <strong>Pièce jointe :</strong> 
          <span class="file-name">{{ store.currentReport.file_path.split('/').pop() }}</span>
        </div>
      </div>

      <div v-else class="error-box">
        <p>⚠️ Impossible de charger ce rapport.</p>
        <router-link to="/admin/medicalreports">Retour à la liste</router-link>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMedicalReportStore } from '@/stores/medicalReportStore'

const route = useRoute()
const store = useMedicalReportStore()

onMounted(async () => {
  const reportId = route.params.id
  if (reportId) {
    await store.fetchMedicalReportById(reportId)
  }
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const handleDownload = async () => {
  try {
    await store.downloadMedicalReport(store.currentReport.id)
  } catch (err) {
    alert("Erreur lors du téléchargement")
  }
}
</script>

<style scoped>
.view-report-page {
  max-width: 800px;
  margin: auto;
  padding: 32px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #eee;
  padding-bottom: 15px;
  margin-bottom: 20px;
}

.badge {
  background: #e0e7ff;
  color: #4338ca;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.85em;
  text-transform: uppercase;
}

.content-box {
  margin-top: 25px;
  padding: 20px;
  background: #fcfcfc;
  border-left: 5px solid #0040d0;
  line-height: 1.6;
  white-space: pre-wrap; /* Garde les sauts de ligne du texte */
}

.btn-download {
  background-color: #10b981;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
}

.attachment {
  margin-top: 30px;
  padding: 10px;
  border: 1px dashed #ccc;
  border-radius: 8px;
  background: #f1f5f9;
}
</style>