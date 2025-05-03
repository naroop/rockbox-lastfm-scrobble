import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import App from './App.vue';
import router from './router';

import './tailwind.css';

const app = createApp(App);
const pinia = createPinia();

import {} from '@fortawesome/free-regular-svg-icons';
library.add();

app.use(router);
app.use(pinia);
app.use(PrimeVue, { theme: { preset: Aura } });
app.component('font-awesome-icon', FontAwesomeIcon);
app.mount('#app');
