<template>
  <div class="layout-container">
    <header class="topbar">
      <RouterLink to="/" class="brand">SanTeKo</RouterLink>

      <div class="nav-links">
        <template v-if="auth.isLoggedIn">
          <RouterLink to="" class="user-info">
            <img
              :src="getProfilePhoto(auth.user)"
              alt="Profil"
              class="avatar"
            />
            <span class="username">{{ auth.user?.first_name }}</span>
          </RouterLink>

          <button @click="handleLogout" class="logout-btn">Déconnexion</button>
        </template>

        <template v-else>
          <RouterLink :to="{ name: 'Login' }" class="auth-link">Connexion</RouterLink>
          <RouterLink :to="{ name: 'Register' }" class="auth-link">Créer un compte</RouterLink>
        </template>
      </div>
    </header>

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

// ✅ Logique de récupération de photo identique à ton chatStore
const getProfilePhoto = (user) => {
  if (!user) return ''; 
  
  // 1. Si l'URL complète est déjà fournie
  if (user.profile_photo_url) {
    return user.profile_photo_url;
  }

  // 2. Si on a un chemin relatif (ex: public/profiles/photo.jpg)
  const path = user.profile_photo_path || user.profile_photo; // Gère les deux noms de clés possibles
  
  if (path) {
    // Nettoyage du préfixe 'public/' si présent
    const cleanedPath = path.startsWith('public/') ? path.substring(7) : path;
    // Utilisation de ton domaine d'API (santeko.abdatytch.com)
    return `https://santeko.abdatytch.com/api/storage/${cleanedPath}`; 
  }

  // 3. Fallback : Génération d'un avatar avec l'initiale
  const firstLetter = (user.first_name ? user.first_name.charAt(0) : 'U').toUpperCase();
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23002580'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='20' fill='%23ffffff' font-family='Arial'%3E${firstLetter}%3C/text%3E%3C/svg%3E`;
};

async function handleLogout() {
  try {
    await auth.logout()
    await router.push({ name: 'Login' })
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
