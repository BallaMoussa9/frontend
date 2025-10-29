// src/stores/api/roomApiStore.js

import API from './axios'; // Assurez-vous que './axios' est le bon chemin

// 🔑 Configurer axios si ce n'est pas déjà fait (e.g. base URL, headers)

export const roomApiStore = {
    // GET /api/rooms
    fetchRooms(params = {}) {
        return API.get('/rooms', { params });
    },

    // GET /api/rooms/{id}
    fetchRoom(id) {
        return API.get(`/rooms/${id}`);
    },

    // POST /api/rooms
    createRoom(data) {
        return API.post('/rooms', data);
    },

    // PUT /api/rooms/{id}
    updateRoom(id, data) {
        return API.put(`/rooms/${id}`, data);
    },

    // DELETE /api/rooms/{id}
    deleteRoom(id) {
        return API.delete(`/rooms/${id}`);
    }
};
