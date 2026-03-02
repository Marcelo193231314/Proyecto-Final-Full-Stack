const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role || 'user';
        
        // 1. Guardamos al usuario/capitán en la tabla users
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, userRole]
        );
        
        // 2. ¡NUEVO! Si es un Capitán, creamos su equipo automáticamente en la tabla teams
        if (userRole === 'user') {
            await pool.query(
                'INSERT INTO teams (name, captain_id) VALUES (?, ?)',
                [name, result.insertId] // El insertId es el ID del capitán que acabamos de crear
            );
        }
        
        res.status(201).json({ message: 'Usuario y equipo registrados', userId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const user = users[0];
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// NUEVA FUNCIÓN: Obtener la lista de EQUIPOS (ya no usuarios)
const getUsers = async (req, res) => {
    try {
        // Ahora buscamos directamente en la tabla oficial de equipos
        const [teams] = await pool.query("SELECT id, name FROM teams");
        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { register, login, getUsers };