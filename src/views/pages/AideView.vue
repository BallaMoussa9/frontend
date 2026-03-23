<template>
  <AppLayout>
    <div class="page-container">
      <section class="hero-mini">
        <div class="hero-content">
          <span class="badge">
            <HelpCircle :size="16" />
            Centre d'aide
          </span>
          <h1>Comment pouvons-nous vous aider ?</h1>
          <p>Trouvez rapidement des réponses à vos questions ou contactez notre équipe support.</p>
          
          <div class="search-box">
            <Search :size="20" />
            <input type="text" v-model="searchQuery" placeholder="Rechercher dans l'aide..." />
          </div>
        </div>
      </section>

      <section class="categories-section">
        <div class="categories-grid">
          <div class="category-card" v-for="category in categories" :key="category.title">
            <div class="category-icon">
              <component :is="category.icon" :size="28" />
            </div>
            <h3>{{ category.title }}</h3>
            <p>{{ category.description }}</p>
            <ul>
              <li v-for="article in category.articles" :key="article">{{ article }}</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="faq-section">
        <h2>Questions fréquemment posées</h2>
        <div class="faq-list">
          <div 
            class="faq-item" 
            v-for="(faq, index) in faqs" 
            :key="index"
            :class="{ 'active': activeFaq === index }"
            @click="toggleFaq(index)"
          >
            <div class="faq-question">
              <h3>{{ faq.question }}</h3>
              <ChevronDown :size="20" class="chevron" />
            </div>
            <div class="faq-answer">
              <p>{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="contact-section">
        <div class="contact-grid">
          <div class="contact-card">
            <div class="contact-icon">
              <MessageCircle :size="32" />
            </div>
            <h3>Chat en direct</h3>
            <p>Discutez avec notre équipe support en temps réel.</p>
            <button class="contact-btn">Démarrer le chat</button>
          </div>
          
          <div class="contact-card">
            <div class="contact-icon">
              <Mail :size="32" />
            </div>
            <h3>Email</h3>
            <p>Envoyez-nous un email et nous vous répondrons sous 24h.</p>
            <a href="mailto:support@santeko.ml" class="contact-btn">support@santeko.ml</a>
          </div>
          
          <div class="contact-card">
            <div class="contact-icon">
              <Phone :size="32" />
            </div>
            <h3>Téléphone</h3>
            <p>Appelez-nous du lundi au vendredi, 8h-18h.</p>
            <a href="tel:+22300000000" class="contact-btn">+223 XX XX XX XX</a>
          </div>
        </div>
      </section>

      <AppFooter />
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import AppFooter from '@/components/AppFooter.vue'
import { 
  HelpCircle, Search, User, Calendar, FileText, Shield, CreditCard, Settings,
  ChevronDown, MessageCircle, Mail, Phone
} from 'lucide-vue-next'
import { ref } from 'vue'

const searchQuery = ref('')
const activeFaq = ref(null)

const toggleFaq = (index) => {
  activeFaq.value = activeFaq.value === index ? null : index
}

const categories = ref([
  {
    icon: User,
    title: 'Compte & Profil',
    description: 'Gérez votre compte et vos informations personnelles',
    articles: ['Créer un compte', 'Modifier mon profil', 'Réinitialiser mon mot de passe']
  },
  {
    icon: Calendar,
    title: 'Rendez-vous',
    description: 'Tout sur la prise et gestion de rendez-vous',
    articles: ['Prendre un rendez-vous', 'Annuler un rendez-vous', 'Rappels automatiques']
  },
  {
    icon: FileText,
    title: 'Dossier médical',
    description: 'Accédez et gérez votre dossier médical',
    articles: ['Consulter mon dossier', 'Partager mes documents', 'Télécharger mes résultats']
  },
  {
    icon: Shield,
    title: 'Sécurité & Confidentialité',
    description: 'Protection de vos données de santé',
    articles: ['Sécurité du compte', 'Gestion des accès', 'Supprimer mes données']
  },
  {
    icon: CreditCard,
    title: 'Facturation',
    description: 'Questions sur les paiements et factures',
    articles: ['Modes de paiement', 'Historique des factures', 'Remboursements']
  },
  {
    icon: Settings,
    title: 'Paramètres',
    description: 'Personnalisez votre expérience SanTeKo',
    articles: ['Notifications', 'Langue et région', 'Préférences de communication']
  }
])

const faqs = ref([
  {
    question: 'Comment créer un compte SanTeKo ?',
    answer: 'Pour créer un compte, cliquez sur "Créer un compte" en haut de la page. Remplissez le formulaire avec vos informations personnelles, vérifiez votre email, et votre compte sera activé immédiatement.'
  },
  {
    question: 'Comment prendre un rendez-vous avec un médecin ?',
    answer: 'Connectez-vous à votre compte, accédez à la section "Rendez-vous", sélectionnez la spécialité souhaitée, choisissez un médecin disponible, puis sélectionnez un créneau horaire qui vous convient.'
  },
  {
    question: 'Mes données de santé sont-elles sécurisées ?',
    answer: 'Absolument. Nous utilisons un chiffrement de bout en bout, des serveurs sécurisés certifiés, et nous respectons les normes les plus strictes en matière de protection des données de santé.'
  },
  {
    question: 'Comment accéder à mes résultats d\'analyses ?',
    answer: 'Vos résultats d\'analyses sont disponibles dans votre dossier médical. Vous recevrez une notification dès qu\'un nouveau résultat est disponible. Vous pouvez les consulter et les télécharger à tout moment.'
  },
  {
    question: 'Comment fonctionne le service SOS ?',
    answer: 'En cas d\'urgence, appuyez sur le bouton SOS dans l\'application. Votre position sera automatiquement partagée avec les services d\'urgence les plus proches qui seront immédiatement alertés.'
  },
  {
    question: 'Puis-je partager mon dossier médical avec un autre médecin ?',
    answer: 'Oui, vous pouvez partager votre dossier médical avec n\'importe quel professionnel de santé inscrit sur SanTeKo. Allez dans les paramètres de votre dossier et ajoutez les professionnels autorisés.'
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

.hero-mini > .hero-content > p {
  font-size: 1.2rem;
  color: #94a3b8;
  max-width: 600px;
  margin: 0 auto 40px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 500px;
  margin: 0 auto;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
}

.search-box svg {
  color: #64748b;
}

.search-box input {
  flex: 1;
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  outline: none;
}

.search-box input::placeholder {
  color: #64748b;
}

.categories-section {
  padding: 80px 5%;
  max-width: 1200px;
  margin: 0 auto;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.category-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-5px);
  border-color: #3b82f6;
}

.category-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #2563eb, #10b981);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: white;
}

.category-card h3 {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.category-card > p {
  color: #94a3b8;
  margin-bottom: 20px;
  font-size: 14px;
}

.category-card ul {
  list-style: none;
  padding: 0;
}

.category-card ul li {
  padding: 8px 0;
  color: #3b82f6;
  font-size: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.category-card ul li:last-child {
  border-bottom: none;
}

.faq-section {
  padding: 80px 5%;
  background: rgba(0, 0, 0, 0.2);
}

.faq-section h2 {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 60px;
}

.faq-list {
  max-width: 800px;
  margin: 0 auto;
}

.faq-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.faq-item:hover {
  border-color: rgba(59, 130, 246, 0.5);
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
}

.faq-question h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.chevron {
  transition: transform 0.3s ease;
  color: #64748b;
}

.faq-item.active .chevron {
  transform: rotate(180deg);
  color: #3b82f6;
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.faq-item.active .faq-answer {
  max-height: 200px;
}

.faq-answer p {
  padding: 0 24px 24px;
  color: #94a3b8;
  line-height: 1.7;
  margin: 0;
}

.contact-section {
  padding: 80px 5%;
  max-width: 1200px;
  margin: 0 auto;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.contact-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.contact-card:hover {
  transform: translateY(-5px);
  border-color: #3b82f6;
}

.contact-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #2563eb, #10b981);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: white;
}

.contact-card h3 {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.contact-card p {
  color: #94a3b8;
  margin-bottom: 24px;
  font-size: 14px;
}

.contact-btn {
  display: inline-block;
  padding: 12px 24px;
  background: linear-gradient(135deg, #2563eb, #10b981);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.contact-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
}

@media (max-width: 768px) {
  .hero-mini h1 {
    font-size: 2rem;
  }
}
</style>
