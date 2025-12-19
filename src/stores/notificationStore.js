// src/stores/notificationStore.js
import { defineStore } from 'pinia';
import {
  apiGetUserNotifications,
  apiMarkNotificationAsRead,
  apiMarkAllNotificationsAsRead,
  apiSendAdminNotification, // 👈 ajout
} from '@/services/apiNotification';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    loadingNotifications: false,
    errorNotifications: null,

    // États pour l'envoi de notifications
    sending: false,
    sendError: null,
    sendSuccess: false,
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
      } catch (e) {
        this.errorNotifications = e.message;
        console.error("Failed to mark all notifications as read:", e);
      }
    },

    // 🚀 Nouvelle action pour envoyer une notification par l’admin
    async sendNotification(payload) {
      this.sending = true;
      this.sendError = null;
      this.sendSuccess = false;
      try {
        await apiSendAdminNotification(payload);
        this.sendSuccess = true;
      } catch (e) {
        this.sendError = e.message;
        console.error("Failed to send notification:", e);
      } finally {
        this.sending = false;
      }
    },

    // Méthode pour ajouter une notification reçue via WebSocket (temps réel)
    addNotification(newNotification) {
      if (!this.notifications.some(n => n.id === newNotification.id)) {
        this.notifications.unshift(newNotification);
      }
    },
  },
});
