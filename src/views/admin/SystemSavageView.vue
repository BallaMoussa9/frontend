<template>
  <AdminLayout>
    <div class="sauvegarde-page">
      <h2 class="page-title">📦 Sauvegarde du système</h2>

      <button @click="lancerSauvegarde" class="btn-sauvegarde">
        📁 Lancer une sauvegarde
      </button>

      <div v-if="loading" class="loading">⏳ Sauvegarde en cours...</div>

      <div class="liste-sauvegardes" v-if="sauvegardes.length">
        <h3>📜 Sauvegardes disponibles</h3>
        <ul>
          <li v-for="(file, index) in sauvegardes" :key="index">
            <span class="file-info">{{ file.name }} - {{ file.date }}</span>
            <div class="file-actions">
              <button @click="telecharger(file.name)" title="Télécharger">⬇️</button>
              <button @click="supprimer(file.name)" title="Supprimer">🗑️</button>
            </div>
          </li>
        </ul>
      </div>

      <p v-else class="empty">Aucune sauvegarde disponible.</p>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { ref, onMounted } from 'vue'
import axios from 'axios'

const sauvegardes = ref([])
const loading = ref(false)

// Lancer une nouvelle sauvegarde
const lancerSauvegarde = async () => {
  try {
    loading.value = true
    await axios.post('/api/sauvegardes')
    await fetchSauvegardes()
    alert('✅ Sauvegarde terminée avec succès.')
  } catch (error) {
    alert('❌ Erreur lors de la sauvegarde.')
  } finally {
    loading.value = false
  }
}

// Récupérer la liste des fichiers de sauvegarde
const fetchSauvegardes = async () => {
  try {
    const { data } = await axios.get('/api/sauvegardes')
    sauvegardes.value = data
  } catch (e) {
    console.error('Erreur lors de la récupération des sauvegardes')
  }
}

// Télécharger un fichier
const telecharger = (file) => {
  window.open(`/api/sauvegardes/${file}/download`, '_blank')
}

// Supprimer un fichier
const supprimer = async (file) => {
  if (!confirm(`Supprimer la sauvegarde : ${file} ?`)) return
  try {
    await axios.delete(`/api/sauvegardes/${file}`)
    await fetchSauvegardes()
  } catch (e) {
    alert("Erreur lors de la suppression.")
  }
}

onMounted(fetchSauvegardes)
</script>

<style scoped>
.sauvegarde-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px 20px;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.page-title {
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.btn-sauvegarde {
  background: #0040d0;
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
}

.btn-sauvegarde:hover {
  background: #0035b0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 64, 208, 0.2);
}

.loading {
  color: #2563eb;
  font-style: italic;
  font-weight: 600;
  padding: 16px;
  background: #eff6ff;
  border-radius: 10px;
  border: 1px solid #dbeafe;
  text-align: center;
}

.liste-sauvegardes {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  padding: 25px;
}

.liste-sauvegardes h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 20px 0;
}

.liste-sauvegardes ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.liste-sauvegardes li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  padding: 16px 20px;
  border-radius: 10px;
  margin-bottom: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.liste-sauvegardes li:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.liste-sauvegardes li:last-child {
  margin-bottom: 0;
}

.file-info {
  flex: 1;
  font-weight: 500;
  color: #1e293b;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.liste-sauvegardes button {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.liste-sauvegardes button:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.liste-sauvegardes button:first-child:hover {
  color: #0040d0;
  border-color: #0040d0;
}

.liste-sauvegardes button:last-child:hover {
  color: #ef4444;
  border-color: #ef4444;
  background: #fef2f2;
}

.empty {
  font-style: italic;
  color: #94a3b8;
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  font-size: 16px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .sauvegarde-page {
    padding: 20px 15px;
    gap: 20px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .btn-sauvegarde {
    padding: 12px 20px;
    font-size: 14px;
  }
  
  .liste-sauvegardes {
    padding: 20px;
  }
  
  .liste-sauvegardes li {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .file-actions {
    align-self: flex-end;
  }
}
</style>
