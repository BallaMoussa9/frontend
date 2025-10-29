<template>
  <div class="layout-wrapper">
    <aside class="sidebar">
      <div class="sidebar-header">
        <RouterLink to="/" class="logo">🩺 SanKo Nurse</RouterLink>
      </div>
      <nav class="nav-menu">
        <RouterLink :to="{name:'NurseDashboard'}" class="nav-item">Tableau de bord</RouterLink>
        <RouterLink :to="{name:'PatientList'}" class="nav-item">Patients</RouterLink>
        <RouterLink :to="{name:'VitalSignsForm'}" class="nav-item">Signes vitaux</RouterLink>
        <RouterLink :to="{name:'CareNotes'}" class="nav-item">Observations</RouterLink>
        <RouterLink :to="{name:'BloodBank'}" class="nav-item">Banque de sang</RouterLink>
        <RouterLink :to="{name:'ActivityReport'}" class="nav-item">Rapports</RouterLink>
        <RouterLink :to="{name:'NoticeBoard'}" class="nav-item">Tableau d'affichage</RouterLink>
        <RouterLink :to="{name:'NurseProfile'}" class="nav-item">Mon Profil</RouterLink>
      </nav>
    </aside>

    <main class="main-panel">
      <AppLayout :withSidebar="true">
        <slot />
      </AppLayout>
    </main>
  </div>
</template>

<script setup>
import AppLayout from './AppLayout.vue'
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  height: 100vh;
  background-color: #eef3f8;
  overflow: hidden;
}

.sidebar {
  width: 250px;
  background-color: #003366;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 30px;
  color: white;
}

.logo {
  text-decoration: none;
  color: white;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.nav-item {
  text-decoration: none;
  color: #d6e4ff;
  font-weight: 500;
  font-size: 15px;
  padding: 10px;
  transition: background-color 0.2s;
}

.nav-item:hover {
  background-color: #0055aa;
  border-radius: 4px;
}

.main-panel {
  flex: 1;
  overflow-y: auto;
}
</style>
