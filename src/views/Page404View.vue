<template>
  <AppLayout>
    <div class="error-box">
      <h1>Oups !</h1>
      <p>Cette page est introuvable.</p>
      <div class="error-code">404</div>
      <div class="error-icon">☹️</div>
      <button @click="retourAccueil">Retour à l’accueil</button>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/layouts/AppLayout.vue'

function retourAccueil() {
  window.location.href = '/'
}
</script>

<style scoped>
.error-box {
  text-align: center;
  margin: 100px auto;
  max-width: 500px;
  padding: 40px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.error-code {
  font-size: 64px;
  font-weight: bold;
  color: #0040d0;
}

button {
  background-color: #0040d0;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 20px;
}
</style>
