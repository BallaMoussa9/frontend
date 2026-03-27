<template>
  <div class="admin-page-container">
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside :class="['sidebar', { 'open': isSidebarOpen }]">
        <div class="sidebar-header">
          <div class="logo-icon">S</div>
          <div class="logo-text">SanTeKo <span>Admin</span></div>
        </div>

        <nav class="menu">
          <RouterLink :to="{name:'AdminDashboard'}" class="menu-item" @click="closeSidebar">
            <BarChart3 :size="20" class="menu-icon" /> Dashboard
          </RouterLink>
          
          <div class="menu-divider">Gestion & Outils</div>
          
          <RouterLink :to="{name:'Service'}" class="menu-item" @click="closeSidebar">
            <Activity :size="20" class="menu-icon" /> Gestion Services
          </RouterLink>
          <RouterLink :to="{name:'AddRole'}" class="menu-item" @click="closeSidebar">
            <Users :size="20" class="menu-icon" /> Rôles & Accès
          </RouterLink>
          <RouterLink :to="{name:'Statistique'}" class="menu-item" @click="closeSidebar">
            <TrendingUp :size="20" class="menu-icon" /> Statistiques
          </RouterLink>

          <div class="menu-divider">Communication</div>

          <RouterLink :to="{name:'Dialogue'}" class="menu-item" @click="closeSidebar">
            <MessageSquare :size="20" class="menu-icon" /> Conversations
          </RouterLink>
          <RouterLink :to="{name:'Notification'}" class="menu-item" @click="closeSidebar">
            <Clock :size="20" class="menu-icon" /> Notifications
          </RouterLink>

          <div class="menu-divider">Configuration</div>

          <RouterLink :to="{name:'Settings'}" class="menu-item" @click="closeSidebar">
            <FileText :size="20" class="menu-icon" /> Paramètres
          </RouterLink>
        </nav>
      </aside>

      <!-- Mobile Toggle -->
      <button class="mobile-toggle" @click="toggleSidebar">
        {{ isSidebarOpen ? '✕' : '☰' }}
      </button>

      <div v-if="isSidebarOpen" class="sidebar-overlay" @click="isSidebarOpen = false"></div>

      <!-- Main Content -->
      <main class="admin-main">
        <div class="dashboard-admin">
          <!-- Header -->
          <header class="dashboard-header">
            <div class="header-content">
              <div class="title-section">
                <div class="title-content">
                  <div class="title-with-back">
                    <button class="back-btn" @click="goBack">
                      <ArrowLeft :size="20" />
                    </button>
                    <h1 class="dashboard-title">
                      <span class="title-icon">
                        <Users :size="24" />
                      </span>
                      Gestion des Patients
                    </h1>
                  </div>
                  <p class="dashboard-subtitle" v-if="filteredPatients.length > 0">
                    {{ filteredPatients.length }} patients répertoriés
                  </p>
                </div>
              </div>
              <div class="header-actions">
                <button class="action-btn primary" @click="openAddPatient">
                  <Plus :size="16" />
                  Ajouter un patient
                </button>
              </div>
            </div>
          </header>

          <!-- Search Section -->
          <div class="search-section">
            <div class="search-bar-wrapper">
              <Search :size="20" class="search-icon" />
              <input
                type="text"
                v-model="patientStore.searchTerm"
                @input="handleSearchInput"
                placeholder="Rechercher par nom, email ou statut (min. 3 car.)..."
                class="search-input"
              />
              <button v-if="patientStore.searchTerm" @click="clearSearch" class="btn-clear-search">
                <X :size="16" />
              </button>
            </div>
          </div>

          <!-- Feedback Messages -->
          <div class="feedback-area">
            <div v-if="patientStore.isLoading" class="state-message loading">
              <div class="spinner"></div>
              <span>Chargement des dossiers patients...</span>
            </div>
            <div v-if="patientStore.error" class="state-message error">
              <AlertTriangle :size="16" />
              <span>{{ patientStore.error }}</span>
            </div>
          </div>

          <!-- Table Section -->
          <div class="table-section" v-if="!patientStore.isLoading">
            <div class="table-container">
              <table class="patients-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Patient</th>
                    <th>Date de Naissance</th>
                    <th>Coordonnées</th>
                    <th>Statut</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!filteredPatients || filteredPatients.length === 0">
                    <td colspan="6" class="no-data">
                      <div class="empty-state">
                        <div class="empty-icon">
                          <FileText :size="48" />
                        </div>
                        <h3>Aucun patient trouvé</h3>
                        <p v-if="patientStore.searchTerm">
                          Aucun résultat pour "{{ patientStore.searchTerm }}"
                        </p>
                        <p v-else>
                          Commencez par ajouter votre premier patient
                        </p>
                        <button class="action-btn primary" @click="openAddPatient">
                          <Plus :size="16" />
                          Ajouter un patient
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr v-else v-for="(patient, index) in filteredPatients" :key="patient.id">
                    <td class="col-id">{{ index + 1 }}</td>
                    <td>
                      <div class="patient-cell">
                        <div class="patient-avatar">
                          {{ getInitials(patient.user) }}
                        </div>
                        <div class="patient-info">
                          <div class="patient-name">
                            {{ patient.user?.first_name }} {{ patient.user?.last_name }}
                          </div>
                          <div class="patient-id">ID: #{{ patient.id }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="date-cell">
                        <Calendar :size="14" class="date-icon" />
                        {{ patient.user?.birth_date || 'N/A' }}
                      </div>
                    </td>
                    <td>
                      <div class="contact-cell">
                        <div class="contact-item">
                          <Mail :size="14" class="contact-icon" />
                          <span>{{ patient.user?.email }}</span>
                        </div>
                        <div class="contact-item">
                          <Phone :size="14" class="contact-icon" />
                          <span>{{ patient.user?.phone || 'Non renseigné' }}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span :class="['status-badge', patient.status === 'actif' ? 'active' : 'inactive']">
                        <div class="status-dot"></div>
                        {{ patient.status === 'actif' ? 'Actif' : 'Inactif' }}
                      </span>
                    </td>
                    <td class="text-right">
                      <div class="action-buttons">
                        <RouterLink 
                          :to="{ name: 'SeenDossiert', params: { id: patient.id } }" 
                          class="action-btn-icon view" 
                          title="Voir le dossier"
                        >
                          <Eye :size="16" />
                        </RouterLink>
                        <RouterLink 
                          :to="{ name: 'EditPatient', params: { id: patient.id } }" 
                          class="action-btn-icon edit" 
                          title="Modifier"
                        >
                          <Edit :size="16" />
                        </RouterLink>
                        <button 
                          class="action-btn-icon delete" 
                          @click="confirmDelete(patient.id)" 
                          title="Supprimer"
                        >
                          <Trash2 :size="16" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { usePatientStore } from '../../stores/patientStore';
import { 
  BarChart3, 
  Users, 
  Activity, 
  MessageSquare, 
  Clock,
  TrendingUp,
  FileText,
  ArrowLeft,
  Plus,
  Search,
  X,
  AlertTriangle,
  Calendar,
  Mail,
  Phone,
  Eye,
  Edit,
  Trash2
} from 'lucide-vue-next';

const patientStore = usePatientStore();
const router = useRouter();
const isSidebarOpen = ref(false)

// Fonctions sidebar
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  if (window.innerWidth <= 1024) {
    isSidebarOpen.value = false
  }
}

const goBack = () => {
  router.push({ name: 'Service' })
}

// Fonction utilitaire pour les initiales
const getInitials = (user) => {
  if (!user?.first_name || !user?.last_name) return 'N/A';
  return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
}

let searchTimeout = null;

const alphabeticalSort = (a, b) => {
    const nameA = `${a.user?.first_name || ''} ${a.user?.last_name || ''}`.toLowerCase();
    const nameB = `${b.user?.first_name || ''} ${b.user?.last_name || ''}`.toLowerCase();
    return nameA.localeCompare(nameB);
};

const handleSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    const term = patientStore.searchTerm?.trim() || '';
    if (term.length >= 3) {
      await patientStore.searchPatients(term);
    } else if (term === '') {
      await patientStore.allPatient();
    }
  }, 400);
};

const clearSearch = async () => {
  patientStore.searchTerm = '';
  await patientStore.allPatient();
};

const filteredPatients = computed(() => {
  const patientsData = patientStore.patients?.data || [];
  const term = patientStore.searchTerm?.trim().toLowerCase() || '';

  if (!term || term.length < 3) {
    return [...patientsData].sort(alphabeticalSort);
  }

  const getScore = (patient) => {
    const fn = patient.user?.first_name?.toLowerCase() || '';
    const ln = patient.user?.last_name?.toLowerCase() || '';
    if (fn.startsWith(term) || ln.startsWith(term)) return 0;
    if (fn.includes(term) || ln.includes(term)) return 1;
    return 2;
  };

  return [...patientsData].sort((a, b) => {
    const scoreA = getScore(a);
    const scoreB = getScore(b);
    return scoreA !== scoreB ? scoreA - scoreB : alphabeticalSort(a, b);
  });
});

const confirmDelete = (id) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce dossier patient ? Cette action est irréversible.')) {
    // Appel à ta méthode de suppression dans le store
    console.log('Suppression du patient:', id);
  }
};

onMounted(async () => {
  if (patientStore.searchTerm && patientStore.searchTerm.length >= 3) {
    await patientStore.searchPatients(patientStore.searchTerm);
  } else {
    await patientStore.allPatient();
  }
});

const openAddPatient = () => {
  router.push({ name: 'AddUserPatient' })
}
</script>

<style scoped>
/* Layout Container */
.admin-page-container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  overflow: hidden;
  position: relative;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
}

.admin-layout {
  display: flex;
  height: 100%;
  position: relative;
}

/* Animation de fond */
.admin-page-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at top, rgba(37, 99, 235, 0.15) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.admin-layout > * {
  position: relative;
  z-index: 1;
}

/* === Sidebar === */
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  color: white;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  flex-shrink: 0;
}

.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(37, 99, 235, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.sidebar-header {
  padding: 2rem 1.5rem;
  font-size: 1.8rem;
  font-weight: 900;
  background: linear-gradient(135deg, #2563eb, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  position: relative;
  z-index: 2;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2563eb, #10b981);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.logo-text {
  font-size: 1.8rem;
  font-weight: 900;
  background: linear-gradient(135deg, #2563eb, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-text span {
  background: linear-gradient(135deg, #2563eb, #10b981);
  color: white;
  font-size: 0.6rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
  margin-left: 8px;
}

.menu {
  flex: 1;
  padding: 1.5rem 1rem;
  position: relative;
  z-index: 2;
  overflow-y: auto;
}

.menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  color: rgba(255, 255, 255, 0.7);
  padding: 14px 18px;
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-weight: 600;
  position: relative;
  overflow: hidden;
}

.menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.2), transparent);
  transition: left 0.5s ease;
}

.menu-item:hover::before {
  left: 100%;
}

.menu-item:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

.menu-item.active {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.3), rgba(16, 185, 129, 0.2));
  color: white;
  transform: translateX(5px);
}

.menu-item.active .menu-icon {
  color: #3b82f6;
}

.menu-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: inherit;
  transition: all 0.3s ease;
}

.menu-divider {
  padding: 0.5rem 1.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 1rem 0;
}

/* Mobile Toggle */
.mobile-toggle {
  display: none;
  position: fixed;
  top: 15px;
  right: 15px;
  z-index: 1100;
  background: #0f1e46;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-toggle:hover {
  background: #1e2b5c;
  transform: translateY(-2px);
}

/* Main Content */
.admin-main {
  flex: 1;
  height: 100vh;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
}

.dashboard-admin {
  font-family: 'Inter', sans-serif;
  padding: 2rem;
  margin: 0;
  width: 100%;
  min-height: 100%;
  background: transparent;
  color: white;
  box-sizing: border-box;
  position: relative;
  overflow-x: hidden;
}

/* Sidebar Overlay */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
  display: none;
}

@media (max-width: 1024px) {
  .sidebar-overlay {
    display: block;
  }
}

/* === Header === */
.dashboard-header {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.dashboard-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2563eb, #10b981);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
  z-index: 1;
}

.dashboard-header:hover::before {
  transform: scaleX(1);
}

.dashboard-header:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(37, 99, 235, 0.3);
  transform: translateY(-2px);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  position: relative;
  z-index: 2;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.title-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.dashboard-title {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dashboard-subtitle {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
  flex-wrap: wrap;
  align-self: flex-start;
  margin-top: 0.5rem;
}

.title-icon {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  padding: 12px;
  border-radius: 14px;
  box-shadow: var(--shadow-lg);
  animation: pulse 2s infinite;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

/* === Back Button === */
.title-with-back {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(37, 99, 235, 0.4);
  transform: translateY(-2px);
}

.back-btn svg {
  transition: transform 0.3s ease;
}

.back-btn:hover svg {
  transform: translateX(-2px);
}

/* === States === */
.state-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  font-weight: 500;
  font-size: 0.9rem;
}

.state-message.loading {
  background: rgba(37, 99, 235, 0.1);
  color: rgba(37, 99, 235, 0.9);
  border: 1px solid rgba(37, 99, 235, 0.2);
}

.state-message.error {
  background: rgba(239, 68, 68, 0.1);
  color: rgba(239, 68, 68, 0.9);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* === Search Section === */
.search-section {
  margin-bottom: 2rem;
}

.search-bar-wrapper {
  position: relative;
  max-width: 600px;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: rgba(255, 255, 255, 0.5);
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-input:focus {
  outline: none;
  border-color: rgba(37, 99, 235, 0.5);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.btn-clear-search {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.btn-clear-search:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

/* === Table Section === */
.table-section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
}

.table-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
  z-index: 1;
}

.table-section:hover::before {
  transform: scaleX(1);
}

.table-container {
  overflow-x: auto;
}

.patients-table {
  width: 100%;
  border-collapse: collapse;
}

.patients-table th {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 700;
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  letter-spacing: 0.05em;
}

.patients-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
}

.patients-table tbody tr {
  transition: all 0.3s ease;
}

.patients-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.03);
}

/* === Patient Cell === */
.patient-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.patient-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  font-size: 0.875rem;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  flex-shrink: 0;
}

.patient-info {
  flex: 1;
  min-width: 0;
}

.patient-name {
  font-weight: 600;
  color: white;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.patient-id {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Monaco', 'Menlo', monospace;
}

/* === Date Cell === */
.date-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.date-icon {
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}

/* === Contact Cell === */
.contact-cell {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
}

.contact-icon {
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}

/* === Status Badge === */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid;
}

.status-badge.active {
  background: rgba(16, 185, 129, 0.1);
  color: rgba(16, 185, 129, 0.9);
  border-color: rgba(16, 185, 129, 0.3);
}

.status-badge.inactive {
  background: rgba(239, 68, 68, 0.1);
  color: rgba(239, 68, 68, 0.9);
  border-color: rgba(239, 68, 68, 0.3);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* === Action Buttons === */
.text-right {
  text-align: right !important;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.action-btn-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.action-btn-icon:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.action-btn-icon.view:hover {
  background: rgba(37, 99, 235, 0.3);
  color: #3b82f6;
}

.action-btn-icon.edit:hover {
  background: rgba(245, 158, 11, 0.3);
  color: #f59e0b;
}

.action-btn-icon.delete:hover {
  background: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

/* === Empty State === */
.no-data {
  padding: 4rem 2rem !important;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  color: rgba(255, 255, 255, 0.6);
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.empty-state p {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  max-width: 400px;
}

/* === Action Buttons === */
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 140px;
  min-height: 44px;
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.action-btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* === Responsive Design === */
@media (max-width: 1024px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    transform: translateX(-100%);
    z-index: 1000;
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
  
  .mobile-toggle {
    display: block;
  }
}

@media (max-width: 768px) {
  .dashboard-admin {
    padding: 1rem;
  }
  
  .dashboard-header {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .title-section {
    flex-direction: column;
    text-align: center;
  }
  
  .dashboard-title {
    font-size: 1.4rem;
  }
  
  .search-bar-wrapper {
    max-width: 100%;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .patients-table {
    min-width: 600px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .action-btn-icon {
    width: 32px;
    height: 32px;
  }
}

/* === Variables === */
:root {
  --primary: #2563eb;
  --secondary: #10b981;
  --light: #f8fafc;
  --dark: #0f172a;
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
</style>