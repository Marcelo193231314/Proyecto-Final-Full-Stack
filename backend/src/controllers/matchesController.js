const pool = require('../config/db');

const getMatches = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5; 
        const offset = (page - 1) * limit;
        const statusFilter = req.query.status || '';

        let query = `
            SELECT 
                m.id, 
                t1.name AS local_team_name, 
                t2.name AS visitor_team_name, 
                m.match_date, 
                m.location, 
                m.status,
                m.local_score,
                m.visitor_score
            FROM matches m
            JOIN teams t1 ON m.local_team_id = t1.id
            JOIN teams t2 ON m.visitor_team_id = t2.id
        `;
        let countQuery = `SELECT COUNT(*) AS total FROM matches`;
        
        const queryParams = [];
        const countParams = [];

        if (statusFilter) {
            query += ` WHERE m.status = ?`;
            countQuery += ` WHERE status = ?`;
            queryParams.push(statusFilter);
            countParams.push(statusFilter);
        }

        // CORRECCIÓN AQUÍ: Pasamos limit y offset directamente a la cadena SQL
        query += ` ORDER BY m.match_date ASC LIMIT ${limit} OFFSET ${offset}`;

        const [[{ total }]] = await pool.query(countQuery, countParams);
        const [matches] = await pool.query(query, queryParams);

        res.json({
            data: matches,
            totalItems: total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createMatch = async (req, res) => {
    try {
        const { local_team_id, visitor_team_id, match_date, location } = req.body;
        
        const [result] = await pool.query(
            'INSERT INTO matches (local_team_id, visitor_team_id, match_date, location, status) VALUES (?, ?, ?, ?, ?)',
            [local_team_id, visitor_team_id, match_date, location, 'Pendiente']
        );
        
        res.status(201).json({ message: 'Partido creado exitosamente', matchId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateMatchStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, local_score, visitor_score } = req.body;
        
        const validStatuses = ['Pendiente', 'Finalizado'];
        const finalStatus = validStatuses.includes(status) ? status : 'Pendiente';

        await pool.query(
            'UPDATE matches SET status = ?, local_score = ?, visitor_score = ? WHERE id = ?', 
            [finalStatus, local_score || 0, visitor_score || 0, id]
        );
        
        res.json({ message: 'Resultado y estado actualizados correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteMatch = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM matches WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Partido no encontrado' });
        }
        
        res.json({ message: 'Partido eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMatchById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT 
                m.id, 
                t1.name AS local_team_name, 
                t2.name AS visitor_team_name, 
                m.match_date, 
                m.location, 
                m.status,
                m.local_score,
                m.visitor_score
            FROM matches m
            JOIN teams t1 ON m.local_team_id = t1.id
            JOIN teams t2 ON m.visitor_team_id = t2.id
            WHERE m.id = ?
        `;
        const [matches] = await pool.query(query, [id]);

        if (matches.length === 0) {
            return res.status(404).json({ message: 'Partido no encontrado' });
        }

        res.json(matches[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getMatches, createMatch, updateMatchStatus, deleteMatch, getMatchById };