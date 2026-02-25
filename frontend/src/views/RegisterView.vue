<template>
  <div class="auth-page">
    <div class="auth-card card">
      <div class="auth-logo">
        <i class="pi pi-user-plus"></i>
      </div>
      <h1 class="auth-title">Crear cuenta</h1>
      <p class="auth-sub text-muted">Regístrate para empezar a controlar tus finanzas</p>

      <form @submit.prevent="onRegistrar" class="auth-form">
        <div class="field">
          <label>Nombre completo</label>
          <InputText
            v-model="form.nombre"
            placeholder="ej. Juan Pérez"
            :disabled="store.cargando"
            fluid
          />
        </div>

        <div class="field">
          <label>Usuario *</label>
          <InputText
            v-model="form.username"
            placeholder="ej. juan123 (sin espacios)"
            :disabled="store.cargando"
            fluid
            autocomplete="username"
          />
          <small v-if="errors.username" class="error">{{ errors.username }}</small>
        </div>

        <div class="field">
          <label>Contraseña *</label>
          <Password
            v-model="form.password"
            placeholder="mínimo 6 caracteres"
            :feedback="true"
            toggleMask
            :disabled="store.cargando"
            fluid
            inputStyle="width:100%"
            autocomplete="new-password"
            promptLabel="Escribe una contraseña"
            weakLabel="Débil"
            mediumLabel="Normal"
            strongLabel="Fuerte"
          />
          <small v-if="errors.password" class="error">{{ errors.password }}</small>
        </div>

        <div class="field">
          <label>Confirmar contraseña *</label>
          <Password
            v-model="form.confirm"
            placeholder="repite la contraseña"
            :feedback="false"
            toggleMask
            :disabled="store.cargando"
            fluid
            inputStyle="width:100%"
            autocomplete="new-password"
          />
          <small v-if="errors.confirm" class="error">{{ errors.confirm }}</small>
        </div>

        <p v-if="store.error" class="auth-error">
          <i class="pi pi-exclamation-circle"></i> {{ store.error }}
        </p>

        <Button
          label="Crear cuenta"
          icon="pi pi-check"
          type="submit"
          :loading="store.cargando"
          class="auth-btn"
          fluid
        />
      </form>

      <p class="auth-link">
        ¿Ya tienes cuenta?
        <RouterLink to="/login">Inicia sesión</RouterLink>
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

const form   = reactive({ nombre: '', username: '', password: '', confirm: '' })
const errors = reactive({})

function validar() {
  Object.assign(errors, {})
  if (!form.username.trim()) errors.username = 'El usuario es requerido'
  else if (/\s/.test(form.username)) errors.username = 'Sin espacios'
  if (!form.password || form.password.length < 6) errors.password = 'Mínimo 6 caracteres'
  if (form.password !== form.confirm) errors.confirm = 'Las contraseñas no coinciden'
  return Object.keys(errors).length === 0
}

async function onRegistrar() {
  store.error = null
  if (!validar()) return
  const ok = await store.registrar(form.username, form.password, form.nombre)
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
  max-width: 420px;
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
  background: rgba(16, 185, 129, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: var(--fc-success);
  margin-bottom: 0.5rem;
}

.auth-title { font-size: 1.5rem; font-weight: 700; margin: 0; }
.auth-sub   { font-size: 0.85rem; margin-bottom: 0.75rem; text-align: center; }

.auth-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.5rem;
}

.field { display: flex; flex-direction: column; gap: 0.4rem; }
.field label { font-size: 0.85rem; font-weight: 600; color: var(--fc-text-muted); }
.error { color: var(--fc-danger); font-size: 0.8rem; }

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
