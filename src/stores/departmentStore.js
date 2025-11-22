// resources/js/stores/departmentStore.js

import { defineStore } from "pinia";
import {
    apiGetDepartments,
    apiStoreDepartment,
    apiUpdateDepartment,
    apiDeleteDepartment,
    apiGetDepartmentById // ✅ Importé et utilisé
} from "@/services/apiDepartment";

export const useDepartmentStore = defineStore('department', {
    state: () => ({
        departments: [],
        loading: false,
        error: null,
    }),

    actions: {
        async fetchDepartments() {
            this.loading = true;
            this.error = null;
            try {
                const response = await apiGetDepartments();
                this.departments = response.data.data;
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },

        async createDepartment(departmentData) {
            this.loading = true;
            this.error = null;
            try {
                const response = await apiStoreDepartment(departmentData);
                this.departments.push(response.data.data);
                return response.data.data;
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // ✅ Action pour récupérer un département par son ID (Correct)
        async fetchDepartmentById(id) {
            this.loading = true;
            this.error = null;
            try {
                const response = await apiGetDepartmentById(id);
                return response.data.data;
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateDepartment(id, departmentData) {
            this.loading = true;
            this.error = null;
            try {
                const response = await apiUpdateDepartment(id, departmentData);
                const updatedDepartment = response.data.data;
                const index = this.departments.findIndex(d => d.id === id);
                if (index !== -1) {
                    this.departments.splice(index, 1, updatedDepartment);
                }
                return updatedDepartment;
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteDepartment(id) {
            this.loading = true;
            this.error = null;
            try {
                await apiDeleteDepartment(id);
                this.departments = this.departments.filter(d => d.id !== id);
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },

    getters: {
        allDepartments: (state) => state.departments,
    },
});