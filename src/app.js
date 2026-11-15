const express = require('express');
const db = require('./database'); // Conexión a la base de datos
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const trailerflixRoutes = require('./routes/index');
app.use('/api', trailerflixRoutes);

// Ruta de prueba principal
app.get('/', (req, res) => {
    res.json({ mensaje: '¡Servidor de Trailerflix funcionando con éxito!' });
});

app.listen(PORT, async () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    try {
        await db.authenticate();
        console.log('¡Conexión a la base de datos establecida correctamente!');
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
});