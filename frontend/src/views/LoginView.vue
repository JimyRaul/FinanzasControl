<template>
  <div class="auth-page">
    <div class="auth-card card">
      <!-- Logo -->
      <div class="auth-logo">
        <i class="pi pi-wallet"></i>
      </div>
      <h1 class="auth-title">FinanzasControl</h1>
      <p class="auth-sub text-muted">Inicia sesión para continuar</p>

      <form @submit.prevent="onLogin" class="auth-form">
        <div class="field">
          <label>Usuario</label>
          <InputText
            v-model="form.username"
            placeholder="tu usuario"
            :disabled="store.cargando"
            fluid
            autocomplete="username"
          />
        </div>

        <div class="field">
          <label>Contraseña</label>
          <Password
            v-model="form.password"
            placeholder="••••••••"
            :feedback="false"
            toggleMask
            :disabled="store.cargando"
            fluid
            inputStyle="width:100%"
            autocomplete="current-password"
          />
        </div>

        <p v-if="store.error" class="auth-error">
          <i class="pi pi-exclamation-circle"></i> {{ store.error }}
        </p>

        <Button
          label="Iniciar sesión"
          icon="pi pi-sign-in"
          type="submit"
          :loading="store.cargando"
          class="auth-btn"
          fluid
        />
      </form>

      <p class="auth-link">
        ¿No tienes cuenta?
        <RouterLink to="/registro">Regístrate</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import { useAuthStore } from '../stores/auth'

const store  = useAuthStore()
const router = useRouter()

const form = reactive({ username: '', password: '' })

async function onLogin() {
  store.error = null
  if (!form.username.trim() || !form.password) {
    store.error = 'Completa todos los campos'
    return
  }
  const ok = await store.login(form.username, form.password)
  if (ok) router.push('/')
}
</script>

<style scoped>
.auth-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--fc-bg);
  padding: 1rem;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.auth-logo {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: rgba(99, 102, 241, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: var(--fc-primary);
  margin-bottom: 0.5rem;
}

.auth-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.auth-sub {
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
}

.auth-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.5rem;
}

.field { display: flex; flex-direction: column; gap: 0.4rem; }
.field label { font-size: 0.85rem; font-weight: 600; color: var(--fc-text-muted); }

.auth-error {
  color: var(--fc-danger);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(239, 68, 68, 0.1);
  padding: 0.5rem 0.75rem;
  border-radius: var(--fc-radius-sm);
  margin: 0;
}

.auth-btn { margin-top: 0.25rem; }

.auth-link {
  font-size: 0.85rem;
  color: var(--fc-text-muted);
  margin-top: 0.75rem;
}

.auth-link a {
  color: var(--fc-primary-light);
  text-decoration: none;
  font-weight: 600;
}

.auth-link a:hover { text-decoration: underline; }
</style>
