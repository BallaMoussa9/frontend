<template>
  <AppLayout>
    <div class="page-container">
      <section class="hero-mini">
        <div class="hero-content">
          <span class="badge">
            <Shield :size="16" />
            Confidentialité
          </span>
          <h1>Politique de Confidentialité</h1>
          <p>Nous prenons la protection de vos données très au sérieux. Découvrez comment nous protégeons vos informations.</p>
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
              <h2>1. Introduction</h2>
              <p>
                SanTeKo, développé par Abdaty Technologie, s'engage à protéger la vie privée de ses utilisateurs. 
                Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons 
                vos informations personnelles et de santé.
              </p>
            </section>

            <section class="policy-section">
              <h2>2. Données collectées</h2>
              <p>Nous collectons les types de données suivants :</p>
              <ul>
                <li><strong>Informations d'identification :</strong> nom, prénom, email, téléphone, adresse</li>
                <li><strong>Données de santé :</strong> antécédents médicaux, prescriptions, résultats d'analyses</li>
                <li><strong>Données de connexion :</strong> adresse IP, type de navigateur, historique de navigation</li>
                <li><strong>Données de localisation :</strong> uniquement pour les services d'urgence SOS</li>
              </ul>
            </section>

            <section class="policy-section">
              <h2>3. Utilisation des données</h2>
              <p>Vos données sont utilisées pour :</p>
              <ul>
                <li>Fournir et améliorer nos services de santé</li>
                <li>Permettre la communication entre patients et professionnels de santé</li>
                <li>Gérer les rendez-vous et les prescriptions</li>
                <li>Assurer les services d'urgence et de géolocalisation</li>
                <li>Envoyer des notifications importantes concernant votre santé</li>
              </ul>
            </section>

            <section class="policy-section">
              <h2>4. Protection des données</h2>
              <p>
                Nous mettons en œuvre des mesures de sécurité strictes pour protéger vos données :
              </p>
              <ul>
                <li>Chiffrement de bout en bout de toutes les communications</li>
                <li>Stockage sécurisé sur des serveurs certifiés</li>
                <li>Accès restreint aux données selon les rôles</li>
                <li>Audits de sécurité réguliers</li>
                <li>Conformité aux normes internationales de protection des données de santé</li>
              </ul>
            </section>

            <section class="policy-section">
              <h2>5. Partage des données</h2>
              <p>
                Vos données de santé ne sont partagées qu'avec les professionnels de santé autorisés 
                impliqués dans votre prise en charge. Nous ne vendons jamais vos données à des tiers.
              </p>
            </section>

            <section class="policy-section">
              <h2>6. Vos droits</h2>
              <p>Conformément à la réglementation, vous disposez des droits suivants :</p>
              <ul>
                <li><strong>Droit d'accès :</strong> consulter vos données personnelles</li>
                <li><strong>Droit de rectification :</strong> corriger vos informations</li>
                <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
                <li><strong>Droit à la portabilité :</strong> récupérer vos données dans un format standard</li>
                <li><strong>Droit d'opposition :</strong> vous opposer à certains traitements</li>
              </ul>
            </section>

            <section class="policy-section">
              <h2>7. Conservation des données</h2>
              <p>
                Les données de santé sont conservées conformément aux obligations légales en vigueur au Mali. 
                Les données de compte sont conservées tant que votre compte est actif, puis supprimées 
                après une période de 5 ans suivant la clôture du compte.
              </p>
            </section>

            <section class="policy-section">
              <h2>8. Contact</h2>
              <p>
                Pour toute question concernant cette politique ou pour exercer vos droits, contactez notre 
                Délégué à la Protection des Données :
              </p>
              <div class="contact-info">
                <p><strong>Email :</strong> dpo@santeko.ml</p>
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
import { Shield, Calendar } from 'lucide-vue-next'
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
