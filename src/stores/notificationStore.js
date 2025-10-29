// src/stores/notificationStore.js
import { defineStore } from 'pinia';
import {
  apiGetUserNotifications,
  apiMarkNotificationAsRead,
  apiMarkAllNotificationsAsRead,
} from '@/services/apiNotification'; // Assurez-vous que ce fichier existe et contient les fonctions

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    loadingNotifications: false,
    errorNotifications: null,
  }),

  getters: {
    // Nombre de notifications non lues
    unreadNotificationsCount: (state) => {
      return state.notifications.filter(n => !n.read_at).length;
    },
    // Obtenez les notifications non lues
    unreadNotifications: (state) => {
      return state.notifications.filter(n => !n.read_at);
    },
  },

  actions: {
    async fetchNotifications() {
      this.loadingNotifications = true;
      this.errorNotifications = null;
      try {
        const data = await apiGetUserNotifications();
        this.notifications = data;
        // console.log("Notifications fetched:", data); // Décommentez pour débogage
      } catch (e) {
        this.errorNotifications = e.message;
        console.error("Failed to fetch notifications:", e);
      } finally {
        this.loadingNotifications = false;
      }
    },

    async markNotificationAsRead(notificationId) {
      this.errorNotifications = null;
      try {
        await apiMarkNotificationAsRead(notificationId);
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.read_at = new Date().toISOString(); // Simule la lecture côté client
        }
        // console.log(`Notification ${notificationId} marked as read.`); // Décommentez pour débogage
      } catch (e) {
        this.errorNotifications = e.message;
        console.error(`Failed to mark notification ${notificationId} as read:`, e);
      }
    },

    async markAllNotificationsAsRead() {
      this.errorNotifications = null;
      try {
        await apiMarkAllNotificationsAsRead();
        this.notifications.forEach(n => {
          if (!n.read_at) {
            n.read_at = new Date().toISOString(); // Simule la lecture côté client
          }
        });
        // console.log("All notifications marked as read."); // Décommentez pour débogage
      } catch (e) {
        this.errorNotifications = e.message;
        console.error("Failed to mark all notifications as read:", e);
      }
    },

    // Méthode pour ajouter une notification reçue via WebSocket (temps réel)
    addNotification(newNotification) {
      // Pour éviter les doublons si la notification est déjà là
      if (!this.notifications.some(n => n.id === newNotification.id)) {
        this.notifications.unshift(newNotification); // Ajoute au début de la liste
      }
      // console.log("New notification added:", newNotification); // Décommentez pour débogage
    },
  },
});