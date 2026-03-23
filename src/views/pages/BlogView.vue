<template>
  <AppLayout>
    <div class="page-container">
      <section class="hero-mini">
        <div class="hero-content">
          <span class="badge">
            <BookOpen :size="16" />
            Blog
          </span>
          <h1>Actualités & Insights</h1>
          <p>Découvrez les dernières nouvelles sur la santé digitale au Mali et nos innovations.</p>
        </div>
      </section>

      <section class="blog-section">
        <div class="blog-grid">
          <article class="blog-card featured" v-if="articles[0]">
            <div class="blog-image">
              <Newspaper :size="60" />
            </div>
            <div class="blog-content">
              <span class="blog-category">{{ articles[0].category }}</span>
              <h2>{{ articles[0].title }}</h2>
              <p>{{ articles[0].excerpt }}</p>
              <div class="blog-meta">
                <span><User :size="14" /> {{ articles[0].author }}</span>
                <span><Calendar :size="14" /> {{ articles[0].date }}</span>
              </div>
            </div>
          </article>

          <article class="blog-card" v-for="article in articles.slice(1)" :key="article.title">
            <div class="blog-image small">
              <FileText :size="32" />
            </div>
            <div class="blog-content">
              <span class="blog-category">{{ article.category }}</span>
              <h3>{{ article.title }}</h3>
              <p>{{ article.excerpt }}</p>
              <div class="blog-meta">
                <span><Calendar :size="14" /> {{ article.date }}</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section class="newsletter-section">
        <h2>Restez informé</h2>
        <p>Inscrivez-vous à notre newsletter pour recevoir nos derniers articles.</p>
        <form class="newsletter-form" @submit.prevent>
          <input type="email" placeholder="Votre email" />
          <button type="submit">S'inscrire</button>
        </form>
      </section>

      <AppFooter />
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import AppFooter from '@/components/AppFooter.vue'
import { BookOpen, Newspaper, FileText, User, Calendar } from 'lucide-vue-next'
import { ref } from 'vue'

const articles = ref([
  {
    title: 'SanTeKo lance sa nouvelle fonctionnalité de téléconsultation',
    excerpt: 'Découvrez comment notre nouvelle fonctionnalité de téléconsultation HD révolutionne l\'accès aux soins dans les zones rurales du Mali.',
    category: 'Produit',
    author: 'Équipe SanTeKo',
    date: '15 Mars 2026'
  },
  {
    title: 'L\'importance du dossier médical numérique',
    excerpt: 'Comment la digitalisation des dossiers médicaux améliore la qualité des soins.',
    category: 'Santé',
    date: '10 Mars 2026'
  },
  {
    title: 'Partenariat avec le Ministère de la Santé',
    excerpt: 'SanTeKo signe un accord majeur pour déployer sa plateforme dans les hôpitaux publics.',
    category: 'Actualités',
    date: '5 Mars 2026'
  },
  {
    title: 'Guide : Optimiser votre utilisation de SanTeKo',
    excerpt: 'Conseils et astuces pour tirer le meilleur parti de notre plateforme.',
    category: 'Tutoriel',
    date: '1 Mars 2026'
  }
])
</script>

<style scoped>
.page-container { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh; color: white; }
.hero-mini { padding: 100px 5% 60px; text-align: center; background: radial-gradient(ellipse at top, rgba(37, 99, 235, 0.15) 0%, transparent 50%); }
.badge { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #2563eb, #10b981); padding: 8px 20px; border-radius: 50px; font-size: 14px; font-weight: 600; margin-bottom: 24px; }
.hero-mini h1 { font-size: 3rem; font-weight: 900; margin-bottom: 20px; }
.hero-mini p { font-size: 1.2rem; color: #94a3b8; }

.blog-section { padding: 60px 5%; max-width: 1200px; margin: 0 auto; }
.blog-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }

.blog-card { background: rgba(255, 255, 255, 0.05); border-radius: 20px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1); transition: all 0.3s ease; cursor: pointer; }
.blog-card:hover { transform: translateY(-8px); border-color: #3b82f6; }
.blog-card.featured { grid-column: span 2; display: grid; grid-template-columns: 1fr 1fr; }

.blog-image { background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(16, 185, 129, 0.2)); display: flex; align-items: center; justify-content: center; min-height: 200px; color: #3b82f6; }
.blog-image.small { min-height: 150px; }

.blog-content { padding: 30px; }
.blog-category { display: inline-block; padding: 4px 12px; background: rgba(59, 130, 246, 0.2); color: #3b82f6; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
.blog-card h2 { font-size: 1.8rem; font-weight: 800; margin-bottom: 16px; line-height: 1.3; }
.blog-card h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 12px; line-height: 1.4; }
.blog-content p { color: #94a3b8; line-height: 1.6; margin-bottom: 20px; }
.blog-meta { display: flex; gap: 20px; color: #64748b; font-size: 13px; }
.blog-meta span { display: flex; align-items: center; gap: 6px; }

.newsletter-section { padding: 80px 5%; text-align: center; background: linear-gradient(135deg, #2563eb, #10b981); }
.newsletter-section h2 { font-size: 2rem; font-weight: 800; margin-bottom: 16px; }
.newsletter-section > p { opacity: 0.9; margin-bottom: 30px; }
.newsletter-form { display: flex; gap: 12px; max-width: 500px; margin: 0 auto; }
.newsletter-form input { flex: 1; padding: 16px 24px; border: none; border-radius: 12px; font-size: 16px; }
.newsletter-form button { padding: 16px 32px; background: #0f172a; color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; }
.newsletter-form button:hover { transform: translateY(-2px); }

@media (max-width: 768px) { 
  .hero-mini h1 { font-size: 2rem; } 
  .blog-card.featured { grid-column: span 1; grid-template-columns: 1fr; }
  .newsletter-form { flex-direction: column; }
}
</style>
