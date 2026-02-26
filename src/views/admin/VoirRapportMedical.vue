<template>
  <AdminLayout>
    <div class="view-report-wrapper">
      <header class="page-header no-print">
        <div class="header-left">
          <button @click="router.back()" class="btn-back" title="Retour">
            <span class="arrow">←</span>
          </button>
          <div class="header-text" v-if="store.currentReport">
            <h2>Rapport du {{ formatDate(store.currentReport.created_at) }}</h2>
          </div>
        </div>
        <div class="header-actions">
          <button @click="handlePrint" class="btn-print">
            🖨️ Imprimer le rapport
          </button>
          <button @click="handleDownload" class="btn-download" v-if="store.currentReport?.file_path">
            📥 PDF
          </button>
        </div>
      </header>

      <div v-if="store.currentReport" class="printable-content" id="report-to-print">
        
        <div class="document-header">
          <div class="clinic-info">
            <h1>CENTRE MÉDICAL</h1>
            <p>Service de {{ store.currentReport.report_type }}</p>
          </div>
          <div class="doc-meta">
            <p><strong>Date:</strong> {{ formatDate(store.currentReport.created_at) }}</p>
            <p><strong>Réf:</strong> #RP-{{ store.currentReport.id }}</p>
          </div>
        </div>

        <hr class="separator" />

        <div class="patient-doctor-grid">
          <div class="info-block">
            <label>PATIENT</label>
            <p class="val-large">{{ store.currentReport.patient?.user?.first_name }} {{ store.currentReport.patient?.user?.last_name }}</p>
            <p>Né(e) le : {{ store.currentReport.patient?.user?.birth_date || 'N/A' }}</p>
          </div>
          <div class="info-block text-right">
            <label>MÉDECIN RÉFÉRENT</label>
            <p class="val-large">Dr. {{ store.currentReport.doctor?.user?.first_name }} {{ store.currentReport.doctor?.user?.last_name }}</p>
            <p>Spécialité : {{ store.currentReport.report_type }}</p>
          </div>
        </div>

        <div class="report-body">
          <h3 class="report-title">{{ store.currentReport.title }}</h3>
          <label>COMPTE-RENDU / OBSERVATIONS</label>
          <div class="text-content">
            {{ store.currentReport.content }}
          </div>
        </div>

        <div class="document-footer">
          <div class="signature-space">
            <p>Signature et cachet du médecin</p>
            <div class="signature-line"></div>
          </div>
        </div>
      </div>

      <div v-else-if="store.isLoading" class="loading">Chargement...</div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMedicalReportStore } from '@/stores/medicalreportStore'

const route = useRoute()
const router = useRouter()
const store = useMedicalReportStore()

onMounted(async () => {
  const reportId = route.params.id
  if (reportId) await store.fetchMedicalReportById(reportId)
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

const handlePrint = () => {
  window.print() // Lance la boîte de dialogue d'impression du navigateur
}

const handleDownload = async () => {
  try {
    await store.downloadMedicalReport(store.currentReport.id)
  } catch (err) {
    alert("Erreur de téléchargement")
  }
}
</script>

<style scoped>
.view-report-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px;
}

/* Header UI */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-left { display: flex; align-items: center; gap: 15px; }

.btn-back {
  width: 40px; height: 40px; border-radius: 10px; border: 1px solid #ddd;
  background: white; cursor: pointer;
}

.btn-print {
  background: #0040d0; color: white; border: none;
  padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600;
  margin-right: 10px;
}

/* Style du Document Imprimable */
.printable-content {
  background: white;
  padding: 60px;
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(0,0,0,0.1);
  min-height: 800px;
  color: #1a1a1a;
}

.document-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.clinic-info h1 { margin: 0; color: #0040d0; font-size: 24px; }
.doc-meta { text-align: right; font-size: 14px; }

.separator { border: 0; border-top: 2px solid #333; margin: 20px 0; }

.patient-doctor-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
.info-block label { font-size: 11px; font-weight: bold; color: #666; display: block; margin-bottom: 5px; }
.val-large { font-size: 18px; font-weight: bold; margin: 0; }
.text-right { text-align: right; }

.report-title { text-align: center; text-decoration: underline; margin-bottom: 30px; font-size: 20px; }
.text-content {
  margin-top: 15px;
  line-height: 1.6;
  white-space: pre-wrap;
  font-size: 15px;
  text-align: justify;
}

.document-footer { margin-top: 80px; display: flex; justify-content: flex-end; }
.signature-space { width: 250px; text-align: center; }
.signature-line { border-top: 1px solid #000; margin-top: 50px; }

/* LOGIQUE D'IMPRESSION */
@media print {
  /* Cache tout sauf la zone printable-content */
  .no-print, .btn-back, .page-header, aside, nav, .btn-print, .btn-download {
    display: none !important;
  }

  .view-report-wrapper { margin: 0; padding: 0; max-width: 100%; }
  
  .printable-content {
    box-shadow: none;
    padding: 0;
    margin: 0;
    border: none;
  }

  body { background: white; }
  
  @page {
    margin: 2cm;
  }
}
</style>