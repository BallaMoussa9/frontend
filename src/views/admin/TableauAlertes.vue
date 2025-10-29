<template>
  <AdminLayout>
    <div class="alertes-admin">
      <h2 class="page-title">Tableau des alertes SOS (temps réel)</h2>

      <div class="filters">
        <label for="filtre">Filtrer par statut :</label>
        <select v-model="selectedStatus" id="filtre">
          <option value="all">Toutes</option>
          <option value="en_cours">🟠 En cours</option>
          <option value="resolue">✅ Résolue</option>
          <option value="critique">🔴 Critique</option>
        </select>
      </div>

      <table class="alertes-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Région</th>
            <th>Patient</th>
            <th>Date</th>
            <th>Statut</th>
            <th>Urgence</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(alert, index) in filteredAlerts" :key="alert.id">
            <td>{{ index + 1 }}</td>
            <td>{{ alert.region }}</td>
            <td>{{ alert.patient }}</td>
            <td>{{ formatDate(alert.date) }}</td>
            <td>
              <span :class="statusClass(alert.status)">
                {{ statusLabel(alert.status) }}
              </span>
            </td>
            <td>
              <span :class="alert.urgence === 'élevée' ? 'urgente' : 'normale'">
                {{ alert.urgence }}
              </span>
            </td>
            <td>
              <button class="btn-action">👁️ Voir</button>
              <button class="btn-action">📁 Dossier</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { ref, computed } from 'vue'

// ⚠️ FAKE données simulées
const alertes = ref([
  {
    id: 1,
    region: 'Bamako',
    patient: 'Fatou Diallo',
    date: '2025-07-14T10:25:00',
    status: 'en_cours',
    urgence: 'élevée',
  },
  {
    id: 2,
    region: 'Kayes',
    patient: 'Moussa Keita',
    date: '2025-07-14T09:50:00',
    status: 'resolue',
    urgence: 'normale',
  },
  {
    id: 3,
    region: 'Sikasso',
    patient: 'Aminata Konaté',
    date: '2025-07-14T11:02:00',
    status: 'critique',
    urgence: 'élevée',
  },
])

const selectedStatus = ref('all')

const filteredAlerts = computed(() => {
  if (selectedStatus.value === 'all') return alertes.value
  return alertes.value.filter(a => a.status === selectedStatus.value)
})

const formatDate = (date) =>
  new Date(date).toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })

const statusClass = (status) => {
  return {
    en_cours: 'badge-orange',
    resolue: 'badge-green',
    critique: 'badge-red',
  }[status]
}

const statusLabel = (status) => {
  return {
    en_cours: '🟠 En cours',
    resolue: '✅ Résolue',
    critique: '🔴 Critique',
  }[status]
}
</script>

<style scoped>
.alertes-admin {
  padding: 32px;
}

.page-title {
  font-size: 24px;
  color: #002580;
  margin-bottom: 20px;
}

.filters {
  margin-bottom: 20px;
}

.filters select {
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.alertes-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.04);
}

.alertes-table th,
.alertes-table td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.alertes-table th {
  background-color: #f5f7fa;
  color: #333;
}

.badge-orange {
  color: orange;
  font-weight: bold;
}

.badge-green {
  color: green;
  font-weight: bold;
}

.badge-red {
  color: red;
  font-weight: bold;
}

.urgente {
  color: red;
  font-weight: bold;
}

.normale {
  color: gray;
  font-weight: bold;
}

.btn-action {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  margin-right: 8px;
}
</style>
