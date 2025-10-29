<template>
  <div class="lab-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo">SanKo - Labo</div>
      <nav class="menu">
        <RouterLink to="/lab/dashboard" class="menu-item">🧬 Dashboard</RouterLink>
        <RouterLink to="/lab/demandes" class="menu-item">📥 Demandes d'analyse</RouterLink>
        <RouterLink to="/lab/televersement" class="menu-item">📤 Téléverser résultats</RouterLink>
        <RouterLink to="/lab/associer-patient" class="menu-item">👥 Associer à un patient</RouterLink>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="main-content">
      <header class="lab-header">
        <h1>Espace Technicien de Laboratoire</h1>
      </header>
      <main class="lab-body">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
// Pas besoin de logique spécifique ici
</script>

<style scoped>
.lab-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f6f9fc;
}

.sidebar {
  width: 240px;
  background-color: #0040d0;
  color: white;
  padding: 20px;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
}

.menu-item {
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 10px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.menu-item:hover,
.menu-item.router-link-exact-active {
  background-color: #0030a0;
}

.main-content {
  flex: 1;
  margin-left: 240px;
  padding: 30px;
}

.lab-header {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 20px;
}

.lab-body {
  padding-top: 10px;
}
</style>
