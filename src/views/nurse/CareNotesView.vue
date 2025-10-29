<template>
  <NurseLayout>
    <div class="care-notes-container">
      <h2 class="section-title">Observations infirmières</h2>

      <form @submit.prevent="submitNote" class="note-form">
        <textarea
          v-model="note"
          placeholder="Ajouter une observation clinique..."
          rows="5"
          required
        ></textarea>
        <div class="form-actions">
          <button type="submit">Enregistrer</button>
        </div>
      </form>

      <section class="notes-history">
        <h3>Historique des observations</h3>
        <ul class="notes-list">
          <li v-for="(item, index) in history" :key="index">
            <p class="note-text">{{ item.text }}</p>
            <span class="note-meta">🕒 {{ item.date }}</span>
          </li>
        </ul>
      </section>
    </div>
  </NurseLayout>
</template>

<script setup>
import { ref } from 'vue'
import NurseLayout from '@/layouts/NurseLayout.vue'

const note = ref('')

const history = ref([
  {
    text: 'Patient A003 présente une fatigue persistante et tachycardie modérée.',
    date: '2025-07-15 08:40',
  },
  {
    text: 'Suivi post-transfusion P005 normal, tension stable.',
    date: '2025-07-14 17:12',
  },
])

function submitNote() {
  if (note.value.trim()) {
    history.value.unshift({
      text: note.value,
      date: new Date().toLocaleString(),
    })
    note.value = ''
  }
}
</script>

<style scoped>
.care-notes-container {
  padding: 30px;
  background-color: #f2f7fc;
}

.section-title {
  font-size: 22px;
  color: #002580;
  margin-bottom: 20px;
}

.note-form {
  background-color: white;
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 6px;
  margin-bottom: 30px;
}

textarea {
  width: 100%;
  padding: 10px;
  font-size: 15px;
  border: 1px solid #ccc;
  border-radius: 6px;
  resize: vertical;
}

.form-actions {
  margin-top: 15px;
  text-align: right;
}

button {
  padding: 10px 20px;
  background-color: #002580;
  color: white;
  border: none;
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
}

button:hover {
  background-color: #0044aa;
}

.notes-history h3 {
  font-size: 18px;
  color: #003366;
  margin-bottom: 15px;
}

.notes-list {
  list-style: none;
  padding: 0;
}

.notes-list li {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 12px;
}

.note-text {
  font-size: 14px;
  margin-bottom: 8px;
}

.note-meta {
  font-size: 12px;
  color: #666;
}
</style>
