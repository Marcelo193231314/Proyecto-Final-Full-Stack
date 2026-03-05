<template>
  <div class="form-wrapper">
    <div class="form-container">
      <div class="form-header">
        <div class="icon-container">
          <span class="anim-ball text-4xl">⚽</span>
        </div>
        <h2>Programar Encuentro</h2>
        <p>Configura los equipos, fecha y el estadio del partido</p>
      </div>

      <form @submit.prevent="createMatch" class="match-form">
        
        <div class="form-group">
          <label>🏠 Equipo Local</label>
          <select v-model="match.local_team_id" class="form-control" required>
            <option value="" disabled>Selecciona al equipo de casa</option>
            <option v-for="team in teams" :key="team.id" :value="team.id">
              {{ team.name }}
            </option>
          </select>
        </div>

        <div class="vs-divider"><span>VS</span></div>

        <div class="form-group">
          <label>✈️ Equipo Visitante</label>
          <select v-model="match.visitor_team_id" class="form-control" required>
            <option value="" disabled>Selecciona al equipo rival</option>
            <option v-for="team in teams" :key="team.id" :value="team.id">
              {{ team.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>📅 Fecha y Hora del Silbatazo</label>
          <input type="datetime-local" v-model="match.match_date" class="form-control" required>
        </div>

        <div class="form-group">
          <label>🏟️ Estadio / Cancha</label>
          <input type="text" v-model="match.location" class="form-control" placeholder="Ej. Estadio Monumental" required>
        </div>

        <div class="action-buttons">
          <button type="submit" class="btn btn-primary">✅ Confirmar Partido</button>
          <button type="button" class="btn btn-secondary" @click="router.push('/')">⬅️ Volver a la Tabla</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const teams = ref([]);
const match = ref({
  local_team_id: '',
  visitor_team_id: '',
  match_date: '',
  location: ''
});

const fetchTeams = async () => {
  try {
    const res = await api.get('/teams'); 
    teams.value = res.data;
  } catch (error) {
    console.error("Error al cargar los equipos", error);
  }
};

const createMatch = async () => {
  if (match.value.local_team_id === match.value.visitor_team_id) {
    alert("Un equipo no puede jugar contra sí mismo 😅");
    return;
  }
  
  try {
    const formattedDate = match.value.match_date.replace('T', ' ') + ':00';
    
    const matchData = {
      local_team_id: match.value.local_team_id,
      visitor_team_id: match.value.visitor_team_id,
      match_date: formattedDate,
      location: match.value.location
    };

    await api.post('/matches', matchData);
    
    alert("⚽ ¡Partido programado con éxito!");
    router.push('/'); 
  } catch (error) {
    alert("Error al crear el partido");
    console.error(error);
  }
};

onMounted(fetchTeams);
</script>

<style scoped>
.form-wrapper { display: flex; justify-content: center; padding: 40px 20px; }
.form-container { width: 100%; max-width: 550px; background: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3); border-top: 6px solid #10b981; }
.form-header { text-align: center; margin-bottom: 30px; }
.icon-container { font-size: 40px; margin-bottom: 10px; }
.form-header h2 { color: #064e3b; font-size: 28px; font-weight: 800; margin: 0 0 5px 0; text-transform: uppercase; }
.form-header p { color: #64748b; font-size: 15px; margin: 0; font-weight: 500; }

.form-group { margin-bottom: 20px; }
label { display: block; margin-bottom: 8px; color: #334155; font-size: 14px; font-weight: 700; text-transform: uppercase; }
.form-control { width: 100%; padding: 14px 16px; background-color: #f8fafc; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 15px; transition: all 0.3s ease; font-weight: 600; color: #0f172a;}
.form-control:focus { background-color: #ffffff; border-color: #10b981; outline: none; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15); }

.vs-divider { text-align: center; margin: 15px 0; position: relative; z-index: 1; }
.vs-divider::before { content: ''; position: absolute; top: 50%; left: 0; right: 0; border-top: 2px dashed #cbd5e1; z-index: -1; }
.vs-divider span { background: white; padding: 5px 15px; color: #0f172a; font-weight: 900; font-size: 16px; border-radius: 20px; border: 2px solid #cbd5e1; }

.action-buttons { display: flex; flex-direction: column; gap: 15px; margin-top: 35px; }
.btn { width: 100%; padding: 14px; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; text-transform: uppercase; letter-spacing: 0.5px; }
.btn-primary { background-color: #10b981; color: #ffffff; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3); }
.btn-primary:hover { background-color: #059669; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(16, 185, 129, 0.4); }
.btn-secondary { background-color: #f1f5f9; color: #475569; border: 2px solid #cbd5e1; }
.btn-secondary:hover { background-color: #e2e8f0; color: #0f172a; }
</style>