<template>
  <AppLayout>
    <div class="page-container">
      <section class="hero-mini">
        <div class="hero-content">
          <span class="badge">
            <GraduationCap :size="16" />
            Formation
          </span>
          <h1>Centre de Formation SanTeKo</h1>
          <p>Maîtrisez notre plateforme grâce à nos programmes de formation adaptés à chaque profil.</p>
        </div>
      </section>

      <section class="courses-section">
        <h2>Nos formations</h2>
        <div class="courses-grid">
          <div class="course-card" v-for="course in courses" :key="course.title">
            <div class="course-icon">
              <component :is="course.icon" :size="32" />
            </div>
            <h3>{{ course.title }}</h3>
            <p>{{ course.description }}</p>
            <div class="course-meta">
              <span><Clock :size="14" /> {{ course.duration }}</span>
              <span><Users :size="14" /> {{ course.level }}</span>
            </div>
            <button class="course-btn">S'inscrire</button>
          </div>
        </div>
      </section>

      <section class="resources-section">
        <h2>Ressources gratuites</h2>
        <div class="resources-grid">
          <div class="resource-card" v-for="resource in resources" :key="resource.title">
            <component :is="resource.icon" :size="24" />
            <div>
              <h4>{{ resource.title }}</h4>
              <p>{{ resource.type }}</p>
            </div>
            <Download :size="20" class="download-icon" />
          </div>
        </div>
      </section>

      <section class="cta-section">
        <h2>Besoin d'une formation sur mesure ?</h2>
        <p>Nous proposons des formations personnalisées pour votre établissement.</p>
        <router-link to="/contact" class="btn-primary">Demander un devis</router-link>
      </section>

      <AppFooter />
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import AppFooter from '@/components/AppFooter.vue'
import { GraduationCap, Clock, Users, Stethoscope, UserCog, Shield, BarChart3, FileText, Video, BookOpen, Download } from 'lucide-vue-next'
import { ref } from 'vue'

const courses = ref([
  { icon: Stethoscope, title: 'Formation Médecins', description: 'Apprenez à utiliser toutes les fonctionnalités dédiées aux médecins.', duration: '4 heures', level: 'Débutant' },
  { icon: UserCog, title: 'Formation Infirmiers', description: 'Maîtrisez la gestion des soins et le suivi des patients.', duration: '3 heures', level: 'Débutant' },
  { icon: Shield, title: 'Formation Administrateurs', description: 'Gérez votre établissement et les utilisateurs efficacement.', duration: '6 heures', level: 'Avancé' },
  { icon: BarChart3, title: 'Formation Analytics', description: 'Exploitez les données pour améliorer vos performances.', duration: '2 heures', level: 'Intermédiaire' }
])

const resources = ref([
  { icon: FileText, title: 'Guide de démarrage rapide', type: 'PDF - 2.5 MB' },
  { icon: Video, title: 'Tutoriels vidéo', type: 'Playlist - 45 min' },
  { icon: BookOpen, title: 'Documentation complète', type: 'En ligne' }
])
</script>

<style scoped>
.page-container { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh; color: white; }
.hero-mini { padding: 100px 5% 60px; text-align: center; background: radial-gradient(ellipse at top, rgba(37, 99, 235, 0.15) 0%, transparent 50%); }
.badge { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #2563eb, #10b981); padding: 8px 20px; border-radius: 50px; font-size: 14px; font-weight: 600; margin-bottom: 24px; }
.hero-mini h1 { font-size: 3rem; font-weight: 900; margin-bottom: 20px; }
.hero-mini p { font-size: 1.2rem; color: #94a3b8; }

.courses-section { padding: 80px 5%; max-width: 1200px; margin: 0 auto; }
.courses-section h2 { text-align: center; font-size: 2rem; font-weight: 800; margin-bottom: 60px; }
.courses-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; }
.course-card { background: rgba(255, 255, 255, 0.05); border-radius: 20px; padding: 40px; border: 1px solid rgba(255, 255, 255, 0.1); transition: all 0.3s ease; }
.course-card:hover { transform: translateY(-8px); border-color: #3b82f6; }
.course-icon { width: 60px; height: 60px; background: linear-gradient(135deg, #2563eb, #10b981); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; color: white; }
.course-card h3 { font-size: 1.3rem; font-weight: 700; margin-bottom: 12px; }
.course-card > p { color: #94a3b8; line-height: 1.6; margin-bottom: 20px; }
.course-meta { display: flex; gap: 20px; color: #64748b; font-size: 13px; margin-bottom: 24px; }
.course-meta span { display: flex; align-items: center; gap: 6px; }
.course-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #2563eb, #10b981); border: none; border-radius: 12px; color: white; font-weight: 700; cursor: pointer; transition: all 0.3s ease; }
.course-btn:hover { transform: translateY(-2px); }

.resources-section { padding: 80px 5%; background: rgba(0, 0, 0, 0.2); }
.resources-section h2 { text-align: center; font-size: 2rem; font-weight: 800; margin-bottom: 40px; }
.resources-grid { max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }
.resource-card { display: flex; align-items: center; gap: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 20px 24px; border: 1px solid rgba(255, 255, 255, 0.1); cursor: pointer; transition: all 0.3s ease; }
.resource-card:hover { border-color: #3b82f6; transform: translateX(8px); }
.resource-card > svg:first-child { color: #3b82f6; }
.resource-card h4 { font-size: 1rem; font-weight: 600; margin-bottom: 4px; }
.resource-card p { color: #64748b; font-size: 13px; }
.resource-card > div { flex: 1; }
.download-icon { color: #64748b; }

.cta-section { padding: 80px 5%; text-align: center; background: linear-gradient(135deg, #2563eb, #10b981); }
.cta-section h2 { font-size: 2rem; font-weight: 800; margin-bottom: 16px; }
.cta-section p { opacity: 0.9; margin-bottom: 30px; }
.btn-primary { display: inline-block; padding: 16px 40px; background: white; color: #2563eb; border-radius: 50px; font-weight: 700; text-decoration: none; transition: all 0.3s ease; }
.btn-primary:hover { transform: translateY(-3px); }

@media (max-width: 768px) { .hero-mini h1 { font-size: 2rem; } }
</style>
