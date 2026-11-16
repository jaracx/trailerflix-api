const express = require('express');
require('dotenv').config();
const sequelize = require('./database');
const routes = require('./routes');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// HTML de bienvenida en /
app.get('/', (req, res) => {
    res.send(`
        <html>
            <body>
                <h1>🎬 API REST Trailerflix</h1>
                <p>Servidor activo y conectado a la base de datos MySQL.</p>
                <h3>Endpoints disponibles:</h3>
                <ul>
                    <li><code>GET /api/catalogo</code> - Catálogo completo</li>
                    <li><code>GET /api/titulo/:title</code> - Búsqueda por título</li>
                    <li><code>GET /api/categoria/:cat</code> - Filtrar por categoría</li>
                </ul>
            </body>
        </html>
    `);
});

// Rutas principales
app.use('/api', routes);

// Middleware 404 para rutas inexistentes
app.use((req, res) => {
    res.status(404).json({ error: `La ruta solicitada '${req.originalUrl}' no existe en este servidor.` });
});

// Middleware 500 para errores internos
app.use((err, req, res, next) => {
    console.error('Error interno en el servidor:', err);
    res.status(500).json({ error: 'Ocurrió un error interno en el servidor.', mensaje: err.message });
});

if (require.main === module) {
    app.listen(PORT, async () => {
        console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
}

module.exports = app;