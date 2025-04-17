const jwt = require('jsonwebtoken');
const secretKey = 'nexatest';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token tidak ditemukan' });

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token tidak valid' });

    req.user = decoded; // simpan hasil decode token
    next();
  });
}

module.exports = authenticateToken;
