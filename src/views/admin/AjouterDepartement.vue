<template>
  <AdminLayout>
    <div class="form-container">
      <h2>Ajouter un Département</h2>
      <form @submit.prevent="submit">
        <input v-model="form.name" placeholder="Nom du département" />
        <input v-model="form.description" placeholder="Description" />
        <input v-model="form.position" placeholder="Poste associé (Cardiologie...)" />

        <select v-model="form.status">
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
        </select>

        <label for="doctor-select">Médecin responsable :</label>

        <select id="doctor-select" v-model="form.doctor_id">
          <option :value="null" disabled>Sélectionner un médecin</option>
          <option
            v-for="doctor in doctorStore.doctors"
            :key="doctor.id"
            :value="doctor.id"
          >
            {{ doctor.user.first_name }} {{ doctor.user.last_name }} ({{ doctor.speciality }})
          </option>
        </select>

        <button class="submit">Ajouter</button>
      </form>
    </div>
  </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/layouts/AdminLayout.vue'
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDepartmentStore } from '@/stores/departmentStore'
import { useDoctorStore } from '@/stores/doctorStore'

const router = useRouter()
const departmentStore = useDepartmentStore()
const doctorStore = useDoctorStore()

const form = reactive({
  name: '',
  description: '',
  position: '',
  status: 'active',
  doctor_id: null
})

onMounted(async () => {
  await doctorStore.fetchAllDoctors();
  // Optionnel : si doctorStore.doctors peut être paginé, assurez-vous de prendre la bonne propriété
  // console.log("Docteurs chargés:", doctorStore.doctors.data || doctorStore.doctors);
});

const submit = async () => {
  try {
    // --- ✅ AJOUT DU LOG DE DÉBOGAGE ICI ---
    console.log("Données envoyées au backend:", form);
    // ------------------------------------

    // Vérifier si la liste des docteurs est paginée
    const doctorsData = doctorStore.doctors.data || doctorStore.doctors;

    // S'assurer que le doctor_id est valide s'il est fourni
    if (form.doctor_id !== null) {
        const selectedDoctor = doctorsData.find(d => d.id === form.doctor_id);
        if (!selectedDoctor) {
            // Cette erreur indique que l'ID sélectionné n'est pas dans la liste chargée.
            // Cela pourrait arriver si la liste est vide, ou si l'ID est invalide.
            throw new Error('Médecin sélectionné introuvable dans la liste chargée.');
        }
    }

    await departmentStore.createDepartment(form)
    alert('Département créé avec succès !')
    router.push({ name: 'Departments' }) // Assurez-vous que le nom de la route est 'Departments' ou 'Departements'
  } catch (error) {
    console.error("Erreur détaillée lors de la création du département:", error); // Log détaillé de l'erreur
    alert('Échec de la création du département : ' + (error.response?.data?.message || error.message));
  }
}
</script>

<style scoped>
@import './FormStyle.css';

/* Vos styles CSS existants */
.form-container {
  max-width: 600px;
  margin: auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-container h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

input,
select {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  width: 100%;
}

.submit {
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
}

.submit:hover {
  background-color: #0056b3;
}

label {
  font-size: 14px;
  color: #555;
  margin-top: 10px;
}
</style>
