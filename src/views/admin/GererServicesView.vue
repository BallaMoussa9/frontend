<template>
  <AdminLayout>
    <div class="gerer-services-page">
      <header class="page-header">
        <h2 class="page-title">Gérer les Services</h2>
        <p class="page-subtitle">Sélectionnez un département pour gérer les ressources et le personnel.</p>
      </header>

      <div class="service-grid">
        <div
          class="service-card"
          v-for="service in services"
          :key="service.id"
          @click="goToService(service.route)"
        >
          <div class="card-content">
            <div class="icon-box">{{ service.icon }}</div>
            <div class="text-content">
              <h3>{{ service.label }}</h3>
              <p>{{ service.description }}</p>
            </div>
          </div>
          <div class="card-footer">
            <span class="action-text">Accéder</span>
            <span class="arrow">→</span>
          </div>
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
  { id: 1, icon: '👨‍⚕️', label: 'Médecins', route: 'Doctor', description: 'Gérer les comptes et spécialités des médecins' },
  { id: 2, icon: '💉', label: 'Infirmiers', route: 'Nurse', description: 'Gérer les profils infirmiers et leurs affectations' },
  { id: 3, icon: '🧪', label: 'Laboratoire', route: 'Laboratoire', description: 'Gérer les techniciens et examens' },
  { id: 4, icon: '📂', label: 'Dossiers médicaux', route: 'MedicalRecord', description: 'Consulter et valider les dossiers patients' },
  { id: 5, icon: '📊', label: 'Rapports médicaux', route: 'MedicalReport', description: 'Suivre les rapports et activités' },
  { id: 6, icon: '🏥', label: 'Départements', route: 'Department', description: 'Gérer les unités de l’établissement' },
  { id: 7, icon: '🆘', label: 'Alertes Urgences', route: 'Urgence', description: 'Tableau de bord des urgences en direct' },
  { id: 8, icon: '👥', label: 'Patients', route: 'Patient', description: 'Gestion des profils et antécédents' },
]
</script>

<style scoped>
.gerer-services-page {
  padding: 30px;
  background-color: #f8fafc;
  min-height: 100%;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 26px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 8px;
}

.page-subtitle {
  color: #64748b;
  font-size: 15px;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.service-card {
  background-color: white;
  border-radius: 20px;
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.service-card:hover {
  transform: translateY(-5px);
  border-color: #3b82f6;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.1);
}

.card-content {
  padding: 24px;
}

.icon-box {
  width: 54px;
  height: 54px;
  background-color: #eff6ff;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 20px;
  transition: background-color 0.3s;
}

.service-card:hover .icon-box {
  background-color: #3b82f6;
  color: white; /* Si c'est un icon font, sinon l'emoji reste */
}

.service-card h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 10px;
}

.service-card p {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
}

.card-footer {
  padding: 15px 24px;
  background-color: #f8fafc;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 13px;
  color: #3b82f6;
  transition: background-color 0.3s;
}

.service-card:hover .card-footer {
  background-color: #eff6ff;
}

.arrow {
  transition: transform 0.3s;
}

.service-card:hover .arrow {
  transform: translateX(5px);
}
</style>