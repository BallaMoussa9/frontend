<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="logo">🩺 SanKo</div>
      <nav>
        <router-link to="/infirmier/dashboard" class="nav-item" exact-active-class="active">Accueil</router-link>
        <router-link to="/infirmier/patients" class="nav-item">Suivi des patients</router-link>
        <router-link to="/infirmier/soins" class="nav-item">Soins en cours</router-link>
        <router-link to="/infirmier/urgences" class="nav-item">Urgences</router-link>
        <router-link to="/infirmier/notifications" class="nav-item">Notifications</router-link>
      </nav>
    </aside>
    <main class="main">
      <header class="topbar">
        Bienvenue Infirmier(e) {{ user.firstName }}
      </header>
      <div class="main-content">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
const user = { firstName: "Diop" }
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}
.sidebar {
  width: 220px;
  background-color: #0f172a;
  color: white;
  padding: 20px;
}
.logo {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 30px;
}
.nav-item {
  display: block;
  margin-bottom: 12px;
  color: #cbd5e1;
  text-decoration: none;
  padding: 8px;
  border-radius: 6px;
}
.nav-item:hover,
.active {
  background: #1e293b;
  color: white;
}
.main {
  flex: 1;
  background: #f8fafc;
}
.topbar {
  padding: 20px;
  background: white;
  font-weight: bold;
  border-bottom: 1px solid #e2e8f0;
}
.main-content {
  padding: 30px;
}
</style>
