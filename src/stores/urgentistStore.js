// // @/stores/urgentistStore.js

// import { defineStore } from 'pinia'
// import {
//   apiGetActiveSosAlerts,
//   apiGetSosAlertDetails,
//   apiTakeChargeOfAlert,
//   apiResolveAlert,
//   apiSendMessageToPatient,
//   apiCreateEmergencyPhysician,
//   apiSearchEmergencyPhysicians,
//   apiGetAllEmergencyPhysicians,
//   apiGetEmergencyPhysician,
//   apiDeleteEmergencyPhysician,
//   apiUpdateEmergencyPhysician,
//   apiGetHistorySosAlerts,
//   // 📊 IMPORT POUR LES STATS
//   apiGetAlertsStatsByStatus 
// } from '@/services/apiUrgentist'
// import API from '@/services/axios' 

// export const useUrgentistStore = defineStore('urgentist', {
//   state: () => ({
//     // 👨‍⚕️ Urgentistes
//     urgentists: [],
//     currentUrgentist: null,

//     // 🚨 Alertes SOS
//     activeAlerts: [], // LISTE 1 : Pour le TABLEAU (en attente + in_progress)
    
//     // 📊 ÉTAT POUR LES STATISTIQUES
//     alertsStats: {}, 
    
//     alertDetails: null,
//     currentAlertId: null,

//     // 🔑 ÉTATS POUR L'HISTORIQUE
//     alertsHistory: [], // Contient alertes 'traite' et 'annule'
//     loadingHistory: false, 
//     historyError: null,    

//     // ⚙️ États généraux
//     loading: false, 
//     error: null,
//     success: null,
//   }),
  
//   getters: {
//     // 🧮 Obtenir un aperçu des alertes pour les cards de stats
//     statsOverview: (state) => {
//         // Retourne les statistiques sous un format facile à utiliser dans les composants
//         return {
//             total: state.alertsStats.total_alerts || 0,
//             pending: state.alertsStats.en_attente || 0,
//             inProgress: state.alertsStats.in_progress || 0,
//             resolved: state.alertsStats.traite || 0,
//             cancelled: state.alertsStats.annule || 0,
//         };
//     },
//     // Vérifie s'il y a des alertes en cours (en attente ou in_progress)
//     hasActiveAlerts: (state) => state.activeAlerts.length > 0,
//   },

//   actions: {
//     // ⚠️ Permet d’afficher un message d’erreur depuis le composant
//     setError(message) {
//       this.error = message
//     },
    
//     // 🧹 Réinitialiser feedback
//     resetFeedback() {
//       this.error = null
//       this.success = null
//     },

//     // 🔄 Utilitaire générique pour gérer les appels API
//     async handleAction(actionFn, onSuccess = null) {
//       this.loading = true
//       this.error = null
//       this.success = null
//       try {
//         const response = await actionFn()
//         if (onSuccess) onSuccess(response)
//         return response;
//       } catch (error) {
//         this.error = error.message; 
//         // 🚀 On rejette l'erreur pour la gestion côté composant (try/catch)
//         throw error
//       } finally {
//         this.loading = false
//       }
//     },
    
//     // 🚨 Alertes SOS (côté urgentiste)

//     // 📊 ACTION CORRIGÉE : Récupère les statistiques d'alerte par statut
//     async fetchAlertsStats() {
//         this.error = null;
//         try {
//             console.log('--- STORE LOG : fetchAlertsStats démarré (Appel API CORRECT) ---');
//             // ⭐ Appel de la fonction API correcte pour les stats
//             const res = await apiGetAlertsStatsByStatus(); 
//             this.alertsStats = res.data.stats || {}; 
//             console.log('--- STORE LOG : Alerts Stats assignées :', this.alertsStats);
            
//             return this.alertsStats;
//         } catch (error) {
//             this.error = error.message || 'Échec du chargement des statistiques d\'alerte.';
//             this.alertsStats = {};
//             console.error('Erreur dans fetchAlertsStats', error);
//             throw error;
//         }
//     },

//     // ⭐ ACTION 1 : Récupère les alertes EN COURS pour le tableau (en attente + in_progress)
//     async fetchActiveAlerts() {
//         this.error = null;
//         try {
//             console.log('--- STORE LOG : fetchActiveAlerts démarré (API Active) ---');
//             const res = await apiGetActiveSosAlerts();
            
//             // Statuts de l'API : 'en attente' et 'in_progress'
//             const ACTIVE_STATUSES = ['en attente', 'in_progress'];

//             this.activeAlerts = res.data.filter(a => ACTIVE_STATUSES.includes(a.status)) || [];
            
//             console.log(`--- STORE LOG : activeAlerts assignées : ${this.activeAlerts.length} éléments ---`);
//         } catch (err) {
//             this.error = err.message || 'Échec du chargement des alertes actives.';
//             this.activeAlerts = [];
//             console.error(this.error, err);
//         }
//     },
    
//     // 🔑 ACTION POUR L'HISTORIQUE (alertes 'traite' et 'annule')
//     async fetchAlertsHistory() {
//         this.loadingHistory = true; 
//         this.historyError = null;
//         this.alertsHistory = [];
        
//         try {
//             const res = await apiGetHistorySosAlerts(); 
            
//             const RESOLVED_STATUSES = ['traite', 'annule'];
//             this.alertsHistory = res.data.filter(a => RESOLVED_STATUSES.includes(a.status));
            
//             return this.alertsHistory;
//         } catch (error) {
//             this.historyError = error.message || 'Échec du chargement de l\'historique';
//             console.error('Erreur dans fetchAlertsHistory', error);
//         } finally {
//             this.loadingHistory = false;
//         }
//     },

//     // ACTION 2 : Récupère les détails d'une alerte
//     fetchAlertDetails(alertId) {
//       const id = parseInt(alertId);
      
//       if (isNaN(id) || id <= 0) {
//           this.error = "ID d'alerte invalide fourni.";
//           console.error("Erreur STORE: Tentative de fetchAlertDetails avec ID invalide:", alertId);
//           return Promise.reject(new Error(this.error));
//       }

//       return this.handleAction(async () => {
//         // L'API attend une chaîne (string) pour l'ID dans l'URL
//         const res = await apiGetSosAlertDetails(String(id)); 
//         this.alertDetails = res.data
//       }, () => {
//           this.success = 'Détails de l\'alerte chargés avec succès.'
//       })
//     },
    
//     // ACTION 3 : Prendre en charge une alerte
//     takeChargeOfAlert(alertId) {
//       return this.handleAction(async () => {
//         const res = await apiTakeChargeOfAlert(alertId);
//         // Mettre à jour la liste des alertes actives après la prise en charge
//         await this.fetchActiveAlerts();
//         return res;
//       }, () => {
//           this.success = 'Alerte prise en charge avec succès. Vous êtes en route.'
//       })
//     },
    
//     // ACTION 4 : Résoudre une alerte
//     resolveAlert(alertId) {
//       return this.handleAction(async () => {
//         const res = await apiResolveAlert(alertId);
//         // Mettre à jour la liste des alertes actives et l'historique/stats
//         await this.fetchActiveAlerts();
//         await this.fetchAlertsStats();
//         return res;
//       }, () => {
//           this.success = 'Alerte résolue et marquée comme traitée.'
//       })
//     },

//     // ACTION 5 : Envoyer un message au patient
//     sendMessageToPatient(alertId, message) {
//       return this.handleAction(async () => {
//         const res = await apiSendMessageToPatient(alertId, { message });
//         return res;
//       }, () => {
//           this.success = 'Message envoyé au patient avec succès.'
//       })
//     },
    
//     // 👨‍⚕️ CRUD des Urgentistes

//     // CRUD 1: Créer
//     createUrgentist(urgentistData) {
//       return this.handleAction(async () => {
//         const res = await apiCreateEmergencyPhysician(urgentistData);
//         // Optionnel: Mettre à jour la liste après création
//         // await this.fetchAllUrgentists();
//         return res;
//       }, () => {
//         this.success = 'Urgentiste créé avec succès.';
//       });
//     },

//     // CRUD 2: Lire (tous)
//     fetchAllUrgentists() {
//       return this.handleAction(async () => {
//         const res = await apiGetAllEmergencyPhysicians();
//         this.urgentists = res.data;
//       });
//     },
    
//     // CRUD 3: Lire (un seul)
//     fetchUrgentist(urgentistId) {
//       return this.handleAction(async () => {
//         const res = await apiGetEmergencyPhysician(urgentistId);
//         this.currentUrgentist = res.data;
//       });
//     },

//     // CRUD 4: Mettre à jour
//     updateUrgentist(urgentistId, urgentistData) {
//       return this.handleAction(async () => {
//         const res = await apiUpdateEmergencyPhysician(urgentistId, urgentistData);
//         // Optionnel: Mettre à jour l'urgentiste courant
//         this.currentUrgentist = res.data;
//         return res;
//       }, () => {
//         this.success = 'Informations de l\'urgentiste mises à jour avec succès.';
//       });
//     },

//     // CRUD 5: Supprimer
//     deleteUrgentist(urgentistId) {
//       return this.handleAction(async () => {
//         const res = await apiDeleteEmergencyPhysician(urgentistId);
//         // Retirer de la liste locale
//         this.urgentists = this.urgentists.filter(u => u.id !== urgentistId);
//         return res;
//       }, () => {
//         this.success = 'Urgentiste supprimé avec succès.';
//       });
//     },
    
//     // 🔍 Recherche d'Urgentistes
//     searchUrgentists(query) {
//       return this.handleAction(async () => {
//         const res = await apiSearchEmergencyPhysicians(query);
//         this.urgentists = res.data;
//       });
//     }

//   }
// })
import { defineStore } from 'pinia'
import {
  apiGetActiveSosAlerts,
  apiGetSosAlertDetails,
  apiTakeChargeOfAlert,
  apiResolveAlert,
  apiSendMessageToPatient,
  apiCreateEmergencyPhysician,
  apiSearchEmergencyPhysicians,
  apiGetAllEmergencyPhysicians,
  apiGetEmergencyPhysician,
  apiDeleteEmergencyPhysician,
  apiUpdateEmergencyPhysician,
  apiGetHistorySosAlerts,
  // 📊 IMPORT POUR LES STATS
  apiGetAlertsStatsByStatus 
} from '@/services/apiUrgentist'
import API from '@/services/axios' 

export const useUrgentistStore = defineStore('urgentist', {
  state: () => ({
    // 👨‍⚕️ Urgentistes
    allUrgentists: [], // 💡 RENOMMÉ pour correspondre à votre template `urgentistStore.allUrgentists`
    currentUrgentist: null,

    // 🚨 Alertes SOS
    activeAlerts: [], // LISTE 1 : Pour le TABLEAU (en attente + in_progress)
    
    // 📊 ÉTAT POUR LES STATISTIQUES
    alertsStats: {}, 
    
    alertDetails: null,
    currentAlertId: null,

    // 🔑 ÉTATS POUR L'HISTORIQUE
    alertsHistory: [], // Contient alertes 'traite' et 'annule'
    loadingHistory: false, 
    historyError: null,    

    // ⚙️ États généraux
    loading: false, 
    error: null,
    success: null,
  }),
  
  getters: {
    // 🧮 Obtenir un aperçu des alertes pour les cards de stats
    statsOverview: (state) => {
        // Retourne les statistiques sous un format facile à utiliser dans les composants
        return {
            total: state.alertsStats.total_alerts || 0,
            pending: state.alertsStats.en_attente || 0,
            inProgress: state.alertsStats.in_progress || 0,
            resolved: state.alertsStats.traite || 0,
            cancelled: state.alertsStats.annule || 0,
        };
    },
    // Vérifie s'il y a des alertes en cours (en attente ou in_progress)
    hasActiveAlerts: (state) => state.activeAlerts.length > 0,
  },

  actions: {
    // ⚠️ Permet d’afficher un message d’erreur depuis le composant
    setError(message) {
      this.error = message
    },
    
    // 🧹 Réinitialiser feedback
    resetFeedback() {
      this.error = null
      this.success = null
    },

    // 🔄 Utilitaire générique pour gérer les appels API
    async handleAction(actionFn, onSuccess = null) {
      this.loading = true
      this.error = null
      this.success = null
      try {
        const response = await actionFn()
        if (onSuccess) onSuccess(response)
        return response;
      } catch (error) {
        // Utiliser response.data.message si l'API retourne un JSON d'erreur structuré
        const errorMessage = error.response?.data?.message || error.message || 'Erreur inconnue.';
        this.error = errorMessage;
        // 🚀 On rejette l'erreur pour la gestion côté composant (try/catch)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 🚨 Alertes SOS (côté urgentiste)

    // 📊 ACTION CORRIGÉE : Récupère les statistiques d'alerte par statut
    async fetchAlertsStats() {
        this.error = null;
        try {
            const res = await apiGetAlertsStatsByStatus(); 
            this.alertsStats = res.data.stats || {}; 
            return this.alertsStats;
        } catch (error) {
            this.error = error.message || 'Échec du chargement des statistiques d\'alerte.';
            this.alertsStats = {};
            console.error('Erreur dans fetchAlertsStats', error);
            throw error;
        }
    },

    // ⭐ ACTION 1 : Récupère les alertes EN COURS pour le tableau (en attente + in_progress)
    async fetchActiveAlerts() {
        this.error = null;
        try {
            const res = await apiGetActiveSosAlerts();
            
            const ACTIVE_STATUSES = ['en attente', 'in_progress'];

            this.activeAlerts = res.data.filter(a => ACTIVE_STATUSES.includes(a.status)) || [];
        } catch (err) {
            this.error = err.message || 'Échec du chargement des alertes actives.';
            this.activeAlerts = [];
            console.error(this.error, err);
        }
    },
    
    // 🔑 ACTION POUR L'HISTORIQUE (alertes 'traite' et 'annule')
    async fetchAlertsHistory() {
        this.loadingHistory = true; 
        this.historyError = null;
        this.alertsHistory = [];
        
        try {
            const res = await apiGetHistorySosAlerts(); 
            
            const RESOLVED_STATUSES = ['traite', 'annule'];
            this.alertsHistory = res.data.filter(a => RESOLVED_STATUSES.includes(a.status));
            
            return this.alertsHistory;
        } catch (error) {
            this.historyError = error.message || 'Échec du chargement de l\'historique';
            console.error('Erreur dans fetchAlertsHistory', error);
        } finally {
            this.loadingHistory = false;
        }
    },

    // ACTION 2 : Récupère les détails d'une alerte
    fetchAlertDetails(alertId) {
      const id = parseInt(alertId);
      
      if (isNaN(id) || id <= 0) {
          this.error = "ID d'alerte invalide fourni.";
          console.error("Erreur STORE: Tentative de fetchAlertDetails avec ID invalide:", alertId);
          return Promise.reject(new Error(this.error));
      }

      return this.handleAction(async () => {
        // L'API attend une chaîne (string) pour l'ID dans l'URL
        const res = await apiGetSosAlertDetails(String(id)); 
        this.alertDetails = res.data
      }, () => {
          this.success = 'Détails de l\'alerte chargés avec succès.'
      })
    },
    
    // ACTION 3 : Prendre en charge une alerte
    takeChargeOfAlert(alertId) {
      return this.handleAction(async () => {
        const res = await apiTakeChargeOfAlert(alertId);
        // Mettre à jour la liste des alertes actives après la prise en charge
        await this.fetchActiveAlerts();
        return res;
      }, () => {
          this.success = 'Alerte prise en charge avec succès. Vous êtes en route.'
      })
    },
    
    // ACTION 4 : Résoudre une alerte
    resolveAlert(alertId) {
      return this.handleAction(async () => {
        const res = await apiResolveAlert(alertId);
        // Mettre à jour la liste des alertes actives et l'historique/stats
        await this.fetchActiveAlerts();
        await this.fetchAlertsStats();
        return res;
      }, () => {
          this.success = 'Alerte résolue et marquée comme traitée.'
      })
    },

    // ACTION 5 : Envoyer un message au patient
    sendMessageToPatient(alertId, message) {
      return this.handleAction(async () => {
        const res = await apiSendMessageToPatient(alertId, { message });
        return res;
      }, () => {
          this.success = 'Message envoyé au patient avec succès.'
      })
    },
    
    // 👨‍⚕️ CRUD des Urgentistes

    // CRUD 1: Créer
    createUrgentist(urgentistData) {
      return this.handleAction(async () => {
        const res = await apiCreateEmergencyPhysician(urgentistData);
        return res;
      }, () => {
        this.success = 'Urgentiste créé avec succès.';
      });
    },

    // CRUD 2: Lire (tous)
    async fetchAllUrgentists() {
      // ⚠️ Correction pour gérer la pagination Laravel
      return this.handleAction(async () => {
        const res = await apiGetAllEmergencyPhysicians();
        
        // 🔑 Récupérer le tableau réel de données (Laravel met les données dans res.data.data)
        if (res.data && res.data.data) {
            this.allUrgentists = res.data.data;
        } else {
            this.allUrgentists = [];
            console.warn("Réponse paginée de l'API urgente sans clé 'data'.");
        }
      });
    },
    
    // CRUD 3: Lire (un seul)
    fetchUrgentist(urgentistId) {
      return this.handleAction(async () => {
        const res = await apiGetEmergencyPhysician(urgentistId);
        this.currentUrgentist = res.data;
      });
    },

    // CRUD 4: Mettre à jour
    updateUrgentist(urgentistId, urgentistData) {
      return this.handleAction(async () => {
        const res = await apiUpdateEmergencyPhysician(urgentistId, urgentistData);
        // Optionnel: Mettre à jour l'urgentiste courant
        this.currentUrgentist = res.data;
        return res;
      }, () => {
        this.success = 'Informations de l\'urgentiste mises à jour avec succès.';
      });
    },

    // CRUD 5: Supprimer
    deleteUrgentist(urgentistId) {
      return this.handleAction(async () => {
        const res = await apiDeleteEmergencyPhysician(urgentistId);
        // Retirer de la liste locale
        this.allUrgentists = this.allUrgentists.filter(u => u.id !== urgentistId);
        return res;
      }, () => {
        this.success = 'Urgentiste supprimé avec succès.';
      });
    },
    
    // 🔍 Recherche d'Urgentistes
    searchUrgentists(query) {
      return this.handleAction(async () => {
        const res = await apiSearchEmergencyPhysicians(query);
        
        // Gérer la pagination si la recherche est paginée
        if (res.data && res.data.data) {
             this.allUrgentists = res.data.data;
        } else {
             this.allUrgentists = res.data; // Si la recherche n'est pas paginée
        }
      });
    }

  }
})