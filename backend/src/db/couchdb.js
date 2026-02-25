const nano = require('nano')
require('dotenv').config()

const couchUrl = process.env.COUCHDB_URL || 'http://admin:admin@localhost:5984'
const dbName = process.env.COUCHDB_NAME || 'finanzas'

const client = nano(couchUrl)

let db

async function conectar() {
    try {
        const dbList = await client.db.list()
        if (!dbList.includes(dbName)) {
            await client.db.create(dbName)
            console.log(`✅ Base de datos "${dbName}" creada`)
        } else {
            console.log(`✅ Base de datos "${dbName}" conectada`)
        }
        db = client.db.use(dbName)
        await crearIndices()
        return db
    } catch (error) {
        console.error('❌ Error conectando a CouchDB:', error.message)
        throw error
    }
}

async function crearIndices() {
    const indices = [
        {
            index: { fields: ['type', 'created_at'] },
            name: 'idx-type-date',
            type: 'json',
        },
        {
            index: { fields: ['type', 'fecha'] },
            name: 'idx-type-fecha',
            type: 'json',
        },
        {
            index: { fields: ['type', 'cuenta_id', 'fecha'] },
            name: 'idx-type-cuenta-fecha',
            type: 'json',
        },
        {
            index: { fields: ['type', 'categoria_id', 'fecha'] },
            name: 'idx-type-categoria-fecha',
            type: 'json',
        },
    ]

    for (const idx of indices) {
        try {
            await db.createIndex(idx)
        } catch (e) {
            // El índice ya existe, se ignora
        }
    }
    console.log('✅ Índices CouchDB listos')
}

function getDb() {
    if (!db) throw new Error('DB no inicializada, llama conectar() primero')
    return db
}

module.exports = { conectar, getDb }
