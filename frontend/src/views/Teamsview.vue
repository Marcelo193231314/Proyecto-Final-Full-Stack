<template>
  <div class="stadium-bg">
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div>
          <h2 class="text-white"><span class="anim-ball">⚽</span> Catálogo de Clubes</h2>
          <p class="subtitle text-green-light">Modifica los nombres oficiales de los equipos inscritos</p>
        </div>
        <button class="btn btn-secondary" @click="router.push('/')">⬅ Volver </button>
      </div>

      <div class="glass-card table-card">
        <table class="modern-table">
          <thead>
            <tr>
              <th style="width: 15%">Escudo (ID)</th>
              <th style="width: 65%">Nombre Oficial del Club</th>
              <th style="width: 20%">Gestión</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="team in teams" :key="team.id">
              <td class="text-muted">#{{ team.id }}</td>
              <td>
                <input type="text" v-model="team.name" class="form-control name-input" placeholder="Nombre del equipo">
              </td>
              <td>
                <button @click="actualizarNombre(team)" class="action-btn btn-save" title="Guardar Nuevo Nombre">
                  💾 Registrar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const teams = ref([]);

const fetchTeams = async () => {
  try {
    const res = await api.get('/teams');
    teams.value = res.data;
  } catch (error) {
    console.error("Error al cargar equipos", error);
  }
};

const actualizarNombre = async (team) => {
  if (!team.name || team.name.trim() === '') {
    alert("El nombre del club no puede estar vacío ");
    return;
  }

  try {
    await api.put(`/teams/${team.id}`, { name: team.name });
    alert(" ¡Nombre del club registrado en la federación!");
  } catch (error) {
    alert("Error al actualizar el nombre del equipo");
    console.error(error);
  }
};

onMounted(fetchTeams);
</script>

<style scoped>
.stadium-bg { min-height: 100vh; background-image: linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.85)), url('https://images.unsplash.com/photo-1518605368461-1ee125232938?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'); background-size: cover; background-position: center; background-attachment: fixed; padding: 40px 0; }
.dashboard-container { max-width: 800px; margin: 0 auto; padding: 0 20px; font-family: 'Inter', sans-serif; }
.dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.text-white { color: #ffffff !important; }
.text-green-light { color: #a7f3d0 !important; }
.dashboard-header h2 { margin: 0; font-size: 32px; font-weight: 800; text-transform: uppercase; }
.subtitle { margin: 5px 0 0 0; font-size: 16px; font-weight: 500; }

.glass-card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); border: 1px solid rgba(255, 255, 255, 0.2); }

.btn { padding: 12px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-size: 14px; text-transform: uppercase; border: none; }
.btn-secondary { background: rgba(255,255,255,0.9); color: #064e3b; border: 2px solid #10b981; }
.btn-secondary:hover { background: #ffffff; transform: translateY(-2px); }

.table-card { overflow: hidden; }
.modern-table { width: 100%; border-collapse: collapse; text-align: center; }
.modern-table th { background-color: rgba(6, 78, 59, 0.95); padding: 18px; font-size: 13px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 1px; }
.modern-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.modern-table tr:hover { background-color: rgba(248, 250, 252, 0.8); }

.text-muted { color: #64748b; font-size: 15px; font-weight: 800; }

.form-control.name-input { width: 90%; padding: 12px 15px; background-color: #f8fafc; border: 2px solid #cbd5e1; border-radius: 10px; font-size: 16px; color: #0f172a; text-align: center; font-weight: 800; text-transform: uppercase; transition: all 0.3s; }
.form-control.name-input:focus { background-color: #ffffff; border-color: #10b981; outline: none; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15); }

.action-btn { background: #ecfdf5; color: #059669; border: 2px solid #34d399; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 800; text-transform: uppercase; transition: all 0.2s; }
.action-btn:hover { background: #d1fae5; border-color: #10b981; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2); }
</style>