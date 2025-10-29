// src/stores/bedStore.js

import { defineStore } from 'pinia';
// Correct: bedApiStore est importé en tant que module de service direct
// et ses fonctions sont appelées directement, pas comme un store Pinia.
import { bedApiStore } from '../services/bedApiStore';

export const useBedStore = defineStore('bed', {
    state: () => ({
        beds: [],
        loading: false,
        error: null,
        pagination: {},
    }),

    getters: {
        getBeds: (state) => state.beds,
        getLoading: (state) => state.loading,
        // 🔑 CORRECTION MAJEURE ICI: Inclure aussi les lits en 'cleaning' comme disponibles pour l'assignation.
        // La logique d'inclure le lit 'occupied' actuel du patient est dans le composant.
        getAvailableBeds: (state) => state.beds.filter(bed =>
            bed.status === 'available' || bed.status === 'cleaning'
        ),
    },

    actions: {
        // 1. Récupérer la liste des lits
        async fetchBeds(params = {}) {
            this.loading = true;
            this.error = null;
             try {
                // bedApiStore est déjà le module exporté, on appelle directement ses méthodes
                const response = await bedApiStore.fetchBeds(params);
                this.beds = response.data.data;
                this.pagination = {
                    total: response.data.total,
                    currentPage: response.data.current_page,
                    lastPage: response.data.last_page,
                };
            } catch (error) {
                this.error = "Erreur lors du chargement des lits.";
                console.error("Erreur dans bedStore.fetchBeds:", error);
                throw error; // Relancer pour que le composant puisse le gérer
            } finally {
                this.loading = false;
            }
        },

        // 2. Créer un nouveau lit
        async createBed(bedData) {
            this.loading = true;
            this.error = null;
            try {
                const response = await bedApiStore.createBed(bedData);
                // Assurez-vous que response.data a la bonne structure, pourrait être response.data.data selon l'API
                this.beds.push(response.data);
                return response.data;
            } catch (error) {
                this.error = "Échec de la création du lit.";
                console.error("Erreur dans bedStore.createBed:", error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // 3. Mettre à jour un lit
        async updateBed(bedId, bedData) {
            this.loading = true;
            this.error = null;
            try {
                const response = await bedApiStore.updateBed(bedId, bedData);
                const index = this.beds.findIndex(b => b.id === bedId);
                if (index !== -1) {
                    // Assurez-vous que response.data a la bonne structure
                    // Ici, on fusionne les données existantes avec celles de la réponse
                    this.beds[index] = { ...this.beds[index], ...response.data };
                }
                return response.data;
            } catch (error) {
                this.error = "Échec de la mise à jour du lit.";
                console.error("Erreur dans bedStore.updateBed:", error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // 4. Supprimer un lit
        async deleteBed(bedId) {
            this.loading = true;
            this.error = null;
            try {
                await bedApiStore.deleteBed(bedId);
                this.beds = this.beds.filter(b => b.id !== bedId);
            } catch (error) {
                this.error = "Échec de la suppression du lit.";
                console.error("Erreur dans bedStore.deleteBed:", error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        clearError() {
            this.error = null;
        }
    }
});
