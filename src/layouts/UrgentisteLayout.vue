<template>
  <AppLayout :with-sidebar="true">
    <div class="urgentiste-layout">
      <!-- On passe une prop ou une classe pour gérer l'état ouvert/fermé si besoin -->
      <UrgentisteSidebar class="sidebar-container" />

      <main class="dashboard-content">
        <slot />
      </main>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/layouts/AppLayout.vue' 
import UrgentisteSidebar from '@/components/UrgentisteSidebar.vue'
</script>

<style scoped>
.urgentiste-layout {
  --sidebar-width: 250px;
  --topbar-height: 64px;
  display: flex;
  min-height: calc(100vh - var(--topbar-height));
  width: 100%;
  position: relative;
}

/* --- MOBILE PAR DÉFAUT (Mobile-First) --- */
.sidebar-container {
  /* On cache la sidebar ou on la déplace hors écran sur mobile */
  position: fixed;
  left: -100%; /* Sort de l'écran à gauche */
  top: var(--topbar-height);
  bottom: 0;
  width: var(--sidebar-width);
  z-index: 100;
  transition: left 0.3s ease;
}

/* Si tu ajoutes une classe "is-open" via un bouton menu burger */
.sidebar-container.is-open {
  left: 0;
}

.dashboard-content {
  width: 100%;
  margin-left: 0; /* AUCUNE marge sur mobile */
  padding: 15px;
  flex-grow: 1;
}

/* --- DESKTOP (Écrans larges > 1024px) --- */
@media (min-width: 1024px) {
  .sidebar-container {
    left: 0; /* Toujours visible sur PC */
    position: fixed;
  }

  .dashboard-content {
    /* On remet la marge seulement sur grand écran */
    margin-left: var(--sidebar-width); 
    padding: 24px;
    width: calc(100% - var(--sidebar-width));
  }
}
</style>
