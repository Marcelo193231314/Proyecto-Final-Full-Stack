<template>
  <div class="container">
    <div class="header">
      <h1>Panel de Partidos</h1>
      <button class="btn-logout" @click="logout">Cerrar Sesión</button>
    </div>

    <div class="actions" v-if="isAdmin">
      <button class="btn-primary" @click="router.push('/create-match')">Crear Nuevo Partido</button>
      <button class="btn-secondary" @click="router.push('/teams')">Gestionar Equipos</button>
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
                <option value="En Juego">En Juego</option>
                <option value="Finalizado">Finalizado</option>
              </select>
              <span v-else class="status-badge">{{ match.status }}</span>
            </td>

            <td v-if="isAdmin">
              <button @click="saveChanges(match)" class="btn-save" title="Guardar">💾</button>
              <button @click="simulate(match)" class="btn-sim" title="Simular Resultado">🎲</button>
              <button @click="borrarPartido(match.id)" class="btn-delete" title="Eliminar Partido">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
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

const fetchMatches = async () => {
  try {
    const res = await api.get('/matches');
    matches.value = res.data;
  } catch (error) {
    console.error("Error al cargar partidos", error);
  }
};

const saveChanges = async (match) => {
  try {
    await api.patch(`/matches/${match.id}/status`, {
      status: match.status,
      local_score: match.local_score,
      visitor_score: match.visitor_score
    });
    alert("Guardado correctamente");
  } catch (e) { 
    alert("Error al guardar"); 
    console.error(e);
  }
};

const simulate = (match) => {
  match.local_score = Math.floor(Math.random() * 5);
  match.visitor_score = Math.floor(Math.random() * 5);
  match.status = 'Finalizado';
  saveChanges(match);
};

// NUEVA FUNCIÓN: Elimina el partido y recarga la tabla
const borrarPartido = async (id) => {
  const confirmar = confirm("¿Estás seguro de que deseas cancelar y eliminar este partido?");
  if (confirmar) {
    try {
      await api.delete(`/matches/${id}`);
      alert("Partido eliminado correctamente");
      fetchMatches(); 
    } catch (error) {
      alert("Error al eliminar el partido");
      console.error(error);
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
.score-container { display: flex; justify-content: center; align-items: center; gap: 5px; }
.score-input { width: 35px; text-align: center; border: 1px solid #ccc; border-radius: 4px; }
.btn-save, .btn-sim, .btn-delete { background: none; border: none; cursor: pointer; font-size: 1.2rem; margin: 0 5px; }
.status-select { padding: 5px; border-radius: 4px; }

.actions { margin-bottom: 15px; display: flex; gap: 10px; flex-wrap: wrap; }
.btn-primary { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
.btn-secondary { background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
.btn-danger-nav { background: #343a40; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
.btn-logout { background: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; }

button:hover { opacity: 0.9; }
</style>