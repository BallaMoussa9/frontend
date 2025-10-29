<!-- src/pages/admin/GererServices.vue -->
<template>
  <AdminLayout>
    <div class="gerer-services-page">
      <h2 class="page-title">Gérer les Services</h2>

      <div class="service-grid">
        <div
          class="service-card"
          v-for="service in services"
          :key="service.id"
          @click="goToService(service.route)"
        >
          <div class="icon">{{ service.icon }}</div>
          <h3>{{ service.label }}</h3>
          <p>{{ service.description }}</p>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { useRouter } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'

const router = useRouter()

const goToService = (route) => {
  router.push({name:route})
}

const services = [
  {
    id: 1,
    icon: '👨‍⚕️',
    label: 'Médecins',
    route: 'Doctor',
    description: 'Gérer les comptes et spécialités des médecins',
  },
  {
    id: 2,
    icon: '💉',
    label: 'Infirmiers',
    route: 'Nurse',
    description: 'Gérer les profils infirmiers et leurs affectations',
  },
  {
    id: 3,
    icon: '🧪',
    label: 'Laboratoire',
    route: 'Laboratoire',
    description: 'Gérer les techniciens',
  },
  {
    id: 4,
    icon: '📂',
    label: 'Dossiers médicaux',
    route: 'MedicalRecord',
    description: 'Consulter et valider les dossiers des patients',
  },
  {
    id: 5,
    icon: '📊',
    label: 'Rapports médicaux',
    route: 'MedicalReport',
    description: 'Suivre les rapports de diagnostic et d’activités',
  },
  {
    id: 6,
    icon: '🏥',
    label: 'Départements',
    route: 'Department',
    description: 'Créer, modifier ou supprimer un département',
  },
  {
    id: 7,
    icon: '🆘',
    label: 'Alertes en temps réel',
    route: 'Urgence',
    description: 'Tableau de bord des urgences en direct',
  },
  {
    id: 8,
    icon: '👥',
    label: 'Patients',
    route: 'Patient',
    description: 'Gestion des profils, RDV et antécédents',
  },
]
</script>

<style scoped>
.gerer-services-page {
  padding: 32px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
  color: #002580;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.service-card {
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s ease;
  border: 1px solid #ddd;
}

.service-card:hover {
  transform: translateY(-4px);
  border-color: #0040d0;
}

.icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.service-card h3 {
  font-size: 18px;
  margin-bottom: 8px;
  color: #0040d0;
}

.service-card p {
  font-size: 14px;
  color: #555;
}
</style>
