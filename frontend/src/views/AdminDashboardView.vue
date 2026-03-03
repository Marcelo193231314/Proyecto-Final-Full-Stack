<template>
  <div class="container">
    <div class="header">
      <h2>Gestión de Usuarios Registrados</h2>
      <button class="btn-secondary" @click="router.push('/')">⬅ Volver a Partidos</button>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td><strong>{{ user.name }}</strong></td>
            <td>{{ user.email }}</td>
            <td>
              <span class="badge" :class="user.role">{{ user.role }}</span>
            </td>
            <td>
              <button 
                v-if="user.role === 'user'" 
                @click="deleteUser(user.id)" 
                class="btn-danger" 
                title="Dar de baja"
              >
                Eliminar
              </button>
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
const users = ref([]);

// Traer la lista de usuarios desde el backend
const fetchUsers = async () => {
  try {
    const res = await api.get('/auth/users'); // Asegúrate de tener esta ruta en el backend
    users.value = res.data;
  } catch (error) {
    console.error("Error al cargar usuarios", error);
  }
};

// Función para dar de baja
const deleteUser = async (id) => {
  const confirmar = confirm("¿Estás seguro de que deseas eliminar este usuario? Si es capitán de un equipo, podría haber errores.");
  
  if (confirmar) {
    try {
      await api.delete(`/auth/users/${id}`);
      alert("Usuario dado de baja exitosamente.");
      fetchUsers(); // Recargamos la tabla automáticamente
    } catch (error) {
      alert("Error al eliminar. Revisa la consola.");
      console.error(error);
    }
  }
};

onMounted(fetchUsers);
</script>

<style scoped>
.container { max-width: 900px; margin: 40px auto; font-family: sans-serif; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.table-wrapper { background: white; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); overflow: hidden; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th, td { padding: 15px; border-bottom: 1px solid #eee; }
th { background-color: #f8f9fa; }
.btn-secondary { background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
.btn-danger { background: #dc3545; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-weight: bold; }
.btn-danger:hover { background: #c82333; }
.badge { padding: 5px 10px; border-radius: 15px; font-size: 0.85rem; font-weight: bold; }
.badge.admin { background-color: #007bff; color: white; }
.badge.user { background-color: #28a745; color: white; }
</style>