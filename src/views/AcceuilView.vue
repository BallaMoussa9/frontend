<template>
  <AppLayout>
    <div class="landing-page-container">

      <section class="hero-section">
        <div class="hero-bg-overlay"></div>
        <div class="hero-content fade-in">
          <h1>
            Santé au Mali : <br />
            <span class="highlight-text">SanTeKo, un Système d'Urgence et de Soins Intégré.</span>
          </h1>
          <p class="tagline">
            Face aux défis sanitaires majeurs, SanTeKo déploie un
            <strong>Système d'Information Hospitalier (SIH) innovant</strong>. Notre mission : digitaliser, sécuriser
            et coordonner l'accès aux soins pour tous les Maliens.
          </p>

          <div class="user-state-actions">
            <div v-if="isLoggedIn" class="logged-in-state">
              <img :src="profilePhoto" alt="Photo de profil" class="avatar-welcome" />
              <div class="user-info-text">
                <p class="welcome-message">Bienvenue, <strong>{{ fullName }}</strong> !</p>
                <button class="action-button secondary" @click="logout">Déconnexion</button>
              </div>
            </div>

            <div v-else class="auth-prompts">
              <router-link to="/login" class="action-button primary">
                Accès au Système <i class="fas fa-sign-in-alt"></i>
              </router-link>
              <p class="login-prompt">Professionnels et patients enregistrés.</p>
            </div>
          </div>
        </div>

        <div class="hero-illustration slide-in-right">
          <img src="/santeko.png" alt="Logo Santeko" class="hero-img" />
        </div>
      </section>

      <section class="roles-features-section fade-in">
        <div class="section-header">
          <h2 class="section-heading"> Actions par Rôle</h2>
          <p class="section-subheading">
            Chaque acteur bénéficie d'un espace sécurisé et de permissions spécifiques.
          </p>
        </div>

        <div class="roles-container">
          <div class="role-card">
            <h3 class="role-title"><i class="fas fa-user-injured"></i> Patient</h3>
            <ul class="role-features-list">
              <li><i class="fas fa-check-circle"></i> Dossier Médical Électronique</li>
              <li><i class="fas fa-check-circle"></i> Prise de RDV simplifiée</li>
              <li><i class="fas fa-check-circle"></i> Alerte SOS géolocalisée</li>
            </ul>
          </div>

          <div class="role-card">
            <h3 class="role-title"><i class="fas fa-user-md"></i> Docteur</h3>
            <ul class="role-features-list">
              <li><i class="fas fa-check-circle"></i> Gestion de l'Agenda</li>
              <li><i class="fas fa-check-circle"></i> Consultation des DME</li>
              <li><i class="fas fa-check-circle"></i> Ordonnances numériques</li>
            </ul>
          </div>

          <div class="role-card">
            <h3 class="role-title"><i class="fas fa-user-nurse"></i> Infirmier</h3>
            <ul class="role-features-list">
              <li><i class="fas fa-check-circle"></i> Collecte des signes vitaux</li>
              <li><i class="fas fa-check-circle"></i> Rapports de soins</li>
              <li><i class="fas fa-check-circle"></i> Coordination d'urgence</li>
            </ul>
          </div>

          <div class="role-card">
            <h3 class="role-title"><i class="fas fa-shield-alt"></i> Admin</h3>
            <ul class="role-features-list">
              <li><i class="fas fa-check-circle"></i> Gestion des comptes</li>
              <li><i class="fas fa-check-circle"></i> Supervision du système</li>
              <li><i class="fas fa-check-circle"></i> Statistiques globales</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="about-sanko fade-in">
        <h2 class="section-heading"> Chiffres Clés</h2>
        <div class="stats-card">
          <div class="stat-item">
            <span class="stat-value">150+</span>
            <span class="stat-label">Professionnels</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">24/7</span>
            <span class="stat-label">Urgence SOS</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">10K+</span>
            <span class="stat-label">Utilisateurs</span>
          </div>
        </div>
      </section>

    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '../stores/authStores'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const isLoggedIn = computed(() => auth.isLoggedIn)
const fullName = computed(() => auth.fullName)
const profilePhoto = computed(() => auth.profilePhotoUrl || 'https://via.placeholder.com/100')

const logout = () => {
  auth.logout()
  router.push('/')
}
</script>

<style scoped>
/* ==================== VARIABLES & BASE ==================== */
.landing-page-container {
  font-family: 'Poppins', sans-serif;
  overflow-x: hidden;
}

/* ==================== HERO ==================== */
.hero-section {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 80px 5%;
  background: linear-gradient(120deg, #f0f7ff 0%, #ffffff 100%);
  min-height: 80vh;
}

.hero-content {
  position: relative;
  z-index: 2;
  flex: 1;
  max-width: 600px;
}

.hero-content h1 {
  font-family: 'Montserrat', sans-serif;
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 20px;
}

.highlight-text {
  color: #0040d0;
  display: block;
}

.tagline {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #555;
  margin-bottom: 30px;
}

.hero-img {
  width: 100%;
  max-width: 450px;
  height: auto;
  filter: drop-shadow(0 20px 30px rgba(0,0,0,0.1));
}

/* ==================== BUTTONS ==================== */
.action-button {
  padding: 12px 28px;
  border-radius: 50px;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: 0.3s;
}

.primary { background: #0040d0; color: white; }
.secondary { border: 2px solid #0040d0; color: #0040d0; }
.primary:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,64,208,0.2); }

/* ==================== RÔLES & CARDS ==================== */
.roles-features-section {
  padding: 80px 5%;
  background: #fcfdfe;
  text-align: center;
}

.roles-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-top: 50px;
}

.role-card {
  background: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  transition: 0.3s;
  text-align: left;
}

.role-card:hover { transform: translateY(-10px); }

.role-features-list {
  list-style: none;
  padding: 0;
  margin-top: 15px;
}

.role-features-list li {
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
}

.role-features-list i { color: #28a745; }

/* ==================== STATS ==================== */
.about-sanko { padding: 60px 5%; text-align: center; }
.stats-card {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 40px;
  margin-top: 30px;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: #28a745;
  display: block;
}

/* ==================== RESPONSIVE ==================== */
@media (max-width: 992px) {
  .hero-section {
    flex-direction: column-reverse;
    text-align: center;
    padding-top: 40px;
  }
  .hero-content { max-width: 100%; margin-top: 30px; }
  .hero-img { max-width: 300px; }
}

@media (max-width: 600px) {
  .hero-section { padding: 40px 20px; }
  .stats-card { flex-direction: column; gap: 20px; }
  .action-button { width: 100%; justify-content: center; }
}

/* ANIMATIONS */
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.fade-in { animation: fadeIn 0.8s ease forwards; }
</style>