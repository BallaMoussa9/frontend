import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../src/views/AcceuilView.vue'),
  },
  {
    path: '/connection',
    name: 'Login',
    component: () => import('../src/views/ConnectionView.vue'),
  },
  {
    path: '/inscription',
    name: 'Register',
    component: () => import('../src/views/InscriptionView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'Page404',
    component: () => import('../src/views/Page404View.vue'),
  },
  {
    path: '/AdminDashboards',
    name: 'AdminDashboard',
    component: () => import('../src/views/admin/DashboardAdminView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/gerer-services',
    name: 'Service',
    component: () => import('../src/views/admin/GererServicesView.vue'),
  },
  {
    path: '/admin/parametres',
    name: 'Settings',
    component: () => import('../src/views/admin/AdminSettingsView.vue'),
  },
  {
    path: '/admin/add-role',
    name: 'AddRole',
    component: () => import('../src/views/admin/AddRoleView.vue'),
  },
  {
    path: '/admin/sauvegarde',
    name: 'Backup',
    component: () => import('../src/views/admin/SystemSavageView.vue'),
  },
  {
    path: '/admin/Statistique',
    name: 'Statistique',
    component: () => import('../src/views/admin/StatistiquesRegionales.vue'),
  },
  {
    path: '/admin/MedicalRecord',
    name: 'MedicalRecord',
    component: () => import('../src/views/admin/GererDossiers.vue'),
  },
  {
    path: '/admin/MedicalReport',
    name: 'MedicalReport',
    component: () => import('../src/views/admin/GererRapports.vue'),
  },
  {
    path: '/admin/Doctor',
    name: 'Doctor',
    component: () => import('../src/views/admin/GererDoctorView.vue'),
  },
  {
    path: '/admin/Message',
    name: 'Message',
    component: () => import('../src/views/admin/GererDoctorView.vue'),
  },
  {
    path: '/admin/Dialogue',
    name: 'Dialogue',
    component: () => import('../src/views/admin/Conversations.vue'),
  },
  {
    path: '/admin/Notification',
    name: 'Notification',
    component: () => import('../src/views/admin/Notifications.vue'),
  },
  {
    path: '/admin/Laboratoire',
    name: 'Laboratoire',
    component: () => import('../src/views/admin/GererLaboratoire.vue'),
  },

  {
    path: '/admin/Department',
    name: 'Department', 
    component: () => import('../src/views/admin/GererDepartements.vue'),
  },
  {
    path: '/admin/Urgence',
    name: 'Urgence',
    component: () => import('../src/views/admin/GererUrgentistes.vue'),
  },
  {
    path: '/admin/Nurse',
    name: 'Nurse',
    component: () => import('../src/views/admin/GereInfirmier.vue'),
  },
  {
    path: '/admin/Patient',
    name: 'Patient',
    component: () => import('../src/views/admin/GererPatients.vue'),
  },
  {
    path: '/admin/EditeUser',
    name: 'EditeUser',
    component: () => import('../src/views/admin/EditUtilisateur.vue'),
  },
  {
    path: '/admin/AddUserDoctor',
    name: 'AddUserDoctor',
    component: () => import('../src/views/admin/AjouterMedecin.vue'),
  },
  {
    path: '/admin/AddUserNurse',
    name: 'AddUserNurse',
    component: () => import('../src/views/admin/AjouterInfirmier.vue'),
  },
  {
    path: '/admin/AddUserPatient',
    name: 'AddUserPatient',
    component: () => import('../src/views/admin/AjouterPatient.vue'),
  },
  {
    path: '/admin/AddUserUrgentist',
    name: 'AddUserUrgentist',
    component: () => import('../src/views/admin/AjouterUrgentiste.vue'),
  },
  {
    path: '/admin/AddUserDepartment',
    name: 'AddUserDepartment',
    component: () => import('../src/views/admin/AjouterDepartement.vue'),
  },
  {
    path: '/admin/AddUserDossier',
    name: 'AddUserDossier',
    component: () => import('../src/views/admin/AjouterDossierMedical.vue'),
  },
  {
    path: '/admin/AddUserRapport',
    name: 'AddUserRapport',
    component: () => import('../src/views/admin/AjouterRapportMedical.vue'),
  },
  {
    path: '/admin/AddUserLabTechnicians',
    name: 'AddUserLabTechnicians',
    component: () => import('../src/views/admin/AjouterLabTchnicians.vue'),
  },
{
  path: '/admin/SeenDossiert/:id',
  name: 'SeenDossiert',
  component: () => import('../src/views/admin/VoirDossierMedical.vue'),
  props: true,
  meta: { requiresAuth: true, role: 'admin' },

},
{
  path: '/admin/SeenRapport/',
  name: 'SeenRapport',
  component: () => import('../src/views/admin/VoirRapportMedical.vue'),
},
{
    path: '/admin/SearchAll',
    name: 'SearchAll',
    component: () => import('../src/views/admin/RechercheGlobale.vue'),
  },
  {
    path: '/admin/EditRapport',
    name: 'EditRapport',
    component: () => import('../src/views/admin/EditMedicalReport.vue'),
  },
  {
    path: '/admin/EditMedicalRecord/:id/edit',
    name: 'EditMedicalRecord',
    component: () => import('../src/views/admin/EditMedicalRecord.vue'),
  },
  {
    path: '/admin/EditNurse/:id/edit',
    name: 'EditNurse',
    component: () => import('../src/views/admin/EditNurse.vue'),
    props: true,
  },
  {
    path: '/admin/EditLabTech/:id/edit',
    name: 'EditLabTech',
    component: () => import('../src/views/admin/EditLabTechnician.vue'),
  },
  {
    path: '/admin/EditDepartment/:id/edit',
    name: 'EditDepartment',
    component: () => import('../src/views/admin/Editdepartment.vue'),
  },
  {
    path: '/admin/EditUrgentist/:id/edit',
    name: 'EditUrgentist',
    component: () => import('../src/views/admin/EditUrgentist.vue'),
    props:true
  },
  {
    path: '/admin/EditUser/:id',
    name: 'EditUser',
    component: () => import('../src/views/admin/EditUtilisateur.vue'),
    props: true,
  },
  {
    path: '/admin/EditPatient/:id/edit',
    name: 'EditPatient',
    component: () => import('../src/views/admin/EditPatientView.vue'),
  },
   {
    path: '/admin/doctors/:id/edit', // <-- CE CHEMIN DOIT INCLURE LE PARAMÈTRE :id
    name: 'EditDoctor',             // Le nom de la route, 'EditDoctor' est ok si vous le laissez comme ça
    component: () => import('../src/views/admin/EditDoctor.vue'), // <-- Assurez-vous du chemin exact vers votre EditDoctor.vue
    props: true                     // <-- Indique à Vue Router de passer l'ID comme une prop au composant
  },

  //---------------------Doctor-------------------
  {
    path: '/doctor/dashboard/:id',
    name: 'DoctorDashboard',
    component: () => import('../src/views/doctor/DoctorDashboard.vue'),
    props: true,
    meta: { requiresAuth: true, role: 'doctor' },
  },
  {
    path: '/doctor/appointments/:id',
    name: 'Appointments',
    component: () => import('../src/views/doctor/AppointmentView.vue'),
    meta: { requiresAuth: true, role: 'doctor' },
    props: true,
  },
  {
    path: '/doctor/patients/:id',
    name: 'Patients',
    component: () => import('../src/views/doctor/PatientView.vue'),
    props: true,
    meta: { requiresAuth: true, role: 'doctor' },
  },
  {
    path: '/doctor/prescriptions/:id',
    name: 'Ordonnances',
    component: () => import('../src/views/doctor/Ordonnances.vue'),
    props: true,
    meta: { requiresAuth: true, role: 'doctor' },
  },
  {
    path: '/doctor/AlertSOS',
    name: 'AlertSOS',
    component: () => import('../src/views/doctor/AlertSOS.vue'),
  },
  {
    path: '/doctor/RapportsView/:id',
    name: 'RapportsView',
    component: () => import('../src/views/doctor/RapportsView.vue'),
    props: true,
    meta: { requiresAuth: true, role: 'doctor' },
  },
  {
    path: '/medecin/teleconsultation/:id',
    name: 'TeleConsultation',
    component: () => import('../src/views/doctor/Teleconsultation.vue'),
    props: true,
    meta: { requiresAuth: true, role: 'doctor' },
  },
  {
    path: '/doctor/FichePatient/:id',
    name: 'FichePatient',
    component: () => import('../src/views/doctor/FichePatient.vue'),
    props: true,
    meta: { requiresAuth: true, role: 'doctor' },
  },
  {
    // '/doctor/chat/:patientId',
    path: '/doctor/chat/:id',
    name: 'Messagerie',
    component: () => import('@/views/doctor/MessagerieView.vue'),
    props: true,
    meta: {
      requiresAuth: true,
      role: 'doctor',
    },
  },

  //----------------------Nurse---------------------------------------

 {
    path: '/profile',
    name: 'Profile',
    component: () => import('../src/views/ProfileView.vue'), // Chemin relatif conservé
  },
  {
    path: '/nurse/dashboard/:id',
    name: 'NurseDashboard',
    component: () => import('@/views/nurse/NurseDashboardView.vue'),
    meta: { requiresAuth: true, role: 'nurse' },
    props: true,
  }, 
  {
    path: '/nurse/patients/:id',
    name: 'PatientList',
    component: () => import('@/views/nurse/PatientListView.vue'), // Utilisez le composant que vous avez nommé
    meta: { requiresAuth: true, role: 'nurse' },
    props: true,
  }, 
  {
  path: '/nurse/:idNurse/patient/:idPatient',
  name: 'NursePatientDetails',
  component: () => import('@/views/nurse/PatientDetailsView.vue'),
},
  {
    path: '/nurse/vitals/:id',
    name: 'VitalSignsForm',
    component: () => import('@/views/nurse/VitalSignsFormView.vue'),
    meta: { requiresAuth: true, role: 'nurse' },
    props: true,
  },
  {
    path: '/nurse/notes/:id',
    name: 'CareNotes',
    component: () => import('@/views/nurse/CareNotesView.vue'),
    meta: { requiresAuth: true, role: 'nurse' }, 
    props: true,
  },
  {
    path: '/nurse/blood-bank/:id',
    name: 'BloodBank',
    component: () => import('@/views/lab/BloodBankView.vue'),
    meta: { requiresAuth: true, role: 'nurse' },
    props: true,
  },
  {
    path: '/nurse/reports/:id',
    name: 'ActivityReport',
    component: () => import('@/views/nurse/ActivityReportView.vue'),
    meta: { requiresAuth: true, role: 'nurse' },
    props: true,
  },
  {
    path: '/nurse/noticeboard/:id',
    name: 'NoticeBoard',
    component: () => import('@/views/nurse/NoticeBoardView.vue'),
    meta: { requiresAuth: true, role: 'nurse' },
    props:true,
  },
  {
    path: '/nurse/profile/:id',
    name: 'NurseProfile',
    component: () => import('@/views/nurse/NurseProfileView.vue'),
    meta: { requiresAuth: true, role: 'nurse' },
    props: true,
  },
 

  //------------------------------------------Patient
  {
    path: '/patient/dashboard/:id',
    name: 'PatientDashboard',
    component: () => import('@/views/patient/PatientDashboardView.vue'),
    props: true,
    //meta: { requiresAuth: true, role: 'patient' },
  },
  {
    path: '/patient/profile/:id',
    name: 'PatientProfile',
    component: () => import('@/views/patient/PatientProfile.vue'),
    meta: { requiresAuth: true, role: 'patient' },
    props: true,
  },
  {
    path: '/patient/appointments/:id',
    name: 'Appointment',
    component: () => import('@/views/patient/AppointmentView.vue'),
    meta: { requiresAuth: true, role: 'patient' },
    props: true,
  },
  {
    path: '/patient/history/:id',
    name: 'MedicalHistory',
    component: () => import('@/views/patient/MedicalHistoryView.vue'),
    meta: { requiresAuth: true, role: 'patient' },
    props: true,
  } /*
  {
    path: '/patient/Teleconsultation',
    name: 'Teleconsultation',
    component: () => import('@/views/patient/TeleconsultationView.vue'),
    meta: { requiresAuth: true, role: 'patient' },
  },*/,
  {
    path: '/patient/sos/:id',
    name: 'SosAlert',
    component: () => import('@/views/patient/SosAlertView.vue'),
     meta: { requiresAuth: true, role: 'patient' },
    props: true,
  },
  {
    path: '/patient/messages/:id',
    name: 'MessagePatient',
    component: () => import('@/views/patient/MessagePatientView.vue'),
    meta: { requiresAuth: true, role: 'patient' },
    props: true,
  },
  //-----------------------urgentiste---------------------------------
  {
      path: '/urgentiste/dashboard/:id',
      name: 'UrgentisteDashboard',
      component: () => import('@/views/urgentist/UrgentisteDashboard.vue'),
      meta: { requiresAuth: true, requiredRole: 'urgentist' }, // S'assurer que seul l'urgentiste y accède
      props:true,
    },
    {
    path: '/urgentiste/:urgentistId/alerte/:alertId', // Notez les noms clairs des paramètres
    name: 'AlerteDetail',
    component: () => import('@/views/urgentist/AlerteDetailView.vue'),
    meta: { requiresAuth: true, requiredRole: 'urgentist' },
    props: true, // Ceci transmettra urgentistId et alertId comme props au composant
  },
    {
      path: '/urgentiste/historique/:id',
      name: 'UrgentisteHistorique',
      component: () => import('@/views/urgentist/HistoriqueView.vue'),
      meta: { requiresAuth: true, requiredRole: 'urgentist' },
      props:true,
    },
    {
      path: '/urgentiste/profile/:id',
      name: 'UrgentisteProfile',
      component: () => import('@/views/urgentist/ProfileView.vue'),// C'est ici que le composant est lié
      meta: { requiresAuth: true, requiredRole: 'urgentist' },
      props:true,
    },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
