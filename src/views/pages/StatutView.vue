<template>
  <AppLayout>
    <div class="page-container">
      <section class="hero-mini">
        <div class="hero-content">
          <span class="badge operational">
            <CheckCircle :size="16" />
            Tous les systèmes opérationnels
          </span>
          <h1>Statut des Services</h1>
          <p>Suivez en temps réel l'état de fonctionnement de nos services.</p>
        </div>
      </section>

      <section class="status-section">
        <div class="status-list">
          <div class="status-item" v-for="service in services" :key="service.name">
            <div class="service-info">
              <component :is="service.icon" :size="20" />
              <span class="service-name">{{ service.name }}</span>
            </div>
            <div class="service-status" :class="service.status">
              <span class="status-dot"></span>
              {{ getStatusText(service.status) }}
            </div>
          </div>
        </div>
      </section>

      <section class="uptime-section">
        <h2>Disponibilité sur 90 jours</h2>
        <div class="uptime-bar">
          <div class="uptime-fill" style="width: 99.9%"></div>
        </div>
        <p class="uptime-text">99.9% de disponibilité</p>
      </section>

      <section class="incidents-section">
        <h2>Historique des incidents</h2>
        <div class="incidents-list">
          <div class="incident-card" v-for="incident in incidents" :key="incident.date">
            <div class="incident-header">
              <span class="incident-date">{{ incident.date }}</span>
              <span class="incident-status" :class="incident.resolved ? 'resolved' : 'ongoing'">
                {{ incident.resolved ? 'Résolu' : 'En cours' }}
              </span>
            </div>
            <h4>{{ incident.title }}</h4>
            <p>{{ incident.description }}</p>
          </div>
        </div>
      </section>

      <section class="subscribe-section">
        <h2>Recevoir les alertes</h2>
        <p>Soyez informé en cas d'incident sur nos services.</p>
        <form class="subscribe-form" @submit.prevent>
          <input type="email" placeholder="Votre email" />
          <button type="submit">S'abonner</button>
        </form>
      </section>

      <AppFooter />
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import AppFooter from '@/components/AppFooter.vue'
import { CheckCircle, Globe, Database, Shield, Video, Bell, Cloud } from 'lucide-vue-next'
import { ref } from 'vue'

const services = ref([
  { name: 'Application Web', icon: Globe, status: 'operational' },
  { name: 'Base de données', icon: Database, status: 'operational' },
  { name: 'Authentification', icon: Shield, status: 'operational' },
  { name: 'Téléconsultation', icon: Video, status: 'operational' },
  { name: 'Notifications', icon: Bell, status: 'operational' },
  { name: 'Stockage Cloud', icon: Cloud, status: 'operational' }
])

const incidents = ref([
  { date: '10 Mars 2026', title: 'Maintenance planifiée', description: 'Mise à jour des serveurs effectuée avec succès.', resolved: true },
  { date: '25 Février 2026', title: 'Latence réseau', description: 'Ralentissements temporaires sur le service de téléconsultation.', resolved: true }
])

const getStatusText = (status) => {
  const texts = { operational: 'Opérationnel', degraded: 'Dégradé', outage: 'Panne' }
  return texts[status] || status
}
</script>

<style scoped>
.page-container { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh; color: white; }
.hero-mini { padding: 100px 5% 60px; text-align: center; background: radial-gradient(ellipse at top, rgba(37, 99, 235, 0.15) 0%, transparent 50%); }
.badge { display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; border-radius: 50px; font-size: 14px; font-weight: 600; margin-bottom: 24px; }
.badge.operational { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
.hero-mini h1 { font-size: 3rem; font-weight: 900; margin-bottom: 20px; }
.hero-mini p { font-size: 1.2rem; color: #94a3b8; }

.status-section { padding: 60px 5%; max-width: 800px; margin: 0 auto; }
.status-list { display: flex; flex-direction: column; gap: 12px; }
.status-item { display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px 24px; border: 1px solid rgba(255, 255, 255, 0.1); }
.service-info { display: flex; align-items: center; gap: 12px; }
.service-info svg { color: #64748b; }
.service-name { font-weight: 600; }
.service-status { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; }
.status-dot { width: 10px; height: 10px; border-radius: 50%; }
.service-status.operational { color: #10b981; }
.service-status.operational .status-dot { background: #10b981; box-shadow: 0 0 10px #10b981; }
.service-status.degraded { color: #f59e0b; }
.service-status.degraded .status-dot { background: #f59e0b; }
.service-status.outage { color: #ef4444; }
.service-status.outage .status-dot { background: #ef4444; }

.uptime-section { padding: 60px 5%; background: rgba(0, 0, 0, 0.2); text-align: center; }
.uptime-section h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 30px; }
.uptime-bar { max-width: 600px; margin: 0 auto; height: 12px; background: rgba(255, 255, 255, 0.1); border-radius: 6px; overflow: hidden; }
.uptime-fill { height: 100%; background: linear-gradient(90deg, #10b981, #3b82f6); border-radius: 6px; }
.uptime-text { margin-top: 16px; color: #10b981; font-weight: 700; font-size: 1.2rem; }

.incidents-section { padding: 60px 5%; max-width: 800px; margin: 0 auto; }
.incidents-section h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 30px; text-align: center; }
.incidents-list { display: flex; flex-direction: column; gap: 16px; }
.incident-card { background: rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 24px; border: 1px solid rgba(255, 255, 255, 0.1); }
.incident-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.incident-date { color: #64748b; font-size: 13px; }
.incident-status { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.incident-status.resolved { background: rgba(16, 185, 129, 0.2); color: #10b981; }
.incident-status.ongoing { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
.incident-card h4 { font-size: 1rem; font-weight: 700; margin-bottom: 8px; }
.incident-card p { color: #94a3b8; font-size: 14px; }

.subscribe-section { padding: 80px 5%; text-align: center; background: linear-gradient(135deg, #2563eb, #10b981); }
.subscribe-section h2 { font-size: 2rem; font-weight: 800; margin-bottom: 16px; }
.subscribe-section > p { opacity: 0.9; margin-bottom: 30px; }
.subscribe-form { display: flex; gap: 12px; max-width: 400px; margin: 0 auto; }
.subscribe-form input { flex: 1; padding: 14px 20px; border: none; border-radius: 12px; font-size: 15px; }
.subscribe-form button { padding: 14px 28px; background: #0f172a; color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; }

@media (max-width: 768px) { 
  .hero-mini h1 { font-size: 2rem; } 
  .subscribe-form { flex-direction: column; }
}
</style>
