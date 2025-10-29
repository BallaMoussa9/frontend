<template>
  <LabLayout>
    <div class="demande-analyse">
      <h2>Demandes d’analyse en attente</h2>

      <table class="analysis-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Analyse demandée</th>
            <th>Description</th>
            <th>Date prévue</th>
            <th>Médecin</th>
            <th>Service</th>
            <th>Priorité</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in analysisRequests" :key="request.id">
            <td>{{ request.patient }}</td>
            <td>{{ request.test }}</td>
            <td>{{ request.description }}</td>
            <td>{{ request.date }}</td>
            <td>{{ request.doctor }}</td>
            <td>{{ request.service }}</td>
            <td>
              <span :class="['priority', request.priority]">
                {{ request.priority }}
              </span>
            </td>
            <td>
              <button class="btn-process">Traiter</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </LabLayout>
</template>

<script setup>
import LabLayout from '@/layouts/LabLayout.vue'

const analysisRequests = [
  {
    id: 1,
    patient: 'Fatou T.',
    test: 'Hémogramme complet',
    description: 'Fatigue persistante, suspicion d’anémie',
    date: '09/07/2025 10:30',
    doctor: 'Dr Konaté',
    service: 'Médecine générale - Hôpital Gabriel Touré',
    priority: 'Haute',
  },
  {
    id: 2,
    patient: 'Moussa K.',
    test: 'Glycémie à jeun',
    description: 'Surveillance diabète type 2',
    date: '09/07/2025 11:15',
    doctor: 'Dr Sidibé',
    service: 'Endocrinologie - Hôpital du Point G',
    priority: 'Normale',
  },
  {
    id: 3,
    patient: 'Aminata D.',
    test: 'TSH',
    description: 'Troubles hormonaux – fatigue, frilosité',
    date: '09/07/2025 13:00',
    doctor: 'Dr Keïta',
    service: 'Gynécologie - CHU Bamako',
    priority: 'Basse',
  },
]
</script>

<style scoped>
.demande-analyse {
  background: white;
  padding: 24px;
  border-radius: 10px;
  box-shadow: 0 0 6px rgba(0,0,0,0.05);
}

.analysis-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
  font-size: 14px;
}

.analysis-table th,
.analysis-table td {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  text-align: left;
}

.analysis-table th {
  background-color: #f9fafc;
  color: #333;
}

.priority {
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: bold;
  color: white;
}

.priority.Haute {
  background-color: #d9534f;
}
.priority.Normale {
  background-color: #f0ad4e;
}
.priority.Basse {
  background-color: #5bc0de;
}

.btn-process {
  background: #0040d0;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}

.btn-process:hover {
  background: #0030a0;
}
</style>
