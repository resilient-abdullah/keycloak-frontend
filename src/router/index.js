import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

const routes = [
  { path: '/', component: HomeView, meta: { auth: false } },
  { path: '/profile', component: () => import('../views/ProfileView.vue'), meta: { auth: true } }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const keycloak = window.keycloak || null;
  if (to.meta.auth && !(keycloak && keycloak.authenticated)) {
    keycloak.login();
  } else next();
});

export default router;
