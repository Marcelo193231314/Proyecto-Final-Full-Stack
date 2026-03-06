<template>
  <div id="app">
    <nav v-if="authStore.token" class="main-nav">
      <div class="nav-links">
        <router-link to="/" class="nav-item">⚽ Partidos</router-link>
        <router-link to="/standings" class="nav-item">🏆 Tabla de Posiciones</router-link>
        <router-link v-if="authStore.user?.role === 'admin'" to="/teams" class="nav-item">🛡️ Equipos</router-link>
      </div>
      <button @click="handleLogout" class="logout-btn">Cerrar Sesión</button>
    </nav>

    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: #f4f6f9;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

/* Estilos cremosos para el menú de navegación */
.main-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #2c3e50;
  padding: 15px 30px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-item {
  color: white;
  text-decoration: none;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.nav-item:hover, .nav-item.router-link-active {
  background-color: #34495e;
  color: #3498db;
}

.logout-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: #c0392b;
}

.main-content {
  padding: 20px;
}
</style>