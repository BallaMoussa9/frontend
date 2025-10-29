<template>
  <NurseLayout>
    <div class="nurse-tasks">
      <h2>Tâches du jour</h2>
      <ul class="task-list">
        <li v-for="task in tasks" :key="task.id" class="task">
          <div>
            <strong>{{ task.patient }}</strong> – {{ task.description }}
          </div>
          <div class="meta">
            <span>Heure : {{ task.time }}</span>
            <span>Status : <strong>{{ task.status }}</strong></span>
          </div>
        </li>
      </ul>
    </div>
  </NurseLayout>
</template>

<script setup>
import NurseLayout from '@/layouts/NurseLayout.vue'

const tasks = [
  { id: 1, patient: 'Fatou T.', description: 'Changer le pansement', time: '08:30', status: 'En cours' },
  { id: 2, patient: 'Moussa K.', description: 'Injection d’insuline', time: '10:00', status: 'À faire' },
  { id: 3, patient: 'Bintou S.', description: 'Prise de température', time: '11:00', status: 'Terminé' },
]
</script>

<style scoped>
.nurse-tasks {
  padding: 24px;
  background-color: #f9f9fb;
  border-radius: 10px;
}

.task-list {
  list-style: none;
  padding: 0;
}

.task {
  background: white;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.meta {
  margin-top: 8px;
  font-size: 14px;
  color: #666;
  display: flex;
  gap: 20px;
}
</style>
