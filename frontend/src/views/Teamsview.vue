<template>
  <div class="container">
    <div class="header">
      <h2>Gestión de Equipos</h2>
      <button class="btn-secondary" @click="router.push('/')">Volver a Partidos</button>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre del Equipo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="team in teams" :key="team.id">
            <td>{{ team.id }}</td>
            <td>
              <input type="text" v-model="team.name" class="name-input">
            </td>
            <td>
              <button @click="actualizarNombre(team)" class="btn-save" title="Guardar Nuevo Nombre">💾</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const teams = ref([]);

// Cargar los equipos
const fetchTeams = async () => {
  try {
    const res = await api.get('/teams');
    teams.value = res.data;
  } catch (error) {
    console.error("Error al cargar equipos", error);
  }
};

// Función para guardar el nombre modificado
const actualizarNombre = async (team) => {
  if (!team.name || team.name.trim() === '') {
    alert("El nombre del equipo no puede estar vacío");
    return;
  }

  try {
    await api.put(`/teams/${team.id}`, { name: team.name });
    alert("¡Nombre actualizado correctamente!");
  } catch (error) {
    alert("Error al actualizar el nombre del equipo");
    console.error(error);
  }
};

onMounted(fetchTeams);
</script>

<style scoped>
.container { max-width: 800px; margin: 40px auto; font-family: sans-serif; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.table-wrapper { background: white; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); overflow: hidden; }
table { width: 100%; border-collapse: collapse; text-align: center; }
th, td { padding: 15px; border-bottom: 1px solid #eee; }
.name-input { padding: 8px; border: 1px solid #ccc; border-radius: 4px; width: 80%; text-align: center; font-size: 1rem; font-weight: bold; }
.btn-save { background: none; border: none; cursor: pointer; font-size: 1.5rem; transition: transform 0.2s; }
.btn-save:hover { transform: scale(1.1); }
.btn-secondary { background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; }
.btn-secondary:hover { background: #5a6268; }
</style>