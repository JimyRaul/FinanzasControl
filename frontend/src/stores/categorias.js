import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CategoriasDB } from '../db/repositorios'

export const useCategoriasStore = defineStore('categorias', () => {
    const categorias = ref([])
    const cargando = ref(false)
    const error = ref(null)

    const gastoCats = computed(() => categorias.value.filter(c => c.activa !== false && c.tipo_transaccion !== 'ingreso'))
    const ingresoCats = computed(() => categorias.value.filter(c => c.activa !== false && c.tipo_transaccion !== 'gasto'))

    async function cargar() {
        cargando.value = true
        error.value = null
        try {
            categorias.value = await CategoriasDB.listar()
            // Si no hay ninguna, insertar las por defecto
            if (categorias.value.length === 0) {
                await CategoriasDB.seed()
                categorias.value = await CategoriasDB.listar()
            }
        } catch (e) {
            error.value = e.message
        } finally {
            cargando.value = false
        }
    }

    async function crear(datos) {
        const nueva = await CategoriasDB.crear(datos)
        categorias.value.push(nueva)
        return nueva
    }

    async function actualizar(id, datos) {
        const actualizada = await CategoriasDB.actualizar(id, datos)
        const idx = categorias.value.findIndex(c => c._id === id)
        if (idx !== -1) categorias.value[idx] = actualizada
        return actualizada
    }

    async function eliminar(id) {
        await CategoriasDB.eliminar(id)
        const idx = categorias.value.findIndex(c => c._id === id)
        if (idx !== -1) categorias.value[idx].activa = false
    }

    return { categorias, gastoCats, ingresoCats, cargando, error, cargar, crear, actualizar, eliminar }
})
