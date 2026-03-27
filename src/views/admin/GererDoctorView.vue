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
                <button @click="router.back()" class="btn-back" title="Retour">
                  <ArrowLeft :size="20" />
                </button>
                <div class="title-content">
                  <h1 class="dashboard-title">
                    <span class="title-icon">
                      <Stethoscope :size="24" />
                    </span>
                    Médecins enregistrés
                  </h1>
                  <p class="dashboard-subtitle">
                    Gestion des praticiens médicaux de l'hôpital SanTeKo
                    <span class="count-badge" v-if="paginationMeta.total">{{ paginationMeta.total }} au total</span>
                  </p>
                </div>
              </div>
              <div class="header-actions">
                <button class="action-btn primary" @click="openAddForm">
                  <Plus :size="16" />
                  Ajouter un médecin
                </button>
                <button class="refresh-btn" @click="refreshData">
                  <RotateCcw :size="16" />
                  Actualiser
                </button>
              </div>
            </div>
          </header>

          <!-- Loading State -->
          <div v-if="doctorStore.loading" class="loading-state">
            <div class="spinner"></div>
            <p>Récupération de la liste des praticiens...</p>
          </div>
          
          <!-- Error State -->
          <div v-else-if="doctorStore.error" class="error-state">
            <div class="error-icon">
              <AlertTriangle :size="48" />
            </div>
            <p>Erreur de chargement: <strong>{{ doctorStore.error }}</strong></p>
          </div>
          
          <!-- Empty State -->
          <div v-else-if="!doctorsList.length" class="empty-state">
            <div class="empty-icon">
              <Users :size="48" />
            </div>
            <h5>Aucun médecin trouvé</h5>
            <p>Commencez par ajouter un médecin à votre système</p>
            <button class="action-btn primary" @click="openAddForm">
              <Plus :size="16" />
              Ajouter un médecin
            </button>
          </div>

          <!-- Doctors Table -->
          <div class="table-section" v-else>
            <div class="section-header">
              <h4 class="table-header">
                Liste des médecins
                <span class="badge-count">{{ paginationMeta.total }}</span>
              </h4>
              <div class="section-actions">
                <button class="action-btn primary" @click="openAddForm">
                  <Plus :size="16" />
                  Ajouter
                </button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="doctor-table">
                <thead>
                  <tr>
                    <th>Médecin</th>
                    <th>Spécialité</th>
                    <th>Département</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(doctor) in doctorsList" :key="doctor.id" class="doctor-row">
                    <td>
                      <div class="user-info">
                        <div class="user-avatar">
                          {{ doctor.user?.first_name?.[0] }}{{ doctor.user?.last_name?.[0] }}
                        </div>
                        <div class="user-details">
                          <span class="user-name">{{ doctor.user?.first_name }} {{ doctor.user?.last_name }}</span>
                          <span class="user-id">ID: #{{ doctor.id }}</span>
                        </div>
                      </div>
                    </td>
                    <td><span class="speciality-tag">{{ doctor.speciality }}</span></td>
                    <td><span class="dept-name">{{ doctor.department?.name || '—' }}</span></td>
                    <td>
                      <span class="contact-info">
                        <Phone :size="14" />
                        {{ doctor.user?.phone || '—' }}
                      </span>
                    </td>
                    <td>
                      <span :class="['status-pill', doctor.status === 'active' ? 'active' : 'inactive']">
                        {{ doctor.status === 'active' ? 'En service' : 'Inactif' }}
                      </span>
                    </td>
                    <td class="text-right">
                      <div class="action-buttons">
                        <RouterLink :to="{ name: 'EditDoctor', params: { id: doctor.id } }" class="action-btn edit">
                          <Edit :size="18" />
                        </RouterLink>
                        <button class="action-btn delete" @click="confirmDelete(doctor.id)">
                          <Trash2 :size="18" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <footer class="table-footer" v-if="paginationMeta.total > 0">
              <p>Page <strong>{{ paginationMeta.current_page }}</strong> sur {{ paginationMeta.last_page }}</p>
            </footer>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'; 
import { useRouter, RouterLink } from 'vue-router'
import { useDoctorStore } from '@/stores/doctorStore'
import { 
  BarChart3, 
  Users, 
  Activity, 
  MessageSquare, 
  Clock,
  TrendingUp,
  FileText,
  Stethoscope,
  RotateCcw,
  AlertTriangle,
  Plus,
  Phone,
  Edit,
  Trash2,
  ArrowLeft
} from 'lucide-vue-next'

const doctorStore = useDoctorStore();
const router = useRouter()
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

const refreshData = () => {
  doctorStore.fetchAllDoctors()
}

const doctorsList = computed(() => {
    // Gérer différents formats de données possibles
    if (doctorStore.doctors) {
        // Si c'est un objet paginé (Laravel)
        if (doctorStore.doctors.data && Array.isArray(doctorStore.doctors.data)) {
            return doctorStore.doctors.data
        }
        // Si c'est directement un tableau
        if (Array.isArray(doctorStore.doctors)) {
            return doctorStore.doctors
        }
        // Si c'est un objet avec une propriété data qui est un tableau
        if (doctorStore.doctors.data && Array.isArray(doctorStore.doctors.data)) {
            return doctorStore.doctors.data
        }
    }
    return []
})

const paginationMeta = computed(() => {
    // Gérer différents formats de pagination possibles
    if (doctorStore.doctors) {
        if (doctorStore.doctors.current_page !== undefined) {
            // Format paginé Laravel
            return {
                current_page: doctorStore.doctors.current_page || 1,
                last_page: doctorStore.doctors.last_page || 1,
                total: doctorStore.doctors.total || 0,
            }
        } else if (Array.isArray(doctorStore.doctors)) {
            // Format tableau simple
            return {
                current_page: 1,
                last_page: 1,
                total: doctorStore.doctors.length,
            }
        }
    }
    // Valeurs par défaut
    return {
        current_page: 1,
        last_page: 1,
        total: 0,
    }
})

const openAddForm = () => {
  router.push({ name: 'AddUserDoctor' })
}

const confirmDelete = async (id) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer le docteur ${id} ?`)) {
    try {
      await doctorStore.deleteDoctor(id);
      alert('Docteur supprimé avec succès !');
    } catch (error) {
      alert(`Erreur de suppression : ${doctorStore.error}`);
    }
  }
}

onMounted(() => {
  doctorStore.fetchAllDoctors();
})
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

/* Animation de fond (identique au DoctorDashboard) */
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

/* === Sidebar (style MedecinLayout exact) === */
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
  font-size: 1.8rem;
  font-weight: 900;
  background: linear-gradient(135deg, #2563eb, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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

/* Mobile Toggle (style MedecinLayout exact) */
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

/* Main Content (style MedecinLayout exact) */
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

/* Sidebar Overlay (style MedecinLayout exact) */
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

/* === Header (style DemandeAnalyse) === */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.6s ease-out;
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
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(16, 185, 129, 0.1));
  border-color: rgba(37, 99, 235, 0.3);
  transform: translateY(-2px);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  width: 100%;
  flex-wrap: wrap;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
  max-width: 70%;
}

.btn-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-2px);
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
  background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 0.75rem;
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

.dashboard-subtitle {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 100%;
}

.count-badge {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: 1rem;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.refresh-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
}

/* === States === */
.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: var(--light);
  opacity: 0.8;
}

.empty-icon, .error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.6;
  color: white;
}

.empty-state h5 {
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
}

.empty-state p, .error-state p {
  color: var(--light);
  font-size: 0.9rem;
  margin: 0 0 1.5rem 0;
  opacity: 0.8;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1e3a8a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* === Table Section === */
.table-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.table-section::before {
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

.table-section:hover::before {
  transform: scaleX(1);
}

.table-section:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(16, 185, 129, 0.15));
  border-color: rgba(37, 99, 235, 0.4);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.table-header {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge-count {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

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
  min-width: 160px;
  min-height: 44px;
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
}

.action-btn.edit {
  background: rgba(59, 130, 246, 0.3);
  color: #93c5fd !important;
  border: 1px solid rgba(59, 130, 246, 0.4);
  padding: 0.5rem;
  min-width: 36px;
  min-height: 36px;
}

.action-btn.edit:hover {
  background: rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.action-btn.delete {
  background: rgba(239, 68, 68, 0.3);
  color: #fca5a5 !important;
  border: 1px solid rgba(239, 68, 68, 0.4);
  padding: 0.5rem;
  min-width: 36px;
  min-height: 36px;
}

.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* === Table Styles === */
.table-responsive {
  overflow-x: auto;
}

.doctor-table {
  width: 100%;
  border-collapse: collapse;
}

.doctor-table th {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  font-weight: 600;
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.doctor-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #f8fafc;
}

.doctor-row:hover {
  background: rgba(255, 255, 255, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  font-weight: 600;
  color: #ffffff !important;
}

.user-id {
  font-size: 0.8rem;
  color: #cbd5e1 !important;
}

.speciality-tag {
  background: rgba(37, 99, 235, 0.3);
  color: #93c5fd;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid rgba(37, 99, 235, 0.4);
}

.dept-name {
  color: #e2e8f0;
}

.contact-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #e2e8f0;
}

.status-pill {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-pill.active {
  background: rgba(16, 185, 129, 0.3);
  color: #86efac;
  border: 1px solid rgba(16, 185, 129, 0.4);
}

.status-pill.inactive {
  background: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.table-footer {
  padding: 1.5rem;
  text-align: center;
  color: #cbd5e1;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0 0 16px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.table-footer p {
  margin: 0;
  font-weight: 500;
}

.table-footer strong {
  color: #ffffff;
  font-weight: 700;
}

.text-right {
  text-align: right;
}

/* === Responsive Design === */
@media (max-width: 1024px) {
  .mobile-toggle { 
    display: flex; 
    align-items: center; 
    justify-content: center; 
  }
  .sidebar {
    position: fixed;
    transform: translateX(-100%);
    height: 100vh;
  }
  .sidebar.open { 
    transform: translateX(0); 
  }
  .sidebar-overlay { 
    position: fixed; 
    inset: 0; 
    background: rgba(0,0,0,0.5); 
    z-index: 999; 
  }
  .dashboard-admin { 
    padding: 20px; 
    padding-top: 70px; 
  }
}

@media (max-width: 768px) {
  .dashboard-admin {
    padding: 1rem;
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .title-section {
    width: 100%;
    max-width: 100%;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .dashboard-title {
    font-size: 1.4rem;
  }
  
  .dashboard-subtitle {
    font-size: 0.75rem;
  }
  
  .table-responsive {
    font-size: 0.85rem;
  }
  
  .doctor-table th,
  .doctor-table td {
    padding: 0.75rem 0.5rem;
  }
}

.count-badge {
  font-size: 12px;
  background: #e2e8f0;
  color: #475569;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
}

/* Bouton Ajouter */
.btn-add {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

/* Table Card */
.table-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.doctor-table {
  width: 100%;
  border-collapse: collapse;
}

.doctor-table th {
  background-color: #f8fafc;
  padding: 16px 24px;
  text-align: left;
  font-size: 13px;
  text-transform: uppercase;
  color: #64748b;
  border-bottom: 1px solid #f1f5f9;
}

.doctor-table td {
  padding: 16px 24px;
  border-bottom: 1px solid #f1f5f9;
}

/* Éléments visuels (Avatar, Pills, Tags) */
.user-info { display: flex; align-items: center; gap: 12px; }
.user-avatar {
  width: 40px; height: 40px; background: #eff6ff; color: #3b82f6;
  border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700;
}
.user-name { font-weight: 700; color: #1e293b; font-size: 14px; display: block; }
.speciality-tag { background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 13px; }
.status-pill { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
.status-pill.active { background: #dcfce7; color: #16a34a; }
.status-pill.inactive { background: #f1f5f9; color: #64748b; }

.action-buttons { display: flex; justify-content: flex-end; gap: 8px; }
.action-btn {
  width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
  background: white; border: 1px solid #f1f5f9; cursor: pointer; text-decoration: none;
}

/* =========================================
   RESPONSIVE : TABLEAU -> CARTES
   ========================================= */

@media (max-width: 768px) {
  .doctor-management { padding: 15px; padding-bottom: 80px; }

  /* Le bouton ajouter devient flottant (FAB) */
  .btn-label { display: none; }
  .btn-add {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    justify-content: center;
    font-size: 24px;
    box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.4);
    z-index: 99;
  }

  /* Transformation du tableau */
  .doctor-table thead { display: none; }
  .doctor-table tr {
    display: block;
    background: white;
    margin-bottom: 15px;
    border: 1px solid #f1f5f9;
    border-radius: 16px;
    padding: 15px;
  }

  .doctor-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f8fafc;
  }

  .doctor-table td:first-child {
    display: block;
    border-bottom: 2px solid #f1f5f9;
    padding-bottom: 15px;
    margin-bottom: 5px;
  }

  /* Ajout des labels mobiles */
  .doctor-table td:nth-child(2)::before { content: "Spécialité"; font-weight: 600; color: #94a3b8; font-size: 12px; }
  .doctor-table td:nth-child(3)::before { content: "Département"; font-weight: 600; color: #94a3b8; font-size: 12px; }
  .doctor-table td:nth-child(4)::before { content: "Contact"; font-weight: 600; color: #94a3b8; font-size: 12px; }
  .doctor-table td:nth-child(5)::before { content: "Statut"; font-weight: 600; color: #94a3b8; font-size: 12px; }

  .action-buttons { width: 100%; justify-content: center; gap: 20px; padding-top: 10px; }
}
</style>