<template>
  <div v-if="urgentistId" class="urgentiste-layout-wrapper">
    
    <nav class="urgentiste-sidebar">
      <div class="sidebar-header">
        <div class="user-role">Urgentiste</div>
        <small class="profile-id">ID: #{{ urgentistId }}</small>
      </div>
      
      <ul class="sidebar-menu">
        
        <RouterLink :to="{ name: 'UrgentisteDashboard', params: { id: urgentistId } }" 
                    class="menu-item" 
                    active-class="active">
          <i class="icon fas fa-bell"></i>
          <span>Alertes SOS (Tableau de bord)</span> 
          <span class="badge new-alerts">3</span> 
        </RouterLink>
        
        <RouterLink :to="{ name: 'UrgentisteProfile', params: { id: urgentistId } }" 
                    class="menu-item" 
                    active-class="active">
          <i class="icon fas fa-user-circle"></i>
          <span>Mon Profil</span>
        </RouterLink>
        
        <RouterLink :to="{ name: 'UrgentisteHistorique', params: { id: urgentistId } }" 
                    class="menu-item" 
                    active-class="active">
          <i class="icon fas fa-history"></i>
          <span>Historique</span>
        </RouterLink>
      </ul>
      
      <a @click="handleLogout" class="menu-item logout-item">
        <i class="icon fas fa-sign-out-alt"></i>
        <span>Déconnexion</span>
      </a>

    </nav>
    
    <div class="main-content">
      <slot />
    </div>
  </div>

  <div v-else class="loading-screen">
      <p>Chargement des données Urgentiste...</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStores' // ⚠️ Assurez-vous que le chemin est correct
import { useRouter } from 'vue-router';

const authStore = useAuthStore()
const router = useRouter()

// 🔑 Récupère l'ID du profil Urgentiste (firts_responders.id)
const urgentistId = computed(() => authStore.profileId)

function handleLogout() {
    authStore.logout()
    router.push({ name: 'Login' }) // Rediriger après déconnexion
}
</script>

<style scoped>
/* ---------------------------------
   LAYOUT GLOBAL
--------------------------------- */
.urgentiste-layout-wrapper { 
    display: flex; 
    min-height: 100vh; 
    background-color: #f8fafc; /* Couleur de fond de l'application */
    padding-top: 64px; /* Espace pour la TopBar/NavBar qui doit être fixe en haut */
}

.main-content {
    /* Laisse de l'espace pour la sidebar fixe */
    margin-left: 250px; 
    flex: 1;
    padding: 20px;
    /* Rendre le contenu scrollable */
    overflow-y: auto; 
    width: calc(100% - 250px);
}

.loading-screen { 
    display: flex; 
    justify-content: center; 
    align-items: center; 
    height: 100vh; 
    font-size: 1.1rem; 
    color: #002580; 
}

/* ---------------------------------
   SIDEBAR (Styles existants ajustés)
--------------------------------- */
.urgentiste-sidebar {
  width: 250px; 
  background-color: #2c3e50; 
  color: white;
  padding: 10px 0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
  height: 100vh;
  position: fixed;
  top: 64px; /* Sous la topbar */
  left: 0;
  z-index: 900;
  display: flex; /* Permet au bouton de déconnexion de se positionner en bas */
  flex-direction: column;
}

.sidebar-header {
  padding: 15px 20px;
  border-bottom: 1px solid #3d5a80;
  margin-bottom: 10px;
}

.user-role {
  font-size: 18px;
  font-weight: bold;
}

.profile-id {
    display: block;
    color: #a0a6aa;
    font-size: 0.8em;
    margin-top: 5px;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1; /* Permet à la liste de prendre tout l'espace restant */
}

/* ---------------------------------
   ÉLÉMENTS DE MENU
--------------------------------- */
.menu-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: #c0c4c7;
  text-decoration: none;
  transition: background-color 0.3s, color 0.3s;
  position: relative;
}

.menu-item:hover {
  background-color: #34495e;
  color: white;
}

.menu-item.active {
  background-color: #ec5865; 
  color: white;
  border-left: 4px solid #f0f0f0; 
}

.icon {
  margin-right: 15px;
  font-size: 18px;
}

.badge {
  margin-left: auto;
  background-color: #ffc107;
  color: #2c3e50;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

/* Style spécifique pour la déconnexion */
.logout-item {
    margin-top: 20px; /* Espace le lien de déconnexion */
    color: #ec5865;
    border-top: 1px solid #3d5a80;
}
.logout-item:hover {
    background-color: #5c1f24;
    color: white;
}
</style>