const express = require('express');
const app = express();
const authRoutes = require('./src/routes/authRoutes');
const karyawanRoutes = require('./src/routes/karyawanRoutes');

app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/karyawan', karyawanRoutes);

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});


app.listen(3000, () => {
  console.log('Server berjalan di port 3000');
});
