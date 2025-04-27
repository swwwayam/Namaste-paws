const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { findUserByEmail } = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'adminsecretkey';

const adminLogin = async(req, res) => {
    const { username, password } = req.body;
    try {
        const user = await findUserByEmail(username);
        if (!user || user.role !== 'admin') {
            return res.status(401).json({ error: 'Invalid admin credentials' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid admin credentials' });
        }
        const token = jwt.sign({ username: user.email, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const verifyAdminToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header missing' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token missing' });
    }
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Admins only' });
        }
        req.admin = decoded;
        next();
    });
};

module.exports = {
    adminLogin,
    verifyAdminToken,
};