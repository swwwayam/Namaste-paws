require('dotenv').config();
console.log('Current working directory:', process.cwd());

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
        'http://localhost:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Database configuration
console.log('Current working directory:', process.cwd());

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

// Contact form submission endpoint
app.use(express.json()); // to parse JSON body

app.post('/api/contact', async(req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required' });
    }
    try {
        const result = await pool.query(
            'INSERT INTO messages (name, email, message) VALUES ($1, $2, $3) RETURNING id', [name, email, message]
        );
        res.status(201).json({ message: 'Contact message received', id: result.rows[0].id });
    } catch (err) {
        console.error('Error saving contact message:', err);
        res.status(500).json({ error: 'Failed to save contact message', details: err.message });
    }
});

// Pets endpoint
app.get('/api/pets', async(req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT pet_id as id, name, age, breed, image, description, status FROM pets'
        );
        res.json(rows);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({
            error: 'Failed to fetch pets',
            details: err.message
        });
    }
});

// Shelters endpoint with corrected column name
app.get('/api/shelters', async(req, res) => {
    try {
        console.log('Returning static shelters data...');
        const staticShelters = [{
                id: 1,
                name: "Animal Aid Unlimited, Udaipur",
                email: "contact@animalaidudaipur.org",
                phone: "+91 12345 67890",
                address: "Udaipur, Rajasthan, India"
            },
            {
                id: 2,
                name: "Blue Cross of India, Chennai",
                email: "info@bluecrossindia.org",
                phone: "+91 23456 78901",
                address: "Chennai, Tamil Nadu, India"
            },
            {
                id: 3,
                name: "Charlie's Animal Rescue Centre (CARE), Bangalore",
                email: "carebangalore@example.com",
                phone: "+91 34567 89012",
                address: "Bangalore, Karnataka, India"
            },
            {
                id: 4,
                name: "SPCA Mumbai",
                email: "contact@spcamumbai.org",
                phone: "+91 45678 90123",
                address: "Mumbai, Maharashtra, India"
            }
        ];
        res.json(staticShelters);
    } catch (err) {
        console.error('Error returning static shelters:', err);
        res.status(500).json({
            error: 'Failed to fetch shelters',
            details: err.message
        });
    }
});

// Adoption endpoint
app.put('/api/pets/:id/adopt', async(req, res) => {
    const petId = req.params.id;
    try {
        const result = await pool.query(
            'UPDATE pets SET status = $1 WHERE pet_id = $2 RETURNING pet_id, name, status', ['Adopted', petId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Pet not found' });
        }
        res.json({ message: 'Pet adopted successfully', pet: result.rows[0] });
    } catch (err) {
        console.error('Error adopting pet:', err);
        res.status(500).json({ error: 'Failed to adopt pet', details: err.message });
    }
});

// Revert adoption endpoint - set status to Available
app.put('/api/pets/:id/available', async(req, res) => {
    const petId = req.params.id;
    try {
        const result = await pool.query(
            'UPDATE pets SET status = $1 WHERE pet_id = $2 RETURNING pet_id, name, status', ['Available', petId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Pet not found' });
        }
        res.json({ message: 'Pet status reverted to Available', pet: result.rows[0] });
    } catch (err) {
        console.error('Error reverting pet status:', err);
        res.status(500).json({ error: 'Failed to revert pet status', details: err.message });
    }
});

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { createUserTable } = require('./models/userModel');
const { createAdoptionRequestsTable } = require('./models/adoptionRequestModel');

const PORT = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: true }));

// Register auth routes
app.use('/api/auth', authRoutes);
// Register admin routes
app.use('/api/admin', adminRoutes);

async function startServer() {
    await createUserTable();
    await createAdoptionRequestsTable();

    app.listen(PORT, () => {
        console.log(`\n🚀 Server running on http://localhost:${PORT}`);
        console.log(`🔗 Available Endpoints:`);
        console.log(`- http://localhost:${PORT}/api/test`);
        console.log(`- http://localhost:${PORT}/api/pets`);
        console.log(`- http://localhost:${PORT}/api/shelters`);
        console.log(`- http://localhost:${PORT}/api/pets/:id/adopt`);
        console.log(`- http://localhost:${PORT}/api/auth/signup`);
        console.log(`- http://localhost:${PORT}/api/auth/login`);
        console.log(`- http://localhost:${PORT}/api/admin/adoption-requests\n`);
    });
}

startServer();