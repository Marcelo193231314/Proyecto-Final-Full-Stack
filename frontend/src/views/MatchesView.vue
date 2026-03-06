<template>
  <div class="stadium-bg">
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div class="title-section">
          <h1 class="text-white">Panel de Partidos</h1>
          <p class="subtitle text-green-light">Visualiza y administra los partidos registrados</p>
        </div>
      </div>

      <div class="toolbar" v-if="isAdmin">
        <div class="admin-actions">
          <button class="btn btn-primary" @click="router.push('/create-match')"> Programar Partido</button>
          <button class="btn btn-secondary" @click="router.push('/teams')">Ver Equipos</button>
        </div>
      </div>

      <div class="glass-card filter-card">
        <label class="filter-label">Estado:</label>
        <select v-model="filterStatus" @change="aplicarFiltro" class="form-select">
          <option value="">Todos los partidos</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Finalizado">Finalizado</option>
        </select>
      </div>

      <div class="table-card">
        <table class="modern-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Local</th>
              <th>Marcador</th>
              <th>Visitante</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th v-if="isAdmin">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="match in matches" :key="match.id">
              <td class="text-muted">#{{ match.id }}</td>
              <td class="team-cell"><strong class="team-name">{{ match.local_team_name }}</strong></td>
              
              <td>
                <div v-if="isAdmin" class="score-editor">
                  <input type="number" v-model="match.local_score" class="score-input">
                  <span class="score-divider">-</span>
                  <input type="number" v-model="match.visitor_score" class="score-input">
                </div>
                <div v-else class="score-display">
                  {{ match.local_score }} - {{ match.visitor_score }}
                </div>
              </td>

              <td class="team-cell"><strong class="team-name">{{ match.visitor_team_name }}</strong></td>
              <td class="date-cell">📅 {{ formatDate(match.match_date) }}</td>
              
              <td>
                <select v-if="isAdmin" v-model="match.status" class="form-select status-select">
                  <option value="Pendiente">Pendiente</option>
                  <option value="Finalizado">Finalizado</option>
                </select>
                <span v-else class="status-badge" :class="{'badge-pending': match.status === 'Pendiente', 'badge-finished': match.status === 'Finalizado'}">
                  {{ match.status }}
                </span>
              </td>

              <td v-if="isAdmin" class="actions-cell">
                <button @click="saveChanges(match)" class="action-btn btn-save" title="Guardar cambios">💾</button>
                <button @click="simulate(match)" class="action-btn btn-sim" title="Simular resultado">🎲</button>
                <button @click="borrarPartido(match.id)" class="action-btn btn-delete" title="Eliminar partido">❌</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-container glass-card">
        <button :disabled="currentPage === 1" @click="cambiarPagina(currentPage - 1)" class="btn-page">⬅ Anterior</button>
        <span class="page-indicator text-white">Página {{ currentPage }} de {{ totalPages || 1 }}</span>
        <button :disabled="currentPage === totalPages || totalPages === 0" @click="cambiarPagina(currentPage + 1)" class="btn-page">Siguiente ➡</button>
      </div>
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
const currentPage = ref(1);
const totalPages = ref(1);
const filterStatus = ref('');

const fetchMatches = async () => {
  try {
    const res = await api.get(`/matches?page=${currentPage.value}&limit=5&status=${filterStatus.value}`);
    matches.value = res.data.data;
    totalPages.value = res.data.totalPages;
  } catch (error) {
    console.error("Error al cargar partidos", error);
  }
};

const aplicarFiltro = () => { currentPage.value = 1; fetchMatches(); };
const cambiarPagina = (nuevaPagina) => { currentPage.value = nuevaPagina; fetchMatches(); };

const saveChanges = async (match) => {
  try {
    await api.patch(`/matches/${match.id}/status`, { status: match.status, local_score: match.local_score, visitor_score: match.visitor_score });
    alert("Marcador actualizado con éxito.");
  } catch (e) { alert("Error al actualizar la información."); }
};

const simulate = (match) => {
  match.local_score = Math.floor(Math.random() * 5);
  match.visitor_score = Math.floor(Math.random() * 5);
  match.status = 'Finalizado';
  saveChanges(match);
};

const borrarPartido = async (id) => {
  if (confirm("¿Estás seguro de que deseas eliminar este registro?")) {
    try {
      await api.delete(`/matches/${id}`);
      fetchMatches();
    } catch (error) { alert("Error al eliminar el partido."); }
  }
};

const formatDate = (str) => {
  if (!str) return '';
  return new Date(str).toLocaleString('es-ES', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
};

onMounted(fetchMatches);
// Quité la función logout de aquí porque ya la tienes en el App.vue (barra superior)
</script>

<style scoped>
/* --- FONDO LIMPIO SIN IMAGEN --- */
.stadium-bg { 
  min-height: 100vh; 
  background-color: #0f172a; /* Fondo oscuro y elegante */
  padding: 40px 0; 
}

.dashboard-container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }
.dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.text-white { color: #ffffff !important; }
.text-green-light { color: #a7f3d0 !important; }
.title-section h1 { margin: 0; font-size: 32px; text-transform: uppercase; }
.subtitle { margin: 5px 0 0 0; font-size: 16px; font-weight: 500; }

.glass-card { 
  background: rgba(255, 255, 255, 0.05); 
  border-radius: 12px; 
  box-shadow: 0 10px 30px rgba(0,0,0,0.3); 
  border: 1px solid rgba(255, 255, 255, 0.1); 
}

.btn { padding: 12px 20px; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 14px; text-transform: uppercase; }
.btn-primary { background: #10b981; color: white; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3); }
.btn-primary:hover { background: #059669; transform: translateY(-2px); }
.btn-secondary { background: rgba(255,255,255,0.9); color: #064e3b; border: 2px solid #10b981; }
.btn-secondary:hover { background: #ffffff; }

.toolbar { margin-bottom: 20px; display: flex; gap: 15px; }
.admin-actions { display: flex; gap: 10px; }

.filter-card { padding: 15px 20px; margin-bottom: 20px; display: flex; align-items: center; gap: 15px; border-left: 5px solid #10b981; background: rgba(30, 41, 59, 0.8) !important; color: white;}
.filter-label { font-weight: 700; color: #ffffff; font-size: 15px; text-transform: uppercase; }
.form-select { padding: 10px; border: 2px solid #cbd5e1; border-radius: 8px; font-weight: 600; color: #1e293b; outline: none; background: white;}
.form-select:focus { border-color: #10b981; }

.table-card { 
  overflow-x: auto; 
  background: rgba(30, 41, 59, 0.8); 
  border-radius: 12px; 
  box-shadow: 0 10px 30px rgba(0,0,0,0.4); 
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modern-table { width: 100%; border-collapse: collapse; text-align: center; }
.modern-table th { background-color: rgba(6, 78, 59, 0.85); padding: 18px; font-size: 13px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 1px; }

.modern-table td { padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: middle; }
.modern-table tr:hover { background-color: rgba(255, 255, 255, 0.05); }

.text-muted { color: #94a3b8; font-size: 14px; font-weight: 700; }
.team-name { color: #ffffff; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
.date-cell { font-size: 14px; color: #cbd5e1; font-weight: 600; }

.score-editor { display: flex; align-items: center; justify-content: center; gap: 8px; }
.score-input { width: 50px; height: 40px; text-align: center; border-radius: 8px; border: 2px solid #10b981; background: #ffffff; font-weight: 800; font-size: 16px; color: #0f172a; }
.score-input:focus { outline: none; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2); }
.score-divider { font-weight: bold; color: #94a3b8; }
.score-display { font-size: 20px; font-weight: 900; color: #ffffff; background: #1e293b; padding: 8px 16px; border-radius: 8px; display: inline-block; letter-spacing: 2px; border: 1px solid rgba(255,255,255,0.1); }

.status-badge { padding: 8px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; display: inline-block; text-transform: uppercase; }
.badge-pending { background-color: rgba(16, 185, 129, 0.2); color: #34d399; animation: pulse-live 2s infinite; }
.badge-finished { background-color: rgba(148, 163, 184, 0.2); color: #94a3b8; }

.actions-cell { display: flex; gap: 8px; justify-content: center; }
.action-btn { background: #f8fafc; border: none; border-radius: 8px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; font-size: 18px; }
.action-btn:hover { transform: translateY(-3px); box-shadow: 0 4px 6px rgba(0,0,0,0.3); background: #ffffff; }

.pagination-container { display: flex; justify-content: center; align-items: center; margin-top: 25px; gap: 20px; padding: 15px; }
.btn-page { padding: 10px 20px; cursor: pointer; background: #10b981; color: #ffffff; border: none; border-radius: 8px; font-weight: 700; transition: all 0.2s; text-transform: uppercase; }
.btn-page:hover:not(:disabled) { background: #059669; transform: scale(1.05); }
.btn-page:disabled { background: #475569; cursor: not-allowed; transform: none; color: #94a3b8;}
</style>