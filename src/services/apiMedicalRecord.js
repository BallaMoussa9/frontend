// src/services/apiMedicalRecord.js
import API from "./axios";

/**
 * Centralise la gestion des erreurs API
 * - Gère les erreurs de validation Laravel (422)
 * - Gère les erreurs serveur (500) et réseau
 */
const handleRequest = async (promise) => {
  try {
    const response = await promise;
    // 💡 Affiche la réponse de l'API dans la console
    console.log("Réponse API reçue:", response.data);
    return response.data;
  } catch (error) {
    const status = error.response?.status;
    const data = error.response?.data;

    let customError = new Error(
      data?.message || "Erreur de connexion au serveur"
    );

    if (status === 422 && data?.errors) {
      // Laravel validation errors
      customError.validationErrors = data.errors;
    }

    console.error("Erreur API Dossier Médical:", data || error.message);
    throw customError;
  }
};

/**
 * Si data est un objet simple → JSON
 * Si data contient un fichier → FormData
 */
const toFormDataIfNeeded = (data) => {
  if (!(data instanceof FormData)) {
    const hasFile = Object.values(data || {}).some(
      (v) => v instanceof File || v instanceof Blob
    );
    if (hasFile) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) =>
        formData.append(key, value)
      );
      return formData;
    }
  }
  return data;
};

// Endpoints API
export const apiGetAllMedicalRecords = () => {
  console.log("Envoi de la requête pour récupérer tous les dossiers...");
  return handleRequest(API.get("/medicalrecord"));
};

export const apiGetMedicalRecord = (id) => {
  console.log(`Envoi de la requête pour récupérer le dossier avec l'ID: ${id}...`);
  return handleRequest(API.get(`/medicalrecord/${id}`));
};

export const apiUpdateMedicalRecord = (id, data) => {
  console.log(`Envoi de la requête de mise à jour pour le dossier avec l'ID: ${id}`);
  console.log("Données envoyées pour la mise à jour:", data);
  return handleRequest(
    API.post(`/medicalrecord/${id}`, toFormDataIfNeeded({ ...data, _method: "PUT" }), {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );
};

export const apiDeleteMedicalRecord = (id) => {
  console.log(`Envoi de la requête de suppression pour le dossier avec l'ID: ${id}...`);
  return handleRequest(API.delete(`/medicalrecord/${id}`));
};

export const apiCreateMedicalRecord = (data) => {
  console.log("Envoi de la requête pour créer un nouveau dossier...");
  console.log("Données envoyées pour la création:", data);
  return handleRequest(
    API.post("/medicalrecord/register", toFormDataIfNeeded(data), {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );
};
