// src/stores/api/bedApiStore.js

import API from './axios'; // Assurez-vous que './axios' est le bon chemin



export const bedApiStore = {
    // GET /api/beds
    fetchBeds(params = {}) {
        return API.get('/beds', { params });
    },

    // GET /api/beds/{id}
    fetchBed(id) {
        return API.get(`/beds/${id}`);
    },

    // POST /api/beds
    createBed(data) {
        return API.post('/beds', data);
    },

    // PUT /api/beds/{id}
    updateBed(id, data) {
        return API.put(`/beds/${id}`, data);
    },

    // DELETE /api/beds/{id}
    deleteBed(id) {
        return API.delete(`/beds/${id}`);
    }
};
