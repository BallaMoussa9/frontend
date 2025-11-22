import { defineStore } from "pinia";
import API from "@/services/axios"; // Assurez-vous que ce chemin est correct pour votre instance Axios

import {
    // Fonctions pour la gestion des utilisateurs (Admin)
    apiSearchUsers,
    apiGetAllUsers,
    apiDeleteUser,
    apiUpdateUserRole,
    apiGetAvailableRoles,
    apiGetDepartments,

    // Fonctions pour la gestion du profil de l'utilisateur connecté
    apiUpdateProfileInformation,
    apiUpdatePassword,
    apiUpdateProfilePhoto,

    // Fonctions pour la recherche de profils spécifiques par ID utilisateur
    apiGetPatientByUserId,
    apiGetDoctorByUserId,
    apiGetNurseByUserId,
    apiExportReport, // 🔑 NOUVEL IMPORT : Fonction API pour l'exportation de rapport
    apiGetFirstResponderByUserId,
} from "@/services/apiUser"; // Assurez-vous que apiExportReport est bien défini dans ce fichier ou un autre importé.

export const useUserStore = defineStore('user', {
    id: 'user',
    state: () => ({
        // État pour la gestion des utilisateurs (par un admin)
        users: [],
        allUsers: [],
        responsibleUsers: [],
        pagination: {
            current_page: 1,
            last_page: 1,
            per_page: 15,
            total: 0,
            from: 0,
            to: 0,
        },
        selectedUser: null,

        // État pour l'utilisateur actuellement connecté (son propre profil)
        currentUser: null,

        // 🎯 ÉTATS POUR LES PROFILS SPÉCIFIQUES
        currentPatientProfile: null,
        currentDoctorProfile: null,
        currentNurseProfile: null,
        currentFirstResponderProfile: null,
        // Nouveaux états pour la gestion des rôles et départements
        availableRoles: [],
        availableDepartments: [],

        // État général pour les opérations
        loading: false, // Variable principale pour le chargement
        error: null,    // Message d'erreur simple
        success: null,  // Message de succès simple
        feedback: { message: null, type: null }, // Objet pour les feedbacks plus riches (utilisé dans exportNurseActivityReport)
    }),

    actions: {
        // --- Gestion des feedbacks : AJOUTÉES / MISES À JOUR ---
        setFeedback(message, type) {
            this.feedback.message = message;
            this.feedback.type = type;
        },
        clearFeedback() {
            // Réinitialise l'objet feedback ainsi que error et success pour la cohérence
            this.feedback.message = null;
            this.feedback.type = null;
            this.error = null;
            this.success = null;
        },
        setError(message) {
            this.error = message;
            this.success = null;
            this.setFeedback(message, 'error'); // Met à jour l'objet feedback aussi
        },
        setSuccess(message) {
            this.success = message;
            this.error = null;
            this.setFeedback(message, 'success'); // Met à jour l'objet feedback aussi
        },
        resetFeedback() { // Cette méthode existait, on s'assure qu'elle appelle clearFeedback
            this.clearFeedback();
        },

        /**
         * Charge le profil patient et retourne l'ID du patient.
         */
        async fetchPatientByUserId(userId) {
            this.loading = true;
            this.clearFeedback(); // Utilise la nouvelle méthode
            try {
                console.log(`UserStore: Tentative de récupération du profil patient pour l'utilisateur ID: ${userId}`);
                const response = await apiGetPatientByUserId(userId);
                this.currentPatientProfile = response.patient;
                console.log(`UserStore: Profil patient récupéré:`, this.currentPatientProfile);
                this.setSuccess('Profil patient chargé avec succès.'); // Exemple
                return response.patient.id; // Retourne l'ID spécifique du patient
            } catch (error) {
                this.setError(`Échec du chargement du profil patient: ${error.message}`); // Utilise setError
                console.error("UserStore: Erreur dans fetchPatientByUserId:", error);
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async fetchResponsibleUsers() {
            this.loading = true;
            this.clearFeedback();
            try {
                // ⚠️ Vous DEVEZ créer une nouvelle fonction API qui ne retourne que les utilisateurs éligibles
                // Pour l'instant, nous allons utiliser fetchAllUsers comme substitut (Moins performant mais évite une erreur API)
                // Idéalement: const response = await apiGetResponsibleUsers();
                await this.handleAction(async () => {
                    const response = await apiGetAllUsers(); // Utilisation d'une fonction existante comme placeholder
                    
                    // Optionnel: Filtrez-les côté client si l'API ne le fait pas, ex: par rôle "doctor" ou "admin"
                    this.responsibleUsers = response.map(user => ({
                         // Nous supposons que vous avez un champ 'role' pour l'affichage
                         ...user,
                         role: user.roles && user.roles.length > 0 ? user.roles[0].name : 'N/A', 
                    }));

                }, 'Responsables potentiels chargés.');
            } catch (error) {
                this.setError(`Échec du chargement des responsables : ${error.message}`);
                throw error;
            } finally {
                this.loading = false;
            }
        },
        /**
     * NOUVELLE ACTION : Récupère la liste complète des profils FirstResponder (Urgentistes) 
     * avec leurs données utilisateur.
     */
    async fetchAllFirstResponders() {
        this.loading = true;
        this.clearFeedback();
        this.allFirstResponders = []; 

        try {
            console.log('--- USER STORE LOG: Démarrage de fetchAllFirstResponders ---');
            
            // NOTE: L'appel API suppose qu'il cible la route GET /urgentist/
            const response = await API.get('/urgentist'); 
            
            // 🔑 LOG 1 : Afficher la réponse Axios complète
            console.log('--- USER STORE LOG: Réponse Axios complète reçue ---', response);

            // 🔑 LOG 2 : Afficher l'objet de pagination Laravel (response.data)
            console.log('--- USER STORE LOG: Contenu de response.data (Objet de pagination) ---', response.data);

            // 🔑 LOG 3 : Afficher le tableau des résultats (response.data.data)
            if (response.data && response.data.data) {
                console.log('--- USER STORE LOG: Tableau des résultats (response.data.data) ---', response.data.data);
                this.allFirstResponders = response.data.data;
            } else if (response.data) {
                 // Si c'est un tableau non paginé (response.data est le tableau)
                 console.log('--- USER STORE LOG: Réponse non paginée (response.data) ---', response.data);
                 this.allFirstResponders = Array.isArray(response.data) ? response.data : [];
            } else {
                 console.log('--- USER STORE LOG: Aucune donnée trouvée ou structure inattendue. ---');
            }

            this.setSuccess('Liste des médecins urgentistes chargée avec succès.');
        } catch (error) {
            // 🔑 LOG ERREUR : Afficher l'objet d'erreur complet
            console.error("--- USER STORE ERREUR: Erreur complète lors du chargement des urgentistes ---", error);

            this.setError(`Échec du chargement de la liste des urgentistes: ${error.message}`);
            throw error;
        } finally {
            this.loading = false;
        }
    },

        /**
         * Charge le profil docteur et retourne l'ID du docteur.
         */
        async fetchDoctorByUserId(userId) {
            this.loading = true;
            this.clearFeedback();
            try {
                console.log(`UserStore: Tentative de récupération du profil médecin pour l'utilisateur ID: ${userId}`);
                const response = await apiGetDoctorByUserId(userId);
                this.currentDoctorProfile = response.doctor;
                console.log(`UserStore: Profil médecin récupéré:`, this.currentDoctorProfile);
                this.setSuccess('Profil docteur chargé avec succès.'); // Exemple
                return response.doctor.id; // Retourne l'ID spécifique du docteur
            } catch (error) {
                this.setError(`Échec du chargement du profil médecin: ${error.message}`);
                console.error("UserStore: Erreur dans fetchDoctorByUserId:", error);
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * 🔑 NOUVELLE ACTION : Charge le profil infirmier et retourne l'ID de l'infirmier (nurseId).
         */
        async fetchNurseByUserId(userId) {
            this.loading = true;
            this.clearFeedback();
            this.currentNurseProfile = null; // Réinitialiser avant le chargement
            try {
                console.log(`UserStore: Tentative de récupération du profil infirmier pour l'utilisateur ID: ${userId}`);
                const response = await apiGetNurseByUserId(userId);
                this.currentNurseProfile = response;
                console.log(`UserStore: Profil infirmier récupéré:`, this.currentNurseProfile);
                this.setSuccess('Profil infirmier chargé avec succès.'); // Exemple
                return response.id;
            } catch (error) {
                this.setError(`Échec du chargement du profil infirmier: ${error.message}`);
                console.error("UserStore: Erreur dans fetchNurseByUserId:", error);
                throw error;
            } finally {
                this.loading = false;
            }
        },


        // --- Fonctions utilitaires génériques ---
        async handleAction(actionFn, successMessage = '') {
            this.loading = true;
            this.clearFeedback(); // Utilise clearFeedback pour toutes les actions générales
            try {
                const result = await actionFn();
                if (successMessage) this.setSuccess(successMessage);
                return result;
            } catch (error) {
                this.setError(error.message || 'Une erreur inconnue est survenue.'); // Utilise setError
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // ----------------------------------------------------
        // Actions pour la GESTION DES UTILISATEURS (Admin)
        // ----------------------------------------------------

        async searchUsers(searchParams = {}) {
            await this.handleAction(async () => {
                const response = await apiSearchUsers(searchParams);
                this.users = response.data;
                this.pagination = {
                    current_page: response.current_page,
                    last_page: response.last_page,
                    per_page: response.per_page,
                    total: response.total,
                    from: response.from,
                    to: response.to,
                };
            }, 'Utilisateurs chargés avec succès.');
        },

        async fetchAllUsers() {
            await this.handleAction(async () => {
                const fetchedUsers = await apiGetAllUsers();
                this.allUsers = fetchedUsers.map(user => ({
                    ...user,
                    role: user.roles && user.roles.length > 0 ? user.roles[0].name : '',
                    originalRole: user.roles && user.roles.length > 0 ? user.roles[0].name : '',
                }));
            }, 'Tous les utilisateurs chargés avec succès.');
        },

        async deleteUser(userId) {
            await this.handleAction(async () => {
                await apiDeleteUser(userId);
                this.users = this.users.filter(user => user.id !== userId);
                this.allUsers = this.allUsers.filter(user => user.id !== userId);
                this.pagination.total--;
            }, 'Utilisateur supprimé avec succès.');
        },

        setSelectedUser(user) {
            this.selectedUser = user;
        },

        // ----------------------------------------------------
        // Actions pour la GESTION DES RÔLES ET DÉPARTEMENTS (Admin)
        // ----------------------------------------------------

        async fetchAvailableRoles() {
            await this.handleAction(async () => {
                this.availableRoles = await apiGetAvailableRoles();
            }, 'Rôles disponibles chargés.');
        },

        async fetchAvailableDepartments() {
            await this.handleAction(async () => {
                this.availableDepartments = await apiGetDepartments();
            }, 'Départements disponibles chargés.');
        },

        async updateUserRole(userId, newRole) {
            await this.handleAction(async () => {
                const response = await apiUpdateUserRole(userId, newRole);
                const userIndex = this.allUsers.findIndex(u => u.id === userId);
                if (userIndex !== -1) {
                    this.allUsers[userIndex].roles = response.user.roles;
                    this.allUsers[userIndex].role = newRole;
                    this.allUsers[userIndex].originalRole = newRole;
                }
                const paginatedUserIndex = this.users.findIndex(u => u.id === userId);
                if (paginatedUserIndex !== -1) {
                    this.users[paginatedUserIndex].roles = response.user.roles;
                }
            }, 'Rôle mis à jour avec succès.');
        },

        // ----------------------------------------------------
        // Actions pour le PROFIL de l'UTILISATEUR CONNECTÉ
        // ----------------------------------------------------

        async fetchCurrentUser() {
            this.loading = true;
            this.clearFeedback();
            try {
                const response = await API.get('/user');
                this.currentUser = response.data;
                this.setSuccess('Informations utilisateur chargées.');
            } catch (err) {
                this.setError(err.message || 'Échec du chargement des informations de l\'utilisateur connecté.');
                this.currentUser = null;
            } finally {
                this.loading = false;
            }
        },

        async updateCurrentUserProfile(userData) {
            await this.handleAction(async () => {
                const response = await apiUpdateProfileInformation(userData);
                if (this.currentUser) {
                    Object.assign(this.currentUser, {
                        first_name: userData.first_name,
                        last_name: userData.last_name,
                        email: userData.email,
                        phone: userData.phone,
                        country: userData.country,
                        city: userData.city,
                        address: userData.address,
                    });
                }
                return response;
            }, 'Informations de profil mises à jour avec succès.');
        },

        async updateCurrentUserPassword(passwordData) {
            await this.handleAction(async () => {
                const response = await apiUpdatePassword(passwordData);
                return response;
            }, 'Mot de passe mis à jour avec succès.');
        },

        async updateCurrentUserPhoto(photoFile) {
            await this.handleAction(async () => {
                const response = await apiUpdateProfilePhoto(photoFile);
                if (this.currentUser && response.profile_photo_url) {
                    this.currentUser.profile_photo_url = response.profile_photo_url;
                }
                return response;
            }, 'Photo de profil mise à jour avec succès.');
        },

        /**
         * Action pour exporter un rapport d'activité infirmier.
         * @param {number} reportId L'ID du rapport à exporter.
         */
        async exportNurseActivityReport(reportId) {
            this.loading = true; // Utilise 'loading' pour la cohérence
            this.clearFeedback(); // Efface les messages précédents

            try {
                // Appel de la fonction API qui gère le téléchargement
                // Assurez-vous que apiExportReport gère le téléchargement d'un fichier blob et nomme le fichier
                await apiExportReport({ report_id: reportId });

                // Si apiExportReport se termine sans erreur, cela signifie que le téléchargement a été déclenché.
                this.setSuccess('Le rapport a été généré et téléchargé avec succès !'); // Utilise setSuccess

            } catch (error) {
                console.error('Erreur dans userStore.exportNurseActivityReport:', error);
                // Le message d'erreur est géré par setError
                this.setError(error.message || 'Échec de l\'exportation du rapport.');
                throw error; // Relaunch l'erreur pour que la vue puisse la capter si nécessaire
            } finally {
                this.loading = false;
            }
        },
        async fetchUrgentistByUserId(userId) {
            this.loading = true;
            this.clearFeedback();
            this.currentFirstResponderProfile = null; // Réinitialiser
            try {
                console.log(`UserStore: Tentative de récupération du profil Urgentiste pour l'utilisateur ID: ${userId}`);
                // Appel à la fonction API que nous venons de créer
                const response = await apiGetFirstResponderByUserId(userId);
                
                // Le backend doit retourner l'objet FirstResponder.
                this.currentFirstResponderProfile = response;
                
                console.log(`UserStore: Profil Urgentiste récupéré:`, this.currentFirstResponderProfile);
                this.setSuccess('Profil Urgentiste chargé avec succès.');
                
                // Retourne l'ID du profil Urgentiste (firts_responders.id)
                // On suppose que l'objet FirstResponder a une propriété 'id'
                return response.id; 
            } catch (error) {
                this.setError(`Échec du chargement du profil Urgentiste: ${error.message}`);
                console.error("UserStore: Erreur dans fetchUrgentistByUserId:", error);
                throw error;
            } finally {
                this.loading = false;
            }
        },
        // ----------------------------------------------------
        // Autres actions
        // ----------------------------------------------------
    },

    getters: {
        // 🎯 Getters pour les données des profils spécifiques
        getCurrentPatientProfile: (state) => state.currentPatientProfile,
        getCurrentDoctorProfile: (state) => state.currentDoctorProfile,
        getCurrentNurseProfile: (state) => state.currentNurseProfile,
        getCurrentFirstResponderProfile: (state) => state.currentFirstResponderProfile,

        // Getters pour la gestion des utilisateurs (par un admin)
        getUsers: (state) => state.users,
        getPagination: (state) => state.pagination,
        getSelectedUser: (state) => state.selectedUser,
        getAllUsers: (state) => state.allUsers,
        hasUsers: (state) => state.users.length > 0,

        // Getters pour les rôles et départements
        getAvailableRoles: (state) => state.availableRoles,
        getAvailableDepartments: (state) => state.availableDepartments,

        // Getters pour le profil de l'utilisateur connecté
        getCurrentUser: (state) => state.currentUser,
        isCurrentUserLoggedIn: (state) => !!state.currentUser,
        isLoading: (state) => state.loading, // Permet d'accéder à l'état de chargement via isLoading
    },
});
