// resources/js/stores/roleStore.js

import { defineStore } from "pinia";
import {
    apiGetAllRoles,
    apiUpdateUserRole,
    apiAddRoleToUser,
    apiRemoveRoleFromUser
} from "@/services/apiRole"; // Import des fonctions API

export const useRoleStore = defineStore('role', {
    state: () => ({
        allRoles: [], // Tous les rôles disponibles
        userRoles: [], // Rôles de l'utilisateur actuellement sélectionné/modifié
        loading: false,
        error: null,
        success: null,
    }),

    actions: {
        // Une action générique pour gérer le loading/error/success
        async handleAction(actionFn, successMessage = '') {
            this.loading = true;
            this.error = null;
            this.success = null;
            try {
                const result = await actionFn();
                if (successMessage) this.success = successMessage;
                return result;
            } catch (error) {
                // Pour capturer les messages d'erreur du backend
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Charge tous les rôles disponibles.
         */
        async fetchAllRoles() {
            await this.handleAction(async () => {
                this.allRoles = await apiGetAllRoles();
            }, 'Rôles disponibles chargés avec succès.');
        },

        /**
         * Met à jour le rôle principal d'un utilisateur (remplace tous les rôles existants).
         * @param {number} userId
         * @param {number} roleId
         * @param {number|null} departmentId
         */
        async updateUserRole(userId, roleId, departmentId = null) {
            return await this.handleAction(async () => {
                const response = await apiUpdateUserRole(userId, roleId, departmentId);
                this.userRoles = response.user_roles; // Mettre à jour les rôles de l'utilisateur
                return response;
            }, 'Rôle de l\'utilisateur mis à jour avec succès.');
        },

        /**
         * Assigne un rôle à un utilisateur.
         * @param {number} userId
         * @param {string} roleName
         * @param {number|null} departmentId
         */
        async addRoleToUser(userId, roleName, departmentId = null) {
            return await this.handleAction(async () => {
                const response = await apiAddRoleToUser(userId, roleName, departmentId);
                this.userRoles = response.user_roles;
                return response;
            }, `Rôle '${roleName}' assigné à l'utilisateur avec succès.`);
        },

        /**
         * Retire un rôle d'un utilisateur.
         * @param {number} userId
         * @param {string} roleName
         */
        async removeRoleFromUser(userId, roleName) {
            return await this.handleAction(async () => {
                const response = await apiRemoveRoleFromUser(userId, roleName);
                // Il faudrait re-fetcher les rôles de l'utilisateur ou les mettre à jour localement
                // Pour simplicité, nous pourrions recharger les rôles de l'utilisateur si nécessaire.
                // Ou si la réponse contient les rôles mis à jour: this.userRoles = response.user_roles;
                return response;
            }, `Rôle '${roleName}' retiré de l'utilisateur avec succès.`);
        },

        /**
         * Met à jour les rôles d'un utilisateur localement dans le store (utile après une action externe).
         * @param {Array<string>} roles
         */
        setUserRoles(roles) {
            this.userRoles = roles;
        },

        resetFeedback() {
            this.error = null;
            this.success = null;
        }
    },

    getters: {
        /**
         * Retourne tous les rôles disponibles.
         */
        getAllRoles: (state) => state.allRoles,

        /**
         * Retourne les rôles de l'utilisateur actuellement géré.
         */
        getUserRoles: (state) => state.userRoles,

        /**
         * Vérifie si un rôle spécifique est assigné à l'utilisateur actuel.
         * @param {string} roleName
         * @returns {boolean}
         */
        hasUserRole: (state) => (roleName) => {
            return state.userRoles.includes(roleName);
        },
    },
});
