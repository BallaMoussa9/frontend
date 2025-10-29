<template>
  <div class="layout-container">
    <!-- 🔵 Barre de navigation en haut -->
    <header class="topbar">
      <RouterLink to="/" class="brand">SanTeKo</RouterLink>

      <div class="nav-links">
        <template v-if="auth.isLoggedIn">
          <RouterLink to="" class="user-info">
            <img
              :src="`http://localhost/storage/${auth.user?.profile_photo}`"
              alt="Profil"
              class="avatar"
            />
            <span class="username">{{ auth.user?.first_name }}</span>
          </RouterLink>

          <!-- ✅ bouton déconnexion -->
          <button @click="handleLogout" class="logout-btn">Déconnexion</button>
        </template>

        <template v-else>
          <RouterLink :to="{ name: 'Login' }" class="auth-link">Connexion</RouterLink>
          <RouterLink :to="{ name: 'Register' }" class="auth-link">Créer un compte</RouterLink>
        </template>
      </div>
    </header>

    <!-- 🟢 Contenu principal -->
    <main :class="['main-content', { 'no-padding': withSidebar }]">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStores'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

defineProps({
  withSidebar: {
    type: Boolean,
    default: false,
  },
})

// ✅ méthode corrigée
async function handleLogout() {
  try {
    await auth.logout() // attend que le logout soit fini
    await router.push({ name: 'Login' }) // redirection assurée
  } catch (err) {
    console.error('Erreur déconnexion :', err)
  }
}
</script>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f7f9fc;
  margin: 0;
  padding: 0;
}

.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, #002580, #00194d);
  padding: 0 24px;
  color: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.brand {
  font-size: 22px;
  font-weight: 700;
  color: white;
  text-decoration: none;
  transition: transform 0.2s ease, color 0.2s ease;
}
.brand:hover {
  transform: scale(1.05);
  color: #f0f0f0;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 24px;
}

.auth-link,
.logout-btn {
  color: white;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: none;
  font-size: 15px;
  transition: color 0.2s ease;
}
.auth-link:hover,
.logout-btn:hover {
  color: #ffcc00;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: white;
  font-weight: bold;
  transition: color 0.2s ease;
}
.user-info:hover {
  color: #ffcc00;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
}

.username {
  font-size: 14px;
}

.main-content {
  flex: 1;
  margin-top: 64px;
  padding: 24px;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #f7f9fc;
}

.main-content.no-padding {
  padding: 0;
}
</style>
