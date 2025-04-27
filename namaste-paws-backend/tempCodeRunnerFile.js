require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Enhanced CORS configuration
app.use(cors({
    origin: [
        'http://127.0.0.1:5500',
        'http://localhost:5500',
        'http://127.0.0.1:3000',
        'http://localhost:3000',
        'null'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Database configuration
const pool = new Pool({
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "root",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "namaste_paws",
    port: process.env.DB_PORT || 5432,
});

// Database connection test
pool.query('SELECT NOW()')
    .then(res => console.log('✅ Database connected at:', res.rows[0].now))
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
        console.log('\n💡 Troubleshooting Tips:');
        console.log('1. Verify PostgreSQL is running (sudo service postgresql status)');
        console.log('2. Check credentials in .env file');
        console.log('3. Test connection manually: psql -U postgres -h localhost');
        process.exit(1);
    });

// API Endpoints

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        status: 'API working',
        timestamp: new Date(),
        database: pool.options.database
    });
});

// Pets endpoint
app.get('/api/pets', async(req, res) => {
    try {
        const { rows } = await pool.query(`
      SELECT 
        pet_id as id,
        name,
        age,
        breed,
        image,
        description,
        status
      FROM pets
    `);
        res.json(rows);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({
            error: 'Failed to fetch pets',
            details: err.message
        });
    }
});

// Shelters endpoint (NEW)
app.get('/api/shelters', async(req, res) => {
    try {
        const { rows } = await pool.query(`
      SELECT 
        shelter_id as id,
        name,
        email,
        phone,
        address
      FROM shelters
    `);
        res.json(rows);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({
            error: 'Failed to fetch shelters',
            details: err.message
        });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔗 Available Endpoints:`);
    console.log(`- http://localhost:${PORT}/api/test`);
    console.log(`- http://localhost:${PORT}/api/pets`);
    console.log(`- http://localhost:${PORT}/api/shelters\n`);
});