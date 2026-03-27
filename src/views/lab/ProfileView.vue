<template>
  <LabLayout>
    <section class="profile-card">
      <header class="profile-header">
        <div class="avatar-section">
          <div class="avatar-circle">
            {{ userInitials }}
          </div>
          <div class="user-titles">
            <h1>{{ authStore.user?.last_name }} {{ authStore.user?.first_name }}</h1>
            <span class="role-badge">{{ authStore.user?.role || 'Laborantin' }}</span>
          </div>
        </div>
        <button @click="isEditing = !isEditing" class="btn-edit">
          {{ isEditing ? 'Annuler' : 'Modifier le profil' }}
        </button>
      </header>
    </section>

    <div class="profile-grid">
      <section class="info-card">
        <header class="section-header">
          <div class="header-with-icon">
            <User :size="20" />
            <h3>Informations Personnelles</h3>
          </div>
        </header>
        <div class="info-list">
          <div class="info-item">
            <label>Email Professionnel</label>
            <p>{{ authStore.user?.email }}</p>
          </div>
          <div class="info-item">
            <label>Téléphone</label>
            <p>{{ authStore.user?.phone || 'Non renseigné' }}</p>
          </div>
          <div class="info-item">
            <label>Identifiant Employé</label>
            <p>LAB-{{ authStore.user?.id?.toString().padStart(4, '0') }}</p>
          </div>
          <div class="info-item">
            <label>Membre depuis</label>
            <p>{{ formatDate(authStore.user?.created_at) }}</p>
          </div>
        </div>
      </section>

      <section class="stats-card">
        <header class="section-header">
          <div class="header-with-icon">
            <BarChart3 :size="20" />
            <h3>Activité en temps réel</h3>
          </div>
        </header>
        <div class="stats-grid">
          <div class="stat-box">
            <span class="stat-value">{{ labStore.labRequests?.length || 0 }}</span>
            <span class="stat-label">Analyses enregistrées</span>
          </div>
          <div class="stat-box">
            <span class="stat-value">{{ labStore.bloodStock?.length || 0 }}</span>
            <span class="stat-label">Poches en stock</span>
          </div>
          <div class="stat-box" :class="{ 'warning': expiredUnitsCount > 0 }">
            <span class="stat-value">{{ expiredUnitsCount }}</span>
            <span class="stat-label">Unités expirées</span>
          </div>
        </div>

        <div v-if="isEditing" class="edit-profile-placeholder">
           <p>Le formulaire de mise à jour peut être injecté ici.</p>
        </div>
      </section>
    </div>
  </LabLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStores'
import { useLabStore } from '@/stores/labStore'
import { User, BarChart3 } from 'lucide-vue-next'
import LabLayout from '@/layouts/LabLayout.vue'

const authStore = useAuthStore()
const labStore = useLabStore()
const isEditing = ref(false)

// Initiales dynamiques
const userInitials = computed(() => {
  const first = authStore.user?.first_name?.charAt(0) || ''
  const last = authStore.user?.last_name?.charAt(0) || ''
  return (first + last).toUpperCase() || '?'
})

// Calcul réel basé sur les données du stock
const expiredUnitsCount = computed(() => {
  if (!labStore.bloodStock) return 0
  const now = new Date()
  return labStore.bloodStock.filter(unit => new Date(unit.expiration_date) < now).length
})

onMounted(async () => {
  // Chargement des données réelles si nécessaire
  if (!labStore.bloodStock.length) await labStore.fetchBloodStock()
  if (labStore.fetchLabRequests && !labStore.labRequests.length) await labStore.fetchLabRequests()
})

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}
</script>

<style scoped>
/* === Variables CSS - Glassmorphism Lab === */
:root {
  --primary: #2563eb;
  --primary-dark: #1e40af;
  --primary-light: #3b82f6;
  --secondary: #10b981;
  --secondary-dark: #059669;
  --secondary-light: #34d399;
  --accent: #8b5cf6;
  --accent-light: #a78bfa;
  --success: #22c55e;
  --success-light: #4caf50;
  --warning: #f59e0b;
  --warning-light: #ffb300;
  --danger: #ef4444;
  --danger-light: #f44336;
  --info: #06b6d4;
  --info-light: #29b6f6;
  --dark: #0f172a;
  --darker: #0d47a1;
  --light: #ffffff;
  --gray: #94a3b8;
  --gray-light: #cbd5e1;
  --gray-dark: #64748b;
  --border: rgba(255, 255, 255, 0.2);
  --shadow: rgba(0, 0, 0, 0.1);
  --blur: blur(20px);
}

/* === Profile Card === */
.profile-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: var(--blur);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 20px 40px var(--shadow);
  margin: 1rem;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar-circle {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.user-titles h1 {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.role-badge {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: var(--blur);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: inline-block;
  margin-top: 0.5rem;
}

.btn-edit {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
  font-size: 0.875rem;
}

.btn-edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
}

/* === Profile Grid === */
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;
  margin: 0 1rem;
}

.info-card, .stats-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: var(--blur);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 20px 40px var(--shadow);
  margin-bottom: 1.5rem;
}

/* === Section Headers === */
.section-header {
  margin-bottom: 1rem;
}

.header-with-icon {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
}

.header-with-icon h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.header-with-icon svg {
  color: white;
}

/* === Info Items === */
.info-item {
  margin-bottom: 1.25rem;
}

.info-item label {
  display: block;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.info-item p {
  font-weight: 600;
  color: white;
  margin: 0.25rem 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

/* === Stats Grid === */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.stat-box {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: var(--blur);
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.stat-box:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
}

.stat-value {
  display: block;
  font-size: 1.75rem;
  font-weight: 800;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.25rem;
}

.stat-box.warning .stat-value {
  color: var(--danger);
}

/* === Edit Placeholder === */
.edit-profile-placeholder {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

/* === Responsive === */
@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .profile-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>