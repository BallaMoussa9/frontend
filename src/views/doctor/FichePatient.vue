<template>
  <MedecinLayout>
    <div class="fiche-patient">
      <h1 class="title">Dossier patient : {{ patient.name }}</h1>

      <!-- Infos principales -->
      <section class="basic-info">
        <div><strong>Sexe :</strong> {{ patient.gender }}</div>
        <div><strong>Âge :</strong> {{ patient.age }} ans</div>
        <div><strong>Groupe sanguin :</strong> {{ patient.blood }}</div>
        <div><strong>Antécédents :</strong> {{ patient.history }}</div>
        <div><strong>Allergies :</strong> {{ patient.allergies.join(', ') }}</div>
      </section>

      <!-- Constantes vitales -->
      <section class="vital-signs">
        <h2>Constantes Vitales</h2>
        <div class="metrics">
          <div class="metric">
            <label>Tension</label>
            <span>{{ patient.vitals.tension }}</span>
          </div>
          <div class="metric">
            <label>Cardiaque</label>
            <span>{{ patient.vitals.heartRate }} bpm</span>
          </div>
          <div class="metric">
            <label>Température</label>
            <span>{{ patient.vitals.temperature }} °C</span>
          </div>
          <div class="metric">
            <label>Oxygène</label>
            <span>{{ patient.vitals.oxygen }} %</span>
          </div>
        </div>
      </section>

      <!-- Diagnostic -->
      <section class="diagnostic">
        <h2>Dernier diagnostic</h2>
        <p><strong>Code :</strong> {{ patient.diagnosis.code }}</p>
        <p><strong>Pathologie :</strong> {{ patient.diagnosis.label }}</p>
        <p><strong>Date :</strong> {{ patient.diagnosis.date }}</p>
        <h3>Médicaments prescrits</h3>
        <ul>
          <li v-for="med in patient.diagnosis.medications" :key="med">{{ med }}</li>
        </ul>
      </section>

      <!-- Historique médical -->
      <section class="medical-history">
        <h2>Historique médical</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Motif</th>
              <th>Type</th>
              <th>Médecin</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in patient.records" :key="record.id">
              <td>{{ record.date }}</td>
              <td>{{ record.reason }}</td>
              <td>{{ record.type }}</td>
              <td>{{ record.doctor }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </MedecinLayout>
</template>

<script setup>
import MedecinLayout from '@/layouts/MedecinLayout.vue'

const patient = {
  id: 1,
  name: 'Leslie Alexander',
  gender: 'Femme',
  age: 25,
  blood: 'O+',
  history: 'Diabète, Asthme',
  allergies: ['Pénicilline', 'Pollen'],
  vitals: {
    tension: '110/70',
    heartRate: '78',
    temperature: '36.8',
    oxygen: '97',
  },
  diagnosis: {
    code: 'D04.8',
    label: 'Diabète Mellitus',
    date: '12 juin 2024',
    medications: ['Metformin', 'Insulin', 'Glipizide'],
  },
  records: [
    { id: 1, date: '01 avril 2024', reason: 'Check-up', type: 'Consultation', doctor: 'Dr. Sanogo' },
    { id: 2, date: '15 mai 2024', reason: 'Fièvre', type: 'Visite urgente', doctor: 'Dr. Traoré' },
  ],
}
</script>

<style scoped>
.fiche-patient {
  padding: 32px;
}

.title {
  font-size: 26px;
  color: #002580;
  margin-bottom: 24px;
}

.basic-info div {
  margin-bottom: 8px;
  font-size: 15px;
}

.vital-signs .metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 12px;
}
.metric {
  background: #eef3fb;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #d1d9e6;
}
.metric label {
  display: block;
  font-size: 13px;
  color: #333;
}
.metric span {
  font-weight: bold;
  font-size: 17px;
  color: #002580;
}

.diagnostic, .medical-history {
  margin-top: 32px;
}
.diagnostic h3 {
  margin-top: 12px;
}
.medical-history table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
}
.medical-history th, .medical-history td {
  border: 1px solid #ccc;
  padding: 8px;
}
.medical-history th {
  background-color: #f0f4ff;
}
</style>
