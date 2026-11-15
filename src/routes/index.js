const { Router } = require('express');
const router = Router();

router.get('/trailerflix', (req, res) => {
    res.json({ mensaje: 'Ruta de Trailerflix funcionando' });
});

module.exports = router;