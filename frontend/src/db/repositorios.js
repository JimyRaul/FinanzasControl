import { buscar, insertarConId, obtener, actualizar as actualizarDoc, bulkDocs } from './index'
import { v4 as uuid } from 'uuid'

// ── Helper: obtener usuario actual del store ───────────────
function getUsuarioId() {
    // Importación dinámica para evitar circular dependency con Pinia
    try {
        const raw = localStorage.getItem('fc_auth')
        if (raw) return JSON.parse(raw).username || null
    } catch { /* ignore */ }
    return null
}

function crearDoc(type, datos) {
    const usuario_id = getUsuarioId()
    return {
        _id: `${type}_${uuid()}`,
        type,
        usuario_id,
        created_at: new Date().toISOString(),
        ...datos,
    }
}

// Añadir usuario_id al selector si no es un documento global
function withUser(selector) {
    const usuario_id = getUsuarioId()
    if (!usuario_id) return selector
    return { ...selector, usuario_id }
}

// ─── CUENTAS ──────────────────────────────────────────────

export const CuentasDB = {
    async listar() {
        return buscar(withUser({ type: 'cuenta' }))
    },

    async crear(datos) {
        const doc = crearDoc('cuenta', { activa: true, saldo_inicial: 0, moneda: 'PEN', ...datos })
        return insertarConId(doc)
    },

    async actualizar(id, datos) {
        const doc = await obtener(id)
        return actualizarDoc({ ...doc, ...datos, updated_at: new Date().toISOString() })
    },

    async eliminar(id) {
        const doc = await obtener(id)
        return actualizarDoc({ ...doc, activa: false, updated_at: new Date().toISOString() })
    },
}

// ─── CATEGORÍAS ───────────────────────────────────────────

const CATEGORIAS_DEFAULT = [
    { nombre: 'Alimentación', icono: 'pi-shopping-cart', color: '#f59e0b', tipo_transaccion: 'gasto' },
    { nombre: 'Transporte', icono: 'pi-car', color: '#3b82f6', tipo_transaccion: 'gasto' },
    { nombre: 'Entretenimiento', icono: 'pi-star', color: '#8b5cf6', tipo_transaccion: 'gasto' },
    { nombre: 'Salud', icono: 'pi-heart', color: '#ef4444', tipo_transaccion: 'gasto' },
    { nombre: 'Servicios', icono: 'pi-bolt', color: '#06b6d4', tipo_transaccion: 'gasto' },
    { nombre: 'Educación', icono: 'pi-book', color: '#10b981', tipo_transaccion: 'gasto' },
    { nombre: 'Ropa', icono: 'pi-shopping-bag', color: '#f97316', tipo_transaccion: 'gasto' },
    { nombre: 'Hogar', icono: 'pi-home', color: '#64748b', tipo_transaccion: 'gasto' },
    { nombre: 'Salario', icono: 'pi-wallet', color: '#10b981', tipo_transaccion: 'ingreso' },
    { nombre: 'Freelance', icono: 'pi-briefcase', color: '#6366f1', tipo_transaccion: 'ingreso' },
    { nombre: 'Otros ingresos', icono: 'pi-plus-circle', color: '#84cc16', tipo_transaccion: 'ingreso' },
]

export const CategoriasDB = {
    async listar() {
        return buscar(withUser({ type: 'categoria' }))
    },

    async crear(datos) {
        const doc = crearDoc('categoria', { activa: true, icono: 'pi-tag', color: '#6366f1', tipo_transaccion: 'gasto', ...datos })
        return insertarConId(doc)
    },

    async actualizar(id, datos) {
        const doc = await obtener(id)
        return actualizarDoc({ ...doc, ...datos, updated_at: new Date().toISOString() })
    },

    async eliminar(id) {
        const doc = await obtener(id)
        return actualizarDoc({ ...doc, activa: false, updated_at: new Date().toISOString() })
    },

    async seed() {
        const existentes = await this.listar()
        if (existentes.length > 0) return
        for (const cat of CATEGORIAS_DEFAULT) await this.crear(cat)
    },
}

// ─── TRANSACCIONES ────────────────────────────────────────

export const TransaccionesDB = {
    async listar(filtros = {}) {
        const selector = withUser({ type: 'transaccion', ...filtros })
        const docs = await buscar(selector)
        return docs.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))
    },

    async crear(datos) {
        if (datos.es_tarjeta_credito && datos.cuotas > 1) {
            return this._crearConCuotas(datos)
        }
        const doc = crearDoc('transaccion', {
            estado: 'activo', cuotas: 1, cuota_actual: 1, es_tarjeta_credito: false,
            transaccion_padre_id: null, nota: '', tags: [], ...datos, monto: Number(datos.monto),
        })
        return insertarConId(doc)
    },

    async _crearConCuotas(datos) {
        const padreId = `transaccion_${uuid()}`
        const montoCuota = Math.round(Number(datos.monto) / datos.cuotas)
        const fechaBase = new Date(datos.fecha)
        const docs = []

        docs.push({
            _id: padreId,
            type: 'transaccion',
            ...datos,
            monto: Number(datos.monto),
            monto_cuota: montoCuota,
            transaccion_padre_id: null,
            estado: 'activo',
            created_at: new Date().toISOString(),
        })

        for (let i = 0; i < datos.cuotas; i++) {
            const fechaCuota = new Date(fechaBase)
            fechaCuota.setMonth(fechaCuota.getMonth() + i)
            docs.push({
                _id: `transaccion_${uuid()}`,
                type: 'transaccion',
                tipo: datos.tipo,
                monto: montoCuota,
                descripcion: `${datos.descripcion} (${i + 1}/${datos.cuotas})`,
                categoria_id: datos.categoria_id,
                cuenta_id: datos.cuenta_id,
                fecha: fechaCuota.toISOString().slice(0, 10),
                mes_corte: fechaCuota.toISOString().slice(0, 7),
                es_tarjeta_credito: true,
                cuotas: datos.cuotas,
                cuota_actual: i + 1,
                transaccion_padre_id: padreId,
                estado: 'pendiente',
                nota: datos.nota || '',
                tags: datos.tags || [],
                created_at: new Date().toISOString(),
            })
        }

        await bulkDocs(docs)
        return docs
    },

    async actualizar(id, datos) {
        const doc = await obtener(id)
        return actualizarDoc({ ...doc, ...datos, updated_at: new Date().toISOString() })
    },

    async eliminar(id) {
        const doc = await obtener(id)
        return actualizarDoc({ ...doc, _deleted: true })
    },

    /**
     * Devuelve resumen para el Dashboard.
     * @param {number} mes
     * @param {number} anio
     */
    async resumen(mes, anio) {
        const prefijo = `${anio}-${String(mes).padStart(2, '0')}`
        const todos = await buscar({ type: 'transaccion' })

        // Mes actual
        const delMes = todos.filter(t => t.fecha?.startsWith(prefijo) && !t._deleted)
        const ingresos = delMes.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + (t.monto || 0), 0)
        const gastos = delMes.filter(t => t.tipo === 'gasto').reduce((s, t) => s + (t.monto || 0), 0)

        // Gastos por categoría (mes actual)
        const porCategoria = {}
        for (const tx of delMes.filter(t => t.tipo === 'gasto')) {
            const id = tx.categoria_id || 'sin-categoria'
            porCategoria[id] = (porCategoria[id] || 0) + (tx.monto || 0)
        }

        // Evolución 6 meses
        const evolucion = []
        for (let i = 5; i >= 0; i--) {
            let m = mes - i, a = anio
            if (m <= 0) { m += 12; a-- }
            const p = `${a}-${String(m).padStart(2, '0')}`
            const tx = todos.filter(t => t.fecha?.startsWith(p) && !t._deleted)
            evolucion.push({
                mes: p,
                ingresos: tx.filter(t => t.tipo === 'ingreso').reduce((s, t) => s + (t.monto || 0), 0),
                gastos: tx.filter(t => t.tipo === 'gasto').reduce((s, t) => s + (t.monto || 0), 0),
            })
        }

        // Últimas 5 transacciones (todos los meses)
        const recientes = [...todos]
            .filter(t => !t._deleted)
            .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))
            .slice(0, 5)

        return { ingresos, gastos, balance: ingresos - gastos, porCategoria, evolucion, recientes }
    },

    /** Calcula el saldo real de cada cuenta: saldo_inicial + movimientos */
    async calcularSaldos() {
        const todos = await buscar(withUser({ type: 'transaccion' }))
        const saldos = {}
        for (const tx of todos.filter(t => !t._deleted)) {
            if (!tx.cuenta_id) continue
            if (!saldos[tx.cuenta_id]) saldos[tx.cuenta_id] = 0
            saldos[tx.cuenta_id] += tx.tipo === 'ingreso' ? (tx.monto || 0) : -(tx.monto || 0)
        }
        return saldos  // { cuenta_id: delta_movimientos }
    },

    /** Crea una transferencia entre dos cuentas (par de docs vinculados) */
    async crearTransferencia({ cuenta_origen, cuenta_destino, monto, fecha, nota }) {
        const usuario_id = getUsuarioId()
        const parId = `tx_par_${uuid()}`
        const base = {
            type: 'transaccion',
            usuario_id,
            es_transferencia: true,
            transferencia_par_id: parId,
            cuotas: 1, cuota_actual: 1, es_tarjeta_credito: false,
            monto: Number(monto),
            fecha,
            nota: nota || '',
            tags: [],
            created_at: new Date().toISOString(),
        }
        const docs = [
            { ...base, _id: `transaccion_${uuid()}`, tipo: 'gasto', cuenta_id: cuenta_origen, descripcion: `Transferencia → cuenta` },
            { ...base, _id: `transaccion_${uuid()}`, tipo: 'ingreso', cuenta_id: cuenta_destino, descripcion: `Transferencia ← cuenta` },
        ]
        await bulkDocs(docs)
        return docs
    },
}

// ─── PRESUPUESTOS ─────────────────────────────────────────

export const PresupuestosDB = {
    async listar(mes, anio) {
        const selector = mes && anio
            ? withUser({ type: 'presupuesto', mes, anio })
            : withUser({ type: 'presupuesto' })
        return buscar(selector)
    },

    async crear(datos) {
        const doc = crearDoc('presupuesto', {
            monto_limite: 0,
            ...datos,
        })
        return insertarConId(doc)
    },

    async actualizar(id, datos) {
        const doc = await obtener(id)
        return actualizarDoc({ ...doc, ...datos, updated_at: new Date().toISOString() })
    },

    async eliminar(id) {
        const doc = await obtener(id)
        return actualizarDoc({ ...doc, _deleted: true })
    },

    /** Devuelve presupuestos del mes con gastos reales calculados */
    async conGastos(mes, anio, gastosPorCategoria = {}) {
        const presupuestos = await this.listar(mes, anio)
        return presupuestos.map(p => ({
            ...p,
            gastado: gastosPorCategoria[p.categoria_id] || 0,
            pct: p.monto_limite > 0
                ? Math.min(100, Math.round(((gastosPorCategoria[p.categoria_id] || 0) / p.monto_limite) * 100))
                : 0,
        }))
    },
}
