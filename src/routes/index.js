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

module.exports = router;