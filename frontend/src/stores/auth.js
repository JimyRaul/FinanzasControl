import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { UsuariosDB } from '../db/usuarios'

const STORAGE_KEY = 'fc_auth'

export const useAuthStore = defineStore('auth', () => {
    const usuario = ref(null)   // { _id, username, nombre }
    const cargando = ref(false)
    const error = ref(null)

    const estaLogueado = computed(() => !!usuario.value)
    const nombreUsuario = computed(() => usuario.value?.nombre || usuario.value?.username || '')

    /** Restaurar sesión desde localStorage al arrancar la app */
    function inicializar() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            if (raw) usuario.value = JSON.parse(raw)
        } catch {
            localStorage.removeItem(STORAGE_KEY)
        }
    }

    /** Login → valida en CouchDB y guarda en localStorage */
    async function login(username, password) {
        cargando.value = true
        error.value = null
        try {
            const u = await UsuariosDB.login(username, password)
            if (!u) {
                error.value = 'Usuario o contraseña incorrectos'
                return false
            }
            // Guardar solo datos mínimos (sin hash)
            const sesion = { _id: u._id, username: u.username, nombre: u.nombre }
            usuario.value = sesion
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sesion))
            return true
        } catch (e) {
            error.value = e.message
            return false
        } finally {
            cargando.value = false
        }
    }

    /** Registro → crea usuario en CouchDB y loguea automáticamente */
    async function registrar(username, password, nombre) {
        cargando.value = true
        error.value = null
        try {
            await UsuariosDB.registrar(username, password, nombre)
            return login(username, password)
        } catch (e) {
            error.value = e.message
            return false
        } finally {
            cargando.value = false
        }
    }

    /** Logout → limpia estado y localStorage */
    function logout() {
        usuario.value = null
        localStorage.removeItem(STORAGE_KEY)
    }

    return { usuario, estaLogueado, nombreUsuario, cargando, error, inicializar, login, registrar, logout }
})
