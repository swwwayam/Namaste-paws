const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'namaste_paws',
    port: process.env.DB_PORT || 5432,
});

async function createAdminUser() {
    const email = 'admin@gmail.com';
    const password = 'admin@123';
    const firstName = 'Admin';
    const lastName = 'User';
    const role = 'admin';

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if admin user already exists
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            console.log('Admin user already exists.');
            process.exit(0);
        }

        // Insert admin user
        const insertQuery = `
            INSERT INTO users (first_name, last_name, email, password, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, email, role
        `;
        const values = [firstName, lastName, email, hashedPassword, role];
        const result = await pool.query(insertQuery, values);

        console.log('Admin user created successfully:', result.rows[0]);
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

createAdminUser();