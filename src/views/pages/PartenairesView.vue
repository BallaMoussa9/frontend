<template>
  <AppLayout>
    <div class="page-container">
      <section class="hero-mini">
        <div class="hero-content">
          <span class="badge">
            <Handshake :size="16" />
            Partenaires
          </span>
          <h1>Nos partenaires de confiance</h1>
          <p>Ensemble, nous construisons l'avenir de la santé au Mali.</p>
        </div>
      </section>

      <section class="partners-section">
        <h2>Ils nous font confiance</h2>
        <div class="partners-grid">
          <div class="partner-card" v-for="partner in partners" :key="partner.name">
            <div class="partner-logo">
              <Building2 :size="40" />
            </div>
            <h3>{{ partner.name }}</h3>
            <p>{{ partner.type }}</p>
          </div>
        </div>
      </section>

      <section class="benefits-section">
        <h2>Avantages du partenariat</h2>
        <div class="benefits-grid">
          <div class="benefit-card" v-for="benefit in benefits" :key="benefit.title">
            <component :is="benefit.icon" :size="32" class="benefit-icon" />
            <h3>{{ benefit.title }}</h3>
            <p>{{ benefit.description }}</p>
          </div>
        </div>
      </section>

      <section class="cta-section">
        <h2>Devenez partenaire</h2>
        <p>Rejoignez notre réseau de partenaires et participez à la transformation de la santé.</p>
        <router-link to="/contact" class="btn-primary">Nous contacter</router-link>
      </section>

      <AppFooter />
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import AppFooter from '@/components/AppFooter.vue'
import { Handshake, Building2, TrendingUp, Users, Award, Globe } from 'lucide-vue-next'
import { ref } from 'vue'

const partners = ref([
  { name: 'Ministère de la Santé', type: 'Institution publique' },
  { name: 'Hôpital Gabriel Touré', type: 'Centre hospitalier' },
  { name: 'Clinique Pasteur', type: 'Clinique privée' },
  { name: 'Orange Mali', type: 'Télécommunications' },
  { name: 'USAID Mali', type: 'Organisation internationale' },
  { name: 'Banque Atlantique', type: 'Services financiers' }
])

const benefits = ref([
  { icon: TrendingUp, title: 'Croissance', description: 'Accédez à un marché en pleine expansion.' },
  { icon: Users, title: 'Réseau', description: 'Intégrez un écosystème de santé innovant.' },
  { icon: Award, title: 'Visibilité', description: 'Bénéficiez d\'une visibilité accrue.' },
  { icon: Globe, title: 'Impact', description: 'Contribuez à améliorer la santé publique.' }
])
</script>

<style scoped>
.page-container { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh; color: white; }
.hero-mini { padding: 100px 5% 60px; text-align: center; background: radial-gradient(ellipse at top, rgba(37, 99, 235, 0.15) 0%, transparent 50%); }
.badge { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #2563eb, #10b981); padding: 8px 20px; border-radius: 50px; font-size: 14px; font-weight: 600; margin-bottom: 24px; }
.hero-mini h1 { font-size: 3rem; font-weight: 900; margin-bottom: 20px; }
.hero-mini p { font-size: 1.2rem; color: #94a3b8; }

.partners-section { padding: 80px 5%; max-width: 1200px; margin: 0 auto; }
.partners-section h2 { text-align: center; font-size: 2rem; font-weight: 800; margin-bottom: 60px; }
.partners-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
.partner-card { background: rgba(255, 255, 255, 0.05); border-radius: 20px; padding: 40px 30px; text-align: center; border: 1px solid rgba(255, 255, 255, 0.1); transition: all 0.3s ease; }
.partner-card:hover { transform: translateY(-8px); border-color: #3b82f6; }
.partner-logo { width: 80px; height: 80px; background: rgba(59, 130, 246, 0.1); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: #3b82f6; }
.partner-card h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; }
.partner-card p { color: #94a3b8; font-size: 14px; }

.benefits-section { padding: 80px 5%; background: rgba(0, 0, 0, 0.2); }
.benefits-section h2 { text-align: center; font-size: 2rem; font-weight: 800; margin-bottom: 60px; }
.benefits-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; max-width: 1000px; margin: 0 auto; }
.benefit-card { background: rgba(255, 255, 255, 0.05); border-radius: 20px; padding: 40px; text-align: center; border: 1px solid rgba(255, 255, 255, 0.1); }
.benefit-icon { color: #3b82f6; margin-bottom: 20px; }
.benefit-card h3 { font-size: 1.3rem; font-weight: 700; margin-bottom: 12px; }
.benefit-card p { color: #94a3b8; line-height: 1.6; }

.cta-section { padding: 80px 5%; text-align: center; background: linear-gradient(135deg, #2563eb, #10b981); }
.cta-section h2 { font-size: 2rem; font-weight: 800; margin-bottom: 16px; }
.cta-section p { opacity: 0.9; margin-bottom: 30px; }
.btn-primary { display: inline-block; padding: 16px 40px; background: white; color: #2563eb; border-radius: 50px; font-weight: 700; text-decoration: none; transition: all 0.3s ease; }
.btn-primary:hover { transform: translateY(-3px); }

@media (max-width: 768px) { .hero-mini h1 { font-size: 2rem; } }
</style>
