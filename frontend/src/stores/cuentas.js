import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CuentasDB } from '../db/repositorios'

export const useCuentasStore = defineStore('cuentas', () => {
    const cuentas = ref([])
    const cargando = ref(false)
    const error = ref(null)

    const cuentasActivas = computed(() => cuentas.value.filter(c => c.activa !== false))

    async function cargar() {
        cargando.value = true
        error.value = null
        try {
            cuentas.value = await CuentasDB.listar()
        } catch (e) {
            error.value = e.message
        } finally {
            cargando.value = false
        }
    }

    async function crear(datos) {
        const nueva = await CuentasDB.crear(datos)
        cuentas.value.unshift(nueva)
        return nueva
    }

    async function actualizar(id, datos) {
        const actualizada = await CuentasDB.actualizar(id, datos)
        const idx = cuentas.value.findIndex(c => c._id === id)
        if (idx !== -1) cuentas.value[idx] = actualizada
        return actualizada
    }

    async function eliminar(id) {
        await CuentasDB.eliminar(id)
        const idx = cuentas.value.findIndex(c => c._id === id)
        if (idx !== -1) cuentas.value[idx].activa = false
    }

    return { cuentas, cuentasActivas, cargando, error, cargar, crear, actualizar, eliminar }
})
