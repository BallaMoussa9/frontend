<template>
  <AppLayout :withSidebar="true">
    <div class="lab-container">
      <button class="mobile-toggle" @click="isSidebarOpen = !isSidebarOpen">
        <i class="fas" :class="isSidebarOpen ? 'fa-times' : 'fa-flask'"></i>
      </button>

      <aside class="sidebar" :class="{ 'is-open': isSidebarOpen }">
        <div class="sidebar-header">
          <div class="brand-box">
            <i class="fas fa-microscope"></i>
            <span>SanTeKo LAB</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <RouterLink :to="`/Laborantin/dashboard/${route.params.id}`" class="nav-link">
            <i class="fas fa-chart-pie"></i> <span>Dashboard</span>
          </RouterLink>

        

          <RouterLink :to="`/Laborantin/AnalyseGestion/${route.params.id}`" class="nav-link">
            <i class="fas fa-vial"></i> <span>Résultats d'examens</span>
          </RouterLink>

          <RouterLink :to="`/Laborantin/BloddGestion/${route.params.id}`" class="nav-link">
            <i class="fas fa-tint"></i> <span>Banque de Sang</span>
          </RouterLink>

          <div class="divider"></div>

          <RouterLink :to="`/Laborantin/profile/${route.params.id}`" class="nav-link">
            <i class="fas fa-user-circle"></i> <span>Mon Profil</span>
          </RouterLink>
        </nav>

        <div class="sidebar-footer">
          <span class="status-online">● Connecté</span>
        </div>
      </aside>

      <div v-if="isSidebarOpen" class="overlay" @click="isSidebarOpen = false"></div>

      <main class="main-content">
        <header class="page-header">
          <h1 class="page-title">{{ pageTitle }}</h1>
          <div class="user-badge">Technicien de Labo</div>
        </header>

        <div class="content-body">
          <slot />
        </div>
      </main>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'

const route = useRoute()
const isSidebarOpen = ref(false)

// Titre dynamique selon la route actuelle
const pageTitle = computed(() => {
  if (route.name === 'LaborantinDashboard') return 'Tableau de Bord'
  if (route.name === 'BloodGestion') return 'Gestion du Sang'
  if (route.name === 'AnalyseGestion') return 'Nouvelle Analyse'
  if (route.name === 'ListeDemandeAnalyse') return 'Demandes reçues'
  return 'Espace Laboratoire'
})
</script>

<style scoped>
/* Conteneur principal */
.lab-container {
  display: flex;
  min-height: calc(100vh - 64px);
  background-color: #f0f2f5;
}

/* --- SIDEBAR --- */
.sidebar {
  width: 260px;
  background-color: #002580; /* Bleu SanTeKo */
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 64px;
  bottom: 0;
  left: 0;
  z-index: 1000;
  transition: transform 0.3s ease;
}

.sidebar-header {
  padding: 30px 20px;
  text-align: center;
}

.brand-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffcc00; /* Jaune SanTeKo */
}

.sidebar-nav {
  flex: 1;
  padding: 10px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 15px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: 8px;
  margin-bottom: 5px;
  transition: 0.2s;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-link.router-link-active {
  background-color: #ffcc00;
  color: #00194d;
  font-weight: bold;
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 20px 10px;
}

.sidebar-footer {
  padding: 15px;
  font-size: 0.8rem;
  text-align: center;
}

.status-online { color: #00ff88; }

/* --- CONTENU --- */
.main-content {
  margin-left: 260px;
  flex: 1;
  padding: 30px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #002580;
}

.user-badge {
  background: #e1e7f0;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  color: #002580;
}

/* --- RESPONSIVE --- */
.mobile-toggle {
  display: none;
}

@media (max-width: 992px) {
  .sidebar {
    transform: translateX(-100%);
  }
  .sidebar.is-open {
    transform: translateX(0);
  }
  .main-content {
    margin-left: 0;
    padding: 20px;
  }
  .mobile-toggle {
    display: block;
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #ffcc00;
    color: #002580;
    border: none;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    z-index: 1100;
    font-size: 1.5rem;
  }
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 900;
  }
}
</style>