// resources/js/stores/laboratoryStore.js

import { defineStore } from "pinia";
import {
    apiGetLaboratories,
    apiGetLaboratoryById,
    apiStoreLaboratory,
    apiUpdateLaboratory,
    apiDeleteLaboratory
} from "@/services/apiLaboratory"; // Assurez-vous du bon chemin

export const useLaboratoryStore = defineStore('laboratory', {
    state: () => ({
        laboratories: [],
        loading: false,
        error: null,
    }),

    actions: {
        async fetchAllLaboratories() {
            this.loading = true;
            this.error = null;
            try {
                const response = await apiGetLaboratories();
                this.laboratories = response.data; // Votre contrôleur renvoie un tableau directement
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },

        async fetchLaboratoryById(id) {
            this.loading = true;
            this.error = null;
            try {
                const response = await apiGetLaboratoryById(id);
                return response.data; // Retourne l'objet laboratoire directement
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async createLaboratory(laboratoryData) {
            this.loading = true;
            this.error = null;
            try {
                const response = await apiStoreLaboratory(laboratoryData);
                this.laboratories.push(response.data); // Ajoute le laboratoire créé au tableau
                return response.data;
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateLaboratory(id, laboratoryData) {
            this.loading = true;
            this.error = null;
            try {
                const response = await apiUpdateLaboratory(id, laboratoryData);
                const updatedLaboratory = response.data;
                const index = this.laboratories.findIndex(lab => lab.id === id);
                if (index !== -1) {
                    this.laboratories.splice(index, 1, updatedLaboratory); // Met à jour le laboratoire dans le tableau
                }
                return updatedLaboratory;
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteLaboratory(id) {
            this.loading = true;
            this.error = null;
            try {
                await apiDeleteLaboratory(id);
                this.laboratories = this.laboratories.filter(lab => lab.id !== id); // Supprime le laboratoire du tableau
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },

    getters: {
        allLaboratories: (state) => state.laboratories,
    },
});
