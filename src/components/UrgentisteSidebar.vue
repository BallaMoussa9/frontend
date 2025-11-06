<template>
  <nav class="urgentiste-sidebar">
    <div class="sidebar-header">
      <div class="user-role">Urgentiste</div>
    </div>
    <ul class="sidebar-menu">
      <RouterLink to="/urgentiste/dashboard" class="menu-item" active-class="active">
        <i class="icon fas fa-tachometer-alt"></i>
        <span>Tableau de bord</span>
      </RouterLink>
      <RouterLink to="/urgentiste/alerts" class="menu-item" active-class="active">
        <i class="icon fas fa-bell"></i>
        <span>Alertes SOS</span>
        <span class="badge new-alerts">3</span> </RouterLink>
      <RouterLink to="/urgentiste/profile" class="menu-item" active-class="active">
        <i class="icon fas fa-user-circle"></i>
        <span>Mon Profil</span>
      </RouterLink>
      <RouterLink to="/urgentiste/historique" class="menu-item" active-class="active">
        <i class="icon fas fa-history"></i>
        <span>Historique</span>
      </RouterLink>
    </ul>
  </nav>
</template>

<script setup>
// Pas de logique spécifique ici, c'est principalement de la navigation.
</script>

<style scoped>
/* 🎨 Styles inspirés de votre image de tableau de bord */
.urgentiste-sidebar {
  width: 250px; /* Largeur de la barre latérale */
  background-color: #2c3e50; /* Couleur sombre pour contraste */
  color: white;
  padding: 10px 0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  height: 100vh;
  position: fixed;
  top: 64px; /* Sous la topbar */
  left: 0;
  z-index: 900;
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

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

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
  background-color: #ec5865; /* Couleur vive pour l'actif, comme le rose de votre image */
  color: white;
  border-left: 4px solid #f0f0f0; /* Barre latérale de l'élément actif */
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
</style>