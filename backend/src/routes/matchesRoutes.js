const express = require('express');

const { getMatches, createMatch, updateMatchStatus, deleteMatch, getMatchById } = require('../controllers/matchesController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', verifyToken, getMatches);




router.get('/:id', verifyToken, getMatchById);

router.post('/', verifyToken, isAdmin, createMatch);
router.patch('/:id/status', verifyToken, isAdmin, updateMatchStatus);
router.delete('/:id', verifyToken, isAdmin, deleteMatch);

module.exports = router;