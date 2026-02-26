const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const router = express.Router();

// Kayıt ol
router.post('/register', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        if (!email || !username || !password)
            return res.status(400).json({ error: 'Email, kullanıcı adı ve şifre zorunlu' });
        if (password.length < 6)
            return res.status(400).json({ error: 'Şifre en az 6 karakter olmalı' });

        const emailExists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (emailExists) return res.status(409).json({ error: 'Bu email zaten kayıtlı' });

        const userExists = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
        if (userExists) return res.status(409).json({ error: 'Bu kullanıcı adı alınmış' });

        const hashed = await bcrypt.hash(password, 10);
        const result = db.prepare('INSERT INTO users (email, username, password) VALUES (?, ?, ?)').run(email, username, hashed);

        if (result.lastInsertRowid === 1) {
            db.exec('UPDATE media_items SET user_id = 1 WHERE user_id IS NULL');
        }

        const token = jwt.sign({ id: result.lastInsertRowid, username }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, username });
    } catch (err) {
        console.error('Kayıt hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası: ' + err.message });
    }
});

// Giriş yap (email veya kullanıcı adı ile)
router.post('/login', async (req, res) => {
    const { login, password } = req.body;
    if (!login || !password)
        return res.status(400).json({ error: 'Kullanıcı adı/email ve şifre gerekli' });

    const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(login, login);
    if (!user) return res.status(401).json({ error: 'Kullanıcı bulunamadı' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Şifre yanlış' });

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username: user.username });
});

module.exports = router;
