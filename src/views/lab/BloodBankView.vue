<template>
  <NurseLayout>
    <div class="blood-bank-container">
      <h2 class="section-title">Gestion de la banque de sang</h2>

      <section class="stock-overview">
        <h3>Stock disponible par groupe</h3>
        <table class="blood-table">
          <thead>
            <tr>
              <th>Groupe</th>
              <th>Poches disponibles</th>
              <th>Dernière mise à jour</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(group, index) in bloodStock" :key="index">
              <td>{{ group.type }}</td>
              <td>{{ group.units }}</td>
              <td>{{ group.updatedAt }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="request-form-section">
        <h3>Demande de transfusion</h3>
        <form @submit.prevent="submitRequest" class="request-form">
          <div class="form-group">
            <label for="patientId">ID du patient</label>
            <input type="text" id="patientId" v-model="request.patientId" required />
          </div>

          <div class="form-group">
            <label for="group">Groupe sanguin</label>
            <select id="group" v-model="request.group" required>
              <option value="">--Sélectionner--</option>
              <option v-for="g in bloodGroups" :key="g" :value="g">{{ g }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="units">Nombre de poches</label>
            <input type="number" id="units" v-model="request.units" min="1" required />
          </div>

          <button type="submit">Envoyer la demande</button>
        </form>
      </section>
    </div>
  </NurseLayout>
</template>

<script setup>
import { ref } from 'vue'
import NurseLayout from '@/layouts/NurseLayout.vue'

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const bloodStock = ref([
  { type: 'A+', units: 6, updatedAt: '2025-07-14' },
  { type: 'O-', units: 3, updatedAt: '2025-07-13' },
  { type: 'B+', units: 4, updatedAt: '2025-07-12' },
])

const request = ref({
  patientId: '',
  group: '',
  units: 1,
})

function submitRequest() {
  console.log('Demande envoyée:', request.value)
  // 🔗 À connecter à ton endpoint Laravel : POST /api/transfusions
}
</script>

<style scoped>
.blood-bank-container {
  padding: 30px;
  background-color: #f2f7fc;
}

.section-title {
  font-size: 22px;
  color: #002580;
  margin-bottom: 20px;
}

.stock-overview,
.request-form-section {
  background-color: white;
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.blood-table {
  width: 100%;
  border-collapse: collapse;
}

.blood-table th,
.blood-table td {
  padding: 10px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  text-align: left;
}

.request-form .form-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.request-form label {
  font-weight: 600;
  margin-bottom: 6px;
  color: #003366;
}

.request-form input,
.request-form select {
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
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
</style>
