/**
 * UsuariosDB — Usuarios almacenados dentro de finanzas-control (type: 'usuario').
 * Las contraseñas se hashean con SHA-256 via Web Crypto API antes de guardar.
 */
import { buscar, insertarConId, obtener, actualizar as actualizarDoc } from './index'
import { v4 as uuid } from 'uuid'

// ── Hash SHA-256 ───────────────────────────────────────────
async function hashPassword(password) {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// ── UsuariosDB ─────────────────────────────────────────────
export const UsuariosDB = {
    /**
     * Buscar usuario por username (case-insensitive a nivel app)
     */
    async buscarPorUsername(username) {
        const docs = await buscar({ type: 'usuario', username: username.toLowerCase().trim() })
        return docs[0] || null
    },

    /**
     * Registrar nuevo usuario.
     * Retorna el documento creado o lanza error si ya existe.
     */
    async registrar(username, password, nombre) {
        const uname = username.toLowerCase().trim()

        // Verificar que no exista
        const existente = await this.buscarPorUsername(uname)
        if (existente) throw new Error('El usuario ya existe')

        const doc = {
            _id: `usuario_${uuid()}`,
            type: 'usuario',
            username: uname,
            nombre: nombre?.trim() || uname,
            password_hash: await hashPassword(password),
            created_at: new Date().toISOString(),
        }
        return insertarConId(doc)
    },

    /**
     * Validar credenciales.
     * Retorna el doc del usuario si es válido, null si no.
     */
    async login(username, password) {
        const usuario = await this.buscarPorUsername(username)
        if (!usuario) return null

        const hash = await hashPassword(password)
        if (hash !== usuario.password_hash) return null

        return usuario
    },

    /**
     * Actualizar datos de perfil (no la contraseña).
     */
    async actualizarPerfil(id, datos) {
        const doc = await obtener(id)
        return actualizarDoc({ ...doc, ...datos, updated_at: new Date().toISOString() })
    },
}
