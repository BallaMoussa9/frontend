<template>
  <AppLayout>
    <div class="page-container">
      <section class="hero-mini">
        <div class="hero-content">
          <span class="badge">
            <FileText :size="16" />
            Conditions
          </span>
          <h1>Conditions Générales d'Utilisation</h1>
          <p>Veuillez lire attentivement ces conditions avant d'utiliser la plateforme SanTeKo.</p>
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
              <h2>1. Acceptation des conditions</h2>
              <p>
                En accédant et en utilisant la plateforme SanTeKo, vous acceptez d'être lié par ces 
                Conditions Générales d'Utilisation. Si vous n'acceptez pas ces conditions, veuillez 
                ne pas utiliser notre service.
              </p>
            </section>

            <section class="policy-section">
              <h2>2. Description du service</h2>
              <p>
                SanTeKo est une plateforme de santé numérique qui permet la gestion des dossiers médicaux, 
                la prise de rendez-vous, la téléconsultation, et la coordination des soins entre patients 
                et professionnels de santé.
              </p>
            </section>

            <section class="policy-section">
              <h2>3. Inscription et compte</h2>
              <ul>
                <li>Vous devez fournir des informations exactes et complètes lors de l'inscription</li>
                <li>Vous êtes responsable de la confidentialité de vos identifiants de connexion</li>
                <li>Vous devez nous informer immédiatement de toute utilisation non autorisée de votre compte</li>
                <li>Un compte ne peut être utilisé que par son titulaire</li>
              </ul>
            </section>

            <section class="policy-section">
              <h2>4. Utilisation acceptable</h2>
              <p>Vous vous engagez à :</p>
              <ul>
                <li>Utiliser le service uniquement à des fins légales et conformément à ces conditions</li>
                <li>Ne pas tenter d'accéder aux données d'autres utilisateurs sans autorisation</li>
                <li>Ne pas perturber le fonctionnement de la plateforme</li>
                <li>Ne pas utiliser le service pour diffuser des informations fausses ou trompeuses</li>
              </ul>
            </section>

            <section class="policy-section">
              <h2>5. Données de santé</h2>
              <p>
                Les informations de santé partagées sur la plateforme sont destinées uniquement à faciliter 
                votre prise en charge médicale. Elles ne remplacent pas une consultation médicale en personne 
                lorsque celle-ci est nécessaire.
              </p>
            </section>

            <section class="policy-section">
              <h2>6. Responsabilités</h2>
              <ul>
                <li>SanTeKo fournit une plateforme technique et n'est pas responsable des actes médicaux</li>
                <li>Les professionnels de santé restent responsables de leurs décisions médicales</li>
                <li>En cas d'urgence vitale, appelez immédiatement les services d'urgence</li>
              </ul>
            </section>

            <section class="policy-section">
              <h2>7. Propriété intellectuelle</h2>
              <p>
                Tous les contenus de la plateforme (logos, textes, images, logiciels) sont la propriété 
                de SanTeKo / Abdaty Technologie et sont protégés par les lois sur la propriété intellectuelle.
              </p>
            </section>

            <section class="policy-section">
              <h2>8. Modification des conditions</h2>
              <p>
                Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications 
                entreront en vigueur dès leur publication sur la plateforme. Votre utilisation continue 
                du service après modification vaut acceptation des nouvelles conditions.
              </p>
            </section>

            <section class="policy-section">
              <h2>9. Résiliation</h2>
              <p>
                Vous pouvez résilier votre compte à tout moment depuis les paramètres de votre profil. 
                Nous nous réservons le droit de suspendre ou résilier votre compte en cas de violation 
                de ces conditions.
              </p>
            </section>

            <section class="policy-section">
              <h2>10. Contact</h2>
              <p>
                Pour toute question concernant ces conditions, contactez-nous :
              </p>
              <div class="contact-info">
                <p><strong>Email :</strong> legal@santeko.ml</p>
                <p><strong>Adresse :</strong> Bamako, Mali - Quartier ACI 2000</p>
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
import { FileText, Calendar } from 'lucide-vue-next'
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
  max-width: 600px;
  margin: 0 auto;
}

.content-section {
  padding: 60px 5% 100px;
}

.content-wrapper {
  max-width: 900px;
  margin: 0 auto;
}

.last-update {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 30px;
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 40px;
}

.policy-content {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 24px;
  padding: 50px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.policy-section {
  margin-bottom: 40px;
}

.policy-section:last-child {
  margin-bottom: 0;
}

.policy-section h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: #3b82f6;
}

.policy-section p {
  font-size: 1rem;
  line-height: 1.8;
  color: #cbd5e1;
  margin-bottom: 16px;
}

.policy-section ul {
  list-style: none;
  padding: 0;
  margin: 16px 0;
}

.policy-section ul li {
  padding: 12px 0 12px 24px;
  position: relative;
  color: #cbd5e1;
  line-height: 1.6;
}

.policy-section ul li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 18px;
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #2563eb, #10b981);
  border-radius: 50%;
}

.policy-section ul li strong {
  color: white;
}

.contact-info {
  background: rgba(37, 99, 235, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-top: 16px;
}

.contact-info p {
  margin-bottom: 8px;
}

.contact-info p:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .hero-mini h1 {
    font-size: 2rem;
  }
  
  .policy-content {
    padding: 30px 20px;
  }
}
</style>
