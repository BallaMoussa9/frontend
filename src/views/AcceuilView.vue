<template>
  <AppLayout>
    <div class="landing-page-container">

      <!-- ================= HERO SECTION ================= -->
      <section class="hero-section hero-strategic">
        <div class="hero-bg-overlay"></div>
        <div class="hero-content fade-in">
          <h1>
            Santé au Mali : <br />
            <span class="highlight-text">SanTeKo, un Système d'Urgence et de Soins Intégré.</span>
          </h1>
          <p class="tagline">
            Face aux défis sanitaires majeurs (pénurie de professionnels, accès inégal), SanTeKo déploie un
            <strong>Système d'Information Hospitalier (SIH) innovant</strong>. Notre mission : digitaliser, sécuriser
            et coordonner l'accès aux soins de qualité pour tous les Maliens.
          </p>

          <div class="user-state-actions">
            <div v-if="isLoggedIn" class="logged-in-state">
              <img :src="profilePhoto" alt="Photo de profil" class="avatar" />
              <div class="user-info">
                <p class="welcome-message">Bienvenue, <strong>{{ fullName }}</strong> !</p>
                <button class="action-button secondary" @click="logout">Déconnexion</button>
              </div>
            </div>

            <div v-else>
              <router-link to="/login" class="action-button primary">
                Accès au Système <i class="fas fa-sign-in-alt"></i>
              </router-link>
              <p class="login-prompt">Pour les professionnels et les patients enregistrés.</p>
            </div>
          </div>
        </div>

        <div class="hero-illustration slide-in-right">
          <img src="/santeko.png" alt="Logo Santeko - Plateforme de santé numérique" />
        </div>
      </section>

      <!-- ================= RÔLES ================= -->
      <section class="roles-features-section fade-in">
        <h2 class="section-heading">🧑‍⚕️ Actions et Responsabilités par Rôle</h2>
        <p class="section-subheading">
          SanTeKo organise l'écosystème de santé. Chaque acteur (Patient, Docteur, Infirmier, Admin) bénéficie d'un espace sécurisé et de permissions spécifiques.
        </p>

        <div class="roles-container">
          <div class="role-card patient-role">
            <h3 class="role-title"><i class="fas fa-user-injured"></i> Rôle Patient</h3>
            <ul class="role-features-list">
              <li><span class="feature-name">Mon Profil Médical :</span> Consultation et mise à jour des données personnelles.</li>
              <li><span class="feature-name">Gestion des Rendez-vous :</span> Prise de RDV simplifiée et historique complet.</li>
              <li><span class="feature-name">Accès à l'Historique :</span> Dossier Médical Électronique (DME) sécurisé.</li>
              <li><span class="feature-name">Alerte d'Urgence SOS :</span> Déclenchement géolocalisé pour intervention immédiate.</li>
            </ul>
          </div>

          <div class="role-card doctor-role">
            <h3 class="role-title"><i class="fas fa-user-md"></i> Rôle Docteur</h3>
            <ul class="role-features-list">
              <li><span class="feature-name">Gestion de l'Agenda :</span> Organisation des consultations.</li>
              <li><span class="feature-name">Accès aux Dossiers :</span> Recherche et consultation rapide des DME.</li>
              <li><span class="feature-name">Actes Médicaux :</span> Prescription et rapports numériques.</li>
            </ul>
          </div>

          <div class="role-card nurse-role">
            <h3 class="role-title"><i class="fas fa-user-nurse"></i> Rôle Infirmier</h3>
            <ul class="role-features-list">
              <li><span class="feature-name">Collecte de Données :</span> Historique des signes vitaux.</li>
              <li><span class="feature-name">Traçabilité des Interventions :</span> Rapports de soins détaillés.</li>
              <li><span class="feature-name">Coordination des Soins :</span> Consultation du Dossier Patient complet.</li>
            </ul>
          </div>

          <div class="role-card admin-role">
            <h3 class="role-title"><i class="fas fa-shield-alt"></i> Pilotage et Supervision (Admin)</h3>
            <ul class="role-features-list">
              <li><span class="feature-name">Gestion Centralisée :</span> Administration des comptes et départements.</li>
              <li><span class="feature-name">Supervision Opérationnelle :</span> Suivi des alertes et conformité.</li>
              <li><span class="feature-name">Administration Système :</span> Gestion des rôles et notifications.</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- ================= À PROPOS ================= -->
      <section class="about-sanko fade-in">
        <h2 class="section-heading">📈 SanTeKo en Chiffres Clés</h2>
        <div class="about-content">
          <p class="about-text">
            SanTeKo garantit la qualité, l'interopérabilité et la continuité des soins. Grâce à une supervision complète, la plateforme est la base essentielle pour l'amélioration du système de santé malien.
          </p>
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
              <span class="stat-label">Utilisateurs Actifs</span>
            </div>
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
const profilePhoto = computed(() => auth.profilePhotoUrl || 'https://via.placeholder.com/64x64/f0f0f0/6c757d?text=User')

const logout = () => {
  auth.logout()
  router.push('/')
}
</script>

<style scoped>
/* ==================== POLICES & COULEURS ==================== */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;800&family=Poppins:wght@400;600&display=swap');

:root {
  --primary-sanko: #0040d0;
  --accent-sanko: #28a745;
  --danger-sos: #dc3545;
  --text-dark: #1e1e1e;
  --text-light: #ffffff;
  --bg-light: #f8f9fa;
  --bg-card: #ffffff;
  --shadow-subtle: rgba(0, 0, 0, 0.1);
}

/* ==================== STRUCTURE ==================== */
.landing-page-container {
  font-family: 'Poppins', sans-serif;
  color: var(--text-dark);
  overflow-x: hidden;
}

/* ==================== HERO ==================== */
.hero-section {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 100px 60px;
  background: linear-gradient(120deg, #e9f1ff 0%, #ffffff 100%);
  border-bottom: 4px solid var(--primary-sanko);
  overflow: hidden;
}
.hero-bg-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top left, rgba(0,64,208,0.1), transparent 70%);
  z-index: 0;
}
.hero-content {
  position: relative;
  z-index: 2;
  max-width: 50%;
}
.hero-content h1 {
  font-family: 'Montserrat', sans-serif;
  font-size: 52px;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 20px;
}
.highlight-text {
  color: var(--primary-sanko);
  background: linear-gradient(90deg, var(--primary-sanko), var(--accent-sanko));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.tagline {
  font-size: 18px;
  line-height: 1.7;
  color: #444;
  margin-bottom: 35px;
  opacity: 0.9;
}
.hero-illustration img {
  max-width: 420px;
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

/* ==================== BOUTONS ==================== */
.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 32px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
}
.primary {
  background-color: var(--primary-sanko);
  color: var(--text-light);
}
.primary:hover {
  background-color: #002fa3;
  transform: translateY(-2px);
}
.secondary {
  border: 2px solid var(--primary-sanko);
  color: var(--primary-sanko);
  background: transparent;
}
.secondary:hover {
  background-color: var(--primary-sanko);
  color: var(--text-light);
}

/* ==================== RÔLES ==================== */
.roles-features-section {
  background-color: #f9fbff;
  padding: 80px 40px;
}
.roles-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 40px;
}
.role-card {
  background: var(--bg-card);
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
}
.role-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
}

/* ==================== STATISTIQUES ==================== */
.about-sanko {
  padding: 80px 50px;
  background: #ffffff;
  text-align: center;
}
.stats-card {
  display: flex;
  justify-content: center;
  gap: 60px;
  margin-top: 40px;
}
.stat-value {
  font-family: 'Montserrat', sans-serif;
  font-size: 42px;
  font-weight: 800;
  color: var(--accent-sanko);
}
.stat-label {
  font-size: 16px;
  color: #555;
  font-weight: 600;
}

/* ==================== ANIMATIONS ==================== */
.fade-in {
  animation: fadeIn 1s ease both;
}
.slide-in-right {
  animation: slideInRight 1s ease both;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(60px); }
  to { opacity: 1; transform: translateX(0); }
}

/* ==================== RESPONSIVE ==================== */
@media (max-width: 900px) {
  .hero-section {
    flex-direction: column-reverse;
    text-align: center;
    padding: 60px 20px;
  }
  .hero-content {
    max-width: 100%;
  }
  .hero-illustration img {
    max-width: 80%;
    margin-bottom: 40px;
  }
}
</style>
