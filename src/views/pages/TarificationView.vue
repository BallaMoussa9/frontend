<template>
  <AppLayout>
    <div class="page-container">
      <section class="hero-mini">
        <div class="hero-content">
          <span class="badge">
            <CreditCard :size="16" />
            Tarification
          </span>
          <h1>Des tarifs adaptés à vos besoins</h1>
          <p>Choisissez le plan qui correspond le mieux à votre structure de santé.</p>
        </div>
      </section>

      <section class="pricing-section">
        <div class="pricing-toggle">
          <span :class="{ active: !isAnnual }">Mensuel</span>
          <button class="toggle-btn" @click="isAnnual = !isAnnual">
            <span class="toggle-slider" :class="{ annual: isAnnual }"></span>
          </button>
          <span :class="{ active: isAnnual }">Annuel <span class="discount">-20%</span></span>
        </div>

        <div class="pricing-grid">
          <div class="pricing-card" v-for="plan in plans" :key="plan.name" :class="{ featured: plan.featured }">
            <div class="plan-badge" v-if="plan.featured">Le plus populaire</div>
            <h3>{{ plan.name }}</h3>
            <p class="plan-description">{{ plan.description }}</p>
            <div class="price">
              <span class="currency">FCFA</span>
              <span class="amount">{{ isAnnual ? plan.priceAnnual : plan.priceMonthly }}</span>
              <span class="period">/{{ isAnnual ? 'an' : 'mois' }}</span>
            </div>
            <ul class="features-list">
              <li v-for="feature in plan.features" :key="feature">
                <Check :size="18" class="check-icon" />
                {{ feature }}
              </li>
            </ul>
            <button class="plan-btn" :class="{ primary: plan.featured }">
              {{ plan.cta }}
            </button>
          </div>
        </div>
      </section>

      <section class="comparison-section">
        <h2>Comparaison détaillée</h2>
        <div class="comparison-table">
          <table>
            <thead>
              <tr>
                <th>Fonctionnalités</th>
                <th>Starter</th>
                <th>Pro</th>
                <th>Enterprise</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="feature in comparisonFeatures" :key="feature.name">
                <td>{{ feature.name }}</td>
                <td><Check v-if="feature.starter" :size="20" class="check" /><X v-else :size="20" class="x" /></td>
                <td><Check v-if="feature.pro" :size="20" class="check" /><X v-else :size="20" class="x" /></td>
                <td><Check v-if="feature.enterprise" :size="20" class="check" /><X v-else :size="20" class="x" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="faq-section">
        <h2>Questions fréquentes</h2>
        <div class="faq-grid">
          <div class="faq-item" v-for="faq in faqs" :key="faq.question">
            <h3>{{ faq.question }}</h3>
            <p>{{ faq.answer }}</p>
          </div>
        </div>
      </section>

      <section class="cta-section">
        <h2>Besoin d'un plan personnalisé ?</h2>
        <p>Contactez-nous pour une offre sur mesure adaptée à votre établissement.</p>
        <router-link to="/contact" class="btn-primary">
          Nous contacter
        </router-link>
      </section>

      <AppFooter />
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import AppFooter from '@/components/AppFooter.vue'
import { CreditCard, Check, X } from 'lucide-vue-next'
import { ref } from 'vue'

const isAnnual = ref(false)

const plans = ref([
  {
    name: 'Starter',
    description: 'Idéal pour les petites structures',
    priceMonthly: '25 000',
    priceAnnual: '240 000',
    features: [
      'Jusqu\'à 5 utilisateurs',
      'Gestion des rendez-vous',
      'Dossiers médicaux basiques',
      'Support email',
      '5 Go de stockage'
    ],
    cta: 'Commencer',
    featured: false
  },
  {
    name: 'Pro',
    description: 'Pour les cliniques en croissance',
    priceMonthly: '75 000',
    priceAnnual: '720 000',
    features: [
      'Jusqu\'à 25 utilisateurs',
      'Toutes les fonctionnalités Starter',
      'Téléconsultation HD',
      'Analyses et rapports',
      'Support prioritaire',
      '50 Go de stockage'
    ],
    cta: 'Essai gratuit',
    featured: true
  },
  {
    name: 'Enterprise',
    description: 'Pour les grands établissements',
    priceMonthly: 'Sur devis',
    priceAnnual: 'Sur devis',
    features: [
      'Utilisateurs illimités',
      'Toutes les fonctionnalités Pro',
      'API personnalisée',
      'Formation sur site',
      'Support dédié 24/7',
      'Stockage illimité'
    ],
    cta: 'Nous contacter',
    featured: false
  }
])

const comparisonFeatures = ref([
  { name: 'Gestion des rendez-vous', starter: true, pro: true, enterprise: true },
  { name: 'Dossiers médicaux', starter: true, pro: true, enterprise: true },
  { name: 'Téléconsultation', starter: false, pro: true, enterprise: true },
  { name: 'Analyses avancées', starter: false, pro: true, enterprise: true },
  { name: 'API personnalisée', starter: false, pro: false, enterprise: true },
  { name: 'Support 24/7', starter: false, pro: false, enterprise: true },
  { name: 'Formation sur site', starter: false, pro: false, enterprise: true }
])

const faqs = ref([
  {
    question: 'Puis-je changer de plan à tout moment ?',
    answer: 'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement.'
  },
  {
    question: 'Y a-t-il une période d\'essai ?',
    answer: 'Oui, nous offrons un essai gratuit de 30 jours pour le plan Pro, sans engagement ni carte bancaire requise.'
  },
  {
    question: 'Comment fonctionne la facturation ?',
    answer: 'La facturation est mensuelle ou annuelle selon votre choix. Vous recevez une facture détaillée chaque mois.'
  },
  {
    question: 'Quels moyens de paiement acceptez-vous ?',
    answer: 'Nous acceptons les virements bancaires, Orange Money, et les cartes bancaires.'
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
  font-size: 3rem;
  font-weight: 900;
  margin-bottom: 20px;
}

.hero-mini p {
  font-size: 1.2rem;
  color: #94a3b8;
}

.pricing-section {
  padding: 60px 5%;
  max-width: 1200px;
  margin: 0 auto;
}

.pricing-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 60px;
}

.pricing-toggle span {
  color: #64748b;
  font-weight: 600;
  transition: color 0.3s;
}

.pricing-toggle span.active {
  color: white;
}

.discount {
  background: #10b981;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  margin-left: 8px;
}

.toggle-btn {
  width: 56px;
  height: 28px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 14px;
  cursor: pointer;
  position: relative;
}

.toggle-slider {
  position: absolute;
  width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #2563eb, #10b981);
  border-radius: 50%;
  top: 3px;
  left: 3px;
  transition: transform 0.3s;
}

.toggle-slider.annual {
  transform: translateX(28px);
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.pricing-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  transition: all 0.3s ease;
}

.pricing-card:hover {
  transform: translateY(-8px);
  border-color: rgba(59, 130, 246, 0.5);
}

.pricing-card.featured {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(16, 185, 129, 0.1));
  border-color: #3b82f6;
}

.plan-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #2563eb, #10b981);
  padding: 6px 20px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.pricing-card h3 {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 8px;
}

.plan-description {
  color: #94a3b8;
  margin-bottom: 24px;
}

.price {
  margin-bottom: 30px;
}

.currency {
  font-size: 14px;
  color: #94a3b8;
}

.amount {
  font-size: 3rem;
  font-weight: 900;
  margin: 0 4px;
}

.period {
  color: #94a3b8;
}

.features-list {
  list-style: none;
  padding: 0;
  margin-bottom: 30px;
}

.features-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  color: #cbd5e1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.check-icon {
  color: #10b981;
}

.plan-btn {
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.plan-btn.primary {
  background: linear-gradient(135deg, #2563eb, #10b981);
  border: none;
}

.plan-btn:hover {
  transform: translateY(-2px);
}

.comparison-section {
  padding: 80px 5%;
  background: rgba(0, 0, 0, 0.2);
}

.comparison-section h2 {
  text-align: center;
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 40px;
}

.comparison-table {
  max-width: 900px;
  margin: 0 auto;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

th:first-child, td:first-child {
  text-align: left;
}

th {
  color: #3b82f6;
  font-weight: 700;
}

.check {
  color: #10b981;
}

.x {
  color: #64748b;
}

.faq-section {
  padding: 80px 5%;
  max-width: 1000px;
  margin: 0 auto;
}

.faq-section h2 {
  text-align: center;
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 40px;
}

.faq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.faq-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.faq-item h3 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: #3b82f6;
}

.faq-item p {
  color: #94a3b8;
  line-height: 1.6;
}

.cta-section {
  padding: 80px 5%;
  text-align: center;
  background: linear-gradient(135deg, #2563eb, #10b981);
}

.cta-section h2 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 16px;
}

.cta-section p {
  opacity: 0.9;
  margin-bottom: 30px;
}

.btn-primary {
  display: inline-block;
  padding: 16px 40px;
  background: white;
  color: #2563eb;
  border-radius: 50px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .hero-mini h1 {
    font-size: 2rem;
  }
  
  .faq-grid {
    grid-template-columns: 1fr;
  }
}
</style>
