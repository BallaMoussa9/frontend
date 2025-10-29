// resources/js/stores/systemSettingStore.js

import { defineStore } from "pinia";
import {
    apiGetSystemSettings,
    apiGetSystemSettingById,
    apiStoreSystemSetting,
    apiUpdateSystemSetting,
    apiDeleteSystemSetting,
    apiGetPublicSystemSettings // N'oubliez pas d'importer la fonction pour les paramètres publics
} from "@/services/apiSystemSetting";

export const useSystemSettingStore = defineStore('systemSetting', {
    state: () => ({
        settings: [],
        currentSetting: null,
        publicSettings: {}, // Pour stocker les paramètres publics par clé (facultatif, mais utile)
        loading: false,
        error: null,
        success: null,
    }),

    actions: {
        // Une action générique pour gérer le loading/error/success (similaire à votre approche)
        async handleAction(actionFn, successMessage = '') {
            this.loading = true;
            this.error = null;
            this.success = null;
            try {
                const result = await actionFn();
                if (successMessage) this.success = successMessage;
                return result; // Permet de retourner des données si l'action en produit
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchAllSystemSettings() {
            await this.handleAction(async () => {
                const response = await apiGetSystemSettings();
                this.settings = response.data;
            });
        },

        async fetchSystemSettingById(id) {
            return await this.handleAction(async () => {
                const response = await apiGetSystemSettingById(id);
                this.currentSetting = response.data;
                return response.data;
            });
        },

        async createSystemSetting(settingData) {
            await this.handleAction(async () => {
                const response = await apiStoreSystemSetting(settingData);
                this.settings.push(response.data);
            }, 'Paramètre système créé avec succès.');
        },

        async updateSystemSetting(id, settingData) {
            await this.handleAction(async () => {
                const response = await apiUpdateSystemSetting(id, settingData);
                const updatedSetting = response.data;
                const index = this.settings.findIndex(s => s.id === id);
                if (index !== -1) {
                    this.settings.splice(index, 1, updatedSetting);
                }
                this.currentSetting = updatedSetting;
            }, 'Paramètre système mis à jour avec succès.');
        },

        async deleteSystemSetting(id) {
            await this.handleAction(async () => {
                await apiDeleteSystemSetting(id);
                this.settings = this.settings.filter(s => s.id !== id);
            }, 'Paramètre système supprimé avec succès.');
        },

        // Action spécifique pour récupérer les paramètres publics
        async fetchPublicSystemSettings() {
            this.loading = true;
            this.error = null;
            try {
                const response = await apiGetPublicSystemSettings();
                // Stocker les paramètres publics dans un objet pour un accès facile par clé
                this.publicSettings = response.data.reduce((acc, setting) => {
                    acc[setting.key] = setting.value;
                    return acc;
                }, {});
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Récupérer un paramètre public spécifique par sa clé (si déjà chargé)
        getPublicSetting(key) {
            return this.publicSettings[key] || null;
        },

        resetFeedback() {
            this.error = null;
            this.success = null;
        }
    },

    getters: {
        allSystemSettings: (state) => state.settings,
        // Un getter pour récupérer tous les paramètres publics, si vous les stockez tous
        allPublicSettings: (state) => state.publicSettings,
        // Ou un getter plus dynamique si vous ne chargez qu'un subset
        getSettingByKey: (state) => (key) => {
            const setting = state.settings.find(s => s.key === key);
            return setting ? setting.value : null;
        }
    },
});
