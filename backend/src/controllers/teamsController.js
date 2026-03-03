const pool = require('../config/db');

// Traer equipos
const getTeams = async (req, res) => {
    try {
        const [teams] = await pool.query('SELECT id, name FROM teams ORDER BY name ASC');
        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// NUEVA FUNCIÓN: Solo actualizar el nombre
const updateTeamName = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        
        await pool.query('UPDATE teams SET name = ? WHERE id = ?', [name, id]);
        
        res.json({ message: 'Nombre del equipo actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Exportamos ambas
module.exports = { getTeams, updateTeamName };