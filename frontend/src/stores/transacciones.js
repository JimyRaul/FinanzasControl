import { defineStore } from 'pinia'
import { ref } from 'vue'
import { TransaccionesDB } from '../db/repositorios'

export const useTransaccionesStore = defineStore('transacciones', () => {
    const transacciones = ref([])
    const cargando = ref(false)
    const error = ref(null)

    // Filtros activos
    const filtros = ref({
        mes: new Date().getMonth() + 1,
        anio: new Date().getFullYear(),
        tipo: null,         // 'gasto' | 'ingreso' | null (todos)
        cuenta_id: null,
        categoria_id: null,
    })

    async function cargar() {
        cargando.value = true
        error.value = null
        try {
            const selector = {}
            if (filtros.value.tipo) selector.tipo = filtros.value.tipo
            if (filtros.value.cuenta_id) selector.cuenta_id = filtros.value.cuenta_id
            if (filtros.value.categoria_id) selector.categoria_id = filtros.value.categoria_id

            transacciones.value = await TransaccionesDB.listar(selector)

            // Filtrar por mes/año en cliente (más simple sin índices Mango avanzados)
            if (filtros.value.mes && filtros.value.anio) {
                const prefijo = `${filtros.value.anio}-${String(filtros.value.mes).padStart(2, '0')}`
                transacciones.value = transacciones.value.filter(t => t.fecha?.startsWith(prefijo))
            }
        } catch (e) {
            error.value = e.message
        } finally {
            cargando.value = false
        }
    }

    async function crear(datos) {
        const nueva = await TransaccionesDB.crear(datos)
        await cargar() // Recargar para incluir cuotas generadas
        return nueva
    }

    async function actualizar(id, datos) {
        await TransaccionesDB.actualizar(id, datos)
        await cargar()
    }

    async function eliminar(id) {
        await TransaccionesDB.eliminar(id)
        transacciones.value = transacciones.value.filter(t => t._id !== id)
    }

    function setFiltro(campo, valor) {
        filtros.value[campo] = valor
        cargar()
    }

    return { transacciones, cargando, error, filtros, cargar, crear, actualizar, eliminar, setFiltro }
})
