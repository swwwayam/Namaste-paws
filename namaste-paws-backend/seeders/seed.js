const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const petData = [{
        name: "Buddy",
        age: 3,
        breed: "Golden Retriever",
        image: "https://example.com/images/buddy.jpg",
        description: "Friendly and energetic dog",
        status: "Available"
    },
    {
        name: "Mittens",
        age: 2,
        breed: "Tabby Cat",
        image: "https://example.com/images/mittens.jpg",
        description: "Calm and affectionate cat",
        status: "Adopted"
    }
];

const shelterData = [{
        name: "Happy Tails Shelter",
        email: "contact@happytails.org",
        phone: "123-456-7890",
        address: "1234 Paw Street, Petville"
    },
    {
        name: "Safe Haven Shelter",
        email: "info@safehaven.org",
        phone: "987-654-3210",
        address: "5678 Fur Avenue, Animaltown"
    }
];

async function seedDatabase() {
    try {
        // Insert pets
        for (const pet of petData) {
            await pool.query(
                'INSERT INTO pets (name, age, breed, image, description, status) VALUES ($1, $2, $3, $4, $5, $6)', [pet.name, pet.age, pet.breed, pet.image, pet.description, pet.status]
            );
        }

        // Insert shelters
        for (const shelter of shelterData) {
            await pool.query(
                'INSERT INTO shelters (name, email, phone, address) VALUES ($1, $2, $3, $4)', [shelter.name, shelter.email, shelter.phone, shelter.address]
            );
        }

        console.log('Database seeded successfully!');
    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        await pool.end();
    }
}

seedDatabase();