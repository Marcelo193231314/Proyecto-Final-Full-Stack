<template>
  <div class="form-container">
    <h2>Programar Nuevo Partido</h2>
    <form @submit.prevent="handleSubmit">
      
      <div>
        <label>Equipo Local:</label>
        <select v-model="local_team_id" required class="team-select">
          <option value="" disabled>Selecciona al equipo local</option>
          <option v-for="team in teams" :key="team.id" :value="team.id">
            {{ team.name }}
          </option>
        </select>
      </div>

      <div>
        <label>Equipo Visitante:</label>
        <select v-model="visitor_team_id" required class="team-select">
          <option value="" disabled>Selecciona al equipo visitante</option>
          <option v-for="team in teams" :key="team.id" :value="team.id">
            {{ team.name }}
          </option>
        </select>
      </div>

      <div>
        <label>Fecha y Hora:</label>
        <input type="datetime-local" v-model="match_date" required />
      </div>

      <div>
        <label>Cancha:</label>
        <input type="text" v-model="location" required />
      </div>

      <div class="buttons">
        <button type="submit" class="btn-submit">Guardar Partido</button>
        <button type="button" class="btn-cancel" @click="goBack">Cancelar</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const local_team_id = ref('');
const visitor_team_id = ref('');
const match_date = ref('');
const location = ref('');
const teams = ref([]);

// Cargar los equipos al abrir la pantalla
const fetchTeams = async () => {
  try {
    const response = await api.get('/auth/users');
    teams.value = response.data;
  } catch (error) {
    console.error('Error al cargar los equipos:', error);
  }
};

onMounted(() => {
  fetchTeams();
});

const handleSubmit = async () => {
  if (local_team_id.value === visitor_team_id.value) {
    alert('El equipo local y visitante no pueden ser el mismo.');
    return;
  }

  try {
    const formattedDate = match_date.value.replace('T', ' ') + ':00';
    await api.post('/matches', {
      local_team_id: local_team_id.value,
      visitor_team_id: visitor_team_id.value,
      match_date: formattedDate,
      location: location.value
    });
    router.push('/');
  } catch (error) {
    alert('Error al crear el partido. Revisa que tu servidor este corriendo.');
  }
};

const goBack = () => {
  router.push('/');
};
</script>

<style scoped>
.form-container { max-width: 500px; margin: 60px auto; padding: 30px; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); }
h2 { text-align: center; color: #1a1a1a; margin-top: 0; margin-bottom: 25px; }
div { margin-bottom: 15px; }
label { display: block; margin-bottom: 5px; color: #555555; font-weight: 600; font-size: 14px; }
input, .team-select { width: 100%; padding: 10px; border: 1px solid #dcdcdc; border-radius: 6px; box-sizing: border-box; font-family: inherit; font-size: 15px; }
input:focus, .team-select:focus { outline: none; border-color: #0056b3; }
.buttons { display: flex; gap: 10px; margin-top: 25px; }
button { flex: 1; padding: 12px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; transition: background-color 0.3s; }
.btn-submit { background-color: #0056b3; color: white; }
.btn-submit:hover { background-color: #004494; }
.btn-cancel { background-color: #f8f9fa; color: #333; border: 1px solid #ccc; }
.btn-cancel:hover { background-color: #e2e6ea; }
</style>