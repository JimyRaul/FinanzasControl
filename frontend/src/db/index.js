/**
 * CouchDB HTTP Client — reemplaza PouchDB usando fetch API nativa.
 * CouchDB expone una API REST completa, no necesitamos PouchDB en el browser.
 */

const BASE_URL = (import.meta.env.VITE_COUCHDB_URL || 'https://couchdb.quipana.com/finanzas-control').replace(/\/$/, '')

async function request(method, path, body) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    }
    if (body) options.body = JSON.stringify(body)

    const res = await fetch(`${BASE_URL}${path}`, options)
    const data = await res.json()

    if (!res.ok && res.status !== 404) {
        throw new Error(data.reason || data.error || `HTTP ${res.status}`)
    }
    return { status: res.status, data }
}

// ─── API CouchDB ──────────────────────────────────────────

/** Crear BD si no existe */
export async function ensureDB() {
    const { status } = await request('GET', '')
    if (status === 404) {
        await request('PUT', '')
        console.log('[CouchDB] Base de datos creada')
    }
}

/** Crear o actualizar índices Mango */
export async function crearIndice(fields, name) {
    return request('POST', '/_index', {
        index: { fields },
        name,
        type: 'json',
    })
}

/** Insertar documento (POST — CouchDB asigna _id) */
export async function insertar(doc) {
    const res = await request('POST', '/', doc)
    return { ...doc, _id: res.data.id, _rev: res.data.rev }
}

/** Insertar documento con _id específico (PUT) */
export async function insertarConId(doc) {
    const res = await request('PUT', `/${encodeURIComponent(doc._id)}`, doc)
    return { ...doc, _rev: res.data.rev }
}

/** Obtener documento por ID */
export async function obtener(id) {
    const res = await request('GET', `/${encodeURIComponent(id)}`)
    if (res.status === 404) return null
    return res.data
}

/** Actualizar documento */
export async function actualizar(doc) {
    const res = await request('PUT', `/${encodeURIComponent(doc._id)}`, doc)
    return { ...doc, _rev: res.data.rev }
}

/** Eliminar documento */
export async function eliminar(id, rev) {
    return request('DELETE', `/${encodeURIComponent(id)}?rev=${encodeURIComponent(rev)}`)
}

/** Mango Query (buscar documentos) */
export async function buscar(selector, opciones = {}) {
    const res = await request('POST', '/_find', {
        selector,
        limit: opciones.limit || 1000,
        sort: opciones.sort,
        fields: opciones.fields,
    })
    return res.data.docs || []
}

/** Insertar múltiples documentos */
export async function bulkDocs(docs) {
    const res = await request('POST', '/_bulk_docs', { docs })
    return res.data
}

export default { ensureDB, crearIndice, insertar, insertarConId, obtener, actualizar, eliminar, buscar, bulkDocs }
