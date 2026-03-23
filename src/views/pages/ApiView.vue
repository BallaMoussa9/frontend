<template>
  <AppLayout>
    <div class="page-container">
      <section class="hero-mini">
        <div class="hero-content">
          <span class="badge">
            <Code :size="16" />
            API
          </span>
          <h1>API SanTeKo</h1>
          <p>Intégrez SanTeKo à vos systèmes existants grâce à notre API RESTful complète.</p>
        </div>
      </section>

      <section class="api-section">
        <div class="api-grid">
          <div class="api-card" v-for="endpoint in endpoints" :key="endpoint.title">
            <div class="api-icon">
              <component :is="endpoint.icon" :size="28" />
            </div>
            <h3>{{ endpoint.title }}</h3>
            <p>{{ endpoint.description }}</p>
            <div class="methods">
              <span v-for="method in endpoint.methods" :key="method" :class="method.toLowerCase()">{{ method }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="docs-section">
        <h2>Documentation</h2>
        <div class="docs-content">
          <div class="code-block">
            <pre><code>// Exemple d'authentification
const response = await fetch('https://api.santeko.ml/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: '****' })
});

const { token } = await response.json();</code></pre>
          </div>
        </div>
      </section>

      <section class="cta-section">
        <h2>Accédez à la documentation complète</h2>
        <p>Consultez notre documentation détaillée pour commencer l'intégration.</p>
        <router-link to="/contact" class="btn-primary">Demander un accès API</router-link>
      </section>

      <AppFooter />
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import AppFooter from '@/components/AppFooter.vue'
import { Code, Users, Calendar, FileText, Bell, Shield } from 'lucide-vue-next'
import { ref } from 'vue'

const endpoints = ref([
  { icon: Users, title: 'Utilisateurs', description: 'Gérez les comptes utilisateurs et les profils.', methods: ['GET', 'POST', 'PUT'] },
  { icon: Calendar, title: 'Rendez-vous', description: 'Créez et gérez les rendez-vous médicaux.', methods: ['GET', 'POST', 'DELETE'] },
  { icon: FileText, title: 'Dossiers médicaux', description: 'Accédez aux dossiers patients de manière sécurisée.', methods: ['GET', 'POST'] },
  { icon: Bell, title: 'Notifications', description: 'Envoyez des notifications push et email.', methods: ['POST'] },
  { icon: Shield, title: 'Authentification', description: 'Authentification OAuth2 et JWT.', methods: ['POST'] }
])
</script>

<style scoped>
.page-container { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh; color: white; }
.hero-mini { padding: 100px 5% 60px; text-align: center; background: radial-gradient(ellipse at top, rgba(37, 99, 235, 0.15) 0%, transparent 50%); }
.badge { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #2563eb, #10b981); padding: 8px 20px; border-radius: 50px; font-size: 14px; font-weight: 600; margin-bottom: 24px; }
.hero-mini h1 { font-size: 3rem; font-weight: 900; margin-bottom: 20px; }
.hero-mini p { font-size: 1.2rem; color: #94a3b8; }

.api-section { padding: 60px 5%; max-width: 1200px; margin: 0 auto; }
.api-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
.api-card { background: rgba(255, 255, 255, 0.05); border-radius: 20px; padding: 30px; border: 1px solid rgba(255, 255, 255, 0.1); transition: all 0.3s ease; }
.api-card:hover { transform: translateY(-5px); border-color: #3b82f6; }
.api-icon { width: 50px; height: 50px; background: linear-gradient(135deg, #2563eb, #10b981); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; color: white; }
.api-card h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 10px; }
.api-card p { color: #94a3b8; margin-bottom: 16px; font-size: 14px; }
.methods { display: flex; gap: 8px; }
.methods span { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; }
.methods .get { background: rgba(16, 185, 129, 0.2); color: #10b981; }
.methods .post { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
.methods .put { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
.methods .delete { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

.docs-section { padding: 60px 5%; background: rgba(0, 0, 0, 0.2); }
.docs-section h2 { text-align: center; font-size: 2rem; font-weight: 800; margin-bottom: 40px; }
.docs-content { max-width: 800px; margin: 0 auto; }
.code-block { background: #0f172a; border-radius: 16px; padding: 24px; overflow-x: auto; }
.code-block pre { margin: 0; }
.code-block code { color: #10b981; font-family: 'Fira Code', monospace; font-size: 14px; line-height: 1.6; }

.cta-section { padding: 80px 5%; text-align: center; background: linear-gradient(135deg, #2563eb, #10b981); }
.cta-section h2 { font-size: 2rem; font-weight: 800; margin-bottom: 16px; }
.cta-section p { opacity: 0.9; margin-bottom: 30px; }
.btn-primary { display: inline-block; padding: 16px 40px; background: white; color: #2563eb; border-radius: 50px; font-weight: 700; text-decoration: none; transition: all 0.3s ease; }
.btn-primary:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); }

@media (max-width: 768px) { .hero-mini h1 { font-size: 2rem; } }
</style>
