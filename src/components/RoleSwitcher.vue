<template>
  <div class="role-switcher">
    <label>Changer de rôle :</label>
    <select v-model="currentRole" @change="switchRole">
      <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
    </select>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const roles = ['admin', 'medecin', 'infirmier']
const currentRole = ref('medecin')

function switchRole() {
  if (currentRole.value === 'admin') {
    router.push('/admin/dashboard')
  } else if (currentRole.value === 'medecin') {
    router.push('/medecin/dashboard')
  } else if (currentRole.value === 'infirmier') {
    router.push('/infirmier/dashboard')
  }
}
</script>
