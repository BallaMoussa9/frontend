<template>
  <div class="layout-container">
    <header class="topbar">
      <div class="brand-section">
        <button class="menu-toggle" @click="toggleMenu" aria-label="Ouvrir le menu">
          <span :class="['hamburger', { 'is-active': isMenuOpen }]"></span>
        </button>
        <RouterLink to="/" class="brand" @click="isMenuOpen = false">SanTeKo</RouterLink>
      </div>

      <nav :class="['nav-links', { 'nav-open': isMenuOpen }]">
        <template v-if="auth.isLoggedIn">
          <RouterLink to="/profile" class="user-info" @click="isMenuOpen = false">
            <img
              :src="getProfilePhoto(auth.user)"
              alt="Profil"
              class="avatar"
            />
            <span class="username">{{ auth.user?.first_name }} {{ auth.user?.last_name }}</span>
          </RouterLink>

          <button @click="handleLogout" class="logout-btn">
            <i class="fas fa-sign-out-alt"></i> Déconnexion
          </button>
        </template>

        <template v-else>
          <RouterLink :to="{ name: 'Login' }" class="auth-link" @click="isMenuOpen = false">Connexion</RouterLink>
          <RouterLink :to="{ name: 'Register' }" class="auth-link register-btn" @click="isMenuOpen = false">Créer un compte</RouterLink>
        </template>
      </nav>
      
      <div v-if="isMenuOpen" class="menu-overlay" @click="isMenuOpen = false"></div>
    </header>

    <main :class="['main-content', { 'no-padding': withSidebar }]">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStores'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const isMenuOpen = ref(false)

defineProps({
  withSidebar: {
    type: Boolean,
    default: false,
  },
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// ✅ Logique de récupération de photo optimisée
const getProfilePhoto = (user) => {
  if (!user) return ''; 
  
  if (user.profile_photo_url) {
    return user.profile_photo_url;
  }

  const path = user.profile_photo_path || user.profile_photo; 
  if (path) {
    const cleanedPath = path.startsWith('public/') ? path.substring(7) : path;
    return `https://santeko.abdatytch.com/api/storage/${cleanedPath}`; 
  }

  const firstLetter = (user.first_name ? user.first_name.charAt(0) : 'U').toUpperCase();
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23002580'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='20' fill='%23ffffff' font-family='Arial'%3E${firstLetter}%3C/text%3E%3C/svg%3E`;
};

async function handleLogout() {
  try {
    isMenuOpen.value = false
    await auth.logout()
    await router.push({ name: 'Login' })
  } catch (err) {
    console.error('Erreur déconnexion :', err)
  }
}
</script>

<style scoped>
/* ==================== STRUCTURE DE BASE ==================== */
.layout-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f7f9fc;
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
  z-index: 2000;
}

.brand-section {
  display: flex;
  align-items: center;
}

.brand {
  font-size: 22px;
  font-weight: 800;
  color: white;
  text-decoration: none;
  letter-spacing: 1px;
}

/* ==================== NAVIGATION (DESKTOP) ==================== */
.nav-links {
  display: flex;
  align-items: center;
  gap: 24px;
}

.auth-link, .logout-btn {
  color: white;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: none;
  font-size: 15px;
  transition: all 0.2s ease;
}

.register-btn {
  background-color: #ffcc00;
  color: #00194d !important;
  padding: 8px 16px;
  border-radius: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: white;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255,255,255,0.8);
}

.main-content {
  flex: 1;
  margin-top: 64px;
  padding: 24px;
  background-color: #f7f9fc;
}

/* ==================== RESPONSIVE (MOBILE) ==================== */
.menu-toggle {
  display: none;
  background: none;
  border: none;
  padding: 10px;
  cursor: pointer;
}

.hamburger {
  display: block;
  width: 24px;
  height: 2px;
  background: white;
  position: relative;
}

.hamburger::before, .hamburger::after {
  content: '';
  width: 24px;
  height: 2px;
  background: white;
  position: absolute;
  left: 0;
  transition: 0.3s;
}

.hamburger::before { top: -8px; }
.hamburger::after { bottom: -8px; }

@media (max-width: 768px) {
  .menu-toggle { display: block; }

  .nav-links {
    position: fixed;
    top: 64px;
    right: -100%;
    width: 260px;
    height: calc(100vh - 64px);
    background: #00194d;
    flex-direction: column;
    align-items: flex-start;
    padding: 30px;
    transition: 0.4s ease;
    box-shadow: -5px 0 15px rgba(0,0,0,0.2);
  }

  .nav-links.nav-open {
    right: 0;
  }

  .user-info {
    margin-bottom: 20px;
    width: 100%;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }

  .auth-link, .logout-btn {
    width: 100%;
    padding: 12px 0;
    font-size: 18px;
  }

  .menu-overlay {
    position: fixed;
    inset: 0;
    top: 64px;
    background: rgba(0,0,0,0.5);
    z-index: 1500;
  }
}
</style>