// src/stores/medicalrecordStore.js

import { defineStore } from "pinia";
import {
  apiCreateMedicalRecord,
  apiDeleteMedicalRecord,
  apiGetMedicalRecord,
  apiGetAllMedicalRecords, // <-- Le service qui appelle votre API
  apiUpdateMedicalRecord
} from "@/services/apiMedicalRecord";

export const useMedicalRecordStore = defineStore("medicalRecord", {
  state: () => ({
    records: [],
    record: null,
    loading: false,
    error: null,
    success: null,
    lastFetched: null,
  }),

  actions: {
    async handleAction(actionFn, successMessage = "") {
      this.loading = true;
      this.error = null;
      this.success = null;
      try {
        const result = await actionFn();
        if (successMessage) this.success = successMessage;
        return result;
      } catch (error) {
        if (error.validationErrors) {
          this.error = "Des champs sont invalides.";
        } else {
          this.error = error.message || "Erreur inconnue.";
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchAllMedicalRecords(force = false) {
      const now = Date.now();
      if (!force && this.lastFetched && now - this.lastFetched < 30000) {
        return;
      }

      await this.handleAction(async () => {
        const response = await apiGetAllMedicalRecords(); // Appel à l'API
        // 🚨 Correction : Extrait le tableau 'data' de l'objet de pagination
        this.records = response.data;
        this.lastFetched = now;
      });
    },

    async fetchMedicalRecord(id) {
      await this.handleAction(async () => {
        this.record = await apiGetMedicalRecord(id);
      });
    },

    async updateMedicalRecord(id, data) {
      await this.handleAction(async () => {
        const updated = await apiUpdateMedicalRecord(id, data);
        const index = this.records.findIndex((r) => r.id === id);
        if (index !== -1) {
          this.records[index] = updated;
        }
        this.record = updated;
        return updated;
      }, "Dossier médical mis à jour avec succès.");
    },

    async deleteMedicalRecord(id) {
      await this.handleAction(async () => {
        await apiDeleteMedicalRecord(id);
        this.records = this.records.filter((r) => r.id !== id);
        if (this.record?.id === id) this.record = null;
      }, "Dossier médical supprimé avec succès.");
    },

    async createMedicalRecord(data) {
      await this.handleAction(async () => {
        const newRecord = await apiCreateMedicalRecord(data);
        this.records.push(newRecord);
        return newRecord;
      }, "Dossier médical créé avec succès.");
    },

    resetFeedback() {
      this.error = null;
      this.success = null;
    }
  }
});
