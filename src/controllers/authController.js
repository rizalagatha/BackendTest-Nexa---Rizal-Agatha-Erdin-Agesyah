const db = require('../config/db');
const jwt = require('jsonwebtoken');
const secretKey = 'nexatest';

exports.login = (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM admin WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error login' });
    if (results.length === 0) return res.status(401).json({ message: 'Username atau password salah' });

    const user = results[0];
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + (60 * 60);

    const token = jwt.sign({ data: user.username, iat, exp }, secretKey);

    const insertTokenQuery = 'INSERT INTO admin_token (id_admin, token, expired_at) VALUES (?, ?, ?)';
    db.query(insertTokenQuery, [user.id, token, new Date(exp * 1000)], (err2) => {
      if (err2) return res.status(500).json({ message: 'Gagal menyimpan token' });

      res.json({
        message: 'Login berhasil',
        token: token,
        expired_at: new Date(exp * 1000)
      });
    });
  });
};
