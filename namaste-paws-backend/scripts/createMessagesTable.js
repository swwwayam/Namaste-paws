const pool = require('../config/db');

const createMessagesTableQuery = "CREATE TABLE IF NOT EXISTS messages (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, message TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);";

async function createMessagesTable() {
    try {
        await pool.query(createMessagesTableQuery);
        console.log('Messages table created or already exists');
    } catch (error) {
        console.error('Error creating messages table:', error);
    } finally {
        pool.end();
    }
}

createMessagesTable();