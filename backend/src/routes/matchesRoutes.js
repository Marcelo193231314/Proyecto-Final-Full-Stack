const express = require('express');
const { getMatches, createMatch, updateMatchStatus, deleteMatch } = require('../controllers/matchesController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();


router.get('/', verifyToken, getMatches);


router.post('/', verifyToken, isAdmin, createMatch);
router.patch('/:id/status', verifyToken, isAdmin, updateMatchStatus);
router.delete('/:id', verifyToken, isAdmin, deleteMatch);

module.exports = router;