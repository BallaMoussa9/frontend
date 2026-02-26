<template>
  <AppLayout withSidebar>
    <div class="admin-layout">
      <button class="mobile-toggle" @click="toggleSidebar">
        {{ isSidebarOpen ? '✕' : '☰' }}
      </button>

      <div v-if="isSidebarOpen" class="sidebar-overlay" @click="toggleSidebar"></div>

      <aside :class="['sidebar', { 'open': isSidebarOpen }]">
        <div class="sidebar-header">
          <div class="logo-icon">S</div>
          <div class="logo-text">SanKo <span>Admin</span></div>
        </div>

        <nav class="menu">
          <RouterLink :to="{name:'AdminDashboard'}" class="menu-item" @click="closeOnMobile">
            <span class="icon">📊</span> Dashboard
          </RouterLink>
          
          <div class="menu-divider">Gestion & Outils</div>
          
          <RouterLink :to="{name:'Service'}" class="menu-item" @click="closeOnMobile">
            <span class="icon">🛠</span> Gestion Services
          </RouterLink>
          <RouterLink :to="{name:'AddRole'}" class="menu-item" @click="closeOnMobile">
            <span class="icon">➕</span> Rôles & Accès
          </RouterLink>
          <RouterLink :to="{name:'Statistique'}" class="menu-item" @click="closeOnMobile">
            <span class="icon">📈</span> Statistiques
          </RouterLink>

          <div class="menu-divider">Communication</div>

          <RouterLink :to="{name:'Dialogue'}" class="menu-item" @click="closeOnMobile">
            <span class="icon">💬</span> Conversations
          </RouterLink>
          <RouterLink :to="{name:'Notification'}" class="menu-item" @click="closeOnMobile">
            <span class="icon">🔔</span> Notifications
          </RouterLink>

          <div class="menu-divider">Configuration</div>

          <RouterLink :to="{name:'Settings'}" class="menu-item" @click="closeOnMobile">
            <span class="icon">⚙️</span> Paramètres
          </RouterLink>
        </nav>
      </aside>

      <main class="admin-main">
        <div class="page-container">
          <slot />
        </div>
      </main>
    </div> 
  </AppLayout>
</template>

<script setup>
import { ref } from 'vue'
import AppLayout from '../layouts/AppLayout.vue'

const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// Ferme le menu après avoir cliqué sur un lien (uniquement sur mobile)
const closeOnMobile = () => {
  if (window.innerWidth <= 1024) {
    isSidebarOpen.value = false
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: calc(100vh - 64px);
  margin-top: 64px;
  background-color: #f0f2f5;
  position: relative;
}

/* === Sidebar === */
.sidebar {
  width: 260px;
  background-color: #1a237e;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 64px;
  bottom: 0;
  left: 0;
  transition: transform 0.3s ease; /* Animation fluide */
  z-index: 1001;
}

/* === Bouton Mobile === */
.mobile-toggle {
  display: none; /* Caché sur PC */
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 2000;
  background: #1a237e;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 20px;
}

/* === Contenu principal === */
.admin-main {
  flex: 1;
  margin-left: 260px; /* Espace pour la sidebar sur PC */
  background-color: #f8fafc;
  min-height: 100%;
  transition: margin 0.3s ease;
}

.page-container {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

/* =========================================
   RESPONSIVE (MOBILE & TABLETTE)
   ========================================= */

@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%); /* On cache à gauche */
    box-shadow: none;
  }

  .sidebar.open {
    transform: translateX(0); /* On affiche */
    box-shadow: 10px 0 30px rgba(0,0,0,0.3);
  }

  .admin-main {
    margin-left: 0; /* Plus de marge sur mobile */
  }

  .mobile-toggle {
    display: block; /* On affiche le bouton */
  }

  .sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }
  
  .page-container {
    padding: 15px; /* On réduit le padding sur petit écran */
  }
}

/* Tes styles de menu (inchangés) */
.sidebar-header { padding: 25px 20px; display: flex; align-items: center; gap: 12px; background: rgba(0, 0, 0, 0.1); }
.logo-icon { background: #3f51b5; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-weight: 800; }
.logo-text { font-size: 18px; font-weight: 700; }
.menu { display: flex; flex-direction: column; padding: 10px 15px; gap: 4px; }
.menu-item { color: rgba(255, 255, 255, 0.8); text-decoration: none; padding: 12px 15px; border-radius: 10px; display: flex; align-items: center; transition: 0.3s; }
.menu-item:hover { background: rgba(255,255,255,0.1); transform: translateX(5px); }
.menu-item.router-link-exact-active { background-color: white; color: #1a237e; font-weight: 700; }
.menu-divider { font-size: 11px; text-transform: uppercase; color: rgba(255, 255, 255, 0.4); margin: 20px 0 8px 10px; }
</style>