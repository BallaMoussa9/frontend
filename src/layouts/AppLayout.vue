<template>
  <div class="layout-container">
    <header class="topbar">
      <div class="brand-section">
        <button class="menu-toggle" @click="toggleMenu" aria-label="Ouvrir le menu">
          <Menu v-if="!isMenuOpen" :size="24" color="white" />
          <X v-else :size="24" color="white" />
        </button>
        <RouterLink to="/" class="brand" @click="isMenuOpen = false">
          <img src="/santeko.png" alt="SanTeKo" class="brand-logo" />
          <span class="brand-text">SanTeKo</span>
        </RouterLink>
      </div>

      <nav class="nav-center">
        <RouterLink to="/" class="nav-item" @click="isMenuOpen = false">
          <Home :size="18" />
          <span>Accueil</span>
        </RouterLink>
        <RouterLink to="/fonctionnalites" class="nav-item" @click="isMenuOpen = false">
          <Layers :size="18" />
          <span>Fonctionnalités</span>
        </RouterLink>
        <RouterLink to="/a-propos" class="nav-item" @click="isMenuOpen = false">
          <Info :size="18" />
          <span>À propos</span>
        </RouterLink>
        <RouterLink to="/contact" class="nav-item" @click="isMenuOpen = false">
          <Mail :size="18" />
          <span>Contact</span>
        </RouterLink>
      </nav>

      <nav :class="['nav-links', { 'nav-open': isMenuOpen }]">
        <div class="mobile-nav-items">
          <RouterLink to="/" class="mobile-nav-item" @click="isMenuOpen = false">
            <Home :size="20" />
            <span>Accueil</span>
          </RouterLink>
          <RouterLink to="/fonctionnalites" class="mobile-nav-item" @click="isMenuOpen = false">
            <Layers :size="20" />
            <span>Fonctionnalités</span>
          </RouterLink>
          <RouterLink to="/a-propos" class="mobile-nav-item" @click="isMenuOpen = false">
            <Info :size="20" />
            <span>À propos</span>
          </RouterLink>
          <RouterLink to="/contact" class="mobile-nav-item" @click="isMenuOpen = false">
            <Mail :size="20" />
            <span>Contact</span>
          </RouterLink>
        </div>

        <div class="nav-divider"></div>

        <template v-if="auth.isLoggedIn">
          <RouterLink to="/profile" class="user-info" @click="isMenuOpen = false">
            <img
              :src="getProfilePhoto(auth.user)"
              alt="Profil"
              class="avatar"
            />
            <div class="user-details">
              <span class="username">{{ auth.user?.first_name }} {{ auth.user?.last_name }}</span>
              <span class="user-role">{{ getUserRole(auth.user) }}</span>
            </div>
          </RouterLink>

          <button @click="handleLogout" class="logout-btn">
            <LogOut :size="18" />
            <span>Déconnexion</span>
          </button>
        </template>

        <template v-else>
          <RouterLink :to="{ name: 'Login' }" class="auth-link login-btn" @click="isMenuOpen = false">
            <LogIn :size="18" />
            <span>Connexion</span>
          </RouterLink>
          <RouterLink :to="{ name: 'Register' }" class="auth-link register-btn" @click="isMenuOpen = false">
            <UserPlus :size="18" />
            <span>Créer un compte</span>
          </RouterLink>
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
import { Menu, X, Home, Layers, Info, Mail, LogIn, LogOut, UserPlus } from 'lucide-vue-next'

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

const getUserRole = (user) => {
  if (!user?.role) return '';
  const roles = {
    'admin': 'Administrateur',
    'doctor': 'Médecin',
    'nurse': 'Infirmier(e)',
    'patient': 'Patient',
    'urgentist': 'Urgentiste',
    'lab_technician': 'Laborantin'
  };
  return roles[user.role] || user.role;
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
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%232563eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='20' fill='%23ffffff' font-family='Arial'%3E${firstLetter}%3C/text%3E%3C/svg%3E`;
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

<style>
/* Reset global margins and padding */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}
</style>

<style scoped>
/* ==================== VARIABLES ==================== */
:root {
  --primary: #2563eb;
  --primary-dark: #1e40af;
  --primary-light: #3b82f6;
  --secondary: #10b981;
  --dark: #0f172a;
  --light: #ffffff;
}

/* ==================== STRUCTURE DE BASE ==================== */
.layout-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8fafc;
}

.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 72px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding: 0 32px;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 2000;
  backdrop-filter: blur(10px);
}

.brand-section {
  display: flex;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.brand-logo {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(37, 99, 235, 0.3));
}

.brand-text {
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #3b82f6, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.5px;
}

/* ==================== NAVIGATION CENTRALE (DESKTOP) ==================== */
.nav-center {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 500;
  font-size: 15px;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-item:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.nav-item.router-link-active {
  color: white;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.3), rgba(16, 185, 129, 0.2));
}

.nav-item.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  border-radius: 2px;
}

/* ==================== NAVIGATION DROITE ==================== */
.nav-links {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mobile-nav-items {
  display: none;
}

.nav-divider {
  display: none;
}

.auth-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s ease;
  padding: 10px 20px;
  border-radius: 12px;
}

.login-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.register-btn {
  background: linear-gradient(135deg, #2563eb, #10b981);
  color: white !important;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
  border: none;
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-weight: 600;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  padding: 10px 20px;
  border-radius: 12px;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.5);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: white;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 600;
  font-size: 14px;
  color: white;
}

.user-role {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: capitalize;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  object-fit: cover;
  border: 2px solid rgba(37, 99, 235, 0.5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.main-content {
  flex: 1;
  margin-top: 72px;
  padding: 0;
  background-color: #f8fafc;
}

.main-content.no-padding {
  padding: 0;
}

/* ==================== RESPONSIVE (MOBILE) ==================== */
.menu-toggle {
  display: none;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 10px;
  transition: background 0.3s ease;
}

.menu-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}

@media (max-width: 1024px) {
  .nav-center {
    display: none;
  }
}

@media (max-width: 768px) {
  .topbar {
    padding: 0 16px;
    height: 64px;
  }

  .brand-logo {
    width: 36px;
    height: 36px;
  }

  .brand-text {
    font-size: 20px;
  }

  .menu-toggle { 
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
  }

  .nav-links {
    position: fixed;
    top: 64px;
    right: -100%;
    width: 300px;
    height: calc(100vh - 64px);
    background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
    flex-direction: column;
    align-items: stretch;
    padding: 24px;
    transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: -10px 0 30px rgba(0,0,0,0.3);
    overflow-y: auto;
    gap: 12px;
  }

  .nav-links.nav-open {
    right: 0;
  }

  .mobile-nav-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .mobile-nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    font-weight: 500;
    font-size: 16px;
    border-radius: 12px;
    transition: all 0.3s ease;
  }

  .mobile-nav-item:hover,
  .mobile-nav-item.router-link-active {
    color: white;
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.3), rgba(16, 185, 129, 0.2));
  }

  .nav-divider {
    display: block;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    margin: 16px 0;
  }

  .user-info {
    width: 100%;
    padding: 16px;
    margin-bottom: 8px;
  }

  .auth-link, .logout-btn {
    width: 100%;
    justify-content: center;
    padding: 14px;
    font-size: 16px;
  }

  .menu-overlay {
    position: fixed;
    inset: 0;
    top: 64px;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    z-index: 1500;
  }

  .main-content {
    margin-top: 64px;
  }
}
</style>