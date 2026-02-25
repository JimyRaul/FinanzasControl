require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const { conectar } = require('./db/couchdb')

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json())
app.use(morgan('dev'))

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes (se irán agregando por tarea)
app.use('/api/cuentas', require('./routes/cuentas'))
app.use('/api/categorias', require('./routes/categorias'))
app.use('/api/transacciones', require('./routes/transacciones'))
app.use('/api/dashboard', require('./routes/dashboard'))

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(err.status || 500).json({
        message: err.message || 'Error interno del servidor',
    })
})

// Iniciar servidor
async function start() {
    try {
        await conectar()
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
        })
    } catch (err) {
        console.error('No se pudo iniciar el servidor:', err.message)
        process.exit(1)
    }
}

start()
