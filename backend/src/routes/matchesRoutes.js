const express = require('express');
// Asegúrate de que deleteMatch esté aquí adentro:
const { getMatches, createMatch, updateMatchStatus, deleteMatch } = require('../controllers/matchesController');

const router = express.Router();

router.get('/', getMatches);
router.post('/', createMatch);
router.patch('/:id/status', updateMatchStatus);

// Y aquí usamos la función
router.delete('/:id', deleteMatch);

module.exports = router;