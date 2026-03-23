<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section footer-brand">
        <div class="footer-logo">
          <img src="/santeko.png" alt="SanTeKo"/>
          <h3>SanTeKo</h3>
        </div>
        <p>Digitaliser la santé au Mali pour un avenir plus sain. Une plateforme innovante au service de tous.</p>
        <div class="social-links">
          <a href="https://facebook.com/santeko" target="_blank" rel="noopener noreferrer" class="social-link facebook">
            <Facebook :size="20" />
          </a>
          <a href="https://twitter.com/santeko" target="_blank" rel="noopener noreferrer" class="social-link twitter">
            <Twitter :size="20" />
          </a>
          <a href="https://linkedin.com/company/santeko" target="_blank" rel="noopener noreferrer" class="social-link linkedin">
            <Linkedin :size="20" />
          </a>
          <a href="https://instagram.com/santeko" target="_blank" rel="noopener noreferrer" class="social-link instagram">
            <Instagram :size="20" />
          </a>
          <a href="https://github.com/santeko" target="_blank" rel="noopener noreferrer" class="social-link github">
            <Github :size="20" />
          </a>
          <a href="https://youtube.com/@santeko" target="_blank" rel="noopener noreferrer" class="social-link youtube">
            <Youtube :size="20" />
          </a>
        </div>
      </div>

      <div class="footer-section">
        <h4>Produit</h4>
        <ul>
          <li><router-link to="/fonctionnalites">Fonctionnalités</router-link></li>
          <li><router-link to="/tarification">Tarification</router-link></li>
          <li><router-link to="/demo">Démo</router-link></li>
          <li><router-link to="/api">API</router-link></li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>Entreprise</h4>
        <ul>
          <li><router-link to="/a-propos">À propos</router-link></li>
          <li><router-link to="/carrieres">Carrières</router-link></li>
          <li><router-link to="/partenaires">Partenaires</router-link></li>
          <li><router-link to="/blog">Blog</router-link></li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>Support</h4>
        <ul>
          <li><router-link to="/aide">Aide</router-link></li>
          <li><router-link to="/contact">Contact</router-link></li>
          <li><router-link to="/formation">Formation</router-link></li>
          <li><router-link to="/statut">Statut</router-link></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p>© 2026 SanTeKo - Abdaty Technologie. Tous droits réservés.</p>
      <div class="footer-links">
        <router-link to="/confidentialite">Confidentialité</router-link>
        <router-link to="/conditions">Conditions</router-link>
        <router-link to="/cookies">Cookies</router-link>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { Facebook, Twitter, Linkedin, Instagram, Github, Youtube } from 'lucide-vue-next'
</script>

<style scoped>
.footer {
  background: linear-gradient(180deg, #0a0f1a 0%, #0f172a 100%);
  padding: 80px 5% 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 60px;
  max-width: 1400px;
  margin: 0 auto 60px;
}

.footer-brand {
  max-width: 350px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.footer-logo img {
  width: 45px;
  height: 45px;
  border-radius: 12px;
}

.footer-logo h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #3b82f6, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer-brand > p {
  color: #94a3b8;
  line-height: 1.7;
  margin-bottom: 24px;
}

.social-links {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.social-link {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.social-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 14px;
}

.social-link.facebook::before { background: linear-gradient(135deg, #1877f2, #0d5bbd); }
.social-link.twitter::before { background: linear-gradient(135deg, #1da1f2, #0c85d0); }
.social-link.linkedin::before { background: linear-gradient(135deg, #0077b5, #005885); }
.social-link.instagram::before { background: linear-gradient(135deg, #e4405f, #c13584, #833ab4); }
.social-link.github::before { background: linear-gradient(135deg, #333, #24292e); }
.social-link.youtube::before { background: linear-gradient(135deg, #ff0000, #cc0000); }

.social-link:hover {
  transform: translateY(-4px) scale(1.05);
  border-color: transparent;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
}

.social-link:hover::before { opacity: 1; }
.social-link svg { position: relative; z-index: 2; }

.footer-section h4 {
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 24px;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section ul li {
  margin-bottom: 14px;
}

.footer-section ul li a {
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 15px;
}

.footer-section ul li a:hover {
  color: #3b82f6;
  padding-left: 8px;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 1400px;
  margin: 0 auto;
}

.footer-bottom p {
  color: #64748b;
  font-size: 14px;
}

.footer-links {
  display: flex;
  gap: 30px;
}

.footer-links a {
  color: #64748b;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: #3b82f6;
}

@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }
  
  .footer-brand {
    grid-column: span 2;
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
  }
  
  .footer-brand {
    grid-column: span 1;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
}
</style>
