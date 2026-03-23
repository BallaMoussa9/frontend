<template>
  <AppLayout>
    <div class="page-container">
      <section class="hero-mini">
        <div class="hero-content">
          <span class="badge">
            <Mail :size="16" />
            Contactez-nous
          </span>
          <h1>Nous sommes là pour vous</h1>
          <p>Une question, une suggestion ou besoin d'aide ? Notre équipe est à votre écoute.</p>
        </div>
      </section>

      <section class="contact-section">
        <div class="contact-grid">
          <div class="contact-info">
            <h2>Informations de contact</h2>
            <p>N'hésitez pas à nous contacter par le moyen qui vous convient le mieux.</p>
            
            <div class="info-cards">
              <div class="info-card">
                <div class="info-icon">
                  <MapPin :size="24" />
                </div>
                <div class="info-content">
                  <h3>Adresse</h3>
                  <p>Bamako, Mali<br>Quartier ACI 2000</p>
                </div>
              </div>

              <div class="info-card">
                <div class="info-icon">
                  <Phone :size="24" />
                </div>
                <div class="info-content">
                  <h3>Téléphone</h3>
                  <p>+223 XX XX XX XX<br>+223 XX XX XX XX</p>
                </div>
              </div>

              <div class="info-card">
                <div class="info-icon">
                  <Mail :size="24" />
                </div>
                <div class="info-content">
                  <h3>Email</h3>
                  <p>contact@santeko.ml<br>support@santeko.ml</p>
                </div>
              </div>

              <div class="info-card">
                <div class="info-icon">
                  <Clock :size="24" />
                </div>
                <div class="info-content">
                  <h3>Horaires</h3>
                  <p>Lun - Ven: 8h - 18h<br>Sam: 9h - 13h</p>
                </div>
              </div>
            </div>

            <div class="social-section">
              <h3>Suivez-nous</h3>
              <div class="social-links">
                <a href="https://facebook.com/santeko" target="_blank" class="social-link">
                  <Facebook :size="20" />
                </a>
                <a href="https://twitter.com/santeko" target="_blank" class="social-link">
                  <Twitter :size="20" />
                </a>
                <a href="https://linkedin.com/company/santeko" target="_blank" class="social-link">
                  <Linkedin :size="20" />
                </a>
                <a href="https://instagram.com/santeko" target="_blank" class="social-link">
                  <Instagram :size="20" />
                </a>
              </div>
            </div>
          </div>

          <div class="contact-form-container">
            <form @submit.prevent="submitForm" class="contact-form">
              <h2>Envoyez-nous un message</h2>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="firstName">Prénom</label>
                  <input type="text" id="firstName" v-model="form.firstName" required placeholder="Votre prénom">
                </div>
                <div class="form-group">
                  <label for="lastName">Nom</label>
                  <input type="text" id="lastName" v-model="form.lastName" required placeholder="Votre nom">
                </div>
              </div>

              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" v-model="form.email" required placeholder="votre@email.com">
              </div>

              <div class="form-group">
                <label for="subject">Sujet</label>
                <select id="subject" v-model="form.subject" required>
                  <option value="">Sélectionnez un sujet</option>
                  <option value="general">Question générale</option>
                  <option value="support">Support technique</option>
                  <option value="partnership">Partenariat</option>
                  <option value="demo">Demande de démo</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div class="form-group">
                <label for="message">Message</label>
                <textarea id="message" v-model="form.message" required rows="5" placeholder="Votre message..."></textarea>
              </div>

              <button type="submit" class="submit-btn" :disabled="isSubmitting">
                <Send :size="20" />
                {{ isSubmitting ? 'Envoi en cours...' : 'Envoyer le message' }}
              </button>

              <p v-if="submitSuccess" class="success-message">
                <CheckCircle :size="20" />
                Message envoyé avec succès ! Nous vous répondrons rapidement.
              </p>
            </form>
          </div>
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

      <AppFooter />
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import AppFooter from '@/components/AppFooter.vue'
import { Mail, MapPin, Phone, Clock, Facebook, Twitter, Linkedin, Instagram, Send, CheckCircle } from 'lucide-vue-next'
import { ref } from 'vue'

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  subject: '',
  message: ''
})

const isSubmitting = ref(false)
const submitSuccess = ref(false)

const submitForm = async () => {
  isSubmitting.value = true
  // Simulation d'envoi
  await new Promise(resolve => setTimeout(resolve, 1500))
  isSubmitting.value = false
  submitSuccess.value = true
  form.value = { firstName: '', lastName: '', email: '', subject: '', message: '' }
  setTimeout(() => { submitSuccess.value = false }, 5000)
}

const faqs = ref([
  {
    question: 'Comment créer un compte SanTeKo ?',
    answer: 'Cliquez sur "Créer un compte" en haut de la page et suivez les instructions. Vous recevrez un email de confirmation.'
  },
  {
    question: 'SanTeKo est-il gratuit ?',
    answer: 'SanTeKo propose un essai gratuit de 30 jours. Ensuite, plusieurs formules sont disponibles selon vos besoins.'
  },
  {
    question: 'Comment contacter le support technique ?',
    answer: 'Vous pouvez nous joindre par email à support@santeko.ml ou via le formulaire ci-dessus en sélectionnant "Support technique".'
  },
  {
    question: 'Mes données sont-elles sécurisées ?',
    answer: 'Absolument. Nous utilisons les protocoles de sécurité les plus avancés pour protéger vos données de santé.'
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
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 20px;
}

.hero-mini p {
  font-size: 1.3rem;
  color: #94a3b8;
  max-width: 600px;
  margin: 0 auto;
}

.contact-section {
  padding: 80px 5%;
  max-width: 1200px;
  margin: 0 auto;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 60px;
}

.contact-info h2 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 16px;
}

.contact-info > p {
  color: #94a3b8;
  margin-bottom: 40px;
}

.info-cards {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card {
  display: flex;
  gap: 20px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.info-card:hover {
  border-color: #3b82f6;
  transform: translateX(8px);
}

.info-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #2563eb, #10b981);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-content h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.info-content p {
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.6;
}

.social-section {
  margin-top: 40px;
}

.social-section h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 16px;
}

.social-links {
  display: flex;
  gap: 12px;
}

.social-link {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: #3b82f6;
  transform: translateY(-3px);
}

.contact-form-container {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.contact-form h2 {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 30px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #cbd5e1;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: white;
  font-size: 15px;
  transition: all 0.3s ease;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #64748b;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.1);
}

.form-group select {
  cursor: pointer;
}

.form-group select option {
  background: #1e293b;
  color: white;
}

.submit-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  background: linear-gradient(135deg, #2563eb, #10b981);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.4);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding: 16px;
  background: rgba(16, 185, 129, 0.2);
  border-radius: 12px;
  color: #10b981;
  font-weight: 600;
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

.faq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.faq-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.faq-item h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: #3b82f6;
}

.faq-item p {
  color: #94a3b8;
  line-height: 1.7;
}

@media (max-width: 768px) {
  .hero-mini h1 {
    font-size: 2.5rem;
  }
  
  .contact-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
