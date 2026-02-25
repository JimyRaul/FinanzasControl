import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CuentasDB, TransaccionesDB } from '../db/repositorios'

export const useCuentasStore = defineStore('cuentas', () => {
    const cuentas = ref([])
    const saldos = ref({})   // { cuenta_id: delta_movimientos }
    const cargando = ref(false)
    const error = ref(null)

    const cuentasActivas = computed(() => cuentas.value.filter(c => c.activa !== false))

    /** Saldo total real de una cuenta = saldo_inicial + movimientos */
    const saldoCuenta = (id) => {
        const c = cuentas.value.find(c => c._id === id)
        if (!c) return 0
        return (c.saldo_inicial || 0) + (saldos.value[id] || 0)
    }

    async function cargar() {
        cargando.value = true
        error.value = null
        try {
            const [listado, deltas] = await Promise.all([
                CuentasDB.listar(),
                TransaccionesDB.calcularSaldos(),
            ])
            cuentas.value = listado
            saldos.value = deltas
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

    return { cuentas, cuentasActivas, saldos, saldoCuenta, cargando, error, cargar, crear, actualizar, eliminar }
})
