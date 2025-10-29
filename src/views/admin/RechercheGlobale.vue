<template>
  <AdminLayout>
    <div class="recherche-globale">
      <h2>Recherche globale</h2>

      <input
        v-model="query"
        type="text"
        placeholder="Tapez un nom, email, ou service..."
        class="search-input"
      />

      <div v-if="results.length" class="results">
        <div class="result-card" v-for="res in results" :key="res.id">
          <img :src="res.photo" alt="avatar" />
          <div>
            <p><strong>{{ res.name }}</strong></p>
            <p>{{ res.email }}</p>
            <p>Rôle : {{ res.role }}</p>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

const query = ref('')
const all = ref([
  {
    id: 1,
    name: 'Moussa Keita',
    email: 'moussa@chu.ml',
    role: 'doctor',
    photo: 'https://via.placeholder.com/50'
  },
  {
    id: 2,
    name: 'Fatou Diallo',
    email: 'fatou@gmail.com',
    role: 'patient',
    photo: 'https://via.placeholder.com/50'
  },
])
const results = computed(() =>
  all.value.filter((item) =>
    item.name.toLowerCase().includes(query.value.toLowerCase()) ||
    item.email.toLowerCase().includes(query.value.toLowerCase()) ||
    item.role.toLowerCase().includes(query.value.toLowerCase())
  )
)
</script>

<style scoped>
.recherche-globale {
  max-width: 800px;
  margin: auto;
  padding: 32px;
}
.search-input {
  width: 100%;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
}
.results {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.result-card {
  display: flex;
  gap: 16px;
  background: white;
  padding: 12px;
  border-radius: 8px;
  align-items: center;
  box-shadow: 0 0 6px rgba(0,0,0,0.05);
}
.result-card img {
  width: 50px;
  height: 50px;
  border-radius: 100px;
}
</style>
