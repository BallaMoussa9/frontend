<template>
  <AppLayout>
    <div class="page-container">
      <section class="hero-mini">
        <div class="hero-content">
          <span class="badge">
            <Info :size="16" />
            Notre Histoire
          </span>
          <h1>À propos de SanTeKo</h1>
          <p>Découvrez notre mission, notre vision et l'équipe derrière la révolution de la santé au Mali.</p>
        </div>
      </section>

      <section class="content-section">
        <div class="section-grid">
          <div class="text-content">
            <h2>Notre Mission</h2>
            <p>
              SanTeKo est née d'une vision simple mais ambitieuse : rendre les soins de santé accessibles, 
              efficaces et modernes pour tous les Maliens. Nous croyons que la technologie peut transformer 
              la façon dont les soins sont dispensés et reçus.
            </p>
            <p>
              Notre plateforme connecte patients, médecins, infirmiers, laborantins et urgentistes dans un 
              écosystème numérique intégré, permettant une coordination sans précédent des soins de santé.
            </p>
          </div>
          <div class="image-content">
            <div class="image-card">
              <Heart :size="80" class="icon-large" />
            </div>
          </div>
        </div>
      </section>

      <section class="values-section">
        <h2>Nos Valeurs</h2>
        <div class="values-grid">
          <div class="value-card" v-for="value in values" :key="value.title">
            <div class="value-icon">
              <component :is="value.icon" :size="32" />
            </div>
            <h3>{{ value.title }}</h3>
            <p>{{ value.description }}</p>
          </div>
        </div>
      </section>

      <section class="team-section">
        <h2>Notre Équipe</h2>
        <p class="section-subtitle">Des experts passionnés par l'innovation en santé</p>
        <div class="team-grid">
          <div class="team-card" v-for="member in team" :key="member.name">
            <div class="team-avatar">
              <User :size="40" />
            </div>
            <h3>{{ member.name }}</h3>
            <span class="role">{{ member.role }}</span>
            <p>{{ member.bio }}</p>
          </div>
        </div>
      </section>

      <section class="cta-section">
        <h2>Rejoignez l'aventure SanTeKo</h2>
        <p>Ensemble, construisons l'avenir de la santé au Mali</p>
        <div class="cta-buttons">
          <router-link to="/contact" class="btn-primary">
            <Mail :size="20" />
            Nous contacter
          </router-link>
          <router-link to="/carrieres" class="btn-secondary">
            <Briefcase :size="20" />
            Voir les offres
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
import { Heart, Shield, Users, Zap, Target, Award, Info, User, Mail, Briefcase } from 'lucide-vue-next'
import { ref } from 'vue'

const values = ref([
  {
    icon: Heart,
    title: 'Humanité',
    description: 'Le patient est au cœur de tout ce que nous faisons. Chaque fonctionnalité est pensée pour améliorer son expérience.'
  },
  {
    icon: Shield,
    title: 'Sécurité',
    description: 'La protection des données de santé est notre priorité absolue. Nous appliquons les standards les plus stricts.'
  },
  {
    icon: Zap,
    title: 'Innovation',
    description: 'Nous repoussons constamment les limites de la technologie pour offrir des solutions de pointe.'
  },
  {
    icon: Users,
    title: 'Collaboration',
    description: 'Nous travaillons main dans la main avec les professionnels de santé pour créer des outils adaptés.'
  },
  {
    icon: Target,
    title: 'Excellence',
    description: 'Nous visons l\'excellence dans chaque aspect de notre plateforme et de notre service.'
  },
  {
    icon: Award,
    title: 'Intégrité',
    description: 'Transparence et honnêteté guident toutes nos actions et décisions.'
  }
])

const team = ref([
  {
    name: 'Dr. Amadou Diallo',
    role: 'Fondateur & CEO',
    bio: 'Médecin et entrepreneur, passionné par l\'innovation en santé.'
  },
  {
    name: 'Fatoumata Konaté',
    role: 'Directrice Technique',
    bio: 'Experte en développement logiciel avec 10 ans d\'expérience.'
  },
  {
    name: 'Ibrahim Touré',
    role: 'Responsable Médical',
    bio: 'Médecin spécialiste en santé publique et télémédecine.'
  },
  {
    name: 'Mariam Sangaré',
    role: 'Directrice Marketing',
    bio: 'Spécialiste en communication santé et engagement patient.'
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
  background: linear-gradient(135deg, #fff, #cbd5e1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-mini p {
  font-size: 1.3rem;
  color: #94a3b8;
  max-width: 600px;
  margin: 0 auto;
}

.content-section {
  padding: 80px 5%;
  max-width: 1200px;
  margin: 0 auto;
}

.section-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.text-content h2 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 24px;
  color: #fff;
}

.text-content p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #94a3b8;
  margin-bottom: 20px;
}

.image-card {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(16, 185, 129, 0.2));
  border-radius: 24px;
  padding: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.icon-large {
  color: #3b82f6;
}

.values-section {
  padding: 80px 5%;
  background: rgba(0, 0, 0, 0.2);
}

.values-section h2 {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 60px;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.value-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.value-card:hover {
  transform: translateY(-8px);
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.08);
}

.value-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #2563eb, #10b981);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  color: white;
}

.value-card h3 {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.value-card p {
  color: #94a3b8;
  line-height: 1.7;
}

.team-section {
  padding: 80px 5%;
  max-width: 1200px;
  margin: 0 auto;
}

.team-section h2 {
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

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.team-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.team-card:hover {
  transform: translateY(-8px);
  border-color: #3b82f6;
}

.team-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #2563eb, #10b981);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
}

.team-card h3 {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.team-card .role {
  color: #3b82f6;
  font-weight: 600;
  font-size: 14px;
  display: block;
  margin-bottom: 16px;
}

.team-card p {
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
  display: inline-flex;
  align-items: center;
  gap: 10px;
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
  
  .section-grid {
    grid-template-columns: 1fr;
  }
  
  .image-card {
    display: none;
  }
}
</style>
