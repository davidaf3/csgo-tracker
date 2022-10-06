import { createApp } from 'vue';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as VueRouter from 'vue-router';
import App from './App.vue';
import MatchesView from './components/match/MatchesView.vue';
import StatsDashboard from './components/stats/StatsDashboard.vue';

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    { path: '/', component: MatchesView },
    { path: '/matches', component: MatchesView },
    { path: '/stats', component: StatsDashboard },
  ],
});

createApp(App)
  .use(router)
  .mount('#app');
