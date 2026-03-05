<template>
  <div class="stadium-bg">
    <div class="register-wrapper">
      <div class="glass-container register-container">
        <div class="register-header">
          <h2>Registro de Usuario</h2>
          <p>Crea una cuenta para acceder a la plataforma</p>
        </div>
        
        <form @submit.prevent="handleRegister">
          
          <div class="form-group">
            <label>Usuario</label>
            <input type="text" v-model="name" class="form-control" placeholder="Ingresa tu nombre" required />
          </div>
          
          <div class="form-group">
            <label>Correo Electrónico</label>
            <input type="email" v-model="email" class="form-control" placeholder="usuario@correo.com" required />
          </div>
          
          <div class="form-group">
            <label>Contraseña</label>
            <input type="password" v-model="password" class="form-control" placeholder="••••••••" required />
          </div>
          
          <div class="admin-toggle">
            <label class="toggle-label">
              <input type="checkbox" v-model="isAdminMode" class="checkbox-custom" />
              <span>Solicitar rol de administrador</span>
            </label>
          </div>

          <div v-if="isAdminMode" class="secret-code-input">
            <label>Código de Autorización</label>
            <input type="password" v-model="adminSecret" class="form-control admin-input" placeholder="Ingresa el código" required />
          </div>

          <div class="action-buttons">
            <button type="submit" class="btn btn-primary">Registrarse</button>
          </div>
        </form>
        
        <div v-if="error" class="message-box error-message">{{ error }}</div>
        <div v-if="successMsg" class="message-box success-message">{{ successMsg }}</div>
        
        <p class="footer-text">
          ¿Ya tienes cuenta? <router-link to="/login">Inicia sesión aquí</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const name = ref('');
const email = ref('');
const password = ref('');
const isAdminMode = ref(false);
const adminSecret = ref('');
const error = ref('');
const successMsg = ref('');

const authStore = useAuthStore();
const router = useRouter();

const handleRegister = async () => {
  try {
    error.value = '';
    const secretToSend = isAdminMode.value ? adminSecret.value : '';
    await authStore.register(name.value, email.value, password.value, secretToSend);
    
    successMsg.value = 'Registro completado. Redirigiendo...';
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  } catch (err) {
    error.value = err.response?.data?.error || 'Error en el registro. Verifica tus datos.';
  }
};
</script>

<style scoped>
.stadium-bg { min-height: 100vh; background-image: linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.85)), url('https://images.unsplash.com/photo-1518605368461-1ee125232938?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'); background-size: cover; background-position: center; background-attachment: fixed; }
.register-wrapper { display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
.glass-container { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.2); }
.register-container { width: 100%; max-width: 450px; padding: 40px; border-radius: 16px; box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3); border-top: 6px solid #10b981; }
.register-header { text-align: center; margin-bottom: 30px; }
.register-header h2 { color: #064e3b; font-size: 28px; font-weight: 800; margin: 0 0 5px 0; text-transform: uppercase; }
.register-header p { color: #475569; font-size: 15px; margin: 0; font-weight: 500; }

.form-group { margin-bottom: 20px; }
label { display: block; margin-bottom: 8px; color: #334155; font-size: 14px; font-weight: 700; text-transform: uppercase; }
.form-control { width: 100%; padding: 14px 16px; background-color: #f8fafc; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 15px; transition: all 0.3s ease; font-weight: 600; color: #0f172a; }
.form-control:focus { background-color: #ffffff; border-color: #10b981; outline: none; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15); }

.admin-toggle { margin-top: 15px; padding: 14px; background-color: #f8fafc; border-radius: 10px; border: 2px solid #e2e8f0; }
.toggle-label { display: flex; align-items: center; gap: 10px; margin: 0; cursor: pointer; color: #0f172a; font-weight: 700; text-transform: uppercase; font-size: 13px; }
.checkbox-custom { width: 20px; height: 20px; accent-color: #10b981; cursor: pointer; }

.secret-code-input { margin-top: 15px; padding: 15px; background-color: #fef9c3; border-radius: 10px; border: 2px solid #fde047; }
.admin-input { background-color: #ffffff; border-color: #facc15; }
.admin-input:focus { border-color: #eab308; box-shadow: 0 0 0 4px rgba(234, 179, 8, 0.15); }

.action-buttons { margin-top: 25px; }
.btn { width: 100%; padding: 14px; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; text-transform: uppercase; letter-spacing: 0.5px; }
.btn-primary { background-color: #10b981; color: #ffffff; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3); }
.btn-primary:hover { background-color: #059669; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(16, 185, 129, 0.4); }

.message-box { padding: 12px; border-radius: 8px; text-align: center; margin-top: 20px; font-size: 14px; font-weight: 700; }
.error-message { background-color: rgba(254, 242, 242, 0.9); color: #ef4444; border: 2px solid #fca5a5; }
.success-message { background-color: rgba(236, 253, 245, 0.9); color: #10b981; border: 2px solid #6ee7b7; }

.footer-text { text-align: center; margin-top: 25px; color: #475569; font-size: 14px; font-weight: 500;}
.footer-text a { color: #10b981; text-decoration: none; font-weight: 700; }
.footer-text a:hover { color: #059669; text-decoration: underline; }
</style>