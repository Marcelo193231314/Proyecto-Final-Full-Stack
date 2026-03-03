const express = require('express');
const { getTeams, updateTeamName } = require('../controllers/teamsController');

const router = express.Router();

router.get('/', getTeams);
router.put('/:id', updateTeamName); // Ruta para guardar el nuevo nombre

module.exports = router;