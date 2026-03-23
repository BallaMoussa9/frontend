<template>
  <AppLayout>
    <div class="page-container">
      <section class="hero-mini">
        <div class="hero-content">
          <span class="badge">
            <Layers :size="16" />
            Fonctionnalités
          </span>
          <h1>Tout ce dont vous avez besoin</h1>
          <p>Découvrez les fonctionnalités puissantes qui font de SanTeKo la plateforme de santé la plus complète au Mali.</p>
        </div>
      </section>

      <section class="features-main">
        <div class="feature-block" v-for="(feature, index) in features" :key="feature.title" :class="{ 'reverse': index % 2 === 1 }">
          <div class="feature-content">
            <div class="feature-badge">{{ feature.category }}</div>
            <h2>{{ feature.title }}</h2>
            <p>{{ feature.description }}</p>
            <ul class="feature-list">
              <li v-for="item in feature.items" :key="item">
                <CheckCircle :size="20" class="check-icon" />
                {{ item }}
              </li>
            </ul>
          </div>
          <div class="feature-visual">
            <div class="visual-card">
              <component :is="feature.icon" :size="80" class="feature-icon" />
            </div>
          </div>
        </div>
      </section>

      <section class="roles-section">
        <h2>Une plateforme pour tous les acteurs</h2>
        <p class="section-subtitle">Chaque utilisateur dispose d'outils adaptés à son rôle</p>
        
        <div class="roles-grid">
          <div class="role-card" v-for="role in roles" :key="role.title">
            <div class="role-icon">
              <component :is="role.icon" :size="32" />
            </div>
            <h3>{{ role.title }}</h3>
            <p>{{ role.description }}</p>
            <ul>
              <li v-for="feature in role.features" :key="feature">{{ feature }}</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="tech-section">
        <h2>Technologies de pointe</h2>
        <div class="tech-grid">
          <div class="tech-card" v-for="tech in technologies" :key="tech.name">
            <component :is="tech.icon" :size="32" />
            <h3>{{ tech.name }}</h3>
            <p>{{ tech.description }}</p>
          </div>
        </div>
      </section>

      <section class="cta-section">
        <h2>Prêt à découvrir SanTeKo ?</h2>
        <p>Commencez votre essai gratuit de 30 jours dès maintenant</p>
        <div class="cta-buttons">
          <router-link to="/connection" class="btn-primary">
            Commencer gratuitement
          </router-link>
          <router-link to="/demo" class="btn-secondary">
            Voir la démo
          </router-link>
        </div>
      </section>

      <AppFooter />
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import AppFooter from '@/components/AppFooter.vue'
import { 
  Layers, CheckCircle, Heart, Ambulance, FileText, BarChart3, Video, Pill,
  User, Stethoscope, UserCog, FlaskConical, Calculator, Shield, Cloud, Smartphone, Lock
} from 'lucide-vue-next'
import { ref } from 'vue'

const features = ref([
  {
    category: 'Monitoring',
    title: 'Surveillance en temps réel',
    description: 'Suivez l\'état de santé de vos patients avec des tableaux de bord interactifs et des alertes intelligentes.',
    icon: Heart,
    items: [
      'Tableaux de bord personnalisables',
      'Alertes automatiques en cas d\'anomalie',
      'Historique complet des constantes',
      'Graphiques et tendances'
    ]
  },
  {
    category: 'Urgence',
    title: 'Système SOS intégré',
    description: 'Un système d\'urgence complet avec géolocalisation et coordination des équipes d\'intervention.',
    icon: Ambulance,
    items: [
      'Bouton SOS accessible 24/7',
      'Géolocalisation précise',
      'Notification instantanée des urgentistes',
      'Suivi en temps réel des interventions'
    ]
  },
  {
    category: 'Dossiers',
    title: 'Dossier médical numérique',
    description: 'Un dossier médical complet, sécurisé et accessible par tous les professionnels autorisés.',
    icon: FileText,
    items: [
      'Historique médical complet',
      'Partage sécurisé entre professionnels',
      'Accès multi-plateforme',
      'Conformité aux normes de santé'
    ]
  },
  {
    category: 'Analytics',
    title: 'Analyses et rapports',
    description: 'Des outils d\'analyse puissants pour prendre des décisions éclairées.',
    icon: BarChart3,
    items: [
      'Rapports personnalisés',
      'Statistiques prédictives',
      'Export des données',
      'Tableaux de bord administratifs'
    ]
  },
  {
    category: 'Télémédecine',
    title: 'Consultations à distance',
    description: 'Consultez vos patients où qu\'ils soient grâce à notre système de téléconsultation HD.',
    icon: Video,
    items: [
      'Vidéo HD sécurisée',
      'Partage d\'écran et documents',
      'Prise de notes intégrée',
      'Enregistrement des sessions'
    ]
  },
  {
    category: 'Pharmacie',
    title: 'Gestion des prescriptions',
    description: 'Gérez les ordonnances et le suivi des traitements de manière efficace.',
    icon: Pill,
    items: [
      'Ordonnances numériques',
      'Alertes de renouvellement',
      'Vérification des interactions',
      'Historique des traitements'
    ]
  }
])

const roles = ref([
  {
    icon: User,
    title: 'Patient',
    description: 'Accès complet à votre santé',
    features: ['Prise de RDV en ligne', 'Dossier médical personnel', 'Consultation vidéo']
  },
  {
    icon: Stethoscope,
    title: 'Médecin',
    description: 'Outils professionnels avancés',
    features: ['Agenda intelligent', 'Prescriptions digitales', 'Accès aux dossiers']
  },
  {
    icon: UserCog,
    title: 'Infirmier',
    description: 'Gestion optimisée des soins',
    features: ['Planning des soins', 'Suivi des constantes', 'Rapports automatisés']
  },
  {
    icon: FlaskConical,
    title: 'Laborantin',
    description: 'Gestion moderne du laboratoire',
    features: ['Résultats en ligne', 'Gestion des échantillons', 'Automatisation']
  },
  {
    icon: Ambulance,
    title: 'Urgentiste',
    description: 'Réponse rapide aux urgences',
    features: ['Alertes SOS', 'Géolocalisation', 'Coordination équipes']
  },
  {
    icon: Calculator,
    title: 'Comptable',
    description: 'Finance simplifiée',
    features: ['Facturation auto', 'Rapports financiers', 'Gestion assurance']
  }
])

const technologies = ref([
  {
    icon: Shield,
    name: 'Sécurité avancée',
    description: 'Chiffrement de bout en bout et conformité aux normes internationales.'
  },
  {
    icon: Cloud,
    name: 'Cloud sécurisé',
    description: 'Infrastructure cloud haute disponibilité avec sauvegarde automatique.'
  },
  {
    icon: Smartphone,
    name: 'Multi-plateforme',
    description: 'Accessible sur web, mobile et tablette avec synchronisation en temps réel.'
  },
  {
    icon: Lock,
    name: 'Confidentialité',
    description: 'Protection des données de santé selon les standards les plus stricts.'
  }
])
</script>

<style scoped>
.page-container {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  min-height: 100vh;
  color: white;
}

.hero-mini {
  padding: 100px 5% 60px;
  text-align: center;
  background: radial-gradient(ellipse at top, rgba(37, 99, 235, 0.15) 0%, transparent 50%);
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #2563eb, #10b981);
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 24px;
}

.hero-mini h1 {
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 20px;
}

.hero-mini p {
  font-size: 1.3rem;
  color: #94a3b8;
  max-width: 700px;
  margin: 0 auto;
}

.features-main {
  padding: 80px 5%;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-block {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
  margin-bottom: 100px;
}

.feature-block.reverse {
  direction: rtl;
}

.feature-block.reverse > * {
  direction: ltr;
}

.feature-badge {
  display: inline-block;
  padding: 6px 16px;
  background: rgba(37, 99, 235, 0.2);
  color: #3b82f6;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 20px;
}

.feature-content h2 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 20px;
}

.feature-content > p {
  font-size: 1.1rem;
  color: #94a3b8;
  line-height: 1.8;
  margin-bottom: 30px;
}

.feature-list {
  list-style: none;
  padding: 0;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  font-size: 1rem;
  color: #cbd5e1;
}

.check-icon {
  color: #10b981;
  flex-shrink: 0;
}

.feature-visual {
  display: flex;
  justify-content: center;
}

.visual-card {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(16, 185, 129, 0.2));
  border-radius: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.feature-icon {
  color: #3b82f6;
}

.roles-section {
  padding: 100px 5%;
  background: rgba(0, 0, 0, 0.2);
}

.roles-section h2 {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 12px;
}

.section-subtitle {
  text-align: center;
  color: #94a3b8;
  font-size: 1.2rem;
  margin-bottom: 60px;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.role-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.role-card:hover {
  transform: translateY(-8px);
  border-color: #3b82f6;
}

.role-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #2563eb, #10b981);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  color: white;
}

.role-card h3 {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.role-card > p {
  color: #94a3b8;
  margin-bottom: 20px;
}

.role-card ul {
  list-style: none;
  padding: 0;
}

.role-card ul li {
  padding: 8px 0;
  color: #cbd5e1;
  font-size: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.role-card ul li:last-child {
  border-bottom: none;
}

.tech-section {
  padding: 100px 5%;
  max-width: 1200px;
  margin: 0 auto;
}

.tech-section h2 {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 60px;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.tech-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.tech-card:hover {
  border-color: #3b82f6;
  transform: translateY(-5px);
}

.tech-card svg {
  color: #3b82f6;
  margin-bottom: 20px;
}

.tech-card h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.tech-card p {
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.6;
}

.cta-section {
  padding: 100px 5%;
  text-align: center;
  background: linear-gradient(135deg, #2563eb, #10b981);
}

.cta-section h2 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 16px;
}

.cta-section p {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 40px;
}

.cta-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  padding: 16px 32px;
  border-radius: 50px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-primary {
  background: white;
  color: #2563eb;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .hero-mini h1 {
    font-size: 2.5rem;
  }
  
  .feature-block {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .feature-block.reverse {
    direction: ltr;
  }
  
  .visual-card {
    width: 200px;
    height: 200px;
  }
}
</style>
