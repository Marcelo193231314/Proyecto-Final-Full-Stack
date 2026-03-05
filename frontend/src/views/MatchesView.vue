<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div class="title-section">
        <h1 class="text-white"><span class="anim-ball">⚽</span> Panel de Partidos</h1>
        <p class="subtitle text-green-light">Gestiona y visualiza la jornada de la liga</p>
      </div>
      <button class="btn btn-danger" @click="logout">Salir al Vestidor</button>
    </div>

    <div class="toolbar" v-if="isAdmin">
      <div class="admin-actions">
        <button class="btn btn-primary" @click="router.push('/create-match')">➕ Programar Partido</button>
        <button class="btn btn-secondary" @click="router.push('/teams')">🛡️ Ver Equipos</button>
      </div>
    </div>

    <div class="filter-card">
      <label class="filter-label">Filtro de Jornada:</label>
      <select v-model="filterStatus" @change="aplicarFiltro" class="form-select">
        <option value="">🏆 Todos los encuentros</option>
        <option value="Pendiente">⏱️ Por Jugar (Pendiente)</option>
        <option value="Finalizado">🏁 Finalizado</option>
      </select>
    </div>

    <div class="table-card">
      <table class="modern-table">
        <thead>
          <tr>
            <th>Juego</th>
            <th>Local</th>
            <th>Marcador</th>
            <th>Visitante</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th v-if="isAdmin">VAR / Árbitro</th>
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
                {{ match.status === 'Pendiente' ? '⏱️ Pendiente' : '🏁 Finalizado' }}
              </span>
            </td>

            <td v-if="isAdmin" class="actions-cell">
              <button @click="saveChanges(match)" class="action-btn btn-save" title="Pitar Final / Guardar">哨</button>
              <button @click="simulate(match)" class="action-btn btn-sim" title="Simular Partido">🎲</button>
              <button @click="borrarPartido(match.id)" class="action-btn btn-delete" title="Anular Partido">❌</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination-container">
      <button :disabled="currentPage === 1" @click="cambiarPagina(currentPage - 1)" class="btn-page">⬅ Anterior</button>
      <span class="page-indicator">Jornada {{ currentPage }} de {{ totalPages || 1 }}</span>
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
    alert("⚽ ¡Marcador actualizado con éxito!");
  } catch (e) { alert("Error al actualizar"); }
};

const simulate = (match) => {
  match.local_score = Math.floor(Math.random() * 5);
  match.visitor_score = Math.floor(Math.random() * 5);
  match.status = 'Finalizado';
  saveChanges(match);
};

const borrarPartido = async (id) => {
  if (confirm("¿Seguro que quieres anular este encuentro?")) {
    try {
      await api.delete(`/matches/${id}`);
      fetchMatches();
    } catch (error) { alert("Error al anular partido"); }
  }
};

const formatDate = (str) => {
  if (!str) return '';
  return new Date(str).toLocaleString('es-ES', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
};

onMounted(fetchMatches);
const logout = () => { authStore.logout(); router.push('/login'); };
</script>

<style scoped>
.dashboard-container { max-width: 1100px; margin: 40px auto; padding: 0 20px; }
.dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.text-white { color: #ffffff !important; }
.text-green-light { color: #a7f3d0 !important; }
.title-section h1 { margin: 0; font-size: 32px; text-transform: uppercase; }
.subtitle { margin: 5px 0 0 0; font-size: 16px; font-weight: 500; }

.btn { padding: 12px 20px; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 14px; text-transform: uppercase; }
.btn-primary { background: #10b981; color: white; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3); }
.btn-primary:hover { background: #059669; transform: translateY(-2px); }
.btn-secondary { background: #ffffff; color: #064e3b; border: 2px solid #10b981; }
.btn-secondary:hover { background: #f0fdf4; }
.btn-danger { background: #ef4444; color: #ffffff; }
.btn-danger:hover { background: #dc2626; }

.toolbar { margin-bottom: 20px; display: flex; gap: 15px; }
.admin-actions { display: flex; gap: 10px; }

.filter-card { background: #ffffff; padding: 15px 20px; border-radius: 12px; margin-bottom: 20px; display: flex; align-items: center; gap: 15px; border-left: 5px solid #10b981; }
.filter-label { font-weight: 700; color: #0f172a; font-size: 15px; text-transform: uppercase; }
.form-select { padding: 10px; border: 2px solid #cbd5e1; border-radius: 8px; font-weight: 600; color: #1e293b; outline: none; }
.form-select:focus { border-color: #10b981; }

.table-card { background: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); overflow-x: auto; border: 1px solid #e2e8f0; }
.modern-table { width: 100%; border-collapse: collapse; text-align: center; }
.modern-table th { background-color: #064e3b; padding: 18px; font-size: 13px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 1px; }
.modern-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.modern-table tr:hover { background-color: #f8fafc; }
.text-muted { color: #64748b; font-size: 14px; font-weight: 700; }
.team-name { color: #0f172a; font-size: 16px; font-weight: 800; text-transform: uppercase; }

.score-editor { display: flex; align-items: center; justify-content: center; gap: 8px; }
.score-input { width: 50px; height: 40px; text-align: center; border-radius: 8px; border: 2px solid #10b981; background: #f0fdf4; font-weight: 800; font-size: 16px; color: #064e3b; }
.score-input:focus { outline: none; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2); }
.score-divider { font-weight: bold; color: #94a3b8; }
.score-display { font-size: 20px; font-weight: 900; color: #ffffff; background: #0f172a; padding: 8px 16px; border-radius: 8px; display: inline-block; letter-spacing: 2px; }

.date-cell { font-size: 14px; color: #475569; font-weight: 600; }
.status-badge { padding: 8px 14px; border-radius: 20px; font-size: 13px; font-weight: 800; display: inline-block; text-transform: uppercase; }
.badge-pending { background-color: #ecfdf5; color: #10b981; animation: pulse-live 2s infinite; }
.badge-finished { background-color: #f1f5f9; color: #64748b; }

.actions-cell { display: flex; gap: 8px; justify-content: center; }
.action-btn { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; font-size: 18px; }
.action-btn:hover { transform: translateY(-3px); }
.btn-save:hover { background: #ecfdf5; border-color: #10b981; }
.btn-sim:hover { background: #eff6ff; border-color: #3b82f6; }
.btn-delete:hover { background: #fef2f2; border-color: #ef4444; }

.pagination-container { display: flex; justify-content: center; align-items: center; margin-top: 25px; gap: 20px; background: rgba(255,255,255,0.9); padding: 15px; border-radius: 12px; }
.btn-page { padding: 10px 20px; cursor: pointer; background: #10b981; color: #ffffff; border: none; border-radius: 8px; font-weight: 700; transition: all 0.2s; text-transform: uppercase; }
.btn-page:hover:not(:disabled) { background: #059669; transform: scale(1.05); }
.btn-page:disabled { background: #cbd5e1; cursor: not-allowed; transform: none; }
.page-indicator { font-size: 15px; font-weight: 800; color: #0f172a; text-transform: uppercase; }
</style>