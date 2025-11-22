import { defineStore } from "pinia";
import { 
    apiGetSosAlertDetails, 
    apiGetActiveSosAlerts,
    apiTakeChargeAlert,
    apiResolveAlert,
    apiSendMessageToPatient,
    apiTriggerSOSAlert // 🔑 IMPORT DE LA NOUVELLE FONCTION API
} from "@/services/apiSosAlerts"; 

// 🔑 CORRECTION : Le nom du store est maintenant 'sosAlerts'
export const useSosAlertsStore = defineStore('sosAlerts', {
    state: () => ({
        // États pour la liste des alertes actives (Dashboard)
        activeAlerts: [], 
        
        // États pour l'alerte spécifique (Vue de détail)
        alertDetails: null, 
        
        // États de gestion globale
        loading: false,     
        error: null,        
        success: null,      
    }),
    
    actions: {
        /** Réinitialise les messages de feedback */
        resetFeedback() {
            this.error = null;
            this.success = null;
        },

        // =======================================================
        // ACTIONS POUR LE PATIENT (DÉCLENCHEMENT SOS)
        // =======================================================

        /** Déclenche une nouvelle alerte SOS avec les coordonnées */
        async triggerSOSAlert(latitude, longitude) {
            this.resetFeedback();
            this.loading = true;

            const payload = {
                latitude,
                longitude
            };
            
            try {
                // 🔑 APPEL À LA NOUVELLE FONCTION API POST /sos
                const response = await apiTriggerSOSAlert(payload);
                this.success = response.message || 'Alerte SOS envoyée avec succès.';
                return response;
            } catch (err) {
                this.error = err.message || 'Échec de l\'envoi de l\'alerte SOS.';
                throw err; // Relancer pour que le composant puisse gérer l'erreur
            } finally {
                this.loading = false;
            }
        },
        
        // =======================================================
        // ACTIONS POUR LA LISTE (DASHBOARD)
        // =======================================================

        /** Récupère la liste des alertes actives pour le tableau de bord */
        async fetchAllActiveAlerts() {
            this.loading = true;
            this.error = null;
            this.activeAlerts = []; 

            try {
                const data = await apiGetActiveSosAlerts();
                this.activeAlerts = data;
            } catch (err) {
                this.error = err.message || "Impossible de charger la liste des alertes actives.";
            } finally {
                this.loading = false;
            }
        },

        // =======================================================
        // ACTIONS POUR LA VUE DÉTAIL
        // =======================================================
        
        /** Récupère le détail d'une alerte spécifique */
        async fetchAlertDetails(alertId) {
            this.loading = true;
            this.error = null;
            this.alertDetails = null;

            try {
                const data = await apiGetSosAlertDetails(alertId);
                this.alertDetails = data;
            } catch (err) {
                this.error = err.message || "Impossible de charger les détails de l'alerte.";
                // Re-lancer l'erreur pour que le composant puisse afficher un message spécifique
                throw err; 
            } finally {
                this.loading = false;
            }
        },

        /** Met à jour le statut à 'Prise en charge' (in_progress) */
        async takeChargeOfAlert(alertId) {
            this.resetFeedback();
            try {
                const response = await apiTakeChargeAlert(alertId);
                this.success = response.message;
                // Mettre à jour l'état de l'alerte localement après la prise en charge réussie
                if (this.alertDetails && this.alertDetails.id === alertId) {
                    this.alertDetails.status = 'in_progress';
                }
            } catch (err) {
                this.error = err.message;
                throw err; 
            }
        },

        /** Met à jour le statut à 'Résolue' (traiteß) */
        async resolveAlert(alertId) {
            this.resetFeedback();
            try {
                const response = await apiResolveAlert(alertId);
                this.success = response.message;
                 // Mettre à jour l'état de l'alerte localement après la résolution réussie
                if (this.alertDetails && this.alertDetails.id === alertId) {
                    this.alertDetails.status = 'traiteß'; 
                }
            } catch (err) {
                this.error = err.message;
                throw err; 
            }
        },

        /** Envoie un message au patient (Chat) */
        async sendMessageToPatient(alertId, data) {
             this.resetFeedback();
            try {
                await apiSendMessageToPatient(alertId, data);
            } catch (err) {
                this.error = err.message;
                throw err; 
            }
        }
    },
});