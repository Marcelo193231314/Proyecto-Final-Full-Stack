<template>
  <div class="standings-container">
    <h2>Tabla de Posiciones 🏆</h2>
    
    <div v-if="isLoading" class="loader">
      <p>Cargando la liga...</p>
    </div>

    <table v-else class="standings-table">
      <thead>
        <tr>
          <th>Pos</th>
          <th>Equipo</th>
          <th>PJ</th>
          <th>G</th>
          <th>E</th>
          <th>P</th>
          <th>Pts</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(team, index) in tableData" :key="team.id">
          <td>{{ index + 1 }}</td>
          <td class="team-name"><strong>{{ team.name || team.team_name }}</strong></td>
          <td>{{ team.played }}</td>
          <td>{{ team.won }}</td>
          <td>{{ team.drawn }}</td>
          <td>{{ team.lost }}</td>
          <td class="points"><strong>{{ team.points }}</strong></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../services/api';

const teams = ref([]);
const matches = ref([]);
const isLoading = ref(true);

const loadData = async () => {
  try {
    isLoading.value = true;
    
    // Pedimos equipos y partidos. 
    // TRUCO: limit=1000 para traer todos los partidos de la temporada y calcular bien los puntos.
    const [teamsRes, matchesRes] = await Promise.all([
      api.get('/teams'),
      api.get('/matches?limit=1000') 
    ]);
    
    // Ajuste "crema": Verificamos si tu API devuelve los datos directos o dentro de ".data" por la paginación
    teams.value = teamsRes.data.data || teamsRes.data; 
    matches.value = matchesRes.data.data || matchesRes.data;

  } catch (error) {
    console.error("Error al cargar datos de la tabla:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadData);

// Calculadora automática de puntos
const tableData = computed(() => {
  if (!teams.value || teams.value.length === 0) return [];

  // 1. Inicializamos las estadísticas en cero
  let stats = teams.value.map(team => ({
    ...team,
    played: 0, won: 0, drawn: 0, lost: 0, points: 0
  }));

  // 2. Sumamos los puntos según los partidos
  if (matches.value && matches.value.length > 0) {
    matches.value.forEach(match => {
      // Verificamos que el partido esté finalizado o tenga resultados
      if (match.status === 'Finalizado' || (match.local_score !== null && match.visitor_score !== null)) {
        
        let homeTeam = stats.find(t => t.id === match.local_team_id || t.name === match.local_team_name);
        let awayTeam = stats.find(t => t.id === match.visitor_team_id || t.name === match.visitor_team_name);

        if (homeTeam && awayTeam) {
          homeTeam.played++;
          awayTeam.played++;

          if (match.local_score > match.visitor_score) {
            homeTeam.won++;
            homeTeam.points += 3;
            awayTeam.lost++;
          } else if (match.local_score < match.visitor_score) {
            awayTeam.won++;
            awayTeam.points += 3;
            homeTeam.lost++;
          } else {
            homeTeam.drawn++;
            awayTeam.drawn++;
            homeTeam.points += 1;
            awayTeam.points += 1;
          }
        }
      }
    });
  }

  // 3. Ordenamos: el que tenga más puntos va primero
  return stats.sort((a, b) => b.points - a.points);
});
</script>

<style scoped>
.standings-container {
  max-width: 800px;
  margin: 30px auto;
  padding: 20px;
}

h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 20px;
}

.loader {
  text-align: center;
  font-size: 1.2em;
  color: #7f8c8d;
}

.standings-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  border-radius: 10px;
  overflow: hidden;
}

.standings-table th, .standings-table td {
  padding: 15px;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.standings-table th {
  background-color: #2c3e50;
  color: white;
  text-transform: uppercase;
  font-size: 0.9em;
  letter-spacing: 1px;
}

.standings-table tr:hover {
  background-color: #f8f9fa;
  transform: scale(1.01);
  transition: all 0.2s;
}

.team-name {
  text-align: left;
  font-size: 1.1em;
  color: #34495e;
}

.points {
  color: #27ae60;
  font-size: 1.2em;
}

/* El primer lugar (Como el Real Madrid) brilla un poco más */
.standings-table tbody tr:first-child td {
  background-color: #f0f9f4;
  font-weight: bold;
}
</style>