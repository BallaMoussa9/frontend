<template>
  <div class="page-404-container">
    <!-- Animated Background -->
    <div class="background-animation">
      <div class="floating-icon" style="top: 10%; left: 10%; animation-delay: 0s;">
        <AlertCircle :size="30" />
      </div>
      <div class="floating-icon" style="top: 20%; right: 15%; animation-delay: 2s;">
        <Home :size="25" />
      </div>
      <div class="floating-icon" style="bottom: 30%; left: 15%; animation-delay: 4s;">
        <Search :size="28" />
      </div>
      <div class="floating-icon" style="bottom: 20%; right: 10%; animation-delay: 6s;">
        <ArrowLeft :size="32" />
      </div>
    </div>

    <!-- Main Content -->
    <div class="error-container">
      <div class="error-card">
        <div class="error-visual">
          <div class="error-number">404</div>
          <div class="error-icon">
            <AlertCircle :size="80" />
          </div>
        </div>
        
        <div class="error-content">
          <h1 class="error-title">Oups ! Page introuvable</h1>
          <p class="error-description">
            La page que vous recherchez semble avoir disparu dans les limbes numériques. 
            Peut-être a-t-elle été déplacée, supprimée ou n'a-t-elle jamais existé.
          </p>
          
          <div class="error-suggestions">
            <h3>Que pouvez-vous faire ?</h3>
            <ul>
              <li>Vérifier l'URL pour d'éventuelles erreurs de frappe</li>
              <li>Retourner à la page d'accueil</li>
              <li>Contacter le support technique</li>
            </ul>
          </div>
          
          <div class="error-actions">
            <button @click="goBack" class="btn-secondary">
              <ArrowLeft :size="20" />
              Retour
            </button>
            <button @click="goHome" class="btn-primary">
              <Home :size="20" />
              Accueil
            </button>
          </div>
        </div>
      </div>
      
      <div class="help-section">
        <h3>Besoin d'aide ?</h3>
        <p>Notre équipe de support est là pour vous aider à retrouver votre chemin.</p>
        <button @click="contactSupport" class="btn-support">
          <MessageSquare :size="20" />
          Contacter le support
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { AlertCircle, Home, Search, ArrowLeft, MessageSquare } from 'lucide-vue-next';

function goBack() {
  window.history.back();
}

function goHome() {
  window.location.href = '/';
}

function contactSupport() {
  // Ouvrir le client email ou rediriger vers une page de support
  window.location.href = 'mailto:support@santeko.com?subject=Problème d\'accès - Page 404';
}
</script>

<style scoped>
/* === Variables CSS - Glassmorphism Theme === */
:root {
  --primary: #2563eb;
  --primary-dark: #1e40af;
  --primary-light: #3b82f6;
  --secondary: #10b981;
  --secondary-dark: #059669;
  --secondary-light: #34d399;
  --accent: #8b5cf6;
  --accent-light: #a78bfa;
  --success: #22c55e;
  --success-light: #4caf50;
  --warning: #f59e0b;
  --warning-light: #ffb300;
  --danger: #ef4444;
  --danger-light: #f44336;
  --info: #06b6d4;
  --info-light: #29b6f6;
  --dark: #0f172a;
  --darker: #0d47a1;
  --light: #ffffff;
  --gray: #94a3b8;
  --gray-light: #cbd5e1;
  --gray-dark: #64748b;
  --border: rgba(255, 255, 255, 0.2);
  --shadow: rgba(0, 0, 0, 0.1);
  --blur: blur(20px);
}

/* === Page Container === */
.page-404-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

/* === Animated Background === */
.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.floating-icon {
  position: absolute;
  color: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

/* === Error Container === */
.error-container {
  max-width: 800px;
  width: 100%;
  z-index: 2;
  position: relative;
}

/* === Error Card === */
.error-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: var(--blur);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px var(--shadow);
  text-align: center;
  margin-bottom: 2rem;
  animation: fadeInUp 0.8s ease-out;
}

/* === Error Visual === */
.error-visual {
  position: relative;
  margin-bottom: 2rem;
}

.error-number {
  font-size: 8rem;
  font-weight: 900;
  color: var(--danger);
  text-shadow: 0 4px 20px rgba(239, 68, 68, 0.3);
  line-height: 1;
  margin-bottom: 1rem;
  animation: pulse 2s ease-in-out infinite;
}

.error-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(239, 68, 68, 0.2);
  animation: rotate 10s linear infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes rotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

/* === Error Content === */
.error-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.error-description {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* === Error Suggestions === */
.error-suggestions {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.error-suggestions h3 {
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
}

.error-suggestions ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.error-suggestions li {
  color: rgba(255, 255, 255, 0.8);
  padding: 0.5rem 0;
  position: relative;
  padding-left: 1.5rem;
}

.error-suggestions li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: var(--primary);
  font-weight: bold;
}

/* === Error Actions === */
.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary, .btn-support {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: var(--blur);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* === Help Section === */
.help-section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: var(--blur);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.help-section h3 {
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.help-section p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.btn-support {
  background: linear-gradient(135deg, var(--secondary), var(--secondary-dark));
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  margin: 0 auto;
}

.btn-support:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

/* === Animations === */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* === Responsive Design === */
@media (max-width: 768px) {
  .page-404-container {
    padding: 1rem;
  }
  
  .error-card {
    padding: 2rem;
  }
  
  .error-number {
    font-size: 6rem;
  }
  
  .error-title {
    font-size: 2rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn-primary, .btn-secondary, .btn-support {
    width: 100%;
    max-width: 250px;
  }
}
</style>
