<template>
  <AppLayout>
    <div class="page-container">
      <section class="hero-mini">
        <div class="hero-content">
          <span class="badge">
            <Play :size="16" />
            Démo
          </span>
          <h1>Découvrez SanTeKo en action</h1>
          <p>Explorez notre plateforme à travers une démonstration interactive complète.</p>
        </div>
      </section>

      <section class="demo-section">
        <div class="video-container">
          <div class="video-placeholder">
            <Play :size="80" />
            <p>Vidéo de présentation</p>
          </div>
        </div>
      </section>

      <section class="features-demo">
        <h2>Fonctionnalités clés</h2>
        <div class="demo-grid">
          <div class="demo-card" v-for="demo in demos" :key="demo.title">
            <div class="demo-icon">
              <component :is="demo.icon" :size="32" />
            </div>
            <h3>{{ demo.title }}</h3>
            <p>{{ demo.description }}</p>
          </div>
        </div>
      </section>

      <section class="cta-section">
        <h2>Prêt à essayer SanTeKo ?</h2>
        <p>Commencez votre essai gratuit de 30 jours dès maintenant</p>
        <div class="cta-buttons">
          <router-link to="/inscription" class="btn-primary">Essai gratuit</router-link>
          <router-link to="/contact" class="btn-secondary">Demander une démo personnalisée</router-link>
        </div>
      </section>

      <AppFooter />
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import AppFooter from '@/components/AppFooter.vue'
import { Play, Calendar, FileText, Video, Bell, Shield, BarChart3 } from 'lucide-vue-next'
import { ref } from 'vue'

const demos = ref([
  { icon: Calendar, title: 'Gestion des rendez-vous', description: 'Planifiez et gérez facilement tous vos rendez-vous médicaux.' },
  { icon: FileText, title: 'Dossiers médicaux', description: 'Accédez à l\'historique complet de vos patients en un clic.' },
  { icon: Video, title: 'Téléconsultation', description: 'Consultez vos patients à distance en vidéo HD sécurisée.' },
  { icon: Bell, title: 'Alertes intelligentes', description: 'Recevez des notifications en temps réel pour les urgences.' },
  { icon: Shield, title: 'Sécurité maximale', description: 'Vos données sont protégées par un chiffrement de pointe.' },
  { icon: BarChart3, title: 'Analyses avancées', description: 'Suivez vos statistiques avec des tableaux de bord interactifs.' }
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

.hero-mini h1 { font-size: 3rem; font-weight: 900; margin-bottom: 20px; }
.hero-mini p { font-size: 1.2rem; color: #94a3b8; }

.demo-section { padding: 60px 5%; max-width: 1000px; margin: 0 auto; }

.video-container {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.video-placeholder {
  aspect-ratio: 16/9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
}

.video-placeholder:hover { color: #3b82f6; }

.features-demo { padding: 80px 5%; background: rgba(0, 0, 0, 0.2); }
.features-demo h2 { text-align: center; font-size: 2rem; font-weight: 800; margin-bottom: 60px; }

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.demo-card:hover { transform: translateY(-8px); border-color: #3b82f6; }

.demo-icon {
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

.demo-card h3 { font-size: 1.3rem; font-weight: 700; margin-bottom: 12px; }
.demo-card p { color: #94a3b8; line-height: 1.6; }

.cta-section { padding: 80px 5%; text-align: center; background: linear-gradient(135deg, #2563eb, #10b981); }
.cta-section h2 { font-size: 2rem; font-weight: 800; margin-bottom: 16px; }
.cta-section p { opacity: 0.9; margin-bottom: 30px; }
.cta-buttons { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }

.btn-primary, .btn-secondary {
  padding: 16px 32px;
  border-radius: 50px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-primary { background: white; color: #2563eb; }
.btn-secondary { background: transparent; color: white; border: 2px solid white; }
.btn-primary:hover, .btn-secondary:hover { transform: translateY(-3px); }

@media (max-width: 768px) { .hero-mini h1 { font-size: 2rem; } }
</style>
