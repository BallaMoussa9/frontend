<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="logo">
        <span>🩺</span> SanKo
      </div>
      <nav>
        <router-link :to="{name:'DoctorDashboard'}" class="nav-item" exact-active-class="active">Accueil</router-link>
        <router-link :to="{name:'Appointments'}" class="nav-item">Rendez-vous</router-link>
        <router-link :to="{name:'TeleConsultation'}" class="nav-item">Téléconsultations</router-link>
        <router-link :to="{name:'Patients'}" class="nav-item">Patients</router-link>
        <router-link :to="{name:'FichePatient'}" class="nav-item">Dossier Médical</router-link>
        <router-link :to="{name:'Ordonnances'}" class="nav-item" exact-active-class="active">Ordonnances</router-link>
        <router-link :to="{name:'AlertSOS'}" class="nav-item">AlertSOS</router-link>
        <router-link :to="{name:'RapportsView'}" class="nav-item">Rapport Medical</router-link>

      </nav>
    </aside>
    <main class="main">
      <header class="topbar">
        Bonjour Dr. {{ user.firstName }}
      </header>
      <div class="main-content">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
const user = {
  firstName: "Keita"
}
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
