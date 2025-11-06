<template>
  <AppLayout :with-sidebar="true">
    <div class="urgentiste-layout">
      <UrgentisteSidebar />

      <main class="dashboard-content">
        <slot />
      </main>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/layouts/AppLayout.vue' // Assurez-vous que le chemin est correct
import UrgentisteSidebar from '@/components/UrgentisteSidebar.vue' // Chemin à ajuster

// Si AppLayout a un chemin différent, vous devrez l'ajuster
// Par exemple : import AppLayout from './AppLayout.vue'
</script>

<style scoped>
.urgentiste-layout {
  display: flex;
  /* Le layout prend toute la hauteur de la fenêtre moins la topbar */
  min-height: calc(100vh - 64px); 
}

.dashboard-content {
  /* Laisse de l'espace pour la sidebar (250px) */
  margin-left: 250px; 
  padding: 24px;
  flex-grow: 1; /* Prend l'espace restant */
  width: 100%;
}
</style>