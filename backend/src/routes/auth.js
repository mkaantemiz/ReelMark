const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Kayıt ol
router.post('/register', async (req, res) => {
    try {
        const email = (req.body.email || '').trim().toLowerCase();
        const username = (req.body.username || '').trim();
        const password = req.body.password || '';

        if (!email || !username || !password)
            return res.status(400).json({ error: 'Email, kullanıcı adı ve şifre zorunlu' });
        if (!EMAIL_REGEX.test(email))
            return res.status(400).json({ error: 'Geçerli bir email adresi gir' });
        if (username.length < 3 || username.length > 32)
            return res.status(400).json({ error: 'Kullanıcı adı 3-32 karakter arasında olmalı' });
        if (!/^[a-zA-Z0-9_.-]+$/.test(username))
            return res.status(400).json({ error: 'Kullanıcı adı sadece harf, rakam ve . _ - içerebilir' });
        if (password.length < 6)
            return res.status(400).json({ error: 'Şifre en az 6 karakter olmalı' });

        const emailExists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (emailExists) return res.status(409).json({ error: 'Bu email zaten kayıtlı' });

        const userExists = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
        if (userExists) return res.status(409).json({ error: 'Bu kullanıcı adı alınmış' });

        const hashed = await bcrypt.hash(password, 12); // 10 → 12 (daha güçlü hash)
        const result = db.prepare('INSERT INTO users (email, username, password) VALUES (?, ?, ?)').run(email, username, hashed);

        const token = jwt.sign({ id: result.lastInsertRowid, username }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, username });
    } catch (err) {
        console.error('Kayıt hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' }); // Detay sızdırma
    }
});

// Giriş yap (email veya kullanıcı adı ile)
router.post('/login', async (req, res) => {
    const loginField = (req.body.login || '').trim();
    const password = req.body.password || '';

    if (!loginField || !password)
        return res.status(400).json({ error: 'Kullanıcı adı/email ve şifre gerekli' });

    const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(loginField, loginField.toLowerCase());
    if (!user) return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' }); // Hangi alanın yanlış olduğunu sızdırma

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username: user.username });
});

module.exports = router;

