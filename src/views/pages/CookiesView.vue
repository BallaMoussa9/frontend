<template>
  <AppLayout>
    <div class="page-container">
      <section class="hero-mini">
        <div class="hero-content">
          <span class="badge">
            <Cookie :size="16" />
            Cookies
          </span>
          <h1>Politique des Cookies</h1>
          <p>Découvrez comment nous utilisons les cookies pour améliorer votre expérience.</p>
        </div>
      </section>

      <section class="content-section">
        <div class="content-wrapper">
          <div class="last-update">
            <Calendar :size="16" />
            Dernière mise à jour : 1er Janvier 2026
          </div>

          <article class="policy-content">
            <section class="policy-section">
              <h2>Qu'est-ce qu'un cookie ?</h2>
              <p>
                Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous visitez notre site. 
                Les cookies nous permettent de mémoriser vos préférences et d'améliorer votre expérience utilisateur.
              </p>
            </section>

            <section class="policy-section">
              <h2>Types de cookies utilisés</h2>
              
              <div class="cookie-type">
                <h3>Cookies essentiels</h3>
                <p>Nécessaires au fonctionnement du site. Ils permettent la navigation et l'accès aux zones sécurisées.</p>
                <span class="cookie-badge required">Requis</span>
              </div>

              <div class="cookie-type">
                <h3>Cookies de performance</h3>
                <p>Nous aident à comprendre comment les visiteurs utilisent le site en collectant des informations anonymes.</p>
                <span class="cookie-badge optional">Optionnel</span>
              </div>

              <div class="cookie-type">
                <h3>Cookies de fonctionnalité</h3>
                <p>Permettent de mémoriser vos choix (langue, région) pour personnaliser votre expérience.</p>
                <span class="cookie-badge optional">Optionnel</span>
              </div>
            </section>

            <section class="policy-section">
              <h2>Gestion des cookies</h2>
              <p>
                Vous pouvez à tout moment modifier vos préférences de cookies. La plupart des navigateurs 
                vous permettent de refuser ou d'accepter les cookies, de supprimer les cookies existants 
                ou de configurer des alertes avant qu'un cookie ne soit stocké.
              </p>
              <button class="manage-btn" @click="showCookieSettings = true">
                <Settings :size="18" />
                Gérer mes préférences
              </button>
            </section>

            <section class="policy-section">
              <h2>Durée de conservation</h2>
              <p>
                Les cookies de session sont supprimés lorsque vous fermez votre navigateur. 
                Les cookies persistants restent sur votre appareil pendant une durée définie 
                (généralement 12 mois maximum) ou jusqu'à ce que vous les supprimiez.
              </p>
            </section>

            <section class="policy-section">
              <h2>Contact</h2>
              <p>
                Pour toute question concernant notre utilisation des cookies, contactez-nous :
              </p>
              <div class="contact-info">
                <p><strong>Email :</strong> privacy@santeko.ml</p>
              </div>
            </section>
          </article>
        </div>
      </section>

      <AppFooter />
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import AppFooter from '@/components/AppFooter.vue'
import { Cookie, Calendar, Settings } from 'lucide-vue-next'
import { ref } from 'vue'

const showCookieSettings = ref(false)
</script>

<style scoped>
.page-container { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh; color: white; }
.hero-mini { padding: 100px 5% 60px; text-align: center; background: radial-gradient(ellipse at top, rgba(37, 99, 235, 0.15) 0%, transparent 50%); }
.badge { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #2563eb, #10b981); padding: 8px 20px; border-radius: 50px; font-size: 14px; font-weight: 600; margin-bottom: 24px; }
.hero-mini h1 { font-size: 3rem; font-weight: 900; margin-bottom: 20px; }
.hero-mini p { font-size: 1.2rem; color: #94a3b8; }

.content-section { padding: 60px 5% 100px; }
.content-wrapper { max-width: 900px; margin: 0 auto; }
.last-update { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: rgba(255, 255, 255, 0.05); border-radius: 30px; font-size: 14px; color: #94a3b8; margin-bottom: 40px; }

.policy-content { background: rgba(255, 255, 255, 0.03); border-radius: 24px; padding: 50px; border: 1px solid rgba(255, 255, 255, 0.1); }
.policy-section { margin-bottom: 40px; }
.policy-section:last-child { margin-bottom: 0; }
.policy-section h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 20px; color: #3b82f6; }
.policy-section p { font-size: 1rem; line-height: 1.8; color: #cbd5e1; margin-bottom: 16px; }

.cookie-type { background: rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 24px; margin-bottom: 16px; border: 1px solid rgba(255, 255, 255, 0.1); }
.cookie-type h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; color: white; }
.cookie-type p { margin-bottom: 12px; font-size: 14px; }
.cookie-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.cookie-badge.required { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
.cookie-badge.optional { background: rgba(100, 116, 139, 0.2); color: #94a3b8; }

.manage-btn { display: inline-flex; align-items: center; gap: 10px; padding: 14px 28px; background: linear-gradient(135deg, #2563eb, #10b981); border: none; border-radius: 12px; color: white; font-weight: 700; cursor: pointer; transition: all 0.3s ease; }
.manage-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4); }

.contact-info { background: rgba(37, 99, 235, 0.1); border-radius: 12px; padding: 20px; margin-top: 16px; }
.contact-info p { margin-bottom: 0; }

@media (max-width: 768px) { 
  .hero-mini h1 { font-size: 2rem; } 
  .policy-content { padding: 30px 20px; }
}
</style>
