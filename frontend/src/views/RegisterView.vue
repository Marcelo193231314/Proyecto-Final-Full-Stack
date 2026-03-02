<template>
  <div class="register-container">
    <h2>Registro de Usuario</h2>
    <form @submit.prevent="handleRegister">
      <div>
        <label>Nombre del usuario o equipo:</label>
        <input type="text" v-model="name" required />
      </div>
      <div>
        <label>Email:</label>
        <input type="email" v-model="email" required />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" v-model="password" required />
      </div>
      <div>
        <label>Rol en la liga:</label>
        <select v-model="role" required>
          <option value="user">Capitan de Equipo (User)</option>
          <option value="admin">Organizador (Admin)</option>
        </select>
      </div>
      <button type="submit">Registrarse</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
    <p>¿Ya tienes cuenta? <router-link to="/login">Inicia sesion</router-link></p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const name = ref('');
const email = ref('');
const password = ref('');
const role = ref('user');
const error = ref('');
const authStore = useAuthStore();
const router = useRouter();

const handleRegister = async () => {
  try {
    await authStore.register(name.value, email.value, password.value, role.value);
    router.push('/login');
  } catch (err) {
    error.value = err.response?.data?.error || 'Error de conexion con el backend';
  }
};
</script>

<style scoped>
.register-container {
  max-width: 450px;
  margin: 60px auto;
  padding: 40px 30px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}
h2 {
  text-align: center;
  color: #1a1a1a;
  margin-top: 0;
  margin-bottom: 25px;
  font-size: 24px;
}
div {
  margin-bottom: 18px;
}
label {
  display: block;
  margin-bottom: 8px;
  color: #555555;
  font-size: 14px;
  font-weight: 600;
}
input, select {
  width: 100%;
  padding: 12px;
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 15px;
}
input:focus, select:focus {
  border-color: #28a745;
  outline: none;
}
button {
  width: 100%;
  padding: 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
}
button:hover {
  background-color: #218838;
}
.error {
  color: #dc3545;
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
}
p {
  text-align: center;
  margin-top: 25px;
  color: #666666;
  font-size: 14px;
}
a {
  color: #28a745;
  text-decoration: none;
  font-weight: 600;
}
a:hover {
  text-decoration: underline;
}
</style>