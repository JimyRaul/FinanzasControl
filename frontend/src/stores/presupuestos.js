import { defineStore } from 'pinia'
import { ref } from 'vue'
import { PresupuestosDB } from '../db/repositorios'

export const usePresupuestosStore = defineStore('presupuestos', () => {
    const presupuestos = ref([])
    const cargando = ref(false)
    const error = ref(null)

    async function cargar(mes, anio, gastosPorCategoria = {}) {
        cargando.value = true
        error.value = null
        try {
            presupuestos.value = await PresupuestosDB.conGastos(mes, anio, gastosPorCategoria)
        } catch (e) {
            error.value = e.message
        } finally {
            cargando.value = false
        }
    }

    async function crear(datos) {
        const nuevo = await PresupuestosDB.crear(datos)
        presupuestos.value.unshift({ ...nuevo, gastado: 0, pct: 0 })
        return nuevo
    }

    async function actualizar(id, datos) {
        const actual = await PresupuestosDB.actualizar(id, datos)
        const idx = presupuestos.value.findIndex(p => p._id === id)
        if (idx !== -1) presupuestos.value[idx] = { ...presupuestos.value[idx], ...actual }
        return actual
    }

    async function eliminar(id) {
        await PresupuestosDB.eliminar(id)
        presupuestos.value = presupuestos.value.filter(p => p._id !== id)
    }

    return { presupuestos, cargando, error, cargar, crear, actualizar, eliminar }
})
