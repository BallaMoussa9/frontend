<template>
  <AppLayout withSidebar>
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="logo">SanKo Admin</div>
        <nav class="menu">
          <RouterLink :to="{name:'AdminDashboard'}" class="menu-item">📊 Dashboard</RouterLink>
          <RouterLink :to="{name:'Service'}" class="menu-item">🛠 Gestion</RouterLink>
          <RouterLink :to="{name:'Settings'}" class="menu-item">⚙️ Paramètres</RouterLink>
          <RouterLink :to="{name:'AddRole'}" class="menu-item">➕ Ajouter un rôle</RouterLink>
          <RouterLink :to="{name:'Statistique'}" class="menu-item">📈 Statistiques globales</RouterLink>
          <RouterLink :to="{name:'Dialogue'}" class="menu-item">💬 Conversations</RouterLink>
          <RouterLink :to="{name:'Notification'}" class="menu-item">🔔 Notifications</RouterLink>
        </nav>
      </aside>

      <!-- Contenu principal -->
      <main class="admin-main">
        <slot />
      </main>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from './AppLayout.vue'
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: calc(100vh - 64px); /* enlève la hauteur de la topbar */
  margin-top: 64px; /* ✅ évite que le contenu passe SOUS la topbar */
}

/* === Sidebar === */
.sidebar {
  width: 240px;
  background-color: #1a33d0;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 20px 15px;
  position: fixed;
  top: 64px; /* démarre juste après la topbar */
  bottom: 0;
  left: 0;
  overflow-y: auto;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  border-top-right-radius: 12px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 25px;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-item {
  color: white;
  text-decoration: none;
  padding: 10px 12px;
  border-radius: 8px;
  transition: background 0.2s;
  font-weight: 500;
}
.menu-item:hover,
.menu-item.router-link-exact-active {
  background-color: #0030a0;
}

/* === Contenu principal === */
.admin-main {
  flex: 1;
  margin-left: 240px; /* ✅ laisse la place du sidebar */
  padding: 32px;
  background-color: #f5f7fa;
  border-top-left-radius: 12px;
  overflow-y: auto;
}
</style>
