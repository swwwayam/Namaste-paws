const pool = require('../config/db');

const createAdoptionRequestsTableQuery = `
CREATE TABLE IF NOT EXISTS adoption_requests (
    id SERIAL PRIMARY KEY,
    pet_id INTEGER NOT NULL REFERENCES pets(pet_id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    decision_date TIMESTAMP
);
`;

async function createAdoptionRequestsTable() {
    try {
        await pool.query(createAdoptionRequestsTableQuery);
        console.log('Adoption requests table created or already exists');
    } catch (error) {
        console.error('Error creating adoption_requests table:', error);
    }
}

async function createAdoptionRequest(petId, userId) {
    const query = `
        INSERT INTO adoption_requests (pet_id, user_id, status)
        VALUES ($1, $2, 'pending')
        RETURNING *;
    `;
    const values = [petId, userId];
    const result = await pool.query(query, values);
    return result.rows[0];
}

async function listAdoptionRequests() {
    const query = `
        SELECT ar.id, ar.pet_id, ar.user_id, ar.status, ar.request_date, ar.decision_date,
               p.name AS pet_name, u.first_name, u.last_name, u.email
        FROM adoption_requests ar
        JOIN pets p ON ar.pet_id = p.pet_id
        JOIN users u ON ar.user_id = u.id
        ORDER BY ar.request_date DESC;
    `;
    const result = await pool.query(query);
    return result.rows;
}

async function updateAdoptionRequestStatus(id, status) {
    const query = `
        UPDATE adoption_requests
        SET status = $1, decision_date = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *;
    `;
    const values = [status, id];
    const result = await pool.query(query, values);
    return result.rows[0];
}

module.exports = {
    createAdoptionRequestsTable,
    createAdoptionRequest,
    listAdoptionRequests,
    updateAdoptionRequestStatus,
};