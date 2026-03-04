<template>
  <div class="container">
    <div class="header">
      <h1>Panel de Partidos</h1>
      <button class="btn-logout" @click="logout">Cerrar Sesión</button>
    </div>

    <div class="actions" v-if="isAdmin">
      <button class="btn-primary" @click="router.push('/create-match')">Crear Nuevo Partido</button>
      <button class="btn-secondary" @click="router.push('/teams')">Ver Equipos</button>
    </div>

    <div class="filter-bar">
      <label>Filtrar por Estado: </label>
      <select v-model="filterStatus" @change="aplicarFiltro" class="filter-select">
        <option value="">Todos los partidos</option>
        <option value="Pendiente">Pendiente</option>
        <option value="Finalizado">Finalizado</option>
      </select>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Local</th>
            <th>Resultado</th>
            <th>Visitante</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th v-if="isAdmin">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="match in matches" :key="match.id">
            <td>{{ match.id }}</td>
            <td><strong>{{ match.local_team_name }}</strong></td>
            
            <td>
              <div v-if="isAdmin" class="score-container">
                <input type="number" v-model="match.local_score" class="score-input">
                <span>-</span>
                <input type="number" v-model="match.visitor_score" class="score-input">
              </div>
              <div v-else class="score-text">
                {{ match.local_score }} - {{ match.visitor_score }}
              </div>
            </td>

            <td><strong>{{ match.visitor_team_name }}</strong></td>
            <td>{{ formatDate(match.match_date) }}</td>
            
            <td>
              <select v-if="isAdmin" v-model="match.status" class="status-select">
                <option value="Pendiente">Pendiente</option>
                <option value="Finalizado">Finalizado</option>
              </select>
              <span v-else class="status-badge">{{ match.status }}</span>
            </td>

            <td v-if="isAdmin">
              <button @click="saveChanges(match)" class="btn-save" title="Guardar">💾</button>
              <button @click="simulate(match)" class="btn-sim" title="Simular">🎲</button>
              <button @click="borrarPartido(match.id)" class="btn-delete" title="Eliminar">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button :disabled="currentPage === 1" @click="cambiarPagina(currentPage - 1)" class="btn-page">⬅ Anterior</button>
      <span class="page-info">Página {{ currentPage }} de {{ totalPages || 1 }}</span>
      <button :disabled="currentPage === totalPages || totalPages === 0" @click="cambiarPagina(currentPage + 1)" class="btn-page">Siguiente ➡</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import api from '../services/api';

const authStore = useAuthStore();
const router = useRouter();
const matches = ref([]);

const isAdmin = computed(() => authStore.user?.role === 'admin');

// Estado de paginación y filtros
const currentPage = ref(1);
const totalPages = ref(1);
const filterStatus = ref('');

const fetchMatches = async () => {
  try {
    // Enviamos página, límite de 5 y el filtro de estado
    const res = await api.get(`/matches?page=${currentPage.value}&limit=5&status=${filterStatus.value}`);
    matches.value = res.data.data;
    totalPages.value = res.data.totalPages;
  } catch (error) {
    console.error("Error al cargar partidos", error);
  }
};

const aplicarFiltro = () => {
  currentPage.value = 1;
  fetchMatches();
};

const cambiarPagina = (nuevaPagina) => {
  currentPage.value = nuevaPagina;
  fetchMatches();
};

const saveChanges = async (match) => {
  try {
    await api.patch(`/matches/${match.id}/status`, {
      status: match.status,
      local_score: match.local_score,
      visitor_score: match.visitor_score
    });
    alert("Partido actualizado");
  } catch (e) {
    alert("Error al actualizar");
  }
};

const simulate = (match) => {
  match.local_score = Math.floor(Math.random() * 5);
  match.visitor_score = Math.floor(Math.random() * 5);
  match.status = 'Finalizado'; // Simulación directa a finalizado
  saveChanges(match);
};

const borrarPartido = async (id) => {
  if (confirm("¿Estás seguro de eliminar este partido?")) {
    try {
      await api.delete(`/matches/${id}`);
      fetchMatches();
    } catch (error) {
      alert("Error al eliminar partido");
    }
  }
};

const formatDate = (str) => {
  if (!str) return '';
  return new Date(str).toLocaleString('es-ES', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
};

onMounted(fetchMatches);

const logout = () => { 
  authStore.logout(); 
  router.push('/login'); 
};
</script>

<style scoped>
.container { max-width: 1000px; margin: 40px auto; font-family: sans-serif; }
.header { display: flex; justify-content: space-between; margin-bottom: 20px; align-items: center; }
.table-wrapper { background: white; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 15px; border-bottom: 1px solid #eee; text-align: center; }
.score-input { width: 40px; text-align: center; border-radius: 4px; border: 1px solid #ccc; }
.filter-bar { margin-bottom: 15px; background: #f4f4f4; padding: 15px; border-radius: 8px; }
.pagination { display: flex; justify-content: center; align-items: center; margin-top: 20px; gap: 15px; }
.btn-page { padding: 8px 16px; cursor: pointer; background: #6c757d; color: white; border: none; border-radius: 4px; }
.btn-page:disabled { background: #ccc; }
.btn-primary { background: #007bff; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer; margin-right: 5px; }
.btn-secondary { background: #28a745; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer; }
.btn-logout { background: #dc3545; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; }
</style>