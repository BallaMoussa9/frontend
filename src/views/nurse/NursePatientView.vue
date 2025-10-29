<template>
  <NurseLayout>
    <div class="nurse-patients">
      <h2>Liste des patients</h2>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Sexe</th>
            <th>Âge</th>
            <th>Chambre</th>
            <th>Dernier soin</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="patient in patients" :key="patient.id">
            <td>{{ patient.name }}</td>
            <td>{{ patient.gender }}</td>
            <td>{{ patient.age }}</td>
            <td>{{ patient.room }}</td>
            <td>{{ patient.lastCare }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </NurseLayout>
</template>

<script setup>
import NurseLayout from '@/layouts/NurseLayout.vue'

const patients = [
  { id: 1, name: 'Fatou T.', gender: 'F', age: 28, room: 'A101', lastCare: 'Pansement 08:30' },
  { id: 2, name: 'Moussa K.', gender: 'M', age: 34, room: 'B204', lastCare: 'Injection 10:00' },
  { id: 3, name: 'Bintou S.', gender: 'F', age: 22, room: 'C102', lastCare: 'Température 11:00' },
]
</script>

<style scoped>
.nurse-patients {
  padding: 24px;
  background: #f7f9fc;
  border-radius: 10px;
}

h2 {
  margin-bottom: 16px;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

th, td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f0f4f8;
  font-weight: 600;
}
</style>
