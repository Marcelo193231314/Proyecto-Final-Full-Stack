const express = require('express');
// Importamos del archivo con "s" y carpeta con "s"
const { getMatches, createMatch, updateMatchStatus } = require('../controllers/matchesController');

const router = express.Router();

router.get('/', getMatches);
router.post('/', createMatch);
router.patch('/:id/status', updateMatchStatus);

module.exports = router;