// <template>
//   <NurseLayout>
//     <div class="patients-page">
//       <div v-if="loadingGlobal" class="loading-overlay">
//         <p>Chargement du dossier patient...</p>
//       </div>

//       <div v-else-if="!selectedPatient" class="placeholder">
//         Aucun patient trouvé avec l'ID {{ patientId }}.
//       </div>

//       <div v-else class="patient-details-container">
//         <h2 class="details-header">
//           Fiche du patient : {{ selectedPatient.user?.first_name }} {{ selectedPatient.user?.last_name }}
//           <div v-if="loadingDme" class="inline-loader">Chargement DME...</div>
//         </h2>

//         <section class="nurse-edit-section card-section">
//           <h3>Mise à jour Clinique (Statut & Mensurations)</h3>
//           <div class="edit-grid">

//             <div class="form-group">
//               <label for="status">Statut actuel</label>
//               <select id="status" v-model="form.status" class="form-control">
//                 <option value="actif">Actif</option>
//                 <option value="en_traitement">En Traitement</option>
//                 <option value="stable">Stable</option>
//                 <option value="critique">Critique</option>
//                 <option value="sorti">Sorti</option>
//                 <option value="archive">Archivé</option>
//               </select>
//             </div>

//             <div class="form-group">
//               <label for="poids">Poids (kg)</label>
//               <input id="poids" v-model="form.poids" type="number" step="0.1" class="form-control" />
//             </div>

//             <div class="form-group">
//               <label for="taille">Taille (cm)</label>
//               <input id="taille" v-model="form.taille" type="number" class="form-control" />
//             </div>

//             <div class="form-group">
//               <label for="bed_id">
//                 Lit Assigné (Actuel : {{ selectedPatient.bed?.room?.department?.name || 'N/A' }} / {{ selectedPatient.bed?.room?.room_number || 'N/A' }}/{{ selectedPatient.bed?.bed_number || 'N/A' }})
//               </label>

//               <select id="bed_id" v-model="form.bed_id" class="form-control" :disabled="bedStore.loading">
//                   <option :value="null">-- Pas de lit assigné --</option>

//                   <template v-if="bedStore.loading">
//                       <option disabled>Chargement des lits...</option>
//                   </template>

//                   <template v-else-if="groupedAvailableBeds.length === 0 && !selectedPatient.bed_id">
//                       <option disabled>Aucun lit disponible.</option>
//                   </template>

//                   <optgroup v-for="group in groupedAvailableBeds" :key="group.departmentId" :label="group.departmentName">
//                       <option v-for="bed in group.beds" :key="bed.id" :value="bed.id">
//                           Chambre {{ bed.room.room_number }} / Lit {{ bed.bed_number }}
//                       </option>
//                   </optgroup>
//               </select>
//             </div>
//           </div>
//           <button @click="updatePatientData" :disabled="isUpdating" class="btn-update">
//             {{ isUpdating ? 'Sauvegarde en cours...' : 'Sauvegarder les Données et Mettre à Jour Lit' }}
//           </button>
//            <p v-if="updateError" class="error-message">{{ updateError }}</p>
//            <p v-if="updateSuccess" class="success-message">{{ updateSuccess }}</p>
//         </section>


//         <section class="vitals-section card-section">
//             <h3>Paramètres Vitaux Récents</h3>
//             <div v-if="selectedPatient.latest_vitals" class="vitals-grid">
//                 <p class="full-width"><strong>Enregistré par :</strong> ID Nurse {{ selectedPatient.latest_vitals.nurse_id }} | Le {{ formatDateHeure(selectedPatient.latest_vitals.recorded_at) }}</p>

//                 <p><strong>Température :</strong> {{ selectedPatient.latest_vitals.temperature }} °C</p>
//                 <p><strong>Tension :</strong> {{ selectedPatient.latest_vitals.blood_pressure_systolic }}/{{ selectedPatient.latest_vitals.blood_pressure_diastolic }} mmHg</p>
//                 <p><strong>Rythme Cardiaque :</strong> {{ selectedPatient.latest_vitals.heart_rate }} bpm</p>
//                 <p><strong>Fréquence Resp. :</strong> {{ selectedPatient.latest_vitals.respiratory_rate || 'N/A' }} rpm</p>
//                 <p><strong>SpO₂ :</strong> {{ selectedPatient.latest_vitals.oxygen_saturation || 'N/A' }} %</p>
//                 <p><strong>Poids enregistré :</strong> {{ selectedPatient.latest_vitals.weight || 'N/A' }} kg</p>
//                 <p><strong>Taille enregistrée :</strong> {{ selectedPatient.latest_vitals.height || 'N/A' }} m</p>

//                 <p class="notes-full-width">
//                     <strong>Notes :</strong> {{ selectedPatient.latest_vitals.notes || 'Aucune note.' }}
//                 </p>
//             </div>
//             <p v-else class="info-text">Aucune constante vitale récente enregistrée.</p>
//         </section>


//         <section class="patient-info card-section">
//           <h3>Informations Démographiques & Cliniques</h3>
//           <div class="info-grid-details">
//             <p><strong>Date de naissance:</strong> {{ selectedPatient.user?.birth_date }}</p>
//             <p><strong>Sexe:</strong> {{ selectedPatient.genre }}</p>
//             <p><strong>Groupe Sanguin:</strong> {{ selectedPatient.group_sanguine }}</p>
//             <p><strong>Maladies Chroniques:</strong> {{ selectedPatient.maladies_chroniques || 'Aucune' }}</p>
//             <p><strong>Tél. Urgence:</strong> {{ selectedPatient.telephone_urgence || 'N/A' }}</p>
//             <p><strong>Assurance Maladie:</strong> {{ selectedPatient.assurance_maladie || 'N/A' }}</p>
//             <p><strong>Dossier ID:</strong> {{ selectedPatient.medical_record_id || 'N/A' }}</p>
//           </div>
//         </section>

//         <section class="documents-section card-section">
//             <h3>Prescriptions Récentes</h3>
//             <p v-if="prescriptionStore.isLoading" class="info-text">Chargement des prescriptions...</p>
//             <ul v-else-if="patientPrescriptions.length > 0" class="documents-list">
//                 <li v-for="prescription in patientPrescriptions" :key="prescription.id" class="document-item">
//                     <a href="#">Ordonnance ID {{ prescription.id }} - {{ formatDate(prescription.created_at) }}</a>
//                 </li>
//             </ul>
//             <p v-else class="info-text">Aucune prescription trouvée pour ce patient.</p>
//         </section>

//         <section class="documents-section card-section">
//             <h3>Analyses Récentes</h3>
//             <p v-if="labStore.isLoading" class="info-text">Chargement des analyses...</p>
//             <ul v-else-if="patientLabRequests.length > 0" class="documents-list">
//                 <li v-for="analysis in patientLabRequests" :key="analysis.id" class="document-item">
//                     <a href="#">{{ analysis.type_of_analysis || 'Analyse non spécifiée' }} (Statut: {{ analysis.status }})</a>
//                 </li>
//             </ul>
//             <p v-else class="info-text">Aucune demande d'analyse trouvée.</p>
//         </section>

//         <section class="documents-section card-section">
//             <h3>Historique des Consultations</h3>
//             <p v-if="consultationStore.loading" class="info-text">Chargement de l'historique des consultations...</p>
//             <ul v-else-if="patientConsultations.length > 0" class="documents-list">
//                 <li v-for="consultation in patientConsultations" :key="consultation.id" class="document-item">
//                     <a href="#">Consultation du {{ formatDate(consultation.start_date) }} (Motif: {{ consultation.reason_for_visit }})</a>
//                 </li>
//             </ul>
//             <p v-else class="info-text">Aucune consultation enregistrée.</p>
//         </section>


//       </div>
//     </div>
//   </NurseLayout>
// </template>

// <script setup>
// import { ref, onMounted, computed, watch } from 'vue'
// import { useRoute } from 'vue-router'
// import NurseLayout from '@/layouts/NurseLayout.vue'

// // IMPORT DES STORES
// import { usePatientStore } from '@/stores/patientStore'
// import { usePrescriptionStore } from '@/stores/prescriptionStore'
// import { useLabStore } from '@/stores/labStore'
// import { useConsultationStore } from '@/stores/consultationStore'
// import { useBedStore } from '@/stores/bedStore'
// import { bedApiStore } from '@/stores/api/bedApiStore'

// // INITIALISATION DES STORES
// const patientStore = usePatientStore()
// const prescriptionStore = usePrescriptionStore()
// const labStore = useLabStore()
// const consultationStore = useConsultationStore()
// const bedStore = useBedStore()
// const route = useRoute()

// // --- État Local ---
// const patientId = ref(route.params.id)
// const selectedPatient = ref(null)
// const loadingGlobal = ref(true)
// const loadingDme = ref(false)
// const isUpdating = ref(false)
// const updateError = ref(null)
// const updateSuccess = ref(null)
// const previousBedId = ref(null);

// // Formulaire pour les champs modifiables par l'infirmier
// const form = ref({
//     status: '',
//     poids: null,
//     taille: null,
//     // Note: bed_id doit être initialisé à null ou à l'ID du lit (nombre)
//     bed_id: null,
// });

// // Computed pour les données DME des Stores
// const patientPrescriptions = computed(() => prescriptionStore.prescriptions || [])
// const patientLabRequests = computed(() => labStore.labRequests || [])
// const patientConsultations = computed(() => consultationStore.patientConsultations || [])

// // Computed pour les lits disponibles regroupés
// const groupedAvailableBeds = computed(() => {
//     // Note: bedStore.getAvailableBeds DOIT exister et renvoyer la liste filtrée
//     const availableBeds = bedStore.getAvailableBeds;

//     const departmentsMap = availableBeds.reduce((acc, bed) => {
//         const department = bed.room?.department;
//         if (!department) return acc;

//         const key = department.id;
//         if (!acc[key]) {
//             acc[key] = {
//                 departmentId: key,
//                 departmentName: department.name,
//                 beds: [],
//             };
//         }
//         acc[key].beds.push(bed);
//         return acc;
//     }, {});

//     return Object.values(departmentsMap).sort((a, b) => a.departmentName.localeCompare(b.departmentName));
// });


// // --- Fonctions de Chargement ---

// async function fetchPatientData() {
//     loadingGlobal.value = true;
//     try {
//         await patientStore.fetchPatient(patientId.value);
//         selectedPatient.value = patientStore.singlePatient;

//         if (selectedPatient.value) {
//             form.value.status = selectedPatient.value.status || '';
//             form.value.poids = selectedPatient.value.poids;
//             form.value.taille = selectedPatient.value.taille;

//             // Convertir l'ID du lit en nombre s'il est une chaîne (pour éviter les problèmes de v-model)
//             form.value.bed_id = selectedPatient.value.bed_id ? Number(selectedPatient.value.bed_id) : null;

//             // Stocker l'ID du lit avant toute modification
//             previousBedId.value = form.value.bed_id;

//             // Charger les lits disponibles
//             await bedStore.fetchBeds();

//             await fetchDmeData(selectedPatient.value.id);
//         }

//     } catch (error) {
//         console.error("Erreur de chargement du patient:", error);
//         selectedPatient.value = null;
//     } finally {
//         loadingGlobal.value = false;
//     }
// }

// async function fetchDmeData(id) {
//     loadingDme.value = true;
//     try {
//         await Promise.all([
//             prescriptionStore.fetchPatientPrescriptions(id),
//             labStore.listLabRequests({ patient_id: id }),
//             consultationStore.fetchPatientConsultations(id)
//         ]);
//     } catch (e) {
//         console.error("Erreur lors du chargement des données DME:", e);
//     } finally {
//         loadingDme.value = false;
//     }
// }

// // --- Logique de Mise à Jour (pour l'Infirmier) ---

// async function updatePatientData() {
//     isUpdating.value = true;
//     updateError.value = null;
//     updateSuccess.value = null;

//     try {
//         const currentBedId = form.value.bed_id;
//         const oldBedId = previousBedId.value;

//         // --- 1. GESTION DU CHANGEMENT DE STATUT DES LITS ---

//         if (oldBedId !== currentBedId) {
//             // A. Libérer l'ancien lit (s'il y en avait un)
//             if (oldBedId) {
//                 console.log(`Libération de l'ancien lit ID: ${oldBedId}`);
//                 await bedApiStore.updateBed(oldBedId, { status: 'available' });
//             }

//             // B. Occuper le nouveau lit (s'il y en a un de sélectionné)
//             if (currentBedId) {
//                 console.log(`Occupation du nouveau lit ID: ${currentBedId}`);
//                 await bedApiStore.updateBed(currentBedId, { status: 'occupied' });
//             }
//         }


//         // --- 2. MISE À JOUR DU PATIENT ---

//         const payload = {
//             status: form.value.status,
//             poids: form.value.poids,
//             taille: form.value.taille,
//             bed_id: form.value.bed_id,
//         };

//         const response = await patientStore.updatePatient(selectedPatient.value.id, payload);

//         // --- 3. MISE À JOUR DE L'ÉTAT LOCAL APRÈS SUCCÈS ---

//         selectedPatient.value = response.patient;
//         previousBedId.value = response.patient.bed_id ? Number(response.patient.bed_id) : null;

//         // Recharger la liste des lits pour mettre à jour l'état 'disponible' dans la sélection
//         await bedStore.fetchBeds();

//         updateSuccess.value = response.message || 'Données du patient et statut du lit mis à jour avec succès.';
//         setTimeout(() => updateSuccess.value = null, 4000);

//     } catch (error) {
//         console.error("Erreur de mise à jour:", error);

//         const errorMsg = error.response?.data?.message || "Erreur lors de la sauvegarde. Vérifiez les données ou contactez l'administrateur.";
//         updateError.value = errorMsg;
//         setTimeout(() => updateError.value = null, 5000);
//     } finally {
//         isUpdating.value = false;
//     }
// }


// // --- Utilitaires (formatDate, formatDateHeure) ---

// const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' });
// }

// const formatDateHeure = (dateTimeString) => {
//     if (!dateTimeString) return 'N/A';
//     return new Date(dateTimeString).toLocaleString('fr-FR', {
//         year: 'numeric',
//         month: 'numeric',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//     });
// }

// // --- Cycle de Vie ---
// onMounted(fetchPatientData);

// // Recharger si l'ID de la route change
// watch(() => route.params.id, (newId) => {
//   if (newId) {
//     patientId.value = newId;
//     fetchPatientData();
//   }
// });
// </script>

// <style scoped>
// /* ------------------- Style Existant ------------------- */
// .patients-page { padding: 32px; background-color: #f4f7ff; min-height: 80vh; }
// .patient-details-container { background-color: #fff; border: 1px solid #e1e7f3; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); overflow: hidden; padding: 24px; }
// .loading-overlay, .placeholder { text-align: center; padding: 50px; font-size: 1.2em; color: #0040d0; }
// .details-header { font-size: 1.8em; color: #0040d0; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 3px solid #eaf0ff; display: flex; justify-content: space-between; align-items: center; }
// .inline-loader { font-size: 0.6em; color: #0040d0; }
// .card-section { background-color: #fcfdff; border: 1px solid #e1e7f3; border-radius: 8px; padding: 20px; margin-bottom: 25px; }
// .card-section h3 { color: #333; margin-bottom: 15px; font-size: 1.3em; border-bottom: 1px solid #eee; padding-bottom: 8px; }
// .nurse-edit-section { background-color: #e8f5e9; border: 1px solid #c8e6c9; }
// .edit-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 15px; }
// .form-group label { display: block; font-weight: 600; margin-bottom: 5px; color: #004d40; font-size: 0.95em; }
// .form-control { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; font-size: 1em; }
// .btn-update { background-color: #004d40; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px; transition: background-color 0.3s; font-weight: 600; }
// .btn-update:hover:not(:disabled) { background-color: #00796b; }
// .btn-update:disabled { background-color: #a7a7a7; cursor: not-allowed; }
// .success-message { color: green; margin-top: 10px; font-weight: bold; }
// .error-message { color: #c20000; margin-top: 10px; font-weight: bold; }
// .vitals-section { background-color: #fff9e6; border: 1px solid #ffe0b2; }
// .vitals-section h3 { color: #ff9800; }
// .vitals-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
// .vitals-grid p { margin: 5px 0; }
// .vitals-grid strong { color: #e65100; }
// .notes-full-width { grid-column: 1 / -1; margin-top: 10px !important; padding-top: 10px; border-top: 1px dashed #ffd54f; }
// .info-grid-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; }
// .patient-info p { margin: 5px 0; }
// .patient-info strong { color: #002580; }
// .documents-section h3 { font-size: 18px; color: #003366; margin-bottom: 10px; }
// .documents-list { list-style: none; padding: 0; }
// .document-item { margin-bottom: 8px; }
// .documents-section a { color: #0055aa; text-decoration: underline; font-weight: 500; }
// .info-text { font-style: italic; color: #6c757d; }

// /* 🔑 CORRECTION CRITIQUE POUR LE SELECTEUR DE LIT */
// /* Force le navigateur à afficher l'élément comme une liste déroulante normale */
// .form-group #bed_id {
//     -webkit-appearance: menulist !important; /* Pour Chrome, Safari, Edge */
//     -moz-appearance: menulist !important;   /* Pour Firefox */
//     appearance: menulist !important;        /* Standard */

//     /* Neutralise les styles qui imitent un input type="number" */
//     -moz-appearance: initial;
// }

// /* S'assurer que les inputs de type 'number' (poids/taille) conservent leurs styles si nécessaire */
// .form-group input[type="number"] {
//     -webkit-appearance: textfield;
//     -moz-appearance: textfield;
//     appearance: textfield;
// }
// /* ---------------------------------------------------- */
// </style>
