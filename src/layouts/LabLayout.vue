<template>
  <AppLayout>
    <div class="lab-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="logo">SanKo Lab</div>
        <nav class="menu">
          <RouterLink to="/lab/dashboard" class="menu-item" exact-active-class="active">
            🧪 Dashboard
          </RouterLink>
          <RouterLink to="/lab/demande-analyse" class="menu-item" exact-active-class="active">
            📋 Demande d’analyse
          </RouterLink>
          <RouterLink to="/lab/resultats" class="menu-item" exact-active-class="active">
            📤 Résultats
          </RouterLink>
          <RouterLink to="/lab/associer-patient" class="menu-item" exact-active-class="active">
            🔗 Associer à un patient
          </RouterLink>
          <RouterLink to="/logout" class="menu-item">
            🚪 Déconnexion
          </RouterLink>
        </nav>
      </aside>

      <!-- Contenu principal -->
      <div class="main-content">
        <header class="lab-header">
          <h1>Interface Technicien de laboratoire</h1>
        </header>
        <main class="lab-body">
          <slot />
        </main>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
</script>

<style scoped>
.lab-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
}

.sidebar {
  width: 240px;
  background-color: #002f6c;
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #ffffff;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-item {
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 10px 12px;
  border-radius: 8px;
  transition: background 0.2s;
}

.menu-item:hover,
.menu-item.active {
  background-color: #0044a3;
}

.main-content {
  margin-left: 240px;
  flex: 1;
  padding: 24px;
}

.lab-header {
  padding-bottom: 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
}

.lab-body {
  padding-top: 10px;
}
</style>
