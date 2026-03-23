<template>
  <AppLayout>
    <div class="page-container">
      <section class="hero-mini">
        <div class="hero-content">
          <span class="badge">
            <Briefcase :size="16" />
            Carrières
          </span>
          <h1>Rejoignez l'aventure SanTeKo</h1>
          <p>Participez à la révolution de la santé au Mali. Nous recherchons des talents passionnés.</p>
        </div>
      </section>

      <section class="values-section">
        <h2>Pourquoi nous rejoindre ?</h2>
        <div class="values-grid">
          <div class="value-card" v-for="value in values" :key="value.title">
            <component :is="value.icon" :size="32" class="value-icon" />
            <h3>{{ value.title }}</h3>
            <p>{{ value.description }}</p>
          </div>
        </div>
      </section>

      <section class="jobs-section">
        <h2>Postes ouverts</h2>
        <div class="jobs-list">
          <div class="job-card" v-for="job in jobs" :key="job.title">
            <div class="job-info">
              <h3>{{ job.title }}</h3>
              <div class="job-meta">
                <span><MapPin :size="16" /> {{ job.location }}</span>
                <span><Clock :size="16" /> {{ job.type }}</span>
                <span><Briefcase :size="16" /> {{ job.department }}</span>
              </div>
            </div>
            <button class="apply-btn">Postuler</button>
          </div>
        </div>
      </section>

      <section class="cta-section">
        <h2>Vous ne trouvez pas le poste idéal ?</h2>
        <p>Envoyez-nous une candidature spontanée, nous sommes toujours à la recherche de talents.</p>
        <router-link to="/contact" class="btn-primary">Candidature spontanée</router-link>
      </section>

      <AppFooter />
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import AppFooter from '@/components/AppFooter.vue'
import { Briefcase, Heart, Rocket, Users, Globe, MapPin, Clock } from 'lucide-vue-next'
import { ref } from 'vue'

const values = ref([
  { icon: Heart, title: 'Impact social', description: 'Contribuez à améliorer la santé de millions de Maliens.' },
  { icon: Rocket, title: 'Innovation', description: 'Travaillez avec les dernières technologies du secteur.' },
  { icon: Users, title: 'Équipe passionnée', description: 'Rejoignez une équipe diverse et talentueuse.' },
  { icon: Globe, title: 'Flexibilité', description: 'Télétravail possible et horaires flexibles.' }
])

const jobs = ref([
  { title: 'Développeur Full Stack Vue.js', location: 'Bamako', type: 'CDI', department: 'Tech' },
  { title: 'UX/UI Designer', location: 'Bamako / Remote', type: 'CDI', department: 'Design' },
  { title: 'Chef de Projet Digital', location: 'Bamako', type: 'CDI', department: 'Produit' },
  { title: 'Commercial B2B Santé', location: 'Bamako', type: 'CDI', department: 'Ventes' }
])
</script>

<style scoped>
.page-container { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh; color: white; }
.hero-mini { padding: 100px 5% 60px; text-align: center; background: radial-gradient(ellipse at top, rgba(37, 99, 235, 0.15) 0%, transparent 50%); }
.badge { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #2563eb, #10b981); padding: 8px 20px; border-radius: 50px; font-size: 14px; font-weight: 600; margin-bottom: 24px; }
.hero-mini h1 { font-size: 3rem; font-weight: 900; margin-bottom: 20px; }
.hero-mini p { font-size: 1.2rem; color: #94a3b8; max-width: 600px; margin: 0 auto; }

.values-section { padding: 80px 5%; max-width: 1200px; margin: 0 auto; }
.values-section h2 { text-align: center; font-size: 2rem; font-weight: 800; margin-bottom: 60px; }
.values-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; }
.value-card { background: rgba(255, 255, 255, 0.05); border-radius: 20px; padding: 40px; text-align: center; border: 1px solid rgba(255, 255, 255, 0.1); transition: all 0.3s ease; }
.value-card:hover { transform: translateY(-8px); border-color: #3b82f6; }
.value-icon { color: #3b82f6; margin-bottom: 20px; }
.value-card h3 { font-size: 1.3rem; font-weight: 700; margin-bottom: 12px; }
.value-card p { color: #94a3b8; line-height: 1.6; }

.jobs-section { padding: 80px 5%; background: rgba(0, 0, 0, 0.2); }
.jobs-section h2 { text-align: center; font-size: 2rem; font-weight: 800; margin-bottom: 40px; }
.jobs-list { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }
.job-card { display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 24px 30px; border: 1px solid rgba(255, 255, 255, 0.1); transition: all 0.3s ease; }
.job-card:hover { border-color: #3b82f6; transform: translateX(8px); }
.job-card h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 12px; }
.job-meta { display: flex; gap: 20px; color: #94a3b8; font-size: 14px; }
.job-meta span { display: flex; align-items: center; gap: 6px; }
.apply-btn { padding: 12px 24px; background: linear-gradient(135deg, #2563eb, #10b981); border: none; border-radius: 12px; color: white; font-weight: 700; cursor: pointer; transition: all 0.3s ease; }
.apply-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4); }

.cta-section { padding: 80px 5%; text-align: center; background: linear-gradient(135deg, #2563eb, #10b981); }
.cta-section h2 { font-size: 2rem; font-weight: 800; margin-bottom: 16px; }
.cta-section p { opacity: 0.9; margin-bottom: 30px; }
.btn-primary { display: inline-block; padding: 16px 40px; background: white; color: #2563eb; border-radius: 50px; font-weight: 700; text-decoration: none; transition: all 0.3s ease; }
.btn-primary:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); }

@media (max-width: 768px) { 
  .hero-mini h1 { font-size: 2rem; } 
  .job-card { flex-direction: column; gap: 20px; align-items: flex-start; }
  .job-meta { flex-wrap: wrap; }
}
</style>
