import { createApp } from 'vue';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as VueRouter from 'vue-router';
import App from './App.vue';
import Matches from './components/match/Matches.vue';
import Stats from './components/Stats.vue';

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    { path: '/', component: Matches },
    { path: '/matches', component: Matches },
    { path: '/stats', component: Stats },
  ],
});

createApp(App)
  .use(router)
  .mount('#app');
