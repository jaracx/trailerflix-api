const express = require('express');
const router = express.Router();
const { Contenido, Categoria, Genero, Actor } = require('../models');
const { Op } = require('sequelize');

// 1. GET /api/catalogo - Obtener catálogo completo con relaciones
router.get('/catalogo', async (req, res, next) => {
    try {
        const catalogo = await Contenido.findAll({
            include: [
                { model: Categoria, as: 'categoria', attributes: ['nombre'] },
                { model: Genero, as: 'generos', attributes: ['nombre'], through: { attributes: [] } },
                { model: Actor, as: 'actores', attributes: ['nombre_completo'], through: { attributes: [] } }
            ]
        });
        res.json(catalogo);
    } catch (error) {
        next(error);
    }
});

// 2. GET /api/titulo/:title - Buscar contenido por título
router.get('/titulo/:title', async (req, res, next) => {
    try {
        const { title } = req.params;
        const resultados = await Contenido.findAll({
            where: {
                titulo: { [Op.like]: `%${title}%` }
            },
            include: [
                { model: Categoria, as: 'categoria', attributes: ['nombre'] },
                { model: Genero, as: 'generos', attributes: ['nombre'], through: { attributes: [] } },
                { model: Actor, as: 'actores', attributes: ['nombre_completo'], through: { attributes: [] } }
            ]
        });
        if (resultados.length === 0) {
            return res.status(404).json({ error: `No se encontró ningún contenido que coincida con el título: '${title}'` });
        }
        res.json(resultados);
    } catch (error) {
        next(error);
    }
});

// 3. GET /api/categoria/:cat - Filtrar contenido por categoría
router.get('/categoria/:cat', async (req, res, next) => {
    try {
        const { cat } = req.params;
        const resultados = await Contenido.findAll({
            include: [
                {
                    model: Categoria,
                    as: 'categoria',
                    attributes: ['nombre'],
                    where: { nombre: { [Op.like]: `%${cat}%` } }
                },
                { model: Genero, as: 'generos', attributes: ['nombre'], through: { attributes: [] } },
                { model: Actor, as: 'actores', attributes: ['nombre_completo'], through: { attributes: [] } }
            ]
        });
        if (resultados.length === 0) {
            return res.status(404).json({ error: `No se encontraron contenidos para la categoría: '${cat}'` });
        }
        res.json(resultados);
    } catch (error) {
        next(error);
    }
});

// 4. GET /api/reparto/:act - Buscar contenido por actor
router.get('/reparto/:act', async (req, res, next) => {
    try {
        const { act } = req.params;
        const resultados = await Contenido.findAll({
            include: [
                { model: Categoria, as: 'categoria', attributes: ['nombre'] },
                { model: Genero, as: 'generos', attributes: ['nombre'], through: { attributes: [] } },
                {
                    model: Actor,
                    as: 'actores',
                    attributes: ['nombre_completo'],
                    through: { attributes: [] },
                    where: {
                        nombre_completo: { [Op.like]: `%${act}%` }
                    }
                }
            ]
        });

        if (resultados.length === 0) {
            return res.status(404).json({
                error: `No se encontró ningún contenido cuyo reparto coincida con: '${act}'`
            });
        }

        res.json(resultados);
    } catch (error) {
        next(error);
    }
});

// 5. GET /api/trailer/:id - Obtener el tráiler de un contenido por ID
router.get('/trailer/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const contenido = await Contenido.findByPk(id);

        if (!contenido) {
            return res.status(404).json({
                error: `No existe ningún contenido con el id: '${id}'`
            });
        }

        if (!contenido.trailer || contenido.trailer.trim() === '') {
            return res.json({
                id: contenido.id,
                titulo: contenido.titulo,
                mensaje: 'El tráiler no está disponible para este título.'
            });
        }

        res.json({
            id: contenido.id,
            titulo: contenido.titulo,
            trailer: contenido.trailer
        });
    } catch (error) {
        next(error);
    }
});

// 6. GET /api/catalogo/:id - Obtener un contenido por ID
router.get('/catalogo/:id', async (req, res, next) => {
    try {
        const contenido = await Contenido.findByPk(req.params.id, {
            include: [
                { model: Categoria, as: 'categoria', attributes: ['nombre'] },
                { model: Genero, as: 'generos', attributes: ['nombre'], through: { attributes: [] } },
                { model: Actor, as: 'actores', attributes: ['nombre_completo'], through: { attributes: [] } }
            ]
        });

        if (!contenido) {
            return res.status(404).json({ error: 'Contenido no encontrado' });
        }

        res.json(contenido);
    } catch (error) {
        next(error);
    }
});

// 7. POST /api/catalogo - Crear un contenido
router.post('/catalogo', async (req, res, next) => {
    try {
        const { titulo, sinopsis, temporadas, poster, trailer, id_categoria, generos, actores } = req.body;

        if (!titulo || String(titulo).trim() === '') {
            return res.status(400).json({ error: 'El campo titulo es obligatorio.' });
        }
        if (!sinopsis || String(sinopsis).trim() === '') {
            return res.status(400).json({ error: 'El campo sinopsis es obligatorio.' });
        }
        if (!poster || String(poster).trim() === '') {
            return res.status(400).json({ error: 'El campo poster es obligatorio.' });
        }
        if (!trailer || String(trailer).trim() === '') {
            return res.status(400).json({ error: 'El campo trailer es obligatorio.' });
        }
        if (!Number.isInteger(Number(id_categoria))) {
            return res.status(400).json({ error: 'El campo id_categoria debe ser un número entero válido.' });
        }
        if (temporadas !== undefined && temporadas !== null && temporadas !== '' && !Number.isInteger(Number(temporadas))) {
            return res.status(400).json({ error: 'El campo temporadas debe ser numérico.' });
        }
        if (generos !== undefined && !Array.isArray(generos)) {
            return res.status(400).json({ error: 'El campo generos debe ser un arreglo de IDs.' });
        }
        if (actores !== undefined && !Array.isArray(actores)) {
            return res.status(400).json({ error: 'El campo actores debe ser un arreglo de IDs.' });
        }

        const categoria = await Categoria.findByPk(Number(id_categoria));
        if (!categoria) {
            return res.status(400).json({ error: `La categoría con id '${id_categoria}' no existe.` });
        }

        const contenido = await Contenido.create({
            titulo: String(titulo).trim(),
            sinopsis: String(sinopsis).trim(),
            temporadas: temporadas !== undefined && temporadas !== null && temporadas !== '' ? Number(temporadas) : null,
            poster: String(poster).trim(),
            trailer: String(trailer).trim(),
            id_categoria: Number(id_categoria)
        });

        if (Array.isArray(generos) && generos.length > 0) await contenido.setGeneros(generos);
        if (Array.isArray(actores) && actores.length > 0) await contenido.setActores(actores);

        const creado = await Contenido.findByPk(contenido.id, {
            include: [
                { model: Categoria, as: 'categoria', attributes: ['nombre'] },
                { model: Genero, as: 'generos', attributes: ['nombre'], through: { attributes: [] } },
                { model: Actor, as: 'actores', attributes: ['nombre_completo'], through: { attributes: [] } }
            ]
        });

        res.status(201).json(creado);
    } catch (error) {
        next(error);
    }
});

// 8. PUT /api/catalogo/:id - Actualizar un contenido
router.put('/catalogo/:id', async (req, res, next) => {
    try {
        const contenido = await Contenido.findByPk(req.params.id);

        if (!contenido) {
            return res.status(404).json({ error: 'Contenido no encontrado' });
        }

        const body = req.body;

        if ('titulo' in body && (!body.titulo || String(body.titulo).trim() === '')) {
            return res.status(400).json({ error: 'El campo titulo no puede quedar vacío.' });
        }
        if ('sinopsis' in body && (!body.sinopsis || String(body.sinopsis).trim() === '')) {
            return res.status(400).json({ error: 'El campo sinopsis no puede quedar vacío.' });
        }
        if ('poster' in body && (!body.poster || String(body.poster).trim() === '')) {
            return res.status(400).json({ error: 'El campo poster no puede quedar vacío.' });
        }
        if ('trailer' in body && (!body.trailer || String(body.trailer).trim() === '')) {
            return res.status(400).json({ error: 'El campo trailer no puede quedar vacío.' });
        }
        if ('id_categoria' in body) {
            if (!Number.isInteger(Number(body.id_categoria))) {
                return res.status(400).json({ error: 'El campo id_categoria debe ser un número entero válido.' });
            }
            const categoria = await Categoria.findByPk(Number(body.id_categoria));
            if (!categoria) {
                return res.status(400).json({ error: `La categoría con id '${body.id_categoria}' no existe.` });
            }
        }
        if ('temporadas' in body && body.temporadas !== null && body.temporadas !== '' && !Number.isInteger(Number(body.temporadas))) {
            return res.status(400).json({ error: 'El campo temporadas debe ser numérico.' });
        }
        if ('generos' in body && !Array.isArray(body.generos)) {
            return res.status(400).json({ error: 'El campo generos debe ser un arreglo de IDs.' });
        }
        if ('actores' in body && !Array.isArray(body.actores)) {
            return res.status(400).json({ error: 'El campo actores debe ser un arreglo de IDs.' });
        }

        const datos = {};
        if ('titulo' in body) datos.titulo = String(body.titulo).trim();
        if ('sinopsis' in body) datos.sinopsis = String(body.sinopsis).trim();
        if ('poster' in body) datos.poster = String(body.poster).trim();
        if ('trailer' in body) datos.trailer = String(body.trailer).trim();
        if ('id_categoria' in body) datos.id_categoria = Number(body.id_categoria);
        if ('temporadas' in body) datos.temporadas = body.temporadas === null || body.temporadas === '' ? null : Number(body.temporadas);

        await contenido.update(datos);

        if ('generos' in body) await contenido.setGeneros(body.generos);
        if ('actores' in body) await contenido.setActores(body.actores);

        const actualizado = await Contenido.findByPk(contenido.id, {
            include: [
                { model: Categoria, as: 'categoria', attributes: ['nombre'] },
                { model: Genero, as: 'generos', attributes: ['nombre'], through: { attributes: [] } },
                { model: Actor, as: 'actores', attributes: ['nombre_completo'], through: { attributes: [] } }
            ]
        });

        res.json(actualizado);
    } catch (error) {
        next(error);
    }
});

// 9. DELETE /api/catalogo/:id - Eliminar un contenido
router.delete('/catalogo/:id', async (req, res, next) => {
    try {
        const contenido = await Contenido.findByPk(req.params.id);

        if (!contenido) {
            return res.status(404).json({ error: 'Contenido no encontrado' });
        }

        await contenido.setGeneros([]);
        await contenido.setActores([]);
        await contenido.destroy();

        res.json({ message: 'Contenido eliminado correctamente' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;