import { ensureDB, crearIndice } from './index'

/**
 * Llama a esto al iniciar la app para asegurar que la BD y los índices existen.
 */
export async function initDB() {
    try {
        await ensureDB()
        const indices = [
            { fields: ['type', 'created_at'], name: 'idx-type-date' },
            { fields: ['type', 'fecha'], name: 'idx-type-fecha' },
            { fields: ['type', 'cuenta_id'], name: 'idx-type-cuenta' },
            { fields: ['type', 'categoria_id'], name: 'idx-type-categoria' },
        ]
        for (const idx of indices) {
            await crearIndice(idx.fields, idx.name).catch(() => { }) // ignora si ya existe
        }
        console.log('[CouchDB] BD e índices listos ✅')
    } catch (e) {
        console.error('[CouchDB] Error al inicializar:', e.message)
    }
}
