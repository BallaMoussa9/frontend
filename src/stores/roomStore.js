// src/stores/roomStore.js

import { defineStore } from 'pinia';
import { roomApiStore } from '../services/roomApiStore';

export const useRoomStore = defineStore('room', {
    state: () => ({
        rooms: [],
        loading: false,
        error: null,
        pagination: {},
    }),

    getters: {
        getRooms: (state) => state.rooms,
        getLoading: (state) => state.loading,
    },

    actions: {
        // 1. Récupérer la liste des chambres
        async fetchRooms(params = {}) {
            this.loading = true;
            this.error = null;
            try {
                const response = await roomApiStore.fetchRooms(params);
                this.rooms = response.data.data; // Assurez-vous que votre API renvoie les données dans 'data.data'
                this.pagination = {
                    total: response.data.total,
                    currentPage: response.data.current_page,
                    lastPage: response.data.last_page,
                };
            } catch (error) {
                this.error = "Erreur lors du chargement des chambres.";
                console.error(error);
            } finally {
                this.loading = false;
            }
        },

        // 2. Créer une nouvelle chambre
        async createRoom(roomData) {
            this.loading = true;
            this.error = null;
            try {
                const response = await roomApiStore.createRoom(roomData);
                // Ajouter la nouvelle chambre à l'état local
                this.rooms.push(response.data);
                return response.data;
            } catch (error) {
                this.error = "Échec de la création de la chambre.";
                // Renvoyer l'erreur pour la gestion des erreurs de validation côté composant
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // 3. Mettre à jour une chambre
        async updateRoom(roomId, roomData) {
            this.loading = true;
            this.error = null;
            try {
                const response = await roomApiStore.updateRoom(roomId, roomData);
                // Mettre à jour l'état local
                const index = this.rooms.findIndex(r => r.id === roomId);
                if (index !== -1) {
                    this.rooms[index] = response.data;
                }
                return response.data;
            } catch (error) {
                this.error = "Échec de la mise à jour de la chambre.";
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // 4. Supprimer une chambre
        async deleteRoom(roomId) {
            this.loading = true;
            this.error = null;
            try {
                await roomApiStore.deleteRoom(roomId);
                // Retirer la chambre de l'état local
                this.rooms = this.rooms.filter(r => r.id !== roomId);
            } catch (error) {
                this.error = "Échec de la suppression de la chambre.";
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
