import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from '../src/App.vue';
import router from '../router';
import { useAuthStore } from '@/stores/authStores';
import './assets/responsive.css';
const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

const authStore = useAuthStore();

// ⚡ Attendre l'initialisation avant de monter l'app
authStore.initializeAuth().then(() => {
  app.use(router);
  app.mount('#app');
});
