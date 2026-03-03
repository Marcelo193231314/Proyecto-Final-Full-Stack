const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const matchesRoutes = require('./routes/matchesRoutes');
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/teams', require('./routes/teamsRoutes')); 

const PORT = process.env.PORT || 3000;


const startServer = async () => {
    try {
        
        const connection = await db.getConnection();
        console.log(' Conexión a MySQL exitosa (Pool establecido)');
        
        
        connection.release();

        if (process.env.NODE_ENV !== 'test') {
            app.listen(PORT, () => {
                console.log(` Servidor corriendo en el puerto ${PORT}`);
            });
        }
    } catch (err) {
        console.error(' Error crítico: No se pudo conectar a la base de datos.');
        console.error(`Detalle: ${err.message}`);
        
        
        process.exit(1);
    }
};

startServer();

module.exports = app;