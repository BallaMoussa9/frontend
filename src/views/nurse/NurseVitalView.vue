<template>
  <NurseLayout>
    <div class="nurse-vitals">
      <h2>Enregistrement des signes vitaux</h2>
      <form class="vital-form">
        <label>Patient
          <select>
            <option>Fatou T.</option>
            <option>Moussa K.</option>
            <option>Bintou S.</option>
          </select>
        </label>

        <label>Température (°C)
          <input type="number" step="0.1" />
        </label>

        <label>Tension artérielle (mmHg)
          <input type="text" placeholder="ex : 120/80" />
        </label>

        <label>Fréquence cardiaque (bpm)
          <input type="number" />
        </label>

        <label>SpO2 (%)
          <input type="number" />
        </label>

        <button type="submit">Enregistrer</button>
      </form>
    </div>
  </NurseLayout>
</template>

<script setup>
import NurseLayout from '@/layouts/NurseLayout.vue'
</script>

<style scoped>
.nurse-vitals {
  padding: 24px;
  background-color: #f5f8fa;
  border-radius: 10px;
  max-width: 600px;
}

.vital-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

label {
  display: flex;
  flex-direction: column;
  font-weight: 600;
}

input, select {
  margin-top: 6px;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

button {
  margin-top: 12px;
  padding: 10px;
  background-color: #0057d8;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
