<template>
  <AdminLayout>
    <div class="dossier-medical">

      <div v-if="loading" class="loading-message">
        ⏳ Chargement du dossier médical...
      </div>
      <div v-else-if="patientStore.error" class="error-message">
        ❌ Erreur de chargement du patient : {{ patientStore.error }}
      </div>
      <div v-else-if="!currentPatient" class="no-data-message">
        Patient introuvable avec l'ID #{{ route.params.id }}.
      </div>

      <div v-else>
        <h2>Dossier médical de {{ patientFullName }}</h2>

        <div class="section summary-section">
          <h3>Informations Clés</h3>
          <p><strong>Sexe :</strong> {{ currentPatient.user?.genre || 'N/A' }}</p>
          <p><strong>Date de naissance :</strong> {{ currentPatient.user?.birth_date || 'N/A' }}</p>
          <p><strong>Groupe sanguin :</strong> {{ currentPatient.group_sanguine || 'N/A' }}</p>
          <p><strong>Conditions Chroniques :</strong> {{ currentPatient.maladies_chroniques || 'Aucune' }}</p>
          </div>

        <div class="section prescription-section">
          <h3>Ordonnances ({{ prescriptionStore.getPrescriptions.length }})</h3>

          <p v-if="prescriptionStore.isLoading" class="text-info">Chargement des ordonnances...</p>
          <p v-else-if="!prescriptionStore.getPrescriptions.length" class="text-info">
            Aucune ordonnance trouvée pour ce patient.
          </p>

          <ul v-else class="prescription-list">
            <li v-for="rx in prescriptionStore.getPrescriptions" :key="rx.id" class="prescription-item">
              <div class="header-info">
                📅 <strong>Ordonnance du {{ rx.date_prescription ? new Date(rx.date_prescription).toLocaleDateString() : 'Date Inconnue' }}</strong>
                (Statut: **{{ rx.status }}**)
              </div>

              <div class="detail-content">
                  <p>Médecin: **Dr. {{ rx.doctor?.user?.last_name || 'Inconnu' }}**</p>

                  <div v-if="rx.prescription_lines && rx.prescription_lines.length">
                      <p class="detail-title">Lignes d'ordonnance :</p>
                      <ul class="lines-detail">
                          <li v-for="(line, index) in rx.prescription_lines" :key="line.id || index">
                              💊 **{{ line.medication_name || 'Médicament N/A' }}**
                              ({{ line.dosage || 'Dosage N/A' }}) - {{ line.frequency || 'Fréquence N/A' }}
                              <br>
                              *Instruction :* {{ line.instructions || 'Aucune instruction' }}
                          </li>
                      </ul>
                  </div>
              </div>

            </li>
          </ul>
        </div>

        <div class="section">
          <h3>Historique général (à remplacer par Consultations/Rapports)</h3>
          <p class="text-info">Cette section sera remplacée par les données des consultations et des rapports médicaux.</p>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'

// Import des stores nécessaires
import { usePatientStore } from '@/stores/patientStore'
import { usePrescriptionStore } from '@/stores/prescriptionStore'
// Nous aurions besoin de useMedicalRecordStore pour les Allergies, mais nous allons utiliser les données disponibles sur Patient pour l'instant.

const route = useRoute()

// Initialisation des stores
const patientStore = usePatientStore()
const prescriptionStore = usePrescriptionStore()

// Récupération des états réactifs
const { currentPatient, loading: isPatientLoading } = storeToRefs(patientStore)
const loading = computed(() => isPatientLoading.value || prescriptionStore.isLoading)

// --------------------------------------------------------
// 🧠 Computed Properties
// --------------------------------------------------------

const patientFullName = computed(() => {
  const user = currentPatient.value?.user
  return user ? `${user.first_name} ${user.last_name}` : 'Patient Inconnu'
})

// --------------------------------------------------------
// 🧩 Chargement des données
// --------------------------------------------------------

const loadPatientAndPrescriptions = async (id) => {
  if (!id || isNaN(id)) {
    patientStore.setError('ID de patient non valide.');
    return;
  }

  // 1. Charger les données du patient
  await patientStore.onePatient(id);

  // 2. Charger les ordonnances du patient
  await prescriptionStore.fetchPatientPrescriptions(id);
}

// --------------------------------------------------------
// 🔁 Watch route params & Initial load
// --------------------------------------------------------

watch(() => route.params.id, (newId) => {
  const id = parseInt(newId);
  if (id && id > 0) {
    loadPatientAndPrescriptions(id);
  } else {
    patientStore.setError('ID de patient manquant ou non valide dans l’URL.');
  }
}, { immediate: true })

</script>

<style scoped>
.dossier-medical {
  max-width: 800px;
  margin: auto;
  padding: 32px;
}
.section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 25px;
}
.summary-section {
    border-left: 4px solid #007bff;
    background-color: #f7f9ff;
}
h2 {
    color: #002580;
    margin-bottom: 25px;
    border-bottom: 2px solid #0040d0;
    padding-bottom: 10px;
}
h3 {
    color: #0040d0;
    margin-top: 0;
    margin-bottom: 15px;
}
.loading-message, .error-message, .no-data-message, .text-info {
    text-align: center;
    padding: 15px;
    border-radius: 6px;
    font-weight: 600;
}
.error-message {
    color: #dc3545;
    background: #f8d7da;
    border: 1px solid #f5c6cb;
}
.prescription-list {
    list-style: none;
    padding: 0;
}
.prescription-item {
    border: 1px solid #e0e0e0;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 6px;
    background-color: #ffffff;
    border-left: 5px solid #28a745; /* Vert pour prescription */
}
.header-info strong {
    color: #28a745;
}
.lines-detail {
    list-style: disc;
    margin-left: 20px;
    margin-top: 10px;
    padding-left: 0;
}
.lines-detail li {
    background-color: transparent;
    border: none;
    padding: 4px 0;
    margin-bottom: 2px;
    font-size: 0.95em;
}
.detail-title {
    font-weight: bold;
    color: #555;
    margin-top: 10px;
    margin-bottom: 5px;
}
</style>
