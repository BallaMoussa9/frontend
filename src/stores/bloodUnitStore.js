// stores/bloodUnitStore.js

import { defineStore } from 'pinia';

// Importe toutes les fonctions nécessaires de l'API des unités de sang
import {
    apiGetBloodUnits,
    apiGetBloodUnit,
    apiCreateBloodUnit,
    apiUpdateBloodUnit,
    apiUpdateBloodUnitStatus,
    apiDeleteBloodUnit,
} from '@/services/apiBlood'; // Assurez-vous que le chemin est correct

export const useBloodUnitStore = defineStore('bloodUnit', {
    state: () => ({
        units: [],
        loading: false,
        error: null,
    }),

    getters: {
        allUnits: (state) => state.units,
        // Exemple de getter pour filtrer les unités disponibles
        availableUnits: (state) => state.units.filter(unit => unit.status === 'available'),
        // Exemple de getter pour trouver une unité par ID
        getUnitById: (state) => (id) => state.units.find(unit => unit.id === id),
    },

    actions: {
        // ----------------------------------------
        // READ: Récupérer toutes les unités de sang
        // ----------------------------------------
        async fetchUnits() {
            this.loading = true;
            this.error = null;
            try {
                const data = await apiGetBloodUnits();
                this.units = data;
                console.log("Unités de sang chargées:", this.units.length);
            } catch (err) {
                this.error = err.message || 'Erreur lors du chargement des unités de sang.';
                console.error('Action Error (fetchUnits):', err);
            } finally {
                this.loading = false;
            }
        },

        // ----------------------------------------
        // CREATE: Ajouter une nouvelle unité de sang
        // ----------------------------------------
        async createUnit(unitData) {
            this.loading = true;
            this.error = null;
            try {
                const newUnit = await apiCreateBloodUnit(unitData);

                // Ajouter la nouvelle unité au début de la liste locale
                this.units.unshift(newUnit);

                this.loading = false;
                return true;
            } catch (err) {
                this.loading = false;
                this.error = err.message || 'Échec de la création de l\'unité.';
                console.error('Action Error (createUnit):', err);
                throw err; // Relancer l'erreur pour la gestion des messages spécifiques dans le composant
            }
        },

        // ----------------------------------------
        // UPDATE: Modifier une unité existante
        // ----------------------------------------
        async updateUnit(id, unitData) {
            this.loading = true;
            this.error = null;
            try {
                const updatedUnit = await apiUpdateBloodUnit(id, unitData);

                // Mettre à jour l'unité dans l'état local
                const index = this.units.findIndex(unit => unit.id === id);
                if (index !== -1) {
                    this.units.splice(index, 1, updatedUnit);
                }

                this.loading = false;
                return true;
            } catch (err) {
                this.loading = false;
                this.error = err.message || 'Échec de la mise à jour de l\'unité.';
                console.error('Action Error (updateUnit):', err);
                throw err;
            }
        },

        // ----------------------------------------
        // DELETE: Supprimer une unité
        // ----------------------------------------
        async deleteUnit(id) {
            this.loading = true;
            this.error = null;
            try {
                await apiDeleteBloodUnit(id);

                // Retirer l'unité de l'état local
                this.units = this.units.filter(unit => unit.id !== id);

                this.loading = false;
                return true;
            } catch (err) {
                this.loading = false;
                this.error = err.message || 'Échec de la suppression de l\'unité.';
                console.error('Action Error (deleteUnit):', err);
                throw err;
            }
        },

        // ----------------------------------------
        // PATCH: Mettre à jour le statut
        // ----------------------------------------
        async updateUnitStatus(id, newStatus) {
            this.loading = true;
            this.error = null;
            try {
                const updatedUnit = await apiUpdateBloodUnitStatus(id, newStatus);

                // Mettre à jour l'état local
                const index = this.units.findIndex(u => u.id === id);
                if (index !== -1) {
                    // Utiliser l'objet complet retourné par l'API
                    this.units.splice(index, 1, updatedUnit);
                }

                this.loading = false;
                return true;
            } catch (err) {
                this.loading = false;
                this.error = err.message || `Échec de la mise à jour du statut en ${newStatus}.`;
                console.error('Action Error (updateUnitStatus):', err);
                throw err;
            }
        }
    }
});
