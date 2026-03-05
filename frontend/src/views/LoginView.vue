<template>
  <div class="login-wrapper">
    <div class="login-container">
      <div class="login-header">
        <div class="icon-container">
          <span class="anim-ball text-4xl">⚽</span>
        </div>
        <h2>LigaManager</h2>
        <p>Ingresa a tu cuenta para el saque inicial</p>
      </div>

      <form @submit.prevent>
        <div class="form-group">
          <label>Correo Electrónico</label>
          <input type="email" v-model="email" class="form-control" placeholder="dt@equipo.com" required />
        </div>
        
        <div class="form-group">
          <label>Contraseña</label>
          <input type="password" v-model="password" class="form-control" placeholder="••••••••" required />
        </div>
        
        <div class="action-buttons">
          <button type="button" class="btn btn-user" @click="handleLogin('user')">
            Entrar a la Cancha
          </button>
          <button type="button" class="btn btn-admin" @click="handleLogin('admin')">
            Acceso Arbitraje (Admin)
          </button>
        </div>
      </form>
      
      <div v-if="error" class="error-message">
        📋 {{ error }}
      </div>
      
      <p class="footer-text">
        ¿Fichaje nuevo? <router-link to="/register">Regístrate aquí</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const error = ref('');
const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async (role) => {
  if (!email.value || !password.value) {
    error.value = 'Falta información en la alineación.';
    return;
  }
  try {
    error.value = '';
    await authStore.login(email.value, password.value, role);
    router.push('/');
  } catch (err) {
    error.value = err.response?.data?.message || 'Credenciales de acceso incorrectas';
  }
};
</script>

<style scoped>
.login-wrapper { display: flex; justify-content: center; align-items: center; min-height: 85vh; padding: 20px; }
.login-container { width: 100%; max-width: 420px; background: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3); border-top: 6px solid #10b981; }
.login-header { text-align: center; margin-bottom: 30px; }
.icon-container { font-size: 40px; margin-bottom: 10px; }
.login-header h2 { color: #064e3b; font-size: 28px; font-weight: 800; margin: 0 0 5px 0; text-transform: uppercase; }
.login-header p { color: #64748b; font-size: 15px; margin: 0; }
.form-group { margin-bottom: 20px; }
label { display: block; margin-bottom: 8px; color: #334155; font-size: 14px; font-weight: 700; text-transform: uppercase; }
.form-control { width: 100%; padding: 14px 16px; background-color: #f8fafc; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 15px; transition: all 0.3s ease; }
.form-control:focus { background-color: #ffffff; border-color: #10b981; outline: none; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15); }
.action-buttons { display: flex; flex-direction: column; gap: 14px; margin-top: 30px; }
.btn { width: 100%; padding: 14px; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; text-transform: uppercase; letter-spacing: 0.5px; }
.btn-user { background-color: #10b981; color: #ffffff; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3); }
.btn-user:hover { background-color: #059669; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(16, 185, 129, 0.4); }
.btn-admin { background-color: #1e293b; color: #f8fafc; }
.btn-admin:hover { background-color: #0f172a; transform: translateY(-2px); }
.error-message { background-color: #fef2f2; color: #ef4444; padding: 12px; border-radius: 8px; border: 1px solid #fecaca; text-align: center; margin-top: 20px; font-weight: 600; }
.footer-text { text-align: center; margin-top: 25px; color: #64748b; font-size: 14px; }
</style>