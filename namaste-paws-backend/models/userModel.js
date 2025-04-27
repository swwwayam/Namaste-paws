const { Pool } = require('pg');
const pool = require('../config/db');

const createUserTableQuery = `
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function createUserTable() {
    try {
        await pool.query(createUserTableQuery);
        console.log('Users table created or already exists');
    } catch (error) {
        console.error('Error creating users table:', error);
    }
}

async function createUser(firstname, lastname, email, hashedPassword, role = 'user') {
    const query = 'INSERT INTO users (first_name, last_name, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const values = [firstname, lastname, email, hashedPassword, role];
    const result = await pool.query(query, values);
    return result.rows[0];
}

async function findUserByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
}

module.exports = {
    createUserTable,
    createUser,
    findUserByEmail,
};