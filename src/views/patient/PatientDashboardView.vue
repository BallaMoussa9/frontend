<template>
  <SidebarLayout>
    <div class="dashboard-grid">
      <!-- Bloc Identité et profil santé -->
      <section class="card">
        <h2>Profil Santé</h2>
        <p><strong>Nom :</strong> {{ user.first_name }} {{ user.last_name }}</p>
        <p><strong>Âge :</strong> {{ profile.age }} ans</p>
        <p><strong>Sexe :</strong> {{ profile.gender }}</p>
        <p><strong>Groupe sanguin :</strong> {{ profile.blood }}</p>
        <p><strong>Allergies :</strong> {{ profile.allergies }}</p>
        <p><strong>Antécédents :</strong> {{ profile.conditions }}</p>
      </section>

      <!-- Bloc Données Vitales -->
      <section class="card">
        <h2>Données Vitales</h2>
        <ul>
          <li>💓 Tension artérielle : {{ vitals.bloodPressure }}</li>
          <li>❤️ Pouls : {{ vitals.heartRate }} bpm</li>
          <li>🌡 Température : {{ vitals.temperature }} °C</li>
        </ul>
      </section>

      <!-- Bloc Médicaments en cours -->
      <section class="card">
        <h2>Médicaments en cours</h2>
        <ul>
          <li v-for="med in medications" :key="med">{{ med }}</li>
        </ul>
      </section>

      <!-- Bloc Documents médicaux -->
      <section class="card">
        <h2>Documents Médicaux</h2>
        <ul>
          <li v-for="doc in documents" :key="doc.id">
            📁 <a :href="doc.link" target="_blank">{{ doc.name }}</a>
          </li>
        </ul>
      </section>

      <!-- Bloc Notes Cliniques -->
      <section class="card">
        <h2>Notes Cliniques</h2>
        <p>{{ clinicalNotes }}</p>
      </section>

      <!-- Bloc Messages / Alertes -->
      <section class="card alert">
        <h2>Alertes & Messages</h2>
        <p>Aucune alerte active</p>
        <p>📬 Messagerie disponible dans le module "Messages"</p>
      </section>
    </div>
  </SidebarLayout>
</template>

<script setup>
import SidebarLayout from '@/layouts/SidebarLayout.vue'
import { useAuthStore } from '@/stores/authStores'

const auth = useAuthStore()
const user = auth.user || {}

const profile = {
  age: 29,
  gender: 'Masculin',
  blood: 'O+',
  allergies: 'Azelastine',
  conditions: 'Asthme, Sinusite chronique',
}

const vitals = {
  bloodPressure: '120/80',
  heartRate: 72,
  temperature: 36.8,
}

const medications = [
  'Desloratadine',
  'Ketorolac',
  'Azelastine',
]

const documents = [
  { id: 1, name: 'Radiographie Thoracique', link: '/docs/xray.pdf' },
  { id: 2, name: 'Résultat IgE', link: '/docs/ige.pdf' },
  { id: 3, name: 'CT Scan', link: '/docs/ct.pdf' },
  { id: 4, name: 'Endoscopie Digestive', link: '/docs/endo.pdf' },
]

const clinicalNotes = `Suivi post-consultation en cours. Réponse favorable au traitement Azelastine. Prochaine visite programmée dans 10 jours.`
</script>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  padding: 20px;
  font-size: 14px;
}

.card h2 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #002580;
}

.card.alert {
  background-color: #fff8f8;
  border: 1px solid #ffc5c5;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  margin-bottom: 8px;
}

a {
  color: #002580;
  text-decoration: underline;
}
</style>
