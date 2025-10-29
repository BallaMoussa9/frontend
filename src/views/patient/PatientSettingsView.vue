<template>
  <SidebarLayout>
    <section class="settings-section">
      <h1>Paramètres utilisateur</h1>

      <!-- Préférences de langue -->
      <div class="settings-card">
        <h2>Langue de l’interface</h2>
        <select v-model="preferences.language">
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="bm">Bambara</option>
        </select>
      </div>

      <!-- Notifications -->
      <div class="settings-card">
        <h2>Notifications</h2>
        <div class="form-group">
          <label>
            <input type="checkbox" v-model="preferences.smsAlert" />
            Alerte SMS en cas d’urgence
          </label>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" v-model="preferences.emailReminder" />
            Rappel par email pour les rendez-vous
          </label>
        </div>
      </div>

      <!-- Accessibilité -->
      <div class="settings-card">
        <h2>Accessibilité</h2>
        <div class="form-group">
          <label>
            <input type="checkbox" v-model="preferences.highContrast" />
            Mode contraste élevé
          </label>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" v-model="preferences.largeText" />
            Texte agrandi
          </label>
        </div>
      </div>

      <!-- Enregistrement -->
      <button @click="savePreferences">Enregistrer les paramètres</button>
    </section>
  </SidebarLayout>
</template>

<script setup>
import SidebarLayout from '@/layouts/SidebarLayout.vue'

const preferences = reactive({
  language: 'fr',
  smsAlert: true,
  emailReminder: true,
  highContrast: false,
  largeText: false,
})

function savePreferences() {
  alert('Paramètres sauvegardés ✅')
  // Envoyer vers ton backend Laravel si besoin
}
</script>

<style scoped>
.settings-section {
  max-width: 600px;
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 20px;
}

h1 {
  font-size: 26px;
  font-weight: bold;
  color: #002580;
}

.settings-card {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

h2 {
  font-size: 18px;
  margin-bottom: 12px;
  color: #333;
}

.form-group {
  margin-bottom: 12px;
}

label {
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

select {
  padding: 8px;
  border-radius: 4px;
  font-size: 14px;
  border: 1px solid #ccc;
}

button {
  align-self: flex-start;
  padding: 10px 16px;
  background-color: #002580;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
