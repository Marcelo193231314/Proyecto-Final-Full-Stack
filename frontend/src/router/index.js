import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import MatchesView from '../views/MatchesView.vue';
import MatchFormView from '../views/MatchFormView.vue';
import TeamsView from '../views/TeamsView.vue';
import StandingsView from '../views/StandingsView.vue'; // <-- IMPORTAMOS LA VISTA AQUÍ
import { useAuthStore } from '../stores/auth';
import AdminDashboardView from '../views/AdminDashboardView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/',
      name: 'matches',
      component: MatchesView,
      meta: { requiresAuth: true }
    },
    {
      path: '/standings', // <-- AGREGAMOS LA RUTA AQUÍ
      name: 'standings',
      component: StandingsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/create-match',
      name: 'create-match',
      component: MatchFormView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/teams',
      name: 'teams',
      component: TeamsView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/users',
      name: 'manage-users',
      component: AdminDashboardView,
      meta: { requiresAuth: true, requiresAdmin: true }
    }
  ]
});

router.beforeEach((to, from) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.token) {
    return '/login';
  } 
  else if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    return '/'; 
  } 
});

export default router;