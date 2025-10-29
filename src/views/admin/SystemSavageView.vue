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
            {{ file.name }} - {{ file.date }}
            <button @click="telecharger(file.name)">⬇️</button>
            <button @click="supprimer(file.name)">🗑️</button>
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
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-title {
  font-size: 22px;
  font-weight: bold;
  color: #002580;
}

.btn-sauvegarde {
  background-color: #0040d0;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.liste-sauvegardes ul {
  list-style: none;
  padding: 0;
}

.liste-sauvegardes li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #eef1f7;
  padding: 12px 20px;
  border-radius: 6px;
  margin-bottom: 10px;
}

.liste-sauvegardes button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  margin-left: 12px;
}

.loading {
  color: #0040d0;
  font-style: italic;
}

.empty {
  font-style: italic;
  color: gray;
}
</style>
