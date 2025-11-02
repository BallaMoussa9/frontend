<template>
  <AppLayout>
    <div class="landing-page-container">

      <section class="hero-section hero-strategic">
        <div class="hero-content">
          <h1>
            Santé au Mali : <br/>
            <span class="highlight-text">SanTeKo, un Système d'Urgence et de Soins Intégré.</span>
          </h1>
          <p class="tagline">
            Face aux défis sanitaires majeurs (pénurie de professionnels, accès inégal), SanTeKo déploie un **Système d'Information Hospitalier (SIH) innovant**. Notre mission : digitaliser, sécuriser et coordonner l'accès aux soins de qualité pour tous les Maliens.
          </p>

          <div class="user-state-actions">
            <div v-if="isLoggedIn" class="logged-in-state">
              <img :src="profilePhoto" alt="Photo de profil" class="avatar" />
              <div class="user-info">
                <p class="welcome-message">Bienvenue, **{{ fullName }}** !</p>
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

        <div class="hero-illustration">
            <img src="/santeko.png" alt="Logo Santeko - Plateforme de santé numérique" />
        </div>
      </section>

      <section class="roles-features-section">
        <h2 class="section-heading">🧑‍⚕️ Actions et Responsabilités par Rôle</h2>
        <p class="section-subheading">
            SanTeKo organise l'écosystème de santé. Chaque acteur (Patient, Docteur, Infirmier, Admin) bénéficie d'un espace sécurisé et de permissions spécifiques, optimisées pour son rôle dans la chaîne de soins.
        </p>

        <div class="roles-container">
            <div class="role-card patient-role">
                <h3 class="role-title"><i class="fas fa-user-injured"></i> Rôle Patient</h3>
                <ul class="role-features-list">
                    <li><span class="feature-name">Mon Profil Médical :</span> Consultation et mise à jour des données personnelles et de santé (allergies, groupe sanguin, etc.).</li>
                    <li><span class="feature-name">Gestion des Rendez-vous :</span> Prise de RDV simplifiée et consultation de l'historique des consultations.</li>
                    <li><span class="feature-name">Accès à l'Historique :</span> Consultation sécurisée du Dossier Médical Électronique (DME) complet.</li>
                    <li><span class="feature-name">Alerte d'Urgence SOS :</span> Déclenchement rapide et géolocalisé pour une intervention immédiate.</li>
                </ul>
            </div>

            <div class="role-card doctor-role">
                <h3 class="role-title"><i class="fas fa-user-md"></i> Rôle Docteur</h3>
                <ul class="role-features-list">
                    <li><span class="feature-name">Gestion de l'Agenda :</span> Maîtrise de l'emploi du temps (consultation, confirmation ou rejet des RDV).</li>
                    <li><span class="feature-name">Accès aux Dossiers :</span> Recherche rapide et accès instantané aux Dossiers Médicaux Électroniques (DME).</li>
                    <li><span class="feature-name">Actes Médicaux :</span> Prescription d'ordonnances numériques et émission de rapports médicaux pour enrichir le suivi.</li>
                </ul>
            </div>

            <div class="role-card nurse-role">
                <h3 class="role-title"><i class="fas fa-user-nurse"></i> Rôle Infirmier</h3>
                <ul class="role-features-list">
                    <li><span class="feature-name">Collecte de Données :</span> Enregistrement et consultation de l'historique des **Signes Vitaux** (tension, pouls, température).</li>
                    <li><span class="feature-name">Traçabilité des Interventions :</span> Gestion des Rapports Médicaux pour la continuité des soins.</li>
                    <li><span class="feature-name">Coordination des Soins :</span> Consultation du Dossier Patient complet et des listes d'organisation du département.</li>
                </ul>
            </div>

            <div class="role-card admin-role">
                <h3 class="role-title"><i class="fas fa-shield-alt"></i> Pilotage et Supervision (Admin)</h3>
                <ul class="role-features-list">
                    <li><span class="feature-name">Gestion Centralisée :</span> Administration des comptes (Médecins, Infirmiers, Techniciens) et de la structure hospitalière (Départements).</li>
                    <li><span class="feature-name">Supervision Opérationnelle :</span> Suivi en temps réel des **Alertes d'Urgence** et contrôle de conformité des Dossiers Médicaux.</li>
                    <li><span class="feature-name">Administration Système :</span> Configuration des rôles utilisateurs, des paramètres de l'hôpital et envoi de notifications.</li>
                </ul>
            </div>
        </div>
      </section>

      <section class="about-sanko">
        <h2 class="section-heading">📈 SanTeKo en Chiffres Clés</h2>
        <div class="about-content">
          <p class="about-text">
            SanTeKo garantit la qualité, l'interopérabilité et la continuité des soins. Grâce à des fonctionnalités de supervision complètes, la plateforme est la base essentielle pour l'amélioration du système de santé malien.
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

/* * La liste mvpFlux a été supprimée du script pour respecter la consigne.
*/
</script>

<style scoped>
/* ========================================= */
/* VARIABLES & FONT AWESOME                  */
/* ========================================= */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700;800&family=Poppins:wght@400;600&display=swap');

:root {
  --primary-sanko: #0040d0; /* Bleu profond, couleur principale Santeko */
  --accent-sanko: #28a745; /* Vert vibrant pour CTA et highlights */
  --danger-sos: #dc3545; /* Rouge pour l'urgence */
  --text-dark: #333333;
  --text-light: #ffffff;
  --bg-light: #f8f9fa;
  --bg-card: #ffffff;
  --shadow-subtle: rgba(0, 0, 0, 0.1);
  --font-hero: 'Montserrat', sans-serif;
  --font-body: 'Poppins', sans-serif;
  --border-color: #e9ecef;
}

/* ========================================= */
/* MISE EN PAGE GÉNÉRALE                     */
/* ========================================= */
.landing-page-container {
  font-family: var(--font-body);
  color: var(--text-dark);
  padding-bottom: 60px;
}

.section-heading {
  font-family: var(--font-hero);
  font-size: 32px;
  font-weight: 800;
  color: var(--primary-sanko);
  text-align: center;
  margin-bottom: 15px;
}
.section-subheading {
    font-size: 18px;
    color: #6c757d;
    text-align: center;
    max-width: 900px;
    margin: 0 auto 50px auto;
}

/* ========================================= */
/* 1. HERO SECTION (Stratégique) */
/* ========================================= */
.hero-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 30px;
  background-color: var(--bg-card);
}

.hero-content {
  max-width: 50%;
}

.hero-section h1 {
  font-family: var(--font-hero);
  font-size: 52px;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 20px;
  color: var(--text-dark);
}

.highlight-text {
  color: var(--primary-sanko);
  border-bottom: 5px solid var(--accent-sanko);
  padding-bottom: 5px;
}

.tagline {
  font-size: 20px;
  line-height: 1.6;
  color: #495057;
  margin-bottom: 40px;
  font-style: italic;
}

.hero-illustration {
    max-width: 45%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.hero-illustration img {
    max-width: 100%;
    height: auto;
    border-radius: 10px;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
}

/* CTA & Logged-in State */
.user-state-actions { margin-top: 30px; }
.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 15px 35px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 17px;
  transition: all 0.3s ease;
  text-decoration: none;
}
.primary {
  background-color: var(--primary-sanko);
  color: var(--text-light);
}
.primary:hover {
  background-color: #0030a0;
  transform: translateY(-2px);
}
.secondary {
  background-color: transparent;
  color: var(--primary-sanko);
  border: 2px solid var(--primary-sanko);
  padding: 13px 33px;
}
.secondary:hover {
  background-color: #e9ecef;
}
.logged-in-state {
    display: flex;
    align-items: center;
    gap: 20px;
}
.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--accent-sanko);
}
.welcome-message {
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 8px;
}
.login-prompt {
    margin-top: 15px;
    font-size: 14px;
    color: #6c757d;
}
.login-prompt a {
    color: var(--primary-sanko);
    font-weight: 600;
    text-decoration: none;
}

/* ========================================= */
/* 2. RÔLES ET RESPONSABILITÉS (Actions Métier) */
/* ========================================= */
.roles-features-section {
    padding: 60px 30px;
    background-color: var(--bg-light); /* Changement de fond pour donner plus d'importance */
}

.roles-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
    max-width: 1000px;
    margin: 0 auto;
}

.role-card {
    background-color: var(--bg-card); /* Fond blanc pour les cartes */
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    transition: all 0.3s;
}
.role-card:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.role-title {
    font-family: var(--font-hero);
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 3px solid;
    display: flex;
    align-items: center;
}
.role-title i {
    margin-right: 10px;
    font-size: 1.2em;
}

/* Couleurs d'accentuation par rôle */
.patient-role { border-left: 5px solid var(--primary-sanko); }
.patient-role .role-title { color: var(--primary-sanko); border-bottom-color: var(--primary-sanko); }

.doctor-role { border-left: 5px solid var(--accent-sanko); }
.doctor-role .role-title { color: var(--accent-sanko); border-bottom-color: var(--accent-sanko); }

.nurse-role { border-left: 5px solid #ffc107; }
.nurse-role .role-title { color: #ffc107; border-bottom-color: #ffc107; }

.admin-role { border-left: 5px solid var(--danger-sos); }
.admin-role .role-title { color: var(--danger-sos); border-bottom-color: var(--danger-sos); }


.role-features-list {
    list-style: none;
    padding: 0;
}
.role-features-list li {
    background: #f0f8ff; /* Bleu très léger pour les items */
    padding: 12px 15px;
    border-radius: 8px;
    margin-bottom: 10px;
    font-size: 16px;
    line-height: 1.4;
    display: flex;
    align-items: center;
    position: relative;
    padding-left: 40px;
}
.role-features-list li::before {
    content: "•";
    position: absolute;
    left: 15px;
    font-size: 1.5em;
    color: var(--primary-sanko);
}

.feature-name {
    font-weight: 600;
    color: var(--text-dark);
    margin-right: 5px;
}

/* ========================================= */
/* 3. STATISTIQUES (Crédibilité) */
/* ========================================= */
.about-sanko {
    padding: 60px 30px;
    background-color: var(--bg-card); /* Changement de fond pour contraste */
}
.about-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 50px;
    max-width: 1200px;
    margin: 0 auto;
}
.about-text {
    max-width: 60%;
    font-size: 18px;
    line-height: 1.7;
    color: var(--text-dark);
    padding-right: 20px;
    border-right: 2px solid var(--border-color);
}
.stats-card {
    max-width: 40%;
    display: flex;
    flex-direction: column;
    gap: 20px;
    background-color: var(--bg-light); /* Fond gris léger pour le bloc Stats */
    padding: 30px;
    border-radius: 10px;
    box-shadow: var(--shadow-subtle);
}
.stat-item {
    text-align: center;
    border-bottom: 1px dashed #ced4da;
    padding-bottom: 15px;
}
.stat-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
}
.stat-value {
    font-family: var(--font-hero);
    font-size: 36px;
    font-weight: 800;
    color: var(--accent-sanko);
    display: block;
}
.stat-label {
    font-size: 16px;
    color: var(--primary-sanko);
    font-weight: 600;
}


/* ========================================= */
/* RESPONSIVE                                */
/* ========================================= */
@media (max-width: 1024px) {
  .hero-section {
    flex-direction: column-reverse;
    text-align: center;
    padding: 60px 20px;
  }
  .hero-content {
    max-width: 100%;
    margin-top: 40px;
  }
  .hero-section h1 {
    font-size: 40px;
  }
  .hero-illustration {
      max-width: 70%;
  }

  /* Rôles en 1 colonne sur tablette */
  .roles-container {
      grid-template-columns: 1fr;
      max-width: 600px;
  }

  .about-content {
      flex-direction: column;
      align-items: center;
  }
  .about-text {
      max-width: 100%;
      border-right: none;
      border-bottom: 2px solid var(--border-color);
      padding-bottom: 30px;
      margin-bottom: 30px;
      padding-right: 0;
  }
  .stats-card {
      max-width: 100%;
      flex-direction: row;
      justify-content: space-around;
  }
  .stat-item {
      border-bottom: none;
      border-right: 1px dashed #ced4da;
      padding-right: 15px;
  }
  .stat-item:last-child {
      border-right: none;
  }
}

@media (max-width: 600px) {
  .hero-section h1 {
    font-size: 32px;
  }
  /* Rôles en 1 colonne sur mobile */
  .roles-container {
      grid-template-columns: 1fr;
  }
  .hero-illustration {
      max-width: 100%;
  }
  .stats-card {
      flex-direction: column;
  }
  .stat-item {
      border-right: none;
  }
}
</style>
