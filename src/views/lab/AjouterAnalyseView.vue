<template>
  <LabLayout>
    <div class="page-wrapper">
      <div class="form-card">
        <div v-if="labStore.isLoading" class="loader-overlay">
          <div class="spinner-container">
            <div class="spinner"></div>
            <div class="spinner-inner"></div>
          </div>
          <span class="loader-text">Génération du rapport Word en cours...</span>
        </div>

        <header class="form-header">
          <div class="header-content">
            <div class="icon-box">
              <span class="emoji">🧪</span>
            </div>
            <div>
              <h2 class="title">Saisie des Résultats</h2>
              <p class="subtitle">Validation finale et édition du rapport biomédical</p>
            </div>
          </div>
        </header>

        <form @submit.prevent="submitForm" class="styled-form">
          
          <section class="form-section">
            <div class="section-header">
              <span class="section-number">01</span>
              <h3 class="section-title">Sélection de l'analyse</h3>
            </div>
            
            <div class="search-wrapper" v-if="!selectedRequest">
              <div class="search-box">
                <span class="search-icon">🔍</span>
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  placeholder="Rechercher un patient ou un examen (ex: Hyna)..." 
                  class="search-input"
                />
              </div>
              
              <transition name="fade">
                <div v-if="filteredRequests.length > 0 && searchQuery.length >= 2" class="search-results">
                  <div 
                    v-for="req in filteredRequests" 
                    :key="req.id" 
                    @click="onSelectRequest(req)"
                    class="result-item"
                  >
                    <div class="patient-avatar">
                      {{ req.patient?.user?.first_name?.charAt(0) }}{{ req.patient?.user?.last_name?.charAt(0) }}
                    </div>
                    <div class="patient-info">
                      <span class="patient-name">
                        {{ req.patient?.user?.first_name }} {{ req.patient?.user?.last_name }}
                      </span>
                      <span class="exam-type">{{ req.name }}</span>
                    </div>
                    <div class="item-meta">
                      <span class="status-pill completed">Prêt</span>
                      <span class="arrow">→</span>
                    </div>
                  </div>
                </div>
              </transition>
            </div>

            <transition name="bounce">
              <div v-if="selectedRequest" class="selected-banner">
                <div class="banner-info">
                  <div class="success-icon">✓</div>
                  <div class="text-content">
                    <p class="patient-label">Dossier sélectionné</p>
                    <h4 class="patient-name-val">
                      {{ selectedRequest.patient?.user?.first_name }} {{ selectedRequest.patient?.user?.last_name }}
                    </h4>
                  </div>
                  <div class="exam-tag">
                    <span class="tag-label">Examen :</span>
                    <span class="tag-value">{{ selectedRequest.name }}</span>
                  </div>
                </div>
                <button type="button" @click="resetSelection" class="btn-change">Modifier</button>
              </div>
            </transition>
          </section>

          <transition name="slide-up">
            <section class="form-section" v-if="selectedRequest">
              <div class="section-header">
                <span class="section-number">02</span>
                <h3 class="section-title">Paramètres techniques</h3>
              </div>
              <div class="grid-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="input-group">
                  <label>Type d'analyse</label>
                  <input type="text" :value="selectedRequest.name" disabled class="input-field readonly" />
                </div>
                <div class="input-group">
                  <label>Appareil d'analyse</label>
                  <input type="text" v-model="form.device" placeholder="ex: Mindray BC-5300" class="input-field" required />
                </div>
              </div>
            </section>
          </transition>

          <transition name="slide-up">
            <section class="form-section highlight-section" v-if="selectedRequest">
              <div class="section-header">
                <div class="title-group">
                  <span class="section-number">03</span>
                  <h3 class="section-title">Valeurs mesurées</h3>
                </div>
                <button type="button" @click="addResultRow" class="btn-add-param">
                  <span class="plus">+</span> Ajouter un paramètre
                </button>
              </div>
              
              <div class="table-container">
                <div class="table-head">
                  <span class="head-cell param">Paramètre</span>
                  <span class="head-cell val">Valeur</span>
                  <span class="head-cell unit">Unité</span>
                  <span class="head-cell norm">Normes / Référence</span>
                  <span class="head-cell action"></span>
                </div>

                <div class="table-body">
                  <div v-for="(row, index) in form.results" :key="index" class="result-row">
                    <div class="cell param">
                      <input type="text" v-model="row.parameter" placeholder="Ex: Glycémie" required />
                    </div>
                    <div class="cell val">
                      <input type="text" v-model="row.value" placeholder="1.10" required />
                    </div>
                    <div class="cell unit">
                      <input type="text" v-model="row.unit" placeholder="g/L" />
                    </div>
                    <div class="cell norm">
                      <input type="text" v-model="row.reference" placeholder="0.70 - 1.10" />
                    </div>
                    <div class="cell action">
                      <button type="button" @click="removeResultRow(index)" class="btn-delete" title="Supprimer">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="comment-section">
                <label style="display: block; margin-top: 20px; font-weight: 600;">Conclusion / Commentaires</label>
                <textarea v-model="form.comments" rows="3" placeholder="Saisir vos observations ici..." class="text-area"></textarea>
              </div>
            </section>
          </transition>

          <footer class="form-footer" v-if="selectedRequest">
            <button type="submit" class="btn-submit" :disabled="labStore.isLoading">
              <span class="btn-icon">📄</span>
              {{ labStore.isLoading ? 'Traitement...' : 'Générer le rapport officiel' }}
            </button>
          </footer>
        </form>
      </div>
    </div>
  </LabLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLabStore } from '@/stores/labStore'
import LabLayout from '@/layouts/LabLayout.vue'

const router = useRouter()
const labStore = useLabStore()

const searchQuery = ref('')
const selectedRequest = ref(null)

const form = ref({
  device: '',
  comments: '',
  results: [{ parameter: '', value: '', unit: '', reference: '' }]
})

onMounted(async () => {
  await labStore.listReadyAnalyses()
})

const filteredRequests = computed(() => {
  if (searchQuery.value.length < 2) return []
  const q = searchQuery.value.toLowerCase()
  return labStore.readyAnalyses.filter(req => {
    const fullName = `${req.patient?.user?.first_name} ${req.patient?.user?.last_name}`.toLowerCase()
    return fullName.includes(q) || req.name.toLowerCase().includes(q)
  })
})

// LOG 1 : Voir les données reçues au moment de la sélection
const onSelectRequest = (request) => {
  console.log("--- ANALYSE SÉLECTIONNÉE ---");
  console.log("ID Analyse (Parente):", request.id);
  console.log("ID Patient lié:", request.patient_id);
  console.log("Objet complet reçu:", request);
  
  selectedRequest.value = request
  searchQuery.value = ''
  if (form.value.results.length > 0) {
    form.value.results[0].parameter = request.name
  }
}

const resetSelection = () => {
  selectedRequest.value = null
  form.value.device = ''
  form.value.comments = ''
  form.value.results = [{ parameter: '', value: '', unit: '', reference: '' }]
}

const addResultRow = () => {
  form.value.results.push({ parameter: '', value: '', unit: '', reference: '' })
}

const removeResultRow = (index) => {
  if (form.value.results.length > 1) form.value.results.splice(index, 1)
}

// LOG 2 : Voir les données envoyées au Backend
const submitForm = async () => {
  if (!selectedRequest.value) return
 
  const payload = {
    patient_id: selectedRequest.value.patient_id, 
    lab_id: selectedRequest.value.laboratory_id || 1, 
    analyse_type: selectedRequest.value.name,
    patient_name: `${selectedRequest.value.patient?.user?.first_name} ${selectedRequest.value.patient?.user?.last_name}`,
    device: form.value.device,
    result_data_json: JSON.stringify(form.value.results),
    comments: form.value.comments,
    status: 'completed' 
  }

  console.log("--- ENVOI AU BACKEND ---");
  console.log("URL de destination: /api/lab/requests/" + selectedRequest.value.id + "/results");
  console.log("Payload envoyé:", payload);

  const success = await labStore.uploadLabResults(selectedRequest.value.id, payload)

  if (success) {
    console.log("Succès : Résultat enregistré.");
    await router.push({ name: 'LaborantinDashboard' })
  } else {LaborantinDashboard
    console.error("Erreur : L'enregistrement a échoué.");
  }
}
</script>

<style scoped>
/* Conserver tes styles d'origine ils sont excellents */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.page-wrapper {
  font-family: 'Inter', sans-serif;
  background-color: #f8fafc;
  min-height: 100vh;
  padding: 40px 20px;
  display: flex;
  justify-content: center;
}

/* ... Reste de ton CSS ... */
/* (Je n'ai pas modifié ton CSS car il est déjà très bien structuré) */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.page-wrapper {
  font-family: 'Inter', sans-serif;
  background-color: #f8fafc;
  min-height: 100vh;
  padding: 40px 20px;
  display: flex;
  justify-content: center;
}

.form-card {
  background: #ffffff;
  max-width: 1000px;
  width: 100%;
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  position: relative;
  border: 1px solid #eef2f6;
}

/* Header */
.form-header {
  background: linear-gradient(135deg, #0047e1 0%, #0035a9 100%);
  padding: 40px;
  color: white;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.icon-box {
  background: rgba(255, 255, 255, 0.15);
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  backdrop-filter: blur(10px);
}

.title { font-size: 26px; font-weight: 700; margin: 0; letter-spacing: -0.5px; }
.subtitle { opacity: 0.85; margin: 6px 0 0 0; font-size: 15px; }

/* Sections */
.styled-form { padding: 40px; }
.form-section { margin-bottom: 48px; }

.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.section-number {
  background: #f1f5f9;
  color: #64748b;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

/* Recherche */
.search-box {
  position: relative;
  margin-bottom: 10px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 2px solid #f1f5f9;
  border-radius: 14px;
  font-size: 16px;
  transition: all 0.3s;
}

.search-input:focus {
  border-color: #0047e1;
  background: white;
  box-shadow: 0 0 0 4px rgba(0, 71, 225, 0.1);
  outline: none;
}

.search-results {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 15px 30px rgba(0,0,0,0.08);
  max-height: 280px;
  overflow-y: auto;
  position: absolute;
  width: calc(100% - 80px);
  z-index: 100;
}

.result-item {
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.result-item:hover { background: #f8fafc; }

.patient-avatar {
  width: 44px;
  height: 44px;
  background: #e0e7ff;
  color: #4338ca;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.patient-name { display: block; font-weight: 600; color: #1e293b; }
.exam-type { font-size: 13px; color: #64748b; }

/* Banner Sélectionnée */
.selected-banner {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 20px 24px;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.banner-info { display: flex; align-items: center; gap: 20px; }

.success-icon {
  width: 28px;
  height: 28px;
  background: #22c55e;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.patient-label { font-size: 12px; color: #15803d; margin: 0; font-weight: 600; text-transform: uppercase; }
.patient-name-val { font-size: 18px; font-weight: 700; color: #166534; margin: 0; }

.exam-tag {
  background: rgba(255,255,255,0.6);
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid #dcfce7;
}

.tag-label { font-size: 13px; color: #15803d; margin-right: 6px; }
.tag-value { font-weight: 700; color: #166534; }

.btn-change {
  background: white;
  border: 1px solid #dcfce7;
  padding: 8px 16px;
  border-radius: 10px;
  color: #15803d;
  font-weight: 600;
  cursor: pointer;
}

/* Grille de résultats (Design comme ta capture) */
.highlight-section {
  background: #fcfcfd;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  padding: 30px;
}

.table-head {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1fr 1.5fr 40px;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 16px;
}

.head-cell {
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.result-row {
  display: grid;
  grid-template-columns: 2fr 1.2fr 1fr 1.5fr 40px;
  gap: 12px;
  margin-bottom: 12px;
}

.result-row input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  font-size: 14px;
  transition: all 0.2s;
}

.result-row input:focus {
  border-color: #0047e1;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 71, 225, 0.05);
}

.btn-delete {
  background: #fff1f2;
  color: #e11d48;
  border: none;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-delete:hover { background: #ffe4e6; transform: scale(1.05); }

/* Footer & Buttons */
.form-footer { margin-top: 20px; }

.btn-submit {
  width: 100%;
  background: #0047e1;
  color: white;
  padding: 20px;
  border: none;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s;
}

.btn-submit:hover {
  background: #0037b0;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 71, 225, 0.2);
}

.btn-add-param {
  background: #e0e7ff;
  color: #4338ca;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-add-param:hover { background: #d1d5ff; }

/* Loader */
.loader-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spinner-container { position: relative; width: 60px; height: 60px; margin-bottom: 20px; }
.spinner {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4px solid #f1f5f9;
  border-top: 4px solid #0047e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* Inputs généraux */
.input-field {
  width: 100%;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.readonly { background: #f1f5f9; color: #64748b; cursor: not-allowed; font-weight: 600; }

.text-area {
  width: 100%;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  margin-top: 10px;
  font-family: inherit;
  resize: none;
}

.input-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
}

/* Animations */
.slide-up-enter-active { transition: all 0.4s ease-out; }
.slide-up-enter-from { opacity: 0; transform: translateY(20px); }

.bounce-enter-active { animation: bounce-in 0.5s; }
@keyframes bounce-in {
  0% { transform: scale(0.9); opacity: 0; }
  60% { transform: scale(1.02); }
  100% { transform: scale(1); opacity: 1; }
}
</style>