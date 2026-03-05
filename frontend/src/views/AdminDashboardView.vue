<template>
  <div class="stadium-bg">
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div>
          <h2 class="text-white"><span class="anim-ball">⚽</span> Panel de Arbitraje</h2>
          <p class="subtitle text-green-light">Administra los usuarios y directores técnicos de la plataforma</p>
        </div>
        <button class="btn btn-secondary" @click="router.push('/')">⬅ Volver a la Tabla</button>
      </div>

      <div class="glass-card table-card">
        <table class="modern-table">
          <thead>
            <tr>
              <th>Gafete ID</th>
              <th>Nombre del Registro</th>
              <th>Email</th>
              <th>Rol / Posición</th>
              <th>VAR (Acciones)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td class="text-muted">#{{ user.id }}</td>
              <td><strong class="user-name">{{ user.name }}</strong></td>
              <td class="user-email">{{ user.email }}</td>
              <td>
                <span class="role-badge" :class="user.role">{{ user.role === 'admin' ? 'Árbitro (Admin)' : 'DT (User)' }}</span>
              </td>
              <td>
                <button 
                  v-if="user.role === 'user'" 
                  @click="deleteUser(user.id)" 
                  class="btn-danger-outline" 
                  title="Expulsar de la liga"
                >
                  🟥 Expulsar
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
const users = ref([]);

const fetchUsers = async () => {
  try {
    const res = await api.get('/auth/users'); 
    users.value = res.data;
  } catch (error) {
    console.error("Error al cargar usuarios", error);
  }
};

const deleteUser = async (id) => {
  const confirmar = confirm("🚨 ¿Estás seguro de que deseas sacar tarjeta roja a este usuario? Será expulsado de la liga.");
  
  if (confirmar) {
    try {
      await api.delete(`/auth/users/${id}`);
      alert("✅ Usuario expulsado exitosamente.");
      fetchUsers();
    } catch (error) {
      alert("Error en el VAR. Revisa la consola.");
      console.error(error);
    }
  }
};

onMounted(fetchUsers);
</script>

<style scoped>
.stadium-bg { min-height: 100vh; background-image: linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.85)), url('https://images.unsplash.com/photo-1518605368461-1ee125232938?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'); background-size: cover; background-position: center; background-attachment: fixed; padding: 40px 0; }
.dashboard-container { max-width: 1000px; margin: 0 auto; padding: 0 20px; font-family: 'Inter', sans-serif; }
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
.modern-table { width: 100%; border-collapse: collapse; text-align: left; }
.modern-table th { background-color: rgba(6, 78, 59, 0.95); padding: 18px; font-size: 13px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 1px; }
.modern-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.modern-table tr:hover { background-color: rgba(248, 250, 252, 0.8); }

.text-muted { color: #64748b; font-size: 14px; font-weight: 700; }
.user-name { color: #0f172a; font-size: 16px; text-transform: uppercase; }
.user-email { color: #475569; font-size: 14px; font-weight: 500; }

.role-badge { padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
.role-badge.admin { background-color: #fef9c3; color: #854d0e; border: 1px solid #fde047; }
.role-badge.user { background-color: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }

.btn-danger-outline { background: transparent; color: #ef4444; border: 2px solid #fca5a5; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 700; transition: all 0.2s; text-transform: uppercase; }
.btn-danger-outline:hover { background: #fef2f2; border-color: #ef4444; transform: scale(1.05); }
</style>