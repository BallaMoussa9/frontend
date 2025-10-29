<template>
  <AdminLayout>
    <div class="container">
      <h2 class="page-title">Gérer les Services</h2>

      <div class="roles-grid">
        <div
          v-for="role in roles"
          :key="role.key"
          class="role-card"
          @click="goToRole(role.key)"
        >
          <h3>{{ role.label }}</h3>
          <p>{{ role.description }}</p>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const roles = [
  { key: 'admin', label: 'Administrateur', description: "Gère l’administration globale du système" },
  { key: 'super_admin', label: 'Super Administrateur', description: 'Accès total à toutes les fonctionnalités' },
  { key: 'doctor', label: 'Médecin', description: 'Prend en charge les diagnostics et prescriptions' },
  { key: 'nurse', label: 'Infirmier/Infirmière', description: 'Assiste les soins médicaux' },
  { key: 'pharmacist', label: 'Pharmacien', description: 'Gère les prescriptions et médicaments' },
  { key: 'secretary', label: 'Secrétaire', description: 'Planifie les rendez-vous et gère l’accueil' },
  { key: 'accountant', label: 'Comptable', description: 'Supervise la facturation et finances' },
  { key: 'patient', label: 'Patient', description: 'Utilisateur recevant les soins médicaux' },
  { key: 'comms_officer', label: 'Chargé de com.', description: 'Communication interne et externe' },
  { key: 'emergency_doctor', label: 'Médecin urgentiste', description: 'Soins intensifs et urgences' },
  { key: 'paramedic', label: 'Ambulancier', description: 'Transport et premiers soins' },
  { key: 'lab_technician', label: 'Technicien labo', description: 'Analyse en laboratoire' },
  { key: 'lab_supervisor', label: 'Superviseur labo', description: 'Supervision des opérations labo' },
  { key: 'lab_assistant', label: 'Assistant labo', description: 'Aide aux analyses' },
  { key: 'lab_manager', label: 'Responsable labo', description: 'Organisation et résultats labo' },
  { key: 'pathologist', label: 'Pathologiste', description: 'Analyse des tissus et diagnostics' },
]

const goToRole = (key) => {
  router.push(`/admin/roles/${key}`)
}
</script>

<style scoped>
.container {
  padding: 2rem;
}

.page-title {
  font-size: 24px;
  margin-bottom: 24px;
  color: #0040d0;
  text-align: center;
  text-transform: uppercase;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.role-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.03);
  cursor: pointer;
  transition: 0.3s;
}

.role-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 64, 208, 0.1);
}

.role-card h3 {
  font-size: 18px;
  color: #0040d0;
  margin-bottom: 10px;
}

.role-card p {
  font-size: 14px;
  color: #555;
}
</style>
