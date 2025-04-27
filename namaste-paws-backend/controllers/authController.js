const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail } = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

async function signup(req, res) {
    const { firstname, lastname, email, password } = req.body;
    if (!firstname || !lastname || !email || !password) {
        return res.status(400).json({ message: 'First name, last name, email and password are required' });
    }
    try {
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await createUser(firstname, lastname, email, hashedPassword);
        return res.status(201).json({ message: 'User created successfully', user: { id: newUser.id, email: newUser.email } });
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        return res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    signup,
    login,
};