// src/services/apiNotification.js
import API from './axios'; // Assurez-vous que './axios' est bien le chemin vers votre instance Axios configurée

const handleNotificationRequest = async (promise) => {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Erreur API notifications.';
    console.error('Erreur API Notifications:', error.response?.data || error.message);
    throw new Error(errorMessage);
  }
};

export const apiGetUserNotifications = () => handleNotificationRequest(API.get('/user/notifications'));
export const apiMarkNotificationAsRead = (notificationId) => handleNotificationRequest(API.post(`/user/notifications/${notificationId}/mark-as-read`));
export const apiMarkAllNotificationsAsRead = () => handleNotificationRequest(API.post('/user/notifications/mark-all-as-read'));