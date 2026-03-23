<template>
  <AppLayout>
    <div class="landing-page-container">

      <!-- ================= HERO AVEC PARTICULES ================= -->
      <section class="hero-section">
        <div class="particles-bg">
          <div class="particle" v-for="n in 50" :key="n" :style="getParticleStyle(n)"></div>
        </div>
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>

        <div class="hero-content">
          <div class="badge-container">
            <span class="badge">
              <span class="pulse-dot"></span>
              🚑 HealthTech Mali - Innovation Santé 2026
            </span>
          </div>

          <h1 class="hero-title">
            <span class="title-line">La Santé du Mali,</span>
            <span class="title-line highlight">Réinventée</span>
            <span class="title-line brand-name">SanTeKo</span>
          </h1>

          <p class="tagline">
            Plateforme médicale intelligente qui connecte patients, professionnels de santé 
            et infrastructures pour un système de santé plus efficace, rapide et humain.
          </p>

          <div class="hero-buttons">
            <router-link to="/connection" class="action-button primary">
              <span class="button-content">
                Accéder au système
                <i class="fas fa-arrow-right button-icon"></i>
              </span>
              <div class="button-glow"></div>
            </router-link>

            <button class="action-button secondary" @click="scrollToDemo">
              <span class="button-content">
                <i class="fas fa-play button-icon"></i>
                Voir la démo
              </span>
            </button>
          </div>

          <div class="trust-indicators">
            <div class="indicator">
              <i class="fas fa-shield-check"></i>
              <span>Sécurisé</span>
            </div>
            <div class="indicator">
              <i class="fas fa-clock"></i>
              <span>24/7</span>
            </div>
            <div class="indicator">
              <i class="fas fa-users"></i>
              <span>10K+ Utilisateurs</span>
            </div>
          </div>
        </div>

        <div class="hero-illustration">
          <div class="illustration-container">
            <div class="floating-card card-1">
              <i class="fas fa-heartbeat"></i>
              <span>Monitoring</span>
            </div>
            <div class="floating-card card-2">
              <i class="fas fa-user-md"></i>
              <span>Consultation</span>
            </div>
            <div class="floating-card card-3">
              <i class="fas fa-pills"></i>
              <span>Prescription</span>
            </div>
            <div class="main-illustration">
              <div class="pulse-ring"></div>
              <img src="/santeko.png" class="hero-img"/>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= STATS ANIMÉES ================= -->
      <section class="stats-section">
        <div class="stat-card" v-for="(stat, index) in stats" :key="index">
          <div class="stat-icon">
            <component :is="stat.icon" :size="32" />
          </div>
          <div class="stat-content">
            <h3 class="stat-number" :data-target="stat.value">{{ stat.display }}</h3>
            <p class="stat-label">{{ stat.label }}</p>
          </div>
        </div>
      </section>

      <!-- ================= FEATURES AVEC ILLUSTRATIONS ================= -->
      <section class="features-section">
        <div class="section-header">
          <span class="section-badge">Fonctionnalités</span>
          <h2>Pourquoi SanTeKo ?</h2>
          <p>Une solution complète adaptée aux défis de la santé au Mali</p>
        </div>

        <div class="features-grid">
          <div class="feature-card" v-for="(feature, index) in features" :key="index">
            <div class="feature-illustration">
              <div class="icon-bg">
                <component :is="feature.icon" :size="32" />
              </div>
              <div class="decoration-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
            <div class="feature-content">
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
              <div class="feature-tech">
                <span v-for="tech in feature.tech" :key="tech">{{ tech }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= ROLES AVEC AVATARS ================= -->
      <section class="roles-section">
        <div class="section-header">
          <span class="section-badge">Multi-Rôles</span>
          <h2>Plateforme pour Tous</h2>
          <p>Chaque acteur de la santé dispose d'outils adaptés</p>
        </div>

        <div class="roles-container">
          <div class="role-card" v-for="(role, index) in roles" :key="index">
            <div class="role-avatar">
              <div class="avatar-bg">
                <component :is="role.icon" :size="36" />
              </div>
              <div class="status-indicator online"></div>
            </div>
            <h3>{{ role.title }}</h3>
            <p class="role-description">{{ role.description }}</p>
            <ul class="role-features">
              <li v-for="feature in role.features" :key="feature">
                <CheckCircle :size="16" class="check-icon" />
                {{ feature }}
              </li>
            </ul>
            <router-link :to="role.link" class="role-action">
              En savoir plus
              <ArrowRight :size="18" />
            </router-link>
          </div>
        </div>
      </section>

      <!-- ================= TESTIMONIALS ================= -->
      <section class="testimonials-section">
        <div class="section-header">
          <span class="section-badge">Témoignages</span>
          <h2>Ils nous font confiance</h2>
        </div>

        <div class="testimonials-slider">
          <div class="testimonial-card" v-for="(testimonial, index) in testimonials" :key="index">
            <div class="testimonial-content">
              <div class="quote-icon">"</div>
              <p>{{ testimonial.text }}</p>
            </div>
            <div class="testimonial-author">
              <img :src="testimonial.avatar" :alt="testimonial.name"/>
              <div class="author-info">
                <h4>{{ testimonial.name }}</h4>
                <span>{{ testimonial.role }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= CTA AVEC EFFET PARALLAX ================= -->
      <section class="cta-section">
        <div class="cta-bg"></div>
        <div class="cta-content">
          <h2>Prêts à révolutionner la santé au Mali ?</h2>
          <p>Rejoignez des milliers de professionnels et patients qui utilisent déjà SanTeKo</p>
          
          <div class="cta-buttons">
            <router-link to="/connection" class="cta-button primary">
              <span>Commencer gratuitement</span>
              <Rocket :size="20" />
            </router-link>
            <router-link to="/contact" class="cta-button secondary">
              <span>Contacter l'équipe</span>
              <Phone :size="20" />
            </router-link>
          </div>

          <div class="cta-features">
            <div class="cta-feature">
              <CheckCircle :size="20" />
              <span>Essai gratuit </span>
            </div>
            <div class="cta-feature">
              <CheckCircle :size="20" />
              <span>Formation incluse</span>
            </div>
            <div class="cta-feature">
              <CheckCircle :size="20" />
              <span>Support 24/7</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= FOOTER ================= -->
      <AppFooter />

    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useAuthStore } from '../stores/authStores'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  User, Stethoscope, Heart, Shield, FlaskConical, Calculator, Ambulance,
  CheckCircle, ArrowRight, Activity, FileText, BarChart3, Video, Pill,
  Rocket, Phone, Clock, Users, ShieldCheck
} from 'lucide-vue-next'

const auth = useAuthStore()
const router = useRouter()

const isLoggedIn = computed(() => auth.isLoggedIn)
const fullName = computed(() => auth.fullName)
const profilePhoto = computed(() => auth.profilePhotoUrl || 'https://i.pravatar.cc/100')

// Données dynamiques pour les statistiques avec icônes Lucide
const stats = ref([
  { value: 10000, display: '10K+', label: 'Utilisateurs Actifs', icon: Users },
  { value: 150, display: '150+', label: 'Professionnels', icon: Stethoscope },
  { value: 24, display: '24/7', label: 'Support Urgence', icon: Clock },
  { value: 99, display: '99%', label: 'Satisfaction', icon: ShieldCheck }
])

// Données enrichies pour les fonctionnalités avec icônes Lucide
const features = ref([
  {
    icon: Activity,
    title: 'Monitoring Temps Réel',
    description: 'Surveillance continue des patients avec alertes intelligentes et tableaux de bord interactifs.',
    tech: ['IoT', 'AI/ML', 'Cloud']
  },
  {
    icon: Ambulance,
    title: 'Urgence SOS',
    description: 'Géolocalisation précise, temps de réponse optimisé et coordination des services d\'urgence.',
    tech: ['GPS', 'Maps API', 'Real-time']
  },
  {
    icon: FileText,
    title: 'Dossier Médical Digital',
    description: 'Historique complet, partage sécurisé et accès multi-plateforme pour tous les acteurs de santé.',
    tech: ['Blockchain', 'HIPAA', 'Secure']
  },
  {
    icon: BarChart3,
    title: 'Analytics Avancés',
    description: 'Statistiques prédictives, reporting personnalisé et aide à la décision médicale.',
    tech: ['Big Data', 'BI', 'Predictive']
  },
  {
    icon: Video,
    title: 'Téléconsultation',
    description: 'Consultations à distance, partage d\'écrans et intégration d\'équipements médicaux.',
    tech: ['WebRTC', 'HD Video', 'Mobile']
  },
  {
    icon: Pill,
    title: 'Gestion Pharmacie',
    description: 'Suivi des prescriptions, gestion des stocks et alertes de renouvellement automatiques.',
    tech: ['QR Code', 'Inventory', 'Smart']
  }
])

// Données enrichies pour les rôles avec icônes Lucide et liens
const roles = ref([
  {
    icon: User,
    title: 'Patient',
    description: 'Accès complet à votre santé',
    features: ['Prise de RDV en ligne', 'Dossier médical personnel', 'Alertes médicaments', 'Consultation vidéo'],
    link: '/fonctionnalites'
  },
  {
    icon: Stethoscope,
    title: 'Médecin',
    description: 'Outils de pointe pour les professionnels',
    features: ['Agenda intelligent', 'Prescriptions digitales', 'Accès patient', 'Statistiques'],
    link: '/fonctionnalites'
  },
  {
    icon: Heart,
    title: 'Infirmier',
    description: 'Gestion optimisée des soins',
    features: ['Planning des soins', 'Suivi patient', 'Rapports automatisés', 'Communication'],
    link: '/fonctionnalites'
  },
  {
    icon: Shield,
    title: 'Administrateur',
    description: 'Contrôle total du système',
    features: ['Gestion utilisateurs', 'Rapports détaillés', 'Sécurité', 'Configuration'],
    link: '/a-propos'
  },
  {
    icon: FlaskConical,
    title: 'Laborantin',
    description: 'Gestion moderne du labo',
    features: ['Résultats en ligne', 'Gestion échantillons', 'Automatisation', 'Qualité'],
    link: '/fonctionnalites'
  },
  {
    icon: Calculator,
    title: 'Comptable',
    description: 'Finance simplifiée',
    features: ['Facturation auto', 'Rapports financiers', 'Assurance', 'Analyse coûts'],
    link: '/tarification'
  }
])

// Témoignages
const testimonials = ref([
  {
    text: 'SanTeKo a transformé notre façon de travailler. Plus rapide, plus efficace, et surtout plus humain.',
    name: 'Dr. Konaté',
    role: 'Médecin Chef, Hôpital Bamako',
    avatar: 'https://i.pravatar.cc/150?img=1'
  },
  {
    text: 'Je peux maintenant suivre mes patients en temps réel. La qualité des soins s\'est nettement améliorée.',
    name: 'Mme. Touré',
    role: 'Infirmière en chef',
    avatar: 'https://i.pravatar.cc/150?img=2'
  },
  {
    text: 'Une révolution pour la santé au Mali. Simple, puissant et adapté à nos réalités.',
    name: 'Dr. Diallo',
    role: 'Directeur clinique',
    avatar: 'https://i.pravatar.cc/150?img=3'
  }
])

// Méthodes
const logout = () => {
  auth.logout()
  router.push('/')
}

const scrollToDemo = () => {
  const demoSection = document.querySelector('.testimonials-section')
  if (demoSection) {
    demoSection.scrollIntoView({ behavior: 'smooth' })
  }
}

const getParticleStyle = (index) => {
  const size = Math.random() * 4 + 1
  const posX = Math.random() * 100
  const posY = Math.random() * 100
  const delay = Math.random() * 20
  const duration = Math.random() * 20 + 10
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${posX}%`,
    top: `${posY}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}

// Animation des chiffres au scroll
const animateNumbers = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.target)
        const duration = 2000
        const step = target / (duration / 16)
        let current = 0
        
        const timer = setInterval(() => {
          current += step
          if (current >= target) {
            current = target
            clearInterval(timer)
          }
          
          if (target >= 1000) {
            entry.target.textContent = `${Math.floor(current / 1000)}K+`
          } else if (target === 24) {
            entry.target.textContent = '24/7'
          } else if (target === 99) {
            entry.target.textContent = `${Math.floor(current)}%`
          } else {
            entry.target.textContent = `${Math.floor(current)}+`
          }
        }, 16)
        
        observer.unobserve(entry.target)
      }
    })
  })
  
  document.querySelectorAll('.stat-number').forEach(el => {
    observer.observe(el)
  })
}

onMounted(() => {
  animateNumbers()
})
</script>

<style scoped>
/* ===== IMPORTS ET VARIABLES ===== */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

:root {
  --primary: #2563eb;
  --primary-dark: #1e40af;
  --primary-light: #3b82f6;
  --secondary: #10b981;
  --secondary-dark: #059669;
  --accent: #8b5cf6;
  --danger: #ef4444;
  --warning: #f59e0b;
  --success: #22c55e;
  --dark: #0f172a;
  --light: #ffffff;
  --gray: #94a3b8;
  --gray-light: #cbd5e1;
  --gray-dark: #64748b;
  --border: rgba(255, 255, 255, 0.1);
  --shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  --shadow-xl: 0 30px 60px -12px rgba(0, 0, 0, 0.5);
}

/* ===== GLOBAL ===== */
.landing-page-container {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  color: var(--light);
  overflow-x: hidden;
  scroll-behavior: smooth;
  position: relative;
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

/* Reset global margins */
.landing-page-container * {
  box-sizing: border-box;
}

/* ===== HERO SECTION ===== */
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 80px 5%;
  position: relative;
  overflow: hidden;
  background: radial-gradient(ellipse at top, rgba(37, 99, 235, 0.15) 0%, transparent 50%);
}

/* Particules animées */
.particles-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  background: linear-gradient(45deg, var(--primary-light), var(--secondary));
  border-radius: 50%;
  opacity: 0.6;
  animation: float-particle linear infinite;
  box-shadow: 0 0 10px rgba(37, 99, 235, 0.5);
}

@keyframes float-particle {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-100vh) rotate(360deg);
    opacity: 0;
  }
}

/* Orbes de décoration */
.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.2;
  animation: pulse-orb 10s ease-in-out infinite;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  top: -150px;
  left: -150px;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, var(--secondary), var(--primary));
  bottom: -100px;
  right: 20%;
  animation-delay: 3s;
}

.orb-3 {
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, var(--accent), var(--secondary));
  top: 50%;
  right: -100px;
  animation-delay: 6s;
}

@keyframes pulse-orb {
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.2) rotate(180deg);
  }
}

/* Hero Content */
.hero-content {
  max-width: 600px;
  z-index: 10;
  position: relative;
}

.badge-container {
  margin-bottom: 24px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  padding: 10px 20px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
  animation: slide-in-left 0.8s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.pulse-dot {
  width: 10px;
  height: 10px;
  background: var(--success);
  border-radius: 50%;
  animation: pulse 2s infinite;
  box-shadow: 0 0 10px var(--success);
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
}

.hero-title {
  font-size: clamp(3.5rem, 8vw, 6rem);
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 24px;
  color: white;
  text-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
}

.title-line {
  display: block;
  animation: fade-up 0.8s ease backwards;
}

.title-line:nth-child(2) {
  animation-delay: 0.2s;
}

.title-line:nth-child(3) {
  animation-delay: 0.4s;
}

.highlight {
  background: linear-gradient(135deg, var(--primary-light), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 2px 10px rgba(37, 99, 235, 0.5));
}

.brand-name {
  color: var(--primary-light);
  font-size: clamp(4rem, 9vw, 7rem);
  text-shadow: 0 4px 20px rgba(37, 99, 235, 0.5);
}

.tagline {
  font-size: 1.3rem;
  color: #94a3b8;
  line-height: 1.7;
  margin-bottom: 32px;
  animation: fade-up 0.8s ease 0.6s backwards;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

/* Buttons */
.hero-buttons {
  display: flex;
  gap: 16px;
  margin-bottom: 40px;
  animation: fade-up 0.8s ease 0.8s backwards;
}

.action-button {
  position: relative;
  padding: 18px 36px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 16px;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.4s ease;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 2;
}

.button-icon {
  transition: transform 0.3s ease;
}

.action-button:hover .button-icon {
  transform: translateX(6px);
}

.primary {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.primary:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 45px rgba(37, 99, 235, 0.6);
}

.button-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.6s ease;
}

.primary:hover .button-glow {
  left: 100%;
}

.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.3);
}

/* Trust Indicators */
.trust-indicators {
  display: flex;
  gap: 32px;
  animation: fade-up 0.8s ease 1s backwards;
}

.indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.indicator i {
  color: #10b981;
  font-size: 16px;
}

/* Hero Illustration */
.hero-illustration {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.illustration-container {
  position: relative;
  width: 500px;
  height: 500px;
}

.floating-card {
  position: absolute;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(20px);
  padding: 16px 20px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  color: white;
  animation: float-card 4s ease-in-out infinite;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.floating-card i {
  color: #3b82f6;
  font-size: 20px;
}

.card-1 {
  top: 50px;
  left: -30px;
  animation-delay: 0s;
}

.card-2 {
  top: 150px;
  right: -20px;
  animation-delay: 1s;
}

.card-3 {
  bottom: 100px;
  left: 20px;
  animation-delay: 2s;
}

@keyframes float-card {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(2deg);
  }
}

.main-illustration {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pulse-ring {
  position: absolute;
  width: 350px;
  height: 350px;
  border: 3px solid var(--primary);
  border-radius: 50%;
  opacity: 0.3;
  animation: pulse-ring 2s ease-out infinite;
  box-shadow: 0 0 30px rgba(37, 99, 235, 0.5);
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.3;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

.hero-img {
  width: 300px;
  height: auto;
  animation: float-hero 6s ease-in-out infinite;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3));
}

@keyframes float-hero {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-30px);
  }
}

/* ===== STATS SECTION ===== */
.stats-section {
  padding: 100px 5%;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  position: relative;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stats-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--primary), transparent);
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 30px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.4s ease;
  backdrop-filter: blur(20px);
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
}

.stat-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 3rem;
  font-weight: 900;
  color: white;
  margin-bottom: 4px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.stat-label {
  color: #94a3b8;
  font-weight: 600;
  font-size: 1.1rem;
}

/* ===== FEATURES SECTION ===== */
.features-section {
  padding: 120px 5%;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  position: relative;
}

.section-header {
  text-align: center;
  margin-bottom: 80px;
}

.section-badge {
  display: inline-block;
  padding: 8px 20px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 20px;
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.3);
}

.section-header h2 {
  font-size: 3.5rem;
  font-weight: 900;
  color: white;
  margin-bottom: 20px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.section-header p {
  font-size: 1.4rem;
  color: #94a3b8;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.7;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border-radius: 28px;
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.5s ease;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20px);
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.feature-card:hover::before {
  transform: scaleX(1);
}

.feature-card:hover {
  transform: translateY(-12px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
}

.feature-illustration {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.icon-bg {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
}

.decoration-dots {
  display: flex;
  gap: 6px;
}

.decoration-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.decoration-dots span:nth-child(2) {
  background: var(--primary);
  box-shadow: 0 0 10px var(--primary);
}

.feature-content h3 {
  font-size: 1.8rem;
  font-weight: 800;
  color: white;
  margin-bottom: 16px;
}

.feature-content p {
  color: #94a3b8;
  line-height: 1.7;
  margin-bottom: 24px;
  font-size: 1.1rem;
}

.feature-tech {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.feature-tech span {
  padding: 6px 16px;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #3b82f6;
  backdrop-filter: blur(10px);
}

/* ===== ROLES SECTION ===== */
.roles-section {
  padding: 120px 5%;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  position: relative;
}

.roles-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.role-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border-radius: 28px;
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  transition: all 0.5s ease;
  position: relative;
  backdrop-filter: blur(20px);
}

.role-card:hover {
  transform: translateY(-12px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
}

.role-avatar {
  position: relative;
  display: inline-block;
  margin-bottom: 24px;
}

.avatar-bg {
  width: 90px;
  height: 90px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 36px;
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.3);
}

.status-indicator {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.9);
}

.status-indicator.online {
  background: var(--success);
  animation: pulse 2s infinite;
  box-shadow: 0 0 15px var(--success);
}

.role-card h3 {
  font-size: 1.8rem;
  font-weight: 800;
  color: white;
  margin-bottom: 12px;
}

.role-description {
  color: #94a3b8;
  margin-bottom: 24px;
  font-size: 1.1rem;
}

.role-features {
  list-style: none;
  padding: 0;
  margin: 0 0 30px 0;
}

.role-features li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  color: #cbd5e1;
  font-size: 15px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.role-features li:last-child {
  border-bottom: none;
}

.role-features .check-icon {
  color: #10b981;
  flex-shrink: 0;
}

.role-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(135deg, #2563eb, #10b981);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 50px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.4s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
  text-decoration: none;
  font-size: 14px;
}

.role-action:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.5);
  background: linear-gradient(135deg, #3b82f6, #22c55e);
}

/* ===== TESTIMONIALS SECTION ===== */
.testimonials-section {
  padding: 120px 5%;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  position: relative;
}

.testimonials-slider {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.testimonial-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border-radius: 24px;
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  transition: all 0.4s ease;
  backdrop-filter: blur(20px);
}

.testimonial-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary);
}

.quote-icon {
  font-size: 4rem;
  color: var(--primary);
  opacity: 0.2;
  position: absolute;
  top: 30px;
  left: 30px;
  font-family: Georgia, serif;
}

.testimonial-content {
  margin-bottom: 30px;
  position: relative;
  z-index: 2;
}

.testimonial-content p {
  color: white;
  line-height: 1.8;
  font-style: italic;
  font-size: 1.1rem;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 20px;
}

.testimonial-author img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.2);
}

.author-info h4 {
  color: white;
  font-weight: 700;
  margin-bottom: 6px;
  font-size: 1.2rem;
}

.author-info span {
  color: #94a3b8;
  font-size: 15px;
}

/* ===== CTA SECTION ===== */
.cta-section {
  padding: 120px 5%;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  position: relative;
  overflow: hidden;
}

.cta-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(255,255,255,0.05) 0%, transparent 50%);
}

.cta-content {
  text-align: center;
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}

.cta-content h2 {
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 20px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.cta-content p {
  font-size: 1.4rem;
  margin-bottom: 50px;
  opacity: 0.9;
  line-height: 1.7;
}

.cta-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 50px;
  flex-wrap: wrap;
}

.cta-button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 36px;
  border-radius: 50px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.4s ease;
  border: none;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 16px;
}

.cta-button.primary {
  background: white;
  color: #2563eb;
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.3);
}

.cta-button.primary:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 45px rgba(37, 99, 235, 0.4);
}

.cta-button.secondary {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.cta-button.secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: white;
  transform: translateY(-4px);
  box-shadow: 0 20px 45px rgba(255, 255, 255, 0.1);
}

.cta-features {
  display: flex;
  gap: 40px;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-feature {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
}

.cta-feature svg {
  color: #22c55e;
  flex-shrink: 0;
}

/* ===== FOOTER ===== */
.footer {
  background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
  color: white;
  padding: 80px 5% 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 50px;
  margin-bottom: 50px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.footer-section h3 {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 20px;
  color: var(--light);
}

.footer-section h4 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: #cbd5e1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.footer-section p {
  color: #94a3b8;
  line-height: 1.7;
  margin-bottom: 24px;
  font-size: 1rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.footer-logo img {
  width: 50px;
  height: 50px;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.3));
}

.footer-logo h3 {
  margin: 0;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.social-links {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.social-link {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.social-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 14px;
}

.social-link.facebook::before {
  background: linear-gradient(135deg, #1877f2, #0d5bbd);
}

.social-link.twitter::before {
  background: linear-gradient(135deg, #1da1f2, #0c85d0);
}

.social-link.linkedin::before {
  background: linear-gradient(135deg, #0077b5, #005885);
}

.social-link.instagram::before {
  background: linear-gradient(135deg, #e4405f, #c13584, #833ab4);
}

.social-link.github::before {
  background: linear-gradient(135deg, #333, #24292e);
}

.social-link.youtube::before {
  background: linear-gradient(135deg, #ff0000, #cc0000);
}

.social-link:hover {
  transform: translateY(-4px) scale(1.05);
  border-color: transparent;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
}

.social-link:hover::before {
  opacity: 1;
}

.social-link svg {
  position: relative;
  z-index: 2;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section ul li {
  margin-bottom: 12px;
}

.footer-section ul li a {
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 15px;
  display: inline-block;
}

.footer-section ul li a:hover {
  color: var(--primary-light);
  transform: translateX(5px);
}

.footer-bottom {
  border-top: 1px solid #334155;
  padding-top: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.footer-bottom p {
  color: #64748b;
  margin: 0;
  font-size: 14px;
}

.footer-links {
  display: flex;
  gap: 30px;
}

.footer-links a {
  color: #64748b;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
  font-weight: 500;
}

.footer-links a:hover {
  color: var(--primary-light);
}

/* ===== ANIMATIONS GLOBALES ===== */
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 1024px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    gap: 40px;
  }
  
  .hero-content {
    max-width: 100%;
  }
  
  .illustration-container {
    width: 400px;
    height: 400px;
  }
  
  .hero-img {
    width: 250px;
  }
  
  .features-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
  
  .footer-content {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 3rem;
  }
  
  .brand-name {
    font-size: 3.5rem;
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .trust-indicators {
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }
  
  .stats-section {
    padding: 60px 5%;
  }
  
  .stat-card {
    flex-direction: column;
    text-align: center;
  }
  
  .features-section,
  .roles-section,
  .testimonials-section,
  .cta-section {
    padding: 80px 5%;
  }
  
  .section-header h2 {
    font-size: 2rem;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-features {
    flex-direction: column;
    gap: 16px;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .social-links {
    justify-content: center;
  }
  
  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 60px 5%;
  }
  
  .badge {
    font-size: 12px;
    padding: 6px 12px;
  }
  
  .tagline {
    font-size: 1rem;
  }
  
  .action-button {
    padding: 14px 24px;
    font-size: 14px;
  }
  
  .floating-card {
    font-size: 14px;
    padding: 12px 16px;
  }
  
  .illustration-container {
    width: 300px;
    height: 300px;
  }
  
  .hero-img {
    width: 200px;
  }
  
  .pulse-ring {
    width: 250px;
    height: 250px;
  }
}
</style>