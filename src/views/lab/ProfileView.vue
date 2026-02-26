<template>
  <LabLayout>
    <div class="profile-container">
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

      <div class="profile-grid">
        <section class="info-card">
          <h3><i class="fas fa-user"></i> Informations Personnelles</h3>
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
          <h3><i class="fas fa-chart-line"></i> Activité en temps réel</h3>
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
    </div>
  </LabLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStores'
import { useLabStore } from '@/stores/labStore'
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
.profile-container { padding: 30px; max-width: 1100px; margin: 0 auto; }

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  margin-bottom: 30px;
}

.avatar-section { display: flex; align-items: center; gap: 20px; }

.avatar-circle {
  width: 80px; height: 80px;
  background: linear-gradient(135deg, #e53e3e, #822727); /* Thème rouge médical */
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: bold;
}

.role-badge {
  background: #f7fafc;
  color: #4a5568;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  border: 1px solid #e2e8f0;
}

.profile-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 30px; }

.info-card, .stats-card {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.info-item { margin-bottom: 20px; }
.info-item label { display: block; color: #718096; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
.info-item p { font-weight: 600; color: #2d3748; margin-top: 5px; }

.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 20px; }

.stat-box {
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #edf2f7;
}

.stat-value { display: block; font-size: 28px; font-weight: 800; color: #2d3748; }
.stat-label { font-size: 12px; color: #718096; }

.stat-box.warning .stat-value { color: #e53e3e; }

.btn-edit {
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit:hover { background: #f7fafc; border-color: #cbd5e0; }
</style>