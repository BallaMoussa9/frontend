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

      <div class="table-container">
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
  background-color: #f8fafc;
}

.page-title {
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 25px;
}

.filters {
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.filters label {
  font-weight: 600;
  color: #64748b;
  font-size: 14px;
}

.filters select {
  padding: 10px 15px;
  font-size: 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 200px;
}

.filters select:focus {
  outline: none;
  border-color: #0040d0;
  box-shadow: 0 0 0 4px rgba(0, 64, 208, 0.05);
}

.table-container {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.alertes-table {
  width: 100%;
  border-collapse: collapse;
  margin: 0;
}

.alertes-table th,
.alertes-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}

.alertes-table th {
  background-color: #f8fafc;
  color: #64748b;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e2e8f0;
}

.alertes-table tbody tr:hover {
  background-color: #f8fafc;
}

.alertes-table td {
  color: #1e293b;
}

/* Badges de statut */
.badge-orange {
  background: #fef3c7;
  color: #92400e;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  display: inline-block;
}

.badge-green {
  background: #dcfce7;
  color: #15803d;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  display: inline-block;
}

.badge-red {
  background: #fef2f2;
  color: #b91c1c;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  display: inline-block;
}

/* Badges d'urgence */
.urgente {
  background: #fef2f2;
  color: #b91c1c;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  display: inline-block;
}

.normale {
  background: #f1f5f9;
  color: #64748b;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

/* Boutons d'action */
.btn-action {
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  margin-right: 8px;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.btn-action:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.btn-action:first-child:hover {
  color: #0040d0;
  border-color: #0040d0;
}

.btn-action:last-child:hover {
  color: #10b981;
  border-color: #10b981;
}

/* Responsive Design */
@media (max-width: 768px) {
  .alertes-admin {
    padding: 20px 15px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .filters {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .filters select {
    width: 100%;
    min-width: auto;
  }
  
  .alertes-table th,
  .alertes-table td {
    padding: 12px 8px;
    font-size: 13px;
  }
  
  .btn-action {
    padding: 4px 8px;
    font-size: 11px;
    margin-right: 4px;
  }
}
</style>
